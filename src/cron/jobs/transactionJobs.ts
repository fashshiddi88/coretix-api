import cron from "node-cron";
import { updateTransactionStatuses } from "../updateTransactionStatus";

export function startTransactionStatusJob() {
  // Setiap 10 menit sekali (bisa kamu ganti ke waktu lain)
  cron.schedule("*/10 * * * *", async () => {
    console.log("[CRON] Checking transaction status...");
    try {
      await updateTransactionStatuses();
      console.log("[CRON] Transaction status updated successfully.");
    } catch (err) {
      console.error("[CRON] Failed to update transaction status:", err);
    }
  });
}
