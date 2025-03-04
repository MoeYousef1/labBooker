const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    sections: [
      {
        key: {
          type: String,
          required: true,
          enum: [
            "general",
            "support",
            "booking",
            "account",
            "privacy",
            "feedback",
          ],
        },
        questions: [
          {
            question: { type: String, default: "" },
            answer: { type: String, default: "" },
          },
        ],
      },
    ],
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FAQ", faqSchema);
