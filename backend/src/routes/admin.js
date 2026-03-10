const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireSuperuser } = require("../middleware/adminAccess");
const {
  listUsers,
  createUser,
  listAllBusinesses,
  createBusinessForUser,
  assignBusiness,
} = require("../controllers/adminController");

// All admin routes require authentication + superuser role
router.use(authenticate, requireSuperuser);

// Users
router.get("/users", listUsers);
router.post("/users", createUser);

// Businesses
router.get("/businesses", listAllBusinesses);
router.post("/businesses", createBusinessForUser);
router.put("/businesses/:id/assign", assignBusiness);

module.exports = router;
