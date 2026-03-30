const cron         = require("node-cron");
const Subscription = require("../models/Subscription");
const { sendRenewalReminder, sendTrialEndingAlert } = require("./emailService");

const startRenewalReminder = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron] Running daily subscription checks...");
    const now = new Date();

    try {
      // ── 1. Renewal reminders (3 days away) ──────────────────────────
      const threeDaysLater = new Date(now);
      threeDaysLater.setDate(now.getDate() + 3);

      const upcoming = await Subscription.find({
        renewalDate: { $gte: now, $lte: threeDaysLater },
        status: "active",
      }).populate("user", "name email notifications");

      for (const sub of upcoming) {
        const daysLeft = Math.ceil((new Date(sub.renewalDate) - now) / 86400000);
        console.log(`[Cron] Renewal reminder → ${sub.user?.email} | ${sub.name} in ${daysLeft}d`);
        if (sub.user?.notifications?.renewalAlert && sub.user?.email) {
          try {
            await sendRenewalReminder({
              to: sub.user.email, name: sub.user.name,
              subName: sub.name, amount: sub.amount,
              renewalDate: sub.renewalDate,
              daysLeft, autopay: sub.autopay,
            });
          } catch (e) { console.error("[Cron] Email error:", e.message); }
        }
      }

      // ── 2. Trial ending alerts (2 days away) ────────────────────────
      const twoDaysLater = new Date(now);
      twoDaysLater.setDate(now.getDate() + 2);

      const trialsSoon = await Subscription.find({
        isTrial: true,
        trialEndsOn: { $gte: now, $lte: twoDaysLater },
        status: "active",
      }).populate("user", "name email notifications");

      for (const sub of trialsSoon) {
        const daysLeft = Math.ceil((new Date(sub.trialEndsOn) - now) / 86400000);
        console.log(`[Cron] Trial ending → ${sub.user?.email} | ${sub.name} in ${daysLeft}d`);
        if (sub.user?.email) {
          try {
            await sendTrialEndingAlert({
              to: sub.user.email, name: sub.user.name,
              subName: sub.name, trialEndsOn: sub.trialEndsOn, daysLeft,
            });
          } catch (e) { console.error("[Cron] Trial email error:", e.message); }
        }
      }

      // ── 3. Auto-resume paused subscriptions ─────────────────────────
      const toResume = await Subscription.find({
        status: "paused",
        pausedUntil: { $lte: now },
      });

      for (const sub of toResume) {
        sub.status = "active";
        sub.pausedUntil = undefined;
        await sub.save();
        console.log(`[Cron] Resumed subscription: ${sub.name}`);
      }

      console.log(`[Cron] Done: ${upcoming.length} renewal(s), ${trialsSoon.length} trial(s), ${toResume.length} resumed.`);
    } catch (err) {
      console.error("[Cron] Error:", err);
    }
  });
};

module.exports = { startRenewalReminder };
