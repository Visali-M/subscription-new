const Razorpay  = require("razorpay");
const crypto    = require("crypto");
const Payment      = require("../models/Payment");
const Subscription = require("../models/Subscription");

// POST /api/payment/order
const createOrder = async (req, res) => {
  try {
    const { amount, subscriptionId } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ message: "Invalid amount." });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      return res.status(500).json({ message: "Payment gateway not configured." });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receipt = `rcpt_${Date.now()}`;
    const order = await instance.orders.create({
      amount: Math.round(Number(amount)),
      currency: "INR",
      receipt,
    });

    // Create a pending payment record
    if (subscriptionId) {
      const sub = await Subscription.findById(subscriptionId);
      await Payment.create({
        user: req.user._id,
        subscription: subscriptionId,
        subscriptionName: sub?.name || "Unknown",
        razorpayOrderId: order.id,
        amount: Math.round(Number(amount)),
        status: "pending",
      });
    }

    res.json({
      id:       order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,   // ← send key to frontend safely
    });
  } catch (err) {
    res.status(500).json({ message: err.error?.description || err.message || "Payment order creation failed" });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Missing verification fields." });

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Invalid payment signature." });

    // Update payment record to success
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, status: "success", paidAt: new Date() }
    );

    // Update subscription's lastPaidAt and push renewal date forward
    if (subscriptionId) {
      const sub = await Subscription.findById(subscriptionId);
      if (sub) {
        sub.lastPaidAt = new Date();
        if (sub.renewalDate) {
          const next = new Date(sub.renewalDate);
          if (sub.billingCycle === "Monthly") next.setMonth(next.getMonth() + 1);
          else if (sub.billingCycle === "Annual") next.setFullYear(next.getFullYear() + 1);
          else if (sub.billingCycle === "Weekly") next.setDate(next.getDate() + 7);
          sub.renewalDate = next;
        }
        await sub.save();
      }
    }

    res.json({ verified: true, payment_id: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: "Payment verification failed." });
  }
};

// GET /api/payment/history
const getHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createOrder, verifyPayment, getHistory };
