-- CreateTable
CREATE TABLE "project_ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "rated_id" INTEGER NOT NULL,
    "rated_role" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_ar" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_ratings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_ratings_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_ratings_rated_id_fkey" FOREIGN KEY ("rated_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "item_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "item_comments_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "checklist_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "item_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "rating" REAL NOT NULL DEFAULT 0,
    "total_projects" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verify_token" TEXT,
    "verify_expiry" DATETIME,
    "reset_token" TEXT,
    "reset_expiry" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("bio_ar", "company_name_ar", "cr_number", "created_at", "email", "id", "is_active", "name_ar", "name_en", "password_hash", "phone", "profile_image", "rating", "role", "roles", "specialty", "total_projects", "updated_at") SELECT "bio_ar", "company_name_ar", "cr_number", "created_at", "email", "id", "is_active", "name_ar", "name_en", "password_hash", "phone", "profile_image", "rating", "role", "roles", "specialty", "total_projects", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "project_ratings_project_id_rater_id_rated_role_key" ON "project_ratings"("project_id", "rater_id", "rated_role");
