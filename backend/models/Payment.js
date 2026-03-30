const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscription:      { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    subscriptionName:  { type: String },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    amount:            { type: Number, required: true },
    currency:          { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
