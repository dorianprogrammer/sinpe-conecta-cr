const cron = require("node-cron");
const { callProcedure, query } = require("../utils/db");

// ─── Helpers ────────────────────────────────────────────────────────────────

const createOverdueNotification = async (customerId, businessId) => {
  await callProcedure("create_notification", [
    businessId,
    null, // no payment_id
    "overdue_payment",
    `Cliente con ID ${customerId} no ha pagado su cuota mensual y está vencido.`,
  ]);
};

// ─── Jobs ────────────────────────────────────────────────────────────────────

// Daily at midnight — detect overdue membership customers
const checkOverduePayments = async () => {
  console.log("[scheduledJobs] Running overdue payment check...");

  try {
    const { rows: overdueCustomers } = await callProcedure("get_overdue_membership_customers", []);

    if (overdueCustomers.length === 0) {
      console.log("[scheduledJobs] No overdue customers found.");
      return;
    }

    console.log(`[scheduledJobs] Found ${overdueCustomers.length} overdue customer(s).`);

    for (const customer of overdueCustomers) {
      try {
        await callProcedure("mark_customer_overdue", [customer.customer_id]);
        await createOverdueNotification(customer.customer_id, customer.business_id);

        console.log(`[scheduledJobs] Marked overdue: customer ${customer.customer_id} (${customer.phone})`);
      } catch (err) {
        console.error(`[scheduledJobs] Failed to process customer ${customer.customer_id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("[scheduledJobs] checkOverduePayments error:", err.message);
  }
};

// Daily at 1 AM — recalculate frequent_buyer and good_standing flags
const recalculateCustomerMetrics = async () => {
  console.log("[scheduledJobs] Running customer metrics recalculation...");

  try {
    const { rows: buyerResult } = await callProcedure("recalculate_frequent_buyer_flags", []);
    console.log(
      `[scheduledJobs] frequent_buyer_flag updated for ${buyerResult[0]?.recalculate_frequent_buyer_flags ?? 0} customers.`,
    );
  } catch (err) {
    console.error("[scheduledJobs] recalculate_frequent_buyer_flags error:", err.message);
  }

  try {
    const { rows: standingResult } = await callProcedure("recalculate_good_standing_flags", []);
    console.log(
      `[scheduledJobs] good_standing_flag updated for ${standingResult[0]?.recalculate_good_standing_flags ?? 0} customers.`,
    );
  } catch (err) {
    console.error("[scheduledJobs] recalculate_good_standing_flags error:", err.message);
  }
};

// ─── Register ────────────────────────────────────────────────────────────────

const initScheduledJobs = () => {
  // Midnight
  cron.schedule("0 0 * * *", checkOverduePayments, {
    timezone: "America/Costa_Rica",
  });

  // 1 AM
  cron.schedule("0 1 * * *", recalculateCustomerMetrics, {
    timezone: "America/Costa_Rica",
  });

  console.log("[scheduledJobs] Jobs registered (America/Costa_Rica timezone).");
};

module.exports = {
  initScheduledJobs,
  // Exported for manual testing via Postman/scripts
  checkOverduePayments,
  recalculateCustomerMetrics,
};
