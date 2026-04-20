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
    // "authenticated" → signed URLs only; public URL is 401. Use for private docs (e.g. BOQ).
    const typeOpt = options.type || "upload";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        type: typeOpt,
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
            type: result.type,
            resourceType: result.resource_type,
          });
        }
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
}

/**
 * Generate a short-lived signed URL for a private/authenticated Cloudinary asset.
 * @param {string} publicId
 * @param {Object} options
 * @param {string} options.resourceType - "raw" | "image" | "video"
 * @param {string} options.format - e.g. "xlsx"
 * @param {number} options.expiresInSec - signature lifetime (default 300s)
 */
function signedPrivateUrl(publicId, options = {}) {
  const resourceType = options.resourceType || "raw";
  const expiresAt = Math.floor(Date.now() / 1000) + (options.expiresInSec || 300);
  return cloudinary.utils.private_download_url(publicId, options.format || null, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: expiresAt,
    attachment: options.attachment || false,
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @param {string} resourceType - "image", "raw", or "video"
 */
function deleteFromCloudinary(publicId, resourceType, type) {
  resourceType = resourceType || "image";
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: type || "upload",
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  signedPrivateUrl,
};
