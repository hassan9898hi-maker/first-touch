const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ GET ACHIEVEMENTS GALLERY ═══════
router.get("/", auth, async (req, res) => {
  try {
    const achievements = await prisma.project.findMany({
      where: { status: "completed" },
      orderBy: { completedAt: "desc" },
      include: {
        owner: { select: { id: true, nameAr: true } },
        contractor: { select: { id: true, nameAr: true, companyNameAr: true, rating: true, totalProjects: true } },
        inspector: { select: { id: true, nameAr: true, specialty: true, rating: true } },
        images: { orderBy: { isPrimary: "desc" } },
        ratings: {
          include: {
            rater: { select: { nameAr: true } },
            rated: { select: { nameAr: true } }
          }
        }
      }
    });

    const result = achievements.map(a => {
      const contractorRatings = a.ratings.filter(r => r.ratedRole === "contractor");
      const inspectorRatings = a.ratings.filter(r => r.ratedRole === "inspector");
      const contractorAvg = contractorRatings.length > 0
        ? contractorRatings.reduce((s, r) => s + r.rating, 0) / contractorRatings.length
        : 0;
      const inspectorAvg = inspectorRatings.length > 0
        ? inspectorRatings.reduce((s, r) => s + r.rating, 0) / inspectorRatings.length
        : 0;

      return {
        id: a.id,
        title_ar: a.titleAr,
        type: a.type,
        location_ar: a.locationAr,
        area_sqm: a.areaSqm,
        floors: a.floors,
        total_budget: a.totalBudget,
        created_at: a.createdAt,
        completed_at: a.completedAt,
        owner_id: a.owner?.id,
        owner_name: a.owner?.nameAr,
        contractor_id: a.contractor?.id,
        contractor_name: a.contractor?.nameAr,
        contractor_company: a.contractor?.companyNameAr,
        contractor_avg_rating: Math.round(contractorAvg * 10) / 10,
        inspector_id: a.inspector?.id,
        inspector_name: a.inspector?.nameAr,
        inspector_specialty: a.inspector?.specialty,
        inspector_avg_rating: Math.round(inspectorAvg * 10) / 10,
        images: a.images,
        ratings: a.ratings.map(r => ({
          id: r.id,
          rater_id: r.raterId,
          rater_name: r.rater?.nameAr,
          rated_id: r.ratedId,
          rated_role: r.ratedRole,
          rating: r.rating,
          review_ar: r.reviewAr,
          created_at: r.createdAt
        }))
      };
    });

    res.json({ achievements: result });
  } catch (e) {
    logger.error("Get achievements error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ SUBMIT RATING ═══════
router.post("/:projectId/rate", auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { rated_user_id, rated_role, rating, review_ar } = req.body;

    if (!rated_user_id || !rated_role || !rating) {
      return res.status(400).json({ error: "البيانات ناقصة" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "التقييم يجب أن يكون بين 1 و 5" });
    }

    // Check project exists and is completed
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "المشروع غير موجود" });
    if (project.status !== "completed") return res.status(400).json({ error: "يمكن التقييم فقط بعد اكتمال المشروع" });

    // Only owner can rate
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ error: "فقط صاحب المشروع يمكنه التقييم" });
    }

    // Prevent duplicate rating
    const existing = await prisma.projectRating.findUnique({
      where: { projectId_raterId_ratedRole: { projectId, raterId: req.user.id, ratedRole: rated_role } }
    });
    if (existing) return res.status(409).json({ error: "لقد قيّمت هذا الشخص مسبقاً في هذا المشروع" });

    // Save rating
    const newRating = await prisma.projectRating.create({
      data: {
        projectId,
        raterId: req.user.id,
        ratedId: rated_user_id,
        ratedRole: rated_role,
        rating: parseInt(rating),
        reviewAr: review_ar || null
      }
    });

    // Update user's average rating
    const allRatings = await prisma.projectRating.findMany({ where: { ratedId: rated_user_id } });
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
    await prisma.user.update({
      where: { id: rated_user_id },
      data: { rating: Math.round(avg * 10) / 10 }
    });

    logger.info("Rating submitted", { projectId, raterId: req.user.id, ratedRole: rated_role, rating });
    res.json({ success: true, message: "تم إرسال التقييم بنجاح", rating: newRating });
  } catch (e) {
    logger.error("Submit rating error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
