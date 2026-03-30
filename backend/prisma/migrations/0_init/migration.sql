-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roles" TEXT,
    "company_name_ar" TEXT,
    "specialty" TEXT,
    "phone" TEXT,
    "cr_number" TEXT,
    "bio_ar" TEXT,
    "profile_image" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_projects" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verify_token" TEXT,
    "verify_expiry" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_expiry" TIMESTAMP(3),
    "otp_code" TEXT,
    "otp_expiry" TIMESTAMP(3),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title_ar" TEXT NOT NULL,
    "title_en" TEXT,
    "type" TEXT NOT NULL DEFAULT 'villa',
    "area_sqm" DOUBLE PRECISION,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "location_ar" TEXT,
    "total_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description_ar" TEXT,
    "has_designs" BOOLEAN NOT NULL DEFAULT false,
    "needs_design" BOOLEAN NOT NULL DEFAULT false,
    "current_stage" TEXT DEFAULT 'design',
    "owner_conditions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "owner_id" INTEGER NOT NULL,
    "contractor_id" INTEGER,
    "inspector_id" INTEGER,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "order_num" INTEGER NOT NULL DEFAULT 0,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'locked',

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_stages" (
    "id" SERIAL NOT NULL,
    "stage_id" INTEGER NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "order_num" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sub_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" SERIAL NOT NULL,
    "sub_stage_id" INTEGER NOT NULL,
    "text_ar" TEXT NOT NULL,
    "text_en" TEXT,
    "order_num" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contractor_done" BOOLEAN NOT NULL DEFAULT false,
    "contractor_notes" TEXT,
    "contractor_date" TIMESTAMP(3),
    "inspector_done" BOOLEAN NOT NULL DEFAULT false,
    "inspector_approved" BOOLEAN NOT NULL DEFAULT false,
    "inspector_notes" TEXT,
    "inspector_date" TIMESTAMP(3),
    "owner_done" BOOLEAN NOT NULL DEFAULT false,
    "owner_approved" BOOLEAN NOT NULL DEFAULT false,
    "owner_date" TIMESTAMP(3),

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_files" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER,
    "role" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reserved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "contractor_id" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "warranty_months" INTEGER,
    "notes" TEXT,
    "breakdown" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspector_applications" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspector_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "title_ar" TEXT NOT NULL,
    "message_ar" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption_ar" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financing_applications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "bank" TEXT NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financing_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_earnings" (
    "id" SERIAL NOT NULL,
    "contractor_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "item_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_ratings" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "rated_id" INTEGER NOT NULL,
    "rated_role" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_ar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_comments" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "bank_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "duration_years" INTEGER NOT NULL DEFAULT 15,
    "purpose" TEXT,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compounds" (
    "id" SERIAL NOT NULL,
    "compound_number" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "developer_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'residential',
    "area" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'البحرين',
    "total_area" DOUBLE PRECISION,
    "total_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_units" INTEGER NOT NULL DEFAULT 0,
    "contractor_id" INTEGER,
    "inspector_id" INTEGER,
    "payment_type" TEXT NOT NULL DEFAULT 'per_unit',
    "status" TEXT NOT NULL DEFAULT 'setup',
    "start_date" TIMESTAMP(3),
    "expected_end_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compound_units" (
    "id" SERIAL NOT NULL,
    "compound_id" INTEGER NOT NULL,
    "unit_number" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'villa',
    "model_type" TEXT,
    "block" TEXT,
    "floor" INTEGER,
    "area" DOUBLE PRECISION,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "planned_start" TIMESTAMP(3),
    "planned_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compound_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_stages" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "order_num" INTEGER NOT NULL DEFAULT 0,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "unit_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_checklist_items" (
    "id" SERIAL NOT NULL,
    "stage_id" INTEGER NOT NULL,
    "text_ar" TEXT NOT NULL,
    "text_en" TEXT,
    "order_num" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contractor_done" BOOLEAN NOT NULL DEFAULT false,
    "contractor_notes" TEXT,
    "contractor_date" TIMESTAMP(3),
    "inspector_approved" BOOLEAN NOT NULL DEFAULT false,
    "inspector_notes" TEXT,
    "inspector_date" TIMESTAMP(3),
    "developer_approved" BOOLEAN NOT NULL DEFAULT false,
    "developer_notes" TEXT,
    "developer_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "unit_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compound_supervisors" (
    "id" SERIAL NOT NULL,
    "compound_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'site_supervisor',
    "assigned_units" TEXT,
    "permissions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compound_supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_tracking" (
    "id" SERIAL NOT NULL,
    "compound_id" INTEGER NOT NULL,
    "unit_id" INTEGER,
    "material_name_ar" TEXT NOT NULL,
    "material_name_en" TEXT,
    "unit" TEXT NOT NULL,
    "planned_qty" DOUBLE PRECISION NOT NULL,
    "used_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_per_unit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stage" TEXT,
    "notes" TEXT,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_issues" (
    "id" SERIAL NOT NULL,
    "compound_id" INTEGER NOT NULL,
    "unit_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "images" TEXT,
    "reported_by" INTEGER NOT NULL,
    "assigned_to" INTEGER,
    "inspector_notes" TEXT,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compound_payments" (
    "id" SERIAL NOT NULL,
    "compound_id" INTEGER NOT NULL,
    "stage_name_ar" TEXT,
    "stage_name_en" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "type" TEXT NOT NULL DEFAULT 'bulk',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "approved_by" INTEGER,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compound_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_ratings_project_id_rater_id_rated_role_key" ON "project_ratings"("project_id", "rater_id", "rated_role");

-- CreateIndex
CREATE UNIQUE INDEX "compounds_compound_number_key" ON "compounds"("compound_number");

-- CreateIndex
CREATE UNIQUE INDEX "compound_units_compound_id_unit_number_key" ON "compound_units"("compound_id", "unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "compound_supervisors_compound_id_user_id_key" ON "compound_supervisors"("compound_id", "user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_stages" ADD CONSTRAINT "sub_stages_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_sub_stage_id_fkey" FOREIGN KEY ("sub_stage_id") REFERENCES "sub_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_files" ADD CONSTRAINT "item_files_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspector_applications" ADD CONSTRAINT "inspector_applications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspector_applications" ADD CONSTRAINT "inspector_applications_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financing_applications" ADD CONSTRAINT "financing_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financing_applications" ADD CONSTRAINT "financing_applications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_earnings" ADD CONSTRAINT "contractor_earnings_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_earnings" ADD CONSTRAINT "contractor_earnings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_earnings" ADD CONSTRAINT "contractor_earnings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "checklist_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ratings" ADD CONSTRAINT "project_ratings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ratings" ADD CONSTRAINT "project_ratings_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ratings" ADD CONSTRAINT "project_ratings_rated_id_fkey" FOREIGN KEY ("rated_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_comments" ADD CONSTRAINT "item_comments_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_comments" ADD CONSTRAINT "item_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compound_units" ADD CONSTRAINT "compound_units_compound_id_fkey" FOREIGN KEY ("compound_id") REFERENCES "compounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_stages" ADD CONSTRAINT "unit_stages_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "compound_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_checklist_items" ADD CONSTRAINT "unit_checklist_items_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "unit_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compound_supervisors" ADD CONSTRAINT "compound_supervisors_compound_id_fkey" FOREIGN KEY ("compound_id") REFERENCES "compounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_tracking" ADD CONSTRAINT "material_tracking_compound_id_fkey" FOREIGN KEY ("compound_id") REFERENCES "compounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_tracking" ADD CONSTRAINT "material_tracking_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "compound_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_issues" ADD CONSTRAINT "quality_issues_compound_id_fkey" FOREIGN KEY ("compound_id") REFERENCES "compounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_issues" ADD CONSTRAINT "quality_issues_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "compound_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compound_payments" ADD CONSTRAINT "compound_payments_compound_id_fkey" FOREIGN KEY ("compound_id") REFERENCES "compounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

