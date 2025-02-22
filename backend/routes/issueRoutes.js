// routes/issueRoutes.js
const router = require("express").Router();
const issueController = require("../controllers/issueController");

router.post("/create", issueController.createIssue);
router.get("/all", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
router.put("/update/:id", issueController.updateIssue);
router.patch("/update-status/:id", issueController.updateStatus);
router.delete("/delete/:id", issueController.deleteIssue);

module.exports = router;
