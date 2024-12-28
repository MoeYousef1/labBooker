const uploadMulter = require('../middleware/multer');
const cloudinary = require('../utils/cloudinary');
async function upload(req, res) {
    return new Promise((resolve, reject) => {
        uploadMulter(req, res, async (err) => {
            if (err) {
                console.error("Error uploading file:", err.message);
                reject({ status: 500, message: "Failed to upload file" });
            } else {
                try {
                    const result = await cloudinary.uploader.upload(req.file.path); // Upload file to Cloudinary
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
