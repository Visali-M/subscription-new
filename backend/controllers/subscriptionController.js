const Subscription = require("../models/Subscription");

const getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id }).sort({ renewalDate: 1 });
    res.json(subs);
  } catch (err) {
    console.error("getSubscriptions error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const createSubscription = async (req, res) => {
  const {
    name, category, planDescription, billingCycle, amount, currency,
    renewalDate, notes, tags, autopay, isTrial, trialEndsOn, websiteUrl,
  } = req.body;

  if (!name || amount === undefined || amount === null || amount === "")
    return res.status(400).json({ message: "Name and amount are required" });

  // Validate category against allowed values
  const validCats = ["Entertainment","Music","Education","Software","Productivity","Gaming","Health","News","Other"];
  const safeCat   = validCats.includes(category) ? category : "Other";

  // Validate billingCycle
  const validCycles = ["Monthly","Annual","Weekly","Quarterly","Biannual"];
  const safeCycle   = validCycles.includes(billingCycle) ? billingCycle : "Monthly";

  try {
    const sub = await Subscription.create({
      user:            req.user._id,
      name:            String(name).trim(),
      category:        safeCat,
      planDescription: planDescription || "",
      billingCycle:    safeCycle,
      amount:          Number(amount),
      currency:        currency || "INR",
      renewalDate:     renewalDate || undefined,
      notes:           notes || "",
      tags:            Array.isArray(tags) ? tags : [],
      autopay:         autopay !== undefined ? Boolean(autopay) : true,
      isTrial:         Boolean(isTrial),
      trialEndsOn:     isTrial && trialEndsOn ? trialEndsOn : undefined,
      websiteUrl:      websiteUrl || "",
    });
    res.status(201).json(sub);
  } catch (err) {
    console.error("createSubscription error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    const fields = [
      "name","category","planDescription","billingCycle","amount","currency",
      "renewalDate","status","notes","tags","autopay","isTrial","trialEndsOn",
      "pausedUntil","lastPaidAt","websiteUrl",
    ];
    fields.forEach(f => { if (req.body[f] !== undefined) sub[f] = req.body[f]; });

    if (req.body.pausedUntil) sub.status = "paused";
    if (sub.status === "paused" && sub.pausedUntil && new Date() >= new Date(sub.pausedUntil)) {
      sub.status = "active";
      sub.pausedUntil = undefined;
    }

    const updated = await sub.save();
    res.json(updated);
  } catch (err) {
    console.error("updateSubscription error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    res.json({ message: "Subscription deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports = { getSubscriptions, getSubscriptionById, createSubscription, updateSubscription, deleteSubscription };
