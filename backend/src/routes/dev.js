const express = require("express");
const router = express.Router();
const { checkOverduePayments, recalculateCustomerMetrics } = require("../services/scheduledJobs");

// POST /api/dev/jobs/overdue
router.post("/jobs/overdue", async (req, res) => {
  try {
    await checkOverduePayments();
    res.json({ ok: true, message: "checkOverduePayments completed" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/dev/jobs/metrics
router.post("/jobs/metrics", async (req, res) => {
  try {
    await recalculateCustomerMetrics();
    res.json({ ok: true, message: "recalculateCustomerMetrics completed" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
