const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { isCloudinaryConfigured, uploadToCloudinary } = require("../services/cloudinary");

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

// File type whitelist
const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/dwg": ".dwg",
  "image/vnd.dwg": ".dwg",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov"
};

// Use memory storage when Cloudinary is configured, disk storage otherwise
let storage;

if (isCloudinaryConfigured()) {
  // Memory storage — files will be uploaded to Cloudinary after multer processes them
  storage = multer.memoryStorage();
  logger.info("Upload: Using Cloudinary cloud storage");
} else {
  // Disk storage — fallback for local development without Cloudinary
  const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
      const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname);
      const uniqueName = uuidv4() + ext;
      cb(null, uniqueName);
    }
  });
  logger.info("Upload: Using local disk storage (set CLOUDINARY_* env vars for cloud)");
}

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES[file.mimetype] || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    logger.warn("Rejected file upload", { type: file.mimetype, name: file.originalname });
    cb(new Error("Unsupported file type — please upload images, videos, or PDF documents only"), false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 10
  }
});

/**
 * Middleware to process uploaded files — uploads to Cloudinary if configured.
 * Attaches `file.cloudinaryUrl` or keeps `file.path` for local.
 */
async function processUploadedFiles(req, res, next) {
  if (!req.files && !req.file) return next();

  const files = req.files || (req.file ? [req.file] : []);

  if (!isCloudinaryConfigured()) {
    // Local disk — files already saved by multer diskStorage
    for (const file of files) {
      file.cloudinaryUrl = null; // no cloud URL
      file.fileUrl = "uploads/" + file.filename; // local path
    }
    return next();
  }

  // Cloudinary — upload each file from memory buffer
  try {
    for (const file of files) {
      const isImage = file.mimetype.startsWith("image/");
      const isVideo = file.mimetype.startsWith("video/");
      const resourceType = isImage ? "image" : isVideo ? "video" : "raw";

      const result = await uploadToCloudinary(file.buffer, {
        folder: "firsttouch/" + (req.uploadFolder || "uploads"),
        resourceType: resourceType,
        type: req.uploadPrivate ? "authenticated" : "upload",
      });

      file.cloudinaryUrl = result.url;
      file.cloudinaryPublicId = result.publicId;
      file.cloudinaryType = result.type || (req.uploadPrivate ? "authenticated" : "upload");
      file.cloudinaryResourceType = result.resourceType || resourceType;
      file.fileUrl = result.url;
      file.fileSize = result.size;
    }
    next();
  } catch (err) {
    logger.error("Cloud upload failed", { error: err.message });
    res.status(500).json({ error: "File upload failed — please try again" });
  }
}

module.exports = upload;
module.exports.processUploadedFiles = processUploadedFiles;
