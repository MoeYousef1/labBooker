const FAQ = require("../models/FAQ");

exports.getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findOne().sort({ createdAt: -1 });

    if (!faq) {
      return res.status(200).json({
        sections: {
          general: [],
          support: [],
          booking: [],
          account: [],
          privacy: [],
          feedback: [],
        },
      });
    }

    const transformed = {};
    faq.sections.forEach((section) => {
      transformed[section.key] = section.questions.map((q, idx) => ({
        id: `${section.key}-${idx}`,
        question: q.question,
        answer: q.answer,
      }));
    });

    res.json({
      sections: transformed,
      lastUpdated: faq.updatedAt,
      lastUpdatedBy: faq.lastUpdatedBy,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { sections } = req.body;
    const userId = req.user._id;

    const updatedSections = Object.keys(sections).map((key) => ({
      key,
      questions: sections[key].map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
    }));

    const faq = await FAQ.findOneAndUpdate(
      {},
      { sections: updatedSections, lastUpdatedBy: userId },
      { new: true, upsert: true },
    ).populate("lastUpdatedBy", "name email role");

    res.json({
      message: "FAQ updated successfully",
      faq: {
        sections: faq.sections,
        lastUpdated: faq.updatedAt,
        lastUpdatedBy: faq.lastUpdatedBy,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
