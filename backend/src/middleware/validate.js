const logger = require("../utils/logger");

// Zod validation middleware
function validate(schema) {
  return function (req, res, next) {
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (e) {
      const errors = e.errors ? e.errors.map(function (err) {
        return { field: err.path.join("."), message: err.message };
      }) : [{ message: "بيانات غير صحيحة" }];
      logger.debug("Validation failed", { errors, path: req.path });
      return res.status(400).json({ error: errors[0].message, errors: errors });
    }
  };
}

module.exports = validate;
