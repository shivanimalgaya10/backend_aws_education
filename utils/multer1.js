// utils/multer1.js
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';

const uploadPath = 'uploads/';

// Ensure the 'uploads' directory exists
fs.mkdir(uploadPath, { recursive: true }).catch((error) => console.error(`Failed to create directory ${uploadPath}: ${error.message}`));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Path where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique name for each file
  }
});

const upload1 = multer({ storage: storage });

export default upload1;
