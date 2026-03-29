const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const logger = require("../utils/logger");

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Check if Cloudinary is configured
 */
function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder (e.g., "firsttouch/projects")
 * @param {string} options.resourceType - "image", "raw", or "auto"
 * @returns {Promise<{url: string, publicId: string, size: number}>}
 */
function uploadToCloudinary(buffer, options = {}) {
  return new Promise(function (resolve, reject) {
    const folder = options.folder || "firsttouch/uploads";
    const resourceType = options.resourceType || "auto";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        transformation: options.transformation || undefined,
      },
      function (error, result) {
        if (error) {
          logger.error("Cloudinary upload error", { error: error.message });
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @param {string} resourceType - "image", "raw", or "video"
 */
function deleteFromCloudinary(publicId, resourceType) {
  resourceType = resourceType || "image";
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
};
