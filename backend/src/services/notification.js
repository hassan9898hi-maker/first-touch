const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();
let io = null;

function setSocketIO(socketIO) {
  io = socketIO;
}

async function notify(userId, type, titleAr, messageAr) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, type, titleAr, messageAr }
    });

    // Real-time push via Socket.io
    if (io) {
      io.to("user_" + userId).emit("notification", {
        id: notif.id,
        type: type,
        titleAr: titleAr,
        messageAr: messageAr,
        isRead: false,
        createdAt: notif.createdAt
      });
    }

    logger.debug("Notification sent", { userId, type, title: titleAr });
    return notif;
  } catch (e) {
    logger.error("Failed to send notification", { userId, error: e.message });
  }
}

// Notify multiple users
async function notifyMany(userIds, type, titleAr, messageAr) {
  for (const uid of userIds) {
    await notify(uid, type, titleAr, messageAr);
  }
}

// Notify all users of a specific role
async function notifyRole(role, type, titleAr, messageAr) {
  const users = await prisma.user.findMany({
    where: { OR: [{ role: role }, { roles: { contains: role } }] },
    select: { id: true }
  });
  for (const u of users) {
    await notify(u.id, type, titleAr, messageAr);
  }
}

module.exports = { notify, notifyMany, notifyRole, setSocketIO };
