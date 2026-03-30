const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRenewalReminder = async ({ to, name, subName, amount, renewalDate, daysLeft, autopay }) => {
  const dateStr = new Date(renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const subject = `Reminder: ${subName} renews in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#f8f8fc;border-radius:12px;overflow:hidden;">
      <div style="background:#6366f1;padding:24px 28px;">
        <h2 style="color:#fff;margin:0;font-size:20px;">SubTracker Reminder</h2>
      </div>
      <div style="padding:28px;">
        <p style="font-size:16px;color:#0f0e17;">Hi <strong>${name}</strong>,</p>
        <p style="color:#52525b;">Your <strong>${subName}</strong> subscription is renewing in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>.</p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;font-size:13px;">Renewal Date</span>
            <span style="font-weight:600;font-size:13px;">${dateStr}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;font-size:13px;">Amount</span>
            <span style="font-weight:600;font-size:13px;">₹${amount.toLocaleString("en-IN")}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#6b7280;font-size:13px;">Auto-pay</span>
            <span style="font-weight:600;font-size:13px;color:${autopay ? "#16a34a" : "#dc2626"}">${autopay ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
        ${autopay
          ? `<p style="color:#52525b;font-size:13px;">Payment will be processed automatically on the renewal date.</p>`
          : `<p style="color:#dc2626;font-size:13px;font-weight:600;">Auto-pay is off. Please pay manually before the due date.</p>`}
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">— SubTracker Team</p>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `"SubTracker" <${process.env.EMAIL_USER}>`, to, subject, html });
};

const sendPaymentReceipt = async ({ to, name, subName, amount, paymentId }) => {
  const subject = `Payment confirmed: ${subName}`;
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;">
      <div style="background:#22c55e;padding:24px 28px;border-radius:12px 12px 0 0;">
        <h2 style="color:#fff;margin:0;">Payment Successful</h2>
      </div>
      <div style="padding:28px;background:#f8f8fc;border-radius:0 0 12px 12px;">
        <p>Hi <strong>${name}</strong>, your payment for <strong>${subName}</strong> of ₹${amount.toLocaleString("en-IN")} was successful.</p>
        <p style="color:#9ca3af;font-size:12px;">Payment ID: ${paymentId}</p>
        <p style="color:#9ca3af;font-size:12px;">— SubTracker Team</p>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `"SubTracker" <${process.env.EMAIL_USER}>`, to, subject, html });
};

const sendTrialEndingAlert = async ({ to, name, subName, trialEndsOn, daysLeft }) => {
  const dateStr = new Date(trialEndsOn).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const subject = `Your ${subName} free trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;">
      <div style="background:#f59e0b;padding:24px 28px;border-radius:12px 12px 0 0;">
        <h2 style="color:#fff;margin:0;">Trial Ending Soon</h2>
      </div>
      <div style="padding:28px;background:#f8f8fc;border-radius:0 0 12px 12px;">
        <p>Hi <strong>${name}</strong>, your free trial for <strong>${subName}</strong> ends on <strong>${dateStr}</strong> (${daysLeft} day${daysLeft !== 1 ? "s" : ""} left).</p>
        <p style="color:#52525b;font-size:13px;">Log in to SubTracker to cancel before being charged.</p>
        <p style="color:#9ca3af;font-size:12px;">— SubTracker Team</p>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `"SubTracker" <${process.env.EMAIL_USER}>`, to, subject, html });
};

module.exports = { sendRenewalReminder, sendPaymentReceipt, sendTrialEndingAlert };
