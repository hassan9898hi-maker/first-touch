const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ GET COMMENTS FOR AN ITEM ═══════
router.get("/:itemId/comments", auth, async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);

    // Verify item exists and user has access to its project
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        subStage: {
          include: {
            stage: {
              include: { project: true }
            }
          }
        }
      }
    });

    if (!item) return res.status(404).json({ error: "البند غير موجود" });

    const project = item.subStage.stage.project;
    const userId = req.user.id;
    const isParticipant = project.ownerId === userId ||
      project.contractorId === userId ||
      project.inspectorId === userId ||
      req.user.isAdmin;

    if (!isParticipant) {
      return res.status(403).json({ error: "غير مصرح" });
    }

    const comments = await prisma.itemComment.findMany({
      where: { itemId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, nameAr: true, role: true, profileImage: true } }
      }
    });

    res.json({
      comments: comments.map(c => ({
        id: c.id,
        text: c.text,
        created_at: c.createdAt,
        user_id: c.userId,
        user_name: c.user.nameAr,
        user_role: c.user.role,
        user_image: c.user.profileImage
      }))
    });
  } catch (e) {
    logger.error("Get comments error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ POST COMMENT ON AN ITEM ═══════
router.post("/:itemId/comments", auth, async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "نص التعليق مطلوب" });
    }

    // Verify item exists and user has access to its project
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        subStage: {
          include: {
            stage: {
              include: { project: true }
            }
          }
        }
      }
    });

    if (!item) return res.status(404).json({ error: "البند غير موجود" });

    const project = item.subStage.stage.project;
    const userId = req.user.id;
    const isParticipant = project.ownerId === userId ||
      project.contractorId === userId ||
      project.inspectorId === userId ||
      req.user.isAdmin;

    if (!isParticipant) {
      return res.status(403).json({ error: "غير مصرح" });
    }

    const comment = await prisma.itemComment.create({
      data: {
        itemId,
        userId,
        text: text.trim()
      },
      include: {
        user: { select: { id: true, nameAr: true, role: true, profileImage: true } }
      }
    });

    logger.info("Comment posted", { itemId, userId });

    res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        text: comment.text,
        created_at: comment.createdAt,
        user_id: comment.userId,
        user_name: comment.user.nameAr,
        user_role: comment.user.role,
        user_image: comment.user.profileImage
      }
    });
  } catch (e) {
    logger.error("Post comment error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
