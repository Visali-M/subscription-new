export function exportToCSV(subs) {
  const headers = ["Name","Category","Plan","Billing Cycle","Amount (INR)","Renewal Date","Status","Autopay","Trial","Tags","Notes"];
  const rows = subs.map(s => [
    s.name,
    s.category || "",
    s.planDescription || "",
    s.billingCycle || "Monthly",
    s.amount,
    s.renewalDate ? new Date(s.renewalDate).toLocaleDateString("en-IN") : "",
    s.status || "active",
    s.autopay ? "Yes" : "No",
    s.isTrial ? "Yes" : "No",
    (s.tags || []).join("; "),
    s.notes || "",
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;
  link.download = `subscriptions_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
