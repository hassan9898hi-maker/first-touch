const { z } = require("zod");

function optionalString() {
  return z.preprocess(function (value) {
    return value === null ? undefined : value;
  }, z.string().optional());
}

// ═══════ AUTH VALIDATORS ═══════
const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["owner", "contractor", "inspector", "developer"]).optional()
});

const registerSchema = z.object({
  nameAr: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["owner", "contractor", "inspector", "developer"]),
  accountType: z.enum(["individual", "company"]).default("individual"),
  companyNameAr: optionalString(),
  specialty: optionalString(),
  phone: optionalString()
});

// ═══════ PROJECT VALIDATORS ═══════
const createProjectSchema = z.object({
  titleAr: z.string().min(3, "اسم المشروع مطلوب — 3 أحرف على الأقل"),
  type: z.enum(["villa", "apartment", "commercial", "residential"]).default("villa"),
  areaSqm: z.number().min(0).optional(),
  floors: z.number().int().min(1).max(100).default(1),
  locationAr: optionalString(),
  totalBudget: z.number().min(0).default(0),
  hasDesigns: z.boolean().default(false),
  descriptionAr: optionalString(),
  ownerConditions: optionalString()
});

// ═══════ QUOTATION VALIDATORS ═══════
const quotationSchema = z.object({
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  durationMonths: z.number().int().min(1).max(60),
  warrantyMonths: z.number().int().min(0).max(120).optional(),
  notes: optionalString(),
  breakdown: z.object({}).passthrough().optional(),
  boqItems: z.array(z.object({
    stage: optionalString(),
    description: z.string(),
    unit: optionalString(),
    quantity: z.number().optional(),
    unit_price: z.number().optional(),
    brand: optionalString(),
    total: z.number().optional()
  })).optional()
});

// ═══════ WALLET VALIDATORS ═══════
const depositSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر").max(1000000),
  bank: z.string().min(2)
});

// ═══════ INSPECTOR APPLICATION ═══════
const inspectorApplySchema = z.object({
  fee: z.number().min(0).default(0),
  notes: optionalString()
});

// ═══════ FINANCING ═══════
const financingSchema = z.object({
  projectId: z.number().int().optional(),
  amount: z.number().positive("المبلغ مطلوب"),
  bank: z.string().min(2),
  durationMonths: z.number().int().min(1).max(360).default(12),
  notes: optionalString()
});

// ═══════ CONTRACTOR SUBMIT ═══════
const contractorSubmitSchema = z.object({
  notes: optionalString(),
  files: z.array(z.object({
    name: z.string(),
    type: z.string()
  })).optional()
});

// ═══════ INSPECTOR REVIEW ═══════
const inspectorReviewSchema = z.object({
  approved: z.boolean(),
  notes: optionalString()
});

// ═══════ OWNER DECISION ═══════
const ownerDecisionSchema = z.object({
  approved: z.boolean()
});

module.exports = {
  loginSchema, registerSchema, createProjectSchema, quotationSchema,
  depositSchema, inspectorApplySchema, financingSchema,
  contractorSubmitSchema, inspectorReviewSchema, ownerDecisionSchema
};
