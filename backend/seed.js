const initSqlJs = require("sql.js");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "firsttouch.db");

async function seed() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  console.log("🐋 FIRST TOUCH — Seeding Database (v2.0)...\n");

  // ═══════ CREATE TABLES ═══════
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL, name_en TEXT,
    email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    role TEXT NOT NULL, roles TEXT,
    company_name_ar TEXT, specialty TEXT,
    phone TEXT, cr_number TEXT, bio_ar TEXT, profile_image TEXT,
    rating REAL DEFAULT 0, total_projects INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ar TEXT NOT NULL, title_en TEXT,
    type TEXT DEFAULT 'villa', area_sqm REAL, floors INTEGER DEFAULT 1,
    location_ar TEXT, total_budget REAL DEFAULT 0,
    description_ar TEXT DEFAULT '',
    has_designs INTEGER DEFAULT 0, needs_design INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new' CHECK(status IN ('new','awaiting_pricing','design_required','active','completed','cancelled')),
    owner_id INTEGER, contractor_id INTEGER, inspector_id INTEGER,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, name_ar TEXT NOT NULL,
    name_en TEXT, order_num INTEGER DEFAULT 0, budget REAL DEFAULT 0,
    status TEXT DEFAULT 'locked' CHECK(status IN ('locked','active','completed'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sub_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, stage_id INTEGER, name_ar TEXT NOT NULL,
    name_en TEXT, order_num INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, sub_stage_id INTEGER, text_ar TEXT NOT NULL,
    text_en TEXT, order_num INTEGER DEFAULT 0, cost REAL DEFAULT 0,
    contractor_done INTEGER DEFAULT 0, contractor_notes TEXT, contractor_date TEXT,
    inspector_done INTEGER DEFAULT 0, inspector_approved INTEGER DEFAULT 0,
    inspector_notes TEXT, inspector_date TEXT,
    owner_done INTEGER DEFAULT 0, owner_approved INTEGER DEFAULT 0, owner_date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS item_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER, file_name TEXT,
    file_type TEXT, role TEXT, uploaded_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE,
    balance REAL DEFAULT 0, reserved REAL DEFAULT 0, total_paid REAL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, wallet_id INTEGER, amount REAL,
    type TEXT, description TEXT, description_ar TEXT, created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, contractor_id INTEGER,
    price REAL, duration_months INTEGER, notes TEXT, breakdown TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inspector_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, inspector_id INTEGER,
    fee REAL DEFAULT 0, notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, type TEXT DEFAULT 'info',
    title_ar TEXT, message_ar TEXT, is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER,
    image_url TEXT, caption_ar TEXT, is_primary INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS financing_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, project_id INTEGER,
    amount REAL, bank TEXT, duration_months INTEGER, notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contractor_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, contractor_id INTEGER, project_id INTEGER,
    item_id INTEGER, amount REAL, created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, contractor_id INTEGER,
    price REAL, duration_months INTEGER, notes TEXT, status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  console.log("✅ Tables created (15 tables)");

  // ═══════ USERS ═══════
  const hash = bcrypt.hashSync("123456", 10);

  // Owner
  db.run("INSERT INTO users (name_ar, name_en, email, password_hash, role, roles, phone, bio_ar, rating, total_projects) VALUES (?,?,?,?,?,?,?,?,?,?)",
    ["أحمد المناعي", "Ahmed Al Manai", "ahmed@example.com", hash, "owner", "owner",
     "+973 3300 1234", "رجل أعمال ومستثمر عقاري — البحرين", 0, 3]);

  // Contractors (multiple)
  db.run("INSERT INTO users (name_ar, name_en, email, password_hash, role, roles, company_name_ar, cr_number, phone, bio_ar, rating, total_projects) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    ["شركة الخليج للبناء", "Gulf Construction Co.", "gulf@example.com", hash, "contractor", "contractor",
     "شركة الخليج للبناء والتعمير", "CR-45678", "+973 1700 5555",
     "شركة مقاولات رائدة في البحرين — خبرة 20 عام في المشاريع السكنية والتجارية", 4.8, 15]);

  db.run("INSERT INTO users (name_ar, name_en, email, password_hash, role, roles, company_name_ar, cr_number, phone, bio_ar, rating, total_projects) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    ["مؤسسة البناء الحديث", "Modern Build Est.", "modern@example.com", hash, "contractor", "contractor",
     "مؤسسة البناء الحديث", "CR-78901", "+973 1700 6666",
     "متخصصون في الفلل والمباني السكنية الفاخرة — حاصلون على شهادة ISO", 4.5, 10]);

  // Inspectors (multiple)
  db.run("INSERT INTO users (name_ar, name_en, email, password_hash, role, roles, specialty, phone, bio_ar, rating, total_projects) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ["م. سعيد الدوسري", "Eng. Saeed Al Dosari", "saeed@example.com", hash, "inspector", "inspector",
     "مفتش جودة معتمد — خبرة 12 سنة", "+973 3600 7777",
     "مهندس مدني معتمد من هيئة الجودة — متخصص في الإشراف على المشاريع السكنية", 4.9, 22]);

  db.run("INSERT INTO users (name_ar, name_en, email, password_hash, role, roles, specialty, phone, bio_ar, rating, total_projects) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ["م. فاطمة الشيخ", "Eng. Fatima Al Sheikh", "fatima@example.com", hash, "inspector", "inspector",
     "مهندسة إنشائية — خبرة 8 سنوات", "+973 3600 8888",
     "مهندسة إنشائية متخصصة في فحص الهياكل الخرسانية والأساسات", 4.7, 14]);

  console.log("✅ Users seeded (5 users)");

  function lastId() {
    const r = db.exec("SELECT last_insert_rowid()");
    return r[0].values[0][0];
  }
  function getId(sql, params) {
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row.id;
  }

  const ownerId = getId("SELECT id FROM users WHERE email = ?", ["ahmed@example.com"]);
  const contractorId = getId("SELECT id FROM users WHERE email = ?", ["gulf@example.com"]);
  const contractor2Id = getId("SELECT id FROM users WHERE email = ?", ["modern@example.com"]);
  const inspectorId = getId("SELECT id FROM users WHERE email = ?", ["saeed@example.com"]);
  const inspector2Id = getId("SELECT id FROM users WHERE email = ?", ["fatima@example.com"]);

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
  const weekAgo = new Date(Date.now() - 604800000).toISOString();
  const monthAgo = new Date(Date.now() - 2592000000).toISOString();

  // ═══════════════════════════════════════════════
  // PROJECT 1: Active villa (with full tracking data)
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO projects (title_ar, title_en, type, area_sqm, floors, location_ar, total_budget, status, has_designs, needs_design, description_ar, owner_id, contractor_id, inspector_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ["فيلا الرفاع الغربي", "West Riffa Villa", "villa", 450, 2, "الرفاع الغربي، البحرين", 120000,
     "active", 1, 0, "فيلا سكنية فاخرة — دورين مع حديقة خاصة ومسبح", ownerId, contractorId, inspectorId, monthAgo]);
  const proj1Id = lastId();

  // ── Stage 1: Foundation (COMPLETED) ──
  db.run("INSERT INTO stages (project_id, name_ar, name_en, order_num, budget, status) VALUES (?,?,?,?,?,?)",
    [proj1Id, "الأساسات والقواعد", "Foundation", 1, 25000, "completed"]);
  const s1 = lastId();

  db.run("INSERT INTO sub_stages (stage_id, name_ar, name_en, order_num) VALUES (?,?,?,?)", [s1, "الحفر والتسوية", "Excavation", 1]);
  const ss1a = lastId();
  db.run("INSERT INTO sub_stages (stage_id, name_ar, name_en, order_num) VALUES (?,?,?,?)", [s1, "صب الأساسات", "Foundation Pour", 2]);
  const ss1b = lastId();

  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss1a, "حفر الأرض حسب المخططات", "Dig per blueprint", 1, 3000, 1, "تم الحفر حسب المواصفات", twoDaysAgo, 1, 1, "مطابق للمعايير", twoDaysAgo, 1, 1, yesterday]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss1a, "تسوية الأرضية", "Level ground", 2, 2000, 1, "تم التسوية بالمستوى المطلوب", twoDaysAgo, 1, 1, "جيد", twoDaysAgo, 1, 1, yesterday]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss1b, "تركيب حديد الأساسات", "Install rebar", 1, 8000, 1, "تم تركيب الحديد 16مم", twoDaysAgo, 1, 1, "مطابق — قطر 16مم", yesterday, 1, 1, yesterday]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss1b, "صب الخرسانة", "Pour concrete", 2, 12000, 1, "صب خرسانة 350 كجم/م³", yesterday, 1, 1, "كثافة مطابقة", yesterday, 1, 1, now]);

  // ── Stage 2: Structure (ACTIVE) ──
  db.run("INSERT INTO stages (project_id, name_ar, name_en, order_num, budget, status) VALUES (?,?,?,?,?,?)",
    [proj1Id, "الهيكل الخرساني", "Structure", 2, 35000, "active"]);
  const s2 = lastId();

  db.run("INSERT INTO sub_stages (stage_id, name_ar, name_en, order_num) VALUES (?,?,?,?)", [s2, "الأعمدة", "Columns", 1]);
  const ss2a = lastId();
  db.run("INSERT INTO sub_stages (stage_id, name_ar, name_en, order_num) VALUES (?,?,?,?)", [s2, "السقف والأسطح", "Roof & Slabs", 2]);
  const ss2b = lastId();

  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss2a, "صب أعمدة الدور الأرضي", "Ground floor columns", 1, 8000, 1, "تم صب 12 عمود", yesterday, 1, 1, "مطابق — 12 عمود بمقاس 40×40", now, 0, 0, null]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss2a, "صب أعمدة الدور الأول", "First floor columns", 2, 8000, 1, "تم صب 12 عمود — الدور الأول", now, 0, 0, null, null, 0, 0, null]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss2b, "تركيب حديد السقف", "Install roof rebar", 1, 6000, 0, null, null, 0, 0, null, null, 0, 0, null]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss2b, "صب سقف الدور الأرضي", "Pour ground floor slab", 2, 7000, 0, null, null, 0, 0, null, null, 0, 0, null]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, text_en, order_num, cost, contractor_done, contractor_notes, contractor_date, inspector_done, inspector_approved, inspector_notes, inspector_date, owner_done, owner_approved, owner_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ss2b, "صب سقف الدور الأول", "Pour first floor slab", 3, 6000, 0, null, null, 0, 0, null, null, 0, 0, null]);

  // ── Stage 3-5: LOCKED ──
  db.run("INSERT INTO stages (project_id, name_ar, name_en, order_num, budget, status) VALUES (?,?,?,?,?,?)", [proj1Id, "الأعمال الكهربائية", "Electrical", 3, 18000, "locked"]);
  const s3 = lastId();
  db.run("INSERT INTO stages (project_id, name_ar, name_en, order_num, budget, status) VALUES (?,?,?,?,?,?)", [proj1Id, "السباكة والصرف", "Plumbing", 4, 15000, "locked"]);
  const s4 = lastId();
  db.run("INSERT INTO stages (project_id, name_ar, name_en, order_num, budget, status) VALUES (?,?,?,?,?,?)", [proj1Id, "التشطيبات والدهانات", "Finishing", 5, 27000, "locked"]);
  const s5 = lastId();

  db.run("INSERT INTO sub_stages (stage_id, name_ar, order_num) VALUES (?,?,?)", [s3, "التمديدات الكهربائية", 1]);
  const ss3a = lastId();
  db.run("INSERT INTO sub_stages (stage_id, name_ar, order_num) VALUES (?,?,?)", [s3, "لوحات الكهرباء", 2]);
  const ss3b = lastId();
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss3a, "تمديد أسلاك الدور الأرضي", 1, 4000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss3a, "تمديد أسلاك الدور الأول", 2, 4000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss3b, "تركيب لوحة التوزيع الرئيسية", 1, 5000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss3b, "تركيب نقاط الإنارة", 2, 5000]);

  db.run("INSERT INTO sub_stages (stage_id, name_ar, order_num) VALUES (?,?,?)", [s4, "التمديدات الصحية", 1]);
  const ss4a = lastId();
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss4a, "تمديد أنابيب المياه", 1, 5000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss4a, "تمديد أنابيب الصرف", 2, 5000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss4a, "تركيب الأدوات الصحية", 3, 5000]);

  db.run("INSERT INTO sub_stages (stage_id, name_ar, order_num) VALUES (?,?,?)", [s5, "البلاط والسيراميك", 1]);
  const ss5a = lastId();
  db.run("INSERT INTO sub_stages (stage_id, name_ar, order_num) VALUES (?,?,?)", [s5, "الدهانات", 2]);
  const ss5b = lastId();
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss5a, "بلاط الأرضيات", 1, 8000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss5a, "بلاط الجدران", 2, 5000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss5b, "معجون وتحضير الجدران", 1, 4000]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [ss5b, "الدهان النهائي", 2, 10000]);

  console.log("✅ Project 1 seeded (active villa with stages)");

  // ═══════════════════════════════════════════════
  // PROJECT 2: Awaiting pricing (has designs)
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO projects (title_ar, title_en, type, area_sqm, floors, location_ar, total_budget, status, has_designs, needs_design, description_ar, owner_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ["شقة الجفير", "Juffair Apartment", "apartment", 180, 1, "الجفير، المنامة", 45000,
     "awaiting_pricing", 1, 0, "شقة سكنية في منطقة الجفير — تشطيب فاخر", ownerId, weekAgo]);
  const proj2Id = lastId();

  // Quotations from contractors for project 2
  db.run("INSERT INTO quotations (project_id, contractor_id, price, duration_months, notes, breakdown, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
    [proj2Id, contractorId, 42000, 4, "نلتزم بالجودة العالية والتسليم في الموعد", '{"foundation":8000,"structure":14000,"electrical":6000,"plumbing":5000,"finishing":9000}', "pending", twoDaysAgo]);
  db.run("INSERT INTO quotations (project_id, contractor_id, price, duration_months, notes, breakdown, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
    [proj2Id, contractor2Id, 48000, 5, "نقدم ضمان 5 سنوات على جميع الأعمال", '{"foundation":9000,"structure":16000,"electrical":7000,"plumbing":6000,"finishing":10000}', "pending", yesterday]);

  // Inspector applications for project 2
  db.run("INSERT INTO inspector_applications (project_id, inspector_id, fee, notes, status, created_at) VALUES (?,?,?,?,?,?)",
    [proj2Id, inspectorId, 3000, "خبرة في مشاريع الشقق السكنية — 22 مشروع سابق", "pending", yesterday]);
  db.run("INSERT INTO inspector_applications (project_id, inspector_id, fee, notes, status, created_at) VALUES (?,?,?,?,?,?)",
    [proj2Id, inspector2Id, 2500, "متخصصة في فحص التشطيبات والأعمال الإنشائية", "pending", now]);

  console.log("✅ Project 2 seeded (awaiting pricing with quotations)");

  // ═══════════════════════════════════════════════
  // PROJECT 3: Design required (no designs)
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO projects (title_ar, title_en, type, area_sqm, floors, location_ar, total_budget, status, has_designs, needs_design, description_ar, owner_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ["بيت عائلي في سار", "Family Home in Saar", "villa", 350, 2, "سار، البحرين", 0,
     "design_required", 0, 1, "نريد بناء بيت عائلي — لا توجد مخططات بعد", ownerId, twoDaysAgo]);
  const proj3Id = lastId();

  // Auto-created design stage
  db.run("INSERT INTO stages (project_id, name_ar, name_en, order_num, budget, status) VALUES (?,?,?,?,?,?)",
    [proj3Id, "التصميم والمخططات", "Design & Plans", 0, 0, "active"]);
  const designStage = lastId();
  db.run("INSERT INTO sub_stages (stage_id, name_ar, name_en, order_num) VALUES (?,?,?,?)",
    [designStage, "التصميم المعماري", "Architectural Design", 1]);
  const designSub = lastId();
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [designSub, "إعداد المخططات المعمارية", 1, 0]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [designSub, "إعداد المخططات الإنشائية", 2, 0]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [designSub, "إعداد مخططات الكهرباء والسباكة", 3, 0]);
  db.run("INSERT INTO checklist_items (sub_stage_id, text_ar, order_num, cost) VALUES (?,?,?,?)", [designSub, "اعتماد المخططات النهائية", 4, 0]);

  console.log("✅ Project 3 seeded (design required with design stage)");

  // ═══════════════════════════════════════════════
  // PROJECT 4: COMPLETED (for achievements gallery)
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO projects (title_ar, title_en, type, area_sqm, floors, location_ar, total_budget, status, has_designs, needs_design, description_ar, owner_id, contractor_id, inspector_id, completed_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ["فيلا المنامة الفاخرة", "Luxury Manama Villa", "villa", 600, 3, "المنامة، البحرين", 250000,
     "completed", 1, 0, "فيلا فاخرة 3 أدوار مع مسبح وحديقة — مشروع منجز بالكامل",
     ownerId, contractorId, inspectorId, monthAgo, monthAgo]);
  const proj4Id = lastId();

  // Project images for achievements
  db.run("INSERT INTO project_images (project_id, image_url, caption_ar, is_primary) VALUES (?,?,?,?)",
    [proj4Id, "villa_manama_1.jpg", "الواجهة الأمامية", 1]);
  db.run("INSERT INTO project_images (project_id, image_url, caption_ar, is_primary) VALUES (?,?,?,?)",
    [proj4Id, "villa_manama_2.jpg", "المسبح والحديقة", 0]);

  db.run("INSERT INTO projects (title_ar, title_en, type, area_sqm, floors, location_ar, total_budget, status, has_designs, needs_design, description_ar, owner_id, contractor_id, inspector_id, completed_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ["مبنى تجاري — الحد", "Commercial Bldg — Hidd", "commercial", 1200, 4, "الحد، المحرق", 500000,
     "completed", 1, 0, "مبنى تجاري 4 أدوار — مكاتب ومحلات تجارية",
     ownerId, contractor2Id, inspector2Id, weekAgo, monthAgo]);
  const proj5Id = lastId();

  db.run("INSERT INTO project_images (project_id, image_url, caption_ar, is_primary) VALUES (?,?,?,?)",
    [proj5Id, "commercial_hidd_1.jpg", "المبنى التجاري — الواجهة", 1]);

  console.log("✅ Projects 4 & 5 seeded (completed — achievements gallery)");

  // ═══════════════════════════════════════════════
  // WALLET & TRANSACTIONS
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO wallets (user_id, balance, reserved, total_paid) VALUES (?,?,?,?)", [ownerId, 75000, 35000, 25000]);
  const walletId = lastId();

  db.run("INSERT INTO transactions (wallet_id, amount, type, description, description_ar, created_at) VALUES (?,?,?,?,?,?)",
    [walletId, 100000, "deposit", "Initial deposit via NBB", "إيداع أولي عبر بنك البحرين الوطني", weekAgo]);
  db.run("INSERT INTO transactions (wallet_id, amount, type, description, description_ar, created_at) VALUES (?,?,?,?,?,?)",
    [walletId, -3000, "payment", "Payment: Excavation", "دفع: حفر الأرض حسب المخططات", twoDaysAgo]);
  db.run("INSERT INTO transactions (wallet_id, amount, type, description, description_ar, created_at) VALUES (?,?,?,?,?,?)",
    [walletId, -2000, "payment", "Payment: Leveling", "دفع: تسوية الأرضية", twoDaysAgo]);
  db.run("INSERT INTO transactions (wallet_id, amount, type, description, description_ar, created_at) VALUES (?,?,?,?,?,?)",
    [walletId, -8000, "payment", "Payment: Rebar", "دفع: تركيب حديد الأساسات", yesterday]);
  db.run("INSERT INTO transactions (wallet_id, amount, type, description, description_ar, created_at) VALUES (?,?,?,?,?,?)",
    [walletId, -12000, "payment", "Payment: Concrete", "دفع: صب الخرسانة", now]);

  // Contractor earnings
  db.run("INSERT INTO contractor_earnings (contractor_id, project_id, amount, created_at) VALUES (?,?,?,?)", [contractorId, proj1Id, 3000, twoDaysAgo]);
  db.run("INSERT INTO contractor_earnings (contractor_id, project_id, amount, created_at) VALUES (?,?,?,?)", [contractorId, proj1Id, 2000, twoDaysAgo]);
  db.run("INSERT INTO contractor_earnings (contractor_id, project_id, amount, created_at) VALUES (?,?,?,?)", [contractorId, proj1Id, 8000, yesterday]);
  db.run("INSERT INTO contractor_earnings (contractor_id, project_id, amount, created_at) VALUES (?,?,?,?)", [contractorId, proj1Id, 12000, now]);

  console.log("✅ Wallet & earnings seeded");

  // ═══════════════════════════════════════════════
  // FINANCING APPLICATION
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO financing_applications (user_id, project_id, amount, bank, duration_months, notes, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
    [ownerId, proj2Id, 30000, "NBB", 12, "تمويل مشروع شقة الجفير", "pending", yesterday]);

  console.log("✅ Financing application seeded");

  // ═══════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [ownerId, "action", "بند بانتظار موافقتك", "صب أعمدة الدور الأرضي — تمت موافقة المفتش"]);
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [ownerId, "success", "تم صرف مستحقات", "صب الخرسانة — 12,000 د.ب"]);
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [ownerId, "info", "عرض سعر جديد", "تم استلام عرضي سعر لمشروع شقة الجفير"]);
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [ownerId, "info", "ترشيح مفتش", "مفتشان يرغبان بإدارة الجودة لمشروع الجفير"]);

  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [contractorId, "success", "تم استلام دفعة", "12,000 د.ب — صب الخرسانة"]);
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [contractorId, "info", "مشروع جديد متاح", "شقة الجفير — فرصة تسعير"]);

  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [inspectorId, "action", "بند جاهز للفحص", "صب أعمدة الدور الأول — الهيكل الخرساني"]);
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [inspectorId, "info", "مشروع جديد يحتاج مفتش", "شقة الجفير — فرصة ترشيح"]);

  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [contractor2Id, "info", "مشروع جديد متاح", "بيت عائلي في سار — فرصة تسعير"]);
  db.run("INSERT INTO notifications (user_id, type, title_ar, message_ar) VALUES (?,?,?,?)",
    [inspector2Id, "info", "مشروع جديد يحتاج مفتش", "بيت عائلي في سار"]);

  console.log("✅ Notifications seeded");

  // Save to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  db.close();

  console.log("\n🎉 Database seeded successfully! (v2.0)");
  console.log("   📧 Owner:        ahmed@example.com / 123456");
  console.log("   📧 Contractor 1: gulf@example.com / 123456");
  console.log("   📧 Contractor 2: modern@example.com / 123456");
  console.log("   📧 Inspector 1:  saeed@example.com / 123456");
  console.log("   📧 Inspector 2:  fatima@example.com / 123456\n");
  console.log("   📊 Projects: 5 (1 active, 1 awaiting pricing, 1 design required, 2 completed)");
  console.log("   🏆 Achievements Gallery: 2 completed projects\n");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
