// controllers/issueController.js
const Issue = require("../models/Issue");

const issueController = {
  createIssue: async (req, res) => {
    try {
      const { issueType, description, email, bookingReference } = req.body;

      const newIssue = new Issue({
        issueType,
        description,
        email,
        bookingReference,
        status: "pending", // Set default status
      });

      await newIssue.save();

      res.json({
        msg: "Issue created successfully",
        issue: newIssue,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getAllIssues: async (req, res) => {
    try {
      const issues = await Issue.find().sort({ createdAt: -1 }); // Sort by newest first
      res.json(issues);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getIssueById: async (req, res) => {
    try {
      const issue = await Issue.findById(req.params.id);
      if (!issue) return res.status(404).json({ msg: "Issue not found" });

      res.json(issue);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateIssue: async (req, res) => {
    try {
      const { issueType, description, email, bookingReference, status } = req.body;

      const updatedIssue = await Issue.findByIdAndUpdate(
        req.params.id,
        {
          issueType,
          description,
          email,
          bookingReference,
          status,
        },
        { new: true } // Return the updated document
      );

      if (!updatedIssue) {
        return res.status(404).json({ msg: "Issue not found" });
      }

      res.json({
        msg: "Issue updated successfully",
        issue: updatedIssue
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // New method specifically for updating status
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;

      // Validate status
      const validStatuses = ["pending", "in-progress", "resolved"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: "Invalid status value" });
      }

      const updatedIssue = await Issue.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!updatedIssue) {
        return res.status(404).json({ msg: "Issue not found" });
      }

      res.json({
        msg: "Status updated successfully",
        issue: updatedIssue
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteIssue: async (req, res) => {
    try {
      const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
      
      if (!deletedIssue) {
        return res.status(404).json({ msg: "Issue not found" });
      }

      res.json({ msg: "Issue deleted successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = issueController;