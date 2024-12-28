const express = require('express');
const router = express.Router();
const { upload } = require('../controllers/uploadController'); 

router.post('/upload', async (req, res) => {
    try {
        const response = await upload(req, res);
        res.status(response.status).json({ message: response.message, url: response.url });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

module.exports = router;
