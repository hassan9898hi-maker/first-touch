const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح — يرجى تسجيل الدخول" });
  }
  try {
    const decoded = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "انتهت صلاحية الجلسة", code: "TOKEN_EXPIRED" });
    }
    logger.warn("Invalid token attempt", { ip: req.ip });
    return res.status(401).json({ error: "رمز غير صالح" });
  }
}

// Role-based access control
function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn("Unauthorized role access", { userId: req.user?.id, role: req.user?.role, required: roles });
      return res.status(403).json({ error: "ليس لديك صلاحية لهذا الإجراء" });
    }
    next();
  };
}

module.exports = { auth, requireRole };
