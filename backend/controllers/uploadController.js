const uploadMulter = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

async function upload(req, res) {
  return new Promise((resolve, reject) => {
    uploadMulter(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        reject({ status: 500, message: "Failed to upload file" });
      } else {
        try {
          // Validate if file exists
          if (!req.file) {
            reject({ status: 400, message: "No file provided" });
            return;
          }

          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "uploads", // Optional: Save files in a specific folder
          });

          // Cleanup local file
          fs.unlinkSync(req.file.path);

          resolve({
            status: 200,
            message: "File uploaded successfully",
            url: result.secure_url, // Return the Cloudinary URL
          });
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error.message);
          reject({ status: 500, message: "Failed to upload file" });
        }
      }
    });
  });
}

module.exports = { upload };
