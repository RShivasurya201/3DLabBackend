const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadMaterial } = require('../controllers/materialController');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // store in /uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST route for uploading material
router.post('/', upload.single('file'), uploadMaterial);

router.get('/', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to list materials' });
    }
    const fileLinks = files.map(file => ({
      filename: file,
      url: `http://localhost:5000/uploads/${file}`
    }));
    res.json(fileLinks);
  });
});

module.exports = router;
