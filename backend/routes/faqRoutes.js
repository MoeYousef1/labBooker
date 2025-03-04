const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getFAQ, updateFAQ } = require("../controllers/faqController");

router.get("/", getFAQ);
router.put(
  "/",
  authMiddleware.requireAuth,
  authMiddleware.requireRole(["admin", "manager"]),
  updateFAQ,
);

module.exports = router;
