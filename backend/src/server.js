require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const logger = require("./utils/logger");
const { initEmail } = require("./services/email");
const { setSocketIO } = require("./services/notification");

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ═══════ SOCKET.IO ═══════
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

setSocketIO(io);

io.on("connection", (socket) => {
  logger.debug("Socket connected", { id: socket.id });

  socket.on("join", (userId) => {
    socket.join("user_" + userId);
    logger.debug("User joined room", { userId, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    logger.debug("Socket disconnected", { id: socket.id });
  });
});

// ═══════ TRUST PROXY (for Railway/Render behind reverse proxy) ═══════
if (isProduction) {
  app.set("trust proxy", 1);
}

// ═══════ SECURITY ═══════
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: isProduction
    ? FRONTEND_URL
    : [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

// ═══════ RATE LIMITING ═══════
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: "Too many requests — please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts — please wait 15 minutes" }
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ═══════ BODY PARSING ═══════
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ═══════ STATIC FILES (local uploads fallback — only when Cloudinary is not configured) ═══════
const { isCloudinaryConfigured } = require("./services/cloudinary");
if (!isCloudinaryConfigured()) {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", express.static(path.resolve(uploadDir)));
  logger.info("Serving local uploads from: " + path.resolve(uploadDir));
}

// ═══════ REQUEST LOGGING ═══════
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn("Slow request", { method: req.method, url: req.url, duration: duration + "ms", status: res.statusCode });
    }
  });
  next();
});

// ═══════ ROUTES ═══════
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/wallet", require("./routes/wallet"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/financing", require("./routes/financing"));
app.use("/api/contractors", require("./routes/contractors"));
app.use("/api/inspectors", require("./routes/inspectors"));
app.use("/api/achievements", require("./routes/achievements"));
app.use("/api/compounds", require("./routes/compounds"));
app.use("/api/items", require("./routes/comments"));
app.use("/api/admin", require("./routes/admin"));

// ═══════ SERVE FRONTEND IN PRODUCTION ═══════
if (isProduction) {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(frontendPath, "index.html"));
      }
    });
    logger.info("Serving frontend from: " + frontendPath);
  }
}

// ═══════ HEALTH CHECK ═══════
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "first-touch",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    cloudStorage: isCloudinaryConfigured() ? "cloudinary" : "local",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ═══════ 404 HANDLER ═══════
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ═══════ ERROR HANDLER ═══════
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url
  });

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request too large" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File size exceeds maximum allowed" });
  }

  res.status(500).json({ error: "Internal server error" });
});

// ═══════ START ═══════
const PORT = process.env.PORT || 5000;

initEmail();

server.listen(PORT, () => {
  logger.info(`🐋 FIRST TOUCH Backend running on port ${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`   Frontend URL: ${FRONTEND_URL}`);
  logger.info(`   Storage: ${isCloudinaryConfigured() ? "Cloudinary (cloud)" : "Local disk"}`);
});

module.exports = { app, server, io };
