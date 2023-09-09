const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs/promises');
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileNameFormatted = Date.now() + '-' + file.originalname;
    cb(null, fileNameFormatted);
    console.log('File uploaded successfully');
  }
});
const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Delete All File In Directory
const deleteAllFilesInDir = async (dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    const deleteFilePromises = files.map(file =>
      fs.unlink(path.join(dirPath, file)),
    );
    await Promise.all(deleteFilePromises);
  } catch (err) {
    console.log(err);
  }
}

// Middleware for auto delete file in uploads directory
const autoDeleteContentUploads = (req, res, next) => {
  deleteAllFilesInDir('./uploads').then(() => {
    console.log('Auto delete all files from the uploads directory');
    next();
  });
}

// GET: Homepage
app.get('/', autoDeleteContentUploads, function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST: Process File Analyse
app.post("/api/fileanalyse", upload.single('upfile'), (req, res) => {
  if (req.file === undefined) return res.json({ error: 'No File Chosen.' });
  const { originalname: name, mimetype: type, size } = req.file;
  res.json({ name, type, size });
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Your app is listening on port ' + port)
});
