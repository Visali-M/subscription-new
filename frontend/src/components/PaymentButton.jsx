import React, { useState } from "react";
import API from "../services/api";

export default function PaymentButton({ subscription }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!subscription?.amount) return;

    // Don't allow paying cancelled subs
    if (subscription.status === "cancelled") return;

    setLoading(true);
    try {
      const amountInPaise = Math.round(Number(subscription.amount) * 100);

      // Create order — backend returns id, amount, currency AND key
      const { data: order } = await API.post("/payment/order", {
        amount: amountInPaise,
        subscriptionId: subscription._id,
      });

      // order.key is sent from the backend so we never need it in .env on frontend
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "SubTracker",
        description: `Pay for ${subscription.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await API.post("/payment/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              subscriptionId: subscription._id,
            });
            alert("✅ Payment successful! Renewal date updated.");
            window.location.reload();
          } catch {
            alert("❌ Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name:  JSON.parse(localStorage.getItem("user") || "{}").name  || "",
          email: JSON.parse(localStorage.getItem("user") || "{}").email || "",
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      if (!window.Razorpay) {
        alert("Razorpay script not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        alert("❌ Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      const msg = err.response?.data?.message || "Payment failed. Please try again.";
      alert(`❌ ${msg}`);
      setLoading(false);
    }
  };

  if (subscription?.status === "cancelled") return null;

  return (
    <button
      className="btn-pay"
      onClick={handlePay}
      disabled={loading}
    >
      {loading ? "..." : "Pay"}
    </button>
  );
}
