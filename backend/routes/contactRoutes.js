const express = require("express");
const router = express.Router();
const {
  submitContactForm,
  validateContactForm,
} = require("../controllers/contactController");

router.post("/submit", validateContactForm, (req, res, next) => {
  submitContactForm(req, res).catch(next);
});
module.exports = router;
