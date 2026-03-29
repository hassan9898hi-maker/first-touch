const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { depositSchema } = require("../utils/validators");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

// ═══════ GET WALLET ═══════
router.get("/", auth, requireRole("owner"), async (req, res) => {
  try {
    let wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: req.user.id } });
    }
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id }, orderBy: { createdAt: "desc" }, take: 50
    });
    res.json({ wallet, transactions });
  } catch (e) {
    logger.error("Get wallet error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ═══════ DEPOSIT ═══════
router.post("/deposit", auth, requireRole("owner"), validate(depositSchema), async (req, res) => {
  try {
    const { amount, bank } = req.validated;
    let wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: req.user.id } });
    }

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } });
      await tx.transaction.create({
        data: { walletId: wallet.id, amount, type: "deposit", description: "Deposit via " + bank, descriptionAr: "إيداع عبر " + bank }
      });
    });

    logger.info("Deposit successful", { userId: req.user.id, amount, bank });
    res.json({ success: true, message: "تم الإيداع" });
  } catch (e) {
    logger.error("Deposit error", { error: e.message });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

module.exports = router;
