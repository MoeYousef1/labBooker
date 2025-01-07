const Config = require("../models/Config");

async function createConfig(req, res, next) {
  try {
    const configData = req.body;

    const config = new Config(configData);
    await config.save();

    res.status(201).json({ message: "Configuration document created", config });
  } catch (error) {
    console.error("Error creating configuration document:", error);
    next(error);
  }
}

async function updateConfig(req, res, next) {
  try {
    const configData = req.body;

    const config = await Config.findOneAndUpdate({}, configData, {
      new: true,
      upsert: true,
    });
    res
      .status(200)
      .json({ message: "Configuration updated successfully", config });
  } catch (error) {
    console.error("Error updating configuration document:", error);
    next(error);
  }
}

module.exports = {
  createConfig,
  updateConfig,
};
