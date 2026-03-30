const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:            { type: String, required: true, trim: true },
    category:        { type: String, enum: ["Entertainment","Music","Education","Software","Productivity","Gaming","Health","News","Other"], default: "Other" },
    planDescription: { type: String, trim: true, default: "" },
    billingCycle:    { type: String, enum: ["Monthly","Annual","Weekly","Quarterly","Biannual"], default: "Monthly" },
    amount:          { type: Number, required: true },
    currency:        { type: String, default: "INR" },
    renewalDate:     { type: Date },
    status:          { type: String, enum: ["active","cancelled","paused"], default: "active" },
    notes:           { type: String, default: "" },
    tags:            [{ type: String, trim: true }],
    autopay:         { type: Boolean, default: true },
    isTrial:         { type: Boolean, default: false },
    trialEndsOn:     { type: Date },
    pausedUntil:     { type: Date },
    lastPaidAt:      { type: Date },
    websiteUrl:      { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
