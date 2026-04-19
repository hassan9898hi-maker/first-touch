import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Inbox, Wallet, ClipboardList, User, Coins, Trophy, HardHat, Building2, FileText, Search, BarChart3, FolderOpen, Clock, Construction, CheckCircle2, XCircle, Upload, Bell, Ruler, Layers, Zap, Droplets, Paintbrush, Building, Store, Lock, Handshake, Users, ArrowLeft, Plus, Settings, LogOut, Eye, Star, TrendingUp, Shield, Briefcase, MapPin, Calendar, ChevronRight, ChevronLeft, X, Package, Wrench, Hammer, CircleDollarSign, ScrollText, Send, ListChecks, BadgeCheck, AlertTriangle, Hospital, LayoutGrid, PenSquare, Repeat2 } from "lucide-react";

var BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api"
  : "https://first-touch2.onrender.com/api";
var ASSET_BASE = BASE.replace("/api", "");
function call(path, method, body, tkn) {
  var h = { "Content-Type": "application/json" };
  if (tkn) h["Authorization"] = "Bearer " + tkn;
  var o = { method: method || "GET", headers: h };
  if (body) o.body = JSON.stringify(body);
  return fetch(BASE + path, o).then(function (r) {
    if (!r.ok && r.status === 401) return { error: "جلسة منتهية — سجل دخول مرة أخرى" };
    return r.json();
  }).catch(function (e) {
    console.log("Network error:", e);
    return { error: "خطأ في الاتصال — تأكد من تشغيل السيرفر" };
  });
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.readAsDataURL(file);
  });
}

// ═══════ THEME — Ocean Blue-Grey Palette ═══════
var C = {
  navy: "#0A1628", ocean: "#2563EB", sky: "#60A5FA", amber: "#F59E0B",
  steel: "#475569", slate: "#94A3B8",
  green: "#10B981", red: "#EF4444", purple: "#8B5CF6", gold: "#F59E0B",
  bg: "#0F172A", card: "rgba(30,58,95,.45)", brd: "rgba(148,163,184,.18)", t1: "#E2E8F0", t2: "#94A3B8", t3: "#64748B",
  // gradient presets
  gNavy: "linear-gradient(135deg,#0A1628 0%,#1E3A5F 50%,#0F2847 100%)",
  gBlue: "linear-gradient(135deg,#1D4ED8 0%,#2563EB 50%,#3B82F6 100%)",
  gSteel: "linear-gradient(135deg,#334155 0%,#475569 100%)",
  gAmber: "linear-gradient(135deg,#D97706 0%,#F59E0B 100%)",
  gGreen: "linear-gradient(135deg,#059669 0%,#10B981 100%)",
  gGold: "linear-gradient(135deg,#B45309 0%,#F59E0B 100%)",
  // premium blue-grey
  glass: "rgba(30,58,95,.35)",
  glassBorder: "rgba(96,165,250,.15)",
  shadow: "0 4px 24px rgba(0,0,0,.2)",
  shadowLg: "0 12px 40px rgba(0,0,0,.3)",
  shadowBlue: "0 8px 32px rgba(37,99,235,.3)"
};

// ═══════ FRAMER MOTION VARIANTS ═══════
var fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } };
var fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } };
var stagger = { visible: { transition: { staggerChildren: 0.08 } } };
var scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } } };
var slideRight = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4 } } };

// ═══════ WHALE LOGO SVG — Realistic Blue Whale ═══════
function WhaleLogo({ size = 48 }) {
  var uid = useMemo(function(){ return "wl" + Math.random().toString(36).substring(2,8); }, []);
  return <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* ═══ TAIL — upper fluke rising up-right ═══ */}
    <path d="M148 88 Q152 58 164 34 Q176 16 186 22 Q190 38 178 60 Q168 80 156 96 Q150 100 148 88 Z" fill={"url(#"+uid+"tailDark)"} />
    {/* ═══ TAIL — lower fluke curving right ═══ */}
    <path d="M150 98 Q172 88 190 92 Q196 98 190 108 Q176 120 158 118 Q148 116 150 98 Z" fill={"url(#"+uid+"tailLight)"} />

    {/* ═══ MAIN BODY — clean bean/oval shape ═══ */}
    <path d="M40 95 C40 65 70 48 100 48 C135 48 160 70 160 95 C160 122 135 132 100 132 C65 132 40 122 40 95 Z" fill={"url(#"+uid+"body)"} />

    {/* ═══ DARK BACK — crescent only on top half ═══ */}
    <path d="M42 92 C45 62 72 48 100 48 C135 48 160 70 158 92 C140 82 118 76 100 76 C78 76 58 82 42 92 Z" fill={"url(#"+uid+"back)"} />

    {/* ═══ WHITE BELLY — wavy top edge is the visible separator ═══ */}
    <path d="M40 100 C58 94 78 92 98 94 C118 96 138 100 158 102 C156 122 132 132 100 132 C65 132 42 122 40 100 Z" fill={"url(#"+uid+"belly)"} />

    {/* ═══ PECTORAL FIN — rounded teardrop below body ═══ */}
    <path d="M95 120 Q82 138 66 144 Q58 144 62 134 Q72 122 86 116 Q94 114 95 120 Z" fill={"url(#"+uid+"fin)"} />

    {/* ═══ EYE — simple 3-layer circle ═══ */}
    <circle cx="64" cy="82" r="5" fill="#fff" />
    <circle cx="64" cy="82" r="3" fill="#0A1F3D" />
    <circle cx="65.2" cy="81" r="1" fill="#fff" />

    {/* ═══ TINY SMILE ═══ */}
    <path d="M50 94 Q48 97 51 98" stroke="#0A2847" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />

    <defs>
      {/* Main body — bright gradient blue */}
      <linearGradient id={uid+"body"} x1="40" y1="48" x2="160" y2="132">
        <stop offset="0%" stopColor="#5BAEF5" />
        <stop offset="45%" stopColor="#2E8AE6" />
        <stop offset="100%" stopColor="#1565C0" />
      </linearGradient>
      {/* Dark back crescent */}
      <linearGradient id={uid+"back"} x1="50" y1="48" x2="158" y2="92">
        <stop offset="0%" stopColor="#0D47A1" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
      {/* White belly */}
      <linearGradient id={uid+"belly"} x1="40" y1="94" x2="120" y2="132">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#E3F2FD" />
        <stop offset="100%" stopColor="#BBDEFB" />
      </linearGradient>
      {/* Tail dark fluke */}
      <linearGradient id={uid+"tailDark"} x1="150" y1="94" x2="184" y2="28">
        <stop offset="0%" stopColor="#2E8AE6" />
        <stop offset="50%" stopColor="#1565C0" />
        <stop offset="100%" stopColor="#0D47A1" />
      </linearGradient>
      {/* Tail light fluke */}
      <linearGradient id={uid+"tailLight"} x1="150" y1="98" x2="188" y2="112">
        <stop offset="0%" stopColor="#5BAEF5" />
        <stop offset="100%" stopColor="#1976D2" />
      </linearGradient>
      {/* Fin */}
      <linearGradient id={uid+"fin"} x1="88" y1="116" x2="68" y2="142">
        <stop offset="0%" stopColor="#1976D2" />
        <stop offset="100%" stopColor="#0D47A1" />
      </linearGradient>
    </defs>
  </svg>;
}

// ═══════ REUSABLE COMPONENTS ═══════
function Badge(p) {
  var m = { green: [C.green, "rgba(14,173,105,.1)"], amber: [C.amber, "rgba(232,114,12,.1)"], blue: [C.ocean, "rgba(26,111,181,.1)"], red: [C.red, "rgba(231,76,60,.1)"], purple: [C.purple, "rgba(124,58,237,.1)"], gold: [C.gold, "rgba(212,160,23,.12)"] };
  var s = m[p.c] || m.blue;
  return <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 700, color: s[0], background: s[1], whiteSpace: "nowrap" }}>{p.children}</span>;
}
function PB(p) {
  return <div style={{ height: 6, background: "#EDF2F7", borderRadius: 4, overflow: "hidden" }}>
    <motion.div initial={{ width: 0 }} animate={{ width: p.v + "%" }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ height: "100%", borderRadius: 4, background: p.c === "green" ? "linear-gradient(90deg,#059669,#10B981)" : p.c === "amber" ? "linear-gradient(90deg,#D97706,#F59E0B)" : "linear-gradient(90deg,#1D4ED8,#3B82F6)" }} />
  </div>;
}
function Btn(p) {
  var bgMap = {
    primary: C.gBlue,
    amber: C.gAmber,
    green: C.gGreen,
    red: "linear-gradient(135deg,#DC2626,#EF4444)",
    gold: C.gGold,
    outline: "transparent"
  };
  var bg = bgMap[p.v] || bgMap.primary;
  return <motion.button
    disabled={p.dis}
    onClick={p.onClick}
    whileHover={p.dis ? {} : { scale: 1.02, boxShadow: p.v === "outline" ? "0 2px 12px rgba(0,0,0,.08)" : "0 6px 20px rgba(37,99,235,.3)" }}
    whileTap={p.dis ? {} : { scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: p.sm ? "8px 14px" : "11px 20px",
      borderRadius: 12, fontFamily: "Tajawal", fontSize: p.sm ? 11 : 13, fontWeight: 700,
      border: p.v === "outline" ? "1.5px solid " + C.brd : "none",
      cursor: p.dis ? "not-allowed" : "pointer",
      background: bg, color: p.v === "outline" ? C.t2 : "#fff",
      width: p.f ? "100%" : "auto", opacity: p.dis ? 0.5 : 1,
      boxShadow: p.v === "outline" ? "none" : "0 4px 14px rgba(0,0,0,.12)",
      letterSpacing: 0.3
    }}>{p.loading ? "⏳" : p.children}</motion.button>;
}
function Inp(p) {
  var inputStyle = { width: "100%", padding: 10, border: "1.5px solid rgba(96,165,250,.2)", borderRadius: 8, fontFamily: "Tajawal", fontSize: 13, boxSizing: "border-box", background: "rgba(15,23,42,.6)", color: "#E2E8F0", outline: "none" };
  return <div style={{ marginBottom: 12 }}>
    {p.label && <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", marginBottom: 4 }}>{p.label}</div>}
    {p.type === "select"
      ? <select value={p.value} onChange={p.onChange} style={{ ...inputStyle, direction: "rtl" }}>{(p.opts||[]).map(function (o) { return <option key={o.v} value={o.v}>{o.l}</option>; })}</select>
      : p.type === "textarea"
        ? <textarea value={p.value} onChange={p.onChange} placeholder={p.ph} rows={p.rows || 3} style={{ ...inputStyle, fontSize: 12, direction: "rtl", resize: "vertical" }} />
        : <input type={p.type || "text"} value={p.value} onChange={p.onChange} placeholder={p.ph} style={inputStyle} />}
  </div>;
}
function Card(p) {
  return <motion.div
    onClick={p.onClick}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    whileHover={p.onClick ? { y: -2, boxShadow: "0 8px 30px rgba(13,27,42,.12)" } : {}}
    whileTap={p.onClick ? { scale: 0.985 } : {}}
    style={{
      background: C.card,
      border: "1px solid " + (p.bc || C.brd),
      borderRadius: 16, padding: p.p || 16, marginBottom: p.mb || 10,
      cursor: p.onClick ? "pointer" : "default",
      boxShadow: C.shadow,
      transition: "border-color 0.2s",
      ...p.sx
    }}>{p.children}</motion.div>;
}
function StatCard(p) {
  return <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(37,99,235,.15)" }}
    style={{
      background: "rgba(30,58,95,.4)",
      border: "1px solid rgba(96,165,250,.12)", borderRadius: 18, padding: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,.2)",
      position: "relative", overflow: "hidden",
      backdropFilter: "blur(12px)"
    }}>
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: (p.cl || C.ocean) + "12", pointerEvents: "none" }} />
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: "linear-gradient(135deg," + (p.cl || C.ocean) + "20," + (p.cl || C.ocean) + "35)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10,
      color: p.cl || C.ocean
    }}>{p.ic}</div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900, color: p.cl || C.ocean, letterSpacing: -0.5 }}>{p.v}</div>
    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3, fontWeight: 500 }}>{p.l}</div>
  </motion.div>;
}
function SectionTitle(p) {
  return <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 800, marginBottom: 8, marginTop: p.mt || 0, display: "flex", alignItems: "center", gap: 6 }}>{p.ic} {p.children}</div>;
}

// ═══════ ANNOUNCEMENT BANNER — Banks, Top Companies, Top Inspectors ═══════
var BANNER_ADS = {
  ar: [
    { ic: <Construction size={22} color="#fff" />, cat: "مقاول معتمد", title: "Dr Quality Constructions", sub: "سجل تجاري 117102-02 — مقاولات عامة وتشطيبات متكاملة في مملكة البحرين", bg: "linear-gradient(135deg,#0D47A1,#1565C0)", accent: "#42A5F5" },
    { ic: <ScrollText size={22} color="#fff" />, cat: "FIRST TOUCH", title: "اتفاقيات رقمية بين المالك والمقاول", sub: "عقود إلكترونية موثقة — متابعة مراحل العمل والدفعات بشفافية تامة", bg: "linear-gradient(135deg,#0A2647,#154B8A)", accent: "#64B5F6" },
    { ic: <Shield size={22} color="#fff" />, cat: "FIRST TOUCH", title: "حماية حقوق الطرفين", sub: "نظام موافقات متعدد المراحل — لا يتم الصرف إلا بعد اعتماد العمل المنجز", bg: "linear-gradient(135deg,#087A44,#0EAD69)", accent: "#81C784" },
    { ic: <BarChart3 size={22} color="#fff" />, cat: "FIRST TOUCH", title: "تتبع المشروع لحظة بلحظة", sub: "873 بند عمل مقسّم على 45 منطقة — متابعة تقدم كل مرحلة بالتفصيل", bg: "linear-gradient(135deg,#7A3000,#E8720C)", accent: "#FFB74D" },
    { ic: <Hospital size={22} color="#fff" />, cat: "مشروع جاري", title: "مركز د. نجيب أبو بكر الطبي", sub: "السيف، مملكة البحرين — تجديد وتشطيب شامل بقيمة 97,360 د.ب", bg: "linear-gradient(135deg,#6B4A00,#D4A017)", accent: "#FFD54F" },
    { ic: <Handshake size={22} color="#fff" />, cat: "قريباً", title: "مساحة إعلانية للشركات المتميزة", sub: "سجّل شركتك على FIRST TOUCH واحصل على ظهور مميز للعملاء المحتملين", bg: "linear-gradient(135deg,#4A1490,#7C3AED)", accent: "#CE93D8" },
  ],
  en: [
    { ic: <Construction size={22} color="#fff" />, cat: "Licensed Contractor", title: "Dr Quality Constructions", sub: "CR 117102-02 — General contracting & full finishing in Bahrain", bg: "linear-gradient(135deg,#0D47A1,#1565C0)", accent: "#42A5F5" },
    { ic: <ScrollText size={22} color="#fff" />, cat: "FIRST TOUCH", title: "Digital Agreements", sub: "Verified e-contracts — Track work stages & payments with full transparency", bg: "linear-gradient(135deg,#0A2647,#154B8A)", accent: "#64B5F6" },
    { ic: <Shield size={22} color="#fff" />, cat: "FIRST TOUCH", title: "Protecting Both Parties", sub: "Multi-stage approval system — No payment released until work is verified", bg: "linear-gradient(135deg,#087A44,#0EAD69)", accent: "#81C784" },
    { ic: <BarChart3 size={22} color="#fff" />, cat: "FIRST TOUCH", title: "Real-Time Project Tracking", sub: "873 work items across 45 zones — Monitor every stage in detail", bg: "linear-gradient(135deg,#7A3000,#E8720C)", accent: "#FFB74D" },
    { ic: <Hospital size={22} color="#fff" />, cat: "Active Project", title: "Dr. Najeeb Abu Bakr Medical Center", sub: "Al Seef, Bahrain — Full renovation & finishing worth 97,360 BHD", bg: "linear-gradient(135deg,#6B4A00,#D4A017)", accent: "#FFD54F" },
    { ic: <Handshake size={22} color="#fff" />, cat: "Coming Soon", title: "Ad Space for Top Companies", sub: "Register on FIRST TOUCH and get premium visibility for potential clients", bg: "linear-gradient(135deg,#4A1490,#7C3AED)", accent: "#CE93D8" },
  ]
};

var AnnouncementBanner = memo(function AnnouncementBanner(props) {
  var bannerLang = props.lang || "ar";
  var ads = BANNER_ADS[bannerLang] || BANNER_ADS.ar;
  var [idx, setIdx] = useState(0);
  var [prev, setPrev] = useState(null);
  var [sliding, setSliding] = useState(false);

  useEffect(function() {
    var t = setInterval(function() {
      setSliding(true);
      setTimeout(function() {
        setIdx(function(i) {
          var next = (i + 1) % ads.length;
          setPrev(i);
          return next;
        });
        setSliding(false);
      }, 280);
    }, 6000);
    return function() { clearInterval(t); };
  }, [bannerLang]);

  var ad = ads[idx % ads.length];
  var catColors = { "بنوك": "#42A5F5", "شركات": "#FFB74D", "مشرفون": "#81C784", "Licensed Contractor": "#42A5F5", "Active Project": "#FFD54F", "Coming Soon": "#CE93D8" };

  return <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14, position: "relative", boxShadow: "0 6px 20px rgba(13,27,42,.18)" }}>
    <div style={{
      background: ad.bg, padding: "13px 15px",
      opacity: sliding ? 0 : 1, transition: "opacity 0.28s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Icon circle */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(255,255,255,.18)",
          border: "1px solid rgba(255,255,255,.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0
        }}>{ad.ic}</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: ad.accent, background: "rgba(255,255,255,.15)", padding: "2px 7px", borderRadius: 8, letterSpacing: 0.5 }}>{ad.cat}</span>
          </div>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{ad.title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", marginTop: 2, lineHeight: 1.4 }}>{ad.sub}</div>
        </div>

        {/* Arrow */}
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 11 }}>←</span>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 10 }}>
        {ads.map(function(_, i) {
          return <div key={i} style={{
            height: 4, borderRadius: 2,
            width: i === idx ? 18 : 5,
            background: i === idx ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.3)",
            transition: "all 0.3s ease"
          }} />;
        })}
      </div>
    </div>
  </div>;
});

// ═══════ NEW PROJECT FORM — 5 Steps with build stage selector ═══════
var BUILD_STAGES = [
  { v: "design",      i: <Ruler size={20} color="#2563EB" />, l: "مرحلة التصميم",       d: "لم يبدأ البناء بعد",             hasDesigns: false },
  { v: "foundation",  i: <Construction size={20} color="#2563EB" />, l: "الأساسات والقواعد",   d: "جاهز للبدء أو في مرحلة الأساس",  hasDesigns: true },
  { v: "structure",   i: <Layers size={20} color="#2563EB" />, l: "الهيكل الخرساني",     d: "الجدران والأعمدة والسقف",          hasDesigns: true },
  { v: "electrical",  i: <Zap size={20} color="#F59E0B" />, l: "الأعمال الكهربائية",  d: "تمديدات كهرباء وإنارة",           hasDesigns: true },
  { v: "plumbing",    i: <Droplets size={20} color="#3B82F6" />, l: "السباكة والصرف",      d: "تمديدات المياه والصرف الصحي",      hasDesigns: true },
  { v: "finishing",   i: <Paintbrush size={20} color="#8B5CF6" />, l: "التشطيبات",           d: "دهانات وسيراميك ونجارة",          hasDesigns: true },
];
var PROJECT_TYPES = [
  { v: "villa",       i: <Home size={20} color="#2563EB" />, l: "فيلا",         d: "منزل مستقل بحديقة" },
  { v: "apartment",   i: <Building size={20} color="#2563EB" />, l: "شقة سكنية",    d: "وحدة في عمارة أو مجمع" },
  { v: "commercial",  i: <Store size={20} color="#2563EB" />, l: "تجاري",        d: "محل، مكتب، مبنى تجاري" },
  { v: "residential", i: <Building2 size={20} color="#2563EB" />, l: "سكني مجمع",   d: "عمارة أو مجمع سكني" },
];

var NewProjectForm = memo(function NewProjectForm({ onSubmit, onClose }) {
  var [step, setStep] = useState(0);
  var [type, setType] = useState("villa");
  var [buildStage, setBuildStage] = useState("design");
  var [hasDesigns, setHasDesigns] = useState(true);
  var [title, setTitle] = useState("");
  var [area, setArea] = useState("");
  var [floors, setFloors] = useState("1");
  var [loc, setLoc] = useState("");
  var [desc, setDesc] = useState("");
  var [conditions, setConditions] = useState("");
  var [budget, setBudget] = useState("");
  var [files, setFiles] = useState([]);
  var [showToast, setShowToast] = useState("");

  function warn(m) { setShowToast(m); setTimeout(function () { setShowToast(""); }, 2500); }

  function selectBuildStage(sv) {
    setBuildStage(sv);
    var found = BUILD_STAGES.find(function(s) { return s.v === sv; });
    if (found) setHasDesigns(found.hasDesigns);
  }

  function submit() {
    if (!title.trim()) { warn("❌ اسم المشروع مطلوب"); return; }
    onSubmit({
      titleAr: title, type, areaSqm: Number(area) || 0, floors: Number(floors) || 1,
      locationAr: loc, descriptionAr: desc, totalBudget: Number(budget) || 0,
      hasDesigns, currentStage: buildStage, ownerConditions: conditions || null, files
    });
  }

  var totalSteps = 5;
  var curStageInfo = BUILD_STAGES.find(function(s) { return s.v === buildStage; }) || BUILD_STAGES[0];

  return <div>
    {showToast && <div style={{ background: C.red, color: "#fff", padding: "8px 14px", borderRadius: 8, marginBottom: 10, fontSize: 12, fontWeight: 700 }}>{showToast}</div>}

    {/* Step indicator */}
    <div style={{ display: "flex", gap: 3, marginBottom: 16, justifyContent: "center" }}>
      {[0,1,2,3,4].map(function (s) {
        return <div key={s} style={{ width: step === s ? 32 : 8, height: 5, borderRadius: 3, background: step >= s ? C.ocean : "#DDE2EB", transition: "all 0.3s" }} />;
      })}
    </div>

    {/* ── Step 0: Project Type ── */}
    {step === 0 && <div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>🏠 نوع المشروع</div>
      <div style={{ fontSize: 10, color: C.t3, marginBottom: 16 }}>الخطوة 1 من 5 — اختر نوع المبنى</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {PROJECT_TYPES.map(function(pt) {
          var sel = type === pt.v;
          return <div key={pt.v} onClick={function() { setType(pt.v); }} style={{ padding: 14, border: "2px solid " + (sel ? C.ocean : C.brd), borderRadius: 12, textAlign: "center", cursor: "pointer", background: sel ? "rgba(26,111,181,.07)" : "#fff", transition: "all .2s" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{pt.i}</div>
            <div style={{ fontSize: 12, fontWeight: sel ? 800 : 600, color: sel ? C.ocean : C.t1 }}>{pt.l}</div>
            <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{pt.d}</div>
          </div>;
        })}
      </div>
      <Btn f onClick={function() { setStep(1); }}>التالي ←</Btn>
    </div>}

    {/* ── Step 1: Build Stage ── */}
    {step === 1 && <div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>🏗️ مرحلة البناء</div>
      <div style={{ fontSize: 10, color: C.t3, marginBottom: 14 }}>الخطوة 2 من 5 — في أي مرحلة وصل مشروعك؟</div>

      {/* Timeline strip */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <div style={{ position: "absolute", top: 22, left: 20, right: 20, height: 2, background: C.brd, zIndex: 0 }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          {BUILD_STAGES.map(function(bs) {
            var sel = buildStage === bs.v;
            var idx = BUILD_STAGES.findIndex(function(x) { return x.v === buildStage; });
            var bsIdx = BUILD_STAGES.findIndex(function(x) { return x.v === bs.v; });
            var passed = bsIdx < idx;
            return <div key={bs.v} onClick={function() { selectBuildStage(bs.v); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", width: 44 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + (sel ? C.ocean : passed ? C.green : C.brd), background: sel ? C.ocean : passed ? "rgba(14,173,105,.1)" : "#fff", transition: "all .2s" }}>{bs.i}</div>
              <div style={{ fontSize: 8, color: sel ? C.ocean : C.t3, fontWeight: sel ? 700 : 400, marginTop: 4, textAlign: "center", width: 44 }}>{bs.l.split(" ")[0]}</div>
            </div>;
          })}
        </div>
      </div>

      {/* Selected stage info */}
      <div style={{ background: "rgba(26,111,181,.06)", border: "1.5px solid " + C.ocean, borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ocean }}>{curStageInfo.i} {curStageInfo.l}</div>
        <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{curStageInfo.d}</div>
      </div>

      {/* If design stage → ask about designs */}
      {buildStage === "design" && <div style={{ background: "rgba(232,114,12,.05)", border: "1px solid rgba(232,114,12,.25)", borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 8 }}>هل لديك مخططات جاهزة؟</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div onClick={function() { setHasDesigns(true); }} style={{ flex: 1, padding: 10, border: "2px solid " + (hasDesigns ? C.ocean : C.brd), borderRadius: 8, textAlign: "center", cursor: "pointer", background: hasDesigns ? "rgba(26,111,181,.08)" : "#fff" }}>
            <div style={{ fontSize: 18 }}>✅</div>
            <div style={{ fontSize: 10, fontWeight: hasDesigns ? 700 : 400, color: hasDesigns ? C.ocean : C.t2 }}>نعم، لدي مخططات</div>
            <div style={{ fontSize: 9, color: C.t3 }}>أريد تسعيرات للبناء</div>
          </div>
          <div onClick={function() { setHasDesigns(false); }} style={{ flex: 1, padding: 10, border: "2px solid " + (!hasDesigns ? C.amber : C.brd), borderRadius: 8, textAlign: "center", cursor: "pointer", background: !hasDesigns ? "rgba(232,114,12,.06)" : "#fff" }}>
            <div style={{ fontSize: 18 }}>📐</div>
            <div style={{ fontSize: 10, fontWeight: !hasDesigns ? 700 : 400, color: !hasDesigns ? C.amber : C.t2 }}>لا، أحتاج تصميم</div>
            <div style={{ fontSize: 9, color: C.t3 }}>أريد مصمماً أولاً</div>
          </div>
        </div>
      </div>}

      {buildStage !== "design" && <div style={{ background: "rgba(14,173,105,.06)", border: "1px solid rgba(14,173,105,.2)", borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 11, color: C.green }}>
        ✅ ممتاز — سيتم فتح باب تسعيرات من مرحلة <strong>{curStageInfo.l}</strong> للأمام
      </div>}

      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="outline" onClick={function() { setStep(0); }}>→ رجوع</Btn>
        <Btn f onClick={function() { setStep(2); }}>التالي ←</Btn>
      </div>
    </div>}

    {/* ── Step 2: Project Details ── */}
    {step === 2 && <div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>📋 تفاصيل المشروع</div>
      <div style={{ fontSize: 10, color: C.t3, marginBottom: 14 }}>الخطوة 3 من 5</div>
      <Inp label="اسم المشروع *" value={title} onChange={function (e) { setTitle(e.target.value); }} ph="فيلا سار، عمارة المحرق..." />
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Inp label="المساحة (م²)" type="number" value={area} onChange={function (e) { setArea(e.target.value); }} ph="350" /></div>
        <div style={{ flex: 1 }}><Inp label="عدد الأدوار" type="number" value={floors} onChange={function (e) { setFloors(e.target.value); }} /></div>
      </div>
      <Inp label="الموقع" value={loc} onChange={function (e) { setLoc(e.target.value); }} ph="سار، البحرين" />
      <Inp label="الميزانية التقديرية (د.ب)" type="number" value={budget} onChange={function (e) { setBudget(e.target.value); }} ph="120000" />
      <Inp label="وصف المشروع والمتطلبات" type="textarea" value={desc} onChange={function (e) { setDesc(e.target.value); }} ph="تفاصيل المشروع والمتطلبات الخاصة..." />
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="outline" onClick={function () { setStep(1); }}>→ رجوع</Btn>
        <Btn f onClick={function () { if (!title.trim()) { warn("❌ اسم المشروع مطلوب"); return; } setStep(3); }}>التالي ←</Btn>
      </div>
    </div>}

    {/* ── Step 3: Owner Conditions ── */}
    {step === 3 && <div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>📜 شروط المالك</div>
      <div style={{ fontSize: 10, color: C.t3, marginBottom: 14 }}>الخطوة 4 من 5 — ستُرسل مع العرض للمقاولين</div>
      <div style={{ background: "rgba(232,114,12,.06)", border: "1px solid rgba(232,114,12,.2)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 4 }}>💡 اكتب شروطك الخاصة</div>
        <div style={{ fontSize: 10, color: C.t2 }}>هذه الشروط ستُضاف إلى العقد ويطلع عليها المقاولون قبل تقديم عروضهم</div>
      </div>
      <Inp label="شروط صاحب المشروع" type="textarea" value={conditions} onChange={function (e) { setConditions(e.target.value); }} ph={"مثال:\n- استخدام مواد موافق عليها من المالك فقط\n- الالتزام الكامل بالجداول الزمنية\n- تنظيف الموقع يومياً\n- عدم التعاقد من الباطن بدون موافقة مسبقة"} rows={6} />
      <div style={{ background: "rgba(26,111,181,.06)", border: "1px solid rgba(26,111,181,.15)", borderRadius: 8, padding: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.ocean, marginBottom: 4 }}>🔒 شروط المنصة (تُضاف تلقائياً)</div>
        <ul style={{ fontSize: 10, color: C.t2, margin: 0, paddingRight: 16, lineHeight: 1.8 }}>
          <li>توثيق مراحل التنفيذ بالصور والفيديو</li>
          <li>المدفوعات عبر المحفظة الضامنة فقط</li>
          <li>اعتماد المفتش قبل صرف أي دفعة</li>
          <li>المالك يملك حق الموافقة النهائية</li>
        </ul>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="outline" onClick={function () { setStep(2); }}>→ رجوع</Btn>
        <Btn f onClick={function () { setStep(4); }}>التالي ←</Btn>
      </div>
    </div>}

    {/* ── Step 4: Files & Review ── */}
    {step === 4 && <div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>📁 ملفات ومراجعة</div>
      <div style={{ fontSize: 10, color: C.t3, marginBottom: 14 }}>الخطوة 5 من 5 — الخطوة الأخيرة</div>
      <FileUploader label="📁 مخططات، تصاميم، مستندات المشروع" onChange={function (f) { setFiles(f); }} />
      <div style={{ border: "1.5px solid " + C.brd, borderRadius: 10, padding: 12, marginBottom: 12, background: "#FAFBFD" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 10 }}>📋 ملخص الطلب</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>{PROJECT_TYPES.find(function(p){return p.v===type;})?.i}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.t1 }}>{title}</div>
            <div style={{ fontSize: 10, color: C.t3 }}>{PROJECT_TYPES.find(function(p){return p.v===type;})?.l}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {loc && <span style={{ fontSize: 10, background: "#EEF2F8", padding: "3px 8px", borderRadius: 8, color: C.t2 }}>📍 {loc}</span>}
          {area && <span style={{ fontSize: 10, background: "#EEF2F8", padding: "3px 8px", borderRadius: 8, color: C.t2 }}>📐 {area} م²</span>}
          {floors && <span style={{ fontSize: 10, background: "#EEF2F8", padding: "3px 8px", borderRadius: 8, color: C.t2 }}>{floors} أدوار</span>}
          {budget && <span style={{ fontSize: 10, background: "rgba(232,114,12,.1)", padding: "3px 8px", borderRadius: 8, color: C.amber, fontWeight: 700 }}>💰 {Number(budget).toLocaleString()} د.ب</span>}
        </div>
        <div style={{ marginTop: 8, padding: "6px 10px", background: curStageInfo.hasDesigns ? "rgba(14,173,105,.08)" : "rgba(232,114,12,.08)", borderRadius: 8, fontSize: 10, color: curStageInfo.hasDesigns ? C.green : C.amber }}>
          {curStageInfo.i} المرحلة الحالية: <strong>{curStageInfo.l}</strong> — {hasDesigns ? "✅ لديه مخططات" : "📐 يحتاج تصميم"}
        </div>
      </div>
      <div style={{ background: "rgba(14,173,105,.06)", border: "1px solid rgba(14,173,105,.2)", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 10, color: C.green }}>
        ⚡ سيتم إشعار جميع المقاولين والمشرفين فوراً عبر الإشعارات والبريد الإلكتروني
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="outline" onClick={function () { setStep(3); }}>→ رجوع</Btn>
        <Btn f onClick={submit}>🚀 رفع الطلب وإشعار المقاولين</Btn>
      </div>
    </div>}
  </div>;
});

// ═══════ AI SMART PROJECT UPLOAD — analyzes files with AI ═══════
var AIProjectUpload = memo(function AIProjectUpload({ onCreated, onClose, token }) {
  var [step, setStep] = useState(0); // 0=upload, 1=analyzing, 2=review, 3=creating
  var [file, setFile] = useState(null);
  var [fileName, setFileName] = useState("");
  var [desc, setDesc] = useState("");
  var [goals, setGoals] = useState("");
  var [analysis, setAnalysis] = useState(null);
  var [matched, setMatched] = useState([]);
  var [error, setError] = useState("");
  var [expandedStage, setExpandedStage] = useState(null);
  var fileRef = useRef();

  function handleFile(e) {
    var f = e.target.files[0];
    if (f) {
      setFile(f);
      setFileName(f.name);
    }
  }

  function doAnalyze() {
    // File is MANDATORY — all project data comes from real uploaded files
    if (!file) { setError("يجب رفع ملف المشروع (PDF أو Word) يحتوي على جدول الكميات — لا يمكن إنشاء مشروع بدون ملف حقيقي"); return; }
    if (!desc.trim()) { setError("يرجى كتابة وصف مختصر للمشروع"); return; }
    setError("");
    setStep(1);

    var formData = new FormData();
    formData.append("file", file);
    formData.append("description", desc);
    formData.append("goals", goals);

    fetch(BASE + "/projects/ai-analyze", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.success) {
        setAnalysis(d.analysis);
        setMatched(d.matchedContractors || []);
        setStep(2);
      } else {
        setError(d.error || "فشل التحليل");
        setStep(0);
      }
    }).catch(function () {
      setError("خطأ في الاتصال بالخادم");
      setStep(0);
    });
  }

  function doCreate() {
    setStep(3);
    call("/projects/ai-create", "POST", { analysis: analysis }, token).then(function (d) {
      if (d.success) {
        onCreated(d.project_id);
      } else {
        setError(d.error || "فشل إنشاء المشروع");
        setStep(2);
      }
    });
  }

  // ── Step 0: Upload & Describe ──
  if (step === 0) return <div>
    <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", borderRadius: 14, padding: "16px 18px", marginBottom: 16, color: "#fff" }}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 17, fontWeight: 900, marginBottom: 4 }}>🤖 رفع مشروع ذكي</div>
      <div style={{ fontSize: 11, opacity: 0.8 }}>ارفع ملف المشروع واكتب وصفك — الذكاء الاصطناعي سيحلل ويقسّم المراحل تلقائياً</div>
    </div>

    {error && <div style={{ background: "rgba(231,76,60,.1)", border: "1px solid rgba(231,76,60,.3)", color: C.red, padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontSize: 11, fontWeight: 700 }}>{error}</div>}

    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 6 }}>📁 ملف المشروع * <span style={{ color: C.red, fontSize: 9 }}>(مطلوب — PDF أو Word يحتوي على جدول الكميات)</span></div>
      <div onClick={function () { fileRef.current.click(); }} style={{ border: "2px dashed " + (file ? C.purple : C.brd), borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", background: file ? "rgba(124,58,237,.04)" : "#FAFBFD", transition: "all .2s" }}>
        {file ? <div>
          <div style={{ fontSize: 28, marginBottom: 4 }}>📄</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.purple }}>{fileName}</div>
          <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>اضغط لتغيير الملف</div>
        </div> : <div>
          <div style={{ fontSize: 32, marginBottom: 4 }}>📁</div>
          <div style={{ fontSize: 12, color: C.t2, fontWeight: 600 }}>اضغط لاختيار ملف المشروع</div>
          <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>PDF, DOCX — جدول كميات، مواصفات، عرض سعر</div>
        </div>}
      </div>
      <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" onChange={handleFile} style={{ display: "none" }} />
    </div>

    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 4 }}>📝 وصف المشروع *</div>
      <textarea value={desc} onChange={function (e) { setDesc(e.target.value); }} placeholder={"اشرح المشروع بالتفصيل...\nمثال: مركز طبي في الزنج يشمل أعمال بناء وتشطيب وكهرباء وتكييف"} rows={4} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.brd, borderRadius: 10, fontSize: 12, fontFamily: "Cairo, sans-serif", resize: "vertical", boxSizing: "border-box", direction: "rtl" }} />
    </div>

    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 4 }}>🎯 الهدف من المشروع</div>
      <textarea value={goals} onChange={function (e) { setGoals(e.target.value); }} placeholder={"ما هو الهدف؟ ما الذي تبحث عنه؟\nمثال: أريد مقاول متخصص في المنشآت الطبية بأسعار تنافسية وضمان سنة"} rows={3} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.brd, borderRadius: 10, fontSize: 12, fontFamily: "Cairo, sans-serif", resize: "vertical", boxSizing: "border-box", direction: "rtl" }} />
    </div>

    <div style={{ background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 10, color: C.purple, lineHeight: 1.6 }}>
      🤖 النظام يقرأ الملف المرفوع مباشرةً ويستخرج:<br/>
      ✓ بنود جدول الكميات (BOQ) الحقيقية من الملف<br/>
      ✓ تقسيم المراحل حسب البنود الفعلية في الملف<br/>
      ✓ الميزانية = مجموع أسعار البنود الحقيقية<br/>
      ✓ ترشيح المقاولين بناءً على تخصصات المشروع الفعلية
    </div>

    <Btn f onClick={doAnalyze} style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}>🤖 تحليل بالذكاء الاصطناعي</Btn>
  </div>;

  // ── Step 1: Analyzing ──
  if (step === 1) return <div style={{ textAlign: "center", padding: "40px 20px" }}>
    <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🤖</div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, color: C.purple, marginBottom: 8 }}>جاري التحليل بالذكاء الاصطناعي...</div>
    <div style={{ fontSize: 11, color: C.t3, marginBottom: 20 }}>يتم تحليل الملف واستخراج المراحل وتقدير التكاليف</div>
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {["📄 قراءة الملف", "🔍 تحليل البنود", "📊 تقسيم المراحل", "👷 ترشيح المقاولين"].map(function (s, i) {
        return <div key={i} style={{ fontSize: 9, padding: "4px 8px", background: "rgba(124,58,237,.08)", borderRadius: 6, color: C.purple, animation: "pulse 1.5s infinite " + (i * 0.3) + "s" }}>{s}</div>;
      })}
    </div>
    <style>{"{@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }}"}</style>
  </div>;

  // ── Step 2: Review Analysis ──
  if (step === 2 && analysis) return <div>
    <div style={{ background: "linear-gradient(135deg, #087A44, #0EAD69)", borderRadius: 14, padding: "14px 18px", marginBottom: 14, color: "#fff" }}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 900, marginBottom: 2 }}>✅ تم تحليل المشروع بنجاح</div>
      <div style={{ fontSize: 10, opacity: 0.8 }}>{analysis.summary}</div>
    </div>

    {error && <div style={{ background: "rgba(231,76,60,.1)", color: C.red, padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontSize: 11 }}>{error}</div>}

    {/* Project Info Card */}
    <div style={{ border: "1.5px solid " + C.brd, borderRadius: 12, padding: 14, marginBottom: 12, background: "#FAFBFD" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.t1, marginBottom: 8 }}>{analysis.projectName}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {analysis.location && <span style={{ fontSize: 10, background: "#EEF2F8", padding: "3px 8px", borderRadius: 8, color: C.t2 }}>📍 {analysis.location}</span>}
        {analysis.areaSqm > 0 && <span style={{ fontSize: 10, background: "#EEF2F8", padding: "3px 8px", borderRadius: 8, color: C.t2 }}>📐 {analysis.areaSqm} م²</span>}
        {analysis.floors > 0 && <span style={{ fontSize: 10, background: "#EEF2F8", padding: "3px 8px", borderRadius: 8, color: C.t2 }}>🏢 {analysis.floors} أدوار</span>}
        <span style={{ fontSize: 10, background: "rgba(232,114,12,.1)", padding: "3px 8px", borderRadius: 8, color: C.amber, fontWeight: 700 }}>💰 {(analysis.estimatedBudget || 0).toLocaleString()} د.ب</span>
      </div>
      {analysis.description && <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.7 }}>{analysis.description}</div>}
    </div>

    {/* Stages */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, marginBottom: 8 }}>📊 المراحل ({(analysis.stages || []).length} مراحل)</div>
      {(analysis.stages || []).map(function (stg, si) {
        var isOpen = expandedStage === si;
        var stgBudget = Math.round((analysis.estimatedBudget || 0) * (stg.budgetPercent || 0));
        var totalItems = (stg.subStages || []).reduce(function (acc, ss) { return acc + (ss.items || []).length; }, 0);
        return <div key={si} style={{ border: "1.5px solid " + (isOpen ? C.ocean : C.brd), borderRadius: 10, marginBottom: 8, overflow: "hidden", transition: "all .2s" }}>
          <div onClick={function () { setExpandedStage(isOpen ? null : si); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", background: isOpen ? "rgba(26,111,181,.05)" : "#fff" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: isOpen ? C.ocean : "#EEF2F8", color: isOpen ? "#fff" : C.t2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{stg.order || si + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{stg.nameAr}</div>
              <div style={{ fontSize: 9, color: C.t3 }}>{stg.nameEn} • {totalItems} بنود • {stgBudget.toLocaleString()} د.ب</div>
            </div>
            <div style={{ fontSize: 10, color: C.ocean, fontWeight: 700 }}>{Math.round((stg.budgetPercent || 0) * 100)}%</div>
            <div style={{ fontSize: 12, color: C.t3, transform: isOpen ? "rotate(180deg)" : "", transition: "transform .2s" }}>▼</div>
          </div>
          {isOpen && <div style={{ padding: "0 12px 10px", borderTop: "1px solid " + C.brd }}>
            {(stg.subStages || []).map(function (ss, ssi) {
              return <div key={ssi} style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.ocean, marginBottom: 4 }}>{ss.nameAr}</div>
                {(ss.items || []).map(function (item, ii) {
                  return <div key={ii} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: ii % 2 === 0 ? "#F8FAFD" : "#fff", borderRadius: 4, marginBottom: 2 }}>
                    <div style={{ flex: 1, fontSize: 10, color: C.t2 }}>{item.textAr}</div>
                    {item.quantity > 0 && <span style={{ fontSize: 9, color: C.t3 }}>{item.quantity} {item.unit}</span>}
                    {item.estimatedCost > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: C.amber }}>{item.estimatedCost.toLocaleString()} د.ب</span>}
                  </div>;
                })}
              </div>;
            })}
          </div>}
        </div>;
      })}
    </div>

    {/* Matched Contractors */}
    {matched.length > 0 && <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, marginBottom: 8 }}>👷 المقاولون المرشحون ({matched.length})</div>
      {matched.map(function (c) {
        return <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid " + C.brd, borderRadius: 10, marginBottom: 6, background: "#fff" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0D47A1, #1565C0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{(c.nameAr || "م")[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>{c.nameAr}</div>
            <div style={{ fontSize: 9, color: C.t3 }}>{c.companyNameAr || "مقاول مستقل"} • {c.totalProjects || 0} مشاريع</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: c.matchScore >= 80 ? C.green : c.matchScore >= 60 ? C.amber : C.t3 }}>{c.matchScore}%</div>
            <div style={{ fontSize: 8, color: C.t3 }}>توافق</div>
          </div>
        </div>;
      })}
    </div>}

    {/* Contractor Requirements */}
    {analysis.contractorRequirements && <div style={{ background: "rgba(124,58,237,.05)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, marginBottom: 4 }}>🎯 متطلبات المقاول المثالي</div>
      <div style={{ fontSize: 10, color: C.t2, lineHeight: 1.7 }}>{analysis.contractorRequirements.description}</div>
      {analysis.contractorRequirements.specialties && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
        {analysis.contractorRequirements.specialties.map(function (s, i) {
          return <span key={i} style={{ fontSize: 9, padding: "2px 8px", background: "rgba(124,58,237,.1)", borderRadius: 6, color: C.purple }}>{s}</span>;
        })}
      </div>}
    </div>}

    <div style={{ display: "flex", gap: 8 }}>
      <Btn v="outline" onClick={function () { setStep(0); setAnalysis(null); }}>→ تعديل وإعادة التحليل</Btn>
      <Btn f onClick={doCreate} style={{ background: "linear-gradient(135deg, #087A44, #0EAD69)" }}>🚀 إنشاء المشروع وإشعار المقاولين</Btn>
    </div>
  </div>;

  // ── Step 3: Creating ──
  if (step === 3) return <div style={{ textAlign: "center", padding: "40px 20px" }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, color: C.green, marginBottom: 8 }}>جاري إنشاء المشروع...</div>
    <div style={{ fontSize: 11, color: C.t3 }}>يتم إنشاء المراحل وإشعار المقاولين</div>
  </div>;

  return null;
});

// ═══════ BOQ QUOTATION FORM — Excel upload ═══════
// Contractor uploads an .xlsx BOQ file. Browser previews the parsed rows
// (using SheetJS dynamically imported) before submission. Backend re-parses
// the authoritative copy and stores the file with owner+submitter ACL.
var BOQQuotationForm = memo(function BOQQuotationForm({ modal, onSubmit, onClose }) {
  var [file, setFile] = useState(null);
  var [parsed, setParsed] = useState(null); // { items, total, sheetName }
  var [parseErr, setParseErr] = useState("");
  var [parsing, setParsing] = useState(false);
  var [dur, setDur] = useState("6");
  var [warranty, setWarranty] = useState("12");
  var [notes, setNotes] = useState("");

  function pickFieldLoose(row, aliases) {
    var keys = Object.keys(row);
    for (var i = 0; i < aliases.length; i++) {
      var a = aliases[i].toLowerCase();
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j].toString().trim().toLowerCase();
        if (k.indexOf(a) !== -1 && row[keys[j]] !== "" && row[keys[j]] != null) return row[keys[j]];
      }
    }
    return "";
  }

  function parseBrowserSide(f) {
    setParsing(true); setParseErr(""); setParsed(null);
    import("xlsx").then(function (XLSX) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var wb = XLSX.read(ev.target.result, { type: "array" });
          var firstName = wb.SheetNames[0];
          var sheet = wb.Sheets[firstName];
          if (!sheet) { setParseErr("ورقة العمل فارغة"); setParsing(false); return; }
          var rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
          var items = [];
          var total = 0;
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var description = String(pickFieldLoose(row, ["وصف", "البند", "description", "item"]) || "").trim();
            if (!description) continue;
            var stage = String(pickFieldLoose(row, ["مرحله", "مرحلة", "stage", "category", "قسم", "فئة"]) || "").trim() || "أعمال عامة";
            var unit = String(pickFieldLoose(row, ["وحده", "وحدة", "unit"]) || "").trim() || "عدد";
            var quantity = Number(pickFieldLoose(row, ["كميه", "كمية", "quantity", "qty"])) || 1;
            var unit_price = Number(pickFieldLoose(row, ["سعر الوحده", "سعر الوحدة", "unit price", "price", "سعر"])) || 0;
            var brand = String(pickFieldLoose(row, ["ماركه", "ماركة", "brand", "مواصفات", "spec"]) || "").trim();
            var tRaw = Number(pickFieldLoose(row, ["اجمالي", "إجمالي", "total", "الإجمالي", "الاجمالي"]));
            var tVal = tRaw > 0 ? tRaw : (quantity * unit_price);
            items.push({ stage: stage, description: description, unit: unit, quantity: quantity, unit_price: unit_price, brand: brand, total: tVal });
            total += tVal;
          }
          if (items.length === 0) { setParseErr("لم يتم العثور على بنود — تأكد من وجود الأعمدة: الوصف، الوحدة، الكمية، سعر الوحدة"); setParsing(false); return; }
          setParsed({ items: items, total: total, sheetName: firstName });
          setParsing(false);
        } catch (e) {
          console.error("xlsx parse", e);
          setParseErr("تعذر قراءة الملف — تأكد من أنه ملف Excel سليم");
          setParsing(false);
        }
      };
      reader.onerror = function () { setParseErr("فشل قراءة الملف"); setParsing(false); };
      reader.readAsArrayBuffer(f);
    }).catch(function (e) {
      console.error("xlsx import", e);
      setParseErr("تعذر تحميل مكتبة قراءة الإكسل"); setParsing(false);
    });
  }

  function onPick(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var okExt = /\.(xlsx|xls)$/i.test(f.name);
    if (!okExt) { setParseErr("الرجاء اختيار ملف Excel بصيغة .xlsx"); return; }
    setFile(f);
    parseBrowserSide(f);
  }

  function submit() {
    if (!file) { setParseErr("الرجاء رفع ملف BOQ أولاً"); return; }
    if (!parsed || parsed.items.length === 0) { setParseErr("لا توجد بنود صالحة في الملف"); return; }
    onSubmit({
      file: file,
      items: parsed.items,
      total: parsed.total,
      dur: Number(dur) || 6,
      warranty: Number(warranty) || 12,
      notes: notes
    });
  }

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>💰 عرض سعر BOQ</div>
    <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>{modal.title}</div>
    <div style={{ background: "rgba(232,114,12,.05)", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 11, color: C.amber, lineHeight: 1.6 }}>
      📊 ارفع ملف Excel يحتوي على جدول الكميات (BOQ) — سيتعرف التطبيق على البنود تلقائياً.<br/>
      <span style={{ fontSize: 10, color: C.t3 }}>الأعمدة المتوقعة: المرحلة، الوصف، الوحدة، الكمية، سعر الوحدة، الماركة/المواصفات</span>
    </div>

    <label style={{ display: "block", border: "2px dashed " + (file ? C.green : "rgba(96,165,250,.4)"), borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", background: file ? "rgba(16,185,129,.05)" : "rgba(15,23,42,.4)", marginBottom: 12 }}>
      <input type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onPick} style={{ display: "none" }} />
      {file ? (
        <div>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📗</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{file.name}</div>
          <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB — اضغط لتغيير الملف</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>اضغط لاختيار ملف Excel</div>
          <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>.xlsx — حتى 10MB</div>
        </div>
      )}
    </label>

    {parsing && <div style={{ textAlign: "center", padding: 12, fontSize: 12, color: C.t2 }}>⏳ جاري قراءة الملف…</div>}
    {parseErr && <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", padding: 10, borderRadius: 8, fontSize: 11, color: C.red, marginBottom: 10 }}>⚠️ {parseErr}</div>}

    {parsed && parsed.items.length > 0 && (
      <div style={{ border: "1.5px solid " + C.brd, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ background: "rgba(16,185,129,.08)", padding: "8px 12px", fontSize: 11, fontWeight: 800, color: C.green, borderBottom: "1px solid rgba(16,185,129,.2)" }}>
          ✅ تم التعرف على {parsed.items.length} بند — ورقة: {parsed.sheetName}
        </div>
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          {parsed.items.slice(0, 50).map(function (it, i) {
            return <div key={i} style={{ padding: "8px 12px", borderBottom: i < parsed.items.length - 1 ? "1px solid " + C.brd : "none", fontSize: 11, background: i % 2 === 0 ? "rgba(15,23,42,.3)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, color: C.t1 }}>{it.description}</span>
                <span style={{ fontWeight: 700, color: C.amber, whiteSpace: "nowrap" }}>{(it.total || 0).toLocaleString()} د.ب</span>
              </div>
              <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>
                {it.stage} • {it.quantity} {it.unit} × {(it.unit_price || 0).toLocaleString()} د.ب
                {it.brand ? " • " + it.brand : ""}
              </div>
            </div>;
          })}
          {parsed.items.length > 50 && <div style={{ padding: "6px 12px", fontSize: 10, color: C.t3, textAlign: "center" }}>+ {parsed.items.length - 50} بند إضافي…</div>}
        </div>
      </div>
    )}

    {parsed && (
      <div style={{ background: C.navy, borderRadius: 10, padding: 14, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>الإجمالي الكلي (محسوب من الملف)</div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 24, fontWeight: 900, color: C.amber }}>{parsed.total.toLocaleString()} <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>د.ب</span></div>
      </div>
    )}

    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ flex: 1 }}><Inp label="المدة (أشهر)" type="number" value={dur} onChange={function (e) { setDur(e.target.value); }} /></div>
      <div style={{ flex: 1 }}><Inp label="الضمان (أشهر)" type="number" value={warranty} onChange={function (e) { setWarranty(e.target.value); }} /></div>
    </div>
    <Inp label="ملاحظات إضافية" type="textarea" value={notes} onChange={function (e) { setNotes(e.target.value); }} ph="تفاصيل العرض والضمانات..." />
    <Btn v="amber" f onClick={submit}>📤 تقديم العرض {parsed ? "(" + parsed.total.toLocaleString() + " د.ب)" : ""}</Btn>
  </div>;
});

// ═══════ INSPECTOR APPLY FORM — isolated to prevent re-render lag ═══════
var InspectorApplyForm = memo(function InspectorApplyForm({ modal, onSubmit }) {
  var [fee, setFee] = useState("3000");
  var [notes, setNotes] = useState("");

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>🔍 ترشيح لمشروع — {modal.title}</div>
    <Inp label="أتعاب الفحص (د.ب)" type="number" value={fee} onChange={function (e) { setFee(e.target.value); }} />
    <Inp label="ملاحظات وخبرات" type="textarea" value={notes} onChange={function (e) { setNotes(e.target.value); }} ph="خبرتي في هذا النوع من المشاريع..." />
    <Btn v="green" f onClick={function () { onSubmit({ fee: Number(fee), notes: notes || "خبرة في المشاريع السكنية" }); }}>📤 تقديم الترشيح</Btn>
  </div>;
});

// ═══════ CONTRACTOR SUBMIT FORM — isolated to prevent re-render lag ═══════
var ContractorSubmitForm = memo(function ContractorSubmitForm({ modal, onSubmit }) {
  var [subNotes, setSubNotes] = useState("");
  var [subQuality, setSubQuality] = useState("");
  var [subFiles, setSubFiles] = useState([]);

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>📤 تسليم بند</div>
    <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>{modal.itemName}</div>
    <Inp label="ملاحظات التسليم" type="textarea" value={subNotes} onChange={function (e) { setSubNotes(e.target.value); }} ph="وصف ما تم تنفيذه..." />
    <Inp label="ملاحظات الجودة (مطابقة المعايير)" type="textarea" value={subQuality} onChange={function (e) { setSubQuality(e.target.value); }} ph="كيف تمت مطابقة معايير الجودة..." rows={2} />
    <FileUploader label="📎 صور وفيديو التنفيذ (توثيق إلزامي)" onChange={function (f) { setSubFiles(f); }} />
    <div style={{ background: "rgba(232,114,12,.05)", padding: 8, borderRadius: 6, marginBottom: 10, fontSize: 9, color: C.amber }}>
      ⚠️ يجب توثيق كل مرحلة بالصور/الفيديو ووصف مطابقة معايير الجودة
    </div>
    <Btn v="amber" f onClick={function () { onSubmit({ notes: subNotes || "تم التنفيذ حسب المواصفات", quality_notes: subQuality || "مطابق لمعايير الجودة", files: subFiles }); }}>📤 تسليم البند</Btn>
  </div>;
});

// ═══════ INSPECTOR REVIEW FORM — isolated to prevent re-render lag ═══════
var InspectorReviewForm = memo(function InspectorReviewForm({ modal, onApprove, onReject }) {
  var [insNotes, setInsNotes] = useState("");
  var [insRejReason, setInsRejReason] = useState("");
  var [insFiles, setInsFiles] = useState([]);

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🔍 فحص واعتماد بند</div>
    <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>{modal.itemName}</div>
    <Inp label="ملاحظات الفحص" type="textarea" value={insNotes} onChange={function (e) { setInsNotes(e.target.value); }} ph="نتائج الفحص والملاحظات..." />
    <Inp label="سبب الرفض (في حال الرفض)" type="textarea" value={insRejReason} onChange={function (e) { setInsRejReason(e.target.value); }} ph="وصف المشكلة المكتشفة..." rows={2} />
    <FileUploader label="📎 صور/فيديو توثيق الفحص (إلزامي عند الرفض)" onChange={function (f) { setInsFiles(f); }} />
    <div style={{ background: "rgba(14,173,105,.05)", padding: 8, borderRadius: 6, marginBottom: 10, fontSize: 9, color: C.green }}>
      ⚠️ عند الرفض يجب ذكر السبب وتوثيق المشكلة بصور أو فيديو
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <Btn v="green" f onClick={function () { onApprove({ notes: insNotes || "مطابق للمعايير", files: insFiles }); }}>✅ اعتماد — مطابق</Btn>
      <Btn v="red" f onClick={function () { onReject({ notes: insNotes, rejection_reason: insRejReason || "يحتاج إعادة تنفيذ", files: insFiles }); }}>❌ رفض — غير مطابق</Btn>
    </div>
  </div>;
});

// ═══════ OWNER DECISION FORM — isolated to prevent re-render lag ═══════
var OwnerDecisionForm = memo(function OwnerDecisionForm({ modal, onApprove, onReject }) {
  var [rejReason, setRejReason] = useState("");
  var [files, setFiles] = useState([]);
  var [view, setView] = useState("main"); // "main" | "reject"

  if (view === "reject") {
    return <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div onClick={function(){ setView("main"); }} style={{ cursor: "pointer", width: 32, height: 32, borderRadius: 9, background: "#F4F7FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.t3, fontSize: 12 }}>→</span>
        </div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 800, color: C.red }}>❌ سبب الرفض</div>
      </div>
      <div style={{ background: "rgba(231,76,60,.06)", border: "1px solid rgba(231,76,60,.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{modal.itemName}</div>
        <div style={{ fontSize: 10, color: C.t3 }}>سيتم إبلاغ المقاول بسبب الرفض وسيُطلب منه إعادة التنفيذ</div>
      </div>
      <Inp label="سبب الرفض *" type="textarea" value={rejReason} onChange={function(e){ setRejReason(e.target.value); }} ph="وصف واضح لسبب الرفض وما يجب تصحيحه..." rows={3} />
      <FileUploader label="📎 ملفات توضيحية (اختياري)" onChange={function(f){ setFiles(f); }} />
      <Btn v="red" f onClick={function(){
        onReject({ rejection_reason: rejReason || "يحتاج إعادة تنفيذ", files: files });
      }}>❌ تأكيد الرفض وإعادة للمقاول</Btn>
    </div>;
  }

  return <div>
    {/* Header */}
    <div style={{ background: C.gNavy, borderRadius: 12, padding: "12px 14px", marginBottom: 14, color: "#fff" }}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 900, marginBottom: 2 }}>👤 موافقة المالك — الخطوة الأخيرة</div>
      <div style={{ fontSize: 10, opacity: 0.55 }}>المقاول والمفتش وافقا على هذا البند</div>
    </div>

    {/* Item details */}
    <div style={{ background: "rgba(26,111,181,.05)", border: "1.5px solid rgba(26,111,181,.2)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(26,111,181,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginBottom: 4 }}>{modal.itemName}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: "rgba(14,173,105,.1)", color: C.green, padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>✅ اعتمد المفتش</span>
            <span style={{ fontSize: 10, background: "rgba(232,114,12,.1)", color: C.amber, padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>👷 سلّم المقاول</span>
          </div>
        </div>
      </div>
    </div>

    {/* Payment info */}
    {modal.itemCost > 0 && <div style={{ background: "linear-gradient(135deg,rgba(14,173,105,.08),rgba(14,173,105,.14))", border: "2px solid rgba(14,173,105,.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, color: C.t2, marginBottom: 3 }}>💰 المبلغ الذي سيُصرف للمقاول عند الموافقة</div>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900, color: C.green }}>{Number(modal.itemCost).toLocaleString()} <span style={{ fontSize: 12, color: C.t3 }}>د.ب</span></div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(14,173,105,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💸</div>
      </div>
      <div style={{ fontSize: 10, color: C.t3, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(14,173,105,.15)" }}>
        يتم الصرف تلقائياً من المحفظة الضامنة — محمي بضمان المنصة
      </div>
    </div>}

    <FileUploader label="📎 مرفقات (اختياري)" onChange={function(f){ setFiles(f); }} />

    {/* Action buttons */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
      <div onClick={function(){ setView("reject"); }} style={{ padding: "13px 10px", border: "2px solid rgba(231,76,60,.3)", borderRadius: 12, textAlign: "center", cursor: "pointer", background: "rgba(231,76,60,.05)" }}>
        <div style={{ fontSize: 18, marginBottom: 3 }}>❌</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.red }}>رفض</div>
        <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>إعادة للمقاول</div>
      </div>
      <div onClick={function(){ onApprove({ files: files }); }} style={{ padding: "13px 10px", border: "2px solid rgba(14,173,105,.35)", borderRadius: 12, textAlign: "center", cursor: "pointer", background: C.gGreen, boxShadow: "0 4px 14px rgba(14,173,105,.25)" }}>
        <div style={{ fontSize: 18, marginBottom: 3 }}>✅</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>موافقة + دفع</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 2 }}>صرف للمقاول فوراً</div>
      </div>
    </div>
  </div>;
});

// ═══════ RATING FORM — isolated to prevent re-render lag ═══════
var RatingForm = memo(function RatingForm({ modal, onSubmit }) {
  var [stars, setStars] = useState(5);
  var [review, setReview] = useState("");

  return <div>
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 36, marginBottom: 4 }}>&#11088;</div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800 }}>
        تقييم {modal.ratedRole === "contractor" ? "المقاول" : "المفتش"}
      </div>
      <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>{modal.ratedName}</div>
      <div style={{ fontSize: 10, color: C.t3 }}>{modal.projectTitle}</div>
    </div>
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <StarRating value={stars} onChange={function (v) { setStars(v); }} size={32} />
      <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginTop: 6 }}>
        {stars === 5 ? "ممتاز &#11088;" : stars === 4 ? "جيد جداً" : stars === 3 ? "جيد" : stars === 2 ? "مقبول" : "ضعيف"}
      </div>
    </div>
    <Inp label="تعليق التقييم (اختياري)" type="textarea" value={review}
      onChange={function (e) { setReview(e.target.value); }}
      ph="شاركنا تجربتك مع هذا المحترف..." />
    <Btn v="gold" f onClick={function () { onSubmit({ stars: stars, review: review }); }}>
      &#11088; تقديم التقييم
    </Btn>
  </div>;
});

// ═══════ ADMIN PAGE COMPONENT ═══════
var AdminPage = memo(function AdminPage({ tk, onBack, show }) {
  var [adminStats, setAdminStats] = useState(null);
  var [adminUsers, setAdminUsers] = useState([]);
  var [adminSearch, setAdminSearch] = useState("");
  var [adminLoaded, setAdminLoaded] = useState(false);

  useEffect(function() {
    if (adminLoaded) return;
    setAdminLoaded(true);
    call("/admin/stats", "GET", null, tk).then(function(d){ if (d.users) setAdminStats(d); });
    call("/admin/users?limit=50", "GET", null, tk).then(function(d){ if (d.users) setAdminUsers(d.users); });
  }, [tk]);

  var filtered = adminUsers.filter(function(u){
    if (!adminSearch) return true;
    var s = adminSearch.toLowerCase();
    return (u.nameAr||"").includes(adminSearch) || (u.email||"").toLowerCase().includes(s) || (u.companyNameAr||"").includes(adminSearch);
  });

  function toggleActive(u) {
    call("/admin/users/" + u.id, "PATCH", { isActive: !u.isActive }, tk).then(function(d){
      if (d.success) {
        setAdminUsers(function(prev){ return prev.map(function(x){ return x.id === u.id ? Object.assign({}, x, { isActive: !x.isActive }) : x; }); });
        show(u.isActive ? "❌ تم تعطيل الحساب" : "✅ تم تفعيل الحساب");
      }
    });
  }

  function verifyEmail(u) {
    call("/admin/users/" + u.id, "PATCH", { emailVerified: true }, tk).then(function(d){
      if (d.success) {
        setAdminUsers(function(prev){ return prev.map(function(x){ return x.id === u.id ? Object.assign({}, x, { emailVerified: true }) : x; }); });
        show("✅ تم تأكيد البريد");
      }
    });
  }

  return <div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Btn v="outline" sm onClick={onBack}>→ رجوع</Btn>
      <span style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 800 }}>🛡️ لوحة الإدارة</span>
    </div>

    {adminStats && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
      <StatCard v={adminStats.users.total} l="المستخدمين" ic={<Users size={18} />} cl={C.ocean} />
      <StatCard v={adminStats.projects.total} l="المشاريع" ic={<Construction size={18} />} cl={C.amber} />
      <StatCard v={adminStats.projects.completed} l="مكتملة" ic={<CheckCircle2 size={18} />} cl={C.green} />
      <StatCard v={adminStats.users.owners} l="ملاك" ic={<User size={18} />} cl={C.ocean} />
      <StatCard v={adminStats.users.contractors} l="مقاولون" ic={<HardHat size={18} />} cl={C.amber} />
      <StatCard v={adminStats.users.inspectors} l="مفتشون" ic={<Search size={18} />} cl={C.green} />
    </div>}
    {!adminStats && <div style={{ textAlign: "center", padding: 20, color: C.t3 }}>⏳ جاري تحميل الإحصائيات...</div>}

    <SectionTitle ic={<Users size={16} color={C.ocean} />} mt={8}>إدارة المستخدمين ({adminUsers.length})</SectionTitle>
    <div style={{ marginBottom: 10 }}>
      <Inp label="" value={adminSearch} onChange={function(e){ setAdminSearch(e.target.value); }} ph="🔍 بحث بالاسم أو البريد..." />
    </div>

    {filtered.map(function(u) {
      var roleIcon = u.role === "owner" ? "👤" : u.role === "contractor" ? "👷" : "🔍";
      var roleColor = u.role === "owner" ? C.ocean : u.role === "contractor" ? C.amber : C.green;
      return <Card key={u.id} p={12} mb={8}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: roleColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", flexShrink: 0, opacity: u.isActive ? 1 : 0.4 }}>
            {roleIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              {u.nameAr}
              {u.isAdmin && <Badge c="purple">مشرف</Badge>}
              {!u.isActive && <Badge c="red">محظور</Badge>}
            </div>
            <div style={{ fontSize: 10, color: C.t3 }}>{u.email}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
              {!u.emailVerified && <Badge c="amber">⚠️ بريد غير مؤكد</Badge>}
              {u.rating > 0 && <Badge c="gold">⭐ {u.rating}</Badge>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            <Btn v={u.isActive ? "red" : "green"} sm onClick={function(){ toggleActive(u); }}>
              {u.isActive ? "🚫 تعطيل" : "✅ تفعيل"}
            </Btn>
            {!u.emailVerified && <Btn v="outline" sm onClick={function(){ verifyEmail(u); }}>📧 تأكيد</Btn>}
          </div>
        </div>
      </Card>;
    })}
    {filtered.length === 0 && adminLoaded && <div style={{ textAlign: "center", padding: 20, color: C.t3, fontSize: 12 }}>لا توجد نتائج</div>}
  </div>;
});

// ═══════ EDIT PROFILE FORM — isolated to prevent re-render lag ═══════
var EditProfileForm = memo(function EditProfileForm({ user, onSubmit, onClose }) {
  var [nameAr, setNameAr] = useState(user.name_ar || user.nameAr || "");
  var [phone, setPhone] = useState(user.phone || "");
  var [companyNameAr, setCompanyNameAr] = useState(user.company_name_ar || user.companyNameAr || "");
  var [specialty, setSpecialty] = useState(user.specialty || "");
  var [bioAr, setBioAr] = useState(user.bio_ar || user.bioAr || "");

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 14 }}>✏️ تعديل الملف الشخصي</div>
    <Inp label="الاسم الكامل *" value={nameAr} onChange={function(e){ setNameAr(e.target.value); }} ph="الاسم الكامل" />
    <Inp label="رقم الجوال" value={phone} onChange={function(e){ setPhone(e.target.value); }} ph="+97336xxxxxx" />
    {(user.role === "contractor") && <Inp label="اسم الشركة" value={companyNameAr} onChange={function(e){ setCompanyNameAr(e.target.value); }} ph="شركة البناء المتقدم" />}
    {(user.role === "inspector" || user.role === "contractor") && <Inp label="التخصص" value={specialty} onChange={function(e){ setSpecialty(e.target.value); }} ph="هندسة مدنية، كهرباء..." />}
    <Inp label="نبذة تعريفية" type="textarea" value={bioAr} onChange={function(e){ setBioAr(e.target.value); }} ph="اكتب نبذة مختصرة عن خبرتك وتخصصك..." rows={3} />
    <div style={{ display: "flex", gap: 8 }}>
      <Btn v="outline" onClick={onClose}>إلغاء</Btn>
      <Btn f onClick={function(){
        if (!nameAr.trim()) return;
        onSubmit({ nameAr: nameAr.trim(), phone: phone || null, companyNameAr: companyNameAr || null, specialty: specialty || null, bioAr: bioAr || null });
      }}>✅ حفظ التغييرات</Btn>
    </div>
  </div>;
});

// ═══════ CHANGE PASSWORD FORM — isolated to prevent re-render lag ═══════
var ChangePasswordForm = memo(function ChangePasswordForm({ onSubmit, onClose }) {
  var [curPw, setCurPw] = useState("");
  var [newPw, setNewPw] = useState("");
  var [newPw2, setNewPw2] = useState("");
  var [err, setErr] = useState("");

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 14 }}>🔑 تغيير كلمة المرور</div>
    {err && <div style={{ background: "rgba(231,76,60,.08)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: C.red }}>⚠️ {err}</div>}
    <Inp label="كلمة المرور الحالية" type="password" value={curPw} onChange={function(e){ setCurPw(e.target.value); setErr(""); }} ph="كلمة المرور الحالية" />
    <Inp label="كلمة المرور الجديدة" type="password" value={newPw} onChange={function(e){ setNewPw(e.target.value); setErr(""); }} ph="6 أحرف على الأقل" />
    <Inp label="تأكيد كلمة المرور الجديدة" type="password" value={newPw2} onChange={function(e){ setNewPw2(e.target.value); setErr(""); }} ph="أعد الإدخال" />
    <div style={{ display: "flex", gap: 8 }}>
      <Btn v="outline" onClick={onClose}>إلغاء</Btn>
      <Btn f onClick={function(){
        setErr("");
        if (!curPw) { setErr("أدخل كلمة المرور الحالية"); return; }
        if (newPw.length < 6) { setErr("كلمة المرور الجديدة قصيرة جداً"); return; }
        if (newPw !== newPw2) { setErr("كلمتا المرور غير متطابقتين"); return; }
        onSubmit({ currentPassword: curPw, newPassword: newPw });
      }}>✅ تغيير كلمة المرور</Btn>
    </div>
  </div>;
});

// ═══════ REGISTER FORM — phone mandatory + OTP flow ═══════
var RegisterForm = memo(function RegisterForm({ onSubmit, onBack }) {
  var [nameAr, setNameAr] = useState("");
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var [pass2, setPass2] = useState("");
  var [role, setRole] = useState("owner");
  var [accountType, setAccountType] = useState("individual");
  var [company, setCompany] = useState("");
  var [crNum, setCrNum] = useState("");
  var [logoFile, setLogoFile] = useState(null);
  var [logoPreview, setLogoPreview] = useState(null);
  var [specialty, setSpecialty] = useState("");
  var [phone, setPhone] = useState("+973");
  var [err, setErr] = useState("");
  var [ld, setLd] = useState(false);

  function submit() {
    setErr("");
    if (accountType === "company" && !company.trim()) { setErr("اسم الشركة مطلوب للحسابات التجارية"); return; }
    if (!nameAr.trim()) { setErr(accountType === "company" ? "اسم المسؤول مطلوب" : "الاسم مطلوب"); return; }
    if (!email.trim() || !email.includes("@")) { setErr("بريد إلكتروني صحيح مطلوب"); return; }
    if (!phone.trim() || phone.length < 8) { setErr("رقم الجوال مطلوب (مثال: +97336123456)"); return; }
    if (pass.length < 6) { setErr("كلمة المرور 6 أحرف على الأقل"); return; }
    if (pass !== pass2) { setErr("كلمتا المرور غير متطابقتين"); return; }
    if (role === "inspector" && !specialty) { setErr("يجب تحديد التخصص: مهندس مدني أو مهندس تصميم داخلي"); return; }
    setLd(true);
    onSubmit({
      nameAr: nameAr.trim(), email: email.trim(), password: pass, role,
      accountType: accountType,
      companyNameAr: accountType === "company" ? company.trim() : (company || null),
      crNumber: accountType === "company" ? (crNum.trim() || null) : null,
      specialty: specialty || null, phone: phone.trim(),
      _logoFile: logoFile
    }, function(e){ setLd(false); setErr(e); });
  }

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}><WhaleLogo size={28} /> إنشاء حساب جديد</div>
    <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>FIRST TOUCH — Securing Your Build</div>
    {err && <div style={{ background: "rgba(231,76,60,.08)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: C.red }}>⚠️ {err}</div>}

    {/* Account Type: Individual / Company */}
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>نوع الحساب</div>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ v: "individual", i: "👤", l: "فرد", d: "حساب شخصي" }, { v: "company", i: "🏢", l: "شركة", d: "حساب تجاري / مؤسسة" }].map(function(at) {
          var sel = accountType === at.v;
          return <div key={at.v} onClick={function(){ setAccountType(at.v); }} style={{ flex: 1, padding: "12px 8px", border: "2px solid " + (sel ? C.ocean : C.brd), borderRadius: 12, textAlign: "center", cursor: "pointer", background: sel ? "rgba(26,111,181,.07)" : "#fff", transition: "all .2s" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{at.i}</div>
            <div style={{ fontSize: 12, fontWeight: sel ? 800 : 500, color: sel ? C.ocean : C.t1 }}>{at.l}</div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{at.d}</div>
            {sel && <div style={{ marginTop: 4, fontSize: 10, color: C.ocean }}>✓</div>}
          </div>;
        })}
      </div>
    </div>

    {/* Role Selection */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>الدور في المنصة</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[{ v: "owner", i: "👤", l: "مالك مشروع" }, { v: "contractor", i: "👷", l: "مقاول" }, { v: "inspector", i: "🔍", l: "مفتش" }].map(function(r) {
          return <div key={r.v} onClick={function(){ setRole(r.v); }} style={{ flex: 1, padding: "8px 4px", border: "2px solid " + (role === r.v ? C.ocean : C.brd), borderRadius: 8, textAlign: "center", cursor: "pointer", background: role === r.v ? "rgba(26,111,181,.07)" : "#fff" }}>
            <div style={{ fontSize: 16 }}>{r.i}</div>
            <div style={{ fontSize: 10, fontWeight: role === r.v ? 700 : 400, color: role === r.v ? C.ocean : C.t2 }}>{r.l}</div>
          </div>;
        })}
      </div>
    </div>

    {/* Company fields */}
    {accountType === "company" && <div style={{ background: "rgba(26,111,181,.04)", border: "1px solid rgba(26,111,181,.15)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.ocean, marginBottom: 8 }}>🏢 بيانات الشركة</div>
      {/* Company Logo Upload */}
      <div style={{ marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6, textAlign: "right" }}>لوجو الشركة</div>
        <div onClick={function(){ document.getElementById("logo-upload-input").click(); }} style={{ width: 80, height: 80, borderRadius: 16, border: "2px dashed " + (logoPreview ? C.ocean : C.brd), background: logoPreview ? "transparent" : "#f8f9ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto", overflow: "hidden", transition: "all .2s" }}>
          {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 24 }}>📷</div><div style={{ fontSize: 8, color: C.t3 }}>رفع اللوجو</div></div>}
        </div>
        <input id="logo-upload-input" type="file" accept="image/*" style={{ display: "none" }} onChange={function(e){ var f = e.target.files[0]; if(f){ setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
        {logoPreview && <div onClick={function(){ setLogoFile(null); setLogoPreview(null); }} style={{ fontSize: 10, color: C.red, cursor: "pointer", marginTop: 4 }}>✕ إزالة</div>}
      </div>
      <Inp label="اسم الشركة *" value={company} onChange={function(e){ setCompany(e.target.value); }} ph="شركة البناء المتقدم" />
      <Inp label="السجل التجاري (اختياري)" value={crNum} onChange={function(e){ setCrNum(e.target.value); }} ph="CR-12345678" />
    </div>}

    <Inp label={accountType === "company" ? "اسم المسؤول *" : "الاسم الكامل *"} value={nameAr} onChange={function(e){ setNameAr(e.target.value); }} ph={accountType === "company" ? "اسم مسؤول المشاريع" : "أحمد محمد"} />
    <Inp label="البريد الإلكتروني *" type="email" value={email} onChange={function(e){ setEmail(e.target.value); }} ph="name@example.com" />
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>رقم الجوال * <span style={{ color: C.ocean, fontSize: 10 }}>(سيُرسل رمز التحقق)</span></div>
      <input type="tel" value={phone} onChange={function(e){ setPhone(e.target.value); }} placeholder="+97336123456" style={{ width: "100%", padding: 10, border: "2px solid " + C.ocean, borderRadius: 8, fontFamily: "Tajawal", fontSize: 13, boxSizing: "border-box", direction: "ltr", textAlign: "left" }} />
    </div>
    {role === "inspector" && <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>
        التخصص الهندسي * <span style={{ color: C.red, fontSize: 9 }}>(مطلوب)</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { v: "مهندس مدني", i: "🏗️", en: "Civil Engineer", d: "إنشاءات وأساسات وهيكل خرساني" },
          { v: "مهندس تصميم داخلي", i: "🎨", en: "Interior Design", d: "تشطيبات ومساحات داخلية" }
        ].map(function(s) {
          var sel = specialty === s.v;
          return <div key={s.v} onClick={function(){ setSpecialty(s.v); }} style={{
            padding: "12px 10px", cursor: "pointer", textAlign: "center",
            border: "2px solid " + (sel ? C.green : C.brd),
            borderRadius: 12,
            background: sel ? "linear-gradient(135deg,rgba(8,122,68,.07),rgba(14,173,105,.12))" : "#FAFBFF",
            boxShadow: sel ? "0 3px 12px rgba(14,173,105,.2)" : "none",
            transition: "all 0.2s"
          }}>
            <div style={{ fontSize: 28, marginBottom: 5 }}>{s.i}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: sel ? C.green : C.t1 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{s.en}</div>
            <div style={{ fontSize: 9, color: C.t2, marginTop: 3, lineHeight: 1.3 }}>{s.d}</div>
            {sel && <div style={{ marginTop: 5, fontSize: 11, color: C.green }}>✓</div>}
          </div>;
        })}
      </div>
    </div>}
    <Inp label="كلمة المرور *" type="password" value={pass} onChange={function(e){ setPass(e.target.value); }} ph="6 أحرف على الأقل" />
    <Inp label="تأكيد كلمة المرور *" type="password" value={pass2} onChange={function(e){ setPass2(e.target.value); }} ph="أعد إدخال كلمة المرور" />

    <Btn f loading={ld} onClick={submit}>📱 إنشاء الحساب وإرسال رمز التحقق</Btn>
    <div style={{ marginTop: 10, textAlign: "center" }}>
      <span onClick={onBack} style={{ fontSize: 11, color: C.ocean, cursor: "pointer", textDecoration: "underline" }}>تسجيل دخول بحساب موجود</span>
    </div>
  </div>;
});

// ═══════ OTP SCREEN — phone verification ═══════
var OtpScreen = memo(function OtpScreen({ userId, phone, devOtp, onSuccess, onBack }) {
  var [digits, setDigits] = useState(["","","","","",""]);
  var [err, setErr] = useState("");
  var [ld, setLd] = useState(false);
  var [resendTimer, setResendTimer] = useState(60);
  var [resending, setResending] = useState(false);
  var refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(function() {
    if (refs[0].current) refs[0].current.focus();
    var t = setInterval(function() { setResendTimer(function(r){ return r > 0 ? r - 1 : 0; }); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  function handleDigit(i, val) {
    var v = val.replace(/\D/g, "").slice(-1);
    var nd = digits.slice();
    nd[i] = v;
    setDigits(nd);
    if (v && i < 5 && refs[i+1].current) refs[i+1].current.focus();
    if (nd.every(function(d){ return d !== ""; })) {
      verifyOtp(nd.join(""));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0 && refs[i-1].current) refs[i-1].current.focus();
  }

  function verifyOtp(otp) {
    setLd(true); setErr("");
    call("/auth/verify-otp", "POST", { userId, otp }).then(function(r) {
      setLd(false);
      if (r.error) { setErr(r.error); setDigits(["","","","","",""]); if(refs[0].current) refs[0].current.focus(); return; }
      if (r.token) onSuccess(r);
    });
  }

  function resend() {
    setResending(true);
    call("/auth/send-otp", "POST", { phone, userId }).then(function(r) {
      setResending(false);
      setResendTimer(60);
      setDigits(["","","","","",""]);
      if (refs[0].current) refs[0].current.focus();
    });
  }

  var maskedPhone = phone ? phone.slice(0,4) + "****" + phone.slice(-2) : "";

  return <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 44, marginBottom: 10 }}>📱</div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>رمز التحقق</div>
    <div style={{ fontSize: 11, color: C.t2, marginBottom: 4 }}>تم إرسال رمز مكوّن من 6 أرقام إلى</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: C.ocean, marginBottom: 20, direction: "ltr" }}>{maskedPhone}</div>

    {devOtp && <div style={{ background: "rgba(232,114,12,.1)", border: "1px solid rgba(232,114,12,.3)", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 11 }}>
      ⚠️ وضع التطوير — الرمز: <strong style={{ fontSize: 16, color: C.amber, fontFamily: "monospace" }}>{devOtp}</strong>
    </div>}

    {err && <div style={{ background: "rgba(231,76,60,.08)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: C.red }}>⚠️ {err}</div>}

    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, direction: "ltr" }}>
      {digits.map(function(d, i) {
        return <input key={i} ref={refs[i]} value={d} maxLength={1} onChange={function(e){ handleDigit(i, e.target.value); }} onKeyDown={function(e){ handleKeyDown(i, e); }} style={{ width: 42, height: 52, textAlign: "center", fontSize: 22, fontWeight: 800, border: "2px solid " + (d ? C.ocean : C.brd), borderRadius: 10, outline: "none", fontFamily: "monospace" }} />;
      })}
    </div>

    {ld && <div style={{ fontSize: 12, color: C.t2, marginBottom: 12 }}>⏳ جاري التحقق...</div>}

    <div style={{ marginBottom: 16 }}>
      {resendTimer > 0
        ? <div style={{ fontSize: 11, color: C.t3 }}>إعادة الإرسال بعد {resendTimer} ثانية</div>
        : <span onClick={resend} style={{ fontSize: 11, color: C.ocean, cursor: "pointer", fontWeight: 700 }}>{resending ? "جاري الإرسال..." : "🔁 إعادة إرسال الرمز"}</span>
      }
    </div>

    <Btn v="outline" f onClick={onBack}>→ تغيير رقم الهاتف</Btn>
  </div>;
});

// ═══════ WALLET FUNDING SCREEN ═══════
var WalletFundingScreen = memo(function WalletFundingScreen({ token, onBack, onSuccess }) {
  var [mode, setMode] = useState(null); // null | "direct" | "bank"
  var [amount, setAmount] = useState("");
  var [bank, setBank] = useState("");
  var [duration, setDuration] = useState("15");
  var [purpose, setPurpose] = useState("");
  var [docs, setDocs] = useState([]);
  var [ld, setLd] = useState(false);
  var [msg, setMsg] = useState("");
  var [err, setErr] = useState("");
  // Card fields
  var [cardNum, setCardNum] = useState("");
  var [cardName, setCardName] = useState("");
  var [cardExp, setCardExp] = useState("");
  var [cardCvv, setCardCvv] = useState("");
  var [cardStep, setCardStep] = useState(1); // 1=amount, 2=card details, 3=confirm

  var BANKS = [
    { v: "NBB",     l: "🏦 بنك البحرين الوطني (NBB)",      d: "أكبر بنك في البحرين" },
    { v: "BBK",     l: "🏦 بنك البحرين والكويت (BBK)",     d: "تمويل عقاري مميز" },
    { v: "BisB",    l: "🕌 بنك البحرين الإسلامي (BisB)",  d: "تمويل إسلامي" },
    { v: "Ahli",    l: "🏦 البنك الأهلي المتحد",           d: "حلول تمويل متنوعة" },
    { v: "Gulf",    l: "🏦 بنك الخليج",                    d: "تمويل سريع وميسّر" },
    { v: "Ithmaar", l: "🕌 بنك إثمار",                    d: "تمويل شرعي" },
  ];

  function directDeposit() {
    if (!amount || Number(amount) <= 0) { setErr("أدخل المبلغ"); return; }
    setLd(true); setErr("");
    call("/wallet/deposit", "POST", { amount: Number(amount), bank: "تحويل مباشر" }, token).then(function(r) {
      setLd(false);
      if (r.error) { setErr(r.error); return; }
      setMsg("✅ تم إيداع " + Number(amount).toLocaleString() + " د.ب بنجاح!");
      setTimeout(function(){ onSuccess(); }, 1500);
    });
  }

  function submitBankRequest() {
    if (!bank) { setErr("اختر البنك"); return; }
    if (!amount || Number(amount) <= 0) { setErr("أدخل مبلغ التمويل المطلوب"); return; }
    setLd(true); setErr("");
    call("/projects/bank-request", "POST", { bankName: bank, amount: Number(amount), durationYears: Number(duration), purpose }, token).then(function(r) {
      setLd(false);
      if (r.error) { setErr(r.error); return; }
      setMsg("✅ تم تقديم طلب التمويل! سيتم مراجعته خلال 3-5 أيام عمل.");
      setTimeout(function(){ onBack(); }, 2000);
    });
  }

  if (msg) return <div style={{ textAlign: "center", padding: 20 }}>
    <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 800, color: C.green }}>{msg}</div>
  </div>;

  if (!mode) return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>💰 تمويل المحفظة</div>
    <div style={{ fontSize: 11, color: C.t2, marginBottom: 18 }}>اختر طريقة التمويل المناسبة لك</div>

    <div onClick={function(){ setMode("direct"); }} style={{ background: "linear-gradient(135deg, rgba(14,173,105,.08), rgba(14,173,105,.15))", border: "2px solid " + C.green, borderRadius: 14, padding: 18, marginBottom: 12, cursor: "pointer" }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>💳</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.green }}>تحويل مباشر</div>
      <div style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>أودع مبلغاً مباشرة من حسابك البنكي إلى المحفظة الضامنة</div>
      <div style={{ fontSize: 10, color: C.green, marginTop: 6, fontWeight: 700 }}>✓ فوري — بدون انتظار</div>
    </div>

    <div onClick={function(){ setMode("bank"); }} style={{ background: "linear-gradient(135deg, rgba(26,111,181,.06), rgba(26,111,181,.12))", border: "2px solid " + C.ocean, borderRadius: 14, padding: 18, marginBottom: 16, cursor: "pointer" }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>🏦</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.ocean }}>طلب تمويل بنكي</div>
      <div style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>قدّم طلب قرض عقاري عبر البنوك الشريكة مع المنصة</div>
      <div style={{ fontSize: 10, color: C.ocean, marginTop: 6, fontWeight: 700 }}>✓ أقساط شهرية — حتى 25 سنة</div>
    </div>

    <Btn v="outline" f onClick={onBack}>→ رجوع</Btn>
  </div>;

  if (mode === "direct") {
    // Format card number with spaces every 4 digits
    function fmtCard(v) {
      return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
    }
    // Format expiry MM/YY
    function fmtExp(v) {
      var d = v.replace(/\D/g,"").slice(0,4);
      return d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d;
    }
    // Detect card type
    function cardType(n) {
      var d = n.replace(/\s/g,"");
      if (d.startsWith("4")) return { i: "VISA", c: "#1A1F71" };
      if (d.startsWith("5") || d.startsWith("2")) return { i: "Mastercard", c: "#EB001B" };
      if (d.startsWith("3")) return { i: "Amex", c: "#007BC1" };
      return { i: "💳", c: C.t3 };
    }
    var ct = cardType(cardNum);
    var maskedNum = cardNum ? cardNum.replace(/\d(?=\d{4})/g, "•") : "•••• •••• •••• ••••";

    return <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div onClick={function(){ cardStep > 1 ? setCardStep(cardStep-1) : setMode(null); }} style={{ cursor: "pointer", fontSize: 14, color: C.t3 }}>→</div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 800 }}>💳 الدفع بالبطاقة</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 3, marginBottom: 18, justifyContent: "center" }}>
        {[1,2,3].map(function(s){
          return <div key={s} style={{ width: cardStep===s?32:8, height:5, borderRadius:3, background: cardStep>=s ? C.green : "#DDE2EB", transition:"all .3s" }} />;
        })}
      </div>

      {err && <div style={{ background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.3)", borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:11, color:C.red }}>⚠️ {err}</div>}

      {/* Step 1: Amount */}
      {cardStep === 1 && <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, marginBottom: 14 }}>الخطوة 1 من 3 — المبلغ المراد إيداعه</div>
        <div style={{ background: "linear-gradient(135deg, #0B1D33, #1A6FB5)", borderRadius: 14, padding: 20, marginBottom: 16, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 6 }}>المبلغ (د.ب)</div>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 36, fontWeight: 900 }}>{amount || "0"}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>أدخل المبلغ المراد إيداعه (د.ب)</div>
          <input type="number" value={amount} onChange={function(e){ setAmount(e.target.value); }} placeholder="أدخل المبلغ..." style={{ width:"100%", padding:10, border:"1.5px solid "+C.brd, borderRadius:8, fontFamily:"Tajawal", fontSize:14, boxSizing:"border-box", textAlign:"center" }} />
        </div>
        <div style={{ background:"rgba(14,173,105,.06)", border:"1px solid rgba(14,173,105,.2)", borderRadius:8, padding:10, marginBottom:14, fontSize:10, color:C.t2 }}>
          🔒 المبلغ يُحفظ في المحفظة الضامنة — لا يُصرف للمقاول إلا بموافقتك بعد اعتماد المفتش لكل مرحلة.
        </div>
        <Btn v="green" f onClick={function(){
          if (!amount || Number(amount) <= 0) { setErr("أدخل مبلغاً صحيحاً"); return; }
          setErr(""); setCardStep(2);
        }}>التالي — بيانات البطاقة ←</Btn>
      </div>}

      {/* Step 2: Card Details */}
      {cardStep === 2 && <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, marginBottom: 14 }}>الخطوة 2 من 3 — بيانات البطاقة البنكية</div>

        {/* Card visual */}
        <div style={{ background: "linear-gradient(135deg, #0B1D33 0%, #1A6FB5 100%)", borderRadius: 16, padding: "18px 20px", marginBottom: 18, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <div style={{ position: "absolute", bottom: -30, right: -10, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ fontSize: 22 }}>📶</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: ct.c === "#EB001B" ? "#FF6B6B" : ct.c === "#1A1F71" ? "#A8BDFF" : "#7ECBFF" }}>{ct.i}</div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: 3, marginBottom: 16, direction: "ltr" }}>{maskedNum}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 8, opacity: 0.5, marginBottom: 2 }}>اسم حامل البطاقة</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{cardName || "الاسم على البطاقة"}</div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 8, opacity: 0.5, marginBottom: 2 }}>صالحة حتى</div>
              <div style={{ fontSize: 12, fontWeight: 700, direction: "ltr" }}>{cardExp || "MM/YY"}</div>
            </div>
          </div>
        </div>

        {/* Card number */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>رقم البطاقة *</div>
          <div style={{ position: "relative" }}>
            <input type="tel" value={cardNum} onChange={function(e){ setCardNum(fmtCard(e.target.value)); }} placeholder="0000 0000 0000 0000" maxLength={19} style={{ width:"100%", padding:"11px 40px 11px 12px", border:"1.5px solid "+C.brd, borderRadius:8, fontFamily:"monospace", fontSize:15, boxSizing:"border-box", direction:"ltr", letterSpacing:2 }} />
            <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:18 }}>💳</div>
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>الاسم على البطاقة *</div>
          <input type="text" value={cardName} onChange={function(e){ setCardName(e.target.value.toUpperCase()); }} placeholder="AHMED ALI" style={{ width:"100%", padding:"11px 12px", border:"1.5px solid "+C.brd, borderRadius:8, fontFamily:"monospace", fontSize:13, boxSizing:"border-box", direction:"ltr", textTransform:"uppercase" }} />
        </div>

        {/* Expiry + CVV */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>تاريخ الانتهاء *</div>
            <input type="tel" value={cardExp} onChange={function(e){ setCardExp(fmtExp(e.target.value)); }} placeholder="MM/YY" maxLength={5} style={{ width:"100%", padding:"11px 12px", border:"1.5px solid "+C.brd, borderRadius:8, fontFamily:"monospace", fontSize:15, boxSizing:"border-box", direction:"ltr", textAlign:"center" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>CVV / رمز الأمان *</div>
            <div style={{ position: "relative" }}>
              <input type="password" value={cardCvv} onChange={function(e){ setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4)); }} placeholder="•••" maxLength={4} style={{ width:"100%", padding:"11px 12px", border:"1.5px solid "+C.brd, borderRadius:8, fontFamily:"monospace", fontSize:18, boxSizing:"border-box", direction:"ltr", textAlign:"center" }} />
            </div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 3, textAlign: "center" }}>3 أرقام خلف البطاقة</div>
          </div>
        </div>

        <div style={{ background:"rgba(26,111,181,.05)", border:"1px solid rgba(26,111,181,.15)", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:10, color:C.t2, display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:14 }}>🔐</span>
          <span>بياناتك محمية بتشفير SSL 256-bit — لا نحتفظ ببيانات بطاقتك</span>
        </div>

        <Btn v="green" f onClick={function(){
          if (cardNum.replace(/\s/g,"").length < 16) { setErr("رقم البطاقة غير مكتمل"); return; }
          if (!cardName.trim()) { setErr("أدخل الاسم على البطاقة"); return; }
          if (cardExp.length < 5) { setErr("أدخل تاريخ الانتهاء"); return; }
          if (cardCvv.length < 3) { setErr("أدخل رمز CVV"); return; }
          setErr(""); setCardStep(3);
        }}>مراجعة وتأكيد الدفع ←</Btn>
      </div>}

      {/* Step 3: Confirm */}
      {cardStep === 3 && <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, marginBottom: 14 }}>الخطوة 3 من 3 — مراجعة وتأكيد</div>

        <div style={{ border:"2px solid "+C.green, borderRadius:14, padding:16, marginBottom:14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 12 }}>ملخص العملية</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingBottom:10, borderBottom:"1px solid "+C.brd }}>
            <span style={{ fontSize:11, color:C.t2 }}>المبلغ</span>
            <span style={{ fontSize:18, fontWeight:900, color:C.green, fontFamily:"Cairo" }}>{Number(amount).toLocaleString()} <span style={{ fontSize:11 }}>د.ب</span></span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, color:C.t2 }}>البطاقة</span>
            <span style={{ fontSize:12, fontFamily:"monospace", color:C.t1 }}>•••• •••• •••• {cardNum.replace(/\s/g,"").slice(-4)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, color:C.t2 }}>الاسم</span>
            <span style={{ fontSize:12, color:C.t1 }}>{cardName}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:C.t2 }}>الوجهة</span>
            <span style={{ fontSize:11, color:C.ocean, fontWeight:700 }}>🔒 المحفظة الضامنة</span>
          </div>
        </div>

        <div style={{ background:"rgba(232,114,12,.06)", border:"1px solid rgba(232,114,12,.2)", borderRadius:8, padding:10, marginBottom:14, fontSize:10, color:C.t2 }}>
          ⚠️ بالضغط على تأكيد الدفع، توافق على خصم <strong>{Number(amount).toLocaleString()} د.ب</strong> من بطاقتك وإيداعها في المحفظة الضامنة لـ FIRST TOUCH.
        </div>

        <Btn v="green" f loading={ld} onClick={directDeposit}>✅ تأكيد الدفع وإيداع {Number(amount).toLocaleString()} د.ب</Btn>
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <span onClick={function(){ setCardStep(2); }} style={{ fontSize:11, color:C.t3, cursor:"pointer", textDecoration:"underline" }}>← تعديل بيانات البطاقة</span>
        </div>
      </div>}
    </div>;
  }

  if (mode === "bank") return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🏦 طلب تمويل بنكي</div>
    <div style={{ fontSize: 10, color: C.t3, marginBottom: 16 }}>اختر البنك ورفع المستندات المطلوبة</div>
    {err && <div style={{ background: "rgba(231,76,60,.08)", border: "1px solid rgba(231,76,60,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: C.red }}>⚠️ {err}</div>}

    <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 8 }}>اختر البنك</div>
    <div style={{ marginBottom: 14 }}>
      {BANKS.map(function(b) {
        var sel = bank === b.v;
        return <div key={b.v} onClick={function(){ setBank(b.v); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "2px solid " + (sel ? C.ocean : C.brd), borderRadius: 10, marginBottom: 6, cursor: "pointer", background: sel ? "rgba(26,111,181,.06)" : "#fff" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? C.ocean : C.t1 }}>{b.l}</div>
            <div style={{ fontSize: 10, color: C.t3 }}>{b.d}</div>
          </div>
          {sel && <div style={{ fontSize: 14, color: C.ocean }}>✓</div>}
        </div>;
      })}
    </div>

    <Inp label="مبلغ التمويل المطلوب (د.ب) *" type="number" value={amount} onChange={function(e){ setAmount(e.target.value); }} ph="120000" />
    <Inp label="مدة التمويل (سنوات)" type="select" value={duration} onChange={function(e){ setDuration(e.target.value); }} opts={[{v:"5",l:"5 سنوات"},{v:"10",l:"10 سنوات"},{v:"15",l:"15 سنة"},{v:"20",l:"20 سنة"},{v:"25",l:"25 سنة"}]} />
    <Inp label="الغرض من التمويل" type="textarea" value={purpose} onChange={function(e){ setPurpose(e.target.value); }} ph="بناء فيلا سكنية — موقع سار، مساحة 400م²..." rows={3} />

    <div style={{ background: "rgba(232,114,12,.06)", border: "1px solid rgba(232,114,12,.2)", borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 6 }}>📄 المستندات المطلوبة</div>
      <ul style={{ fontSize: 10, color: C.t2, margin: 0, paddingRight: 16, lineHeight: 2 }}>
        <li>صورة البطاقة الشخصية / جواز السفر</li>
        <li>كشف راتب آخر 3 أشهر</li>
        <li>عقد ملكية الأرض أو وثيقة الإيجار</li>
        <li>مخططات المشروع (إن وُجدت)</li>
        <li>كشف حساب بنكي آخر 6 أشهر</li>
      </ul>
      <div style={{ fontSize: 10, color: C.t3, marginTop: 8 }}>⚠️ ستُرفق هذه المستندات مع طلبك تلقائياً بعد رفعها من ملف مشروعك.</div>
    </div>

    <div style={{ display: "flex", gap: 8 }}>
      <Btn v="outline" onClick={function(){ setMode(null); }}>→ رجوع</Btn>
      <Btn f loading={ld} onClick={submitBankRequest}>📤 تقديم طلب التمويل</Btn>
    </div>
  </div>;

  return null;
});

// ═══════ COMPLETED PROJECTS SCREEN ═══════
var CompletedProjectsScreen = memo(function CompletedProjectsScreen({ onBack, onSelectContractor }) {
  var [projects, setProjects] = useState([]);
  var [loaded, setLoaded] = useState(false);
  var [filter, setFilter] = useState("all");

  useEffect(function() {
    call("/projects/completed").then(function(r) {
      if (r.projects) setProjects(r.projects);
      setLoaded(true);
    });
  }, []);

  var filtered = filter === "all" ? projects : projects.filter(function(p){ return p.type === filter; });
  var starStr = function(r) { return "★".repeat(Math.round(r||0)) + "☆".repeat(5 - Math.round(r||0)); };

  return <div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div onClick={onBack} style={{ cursor: "pointer", color: C.t3, fontSize: 14 }}>→</div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 800 }}>🏆 مشاريع منجزة</div>
    </div>
    <div style={{ fontSize: 11, color: C.t2, marginBottom: 14 }}>استعرض أعمال المقاولين للاختيار الأنسب لمشروعك</div>

    <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
      {[{v:"all",l:"الكل"},{v:"villa",l:"🏡 فيلا"},{v:"apartment",l:"🏢 شقة"},{v:"commercial",l:"🏪 تجاري"},{v:"residential",l:"🏠 سكني"}].map(function(f) {
        return <div key={f.v} onClick={function(){ setFilter(f.v); }} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: filter===f.v?700:400, background: filter===f.v ? C.ocean : C.brd, color: filter===f.v ? "#fff" : C.t2, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{f.l}</div>;
      })}
    </div>

    {!loaded && <div style={{ textAlign: "center", padding: 30, color: C.t3 }}>⏳ جاري التحميل...</div>}
    {loaded && filtered.length === 0 && <div style={{ textAlign: "center", padding: 30, color: C.t3 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
      <div>لا توجد مشاريع منجزة بعد</div>
    </div>}

    {filtered.map(function(p) {
      var img = p.images && p.images[0];
      var rating = Number(p.avgRating) || 0;
      return <Card key={p.id} p={0} mb={12} sx={{ overflow: "hidden" }}>
        {img && <img src={img} alt={p.titleAr} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} loading="lazy" />}
        {!img && <div style={{ width: "100%", height: 100, background: "linear-gradient(135deg, #1A6FB5, #0EAD69)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏗️</div>}
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{p.titleAr}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {p.locationAr && <Badge c="blue">📍 {p.locationAr}</Badge>}
            {p.areaSqm && <Badge c="blue">📐 {p.areaSqm} م²</Badge>}
          </div>
          {p.contractor && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#F4F7FB", borderRadius: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>👷</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{p.contractor.companyNameAr || p.contractor.nameAr}</div>
              <div style={{ fontSize: 10, color: C.amber }}>{starStr(rating)} <span style={{ color: C.t3 }}>({p.ratingsCount} تقييم)</span></div>
            </div>
            {onSelectContractor && <Btn sm v="amber" onClick={function(){ onSelectContractor(p.contractor); }}>اختر هذا المقاول</Btn>}
          </div>}
        </div>
      </Card>;
    })}
  </div>;
});

// ═══════ DEPOSIT FORM — isolated to prevent re-render lag ═══════
var DepositForm = memo(function DepositForm({ onSubmit }) {
  var [depA, setDepA] = useState("25000");
  var [depB, setDepB] = useState("NBB");

  return <div>
    <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 14 }}>💳 تعبئة المحفظة</div>
    <Inp label="البنك" type="select" value={depB} onChange={function (e) { setDepB(e.target.value); }} opts={[{ v: "NBB", l: "NBB — الوطني" }, { v: "BisB", l: "BisB — الإسلامي" }, { v: "BBK", l: "BBK — BBK" }]} />
    <Inp label="المبلغ (د.ب)" type="number" value={depA} onChange={function (e) { setDepA(e.target.value); }} />
    <Btn v="green" f onClick={function () { onSubmit({ amount: depA, bank: depB }); }}>✅ تأكيد الإيداع</Btn>
  </div>;
});

// ═══════ COMMENT INPUT — isolated to prevent re-render lag ═══════
var CommentInput = memo(function CommentInput({ onSubmit }) {
  var [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  }

  return <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
    <input value={text} onChange={function (e) { setText(e.target.value); }} placeholder="أضف تعليقاً..." style={{ flex: 1, padding: "6px 8px", border: "1px solid " + C.brd, borderRadius: 6, fontFamily: "Tajawal", fontSize: 10 }} onKeyDown={function (e) { if (e.key === "Enter") submit(); }} />
    <Btn sm v="outline" onClick={submit}>إرسال</Btn>
  </div>;
});

// ═══════ CONTRACT SCREEN ═══════
var ContractScreen = memo(function ContractScreen({ project, token, user, onRefresh }) {
  var [contract, setContract] = useState(null);
  var [loading, setLoading] = useState(true);
  var [signing, setSigning] = useState(false);
  var [creating, setCreating] = useState(false);

  function fetchContract() {
    if (!project) return;
    setLoading(true);
    call("/projects/" + project.id + "/contract", "GET", null, token).then(function (d) {
      if (d.contract) setContract(d.contract);
      else setContract(null);
      setLoading(false);
    });
  }

  useEffect(function () { fetchContract(); }, [project && project.id]);

  function createContract() {
    setCreating(true);
    call("/projects/" + project.id + "/contract", "POST", {}, token).then(function (d) {
      if (d.contract) setContract(d.contract);
      setCreating(false);
    });
  }

  function signContract() {
    setSigning(true);
    call("/projects/" + project.id + "/contract/sign", "POST", {}, token).then(function (d) {
      if (d.contract) {
        setContract(d.contract);
        if (d.contract.status === "active" && onRefresh) onRefresh();
      }
      setSigning(false);
    });
  }

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>جاري تحميل العقد...</div>;

  if (!contract && user && user.role === "owner") {
    return <Card p={20} sx={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>لم يتم إنشاء العقد بعد</div>
      <div style={{ fontSize: 11, color: C.t3, marginBottom: 16 }}>يجب إنشاء العقد وتوقيعه من جميع الأطراف قبل بدء العمل</div>
      <Btn v="gold" f onClick={createContract} loading={creating}>📄 إنشاء العقد</Btn>
    </Card>;
  }

  if (!contract) {
    return <Card p={20} sx={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>لم يتم إنشاء العقد بعد</div>
      <div style={{ fontSize: 11, color: C.t3 }}>بانتظار صاحب المشروع لإنشاء العقد</div>
    </Card>;
  }

  var cd = {};
  try { cd = JSON.parse(contract.contract_text || "{}"); } catch(e) { cd = {}; }
  var parties = cd.parties || {};
  var clauses = cd.clauses || [];
  var boq = cd.boqSummary || [];
  var sigCount = (contract.owner_signed ? 1 : 0) + (contract.contractor_signed ? 1 : 0) + (contract.inspector_signed ? 1 : 0);
  var isActive = contract.status === "active";
  var canSign = user && (
    (user.role === "owner" && !contract.owner_signed) ||
    (user.role === "contractor" && !contract.contractor_signed) ||
    (user.role === "inspector" && !contract.inspector_signed)
  );

  return <div style={{ direction: "rtl" }}>
    {/* Contract Header */}
    <div style={{ background: "linear-gradient(135deg,#0D1B2A 0%,#1A3A5C 60%,#D4A017 100%)", borderRadius: 18, padding: "24px 20px", marginBottom: 14, textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(13,27,42,.35)" }}>
      <div style={{ position: "absolute", top: -30, left: -30, width: 140, height: 140, background: "rgba(212,160,23,.08)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -40, right: -20, width: 180, height: 180, background: "rgba(255,255,255,.03)", borderRadius: "50%" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>FIRST TOUCH</div>
        <div style={{ width: 50, height: 2, background: C.gold, margin: "0 auto 10px", borderRadius: 1 }} />
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>عقد تنفيذ مشروع</div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 800, color: C.gold }}>{cd.projectName || project.title_ar}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", marginTop: 6 }}>{cd.projectLocation}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 9, background: "rgba(255,255,255,.12)", color: "#fff", padding: "3px 10px", borderRadius: 8 }}>القيمة: {Number(cd.totalAmount || 0).toLocaleString()} {cd.currency}</span>
          <span style={{ fontSize: 9, background: "rgba(255,255,255,.12)", color: "#fff", padding: "3px 10px", borderRadius: 8 }}>المدة: {cd.duration}</span>
          <span style={{ fontSize: 9, background: "rgba(255,255,255,.12)", color: "#fff", padding: "3px 10px", borderRadius: 8 }}>الضمان: {cd.warranty}</span>
        </div>
      </div>
    </div>

    {/* Signature Progress */}
    <Card p={14} mb={12} sx={{ border: "1.5px solid " + (isActive ? C.green : C.gold) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 13, fontWeight: 800, color: isActive ? C.green : C.t1 }}>
          {isActive ? "✅ العقد مفعّل — تم التوقيع" : "⏳ حالة التوقيعات"}
        </div>
        <Badge c={isActive ? "green" : "gold"}>{sigCount}/3 توقيعات</Badge>
      </div>
      <div style={{ height: 6, background: "#EDF1F7", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: Math.round(sigCount / 3 * 100) + "%", background: isActive ? C.green : C.gold, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { key: "owner", label: "صاحب المشروع", name: (parties.owner || {}).name, signed: contract.owner_signed, date: contract.owner_sign_date, ic: "👤" },
          { key: "contractor", label: "المقاول", name: (parties.contractor || {}).name, signed: contract.contractor_signed, date: contract.contractor_sign_date, ic: "👷" },
          { key: "inspector", label: "المفتش", name: (parties.inspector || {}).name, signed: contract.inspector_signed, date: contract.inspector_sign_date, ic: "🔍" }
        ].map(function (p) {
          return <div key={p.key} style={{ background: p.signed ? "rgba(14,173,105,.06)" : "rgba(120,144,156,.06)", border: "1.5px solid " + (p.signed ? C.green : C.brd), borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{p.signed ? "✅" : p.ic}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: p.signed ? C.green : C.t2, marginBottom: 2 }}>{p.name || "—"}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>{p.label}</div>
            {p.signed && <div style={{ fontSize: 8, color: C.green, marginTop: 3, fontWeight: 600 }}>وقّع {p.date ? new Date(p.date).toLocaleDateString("ar-BH") : ""}</div>}
            {!p.signed && <div style={{ fontSize: 8, color: C.gold, marginTop: 3, fontWeight: 600 }}>بانتظار التوقيع</div>}
          </div>;
        })}
      </div>
      {canSign && !isActive && <div style={{ marginTop: 12 }}>
        <Btn v="gold" f onClick={signContract} loading={signing}>✍️ توقيع العقد</Btn>
      </div>}
    </Card>

    {/* Parties */}
    <Card p={14} mb={12}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 13, fontWeight: 800, marginBottom: 10, color: C.navy }}>👥 أطراف العقد</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { d: parties.owner || {}, ic: "👤", cl: C.ocean },
          { d: parties.contractor || {}, ic: "👷", cl: C.amber },
          { d: parties.inspector || {}, ic: "🔍", cl: C.green }
        ].map(function (p, i) {
          return <div key={i} style={{ background: p.cl + "08", border: "1px solid " + p.cl + "30", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{p.ic}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: p.cl }}>{p.d.name || "—"}</div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{p.d.role || ""}</div>
            {p.d.cr && <div style={{ fontSize: 8, color: C.t3, marginTop: 2 }}>{p.d.cr}</div>}
            {p.d.phone && <div style={{ fontSize: 8, color: C.t3, marginTop: 1 }}>📱 {p.d.phone}</div>}
          </div>;
        })}
      </div>
    </Card>

    {/* Clauses */}
    {clauses.length > 0 && <Card p={14} mb={12}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 13, fontWeight: 800, marginBottom: 10, color: C.navy }}>📋 بنود العقد</div>
      {clauses.map(function (cl, i) {
        return <div key={i} style={{ background: i % 2 === 0 ? "#F8FAFE" : "#fff", border: "1px solid " + C.brd, borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 12, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{cl.title}</div>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.8, whiteSpace: "pre-line" }}>{cl.text}</div>
        </div>;
      })}
    </Card>}

    {/* BOQ Summary */}
    {boq.length > 0 && <Card p={14} mb={12}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 13, fontWeight: 800, marginBottom: 10, color: C.navy }}>💰 ملخص جدول الكميات (BOQ)</div>
      <div style={{ border: "1px solid " + C.brd, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr", background: C.navy, color: "#fff", padding: "8px 12px", fontSize: 10, fontWeight: 700 }}>
          <span>المرحلة</span><span style={{ textAlign: "center" }}>المبلغ</span><span style={{ textAlign: "center" }}>البنود</span>
        </div>
        {boq.map(function (b, i) {
          return <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr", padding: "8px 12px", fontSize: 10, background: i % 2 === 0 ? "#F8FAFE" : "#fff", borderTop: "1px solid " + C.brd }}>
            <span style={{ fontWeight: 600 }}>{b.stage}</span>
            <span style={{ textAlign: "center", fontWeight: 700, color: C.gold }}>{Number(b.amount).toLocaleString()} د.ب</span>
            <span style={{ textAlign: "center", color: C.t3 }}>{b.items}</span>
          </div>;
        })}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr", padding: "10px 12px", background: "rgba(212,160,23,.08)", borderTop: "2px solid " + C.gold, fontSize: 11, fontWeight: 800 }}>
          <span>الإجمالي</span>
          <span style={{ textAlign: "center", color: C.gold }}>{Number(cd.totalAmount || 0).toLocaleString()} د.ب</span>
          <span style={{ textAlign: "center", color: C.t3 }}>{boq.reduce(function(s, b) { return s + (b.items || 0); }, 0)}</span>
        </div>
      </div>
    </Card>}

    {/* Footer */}
    <div style={{ textAlign: "center", padding: "12px 0 20px", fontSize: 9, color: C.t3 }}>
      منصة FIRST TOUCH — عقد إلكتروني رقمي معتمد<br/>
      تاريخ الإنشاء: {contract.created_at ? new Date(contract.created_at).toLocaleDateString("ar-BH") : "—"}
    </div>
  </div>;
});

// ═══════ STAR RATING COMPONENT ═══════
function StarRating(p) {
  var sz = p.size || 18;
  var stars = [];
  for (var i = 1; i <= 5; i++) {
    (function(starNum) {
      var filled = starNum <= Math.round(p.value || 0);
      stars.push(
        <span key={starNum}
          onClick={p.onChange ? function() { p.onChange(starNum); } : undefined}
          style={{
            fontSize: sz, cursor: p.onChange ? "pointer" : "default",
            color: filled ? C.gold : "#DDE2EB",
            transition: "color 0.2s, transform 0.15s",
            display: "inline-block",
            transform: p.onChange && starNum === p.value ? "scale(1.2)" : "scale(1)"
          }}>&#9733;</span>
      );
    })(i);
  }
  return <div style={{ display: "flex", gap: 2, direction: "ltr" }}>{stars}</div>;
}

// ═══════ HELPER FUNCTIONS ═══════
function typeIcon(type) {
  var icons = { villa: "\uD83C\uDFE1", apartment: "\uD83C\uDFE2", commercial: "\uD83C\uDFEA", residential: "\uD83C\uDFE0" };
  return icons[type] || "\uD83C\uDFD7\uFE0F";
}
function typeLabel(type) {
  var labels = { villa: "\u0641\u064A\u0644\u0627", apartment: "\u0634\u0642\u0629", commercial: "\u062A\u062C\u0627\u0631\u064A", residential: "\u0633\u0643\u0646\u064A" };
  return labels[type] || "\u0645\u0634\u0631\u0648\u0639";
}

// ═══════ FILE UPLOAD COMPONENT ═══════
function FileUploader(p) {
  var ref = useRef();
  var [files, setFiles] = useState([]);
  function handleFiles(e) {
    var newFiles = Array.from(e.target.files);
    Promise.all(newFiles.map(function (f) {
      return fileToBase64(f).then(function (data) {
        return { name: f.name, data: data, type: f.type.startsWith("image") ? "image" : f.type.startsWith("video") ? "video" : "document" };
      });
    })).then(function (converted) {
      var updated = files.concat(converted);
      setFiles(updated);
      if (p.onChange) p.onChange(updated);
    });
  }
  function removeFile(idx) {
    var updated = files.filter(function (_, i) { return i !== idx; });
    setFiles(updated);
    if (p.onChange) p.onChange(updated);
  }
  return <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 4 }}>{p.label || "📎 رفع ملفات (صور، فيديو، تقارير)"}</div>
    <div onClick={function () { ref.current.click(); }} style={{ border: "2px dashed " + C.brd, borderRadius: 10, padding: 16, textAlign: "center", cursor: "pointer", background: "#FAFBFD" }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
      <div style={{ fontSize: 11, color: C.t3 }}>اضغط لاختيار ملفات</div>
      <div style={{ fontSize: 9, color: C.t3 }}>صور JPG/PNG • فيديو MP4 • مستندات PDF</div>
    </div>
    <input ref={ref} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFiles} style={{ display: "none" }} />
    {files.length > 0 && <div style={{ marginTop: 8 }}>
      {files.map(function (f, i) {
        return <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "#F4F7FB", borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>{f.type === "image" ? "🖼️" : f.type === "video" ? "🎥" : "📄"}</span>
          <span style={{ flex: 1, fontSize: 10, color: C.t2 }}>{f.name}</span>
          <span onClick={function () { removeFile(i); }} style={{ fontSize: 12, color: C.red, cursor: "pointer" }}>✕</span>
        </div>;
      })}
    </div>}
  </div>;
}

// ═══════ TRANSLATIONS ═══════
var T = {
  ar: {
    securingBuild: "SECURING YOUR BUILD",
    guaranteedWallet: "محفظة ضامنة", digitalContracts: "عقود رقمية", tripleApproval: "موافقة ثلاثية",
    chooseAccount: "اختر نوع حسابك للدخول",
    owner: "صاحب المشروع", ownerDesc: "إدارة مشاريعك — متابعة التنفيذ — موافقة نهائية",
    ownerF1: "📋 عروض BOQ", ownerF2: "✅ موافقة المراحل", ownerF3: "📜 اتفاقيات رقمية",
    contractor: "المقاول", contractorDesc: "تسعير المشاريع — تنفيذ وتوثيق البنود",
    contractorF1: "💰 تقديم عروض", contractorF2: "📤 تسليم البنود", contractorF3: "📊 متابعة التنفيذ",
    inspector: "مفتش الجودة", inspectorDesc: "مهندس مدني أو تصميم داخلي معتمد",
    inspectorF1: "🔍 فحص البنود", inspectorF2: "📸 توثيق الجودة", inspectorF3: "✅ اعتماد الأعمال",
    developer: "المطور العقاري", developerDesc: "إدارة المجمعات السكنية — متابعة الوحدات",
    developerF1: "🏘️ إدارة المجمعات", developerF2: "📊 تتبع الكميات", developerF3: "🔍 مراقبة الجودة",
    comingSoon: "قريباً", createAccount: "✨ إنشاء حساب جديد — مجاناً",
    login: "تسجيل دخول", email: "البريد الإلكتروني", password: "كلمة المرور", loginBtn: "🔐 دخول",
    forgotPw: "نسيت كلمة المرور؟", demoAccount: "— حساب تجريبي للعرض —", pwHint: "كلمة المرور",
    langLabel: "اللغة", browseLang: "لغة التصفح",
    // Nav
    navHome: "الرئيسية", navOffers: "العروض", navWallet: "المحفظة", navProject: "المشروع",
    navProfile: "حسابي", navTenders: "المناقصات", navGallery: "المعرض",
    // Owner home
    hello: "مرحباً،", ownerRole: "صاحب المشروع — FIRST TOUCH",
    escrowWallet: "المحفظة الضامنة", walletComingSoonMsg: "قريباً — ستتوفر خدمة المحفظة الإلكترونية",
    whatToDo: "ماذا تريد أن تفعل؟",
    fundWallet: "تمويل المحفظة", fundWalletDesc: "المحفظة الضامنة والتمويل البنكي",
    newProject: "مشروع جديد", newProjectDesc: "أنشئ مشروعك واستقبل العروض من المقاولين",
    achievementsGallery: "معرض الإنجازات", achievementsDesc: "استعرض أعمال المقاولين المنجزة",
    financialSummary: "💳 الملخص المالي", financialComingSoon: "المحفظة الضامنة والملخص المالي — ستتوفر قريباً",
    pendingApproval: "بند بانتظار موافقتك", tapToReview: "اضغط هنا لمراجعة البنود والموافقة على الصرف",
    newQuotations: "عرض سعر جديد بانتظار مراجعتك", reviewOffers: "راجع عروض المقاولين وقبّل الأفضل",
    activeProjects: "مشاريع نشطة", pendingYourApproval: "بانتظار موافقتك",
    completedItems: "بنود منجزة", totalBudget: "الميزانية الإجمالية",
    // Contractor home
    contractorRole: "مقاول — FIRST TOUCH", totalEarnings: "إجمالي الأرباح",
    myProjects: "مشاريعي", availableTenders: "المناقصات المتاحة",
    agreedPrice: "قيمة العقد", totalPaid: "إجمالي المدفوع",
    projectProgress: "تقدم المشروع", stages: "المراحل",
    // Tracking
    selectProject: "اختر مشروعاً من الرئيسية", stageProgress: "تقدم المرحلة",
    // Profile
    editProfile: "✏️ تعديل البيانات", changePassword: "🔑 كلمة المرور",
    notifications: "الإشعارات", readAll: "✓ قراءة الكل", logout: "🚪 تسجيل خروج",
    adminPanel: "🛡️ لوحة الإدارة", enterAdmin: "دخول لوحة إدارة النظام",
    // Wallet & Achievements pages
    walletPageTitle: "المحفظة الضامنة", walletComingDesc: "ستتوفر خدمة المحفظة الإلكترونية والتمويل البنكي قريباً.",
    achievementsPageTitle: "معرض الأعمال المنجزة", achievementsComingDesc: "سيتم عرض المشاريع المكتملة وتقييمات الشركات هنا.",
    stayTuned: "تابعونا للمزيد من التحديثات.",
    comingSoonToast: "قريباً — هذه الميزة ستتوفر قريباً",
    // Common
    bhd: "د.ب", noProjects: "لا توجد مشاريع بعد", viewDetails: "📋 عرض تفاصيل المشروع",
    addNewProject: "➕ إضافة مشروع جديد", noBudget: "بدون ميزانية",
    walletLabel: "💰 المحفظة", walletComingSoonShort: "ستتوفر المحفظة الإلكترونية قريباً",
    // Stats
    newQuotationOffers: "عروض أسعار جديدة", completedProjects: "مشاريع مكتملة",
    // Alerts
    thereAre: "يوجد", itemPendingApproval: "بند بانتظار موافقتك",
    // Contract
    agreedContract: "العقد المتفق عليه", fixedData: "بيانات ثابتة — لا تتغير بعد الاتفاق",
    // Owner projects
    allMyProjects: "جميع مشاريعي",
    stActive: "نشط", stCompleted: "مكتمل", stOpenPricing: "متاح للتسعير", stAwaitingPricing: "انتظار تسعير", stNew: "جديد",
    // Contractor alerts
    pendingDelivery: "بند بانتظار تسليمك", tapToDeliverItems: "اضغط لمراجعة البنود وتسليم الأعمال المنجزة",
    newProjectForPricing: "مشروع جديد متاح للتسعير", submitOfferToWin: "قدّم عرضك للفوز بالمشروع",
    itemsNeedDelivery: "بنود تحتاج تسليمك", projectsForPricing: "مشاريع للتسعير",
    // Inspector
    inspectedItems: "بنود تم فحصها", approvalRateLabel: "نسبة الاعتماد",
    pendingInspection: "بند بانتظار فحصك", contractorDelivered: "المقاول سلّم أعمالاً تحتاج اعتمادك",
    itemsNeedInspection: "بنود تحتاج فحصك", rejectedItems: "بنود مرفوضة",
    projectsNeedInspector: "مشاريع تبحث عن مفتش", activeInspection: "مشروع نشط — مطلوب فحصك",
    projectsSearchInspector: "مشاريع تبحث عن مفتش جودة",
    // Offers / Tenders
    awaitingPricingStat: "بانتظار تسعير", activeProjectStat: "مشروع نشط",
    noProjectsNeedOffers: "لا توجد مشاريع تحتاج عروضاً",
    reviewAndAcceptBest: "🔍 مراجعة العروض وقبول الأفضل",
    activeProjectsInProgress: "مشاريع نشطة قيد التنفيذ",
    tendersTitleContractor: "💰 المناقصات المتاحة", tendersTitleInspector: "📋 المشاريع تبحث عن مفتش",
    noAvailableProjects: "لا توجد مشاريع متاحة حالياً",
    pctComplete: "مكتمل",
    // Tracking
    itemsCompleted: "بنود مكتملة", itemCompleted: "بند مكتمل", completedMark: "مكتمل ✓", inProgress: "جاري",
    payOnCompletion: "الدفع عند اكتمال كل مرحلة بموافقة ثلاثية",
    // Achievements
    noCompletedProjects: "لا توجد مشاريع مكتملة بعد", completedProjectsWillAppear: "عند اكتمال المشاريع ستظهر هنا مع التقييمات",
    noCompletedWorks: "لا توجد مشاريع منجزة بعد",
    certifiedCompanies: "شركات البناء المعتمدة — الأعمال المكتملة فقط",
    completedProject: "مشروع مكتمل", completedBadge: "✓ مكتمل",
    // Profile
    profileActive: "نشطة",
    // Contractor sections
    trackAndDeliver: "📋 تتبع وتسليم البنود",
    availableForPricing: "مشاريع متاحة للتسعير (BOQ)",
    budget: "الميزانية", submitBOQ: "{t.submitBOQ}", details: "{t.details}",
    myContractedProjects: "مشاريعي المتعاقد عليها",
    sqm: "م²", floors: "أدوار",
    // Offers page
    reviewOffersAcceptBest: "🔍 مراجعة العروض وقبول الأفضل",
    awaitingPricingLabel: "بانتظار تسعير", activeProjectLabel: "مشروع نشط",
    noProjectsNeedOffersMsg: "لا توجد مشاريع تحتاج عروضاً",
    noAvailableProjectsMsg: "لا توجد مشاريع متاحة حالياً",
    activeProjectsProgress: "مشاريع نشطة قيد التنفيذ",
    // Developer
    inProgressLabel: "جاري التنفيذ", setupLabel: "إعداد", completedLabel: "مكتملة",
    // Tracking items
    itemsDone: "بنود مكتملة", itemDone: "بند مكتمل",
    completedCheck: "مكتمل ✓", progressLabel: "جاري",
    paymentTriple: "الدفع عند اكتمال كل مرحلة بموافقة ثلاثية",
    // Achievements
    noCompletedProjectsYet: "لا توجد مشاريع مكتملة بعد",
    projectsAppearWithRatings: "عند اكتمال المشاريع ستظهر هنا مع التقييمات",
    noCompletedWorksYet: "لا توجد مشاريع منجزة بعد",
    certifiedCompaniesOnly: "شركات البناء المعتمدة — الأعمال المكتملة فقط",
    completedProjectLabel: "مشروع مكتمل", completedBadgeLabel: "✓ مكتمل",
    // Tracking page
    loading: "⏳ جاري التحميل...",
    overallProgress: "نسبة الإنجاز الكلية",
    theOwner: "المالك", theContractor: "المقاول", theInspector: "المفتش",
    totalContractValue: "قيمة العقد الإجمالية",
    theContract: "العقد", contractActive: "مفعّل ✓", awaitingSignature: "بانتظار التوقيع",
    paymentPlan: "💳 خطة المدفوعات", stagesAndPayment: "مراحل التنفيذ والدفع",
    totalContract: "إجمالي العقد", ofContract: "من العقد",
    tripleApprovalMech: "⚙️ آلية الموافقة الثلاثية لكل بند",
    contractorDelivers: "المقاول يسلم", inspectorInspects: "المفتش يفحص", ownerApprovesAndPays: "المالك يوافق ويدفع",
    step: "خطوة",
    projectFiles: "📁 ملفات المشروع",
    quotationsTitle: "عروض الأسعار", boqItems: "بنود",
    boqTable: "📋 جدول الكميات (BOQ)",
    thItem: "البند", thUnit: "الوحدة", thQty: "الكمية", thPrice: "السعر", thBrand: "الماركة",
    acceptOffer: "✅ قبول العرض وبدء التنفيذ",
    accepted: "✓ مقبول", rejected: "✕ مرفوض",
    monthLabel: "شهر", warrantyLabel: "ضمان",
    inspectorApps: "ترشيحات المفتشين",
    assignInspector: "✅ تعيين المفتش", assigned: "معين",
    workflowHint: "💡 سير العمل: المقاول يسلم ← المفتش يفحص ← المالك يوافق",
    workflowDesc: "كل خطوة تتطلب رفع صور/فيديو/تقارير للتوثيق. عند الرفض يجب ذكر السبب وتوثيق المشكلة",
    // Checklist items
    contractorLabel: "المقاول", delivered: "✓ تم التسليم",
    inspectorLabel: "المفتش", approved: "✓ معتمد", rejectedMark: "✕ مرفوض",
    awaitingContractor: "⏳ بانتظار تسليم المقاول", awaitingInspector: "⏳ بانتظار فحص المفتش",
    // Offers modal
    compareOffers: "📨 مقارنة العروض الواردة",
    contractorOffer: "عرض مقاول", inspectorOffer: "مفتش",
    loadingOffers: "جاري تحميل العروض...",
    contractorOffers: "عروض المقاولين", compareAndChoose: "قارن واختر الأفضل",
    lowestPrice: "✨ الأقل سعراً",
    bhdTotal: "د.ب إجمالي", duration: "المدة", warranty: "الضمان", total: "الإجمالي",
    monthStr: "شهر",
    boqItemsLabel: "📋 بنود BOQ", itemLabel: "بند",
    andMore: "بنود أخرى",
    confirmAcceptOffer: "هل تؤكد قبول عرض",
    byValue: "بقيمة",
    contractSentEmail: "سيتم إرسال العقد بالإيميل فوراً.",
    acceptOfferStart: "✅ قبول هذا العرض وبدء المشروع",
    offerAccepted: "تم قبول هذا العرض", contractSentByEmail: "تم إرسال العقد على البريد الإلكتروني",
    inspectorAppsTitle: "ترشيحات المفتشين",
    noContractorOffers: "لا يوجد عرض مقاول بعد",
    noInspectorYet: "لا يوجد مفتش بعد",
    offersAndTenders: "العروض والمناقصات",
    reviewCompareOffers: "راجع وقارن عروض المقاولين والمفتشين",
    newOfferLabel: "عرض جديد",
    youHaveNewOffers: "لديك {0} عرض جديد بانتظار مراجعتك",
    compareAcceptBest: "قارن العروض وقبّل الأفضل لبدء المشروع",
    createNewProjectForOffers: "أنشئ مشروعاً جديداً لتلقي العروض من المقاولين",
    projectsAwaitingQuotes: "مشاريع تنتظر عروض الأسعار",
    contractorOfferCount: "عرض مقاول",
    inspectorCount: "مفتش",
    ofContractPct: "من العقد",
    yourRating: "تقييمك",
    sysAdmin: "🛡️ مشرف النظام",
    projectsLabel: "مشاريع",
    noNotifications: "لا توجد إشعارات",
    availableProjects: "مشروع متاح",
    willNotifyNewProjects: "سيتم إشعارك فور طرح مشاريع جديدة",
    projectsAwaitingPricing: "{0} مشروع بانتظار التسعير",
    projectsAwaitingInspector: "{0} مشروع بانتظار مفتش الجودة",
    tenderDescContractor: "ارفع عرض BOQ تفصيلي لأي مشروع مطروح للتسعير",
    tenderDescInspector: "ترشح كمفتش جودة معتمد لأي من المشاريع التالية",
    priceQuoteCount: "عرض سعر",
    inspectorCountLabel: "مفتش",
    nominateSelf: "🔍 ترشيح نفسي",
    qualityInspector: "مفتش جودة",
    unknownName: "غير معروف",
    unknownCompany: "شركة غير معروفة",
    sessionExpired: "جلسة منتهية — سجل دخول مرة أخرى",
    connectionError: "خطأ في الاتصال — تأكد من تشغيل السيرفر",
    errorGeneric: "خطأ"
  },
  en: {
    securingBuild: "SECURING YOUR BUILD",
    guaranteedWallet: "Escrow Wallet", digitalContracts: "Digital Contracts", tripleApproval: "Triple Approval",
    chooseAccount: "Choose your account type to login",
    owner: "Project Owner", ownerDesc: "Manage projects — Track progress — Final approval",
    ownerF1: "📋 BOQ Offers", ownerF2: "✅ Stage Approval", ownerF3: "📜 Digital Agreements",
    contractor: "Contractor", contractorDesc: "Price projects — Execute & document items",
    contractorF1: "💰 Submit Offers", contractorF2: "📤 Deliver Items", contractorF3: "📊 Track Progress",
    inspector: "Quality Inspector", inspectorDesc: "Licensed civil or interior design engineer",
    inspectorF1: "🔍 Inspect Items", inspectorF2: "📸 Document Quality", inspectorF3: "✅ Approve Works",
    developer: "Real Estate Developer", developerDesc: "Manage residential compounds — Track units",
    developerF1: "🏘️ Manage Compounds", developerF2: "📊 Track Quantities", developerF3: "🔍 Quality Control",
    comingSoon: "Coming Soon", createAccount: "✨ Create a new account — Free",
    login: "Login", email: "Email Address", password: "Password", loginBtn: "🔐 Login",
    forgotPw: "Forgot your password?", demoAccount: "— Demo account —", pwHint: "Password",
    langLabel: "Language", browseLang: "Browsing Language",
    // Nav
    navHome: "Home", navOffers: "Offers", navWallet: "Wallet", navProject: "Project",
    navProfile: "Profile", navTenders: "Tenders", navGallery: "Gallery",
    // Owner home
    hello: "Hello,", ownerRole: "Project Owner — FIRST TOUCH",
    escrowWallet: "Escrow Wallet", walletComingSoonMsg: "Coming Soon — E-wallet service will be available soon",
    whatToDo: "What would you like to do?",
    fundWallet: "Fund Wallet", fundWalletDesc: "Escrow wallet & bank financing",
    newProject: "New Project", newProjectDesc: "Create your project and receive contractor offers",
    achievementsGallery: "Achievements Gallery", achievementsDesc: "Browse completed contractor works",
    financialSummary: "💳 Financial Summary", financialComingSoon: "Escrow wallet & financial summary — Coming soon",
    pendingApproval: "item(s) pending your approval", tapToReview: "Tap here to review items and approve payments",
    newQuotations: "new quotation(s) awaiting your review", reviewOffers: "Review contractor offers and accept the best",
    activeProjects: "Active Projects", pendingYourApproval: "Pending Approval",
    completedItems: "Completed Items", totalBudget: "Total Budget",
    // Contractor home
    contractorRole: "Contractor — FIRST TOUCH", totalEarnings: "Total Earnings",
    myProjects: "My Projects", availableTenders: "Available Tenders",
    agreedPrice: "Contract Value", totalPaid: "Total Paid",
    projectProgress: "Project Progress", stages: "Stages",
    // Tracking
    selectProject: "Select a project from Home", stageProgress: "Stage Progress",
    // Profile
    editProfile: "✏️ Edit Profile", changePassword: "🔑 Password",
    notifications: "Notifications", readAll: "✓ Read All", logout: "🚪 Logout",
    adminPanel: "🛡️ Admin Panel", enterAdmin: "Enter admin panel",
    // Wallet & Achievements pages
    walletPageTitle: "Escrow Wallet", walletComingDesc: "E-wallet and bank financing services will be available soon.",
    achievementsPageTitle: "Completed Works Gallery", achievementsComingDesc: "Completed projects and company ratings will be shown here.",
    stayTuned: "Stay tuned for updates.",
    comingSoonToast: "Coming Soon — This feature will be available soon",
    // Common
    bhd: "BHD", noProjects: "No projects yet", viewDetails: "📋 View Project Details",
    addNewProject: "➕ Add New Project", noBudget: "No budget set",
    walletLabel: "💰 Wallet", walletComingSoonShort: "E-wallet will be available soon",
    // Stats
    newQuotationOffers: "New Quotations", completedProjects: "Completed",
    // Alerts
    thereAre: "", itemPendingApproval: "item(s) pending your approval",
    // Contract
    agreedContract: "Agreed Contract", fixedData: "Fixed data — does not change after agreement",
    // Owner projects
    allMyProjects: "All My Projects",
    stActive: "Active", stCompleted: "Completed", stOpenPricing: "Open for Pricing", stAwaitingPricing: "Awaiting Pricing", stNew: "New",
    // Contractor alerts
    pendingDelivery: "item(s) pending your delivery", tapToDeliverItems: "Tap to review items and deliver completed works",
    newProjectForPricing: "new project(s) available for pricing", submitOfferToWin: "Submit your offer to win the project",
    itemsNeedDelivery: "Items Need Delivery", projectsForPricing: "Projects for Pricing",
    // Inspector
    inspectedItems: "Items Inspected", approvalRateLabel: "Approval Rate",
    pendingInspection: "item(s) pending your inspection", contractorDelivered: "Contractor delivered works needing your approval",
    itemsNeedInspection: "Items Need Inspection", rejectedItems: "Rejected Items",
    projectsNeedInspector: "Projects Need Inspector", activeInspection: "Active project — Inspection required",
    projectsSearchInspector: "Projects Seeking Quality Inspector",
    // Offers / Tenders
    awaitingPricingStat: "Awaiting Pricing", activeProjectStat: "Active Project",
    noProjectsNeedOffers: "No projects need offers currently",
    reviewAndAcceptBest: "🔍 Review Offers & Accept Best",
    activeProjectsInProgress: "Active Projects In Progress",
    tendersTitleContractor: "💰 Available Tenders", tendersTitleInspector: "📋 Projects Seeking Inspector",
    noAvailableProjects: "No available projects currently",
    pctComplete: "complete",
    // Tracking
    itemsCompleted: "items completed", itemCompleted: "item completed", completedMark: "Completed ✓", inProgress: "In Progress",
    payOnCompletion: "Payment upon completion of each stage with triple approval",
    // Achievements
    noCompletedProjects: "No completed projects yet", completedProjectsWillAppear: "Completed projects will appear here with ratings",
    noCompletedWorks: "No completed works yet",
    certifiedCompanies: "Certified construction companies — Completed works only",
    completedProject: "Completed Project", completedBadge: "✓ Completed",
    // Profile
    profileActive: "Active",
    // Contractor sections
    trackAndDeliver: "📋 Track & Deliver Items",
    availableForPricing: "Projects Available for Pricing (BOQ)",
    budget: "Budget", submitBOQ: "💰 Submit BOQ Offer", details: "📋 Details",
    myContractedProjects: "My Contracted Projects",
    sqm: "m²", floors: "Floors",
    // Offers page
    reviewOffersAcceptBest: "🔍 Review Offers & Accept Best",
    awaitingPricingLabel: "Awaiting Pricing", activeProjectLabel: "Active Project",
    noProjectsNeedOffersMsg: "No projects need offers currently",
    noAvailableProjectsMsg: "No available projects currently",
    activeProjectsProgress: "Active Projects In Progress",
    // Developer
    inProgressLabel: "In Progress", setupLabel: "Setup", completedLabel: "Completed",
    // Tracking items
    itemsDone: "items completed", itemDone: "item completed",
    completedCheck: "Completed ✓", progressLabel: "In Progress",
    paymentTriple: "Payment upon completion of each stage with triple approval",
    // Achievements
    noCompletedProjectsYet: "No completed projects yet",
    projectsAppearWithRatings: "Completed projects will appear here with ratings",
    noCompletedWorksYet: "No completed works yet",
    certifiedCompaniesOnly: "Certified construction companies — Completed works only",
    completedProjectLabel: "Completed Project", completedBadgeLabel: "✓ Completed",
    // Tracking page
    loading: "⏳ Loading...",
    overallProgress: "Overall Progress",
    theOwner: "Owner", theContractor: "Contractor", theInspector: "Inspector",
    totalContractValue: "Total Contract Value",
    theContract: "Contract", contractActive: "Active ✓", awaitingSignature: "Awaiting Signature",
    paymentPlan: "💳 Payment Plan", stagesAndPayment: "Stages & Payment",
    totalContract: "Total Contract", ofContract: "of contract",
    tripleApprovalMech: "⚙️ Triple Approval for Each Item",
    contractorDelivers: "Contractor Delivers", inspectorInspects: "Inspector Inspects", ownerApprovesAndPays: "Owner Approves & Pays",
    step: "Step",
    projectFiles: "📁 Project Files",
    quotationsTitle: "Quotations", boqItems: "items",
    boqTable: "📋 BOQ Items",
    thItem: "Item", thUnit: "Unit", thQty: "Qty", thPrice: "Price", thBrand: "Brand",
    acceptOffer: "✅ Accept Offer & Start Project",
    accepted: "✓ Accepted", rejected: "✕ Rejected",
    monthLabel: "month", warrantyLabel: "warranty",
    inspectorApps: "Inspector Applications",
    assignInspector: "✅ Assign Inspector", assigned: "Assigned",
    workflowHint: "💡 Workflow: Contractor delivers → Inspector inspects → Owner approves",
    workflowDesc: "Each step requires uploading photos/video/reports. Rejection requires stating the reason and documenting the issue",
    contractorLabel: "Contractor", delivered: "✓ Delivered",
    inspectorLabel: "Inspector", approved: "✓ Approved", rejectedMark: "✕ Rejected",
    awaitingContractor: "⏳ Awaiting contractor delivery", awaitingInspector: "⏳ Awaiting inspector review",
    // Offers modal
    compareOffers: "📨 Compare Incoming Offers",
    contractorOffer: "Contractor Offer", inspectorOffer: "Inspector",
    loadingOffers: "Loading offers...",
    contractorOffers: "Contractor Offers", compareAndChoose: "Compare and choose the best",
    lowestPrice: "✨ Lowest Price",
    bhdTotal: "BHD Total", duration: "Duration", warranty: "Warranty", total: "Total",
    monthStr: "month",
    boqItemsLabel: "📋 BOQ Items", itemLabel: "item",
    andMore: "more items",
    confirmAcceptOffer: "Confirm accepting offer from",
    byValue: "for",
    contractSentEmail: "Contract will be sent by email immediately.",
    acceptOfferStart: "✅ Accept Offer & Start Project",
    offerAccepted: "Offer Accepted", contractSentByEmail: "Contract sent to email",
    inspectorAppsTitle: "Inspector Applications",
    noContractorOffers: "No contractor offers yet",
    noInspectorYet: "No inspector yet",
    offersAndTenders: "Offers & Tenders",
    reviewCompareOffers: "Review and compare contractor & inspector offers",
    newOfferLabel: "New Offer",
    youHaveNewOffers: "You have {0} new offer(s) awaiting your review",
    compareAcceptBest: "Compare offers and accept the best to start the project",
    createNewProjectForOffers: "Create a new project to receive contractor offers",
    projectsAwaitingQuotes: "Projects Awaiting Quotations",
    contractorOfferCount: "Contractor Offer",
    inspectorCount: "Inspector",
    ofContractPct: "of contract",
    yourRating: "Your Rating",
    sysAdmin: "🛡️ System Admin",
    projectsLabel: "Projects",
    noNotifications: "No notifications",
    availableProjects: "Available Projects",
    willNotifyNewProjects: "You will be notified when new projects are posted",
    projectsAwaitingPricing: "{0} project(s) awaiting pricing",
    projectsAwaitingInspector: "{0} project(s) awaiting quality inspector",
    tenderDescContractor: "Submit a detailed BOQ offer for any project open for pricing",
    tenderDescInspector: "Apply as a certified quality inspector for any of these projects",
    priceQuoteCount: "Price Quote",
    inspectorCountLabel: "Inspector",
    nominateSelf: "🔍 Apply as Inspector",
    qualityInspector: "Quality Inspector",
    unknownName: "Unknown",
    unknownCompany: "Unknown Company",
    sessionExpired: "Session expired — Please log in again",
    connectionError: "Connection error — Make sure the server is running",
    errorGeneric: "Error"
  }
};

// ═══════ MAIN APP ═══════
export default function App() {
  // Auth state
  var [tk, setTk] = useState(function() { return localStorage.getItem("ft_token") || null; });
  var [user, setUser] = useState(function() { try { var u = localStorage.getItem("ft_user"); return u ? JSON.parse(u) : null; } catch(e) { return null; } });
  var [selectedRole, setSelectedRole] = useState(null);
  var [lang, setLang] = useState(function() { return localStorage.getItem("ft_lang") || "ar"; });
  var t = T[lang] || T.ar;
  var isEn = lang === "en";

  function switchLang(newLang) {
    setLang(newLang);
    localStorage.setItem("ft_lang", newLang);
  }

  // UI state
  var [page, setPage] = useState("home");
  var [toast, setToast] = useState(null);
  var [modal, setModal] = useState(null);
  var [exp, setExp] = useState({});
  var [ld, setLd] = useState(false);

  // Data state
  var [dash, setDash] = useState({});
  var [projects, setProjects] = useState([]);
  var [proj, setProj] = useState(null);
  var [stages, setStages] = useState([]);
  var [quotations, setQuotations] = useState([]);
  var [inspApps, setInspApps] = useState([]);
  var [projFiles, setProjFiles] = useState([]);
  var [wallet, setWallet] = useState(null);
  var [txns, setTxns] = useState([]);
  var [notifs, setNotifs] = useState([]);
  var [contract, setContract] = useState(null);
  var [showContractView, setShowContractView] = useState(false);

  // Achievements state
  var [achievements, setAchievements] = useState([]);
  var [achLoading, setAchLoading] = useState(false);

  // Offers page state (for owner)
  var [offersProject, setOffersProject] = useState(null);
  var [offersQuotations, setOffersQuotations] = useState([]);
  var [offersInspApps, setOffersInspApps] = useState([]);
  var [offersLoading, setOffersLoading] = useState(false);

  // Auth form state (login screen — must stay in App)
  var [em, setEm] = useState("");
  var [pw, setPw] = useState("");
  var [authScreen, setAuthScreen] = useState("login"); // "login" | "register" | "otp" | "forgot" | "verify" | "reset"
  var [loginRole, setLoginRole] = useState(null);
  var [forgotEmail, setForgotEmail] = useState("");
  var [resetToken, setResetToken] = useState("");
  var [resetPw, setResetPw] = useState("");
  var [resetPw2, setResetPw2] = useState("");
  var [verifyStatus, setVerifyStatus] = useState(""); // "checking" | "ok" | "error"
  var [urlProcessed, setUrlProcessed] = useState(false);
  // OTP state
  var [otpUserId, setOtpUserId] = useState(null);
  var [otpPhone, setOtpPhone] = useState("");
  var [otpDevCode, setOtpDevCode] = useState(null);
  var [pendingLogo, setPendingLogo] = useState(null);
  // Owner special screens
  var [ownerScreen, setOwnerScreen] = useState(null); // null | "walletFund" | "completedProjects"
  // Developer state
  var [compounds, setCompounds] = useState([]);
  var [activeCompound, setActiveCompound] = useState(null);
  var [compoundDash, setCompoundDash] = useState(null);
  var [compoundUnits, setCompoundUnits] = useState([]);
  var [unitsGrid, setUnitsGrid] = useState([]);
  var [qualityIssues, setQualityIssues] = useState([]);
  var [devPage, setDevPage] = useState("overview"); // overview | compound | unit
  // Role switcher for preview
  var [roleOverride, setRoleOverride] = useState(null);
  var [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  // (All other form state moved to isolated memo components for performance)

  function show(m) { setToast(m); setTimeout(function () { setToast(null); }, 3000); }
  function tog(k) { setExp(function (p) { var n = Object.assign({}, p); n[k] = !n[k]; return n; }); }

  var realRole = user ? user.role : null;
  var role = roleOverride || realRole;
  var rc = role === "owner" ? C.ocean : role === "contractor" ? C.amber : role === "developer" ? "#7B1FA2" : C.green;
  var ri = role === "owner" ? <User size={14} /> : role === "contractor" ? <HardHat size={14} /> : role === "developer" ? <Building2 size={14} /> : <Search size={14} />;
  var rt = role === "owner" ? t.owner : role === "contractor" ? t.contractor : role === "inspector" ? t.inspector : role === "developer" ? t.developer : "";

  // ═══════ DATA FETCHING ═══════
  function fetchAchievements() {
    setAchLoading(true);
    call("/achievements", "GET", null, tk).then(function (d) {
      if (d.achievements) setAchievements(d.achievements);
      setAchLoading(false);
    });
  }

  function loadData(token, userRole) {
    var t = token || tk;
    var r = userRole || role;
    if (!t) return;
    // Preview mode: if the requested role differs from the real JWT role, pass
    // previewRole so the backend returns that role's dashboard structure.
    var previewQ = (user && r !== user.role) ? "?previewRole=" + r : "";
    // Parallel requests - better-sqlite3 with WAL mode handles concurrency
    var promises = [
      call("/dashboard" + previewQ, "GET", null, t).then(function (d) { if (!d.error) setDash(d); }),
      call("/projects", "GET", null, t).then(function (d) { if (d.projects) setProjects(d.projects); }),
      call("/notifications", "GET", null, t).then(function (d) { if (d.notifications) setNotifs(d.notifications); }),
      call("/achievements", "GET", null, t).then(function (d) { if (d.achievements) setAchievements(d.achievements); })
    ];
    if (r === "owner") {
      promises.push(call("/wallet", "GET", null, t).then(function (w) {
        if (w.wallet) { setWallet(w.wallet); setTxns(w.transactions || []); }
      }));
    }
    if (r === "developer") {
      promises.push(call("/compounds", "GET", null, t).then(function (d) {
        if (d.compounds) {
          setCompounds(d.compounds);
          // Auto-load first compound dashboard
          if (d.compounds.length > 0) {
            var firstId = d.compounds[0].id;
            setActiveCompound(d.compounds[0]);
            call("/compounds/" + firstId + "/dashboard", "GET", null, t).then(function (cd) { if (!cd.error) setCompoundDash(cd); });
            call("/compounds/" + firstId + "/units/grid", "GET", null, t).then(function (g) { if (g.blocks) setUnitsGrid(g.blocks); });
            call("/compounds/" + firstId + "/units", "GET", null, t).then(function (u) { if (u.units) setCompoundUnits(u.units); });
            call("/compounds/" + firstId + "/quality-issues", "GET", null, t).then(function (q) { if (q.issues) setQualityIssues(q.issues); });
          }
        }
      }));
      promises.push(call("/wallet", "GET", null, t).then(function (w) {
        if (w.wallet) { setWallet(w.wallet); setTxns(w.transactions || []); }
      }));
    }
    Promise.all(promises);
  }
  function fetchProj(pid) {
    setLd(true);
    call("/projects/" + pid, "GET", null, tk).then(function (d) {
      if (d.project) {
        setProj(d.project);
        setStages(d.stages || []);
        setQuotations(d.quotations || []);
        setInspApps(d.inspector_applications || []);
        setProjFiles(d.project_files || []);
      }
      setLd(false);
    });
    // Also fetch contract
    call("/projects/" + pid + "/contract", "GET", null, tk).then(function (d) {
      setContract(d.contract || null);
    });
  }

  useEffect(function () { if (tk) loadData(); }, [tk]);

  // Handle URL query params for email verify and password reset
  useEffect(function () {
    if (urlProcessed) return;
    setUrlProcessed(true);
    var params = new URLSearchParams(window.location.search);
    var vToken = params.get("verify");
    var rToken = params.get("reset");
    if (vToken) {
      setAuthScreen("verify");
      setVerifyStatus("checking");
      call("/auth/verify-email", "POST", { token: vToken }).then(function (d) {
        setVerifyStatus(d.success ? "ok" : "error");
      });
    } else if (rToken) {
      setResetToken(rToken);
      setAuthScreen("reset");
    }
  }, []);

  // ═══════ AUTH ACTIONS ═══════
  function login(email, pass, loginRole) {
    setLd(true);
    call("/auth/login", "POST", { email: email, password: pass, role: loginRole }).then(function (d) {
      setLd(false);
      if (d.error) {
        if (d.needsVerification) {
          setAuthScreen("needsVerify");
          show("📧 " + d.error);
        } else {
          show("❌ " + d.error);
        }
        return;
      }
      // Normalize user fields (backend returns camelCase)
      var u = d.user;
      if (u.nameAr && !u.name_ar) u.name_ar = u.nameAr;
      if (u.companyNameAr && !u.company_name_ar) u.company_name_ar = u.companyNameAr;
      if (u.accountType && !u.account_type) u.account_type = u.accountType;
      if (u.bioAr && !u.bio_ar) u.bio_ar = u.bioAr;
      if (u.crNumber && !u.cr_number) u.cr_number = u.crNumber;
      if (u.profileImage && !u.profile_image) u.profile_image = u.profileImage;
      setTk(d.token); setUser(u); setPage("home"); setSelectedRole(null); setAuthScreen("login");
      localStorage.setItem("ft_token", d.token); localStorage.setItem("ft_user", JSON.stringify(u)); localStorage.setItem("ft_role", u.role);
      var greetName = (u.account_type || u.accountType) === "company" ? (u.company_name_ar || u.companyNameAr || u.name_ar || u.nameAr) : (u.name_ar || u.nameAr);
      show("✅ مرحباً " + greetName);
      loadData(d.token, u.role);
    });
  }
  function logout() {
    setTk(null); setUser(null); setSelectedRole(null); setProjects([]); setProj(null);
    setStages([]); setWallet(null); setTxns([]); setDash({}); setNotifs([]);
    setProjFiles([]); setQuotations([]); setInspApps([]); setAchievements([]);
    setPage("home"); setExp({});
    localStorage.removeItem("ft_token"); localStorage.removeItem("ft_user"); localStorage.removeItem("ft_role");
  }

  // ═══════ ACTIONS ═══════

  function doDeposit(amount, bank) {
    call("/wallet/deposit", "POST", { amount: Number(amount), bank: bank }, tk).then(function (d) {
      if (d.success) { show("✅ تم الإيداع — " + Number(amount).toLocaleString() + " د.ب"); setModal(null); loadData(); }
      else show("❌ " + (d.error || "خطأ"));
    });
  }

  function acceptQuotation(qid) {
    call("/projects/quotations/" + qid + "/accept", "POST", {}, tk).then(function (d) {
      if (d.success) { show("✅ تم قبول العرض وتم حجز المبلغ من المحفظة"); loadData(); if (proj) fetchProj(proj.id); }
      else if (d.errorCode === "INSUFFICIENT_BALANCE") {
        show("💰 رصيد المحفظة غير كافٍ — المطلوب: " + (d.required || 0).toLocaleString() + " د.ب — المتاح: " + (d.available || 0).toLocaleString() + " د.ب");
        setPage("wallet");
      }
      else show("❌ " + (d.error || "خطأ"));
    });
  }

  // Download BOQ Excel file for a quotation — auth-protected, owner + submitter + admin only.
  // Uses fetch → blob → anchor trick because <a href> can't carry the Bearer token.
  function downloadBoq(qid, suggestedName) {
    fetch(BASE + "/projects/quotations/" + qid + "/boq-file", {
      method: "GET",
      headers: { "Authorization": "Bearer " + tk }
    }).then(function (r) {
      if (!r.ok) {
        if (r.status === 403) { show("❌ غير مصرح — لا يمكن الاطلاع على هذا الملف"); return null; }
        if (r.status === 404) { show("❌ لا يوجد ملف BOQ مرفق لهذا العرض"); return null; }
        show("❌ فشل تحميل الملف"); return null;
      }
      return r.blob();
    }).then(function (blob) {
      if (!blob) return;
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = suggestedName || ("BOQ-" + qid + ".xlsx");
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { window.URL.revokeObjectURL(url); a.remove(); }, 100);
      show("📥 تم تحميل ملف BOQ");
    }).catch(function (e) { console.error("boq download", e); show("❌ خطأ في الاتصال"); });
  }

  function acceptInspector(appId) {
    call("/projects/inspector-applications/" + appId + "/accept", "POST", {}, tk).then(function (d) {
      if (d.success) { show("✅ تم تعيين المفتش"); loadData(); if (proj) fetchProj(proj.id); }
      else show("❌ " + (d.error || "خطأ"));
    });
  }

  // ═══════════════════════════════════════════════
  // AUTH SCREENS (login / register / forgot / reset / verify)
  // ═══════════════════════════════════════════════
  if (!user) {
    var authWrap = function(children) {
      return <div style={{ fontFamily: "Tajawal, sans-serif", background: "linear-gradient(160deg, #0A1628 0%, #0F2847 30%, #1E3A5F 50%, #1A365D 70%, #0A1628 100%)", minHeight: "100vh", direction: "rtl", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
        {/* Ambient gradient circles */}
        <div style={{ position: "absolute", top: -120, right: -80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* Wave decoration at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(0deg, rgba(37,99,235,.08) 0%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: 24 }}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ marginBottom: 8 }}>
              <WhaleLogo size={80} />
            </motion.div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>FIRST <span style={{ color: "#60A5FA" }}>TOUCH</span></div>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,.8)", marginTop: 4, letterSpacing: 1 }}>{isEn ? "Construction Management Platform" : "منصة إدارة مشاريع البناء"}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ background: "rgba(255,255,255,.06)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
            {children}
          </motion.div>
        </div>
      </div>;
    };

    // ── Verify Email screen ──
    if (authScreen === "verify" || authScreen === "needsVerify") {
      return authWrap(
        <div style={{ textAlign: "center" }}>
          {authScreen === "needsVerify" ? <div>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📧</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 8 }}>تحقق من بريدك الإلكتروني</div>
            <div style={{ fontSize: 12, color: C.t2, marginBottom: 16 }}>تم إرسال رابط التحقق إلى بريدك. افتح الرسالة واضغط على الرابط.</div>
            <Btn v="outline" f onClick={function(){ setAuthScreen("login"); setSelectedRole(null); }}>→ العودة لتسجيل الدخول</Btn>
          </div> : verifyStatus === "checking" ? <div>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 13, color: C.t2 }}>جاري التحقق من البريد...</div>
          </div> : verifyStatus === "ok" ? <div>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, color: C.green, marginBottom: 8 }}>تم تأكيد البريد بنجاح!</div>
            <div style={{ fontSize: 12, color: C.t2, marginBottom: 16 }}>يمكنك الآن تسجيل الدخول.</div>
            <Btn f onClick={function(){ setAuthScreen("login"); window.history.replaceState({}, "", window.location.pathname); }}>🔐 تسجيل الدخول</Btn>
          </div> : <div>
            <div style={{ fontSize: 40, marginBottom: 10 }}>❌</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, color: C.red, marginBottom: 8 }}>رابط التحقق غير صحيح أو منتهي</div>
            <div style={{ fontSize: 12, color: C.t2, marginBottom: 16 }}>قد يكون الرابط انتهت صلاحيته (24 ساعة). اطلب رابطاً جديداً.</div>
            <Btn f onClick={function(){ setAuthScreen("login"); window.history.replaceState({}, "", window.location.pathname); }}>→ العودة</Btn>
          </div>}
        </div>
      );
    }

    // ── Reset Password screen ──
    if (authScreen === "reset") {
      return authWrap(<div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🔑 إعادة تعيين كلمة المرور</div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>أدخل كلمة المرور الجديدة</div>
        <Inp label="كلمة المرور الجديدة" type="password" value={resetPw} onChange={function(e){ setResetPw(e.target.value); }} ph="6 أحرف على الأقل" />
        <Inp label="تأكيد كلمة المرور" type="password" value={resetPw2} onChange={function(e){ setResetPw2(e.target.value); }} ph="أعد الإدخال" />
        <Btn f loading={ld} onClick={function(){
          if (resetPw.length < 6) { show("❌ كلمة المرور قصيرة جداً"); return; }
          if (resetPw !== resetPw2) { show("❌ كلمتا المرور غير متطابقتين"); return; }
          setLd(true);
          call("/auth/reset-password", "POST", { token: resetToken, password: resetPw }).then(function(d){
            setLd(false);
            if (d.success) {
              show("✅ " + d.message);
              setAuthScreen("login");
              setResetPw(""); setResetPw2(""); setResetToken("");
              window.history.replaceState({}, "", window.location.pathname);
            } else show("❌ " + (d.error || "خطأ"));
          });
        }}>✅ تغيير كلمة المرور</Btn>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span onClick={function(){ setAuthScreen("login"); }} style={{ fontSize: 11, color: C.ocean, cursor: "pointer", textDecoration: "underline" }}>→ العودة لتسجيل الدخول</span>
        </div>
      </div>);
    }

    // ── Forgot Password screen ──
    if (authScreen === "forgot") {
      return authWrap(<div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🔓 نسيت كلمة المرور</div>
        <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>سنرسل لك رابط إعادة التعيين على بريدك</div>
        <Inp label="البريد الإلكتروني" value={forgotEmail} onChange={function(e){ setForgotEmail(e.target.value); }} ph="name@example.com" />
        <Btn f loading={ld} onClick={function(){
          if (!forgotEmail.trim()) { show("❌ البريد مطلوب"); return; }
          setLd(true);
          call("/auth/forgot-password", "POST", { email: forgotEmail }).then(function(d){
            setLd(false);
            show("✅ " + (d.message || "تم الإرسال"));
            setAuthScreen("login");
            setForgotEmail("");
          });
        }}>📧 إرسال رابط الاسترداد</Btn>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span onClick={function(){ setAuthScreen("login"); }} style={{ fontSize: 11, color: C.ocean, cursor: "pointer", textDecoration: "underline" }}>→ العودة لتسجيل الدخول</span>
        </div>
      </div>);
    }

    // ── Register screen ──
    if (authScreen === "register") {
      return authWrap(<RegisterForm
        onBack={function(){ setAuthScreen("login"); setSelectedRole(null); }}
        onSubmit={function(data, onErr){
          var logoF = data._logoFile; delete data._logoFile;
          setLd(true);
          call("/auth/register", "POST", data).then(function(d){
            setLd(false);
            if (d.error) { if(onErr) onErr(d.error); else show("❌ " + d.error); return; }
            if (logoF) setPendingLogo(logoF);
            // After register → send OTP and go to OTP screen
            call("/auth/send-otp", "POST", { phone: data.phone }).then(function(otpRes){
              if (otpRes.userId) {
                setOtpUserId(otpRes.userId);
                setOtpPhone(data.phone);
                setOtpDevCode(otpRes.devOtp || null);
                setAuthScreen("otp");
              } else if (d.needsVerification) {
                setAuthScreen("needsVerify");
              } else {
                setAuthScreen("login");
                show("✅ " + (d.message || "تم إنشاء الحساب — سجّل دخولك الآن"));
              }
            });
          });
        }}
      />);
    }

    // ── OTP screen ──
    if (authScreen === "otp") {
      return authWrap(<OtpScreen
        userId={otpUserId}
        phone={otpPhone}
        devOtp={otpDevCode}
        onBack={function(){ setAuthScreen("register"); }}
        onSuccess={function(d){
          var u = d.user; var t = d.token;
          setTk(t); setUser(u);
          localStorage.setItem("ft_token", t);
          localStorage.setItem("ft_user", JSON.stringify(u));
          setAuthScreen("login");
          setPage("home");
          loadData(t, u.role);
          show("✅ مرحباً " + u.nameAr + " — تم التحقق بنجاح!");
          // Upload company logo if pending
          if (pendingLogo) {
            var fd = new FormData();
            fd.append("logo", pendingLogo);
            fetch((window.__API || "http://localhost:5000/api") + "/auth/company-logo", {
              method: "POST", headers: { "Authorization": "Bearer " + t }, body: fd
            }).then(function(r){ return r.json(); }).then(function(lr){
              if (lr.companyLogo) {
                u.company_logo = lr.companyLogo; u.companyLogo = lr.companyLogo;
                setUser(Object.assign({}, u));
                localStorage.setItem("ft_user", JSON.stringify(u));
              }
            }).catch(function(){});
            setPendingLogo(null);
          }
        }}
      />);
    }

    // ── Landing screen — Login / Register ──
    if (!selectedRole) {
      return (
        <div style={{ fontFamily: "Tajawal, sans-serif", background: "linear-gradient(160deg, #0A1628 0%, #0F2847 30%, #1E3A5F 50%, #1A365D 70%, #0A1628 100%)", minHeight: "100vh", direction: isEn ? "ltr" : "rtl", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto", position: "relative" }}>
          {/* Ocean-themed ambient glow effects */}
          <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          {/* Wave bottom decoration */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(0deg, rgba(37,99,235,.06) 0%, transparent 100%)", pointerEvents: "none" }} />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

            {/* Language Selector */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", background: "rgba(255,255,255,.06)", borderRadius: 14, padding: 3, border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(20px)" }}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={function(){ switchLang("ar"); }} style={{ padding: "7px 22px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "all .3s", background: lang === "ar" ? C.gBlue : "transparent", color: lang === "ar" ? "#fff" : "rgba(255,255,255,.45)", boxShadow: lang === "ar" ? C.shadowBlue : "none" }}>العربية</motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={function(){ switchLang("en"); }} style={{ padding: "7px 22px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "all .3s", background: lang === "en" ? C.gBlue : "transparent", color: lang === "en" ? "#fff" : "rgba(255,255,255,.45)", boxShadow: lang === "en" ? C.shadowBlue : "none" }}>English</motion.div>
              </div>
            </motion.div>

            {/* Logo — Blue Whale */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} style={{ textAlign: "center", marginBottom: 32 }}>
              <motion.div animate={{ y: [0, -8, 0], filter: ["drop-shadow(0 8px 24px rgba(37,99,235,.3))", "drop-shadow(0 16px 40px rgba(37,99,235,.5))", "drop-shadow(0 8px 24px rgba(37,99,235,.3))"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} style={{ margin: "0 auto 14px", width: 100, height: 100 }}>
                <WhaleLogo size={100} />
              </motion.div>
              <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>FIRST <span style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA,#93C5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TOUCH</span></div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,.5)", marginTop: 5, letterSpacing: 3, textTransform: "uppercase" }}>{t.securingBuild}</div>
            </motion.div>

            {/* Feature highlights */}
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32 }}>
              {[{ic:<Shield size={20} color="#60A5FA" />,l:t.guaranteedWallet},{ic:<ScrollText size={20} color="#60A5FA" />,l:t.digitalContracts},{ic:<BadgeCheck size={20} color="#60A5FA" />,l:t.tripleApproval}].map(function(f,i){
                return <motion.div key={i} variants={fadeUp} style={{ textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(37,99,235,.08)", border: "1px solid rgba(59,130,246,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", backdropFilter: "blur(12px)" }}>{f.ic}</div>
                  <div style={{ fontSize: 9, color: "rgba(148,163,184,.6)", fontWeight: 600 }}>{f.l}</div>
                </motion.div>;
              })}
            </motion.div>

            {/* Login Form — Glass Card */}
            <motion.div variants={scaleIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 24, marginBottom: 16, backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 20 }}>{t.login}</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 5, fontWeight: 600 }}>{t.email}</div>
                <input value={em} onChange={function(e){ setEm(e.target.value); }} placeholder="email@example.com" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#fff", fontFamily: "Tajawal", fontSize: 13, boxSizing: "border-box", outline: "none", direction: "ltr", textAlign: isEn ? "left" : "right", transition: "border-color .3s, background .3s" }} onFocus={function(e){ e.target.style.borderColor="rgba(59,130,246,.6)"; e.target.style.background="rgba(59,130,246,.08)"; }} onBlur={function(e){ e.target.style.borderColor="rgba(255,255,255,.12)"; e.target.style.background="rgba(255,255,255,.06)"; }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 5, fontWeight: 600 }}>{t.password}</div>
                <input type="password" value={pw} onChange={function(e){ setPw(e.target.value); }} placeholder="••••••" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#fff", fontFamily: "Tajawal", fontSize: 13, boxSizing: "border-box", outline: "none", direction: "ltr", textAlign: isEn ? "left" : "right", transition: "border-color .3s, background .3s" }} onFocus={function(e){ e.target.style.borderColor="rgba(59,130,246,.6)"; e.target.style.background="rgba(59,130,246,.08)"; }} onBlur={function(e){ e.target.style.borderColor="rgba(255,255,255,.12)"; e.target.style.background="rgba(255,255,255,.06)"; }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 8, fontWeight: 600 }}>{isEn ? "Login role" : "الدخول كـ"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }}>
                  {[
                    { key: null, label: isEn ? "Auto" : "تلقائي" },
                    { key: "owner", label: t.owner },
                    { key: "contractor", label: t.contractor },
                    { key: "inspector", label: t.inspector },
                    { key: "developer", label: t.developer }
                  ].map(function(opt) {
                    var active = opt.key === loginRole || (!opt.key && !loginRole);
                    return <motion.div
                      key={opt.key || "auto"}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={function(){ setLoginRole(opt.key); }}
                      style={{
                        padding: "10px 6px",
                        borderRadius: 12,
                        border: active ? "1.5px solid rgba(96,165,250,.85)" : "1px solid rgba(255,255,255,.08)",
                        background: active ? "rgba(37,99,235,.16)" : "rgba(255,255,255,.04)",
                        color: active ? "#fff" : "rgba(255,255,255,.7)",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        lineHeight: 1.35
                      }}
                    >{opt.label}</motion.div>;
                  })}
                </div>
              </div>
              <motion.button disabled={ld} onClick={function(){ login(em, pw, loginRole); }} whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(37,99,235,.4)" }} whileTap={{ scale: 0.97 }} style={{ width: "100%", padding: "13px 0", borderRadius: 14, border: "none", background: C.gBlue, color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "Tajawal", cursor: ld ? "not-allowed" : "pointer", boxShadow: C.shadowBlue, letterSpacing: 0.5 }}>{ld ? (isEn ? "⏳ Logging in..." : "⏳ جاري الدخول...") : t.loginBtn}</motion.button>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <span onClick={function(){ setAuthScreen("forgot"); }} style={{ fontSize: 11, color: "rgba(255,255,255,.35)", cursor: "pointer", transition: "color .2s" }} onMouseOver={function(e){e.target.style.color="rgba(96,165,250,.8)";}} onMouseOut={function(e){e.target.style.color="rgba(255,255,255,.35)";}}>{t.forgotPw}</span>
              </div>
            </motion.div>

            {/* Demo Quick Login */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.35 }} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginBottom: 8, textAlign: "center", letterSpacing: 1 }}>{t.demoAccount}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { e: "hassan.isa.ali.nasser@gmail.com", i: "🏗️", l: isEn ? "Dr. Najib (Owner)" : "د. نجيب (مالك)", g: C.gBlue },
                  { e: "owner@firsttouch.bh", i: "👤", l: isEn ? "Owner" : "مالك", g: C.gBlue },
                  { e: "contractor@firsttouch.bh", i: "👷", l: isEn ? "Contractor" : "مقاول", g: C.gAmber }
                ].map(function(u) {
                  return <motion.div key={u.e} whileHover={{ y: -3, borderColor: "rgba(59,130,246,.4)" }} whileTap={{ scale: 0.95 }} onClick={function(){ login(u.e, "123456", null); }} style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 8px", cursor: "pointer", textAlign: "center", backdropFilter: "blur(8px)", transition: "border-color .3s" }}>
                    <div style={{ fontSize: 22, marginBottom: 5 }}>{u.i}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{u.l}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.25)", marginTop: 3, fontFamily: "monospace" }}>123456</div>
                  </motion.div>;
                })}
              </div>
            </motion.div>

            {/* Register CTA */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.45 }} style={{ textAlign: "center", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 8 }}>{isEn ? "Don't have an account?" : "ليس لديك حساب؟"}</div>
              <motion.div whileHover={{ scale: 1.04, boxShadow: "0 6px 24px rgba(245,158,11,.35)" }} whileTap={{ scale: 0.96 }} onClick={function(){ setAuthScreen("register"); }} style={{ display: "inline-block", padding: "11px 36px", borderRadius: 14, background: "linear-gradient(135deg,#F59E0B,#FBBF24)", color: "#0F172A", fontSize: 13, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 16px rgba(245,158,11,.3)", letterSpacing: 0.5 }}>{t.createAccount}</motion.div>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    // selectedRole is set but user is not logged in — redirect to landing
    setSelectedRole(null);
    return null;
  }

  // ═══════════════════════════════════════════════
  // ITEM RENDERER — Full workflow with files, comments, rejection reasons
  // ═══════════════════════════════════════════════
  // ═══════ STAGE FILE MANAGER — upload/view files per stage ═══════
  function StageFileManager({ stageId, files, role, token, onRefresh }) {
    var fileRef = useRef();
    var [uploading, setUploading] = useState(false);
    var stageFiles = files || [];

    function uploadFiles(e) {
      var selected = Array.from(e.target.files);
      if (selected.length === 0) return;
      setUploading(true);
      var formData = new FormData();
      selected.forEach(function (f) { formData.append("files", f); });
      fetch(BASE + "/projects/stages/" + stageId + "/files", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        body: formData
      }).then(function (r) { return r.json(); }).then(function (d) {
        setUploading(false);
        if (d.success) { show("✅ " + d.message); onRefresh(); }
        else show("❌ " + (d.error || "خطأ"));
      }).catch(function () { setUploading(false); show("❌ خطأ في الرفع"); });
    }

    function deleteFile(fileId) {
      if (!confirm("هل تريد حذف هذا الملف؟")) return;
      call("/projects/stage-files/" + fileId, "DELETE", null, token).then(function (d) {
        if (d.success) { show("✅ تم الحذف"); onRefresh(); }
        else show("❌ " + (d.error || "خطأ"));
      });
    }

    return <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.ocean }}>📁 ملفات المرحلة ({stageFiles.length})</div>
        <div onClick={function () { fileRef.current.click(); }} style={{ fontSize: 10, padding: "4px 10px", background: uploading ? C.brd : "rgba(26,111,181,.08)", border: "1.5px solid " + C.ocean, borderRadius: 8, cursor: uploading ? "default" : "pointer", color: C.ocean, fontWeight: 700 }}>
          {uploading ? "⏳ جاري الرفع..." : "📤 رفع ملفات"}
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.dwg,.xlsx" onChange={uploadFiles} style={{ display: "none" }} />
      </div>

      {stageFiles.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {stageFiles.map(function (f) {
          var isImg = f.file_type === "image";
          var isVid = f.file_type === "video";
          var hasUrl = f.file_path && (f.file_path.startsWith("http") || f.file_path.startsWith("uploads/"));
          var fullUrl = f.file_path && f.file_path.startsWith("http") ? f.file_path : (BASE.replace("/api", "/") + f.file_path);
          var roleColor = f.role === "contractor" ? C.amber : f.role === "inspector" ? C.green : C.ocean;
          var roleIcon = f.role === "contractor" ? "👷" : f.role === "inspector" ? "🔍" : "👤";

          return <div key={f.id} style={{ width: 100, border: "1.5px solid " + C.brd, borderRadius: 10, overflow: "hidden", background: "#FAFBFD", position: "relative" }}>
            {/* Delete button */}
            {(f.uploaded_by === (user && user.id) || role === "owner") && <div onClick={function () { deleteFile(f.id); }} style={{ position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(231,76,60,.85)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer", zIndex: 2 }}>✕</div>}

            {/* File preview */}
            <div onClick={function () { if (hasUrl) window.open(fullUrl, "_blank"); }} style={{ cursor: hasUrl ? "pointer" : "default", height: 68, display: "flex", alignItems: "center", justifyContent: "center", background: isImg && hasUrl ? "transparent" : "rgba(26,111,181,.03)" }}>
              {isImg && hasUrl
                ? <img src={fullUrl} alt={f.file_name} style={{ width: "100%", height: 68, objectFit: "cover" }} loading="lazy" />
                : <span style={{ fontSize: 28 }}>{isVid ? "🎥" : "📄"}</span>}
            </div>

            {/* File info */}
            <div style={{ padding: "4px 6px" }}>
              <div style={{ fontSize: 8, color: C.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 8, color: roleColor }}>{roleIcon} {f.role === "contractor" ? "مقاول" : f.role === "inspector" ? "مفتش" : "مالك"}</span>
                {f.file_size && <span style={{ fontSize: 7, color: C.t3 }}>{Math.round(f.file_size / 1024)}KB</span>}
              </div>
            </div>
          </div>;
        })}
      </div>}

      {stageFiles.length === 0 && <div style={{ fontSize: 10, color: C.t3, textAlign: "center", padding: "8px 0", background: "rgba(26,111,181,.02)", borderRadius: 8, border: "1px dashed " + C.brd }}>
        لا توجد ملفات — اضغط "رفع ملفات" لإضافة مخططات أو صور أو مستندات
      </div>}
    </div>;
  }

  function renderItem(item, stStatus) {
    var k = "i" + item.id;
    var isO = exp[k];
    var cD = item.contractor_done === 1;
    var iD = item.inspector_done === 1;
    var iA = item.inspector_approved === 1;
    var oD = item.owner_done === 1;
    var oA = item.owner_approved === 1;
    var done = oD && oA;
    var rej = (iD && !iA) || (oD && !oA);
    var lk = stStatus === "locked";
    var itemFiles = item.files || [];
    var itemComments = item.comments || [];

    return (
      <div key={k} style={{ background: done ? "rgba(14,173,105,.03)" : rej ? "rgba(231,76,60,.03)" : C.card, border: "1.5px solid " + (done ? "rgba(14,173,105,.2)" : rej ? "rgba(231,76,60,.2)" : cD && !done ? "rgba(232,114,12,.25)" : C.brd), borderRadius: 10, marginBottom: 8 }}>
        <div onClick={function () { if (!lk) tog(k); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: lk ? "default" : "pointer" }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, border: "2px solid " + (done ? C.green : rej ? C.red : cD ? C.amber : C.brd), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, background: done ? C.green : rej ? C.red : "transparent", color: (done || rej) ? "#fff" : C.t1 }}>
            {done ? "✓" : rej ? "✕" : cD && iA ? "⏳" : ""}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: done ? C.t3 : C.t1, textDecoration: done ? "line-through" : "none" }}>{item.text_ar}</span>
            {/* Show BOQ details */}
            {(item.unit || item.brand) && <div style={{ fontSize: 9, color: C.t3, marginTop: 1 }}>
              {item.quantity && item.unit && <span>{item.quantity} {item.unit}</span>}
              {item.unit_price > 0 && <span> × {Number(item.unit_price).toLocaleString()} د.ب</span>}
              {item.brand && <span> | {item.brand}</span>}
            </div>}
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {item.cost > 0 && <span style={{ fontSize: 9, color: C.gold, fontWeight: 700, marginLeft: 4 }}>{Number(item.cost).toLocaleString()}</span>}
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: cD ? C.green : "#DDE2EB" }} title="المقاول" />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: iD && iA ? C.green : iD ? C.red : "#DDE2EB" }} title="المفتش" />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: done ? C.green : oD ? C.red : "#DDE2EB" }} title="المالك" />
          </div>
          {!lk && <span style={{ fontSize: 10, color: C.t3, transform: isO ? "rotate(90deg)" : "none", transition: "0.2s" }}>◀</span>}
        </div>

        {isO && !lk && <div style={{ padding: "4px 12px 12px", borderTop: "1px solid " + C.brd }}>

          {/* ── STEP 1: CONTRACTOR ── */}
          <div style={{ display: "flex", gap: 8, padding: "10px 0", borderBottom: "1px solid #EDF1F7" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: cD ? "rgba(14,173,105,.08)" : "rgba(232,114,12,.08)", flexShrink: 0 }}><HardHat size={14} color={cD ? C.green : C.amber} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{t.contractorLabel} {cD && <span style={{ color: C.green, fontSize: 10 }}>{t.delivered}</span>}</div>
              {cD ? <div>
                {item.contractor_notes && <div style={{ fontSize: 10, color: C.t2, marginTop: 2 }}>📝 {item.contractor_notes}</div>}
                {item.quality_notes && <div style={{ fontSize: 10, color: C.green, marginTop: 2, padding: "4px 6px", background: "rgba(14,173,105,.05)", borderRadius: 4 }}>✅ جودة: {item.quality_notes}</div>}
                <div style={{ fontSize: 9, color: C.t3 }}>📅 {item.contractor_date ? item.contractor_date.substring(0, 10) : ""}</div>
                {/* Show contractor files */}
                {itemFiles.filter(function(f){return f.role==="contractor";}).length > 0 && <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {itemFiles.filter(function(f){return f.role==="contractor";}).map(function(f,i){
                    var isImg = f.file_type === "image";
                    var isVid = f.file_type === "video";
                    var hasUrl = f.file_path && (f.file_path.startsWith("http") || f.file_path.startsWith("data:"));
                    return <div key={i} onClick={function(){ if(hasUrl && isImg) window.open(f.file_path, "_blank"); }} style={{ cursor: hasUrl && isImg ? "pointer" : "default", borderRadius: 6, overflow: "hidden", border: "1.5px solid rgba(232,114,12,.3)", background: "rgba(232,114,12,.04)" }}>
                      {isImg && hasUrl
                        ? <img src={f.file_path} alt={f.file_name} style={{ width: 80, height: 60, objectFit: "cover", display: "block" }} loading="lazy" />
                        : <div style={{ width: 80, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 18 }}>{isVid ? "🎥" : "📄"}</span>
                          </div>}
                      <div style={{ fontSize: 8, color: C.amber, padding: "2px 4px", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
                    </div>;
                  })}
                </div>}
              </div> : role === "contractor" ? <div style={{ marginTop: 4 }}>
                <Btn v="amber" sm f onClick={function () { setModal({ type: "contractorSubmit", itemId: item.id, itemName: item.text_ar }); }}>📤 تسليم البند + رفع ملفات</Btn>
              </div> : <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{t.awaitingContractor}</div>}
            </div>
          </div>

          {/* ── STEP 2: INSPECTOR ── */}
          <div style={{ display: "flex", gap: 8, padding: "10px 0", borderBottom: "1px solid #EDF1F7", opacity: cD ? 1 : 0.35 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: iD && iA ? "rgba(14,173,105,.08)" : iD ? "rgba(231,76,60,.08)" : "rgba(26,111,181,.06)", flexShrink: 0 }}><Search size={14} color={iD && iA ? C.green : iD ? C.red : C.ocean} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{t.inspectorLabel} {iD && (iA ? <span style={{ color: C.green, fontSize: 10 }}>{t.approved}</span> : <span style={{ color: C.red, fontSize: 10 }}>{t.rejectedMark}</span>)}</div>
              {iD ? <div>
                {item.inspector_notes && <div style={{ fontSize: 10, color: iA ? C.t2 : C.red, marginTop: 2 }}>📝 {item.inspector_notes}</div>}
                {item.rejection_reason && <div style={{ fontSize: 10, color: C.red, marginTop: 2, padding: "4px 6px", background: "rgba(231,76,60,.05)", borderRadius: 4 }}>❌ سبب الرفض: {item.rejection_reason}</div>}
                <div style={{ fontSize: 9, color: C.t3 }}>📅 {item.inspector_date ? item.inspector_date.substring(0, 10) : ""}</div>
                {/* Show inspector files */}
                {itemFiles.filter(function(f){return f.role==="inspector";}).length > 0 && <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {itemFiles.filter(function(f){return f.role==="inspector";}).map(function(f,i){
                    var isImg = f.file_type === "image";
                    var isVid = f.file_type === "video";
                    var hasUrl = f.file_path && (f.file_path.startsWith("http") || f.file_path.startsWith("data:"));
                    return <div key={i} onClick={function(){ if(hasUrl && isImg) window.open(f.file_path, "_blank"); }} style={{ cursor: hasUrl && isImg ? "pointer" : "default", borderRadius: 6, overflow: "hidden", border: "1.5px solid rgba(14,173,105,.3)", background: "rgba(14,173,105,.04)" }}>
                      {isImg && hasUrl
                        ? <img src={f.file_path} alt={f.file_name} style={{ width: 80, height: 60, objectFit: "cover", display: "block" }} loading="lazy" />
                        : <div style={{ width: 80, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 18 }}>{isVid ? "🎥" : "📄"}</span>
                          </div>}
                      <div style={{ fontSize: 8, color: C.green, padding: "2px 4px", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
                    </div>;
                  })}
                </div>}
              </div> : cD && role === "inspector" ? <div style={{ marginTop: 4 }}>
                <Btn v="green" sm f onClick={function () { setModal({ type: "inspectorReview", itemId: item.id, itemName: item.text_ar }); }}>🔍 فحص واعتماد / رفض</Btn>
              </div> : <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{cD ? t.awaitingInspector : "🔒"}</div>}
            </div>
          </div>

          {/* ── STEP 3: OWNER ── */}
          <div style={{ display: "flex", gap: 8, padding: "10px 0", borderBottom: "1px solid #EDF1F7", opacity: iD && iA ? 1 : 0.35 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "rgba(14,173,105,.08)" : "rgba(124,58,237,.06)", flexShrink: 0 }}><User size={14} color={done ? C.green : C.purple} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>المالك {oD && (oA ? <span style={{ color: C.green, fontSize: 10 }}>✓ موافق 💰</span> : <span style={{ color: C.red, fontSize: 10 }}>✕ مرفوض</span>)}</div>
              {oD ? <div>
                {item.owner_rejection_reason && <div style={{ fontSize: 10, color: C.red, marginTop: 2, padding: "4px 6px", background: "rgba(231,76,60,.05)", borderRadius: 4 }}>❌ سبب الرفض: {item.owner_rejection_reason}</div>}
                <div style={{ fontSize: 9, color: C.t3 }}>📅 {item.owner_date ? item.owner_date.substring(0, 10) : ""}</div>
                {/* Show owner files */}
                {itemFiles.filter(function(f){return f.role==="owner";}).length > 0 && <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {itemFiles.filter(function(f){return f.role==="owner";}).map(function(f,i){
                    var isImg = f.file_type === "image";
                    var isVid = f.file_type === "video";
                    var hasUrl = f.file_path && (f.file_path.startsWith("http") || f.file_path.startsWith("data:"));
                    return <div key={i} onClick={function(){ if(hasUrl && isImg) window.open(f.file_path, "_blank"); }} style={{ cursor: hasUrl && isImg ? "pointer" : "default", borderRadius: 6, overflow: "hidden", border: "1.5px solid rgba(26,111,181,.3)", background: "rgba(26,111,181,.04)" }}>
                      {isImg && hasUrl
                        ? <img src={f.file_path} alt={f.file_name} style={{ width: 80, height: 60, objectFit: "cover", display: "block" }} loading="lazy" />
                        : <div style={{ width: 80, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 18 }}>{isVid ? "🎥" : "📄"}</span>
                          </div>}
                      <div style={{ fontSize: 8, color: C.ocean, padding: "2px 4px", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
                    </div>;
                  })}
                </div>}
              </div> : iD && iA && role === "owner" ? <div style={{ marginTop: 4 }}>
                <Btn v="green" sm f onClick={function () { setModal({ type: "ownerDecision", itemId: item.id, itemName: item.text_ar, itemCost: item.cost }); }}>👤 مراجعة واتخاذ قرار</Btn>
              </div> : <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{iD && iA ? "⏳ بانتظار موافقة المالك" : "🔒"}</div>}
            </div>
          </div>

          {/* ── COMMENTS SECTION ── */}
          <div style={{ padding: "8px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 4 }}>💬 التعليقات ({itemComments.length})</div>
            {itemComments.map(function (c, i) {
              var cRole = c.user_role === "owner" ? "👤" : c.user_role === "contractor" ? "👷" : "🔍";
              return <div key={i} style={{ display: "flex", gap: 6, padding: "6px 0", borderBottom: i < itemComments.length - 1 ? "1px solid #EDF1F7" : "none" }}>
                <span style={{ fontSize: 12 }}>{cRole}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600 }}>{c.user_name}</div>
                  <div style={{ fontSize: 10, color: C.t2 }}>{c.text}</div>
                  <div style={{ fontSize: 8, color: C.t3 }}>{(c.created_at || "").substring(0, 16)}</div>
                </div>
              </div>;
            })}
            {/* Add comment — isolated component prevents re-render lag */}
            <CommentInput onSubmit={function (text) {
              call("/items/" + item.id + "/comments", "POST", { text: text }, tk).then(function (d) {
                if (d.success) { show("✅ تم إضافة التعليق"); if (proj) fetchProj(proj.id); }
                else show("❌ " + (d.error || "خطأ"));
              });
            }} />
          </div>

        </div>}
      </div>
    );
  }

  // ═══════ STAGE RENDERER ═══════
  function renderStage(stage, si) {
    var sk = "s" + stage.id;
    var sO = exp[sk];
    var allItems = [];
    (stage.sub_stages || []).forEach(function (s) { (s.items || []).forEach(function (i) { allItems.push(i); }); });
    var dn = allItems.filter(function (i) { return i.owner_done === 1 && i.owner_approved === 1; }).length;
    var pct = allItems.length > 0 ? Math.round(dn / allItems.length * 100) : 0;
    var st = stage.status;
    var stageGrad = st === "completed" ? C.gGreen : st === "locked" ? "linear-gradient(135deg,#B0BEC5,#90A4AE)" : C.gAmber;
    var stageBorder = st === "completed" ? C.green : st === "active" ? C.amber : C.brd;
    var stageIcons = ["🏗️", "🧱", "⚡", "🚿", "🎨"];
    var stageIcon = stageIcons[si] || "🔨";
    return (
      <div key={sk} style={{ background: C.card, border: "2px solid " + stageBorder, borderRadius: 16, marginBottom: 12, opacity: st === "locked" ? 0.45 : 1, overflow: "hidden", boxShadow: st === "active" ? "0 4px 16px rgba(232,114,12,.12)" : "0 2px 8px rgba(13,27,42,.07)" }}>
        {/* Top gradient line */}
        <div style={{ height: 3, background: stageGrad }} />
        <div onClick={function () { if (st !== "locked") tog(sk); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px 10px", cursor: st === "locked" ? "default" : "pointer" }}>
          {/* Stage icon / number badge */}
          <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: st === "completed" || st === "locked" ? 18 : 13, fontWeight: 900, color: "#fff", background: stageGrad, flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,.15)" }}>
            {st === "completed" ? "✅" : st === "locked" ? "🔒" : stageIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: st === "locked" ? C.t3 : C.t1, marginBottom: 2 }}>
              {stage.name_ar}
              {st === "active" && <span style={{ marginRight: 6, fontSize: 10, background: "rgba(232,114,12,.12)", color: C.amber, padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>جاري ⚡</span>}
              {st === "completed" && <span style={{ marginRight: 6, fontSize: 10, background: "rgba(14,173,105,.1)", color: C.green, padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>{t.completedCheck}</span>}
            </div>
            <div style={{ fontSize: 10, color: C.t3 }}>
              {dn}/{allItems.length} {t.itemsDone}
              {role !== "inspector" && stage.budget > 0 && <span style={{ color: C.gold, fontWeight: 700 }}> — {Number(stage.budget).toLocaleString()} د.ب</span>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: st === "completed" ? C.green : st === "locked" ? C.t3 : C.amber }}>{pct}%</div>
            </div>
            {st !== "locked" && <div style={{ width: 26, height: 26, borderRadius: 7, background: sO ? "rgba(26,111,181,.08)" : "#F4F7FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: C.t3, display: "block", transform: sO ? "rotate(270deg)" : "rotate(90deg)", transition: "0.2s" }}>▲</span>
            </div>}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ padding: "0 14px 10px" }}><PB v={pct} c={st === "completed" ? "green" : st === "locked" ? "outline" : "amber"} /></div>

        {/* ── Stage Files Section ── */}
        {sO && st !== "locked" && <div style={{ borderTop: "1px solid " + C.brd, padding: "10px 14px" }}>
          <StageFileManager stageId={stage.id} files={stage.stage_files || []} role={role} token={tk} onRefresh={function(){ if(proj) fetchProj(proj.id); }} />
        </div>}

        {/* Expanded sub-stages */}
        {sO && st !== "locked" && <div style={{ borderTop: "1px solid " + C.brd }}>
          {(stage.sub_stages || []).map(function (sub) {
            var subK = "ss" + sub.sub_stage.id;
            var subO = exp[subK];
            var subItems = sub.items || [];
            var subDn = subItems.length > 0 && subItems.every(function (i) { return i.owner_done === 1 && i.owner_approved === 1; });
            var subPct = subItems.length > 0 ? Math.round(subItems.filter(function(i){ return i.owner_done === 1 && i.owner_approved === 1; }).length / subItems.length * 100) : 0;
            return <div key={subK} style={{ borderBottom: "1px solid #EDF1F7" }}>
              <div onClick={function () { tog(subK); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 10px 24px", cursor: "pointer", background: subO ? "rgba(26,111,181,.02)" : "transparent" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", background: subDn ? "rgba(14,173,105,.12)" : "rgba(232,114,12,.08)", color: subDn ? C.green : C.amber, flexShrink: 0 }}>{subDn ? "✓" : "•"}</div>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: C.t1 }}>{sub.sub_stage.name_ar}</span>
                <span style={{ fontSize: 10, color: subDn ? C.green : C.t3, fontWeight: 700 }}>{subPct}%</span>
                <Badge c={subDn ? "green" : "amber"}>{subDn ? t.stCompleted : t.progressLabel}</Badge>
                <span style={{ fontSize: 9, color: C.t3, transform: subO ? "rotate(270deg)" : "rotate(90deg)", transition: "0.2s", display: "block" }}>▲</span>
              </div>
              {subO && <div style={{ padding: "0 14px 10px 40px" }}>
                {subItems.map(function (it) { return renderItem(it, st); })}
              </div>}
            </div>;
          })}
        </div>}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // PAGES
  // ═══════════════════════════════════════════════

  var openProjects = projects.filter(function (p) { return p.status === "awaiting_pricing" || p.status === "new" || p.status === "design_required" || p.status === "open"; });
  var activeP = projects.find(function (p) { return p.status === "active" && (role === "owner" ? p.owner_id === user.id : role === "contractor" ? p.contractor_id === user.id : p.inspector_id === user.id); });

  // ── HOME: Owner Dashboard ──
  function renderOwnerHome() {
    // Sub-screen: Wallet Funding
    if (ownerScreen === "walletFund") {
      return <div>
        <WalletFundingScreen
          token={tk}
          onBack={function(){ setOwnerScreen(null); }}
          onSuccess={function(){
            setOwnerScreen(null);
            loadData(tk, "owner");
          }}
        />
      </div>;
    }

    // Sub-screen: Completed Projects Showcase
    if (ownerScreen === "completedProjects") {
      return <div>
        <CompletedProjectsScreen
          onBack={function(){ setOwnerScreen(null); }}
          onSelectContractor={null}
        />
      </div>;
    }

    var ct = dash.contract;
    var sp = dash.stage_progress || [];
    var api = dash.active_project_info;

    // Main owner home
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    {/* Announcement Banner */}
    <AnnouncementBanner lang={lang} />
    {/* Header greeting */}
    <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ background: "linear-gradient(135deg,#0A1628 0%,#1E3A5F 50%,#2563EB 100%)", borderRadius: 20, padding: 22, color: "#fff", marginBottom: 16, position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(37,99,235,.2)" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(96,165,250,.12)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(139,92,246,.1)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative" }}>
        {(user.account_type || user.accountType) === "company" && (user.company_logo || user.companyLogo)
          ? <img src={(user.company_logo || user.companyLogo).startsWith("http") ? (user.company_logo || user.companyLogo) : (window.__API || "http://localhost:5000").replace("/api","") + "/" + (user.company_logo || user.companyLogo)} alt="logo" style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,.2)" }} />
          : <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, backdropFilter: "blur(8px)" }}>{(user.account_type || user.accountType) === "company" ? "🏢" : "👤"}</div>}
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.3 }}>{t.hello} {(function(){ var isCompany = (user.account_type || user.accountType) === "company"; if (isCompany) return user.company_name_ar || user.companyNameAr || user.name_ar || user.nameAr; return isEn ? (user.name_en || user.nameEn || user.name_ar || user.nameAr) : (user.name_ar || user.nameAr); })()} 👋</div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{(user.account_type || user.accountType) === "company" ? (isEn ? "Company Projects Manager" : "مسؤول مشاريع الشركة") : t.ownerRole}</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.06)" }}>
        <div>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 2 }}>{t.escrowWallet}</div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>{t.walletComingSoonMsg}</div>
        </div>
        <Badge c="gold">{t.comingSoon}</Badge>
      </div>
    </motion.div>

    {/* 3 Main Action Cards */}
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, marginBottom: 10 }}>{t.whatToDo}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, rgba(14,173,105,.04), rgba(14,173,105,.08))", border: "2px solid rgba(14,173,105,.15)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, opacity: 0.55, cursor: "default", position: "relative" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, opacity: 0.5 }}>💰</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{t.fundWallet}</div>
          <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{t.fundWalletDesc}</div>
        </div>
        <Badge c="gold">{t.comingSoon}</Badge>
      </div>
      <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(139,92,246,.2)" }} whileTap={{ scale: 0.98 }} onClick={function(){ setModal("aiUpload"); }} style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, rgba(139,92,246,.06), rgba(139,92,246,.14))", border: "1.5px solid rgba(139,92,246,.3)", borderRadius: 18, padding: "18px 20px", marginBottom: 10, cursor: "pointer", boxShadow: "0 4px 20px rgba(139,92,246,.1)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(139,92,246,.06)", pointerEvents: "none" }} />
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: "0 4px 16px rgba(139,92,246,.3)" }}>🤖</motion.div>
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#7C3AED" }}>🏗️ رفع مشروع جديد</div>
          <div style={{ fontSize: 11, color: C.t2, marginTop: 4, lineHeight: 1.5 }}>ارفع ملفات المشروع (PDF / Word) — الذكاء الاصطناعي سيحلّل ويُنشئ المشروع تلقائياً مع المراحل وجدول الكميات</div>
        </div>
        <span style={{ color: "#8B5CF6", fontSize: 20, fontWeight: 900 }}>←</span>
      </motion.div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, rgba(212,160,23,.04), rgba(212,160,23,.08))", border: "2px solid rgba(212,160,23,.15)", borderRadius: 14, padding: "14px 16px", opacity: 0.55, cursor: "default", position: "relative" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.5 }}><Trophy size={24} color="#fff" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{t.achievementsGallery}</div>
          <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{t.achievementsDesc}</div>
        </div>
        <Badge c="gold">{t.comingSoon}</Badge>
      </div>
    </div>

    {/* ── Pending approvals alert ── */}
    {(dash.pending_approvals || 0) > 0 && <div onClick={function(){ if(activeP) { fetchProj(activeP.id); setPage("tracking"); } }} style={{ background: "linear-gradient(135deg,rgba(232,114,12,.1),rgba(232,114,12,.06))", border: "1.5px solid rgba(232,114,12,.35)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gAmber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock size={16} color="#fff" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.amber }}>{isEn ? dash.pending_approvals + " " + t.itemPendingApproval : t.thereAre + " " + dash.pending_approvals + " " + t.itemPendingApproval}</div>
        <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>{t.tapToReview}</div>
      </div>
      <span style={{ color: C.amber, fontSize: 16 }}>{isEn ? "→" : "←"}</span>
    </div>}

    {/* ── Pending offers alert ── */}
    {(dash.pending_quotations || 0) > 0 && <div onClick={function(){ setPage("offers"); }} style={{ background: "linear-gradient(135deg,rgba(212,160,23,.09),rgba(212,160,23,.05))", border: "1.5px solid rgba(212,160,23,.3)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gGold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Coins size={16} color="#fff" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{dash.pending_quotations} {t.newQuotations}</div>
        <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>{t.reviewOffers}</div>
      </div>
      <span style={{ color: C.gold, fontSize: 16 }}>{isEn ? "→" : "←"}</span>
    </div>}

    {/* Stats row */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
      <StatCard v={dash.pending_approvals || 0} l={t.pendingYourApproval} ic={<Clock size={18} />} cl={C.amber} />
      <StatCard v={dash.active_projects || 0} l={t.activeProjects} ic={<Construction size={18} />} cl={C.ocean} />
      <StatCard v={dash.pending_quotations || 0} l={t.newQuotationOffers} ic={<Coins size={18} />} cl={C.gold} />
      <StatCard v={dash.completed_projects || 0} l={t.completedProjects} ic={<CheckCircle2 size={18} />} cl={C.green} />
    </div>

    {/* ══════ CONTRACT — FIXED AGREEMENT DATA (لا تتغير بعد الاتفاق) ══════ */}
    {ct && ct.locked && <div style={{ background: C.card, border: "2px solid " + C.ocean, borderRadius: 16, marginBottom: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(21,101,192,.1)" }}>
      <div style={{ background: C.gBlue, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📜</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{t.agreedContract}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)" }}>{t.fixedData}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10 }}>🔒</span>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>مُثبّت</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {/* Contractor info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: 10, background: "rgba(26,111,181,.04)", borderRadius: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(232,114,12,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👷</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.t1 }}>{ct.contractorName}</div>
            <div style={{ fontSize: 10, color: C.t3 }}>{ct.contractorCompany}</div>
          </div>
          {ct.contractorRating > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: C.gold }}>⭐ {Number(ct.contractorRating).toFixed(1)}</div>}
        </div>
        {/* Contract terms grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={{ padding: 10, background: "rgba(14,173,105,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>💰 المبلغ المتفق</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.green }}>{Number(ct.agreedPrice || 0).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: C.t3 }}>د.ب</div>
          </div>
          <div style={{ padding: 10, background: "rgba(21,101,192,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>📅 المدة المتفقة</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.ocean }}>{ct.durationMonths || 0}</div>
            <div style={{ fontSize: 9, color: C.t3 }}>شهر</div>
          </div>
          <div style={{ padding: 10, background: "rgba(124,58,237,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>🛡️ الضمان</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.purple }}>{ct.warrantyMonths || 0}</div>
            <div style={{ fontSize: 9, color: C.t3 }}>شهر</div>
          </div>
          <div style={{ padding: 10, background: "rgba(232,114,12,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>💸 تم صرفه</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.amber }}>{Number(dash.total_paid_to_contractor || 0).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: C.t3 }}>د.ب</div>
          </div>
        </div>
        {/* BOQ Items (fixed) */}
        {ct.boqItems && ct.boqItems.length > 0 && <div>
          <div onClick={function(){ tog("contractBoq"); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "6px 0" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>📋 بنود جدول الكميات ({ct.boqItems.length})</span>
            <span style={{ fontSize: 10, color: C.t3 }}>{exp.contractBoq ? "▲" : "▼"}</span>
          </div>
          {exp.contractBoq && <div style={{ border: "1px solid " + C.brd, borderRadius: 8, overflow: "hidden" }}>
            {ct.boqItems.map(function(item, idx) {
              return <div key={idx} style={{ padding: "8px 10px", borderBottom: idx < ct.boqItems.length - 1 ? "1px solid " + C.brd : "none", background: idx % 2 === 0 ? "#FAFBFD" : "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: C.t1 }}>{item.description || item.stage || "بند " + (idx+1)}</span>
                  <span style={{ fontWeight: 800, color: C.amber }}>{Number(item.total || 0).toLocaleString()} د.ب</span>
                </div>
                {item.quantity && <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{item.quantity} {item.unit} × {Number(item.unit_price || 0).toLocaleString()} د.ب</div>}
              </div>;
            })}
          </div>}
        </div>}
      </div>
    </div>}

    {/* ══════ STAGE PROGRESS — Live updates from dashboard ══════ */}
    {sp.length > 0 && <div style={{ marginBottom: 14 }}>
      <SectionTitle ic={<BarChart3 size={16} color={C.ocean} />}>{isEn ? "Construction Stage Progress" : "تقدم مراحل البناء"}</SectionTitle>
      {sp.map(function(stage) {
        var stIc = stage.status === "completed" ? "✅" : stage.status === "active" ? "🔵" : "🔒";
        return <Card key={stage.id} onClick={function(){ if(activeP) { fetchProj(activeP.id); setPage("tracking"); } }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{stIc}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{stage.nameAr}</div>
              <div style={{ fontSize: 9, color: C.t3 }}>
                {stage.completedItems}/{stage.totalItems} {t.itemDone}
                {stage.status === "active" && " • " + stage.contractorDone + " تسليم مقاول • " + stage.inspectorDone + " فحص"}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: stage.progress >= 100 ? C.green : stage.progress > 0 ? C.amber : C.t3 }}>{stage.progress}%</div>
              <div style={{ fontSize: 8, color: C.t3 }}>{Number(stage.paidCost || 0).toLocaleString()} د.ب</div>
            </div>
          </div>
          <PB v={stage.progress} c={stage.progress >= 100 ? "green" : "amber"} />
        </Card>;
      })}
    </div>}

    {/* Financial Overview Card — Coming Soon */}
    <div style={{ background: C.card, border: "1.5px solid " + C.brd, borderRadius: 16, padding: "16px 18px", marginBottom: 14, boxShadow: "0 4px 14px rgba(13,27,42,.06)", opacity: 0.55 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{t.financialSummary}</span>
        <Badge c="gold">{t.comingSoon}</Badge>
      </div>
      <div style={{ fontSize: 11, color: C.t3, textAlign: "center", padding: "14px 0" }}>{t.financialComingSoon}</div>
    </div>

    {/* Active project quick link */}
    {activeP && <div style={{ background: C.card, border: "2px solid " + C.ocean, borderRadius: 16, padding: "14px 16px", marginBottom: 14, boxShadow: "0 4px 14px rgba(21,101,192,.1)", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + C.ocean + "," + C.sky + ")" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(21,101,192,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏗️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 800, color: C.t1 }}>{activeP.title_ar}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>{activeP.location_ar} {activeP.area_sqm && "| " + activeP.area_sqm + "م²"} {activeP.total_budget && "| " + Number(activeP.total_budget).toLocaleString() + " د.ب"}</div>
        </div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900, color: C.ocean }}>{activeP.completion || 0}%</div>
      </div>
      <PB v={activeP.completion || 0} />
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <Btn v="primary" sm f onClick={function () { fetchProj(activeP.id); setPage("tracking"); }}>📋 تتبع المراحل والموافقة ←</Btn>
      </div>
      {activeP.contractor_name && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + C.brd, display: "flex", gap: 12, fontSize: 10, color: C.t3 }}>
        <span>👷 {activeP.contractor_name}</span>
        {activeP.inspector_name && <span>🔍 {activeP.inspector_name}</span>}
      </div>}
    </div>}

    {/* Projects list */}
    {projects.length > 0 && <div>
      <SectionTitle ic={<FolderOpen size={16} color={C.ocean} />} mt={8}>{t.allMyProjects} ({projects.length})</SectionTitle>
      {projects.map(function (p) {
        var stLabel = { active: t.stActive, completed: t.stCompleted, open: t.stOpenPricing, awaiting_pricing: t.stAwaitingPricing, new: t.stNew };
        var stColor = { active: "amber", completed: "green", open: "gold", awaiting_pricing: "gold", new: "blue" };
        return <Card key={p.id} onClick={function () { fetchProj(p.id); setPage("tracking"); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: p.status === "active" ? 8 : 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", background: p.status === "active" ? "rgba(232,114,12,.08)" : p.status === "completed" ? "rgba(14,173,105,.08)" : "rgba(26,111,181,.06)" }}>{p.status === "active" ? "⚡" : p.status === "completed" ? "✅" : "📋"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{p.title_ar}</div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>
                {p.location_ar && p.location_ar + " | "}
                {p.total_budget ? Number(p.total_budget).toLocaleString() + " " + t.bhd : t.noBudget}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              {p.status === "active" && p.completion > 0 && <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.ocean }}>{p.completion}%</div>}
              <Badge c={stColor[p.status] || "blue"}>{stLabel[p.status] || p.status}</Badge>
            </div>
          </div>
          {p.status === "active" && p.completion > 0 && <PB v={p.completion} />}
        </Card>;
      })}
    </div>}
  </motion.div>; }

  // ── HOME: Contractor Dashboard ──
  function renderContractorHome() {
    var ct = dash.contract;
    var sp = dash.stage_progress || [];
    var api = dash.active_project_info;

    return <div>
    <AnnouncementBanner lang={lang} />
    {/* Enhanced contractor header */}
    <div style={{ background: "linear-gradient(135deg," + C.navy + ",#E8720C)", borderRadius: 16, padding: 20, color: "#fff", marginBottom: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative" }}>
        {(user.account_type || user.accountType) === "company" && (user.company_logo || user.companyLogo)
          ? <img src={(user.company_logo || user.companyLogo).startsWith("http") ? (user.company_logo || user.companyLogo) : (window.__API || "http://localhost:5000").replace("/api","") + "/" + (user.company_logo || user.companyLogo)} alt="logo" style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{(user.account_type || user.accountType) === "company" ? "🏢" : "👷"}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{t.hello} {(function(){ var isCompany = (user.account_type || user.accountType) === "company"; if (isCompany) return user.company_name_ar || user.companyNameAr || user.name_ar; return isEn ? (user.name_en || user.nameEn || user.name_ar) : user.name_ar; })()} 👋</div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>{(user.account_type || user.accountType) === "company" ? (isEn ? "Company Contracting Manager" : "مسؤول مقاولات الشركة") : (isEn ? t.contractor : "المقاول")} — FIRST TOUCH</div>
        </div>
        {user.rating > 0 && <div style={{ textAlign: "center", background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "6px 10px" }}>
          <div style={{ fontSize: 14, fontWeight: 900 }}>⭐ {Number(user.rating).toFixed(1)}</div>
          <div style={{ fontSize: 8, opacity: 0.5 }}>{t.yourRating}</div>
        </div>}
      </div>
      {/* Earnings summary */}
      <div style={{ display: "flex", gap: 8, position: "relative" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>{Number(dash.total_earned || 0).toLocaleString()}</div>
          <div style={{ fontSize: 9, opacity: 0.5 }}>{t.totalEarnings} ({t.bhd})</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>{dash.active_projects || 0}</div>
          <div style={{ fontSize: 9, opacity: 0.5 }}>{t.activeProjects}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>{dash.completed_projects || 0}</div>
          <div style={{ fontSize: 9, opacity: 0.5 }}>{t.completedProjects}</div>
        </div>
      </div>
    </div>

    {/* Urgent alerts */}
    {(dash.pending_deliveries || 0) > 0 && <div style={{ background: "linear-gradient(135deg,rgba(232,114,12,.1),rgba(232,114,12,.06))", border: "1.5px solid rgba(232,114,12,.35)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={function(){ if(activeP) { fetchProj(activeP.id); setPage("tracking"); } }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gAmber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Upload size={16} color="#fff" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.amber }}>{dash.pending_deliveries} {t.pendingDelivery}</div>
        <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>{t.tapToDeliverItems}</div>
      </div>
      <span style={{ color: C.amber, fontSize: 16 }}>{isEn ? "→" : "←"}</span>
    </div>}

    {(dash.awaiting_pricing || 0) > 0 && <div style={{ background: "linear-gradient(135deg,rgba(212,160,23,.09),rgba(212,160,23,.05))", border: "1.5px solid rgba(212,160,23,.3)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={function(){ setPage("tenders"); }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gGold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Coins size={16} color="#fff" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{dash.awaiting_pricing} {t.newProjectForPricing}</div>
        <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>{t.submitOfferToWin}</div>
      </div>
      <span style={{ color: C.gold, fontSize: 16 }}>{isEn ? "→" : "←"}</span>
    </div>}

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
      <StatCard v={dash.pending_deliveries || 0} l={t.itemsNeedDelivery} ic={<Upload size={18} />} cl={C.amber} />
      <StatCard v={dash.awaiting_pricing || 0} l={t.projectsForPricing} ic={<Coins size={18} />} cl={C.gold} />
      <StatCard v={dash.active_projects || 0} l={t.activeProjects} ic={<Construction size={18} />} cl={C.ocean} />
      <StatCard v={Number(dash.total_earned || 0).toLocaleString()} l={t.totalEarnings} ic={<CircleDollarSign size={18} />} cl={C.green} />
    </div>

    {/* ══════ CONTRACT — FIXED AGREEMENT (بيانات العقد الثابتة) ══════ */}
    {ct && ct.locked && <div style={{ background: C.card, border: "2px solid " + C.amber, borderRadius: 16, marginBottom: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(232,114,12,.1)" }}>
      <div style={{ background: C.gAmber, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📜</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>عقد المشروع</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)" }}>{api ? api.titleAr : ""}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10 }}>🔒</span>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>مُثبّت</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {/* Owner info */}
        {api && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: 10, background: "rgba(21,101,192,.04)", borderRadius: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(21,101,192,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>صاحب المشروع: {api.ownerName}</div>
            {api.inspectorName && <div style={{ fontSize: 10, color: C.t3 }}>المفتش: {api.inspectorName}</div>}
          </div>
        </div>}
        {/* Contract terms */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={{ padding: 10, background: "rgba(232,114,12,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>💰 المبلغ المتفق</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 900, color: C.amber }}>{Number(ct.agreedPrice || 0).toLocaleString()}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>د.ب</div>
          </div>
          <div style={{ padding: 10, background: "rgba(21,101,192,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>📅 المدة</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 900, color: C.ocean }}>{ct.durationMonths}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>شهر</div>
          </div>
          <div style={{ padding: 10, background: "rgba(14,173,105,.06)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.t3 }}>💵 تم استلامه</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 900, color: C.green }}>{Number(dash.total_earned || 0).toLocaleString()}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>د.ب</div>
          </div>
        </div>
        {/* Owner conditions (FIXED) */}
        {api && api.ownerConditions && <div style={{ background: "rgba(232,114,12,.04)", border: "1px solid rgba(232,114,12,.15)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 4 }}>📜 شروط المالك (ثابتة)</div>
          <div style={{ fontSize: 10, color: C.t2, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{api.ownerConditions}</div>
        </div>}
        {/* Delivery progress bar */}
        {(dash.delivery_progress || 0) > 0 && <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.t3, marginBottom: 4 }}>
            <span>نسبة التسليم الكلية</span><span>{dash.delivery_progress}% ({dash.completed_items || 0}/{dash.total_items || 0})</span>
          </div>
          <PB v={dash.delivery_progress} c="amber" />
        </div>}
      </div>
    </div>}

    {/* ══════ STAGE PROGRESS — تقدم المراحل ══════ */}
    {sp.length > 0 && <div style={{ marginBottom: 14 }}>
      <SectionTitle ic={<BarChart3 size={16} color={C.ocean} />}>{isEn ? "Construction Stage Progress" : "تقدم مراحل البناء"}</SectionTitle>
      {sp.map(function(stage) {
        var stIc = stage.status === "completed" ? "✅" : stage.status === "active" ? "🔵" : "🔒";
        var isMyTurn = stage.status === "active" && stage.contractorDone < stage.totalItems;
        return <Card key={stage.id} bc={isMyTurn ? C.amber : undefined} onClick={function(){ if(activeP) { fetchProj(activeP.id); setPage("tracking"); } }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{stIc}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{stage.nameAr}</div>
              <div style={{ fontSize: 9, color: C.t3 }}>
                تسليمك: {stage.contractorDone}/{stage.totalItems}
                {isMyTurn && <span style={{ color: C.amber, fontWeight: 700 }}> — يحتاج تسليمك!</span>}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: stage.progress >= 100 ? C.green : stage.progress > 0 ? C.amber : C.t3 }}>{stage.progress}%</div>
            </div>
          </div>
          <PB v={stage.progress} c={stage.progress >= 100 ? "green" : "amber"} />
        </Card>;
      })}
    </div>}

    {/* Active project card */}
    {activeP && !ct && <div style={{ background: C.card, border: "2px solid " + C.amber, borderRadius: 16, padding: "14px 16px", marginBottom: 14, boxShadow: "0 4px 14px rgba(232,114,12,.1)", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.gAmber }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(232,114,12,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏗️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 800, color: C.t1 }}>{activeP.title_ar}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>{activeP.location_ar} {activeP.total_budget && "| " + Number(activeP.total_budget).toLocaleString() + " د.ب"}</div>
        </div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900, color: C.amber }}>{activeP.completion || 0}%</div>
      </div>
      <PB v={activeP.completion || 0} c="amber" />
      <div style={{ marginTop: 10 }}><Btn v="amber" sm f onClick={function () { fetchProj(activeP.id); setPage("tracking"); }}>{t.trackAndDeliver} {isEn ? "→" : "←"}</Btn></div>
    </div>}

    {openProjects.length > 0 && <div>
      <SectionTitle ic="💰" mt={4}>{t.availableForPricing}</SectionTitle>
      {openProjects.map(function (p) {
        return <Card key={p.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(212,160,23,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{p.title_ar}</div>
              <div style={{ fontSize: 10, color: C.t3 }}>{p.location_ar} | {p.area_sqm}{t.sqm} | {p.floors} {t.floors}</div>
            </div>
          </div>
          {p.total_budget > 0 && <div style={{ fontSize: 10, color: C.t3, marginBottom: 8 }}>💰 {t.budget}: <strong style={{ color: C.gold }}>{Number(p.total_budget).toLocaleString()} {t.bhd}</strong></div>}
          <div style={{ display: "flex", gap: 6 }}>
            <Btn v="amber" sm f onClick={function () { setModal({ type: "quotation", pid: p.id, title: p.title_ar }); }}>{t.submitBOQ}</Btn>
            <Btn v="outline" sm onClick={function () { fetchProj(p.id); setPage("tracking"); }}>{t.details}</Btn>
          </div>
        </Card>;
      })}
    </div>}

    {projects.filter(function(p){ return p.contractor_id === user.id; }).length > 0 && <div>
      <SectionTitle ic={<ClipboardList size={16} color={C.ocean} />} mt={4}>{t.myContractedProjects}</SectionTitle>
      {projects.filter(function(p){ return p.contractor_id === user.id; }).map(function (p) {
        return <Card key={p.id} onClick={function () { fetchProj(p.id); setPage("tracking"); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: p.status === "active" ? 8 : 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", background: p.status === "active" ? "rgba(232,114,12,.08)" : "rgba(14,173,105,.08)" }}>{p.status === "active" ? "⚡" : "✅"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{p.title_ar}</div>
              <div style={{ fontSize: 10, color: C.t3 }}>{Number(p.total_budget || 0).toLocaleString()} د.ب</div>
            </div>
            <div style={{ textAlign: "center" }}>
              {p.status === "active" && <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.amber }}>{p.completion || 0}%</div>}
              <Badge c={p.status === "active" ? "amber" : "green"}>{p.status === "active" ? t.stActive : t.stCompleted}</Badge>
            </div>
          </div>
          {p.status === "active" && p.completion > 0 && <PB v={p.completion} c="amber" />}
        </Card>;
      })}
    </div>}
  </div>; }

  // ── HOME: Inspector Dashboard ──
  function renderInspectorHome() {
    var sp = dash.stage_progress || [];
    var api = dash.active_project_info;
    var approvalRate = dash.approval_rate || 100;

    return <div>
    <AnnouncementBanner lang={lang} />
    {/* Inspector header */}
    <div style={{ background: "linear-gradient(135deg," + C.navy + "," + C.green + ")", borderRadius: 16, padding: 20, color: "#fff", marginBottom: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative" }}>
        {(user.account_type || user.accountType) === "company" && (user.company_logo || user.companyLogo)
          ? <img src={(user.company_logo || user.companyLogo).startsWith("http") ? (user.company_logo || user.companyLogo) : (window.__API || "http://localhost:5000").replace("/api","") + "/" + (user.company_logo || user.companyLogo)} alt="logo" style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{(user.account_type || user.accountType) === "company" ? "🏢" : "🔍"}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{t.hello} {(function(){ var isCompany = (user.account_type || user.accountType) === "company"; if (isCompany) return user.company_name_ar || user.companyNameAr || user.name_ar; return isEn ? (user.name_en || user.nameEn || user.name_ar) : user.name_ar; })()} 👋</div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>{(user.account_type || user.accountType) === "company" ? (isEn ? "Company Inspection Manager" : "مسؤول فحص الشركة") : (isEn ? (user.specialty_en || user.specialtyEn || user.specialty || t.inspector) : (user.specialty || "مفتش جودة"))} — FIRST TOUCH</div>
        </div>
        {user.rating > 0 && <div style={{ textAlign: "center", background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "6px 10px" }}>
          <div style={{ fontSize: 14, fontWeight: 900 }}>⭐ {Number(user.rating).toFixed(1)}</div>
          <div style={{ fontSize: 8, opacity: 0.5 }}>{t.yourRating}</div>
        </div>}
      </div>
      {/* Performance summary */}
      <div style={{ display: "flex", gap: 8, position: "relative" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>{dash.completed_inspections || 0}</div>
          <div style={{ fontSize: 9, opacity: 0.5 }}>{t.inspectedItems}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>{approvalRate}%</div>
          <div style={{ fontSize: 9, opacity: 0.5 }}>{t.approvalRateLabel}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>{dash.completed_projects || 0}</div>
          <div style={{ fontSize: 9, opacity: 0.5 }}>{t.completedProjects}</div>
        </div>
      </div>
    </div>

    {/* Urgent: items needing inspection */}
    {(dash.pending_inspections || 0) > 0 && <div style={{ background: "linear-gradient(135deg,rgba(14,173,105,.1),rgba(14,173,105,.05))", border: "1.5px solid rgba(14,173,105,.35)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={function(){ if(activeP) { fetchProj(activeP.id); setPage("tracking"); } }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gGreen, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Search size={16} color="#fff" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{dash.pending_inspections} {t.pendingInspection}</div>
        <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>{t.contractorDelivered}</div>
      </div>
      <span style={{ color: C.green, fontSize: 16 }}>{isEn ? "→" : "←"}</span>
    </div>}

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
      <StatCard v={dash.pending_inspections || 0} l={t.itemsNeedInspection} ic={<Search size={18} />} cl={C.green} />
      <StatCard v={dash.active_projects || 0} l={t.activeProjects} ic={<Construction size={18} />} cl={C.ocean} />
      <StatCard v={dash.rejected_items || 0} l={t.rejectedItems} ic={<XCircle size={18} />} cl={C.red} />
      <StatCard v={openProjects.length} l={t.projectsNeedInspector} ic={<FileText size={18} />} cl={C.gold} />
    </div>

    {/* ══════ ACTIVE PROJECT INFO ══════ */}
    {api && <div style={{ background: C.card, border: "2px solid " + C.green, borderRadius: 16, marginBottom: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(14,173,105,.1)" }}>
      <div style={{ background: C.gGreen, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🏗️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{api.titleAr}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)" }}>{t.activeInspection}</div>
          </div>
        </div>
        {dash.inspector_fee > 0 && <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "4px 10px" }}>
          <div style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>💰 {Number(dash.inspector_fee).toLocaleString()} د.ب</div>
        </div>}
      </div>
      <div style={{ padding: "14px 16px" }}>
        {/* Project team */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: 8, background: "rgba(21,101,192,.05)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>👤</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t1 }}>{api.ownerName}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>صاحب المشروع</div>
          </div>
          <div style={{ flex: 1, padding: 8, background: "rgba(232,114,12,.05)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>👷</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t1 }}>{api.contractorName}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>{api.contractorCompany || "المقاول"}</div>
          </div>
        </div>
        <Btn v="green" sm f onClick={function(){ fetchProj(api.id); setPage("tracking"); }}>🔍 فحص واعتماد البنود ←</Btn>
      </div>
    </div>}

    {/* ══════ STAGE PROGRESS — تقدم فحص المراحل ══════ */}
    {sp.length > 0 && <div style={{ marginBottom: 14 }}>
      <SectionTitle ic={<BarChart3 size={16} color={C.ocean} />}>تقدم فحص المراحل</SectionTitle>
      {sp.map(function(stage) {
        var stIc = stage.status === "completed" ? "✅" : stage.status === "active" ? "🔵" : "🔒";
        var needsInspection = stage.status === "active" && stage.contractorDone > stage.inspectorDone;
        return <Card key={stage.id} bc={needsInspection ? C.green : undefined} onClick={function(){ if(api) { fetchProj(api.id); setPage("tracking"); } }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{stIc}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{stage.nameAr}</div>
              <div style={{ fontSize: 9, color: C.t3 }}>
                فحصك: {stage.inspectorDone}/{stage.totalItems}
                {needsInspection && <span style={{ color: C.green, fontWeight: 700 }}> — {stage.contractorDone - stage.inspectorDone} بند ينتظر فحصك</span>}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: stage.progress >= 100 ? C.green : stage.progress > 0 ? C.amber : C.t3 }}>{stage.progress}%</div>
            </div>
          </div>
          <PB v={stage.progress} c={stage.progress >= 100 ? "green" : "amber"} />
        </Card>;
      })}
    </div>}

    {/* Active project card (fallback if no api) */}
    {activeP && !api && <Card bc={C.green}>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 800, marginBottom: 4 }}>🏗️ {activeP.title_ar}</div>
      <PB v={activeP.completion || 0} c="green" />
      <div style={{ marginTop: 8 }}><Btn v="green" sm f onClick={function () { fetchProj(activeP.id); setPage("tracking"); }}>🔍 فحص البنود</Btn></div>
    </Card>}

    {openProjects.length > 0 && <div>
      <SectionTitle ic={<FileText size={16} color={C.ocean} />} mt={4}>{t.projectsSearchInspector}</SectionTitle>
      {openProjects.map(function (p) {
        return <Card key={p.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(14,173,105,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{p.title_ar}</div>
              <div style={{ fontSize: 10, color: C.t3 }}>{p.location_ar} | {p.area_sqm}م²</div>
            </div>
          </div>
          {p.total_budget > 0 && <div style={{ fontSize: 10, color: C.t3, marginBottom: 8 }}>💰 {t.budget}: <strong style={{ color: C.gold }}>{Number(p.total_budget).toLocaleString()} {t.bhd}</strong></div>}
          <Btn v="green" sm f onClick={function () { setModal({ type: "inspectorApply", pid: p.id, title: p.title_ar }); }}>🔍 ترشيح نفسي</Btn>
        </Card>;
      })}
    </div>}

    {projects.filter(function(p){ return p.inspector_id === user.id; }).length > 0 && <div>
      <SectionTitle ic={<ClipboardList size={16} color={C.ocean} />} mt={4}>مشاريعي</SectionTitle>
      {projects.filter(function(p){ return p.inspector_id === user.id; }).map(function (p) {
        return <Card key={p.id} onClick={function () { fetchProj(p.id); setPage("tracking"); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{p.title_ar}</div></div>
            <Badge c={p.status === "active" ? "green" : "blue"}>{p.status === "active" ? t.stActive : t.stCompleted}</Badge>
          </div>
        </Card>;
      })}
    </div>}
  </div>; }

  // ═══════ OFFERS PAGE (Owner view — all pending quotations & inspector apps) ═══════
  function renderOffersPage() {
    var pendingProjects = projects.filter(function (p) { return p.status === "awaiting_pricing" || p.status === "new" || p.status === "design_required" || p.status === "open"; });
    var activeProjects = projects.filter(function (p) { return p.status === "active"; });
    var hasOffers = (dash.pending_quotations || 0) > 0;

    return <div>
      {/* ── Gradient header ── */}
      <div style={{ background: C.gNavy, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -24, left: -24, width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
        <div style={{ position: "absolute", bottom: -16, right: 20, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(255,255,255,.12)", border: "1.5px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📨</div>
            <div>
              <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900 }}>{t.offersAndTenders}</div>
              <div style={{ fontSize: 10, opacity: 0.55 }}>{t.reviewCompareOffers}</div>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { v: dash.pending_quotations || 0, l: t.newOfferLabel, cl: "#FFB74D", ic: "💰" },
              { v: pendingProjects.length, l: t.awaitingPricingLabel, cl: "#90CAF9", ic: "📋" },
              { v: activeProjects.length, l: t.activeProjectLabel, cl: "#A5D6A7", ic: "⚡" }
            ].map(function(s, i) {
              return <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 9, marginBottom: 2 }}>{s.ic}</div>
                <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900, color: s.cl }}>{s.v}</div>
                <div style={{ fontSize: 8, opacity: 0.5, marginTop: 1 }}>{s.l}</div>
              </div>;
            })}
          </div>
        </div>
      </div>

      {/* ── Urgent alert if there are new offers ── */}
      {hasOffers && <div style={{ background: "linear-gradient(135deg,rgba(232,114,12,.1),rgba(232,114,12,.06))", border: "1.5px solid rgba(232,114,12,.35)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gAmber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔔</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.amber }}>{t.youHaveNewOffers.replace("{0}", dash.pending_quotations)}</div>
          <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>{t.compareAcceptBest}</div>
        </div>
      </div>}

      {/* ── Empty state ── */}
      {pendingProjects.length === 0 && activeProjects.length === 0 && <div style={{ textAlign: "center", padding: 50, color: C.t3 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>📭</div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 700 }}>{t.noProjectsNeedOffersMsg}</div>
        <div style={{ fontSize: 11, marginTop: 4, marginBottom: 18 }}>{t.createNewProjectForOffers}</div>
        <Btn v="primary" onClick={function () { setModal("aiUpload"); }}>🤖 {t.newProject}</Btn>
      </div>}

      {/* ── Projects awaiting offers ── */}
      {pendingProjects.length > 0 && <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 3, height: 14, background: C.ocean, borderRadius: 2, display: "inline-block" }} />
          {t.projectsAwaitingQuotes} ({pendingProjects.length})
        </div>
        {pendingProjects.map(function (p) {
          var qCount = p.quotation_count || 0;
          var iCount = p.inspector_count || 0;
          var hasNewOffers = qCount > 0 || iCount > 0;
          return <div key={p.id} style={{ background: C.card, border: "2px solid " + (hasNewOffers ? C.amber : C.brd), borderRadius: 14, marginBottom: 12, overflow: "hidden", boxShadow: hasNewOffers ? "0 4px 16px rgba(232,114,12,.12)" : "0 2px 8px rgba(13,27,42,.07)" }}>
            {/* Top accent bar */}
            <div style={{ height: 3, background: hasNewOffers ? C.gAmber : "linear-gradient(90deg," + C.ocean + "," + C.sky + ")" }} />
            <div style={{ padding: "12px 14px 10px" }}>
              {/* Project title + badges */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: hasNewOffers ? "rgba(232,114,12,.1)" : "rgba(26,111,181,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {hasNewOffers ? "🔔" : "🏗️"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginBottom: 2 }}>{p.title_ar}</div>
                  <div style={{ fontSize: 10, color: C.t3 }}>
                    {p.location_ar && "📍 " + p.location_ar + " "}
                    {p.area_sqm > 0 && "| " + p.area_sqm + (isEn ? " m²" : "م²")}
                    {p.total_budget > 0 && " | " + Number(p.total_budget).toLocaleString() + " " + t.bhd}
                  </div>
                </div>
              </div>
              {/* Offer count badges */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {qCount > 0
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.gAmber, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 10, boxShadow: "0 2px 6px rgba(232,114,12,.3)" }}>💰 {qCount} {t.contractorOfferCount}</span>
                  : <span style={{ fontSize: 10, color: C.t3, padding: "4px 10px", background: "#F4F7FB", borderRadius: 10 }}>{t.noContractorOffers}</span>
                }
                {iCount > 0
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.gGreen, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 10, boxShadow: "0 2px 6px rgba(14,173,105,.3)" }}>🔍 {iCount} {t.inspectorCount}</span>
                  : <span style={{ fontSize: 10, color: C.t3, padding: "4px 10px", background: "#F4F7FB", borderRadius: 10 }}>{t.noInspectorYet}</span>
                }
              </div>
              <Btn v={hasNewOffers ? "amber" : "primary"} sm f onClick={function () {
                setOffersLoading(true);
                call("/projects/" + p.id, "GET", null, tk).then(function (d) {
                  if (d.project) {
                    setOffersProject(d.project);
                    setOffersQuotations(d.quotations || []);
                    setOffersInspApps(d.inspector_applications || []);
                  }
                  setOffersLoading(false);
                  setModal({ type: "viewOffers", projectTitle: p.title_ar });
                });
              }}>{hasNewOffers ? t.reviewOffersAcceptBest : t.viewDetails}</Btn>
            </div>
          </div>;
        })}
      </div>}

      {/* ── Active projects ── */}
      {activeProjects.length > 0 && <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 3, height: 14, background: C.amber, borderRadius: 2, display: "inline-block" }} />
          {t.activeProjectsProgress} ({activeProjects.length})
        </div>
        {activeProjects.map(function (p) {
          var pct = p.completion_percentage || p.completion || 0;
          return <div key={p.id} style={{ background: C.card, border: "1.5px solid " + C.brd, borderRadius: 14, marginBottom: 10, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(13,27,42,.07)" }} onClick={function () { fetchProj(p.id); setPage("tracking"); }}>
            <div style={{ height: 3, background: "linear-gradient(90deg," + C.amber + "," + C.ocean + ")", width: pct + "%", transition: "width .5s" }} />
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(232,114,12,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{p.title_ar}</div>
                  <div style={{ fontSize: 10, color: C.t3 }}>{p.contractor_name && "👷 " + p.contractor_name + " | "}{pct}% {t.pctComplete}</div>
                </div>
                <div style={{ background: "rgba(232,114,12,.1)", borderRadius: 8, padding: "6px 10px" }}>
                  <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.amber }}>{pct}%</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}><PB v={pct} c="amber" /></div>
              <div style={{ marginTop: 8, fontSize: 10, color: C.ocean, fontWeight: 700 }}>📋 اضغط لمتابعة المراحل والموافقة ←</div>
            </div>
          </div>;
        })}
      </div>}

      {/* ── Hint for new project ── */}
      {pendingProjects.length > 0 && <div style={{ textAlign: "center", marginTop: 8, paddingTop: 12, borderTop: "1px dashed " + C.brd }}>
        <Btn v="outline" sm onClick={function () { setModal("aiUpload"); }}>🤖 {t.addNewProject}</Btn>
      </div>}
    </div>;
  }

  // ═══════ TENDERS / MARKETPLACE PAGE (contractor & inspector) ═══════
  function renderTenders() {
    var isContractor = role === "contractor";
    var accentColor = isContractor ? C.amber : C.green;
    var gradFrom = isContractor ? C.navy : C.navy;
    var gradTo = isContractor ? C.amber : C.green;

    return <div>
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg," + gradFrom + "," + gradTo + ")", borderRadius: 16, padding: 18, color: "#fff", marginBottom: 14 }}>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 4 }}>
          {isContractor ? t.tendersTitleContractor : t.tendersTitleInspector}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          {isContractor ? t.tenderDescContractor : t.tenderDescInspector}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.15)" }}>
          <div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900 }}>{openProjects.length}</div>
            <div style={{ fontSize: 9, opacity: 0.5 }}>{t.availableProjects}</div>
          </div>
          {isContractor && <div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900 }}>{projects.filter(function(p){ return p.contractor_id === user.id; }).length}</div>
            <div style={{ fontSize: 9, opacity: 0.5 }}>{t.myProjects}</div>
          </div>}
        </div>
      </div>

      {/* Empty state */}
      {openProjects.length === 0 && <div style={{ textAlign: "center", padding: 48, color: C.t3 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>📭</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.noAvailableProjectsMsg}</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>{t.willNotifyNewProjects}</div>
      </div>}

      {/* Open projects list */}
      {openProjects.length > 0 && <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 8, paddingRight: 4 }}>
          {isContractor ? t.projectsAwaitingPricing.replace("{0}", openProjects.length) : t.projectsAwaitingInspector.replace("{0}", openProjects.length)}
        </div>
        {openProjects.map(function(p) {
          return <div key={p.id} style={{ background: C.card, border: "1.5px solid " + C.brd, borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg," + accentColor + "," + C.ocean + ")" }} />
            <div style={{ padding: "12px 14px" }}>
              {/* Project header */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: isContractor ? "rgba(232,114,12,.1)" : "rgba(14,173,105,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {typeIcon(p.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.t1 }}>{isEn ? (p.title_en || p.titleEn || p.title_ar) : p.title_ar}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                    <Badge c="blue">{typeLabel(p.type)}</Badge>
                    {p.floors > 0 && <Badge c="gold">{p.floors} {t.floors}</Badge>}
                    {p.area_sqm > 0 && <Badge c="green">{p.area_sqm}{t.sqm}</Badge>}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: "8px 10px", background: "#F4F7FB", borderRadius: 8, marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {(p.location_ar || p.location_en) && <div style={{ fontSize: 10, color: C.t2 }}>📍 {isEn ? (p.location_en || p.locationEn || p.location_ar) : p.location_ar}</div>}
                  {p.area_sqm > 0 && <div style={{ fontSize: 10, color: C.t2 }}>📐 {p.area_sqm} {t.sqm}</div>}
                  {p.floors > 0 && <div style={{ fontSize: 10, color: C.t2 }}>🏢 {p.floors} {t.floors}</div>}
                  {p.total_budget > 0 && <div style={{ fontSize: 10, fontWeight: 600, color: C.amber }}>💰 {Number(p.total_budget).toLocaleString()} {t.bhd}</div>}
                </div>
                {p.description_ar && <div style={{ fontSize: 10, color: C.t2, marginTop: 6, paddingTop: 6, borderTop: "1px solid #E8ECF2" }}>{p.description_ar.length > 90 ? p.description_ar.substring(0, 90) + "…" : p.description_ar}</div>}
              </div>

              {/* Existing bids indicator */}
              {(p.quotation_count > 0 || p.inspector_count > 0) && <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {p.quotation_count > 0 && <span style={{ background: "rgba(232,114,12,.1)", color: C.amber, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>💰 {p.quotation_count} {t.priceQuoteCount}</span>}
                {p.inspector_count > 0 && <span style={{ background: "rgba(14,173,105,.1)", color: C.green, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>🔍 {p.inspector_count} {t.inspectorCountLabel}</span>}
              </div>}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {isContractor
                  ? <Btn v="amber" sm f onClick={function() { setModal({ type: "quotation", pid: p.id, title: p.title_ar }); }}>{t.submitBOQ}</Btn>
                  : <Btn v="green" sm f onClick={function() { setModal({ type: "inspectorApply", pid: p.id, title: p.title_ar }); }}>{t.nominateSelf}</Btn>
                }
                <Btn v="outline" sm onClick={function() { fetchProj(p.id); setPage("tracking"); }}>{t.details}</Btn>
              </div>
            </div>
          </div>;
        })}
      </div>}

      {/* My contracted projects */}
      {isContractor && projects.filter(function(p){ return p.contractor_id === user.id; }).length > 0 && <div style={{ marginTop: 8 }}>
        <SectionTitle ic={<ClipboardList size={16} color={C.ocean} />} mt={4}>{t.myContractedProjects}</SectionTitle>
        {projects.filter(function(p){ return p.contractor_id === user.id; }).map(function(p) {
          return <Card key={p.id} onClick={function() { fetchProj(p.id); setPage("tracking"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{p.title_ar}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>{Number(p.total_budget || 0).toLocaleString()} د.ب — {p.completion || 0}%</div>
              </div>
              <Badge c={p.status === "active" ? "amber" : "green"}>{p.status === "active" ? t.stActive : t.stCompleted}</Badge>
            </div>
          </Card>;
        })}
      </div>}

      {/* My inspector projects */}
      {!isContractor && projects.filter(function(p){ return p.inspector_id === user.id; }).length > 0 && <div style={{ marginTop: 8 }}>
        <SectionTitle ic={<Search size={16} color={C.green} />} mt={4}>مشاريعي كمفتش</SectionTitle>
        {projects.filter(function(p){ return p.inspector_id === user.id; }).map(function(p) {
          return <Card key={p.id} onClick={function() { fetchProj(p.id); setPage("tracking"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{p.title_ar}</div>
              </div>
              <Badge c={p.status === "active" ? "green" : "blue"}>{p.status === "active" ? t.stActive : t.stCompleted}</Badge>
            </div>
          </Card>;
        })}
      </div>}
    </div>;
  }

  // ═══════ DEVELOPER HOME (المطور العقاري) ═══════
  function loadCompound(comp) {
    setActiveCompound(comp);
    setDevPage("compound");
    call("/compounds/" + comp.id + "/dashboard", "GET", null, tk).then(function (cd) { if (!cd.error) setCompoundDash(cd); });
    call("/compounds/" + comp.id + "/units/grid", "GET", null, tk).then(function (g) { if (g.blocks) setUnitsGrid(g.blocks); });
    call("/compounds/" + comp.id + "/units", "GET", null, tk).then(function (u) { if (u.units) setCompoundUnits(u.units); });
    call("/compounds/" + comp.id + "/quality-issues", "GET", null, tk).then(function (q) { if (q.issues) setQualityIssues(q.issues); });
  }

  function renderDeveloperHome() {
    var d = dash || {};
    var cd = compoundDash;
    var gPurple = "linear-gradient(135deg,#4A148C 0%,#7B1FA2 100%)";

    // Overview page — all compounds
    if (devPage === "overview" || !activeCompound) {
      return <div>
        {/* Stats Overview */}
        <div style={{ background: gPurple, borderRadius: 16, padding: 18, color: "#fff", marginBottom: 14, boxShadow: "0 6px 20px rgba(74,20,140,.3)" }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 17, fontWeight: 900, marginBottom: 12 }}>🏗️ لوحة المطور العقاري</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,.12)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{d.total_compounds || 0}</div>
              <div style={{ fontSize: 9, opacity: 0.8 }}>مجمعات</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,.12)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{d.total_units || 0}</div>
              <div style={{ fontSize: 9, opacity: 0.8 }}>إجمالي الوحدات</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,.12)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{d.overall_progress || 0}%</div>
              <div style={{ fontSize: 9, opacity: 0.8 }}>التقدم الكلي</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}><PB v={d.overall_progress || 0} c="green" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <div style={{ background: "rgba(14,173,105,.2)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{d.completed_units || 0}</span>
              <span style={{ fontSize: 9, opacity: 0.7, marginRight: 4 }}> مكتملة</span>
            </div>
            <div style={{ background: "rgba(232,114,12,.2)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{d.delayed_units || 0}</span>
              <span style={{ fontSize: 9, opacity: 0.7, marginRight: 4 }}> متأخرة</span>
            </div>
          </div>
        </div>

        {/* Quality & Issues Alert */}
        {(d.open_quality_issues || 0) > 0 && <div style={{ background: "linear-gradient(135deg,rgba(229,57,53,.08),rgba(229,57,53,.04))", border: "1.5px solid rgba(229,57,53,.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.red }}>{d.open_quality_issues} ملاحظة جودة مفتوحة</div>
            <div style={{ fontSize: 10, color: C.t3 }}>تحتاج مراجعة وإجراء تصحيحي</div>
          </div>
        </div>}

        {/* Compounds List */}
        <div style={{ fontSize: 14, fontWeight: 800, color: C.t1, marginBottom: 10 }}>🏘️ المجمعات</div>
        {compounds.length === 0 && <Card><div style={{ textAlign: "center", padding: 20, color: C.t3 }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🏗️</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>لا توجد مجمعات بعد</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>أنشئ مجمعك الأول لبدء متابعة المشاريع</div>
        </div></Card>}

        {compounds.map(function (comp) {
          var progressColor = (comp.overallProgress || 0) >= 70 ? C.green : (comp.overallProgress || 0) >= 30 ? C.amber : C.red;
          return <Card key={comp.id} onClick={function () { loadCompound(comp); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: gPurple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: "0 3px 10px rgba(74,20,140,.25)" }}>🏘️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 14, fontWeight: 900, color: C.t1 }}>{comp.nameAr}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>{comp.area || ""} {comp.city ? "• " + comp.city : ""}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>رقم المجمع: {comp.compoundNumber}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: progressColor }}>{comp.overallProgress || 0}%</div>
                <div style={{ fontSize: 8, color: C.t3 }}>التقدم</div>
              </div>
            </div>
            <PB v={comp.overallProgress || 0} c={comp.overallProgress >= 70 ? "green" : comp.overallProgress >= 30 ? "amber" : "green"} />
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <Badge c="purple">{comp.totalUnits || comp._count?.units || 0} وحدة</Badge>
              <Badge c={(comp.status === "completed" ? "green" : comp.status === "in_progress" ? "amber" : "blue")}>{comp.status === "completed" ? t.stCompleted : comp.status === "in_progress" ? t.inProgressLabel : comp.status === "setup" ? t.setupLabel : comp.status}</Badge>
              {comp._count?.qualityIssues > 0 && <Badge c="red">{comp._count.qualityIssues} ملاحظة</Badge>}
            </div>
          </Card>;
        })}

        {/* Wallet Summary — Coming Soon */}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.t1, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{t.walletLabel}</span>
            <Badge c="gold">{t.comingSoon}</Badge>
          </div>
          <Card sx={{ opacity: 0.5 }}>
            <div style={{ textAlign: "center", padding: "10px 0", fontSize: 11, color: C.t3 }}>{t.walletComingSoonShort}</div>
          </Card>
        </div>
      </div>;
    }

    // Compound detail page
    if (devPage === "compound" && activeCompound) {
      return <div>
        {/* Back button */}
        <div onClick={function () { setDevPage("overview"); }} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(123,31,162,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>→</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#7B1FA2" }}>العودة للمجمعات</span>
        </div>

        {/* Compound Header */}
        <div style={{ background: gPurple, borderRadius: 16, padding: 16, color: "#fff", marginBottom: 12 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900 }}>🏘️ {activeCompound.nameAr}</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{activeCompound.compoundNumber} • {activeCompound.area} • {activeCompound.city}</div>

          {cd && <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
              {[
                { v: cd.overview?.total || 0, l: isEn ? "Total" : "إجمالي", bg: "rgba(255,255,255,.15)" },
                { v: cd.overview?.completed || 0, l: t.completedLabel, bg: "rgba(14,173,105,.25)" },
                { v: cd.overview?.inProgress || 0, l: isEn ? "In Progress" : "جارية", bg: "rgba(66,165,245,.25)" },
                { v: cd.overview?.delayed || 0, l: isEn ? "Delayed" : "متأخرة", bg: "rgba(229,57,53,.25)" }
              ].map(function (s, i) {
                return <div key={i} style={{ textAlign: "center", background: s.bg, borderRadius: 10, padding: "8px 4px" }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{s.v}</div>
                  <div style={{ fontSize: 8, opacity: 0.8 }}>{s.l}</div>
                </div>;
              })}
            </div>
            <div style={{ marginTop: 10 }}><PB v={cd.overallProgress || 0} c="green" /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, opacity: 0.7 }}>
              <span>التقدم: {cd.overallProgress || 0}%</span>
              <span>الميزانية: {((cd.budget?.spent || 0) / 1000).toFixed(0)}K / {((cd.budget?.total || 0) / 1000).toFixed(0)}K د.ب</span>
            </div>
          </div>}
        </div>

        {/* Budget Card */}
        {cd && cd.budget && <Card>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, marginBottom: 8 }}>💰 الميزانية</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div><div style={{ fontSize: 9, color: C.t3 }}>الإجمالية</div><div style={{ fontSize: 14, fontWeight: 800 }}>{(cd.budget.total || 0).toLocaleString()} د.ب</div></div>
            <div><div style={{ fontSize: 9, color: C.t3 }}>المصروف</div><div style={{ fontSize: 14, fontWeight: 800, color: C.amber }}>{(cd.budget.spent || 0).toLocaleString()} د.ب</div></div>
            <div><div style={{ fontSize: 9, color: C.t3 }}>المتبقي</div><div style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{(cd.budget.remaining || 0).toLocaleString()} د.ب</div></div>
          </div>
          <PB v={cd.budget.spentPercentage || 0} c="amber" />
        </Card>}

        {/* Alerts */}
        {cd && cd.alerts && cd.alerts.length > 0 && <Card bc="rgba(229,57,53,.3)">
          <div style={{ fontSize: 12, fontWeight: 800, color: C.red, marginBottom: 6 }}>⚠️ تنبيهات ({cd.alerts.length})</div>
          {cd.alerts.slice(0, 5).map(function (a, i) {
            var ic = a.type === "delay" ? "🕐" : a.type === "budget" ? "💸" : "🔍";
            return <div key={i} style={{ fontSize: 10, color: C.t2, padding: "4px 0", borderBottom: i < cd.alerts.length - 1 ? "1px solid " + C.brd : "none" }}>
              {ic} {a.message}
            </div>;
          })}
        </Card>}

        {/* Units Grid */}
        <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginBottom: 8 }}>🏠 خريطة الوحدات</div>
        {unitsGrid.map(function (block) {
          return <div key={block.name} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7B1FA2", marginBottom: 6 }}>بلوك {block.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6 }}>
              {block.units.map(function (u) {
                var bg = u.status === "completed" ? "rgba(14,173,105,.15)" : u.status === "in_progress" ? "rgba(66,165,245,.12)" : u.status === "delayed" ? "rgba(229,57,53,.12)" : "rgba(120,144,166,.08)";
                var bdr = u.status === "completed" ? C.green : u.status === "in_progress" ? C.ocean : u.status === "delayed" ? C.red : C.brd;
                var statusIc = u.status === "completed" ? "✅" : u.status === "in_progress" ? "🔵" : u.status === "delayed" ? "🔴" : "⚪";
                return <div key={u.id} style={{ background: bg, border: "1.5px solid " + bdr, borderRadius: 10, padding: 8, textAlign: "center", cursor: "pointer" }} onClick={function () {
                  var unit = compoundUnits.find(function (cu) { return cu.id === u.id; });
                  if (unit) { setProj(unit); setDevPage("unit"); }
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.t1 }}>{u.unitNumber}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: bdr }}>{u.progress}%</div>
                  <div style={{ fontSize: 8 }}>{statusIc}</div>
                </div>;
              })}
            </div>
          </div>;
        })}

        {/* Quality Issues */}
        {qualityIssues.length > 0 && <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginBottom: 8 }}>🔍 ملاحظات الجودة</div>
          {qualityIssues.slice(0, 5).map(function (issue) {
            var prColor = issue.priority === "high" || issue.priority === "critical" ? C.red : issue.priority === "medium" ? C.amber : C.green;
            var stColor = issue.status === "open" ? C.red : issue.status === "in_progress" ? C.amber : C.green;
            return <Card key={issue.id}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: prColor, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{issue.title}</div>
                  {issue.compoundUnit && <div style={{ fontSize: 10, color: C.t3 }}>الوحدة: {issue.compoundUnit.unitNumber}</div>}
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Badge c={issue.priority === "high" || issue.priority === "critical" ? "red" : issue.priority === "medium" ? "amber" : "green"}>{issue.priority === "high" ? "عالية" : issue.priority === "critical" ? "حرجة" : issue.priority === "medium" ? "متوسطة" : "منخفضة"}</Badge>
                    <Badge c={issue.status === "open" ? "red" : issue.status === "in_progress" ? "amber" : "green"}>{issue.status === "open" ? "مفتوحة" : issue.status === "in_progress" ? "قيد الإصلاح" : "مغلقة"}</Badge>
                  </div>
                </div>
              </div>
            </Card>;
          })}
        </div>}
      </div>;
    }

    // Unit detail page
    if (devPage === "unit" && proj) {
      return <div>
        <div onClick={function () { setDevPage("compound"); setProj(null); }} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(123,31,162,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>→</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#7B1FA2" }}>العودة لخريطة الوحدات</span>
        </div>

        <Card sx={{ borderTop: "4px solid #7B1FA2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.t1 }}>🏠 {proj.unitNumber}</div>
              <div style={{ fontSize: 10, color: C.t3 }}>بلوك {proj.block || "-"} • {proj.type === "villa" ? "فيلا" : proj.type} • {proj.area || 0} م²</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: proj.progress >= 70 ? C.green : proj.progress >= 30 ? C.amber : C.red }}>{proj.progress || 0}%</div>
            </div>
          </div>
          <PB v={proj.progress || 0} c={proj.progress >= 70 ? "green" : proj.progress >= 30 ? "amber" : "green"} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: C.t3 }}>
            <span>الميزانية: {(proj.budget || 0).toLocaleString()} د.ب</span>
            <span>المصروف: {(proj.spent || 0).toLocaleString()} د.ب</span>
          </div>
        </Card>

        {/* Unit Stages */}
        <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginBottom: 8, marginTop: 6 }}>📋 مراحل البناء</div>
        {(proj.stages || []).map(function (stage) {
          var stIc = stage.status === "completed" ? "✅" : stage.status === "in_progress" ? "🔵" : "⏳";
          return <Card key={stage.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{stIc}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{stage.nameAr}</div>
                <div style={{ fontSize: 9, color: C.t3 }}>{stage.nameEn || ""}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: stage.progress >= 100 ? C.green : stage.progress > 0 ? C.amber : C.t3 }}>{stage.progress || 0}%</div>
            </div>
            <PB v={stage.progress || 0} c={stage.progress >= 100 ? "green" : "amber"} />
            {/* Checklist items */}
            {stage.items && stage.items.length > 0 && <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid " + C.brd }}>
              {stage.items.map(function (item) {
                var itemIc = item.status === "completed" ? "✅" : item.contractorDone ? "📤" : "⬜";
                return <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 11 }}>
                  <span>{itemIc}</span>
                  <span style={{ flex: 1, color: item.status === "completed" ? C.green : C.t2 }}>{item.textAr}</span>
                  <span style={{ fontSize: 9, color: C.t3 }}>{(item.cost || 0).toLocaleString()} د.ب</span>
                </div>;
              })}
            </div>}
          </Card>;
        })}
      </div>;
    }

    return <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>جاري التحميل...</div>;
  }

  function renderHome() {
    if (role === "owner") return renderOwnerHome();
    if (role === "contractor") return renderContractorHome();
    if (role === "developer") return renderDeveloperHome();
    return renderInspectorHome();
  }

  // ═══════ TRACKING PAGE ═══════
  function renderTracking() { return ld ? <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>{t.loading}</div> : <div>
    {proj && <div>

      {/* ── Project Header Card ── */}
      <div style={{ background: C.gNavy, borderRadius: 16, padding: 18, color: "#fff", marginBottom: 12, boxShadow: "0 6px 20px rgba(13,27,42,.25)" }}>
        {/* Title + Status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 17, fontWeight: 900 }}>🏗️ {proj.title_ar}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
              {proj.location_ar && <span style={{ fontSize: 9, background: "rgba(255,255,255,.12)", padding: "2px 7px", borderRadius: 6 }}>📍 {proj.location_ar}</span>}
              {proj.area_sqm > 0 && <span style={{ fontSize: 9, background: "rgba(255,255,255,.12)", padding: "2px 7px", borderRadius: 6 }}>{proj.area_sqm}م²</span>}
              {proj.floors > 0 && <span style={{ fontSize: 9, background: "rgba(255,255,255,.12)", padding: "2px 7px", borderRadius: 6 }}>{proj.floors} {t.floors}</span>}
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 10, background: proj.status === "active" ? C.amber : proj.status === "completed" ? C.green : "rgba(255,255,255,.2)", color: "#fff" }}>
            {proj.status === "active" ? "⚡ " + t.stActive : proj.status === "completed" ? "✓ " + t.stCompleted : "📋 " + (isEn ? "Open" : "مفتوح")}
          </span>
        </div>

        {/* Progress */}
        <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, opacity: 0.7 }}>{t.overallProgress}</span>
            <span style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900, color: C.sky }}>{proj.completion || 0}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,.15)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (proj.completion || 0) + "%", background: "linear-gradient(90deg," + C.sky + "," + C.green + ")", borderRadius: 4, transition: "width 0.8s ease" }} />
          </div>
        </div>

        {/* Team */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[
            { ic: "👤", name: proj.owner_name, label: t.theOwner, color: C.sky },
            { ic: "👷", name: proj.contractor_name, label: proj.contractor_company || t.theContractor, color: C.amber },
            { ic: "🔍", name: proj.inspector_name, label: t.theInspector, color: C.green }
          ].map(function(m, i) {
            return <div key={i} style={{ background: "rgba(255,255,255,.08)", borderRadius: 8, padding: "7px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 14, marginBottom: 2 }}>{m.ic}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: m.name ? m.color : "rgba(255,255,255,.3)", lineHeight: 1.2 }}>{m.name || "—"}</div>
              <div style={{ fontSize: 8, opacity: 0.45, marginTop: 1 }}>{m.label}</div>
            </div>;
          })}
        </div>

        {/* Budget */}
        {proj.total_budget > 0 && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, opacity: 0.6 }}>{t.totalContractValue}</span>
          <span style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.amber }}>{Number(proj.total_budget).toLocaleString()} <span style={{ fontSize: 10, opacity: 0.6 }}>د.ب</span></span>
        </div>}

        {/* Download all project files button */}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", gap: 8 }}>
          <button onClick={function() {
            call("/projects/" + proj.id + "/all-files", "GET", null, tk).then(function(d) {
              if (d.total_files === 0) { show("لا توجد ملفات في المشروع بعد"); return; }
              setModal({ type: "projectFiles", data: d });
            });
          }} style={{ flex: 1, padding: "8px 12px", background: "rgba(66,165,245,.15)", border: "1px solid rgba(66,165,245,.35)", borderRadius: 10, color: C.sky, fontFamily: "Tajawal", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            📂 جميع ملفات المشروع
            <span style={{ fontSize: 9, background: "rgba(66,165,245,.2)", padding: "2px 6px", borderRadius: 6 }}>{stages.reduce(function(acc, st) { return acc + (st.stage_files || []).length + (st.sub_stages || []).reduce(function(a2, ss) { return a2 + (ss.items || []).reduce(function(a3, it) { return a3 + (it.files || []).length; }, 0); }, 0); }, 0)} ملف</span>
          </button>
        </div>

        {/* Contract button */}
        {contract && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <button onClick={function() { setShowContractView(!showContractView); }} style={{ width: "100%", padding: "8px 14px", background: showContractView ? "rgba(212,160,23,.25)" : "rgba(212,160,23,.12)", border: "1px solid rgba(212,160,23,.35)", borderRadius: 10, color: C.gold, fontFamily: "Tajawal", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>📄</span> {t.theContract}
            <span style={{ fontSize: 9, background: contract.status === "active" ? "rgba(14,173,105,.2)" : "rgba(212,160,23,.2)", padding: "2px 6px", borderRadius: 6, color: contract.status === "active" ? C.green : C.gold }}>{contract.status === "active" ? t.contractActive : t.awaitingSignature}</span>
          </button>
        </div>}
      </div>

      {/* ── Payment Plan per Stage (only when contract active) ── */}
      {(!contract || contract.status === "active") && !showContractView && stages.length > 0 && proj.total_budget > 0 && <div style={{ background: C.card, borderRadius: 14, padding: 14, marginBottom: 12, border: "1.5px solid " + C.brd, boxShadow: "0 3px 12px rgba(13,27,42,.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 13, fontWeight: 800, color: C.t1 }}>{t.paymentPlan}</div>
          <span style={{ fontSize: 10, color: C.t3 }}>{t.stagesAndPayment}</span>
        </div>
        {stages.map(function(st, i) {
          var allStagItems = [];
          (st.sub_stages || []).forEach(function(s) { (s.items || []).forEach(function(it) { allStagItems.push(it); }); });
          var doneStagItems = allStagItems.filter(function(it) { return it.owner_done === 1 && it.owner_approved === 1; }).length;
          var stagePct = allStagItems.length > 0 ? Math.round(doneStagItems / allStagItems.length * 100) : 0;
          var budget = st.budget || 0;
          var budgetPct = proj.total_budget > 0 ? Math.round(budget / proj.total_budget * 100) : 0;
          var stColor = st.status === "completed" ? C.green : st.status === "active" ? C.amber : C.slate;
          return <div key={st.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: st.status === "completed" ? C.gGreen : st.status === "active" ? C.gAmber : C.gSteel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>
                {st.status === "completed" ? "✓" : st.status === "locked" ? "🔒" : i + 1}
              </div>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: st.status === "locked" ? C.t3 : C.t1 }}>{st.name_ar}</span>
              <div style={{ textAlign: "left" }}>
                {budget > 0 && <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 11, fontWeight: 900, color: stColor }}>{Number(budget).toLocaleString()} <span style={{ fontSize: 8, fontWeight: 400, color: C.t3 }}>د.ب</span></div>}
                {budgetPct > 0 && <div style={{ fontSize: 8, color: C.t3, textAlign: "left" }}>{budgetPct}% {t.ofContractPct}</div>}
              </div>
            </div>
            <div style={{ height: 6, background: "#E8EFF8", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: stagePct + "%", background: st.status === "completed" ? "linear-gradient(90deg," + C.green + ",#4CAF50)" : "linear-gradient(90deg," + C.amber + ",#FFB74D)", borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 8, color: C.t3 }}>{doneStagItems}/{allStagItems.length} {t.itemDone}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: stColor }}>{stagePct}%</span>
            </div>
          </div>;
        })}
        {/* Total */}
        <div style={{ marginTop: 8, padding: "10px 12px", background: "linear-gradient(135deg,rgba(21,101,192,.06),rgba(21,101,192,.1))", borderRadius: 10, border: "1px solid rgba(21,101,192,.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>{t.totalContract}</div>
            <div style={{ fontSize: 9, color: C.t3 }}>{t.paymentTriple}</div>
          </div>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.ocean }}>{Number(proj.total_budget).toLocaleString()} <span style={{ fontSize: 9, color: C.t3 }}>د.ب</span></div>
        </div>
      </div>}

      {/* ── Triple Approval Workflow (only when contract active) ── */}
      {(!contract || contract.status === "active") && !showContractView && stages.length > 0 && <div style={{ background: "linear-gradient(135deg,rgba(13,27,42,.04),rgba(21,101,192,.06))", border: "1px solid rgba(21,101,192,.15)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.ocean, marginBottom: 8 }}>{t.tripleApprovalMech}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { ic: "👷", label: t.contractorDelivers, color: C.amber, step: 1 },
            { ic: "→", label: "", color: C.t3, step: null },
            { ic: "🔍", label: t.inspectorInspects, color: C.green, step: 2 },
            { ic: "→", label: "", color: C.t3, step: null },
            { ic: "👤", label: t.ownerApprovesAndPays, color: C.sky, step: 3 }
          ].map(function(s, i) {
            if (!s.step) return <span key={i} style={{ fontSize: 12, color: C.t3, flexShrink: 0 }}>→</span>;
            return <div key={i} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,.7)", borderRadius: 8, padding: "6px 4px", border: "1px solid " + s.color + "33" }}>
              <div style={{ fontSize: 14 }}>{s.ic}</div>
              <div style={{ fontSize: 8, fontWeight: 700, color: s.color, lineHeight: 1.2, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 8, color: C.t3 }}>{t.step} {s.step}</div>
            </div>;
          })}
        </div>
      </div>}

      {/* Project Files */}
      {(!contract || contract.status === "active") && !showContractView && projFiles.length > 0 && <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{t.projectFiles} ({projFiles.length})</div>
        {projFiles.map(function (f, i) {
          var fileUrl = f.file_path || f.url || "";
          var canOpen = !!fileUrl;
          return <div key={i} onClick={function(){ if (canOpen) window.open(fileUrl.startsWith("http") ? fileUrl : ASSET_BASE + "/" + fileUrl, "_blank"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", marginBottom: 3, background: canOpen ? "rgba(21,101,192,.04)" : "transparent", borderRadius: 8, cursor: canOpen ? "pointer" : "default", border: canOpen ? "1px solid rgba(21,101,192,.1)" : "none" }}>
            <span style={{ fontSize: 14 }}>{f.file_type === "image" ? "🖼️" : f.file_type === "video" ? "🎥" : "📄"}</span>
            <span style={{ flex: 1, fontSize: 10, color: C.t2 }}>{f.file_name}</span>
            {canOpen && <span style={{ fontSize: 12, color: C.ocean }}>📂</span>}
            {f.uploader && <span style={{ fontSize: 9, color: C.t3 }}>{f.uploader}</span>}
          </div>;
        })}
      </Card>}

      {/* Quotations section (for owner on open projects) - hidden when contract pending */}
      {(!contract || contract.status === "active") && !showContractView && role === "owner" && quotations.length > 0 && <div>
        <SectionTitle ic={<Coins size={16} color={C.gold} />}>{t.quotationsTitle} ({quotations.length})</SectionTitle>
        {quotations.map(function (q) {
          var boq = []; try { boq = JSON.parse(q.boq_data || "[]"); } catch(e){}
          return <Card key={q.id} bc={q.status === "accepted" ? C.green : q.status === "rejected" ? C.red : C.gold}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(232,114,12,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👷</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{q.contractor_name}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>{q.company_name_ar} {q.rating > 0 && "⭐ " + q.rating} {q.cr_number && "| " + q.cr_number}</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 14, color: C.amber }}>{Number(q.total_price).toLocaleString()} <span style={{ fontSize: 9 }}>د.ب</span></div>
                <div style={{ fontSize: 9, color: C.t3 }}>{q.duration_months} {t.monthStr} | {t.warranty} {q.warranty_months} {t.monthStr}</div>
              </div>
            </div>
            {q.notes && <div style={{ fontSize: 10, color: C.t2, marginTop: 6, padding: "6px 8px", background: "#F4F7FB", borderRadius: 6 }}>{q.notes}</div>}
            {/* BOQ Excel file download — visible only when contractor attached one (server-enforced ACL) */}
            {q.has_boq_file && <div onClick={function(){ downloadBoq(q.id, q.boq_file_name); }} style={{ marginTop: 8, padding: "8px 10px", background: "linear-gradient(135deg,rgba(16,185,129,.08),rgba(16,185,129,.04))", border: "1px solid rgba(16,185,129,.25)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>📗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green }}>ملف BOQ مرفق — Excel</div>
                <div style={{ fontSize: 9, color: C.t3 }}>{q.boq_file_name || "BOQ.xlsx"}{q.boq_file_size ? " • " + (q.boq_file_size / 1024).toFixed(1) + " KB" : ""}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>📥 تحميل</span>
            </div>}
            {/* BOQ Details */}
            {boq.length > 0 && <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 4 }}>{t.boqTable} — {boq.length} {t.boqItems}</div>
              <div style={{ border: "1px solid " + C.brd, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: "#F4F7FB", padding: "6px 8px", fontSize: 9, fontWeight: 700, color: C.t2 }}>
                  <span>{t.thItem}</span><span>{t.thUnit}</span><span>{t.thQty}</span><span>{t.thPrice}</span><span>{t.thBrand}</span>
                </div>
                {boq.map(function (b, i) {
                  return <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "5px 8px", fontSize: 9, color: C.t1, borderTop: "1px solid #EDF1F7" }}>
                    <span>{b.description}</span>
                    <span style={{ color: C.t3 }}>{b.unit}</span>
                    <span>{b.quantity}</span>
                    <span style={{ color: C.amber }}>{Number(b.unit_price || 0).toLocaleString()}</span>
                    <span style={{ color: C.purple }}>{b.brand || "—"}</span>
                  </div>;
                })}
              </div>
            </div>}
            {q.status === "pending" && <div style={{ marginTop: 8 }}><Btn v="green" sm f onClick={function () { acceptQuotation(q.id); }}>{t.acceptOffer}</Btn></div>}
            {q.status !== "pending" && <div style={{ marginTop: 6 }}><Badge c={q.status === "accepted" ? "green" : "red"}>{q.status === "accepted" ? t.accepted : t.rejected}</Badge></div>}
          </Card>;
        })}
      </div>}

      {/* Inspector applications - hidden when contract pending */}
      {(!contract || contract.status === "active") && !showContractView && role === "owner" && inspApps.length > 0 && <div>
        <SectionTitle ic={<Search size={16} color={C.green} />}>{t.inspectorAppsTitle} ({inspApps.length})</SectionTitle>
        {inspApps.map(function (ia) {
          return <Card key={ia.id} bc={ia.status === "accepted" ? C.green : C.brd}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(14,173,105,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔍</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{ia.name_ar}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>{ia.specialty} {ia.rating > 0 && "⭐ " + ia.rating}</div>
              </div>
              <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 13, color: C.green }}>{Number(ia.fee).toLocaleString()} د.ب</div>
            </div>
            {ia.notes && <div style={{ fontSize: 10, color: C.t2, marginTop: 6, padding: "6px 8px", background: "#F4F7FB", borderRadius: 6 }}>{ia.notes}</div>}
            {ia.status === "pending" && <div style={{ marginTop: 8 }}><Btn v="green" sm f onClick={function () { acceptInspector(ia.id); }}>{t.assignInspector}</Btn></div>}
            {ia.status !== "pending" && <Badge c={ia.status === "accepted" ? "green" : "red"}>{ia.status === "accepted" ? t.assigned : t.rejected}</Badge>}
          </Card>;
        })}
      </div>}

      {/* Contract View (shown when toggled or when contract not signed) */}
      {(showContractView || (contract && contract.status !== "active")) && <ContractScreen project={proj} token={tk} user={user} onRefresh={function() { fetchProj(proj.id); setShowContractView(false); }} />}

      {/* Only show stages when contract is active or no contract exists */}
      {(!contract || contract.status === "active") && !showContractView && <div>
      {/* Workflow hint */}
      {stages.length > 0 && <div style={{ background: "rgba(232,114,12,.05)", border: "1px solid rgba(232,114,12,.15)", borderRadius: 8, padding: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.amber }}>
          {t.workflowHint}
        </div>
        <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>
          {t.workflowDesc}
        </div>
      </div>}

      {/* Stages */}
      {stages.map(function (st, si) { return renderStage(st, si); })}
      {stages.length === 0 && !ld && proj.status !== "active" && <div style={{ textAlign: "center", padding: 20, color: C.t3, fontSize: 12 }}>
        📋 بانتظار قبول عرض سعر لبدء مراحل التنفيذ
      </div>}
      </div>}
    </div>}
    {!proj && <div style={{ textAlign: "center", padding: 30, color: C.t3, fontSize: 12 }}>{t.selectProject}</div>}
  </div>; }

  // ═══════ WALLET PAGE — COMING SOON ═══════
  function renderWallet() { return <div>
    <div style={{ background: C.gNavy, borderRadius: 18, padding: 20, color: "#fff", marginBottom: 14, boxShadow: "0 8px 28px rgba(13,27,42,.3)", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: -20, left: -20, width: 120, height: 120, background: "rgba(255,255,255,.04)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -30, right: -10, width: 160, height: 160, background: "rgba(255,255,255,.03)", borderRadius: "50%" }} />
      <div style={{ fontSize: 40, marginBottom: 10 }}>👛</div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{t.walletPageTitle}</div>
      <Badge c="gold">{t.comingSoon}</Badge>
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 12, lineHeight: 1.6 }}>{t.walletComingDesc}<br/>{t.stayTuned}</div>
    </div>

  </div>; }

  // ═══════ PROFILE PAGE ═══════
  function renderProfile() {
    var unreadCount = notifs.filter(function(n) { return !n.is_read; }).length;
    var profColor = role === "owner" ? C.ocean : role === "contractor" ? C.amber : C.green;
    var profGrad = role === "owner" ? C.gBlue : role === "contractor" ? C.gAmber : C.gGreen;
    return <div>

      {/* Profile header card */}
      <div style={{ background: profGrad, borderRadius: 18, padding: 18, color: "#fff", marginBottom: 14, boxShadow: "0 6px 22px rgba(13,27,42,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{ width: 62, height: 62, borderRadius: 18, background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,.2)" }}>{ri}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 17, fontWeight: 900 }}>{isEn ? (user.name_en || user.nameEn || user.name_ar || user.nameAr) : (user.name_ar || user.nameAr)}</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{rt}</div>
            {user.isAdmin && <div style={{ marginTop: 4 }}><span style={{ fontSize: 9, background: "rgba(255,255,255,.2)", padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>{t.sysAdmin}</span></div>}
          </div>
          {user.rating > 0 && <div style={{ textAlign: "center", background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900 }}>⭐ {user.rating}</div>
            <div style={{ fontSize: 8, opacity: 0.6 }}>{t.yourRating}</div>
          </div>}
        </div>

        {/* Info row */}
        <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 12px" }}>
          {[
            { ic: "📧", v: user.email },
            { ic: "📱", v: user.phone },
            { ic: "🏢", v: isEn ? (user.company_name_en || user.companyNameEn || user.company_name_ar || user.companyNameAr) : (user.company_name_ar || user.companyNameAr) },
            { ic: "📋", v: isEn ? (user.specialty_en || user.specialtyEn || user.specialty) : user.specialty },
            { ic: "📄", v: user.cr_number || user.crNumber }
          ].filter(function(r){ return r.v; }).map(function(r, i) {
            return <div key={i} style={{ fontSize: 10, opacity: 0.85, marginBottom: i < 4 ? 3 : 0 }}>{r.ic} {r.v}</div>;
          })}
        </div>

        {/* Edit buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          <button onClick={function(){ setModal("editProfile"); }} style={{ padding: "8px 0", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "Tajawal", cursor: "pointer" }}>{t.editProfile}</button>
          <button onClick={function(){ setModal("changePassword"); }} style={{ padding: "8px 0", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "Tajawal", cursor: "pointer" }}>{t.changePassword}</button>
        </div>
      </div>

      {/* Stats row — for contractor/inspector */}
      {(role === "contractor" || role === "inspector") && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        <StatCard v={projects.filter(function(p){ return role==="contractor"?p.contractor_id===user.id:p.inspector_id===user.id; }).length} l={t.projectsLabel} ic={<Construction size={18} />} cl={profColor} />
        <StatCard v={projects.filter(function(p){ return (role==="contractor"?p.contractor_id===user.id:p.inspector_id===user.id) && p.status==="active"; }).length} l={t.profileActive} ic={<Zap size={18} />} cl={C.amber} />
        <StatCard v={user.rating || "—"} l={t.yourRating} ic={<Star size={18} />} cl={C.gold} />
      </div>}

      {/* Admin panel quick access */}
      {user.isAdmin && <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.08),rgba(124,58,237,.14))", border: "2px solid rgba(124,58,237,.25)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, marginBottom: 8 }}>{t.adminPanel}</div>
        <Btn v="primary" sm f onClick={function(){ setPage("admin"); }}>{t.enterAdmin}</Btn>
      </div>}

      {/* Notifications */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <SectionTitle ic={<Bell size={16} color={C.amber} />}>{t.notifications} {unreadCount > 0 && <span style={{ background: C.red, color: "#fff", fontSize: 9, padding: "1px 6px", borderRadius: 8, marginRight: 4 }}>{unreadCount}</span>}</SectionTitle>
        {notifs.length > 0 && <Btn v="outline" sm onClick={function () { call("/notifications/read-all", "POST", {}, tk).then(function () { loadData(); }); }}>{t.readAll}</Btn>}
      </div>
      {notifs.length === 0 && <div style={{ textAlign: "center", padding: 24, color: C.t3 }}>
        <div style={{ fontSize: 36 }}>🔕</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>{t.noNotifications}</div>
      </div>}
      {notifs.slice(0, 20).map(function (n, i) {
        var notifIc = n.type === "action" ? "⏳" : n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : "ℹ️";
        var notifBg = !n.is_read ? (n.type === "success" ? "rgba(14,173,105,.06)" : n.type === "warning" ? "rgba(232,114,12,.06)" : "rgba(21,101,192,.06)") : "transparent";
        var notifBrd = !n.is_read ? (n.type === "success" ? C.green : n.type === "warning" ? C.amber : C.ocean) : C.brd;
        return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: C.card, border: "1.5px solid " + notifBrd, borderRadius: 12, marginBottom: 8, opacity: n.is_read ? 0.55 : 1, boxShadow: n.is_read ? "none" : "0 2px 8px rgba(13,27,42,.07)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: notifBg, border: "1px solid " + notifBrd + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{notifIc}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>{isEn ? (n.title_en || n.titleEn || n.title_ar) : n.title_ar}</div>
            {(n.message_ar || n.message_en) && <div style={{ fontSize: 10, color: C.t2, marginTop: 2 }}>{isEn ? (n.message_en || n.messageEn || n.message_ar) : n.message_ar}</div>}
            <div style={{ fontSize: 8, color: C.t3, marginTop: 3 }}>{(n.created_at || "").substring(0, 16)}</div>
          </div>
          {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: notifBrd, flexShrink: 0, marginTop: 4 }} />}
        </div>;
      })}

      {/* Logout */}
      <div style={{ marginTop: 16 }}>
        <Btn v="red" f onClick={logout}>{t.logout}</Btn>
      </div>
    </div>;
  }

  // ═══════ ADMIN PAGE ═══════
  function renderAdmin() {
    if (!user || !user.isAdmin) return <div style={{ padding: 20, textAlign: "center", color: C.red }}>غير مصرح — تحتاج صلاحيات مشرف</div>;
    return <AdminPage tk={tk} onBack={function(){ setPage("profile"); }} show={show} />;
  }

  // ═══════ ACHIEVEMENTS GALLERY — Grouped by Company ═══════
  function renderAchievements() {
    return <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 50, marginBottom: 14 }}>🏆</div>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900, color: C.t1, marginBottom: 8 }}>{t.achievementsPageTitle}</div>
      <Badge c="gold">{t.comingSoon}</Badge>
      <div style={{ fontSize: 12, color: C.t3, marginTop: 14, lineHeight: 1.8 }}>{t.achievementsComingDesc}<br/>{t.stayTuned}</div>
    </div>;
  }

  function _renderAchievements_disabled() {
    if (achLoading) return <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>⚡ جاري التحميل...</div>;

    // Group completed projects by contractor company
    var companyMap = {};
    achievements.forEach(function(p) {
      var cid = p.contractor_id || "unknown";
      if (!companyMap[cid]) {
        companyMap[cid] = {
          id: cid,
          name: p.contractor_name || t.unknownName,
          company: p.contractor_company || p.contractor_name || t.unknownCompany,
          projects: [],
          totalBudget: 0,
          ratings: []
        };
      }
      companyMap[cid].projects.push(p);
      companyMap[cid].totalBudget += (p.total_budget || 0);
      if (p.contractor_avg_rating > 0) companyMap[cid].ratings.push(p.contractor_avg_rating);
    });

    var companies = Object.values(companyMap).sort(function(a, b) {
      return b.projects.length - a.projects.length;
    });

    return <div>
      {/* Banner */}
      <div style={{ background: C.gNavy, borderRadius: 16, padding: 18, color: "#fff", marginBottom: 14, boxShadow: "0 6px 20px rgba(13,27,42,.25)" }}>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900 }}>🏆 معرض الأعمال المنجزة</div>
        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 3 }}>{t.certifiedCompaniesOnly}</div>
        <div style={{ display: "flex", gap: 24, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <div><div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900, color: C.sky }}>{companies.length}</div><div style={{ fontSize: 9, opacity: 0.5 }}>شركة مقاولات</div></div>
          <div><div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900, color: C.amber }}>{achievements.length}</div><div style={{ fontSize: 9, opacity: 0.5 }}>مشروع منجز</div></div>
        </div>
      </div>

      {/* Note: active projects hidden until completion */}
      <div style={{ background: "rgba(21,101,192,.07)", border: "1px solid rgba(21,101,192,.2)", borderRadius: 10, padding: "8px 12px", marginBottom: 14, fontSize: 10, color: C.ocean, display: "flex", gap: 6, alignItems: "center" }}>
        <span>🔒</span>
        <span>المشاريع الجارية تظهر للمقاول وصاحب المشروع فقط — تُضاف للمعرض بعد الإنجاز</span>
      </div>

      {/* Empty state */}
      {companies.length === 0 && <div style={{ textAlign: "center", padding: 52, color: C.t3 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🏗️</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.noCompletedWorksYet}</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>ستظهر أعمال الشركات هنا بعد اكتمال المشاريع</div>
      </div>}

      {/* Company cards */}
      {companies.map(function(co) {
        var latest = co.projects[0];
        var avgRating = co.ratings.length > 0
          ? (co.ratings.reduce(function(s, r) { return s + r; }, 0) / co.ratings.length).toFixed(1)
          : "—";

        return <div key={co.id} style={{ background: C.card, border: "1.5px solid " + C.brd, borderRadius: 16, marginBottom: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(13,27,42,.09)" }}>
          {/* Top accent */}
          <div style={{ height: 4, background: C.gBlue }} />

          <div style={{ padding: "14px 15px" }}>
            {/* Company header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: C.gNavy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: "0 3px 10px rgba(13,27,42,.25)" }}>🏢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 900, color: C.t1 }}>{co.company}</div>
                <div style={{ fontSize: 10, color: C.t3, marginTop: 1 }}>👷 {co.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <StarRating value={parseFloat(avgRating) || 0} size={12} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.t2 }}>{avgRating} / 5</span>
                </div>
              </div>
              <div style={{ textAlign: "center", background: "rgba(21,101,192,.08)", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900, color: C.ocean }}>{co.projects.length}</div>
                <div style={{ fontSize: 9, color: C.t3 }}>مشروع</div>
              </div>
            </div>

            {/* Latest project preview */}
            {latest && <div style={{ background: "linear-gradient(135deg,rgba(21,101,192,.05),rgba(21,101,192,.1))", border: "1px solid rgba(21,101,192,.15)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.ocean, marginBottom: 5, letterSpacing: 0.5 }}>📍 آخر إنجاز</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.t1 }}>{typeIcon(latest.type)} {latest.title_ar}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                {latest.location_ar && <span style={{ fontSize: 10, color: C.t3 }}>📍 {latest.location_ar}</span>}
                {latest.total_budget > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: C.amber }}>💰 {Number(latest.total_budget).toLocaleString()} د.ب</span>}
                {latest.completed_at && <span style={{ fontSize: 10, color: C.green }}>✅ {(latest.completed_at || "").substring(0, 10)}</span>}
              </div>
            </div>}

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
              {[
                { v: co.projects.length, l: "مشاريع منجزة", c: C.ocean },
                { v: Number(co.totalBudget).toLocaleString(), l: "د.ب إجمالي", c: C.amber },
                { v: avgRating, l: "تقييم / 5", c: C.green }
              ].map(function(s, i) {
                return <div key={i} style={{ background: "linear-gradient(145deg,#F4F7FC,#EEF3FA)", borderRadius: 10, padding: "8px 6px", textAlign: "center", border: "1px solid " + C.brd }}>
                  <div style={{ fontFamily: "Cairo, sans-serif", fontSize: i === 1 ? 11 : 16, fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 8, color: C.t3, marginTop: 1 }}>{s.l}</div>
                </div>;
              })}
            </div>

            {/* Open company profile */}
            <Btn v="primary" sm f onClick={function() { setModal({ type: "companyProfile", company: co }); }}>
              📂 عرض ملف الشركة ومشاريعها ({co.projects.length})
            </Btn>
          </div>
        </div>;
      })}
    </div>;
  }

  // ════════════ [OLD ACHIEVEMENTS — REPLACED] ════════════
  function _oldAchievements_unused() { return achLoading
    ? <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>&#9889; جاري التحميل...</div>
    : <div>
      {/* Gold Banner */}
      <div style={{
        background: "linear-gradient(135deg, #D4A017 0%, #B8860B 50%, #8B6914 100%)",
        borderRadius: 16, padding: 22, color: "#fff", marginBottom: 16, textAlign: "center",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.1 }}>&#127942;</div>
        <div style={{ fontSize: 28, marginBottom: 4 }}>&#127942;</div>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 20, fontWeight: 900 }}>معرض الأعمال المنجزة</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{isEn ? "Certified construction companies — Browse to choose the best" : "أعمال شركات البناء المعتمدة — استعرض لتختار الأنسب"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.2)" }}>
          <div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900 }}>{achievements.length}</div>
            <div style={{ fontSize: 9, opacity: 0.6 }}>{t.completedProjectLabel}</div>
          </div>
          <div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 22, fontWeight: 900 }}>
              {achievements.length > 0 ? Number(achievements.reduce(function(s,p){ return s + (p.total_budget || 0); }, 0)).toLocaleString() : "0"}
            </div>
            <div style={{ fontSize: 9, opacity: 0.6 }}>د.ب إجمالي</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {achievements.length === 0 && <div style={{
        textAlign: "center", padding: 40, color: C.t3
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>&#128679;</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.noCompletedProjectsYet}</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>{t.projectsAppearWithRatings}</div>
      </div>}

      {/* Achievement Cards */}
      {achievements.map(function (p) {
        var startDate = (p.created_at || "").substring(0, 10);
        var endDate = (p.completed_at || "").substring(0, 10);
        var durationText = "";
        if (p.created_at && p.completed_at) {
          var d1 = new Date(p.created_at); var d2 = new Date(p.completed_at);
          var diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
          if (diffDays < 30) durationText = diffDays + " يوم";
          else { var months = Math.round(diffDays / 30); durationText = months + " شهر"; }
        }

        var myContractorRating = (p.ratings || []).find(function(r) { return r.rater_id === user.id && r.rated_role === "contractor"; });
        var myInspectorRating = (p.ratings || []).find(function(r) { return r.rater_id === user.id && r.rated_role === "inspector"; });

        return <div key={p.id} style={{
          background: C.card, border: "2px solid rgba(212,160,23,.15)",
          borderRadius: 16, marginBottom: 14, overflow: "hidden",
          boxShadow: "0 4px 15px rgba(212,160,23,.08)"
        }}>
          {/* Gold top stripe */}
          <div style={{ height: 4, background: "linear-gradient(90deg, " + C.gold + ", " + C.amber + ", " + C.gold + ")" }} />

          <div style={{ padding: 16 }}>
            {/* Project header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(212,160,23,.15), rgba(232,114,12,.15))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0
              }}>{typeIcon(p.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 800, color: C.t1 }}>{p.title_ar}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                  <Badge c="gold">&#10003; {t.stCompleted}</Badge>
                  <Badge c="blue">{typeLabel(p.type)}</Badge>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 8, marginBottom: 12, padding: 12,
              background: "#F8F6F0", borderRadius: 10
            }}>
              {p.location_ar && <div style={{ fontSize: 10, color: C.t2 }}>
                &#128205; <span style={{ fontWeight: 600 }}>{p.location_ar}</span>
              </div>}
              {p.area_sqm > 0 && <div style={{ fontSize: 10, color: C.t2 }}>
                &#128207; <span style={{ fontWeight: 600 }}>{p.area_sqm} م&#178;</span>
                {p.floors > 0 && " | " + p.floors + " أدوار"}
              </div>}
              <div style={{ fontSize: 10, color: C.t2 }}>
                &#128197; بدء: <span style={{ fontWeight: 600 }}>{startDate || "—"}</span>
              </div>
              <div style={{ fontSize: 10, color: C.t2 }}>
                &#127937; انتهاء: <span style={{ fontWeight: 600 }}>{endDate || "—"}</span>
              </div>
              {durationText && <div style={{ fontSize: 10, color: C.t2 }}>
                &#9201; المدة: <span style={{ fontWeight: 600 }}>{durationText}</span>
              </div>}
              {p.duration_months > 0 && <div style={{ fontSize: 10, color: C.t2 }}>
                &#128196; العقد: <span style={{ fontWeight: 600 }}>{p.duration_months} شهر</span>
              </div>}
            </div>

            {/* Total cost banner */}
            {p.total_budget > 0 && <div style={{
              background: "linear-gradient(135deg, " + C.navy + ", #163A5F)",
              borderRadius: 10, padding: 12, marginBottom: 12,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>التكلفة الإجمالية</div>
              <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 18, fontWeight: 900, color: C.gold }}>
                {Number(p.total_budget).toLocaleString()} <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>د.ب</span>
              </div>
            </div>}

            {/* Team section */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 6 }}>&#128101; فريق المشروع</div>

              {/* Owner */}
              {p.owner_name && <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                background: "rgba(26,111,181,.04)", borderRadius: 8, marginBottom: 4
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.ocean, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>&#128100;</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{p.owner_name}</div>
                  <div style={{ fontSize: 9, color: C.t3 }}>صاحب المشروع</div>
                </div>
              </div>}

              {/* Contractor */}
              {p.contractor_name && <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                background: "rgba(232,114,12,.04)", borderRadius: 8, marginBottom: 4
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>&#128119;</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{p.contractor_name}</div>
                  <div style={{ fontSize: 9, color: C.t3 }}>{p.contractor_company || "المقاول"}
                    {p.warranty_months > 0 && " | ضمان " + p.warranty_months + " شهر"}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <StarRating value={myContractorRating ? myContractorRating.rating : p.contractor_avg_rating} size={14} />
                  <div style={{ fontSize: 8, color: C.t3 }}>
                    {p.contractor_avg_rating > 0 ? p.contractor_avg_rating + "/5" : "بدون تقييم"}
                  </div>
                  {role === "owner" && user.id === p.owner_id && !myContractorRating && p.contractor_id && <div style={{ marginTop: 3 }}>
                    <Btn v="gold" sm onClick={function() {
                      setModal({ type: "rate", projectId: p.id, projectTitle: p.title_ar,
                        ratedUserId: p.contractor_id, ratedRole: "contractor", ratedName: p.contractor_name });
                    }}>&#11088; قيّم</Btn>
                  </div>}
                  {myContractorRating && <div style={{ fontSize: 8, color: C.green, fontWeight: 700, marginTop: 2 }}>&#10003; تم التقييم</div>}
                </div>
              </div>}

              {/* Inspector */}
              {p.inspector_name && <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                background: "rgba(14,173,105,.04)", borderRadius: 8, marginBottom: 4
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>&#128269;</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{p.inspector_name}</div>
                  <div style={{ fontSize: 9, color: C.t3 }}>{p.inspector_specialty || t.qualityInspector}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <StarRating value={myInspectorRating ? myInspectorRating.rating : p.inspector_avg_rating} size={14} />
                  <div style={{ fontSize: 8, color: C.t3 }}>
                    {p.inspector_avg_rating > 0 ? p.inspector_avg_rating + "/5" : "بدون تقييم"}
                  </div>
                  {role === "owner" && user.id === p.owner_id && !myInspectorRating && p.inspector_id && <div style={{ marginTop: 3 }}>
                    <Btn v="gold" sm onClick={function() {
                      setModal({ type: "rate", projectId: p.id, projectTitle: p.title_ar,
                        ratedUserId: p.inspector_id, ratedRole: "inspector", ratedName: p.inspector_name });
                    }}>&#11088; قيّم</Btn>
                  </div>}
                  {myInspectorRating && <div style={{ fontSize: 8, color: C.green, fontWeight: 700, marginTop: 2 }}>&#10003; تم التقييم</div>}
                </div>
              </div>}
            </div>

            {/* Reviews */}
            {(p.ratings || []).filter(function(r){ return r.review_ar; }).length > 0 && <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 4 }}>&#128172; التقييمات</div>
              {(p.ratings || []).filter(function(r){ return r.review_ar; }).map(function(r, i) {
                return <div key={i} style={{
                  padding: "8px 10px", background: "rgba(212,160,23,.04)",
                  borderRadius: 8, marginBottom: 4, borderRight: "3px solid " + C.gold
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{r.rater_name}</span>
                    <StarRating value={r.rating} size={10} />
                  </div>
                  <div style={{ fontSize: 10, color: C.t2 }}>{r.review_ar}</div>
                </div>;
              })}
            </div>}
          </div>
        </div>;
      })}
    </div>; }

  // ═══════ PAGE ROUTER ═══════

  function renderPage() {
    try {
      if (page === "home") return renderHome();
      if (page === "tracking") return renderTracking();
      if (page === "wallet") return renderWallet();
      if (page === "achievements") return renderAchievements();
      if (page === "tenders") return renderTenders();
      if (page === "offers") return renderOffersPage();
      if (page === "admin") return renderAdmin();
      if (page === "compounds" && role === "developer") { setDevPage("overview"); return renderDeveloperHome(); }
      return renderProfile();
    } catch (err) {
      console.error("Page render error:", err);
      return <div style={{ padding: 20, color: "red", textAlign: "center" }}>
        <div>خطأ في عرض الصفحة</div>
        <div style={{ fontSize: 10, marginTop: 8 }}>{String(err)}</div>
      </div>;
    }
  }
  var pg = renderPage();

  // ═══════ NAVIGATION ═══════
  var nav = role === "owner"
    ? [
        { id: "home", ic: <Home size={20} />, lb: t.navHome },
        { id: "offers", ic: <Inbox size={20} />, lb: t.navOffers, badge: dash.pending_quotations > 0 ? dash.pending_quotations : null },
        { id: "wallet", ic: <Wallet size={20} />, lb: t.navWallet, soon: true },
        { id: "tracking", ic: <ClipboardList size={20} />, lb: t.navProject },
        { id: "profile", ic: <User size={20} />, lb: t.navProfile }
      ]
    : role === "contractor"
    ? [
        { id: "home", ic: <Home size={20} />, lb: t.navHome },
        { id: "tenders", ic: <CircleDollarSign size={20} />, lb: t.navTenders, badge: dash.awaiting_pricing > 0 ? dash.awaiting_pricing : null },
        { id: "achievements", ic: <Trophy size={20} />, lb: t.navGallery, soon: true },
        { id: "tracking", ic: <ClipboardList size={20} />, lb: t.navProject },
        { id: "profile", ic: <HardHat size={20} />, lb: t.navProfile }
      ]
    : role === "developer"
    ? [
        { id: "home", ic: <Home size={20} />, lb: t.navHome },
        { id: "compounds", ic: <Building2 size={20} />, lb: isEn ? "Compounds" : "المجمعات" },
        { id: "wallet", ic: <Wallet size={20} />, lb: t.navWallet, soon: true },
        { id: "achievements", ic: <Trophy size={20} />, lb: t.navGallery, soon: true },
        { id: "profile", ic: <Construction size={20} />, lb: t.navProfile }
      ]
    : [
        { id: "home", ic: <Home size={20} />, lb: t.navHome },
        { id: "tenders", ic: <FileText size={20} />, lb: isEn ? "Projects" : "المشاريع", badge: openProjects.length > 0 ? openProjects.length : null },
        { id: "achievements", ic: <Trophy size={20} />, lb: t.navGallery, soon: true },
        { id: "tracking", ic: <ClipboardList size={20} />, lb: t.navProject },
        { id: "profile", ic: <Search size={20} />, lb: t.navProfile }
      ];

  // ═══════ MODALS ═══════
  var modalUI = null;
  function ModalWrap(p) {
    return <div onClick={function () { setModal(null); }} style={{ position: "fixed", inset: 0, background: "rgba(11,29,51,.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div onClick={function (e) { e.stopPropagation(); }} style={{ background: C.card, borderRadius: "18px 18px 0 0", width: "100%", padding: "18px 18px 28px", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#DDE2EB", borderRadius: 2, margin: "0 auto 14px" }} />
        {p.children}
      </div>
    </div>;
  }

  // ── Deposit Modal — isolated component ──
  if (modal === "deposit") {
    modalUI = <ModalWrap>
      <DepositForm onSubmit={function (data) { doDeposit(data.amount, data.bank); }} />
    </ModalWrap>;
  }
  // ── AI Smart Upload Modal ──
  else if (modal === "aiUpload") {
    modalUI = <ModalWrap>
      <AIProjectUpload
        token={tk}
        onClose={function () { setModal(null); }}
        onCreated={function (pid) {
          show("✅ تم إنشاء المشروع بالذكاء الاصطناعي — سيتم إشعار المقاولين فوراً");
          setModal(null);
          loadData();
        }}
      />
    </ModalWrap>;
  }

  // ── Manual "newProject" modal REMOVED — projects must be created via AI upload flow only ──
  // ── BOQ Quotation Modal (contractor) — Excel upload ──
  else if (modal && modal.type === "quotation") {
    modalUI = <ModalWrap>
      <BOQQuotationForm
        modal={modal}
        onClose={function () { setModal(null); }}
        onSubmit={function (data) {
          if (!data.file) { show("❌ الرجاء رفع ملف BOQ"); return; }
          if (!data.items || data.items.length === 0 || data.total === 0) { show("❌ لم يتم التعرف على بنود في الملف"); return; }
          var fd = new FormData();
          fd.append("boqFile", data.file);
          fd.append("price", String(data.total));
          fd.append("durationMonths", String(data.dur));
          fd.append("warrantyMonths", String(data.warranty));
          fd.append("notes", data.notes || "");
          var h = { "Authorization": "Bearer " + tk };
          fetch(BASE + "/projects/" + modal.pid + "/quotation-excel", { method: "POST", headers: h, body: fd })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (d.success) {
                show("✅ تم تقديم العرض — سيتم إشعار المالك فوراً");
                setModal(null); loadData();
              } else show("❌ " + (d.error || "خطأ في رفع الملف"));
            })
            .catch(function (e) { console.error("BOQ upload", e); show("❌ خطأ في الاتصال"); });
        }}
      />
    </ModalWrap>;
  }
  // ── Inspector Apply Modal — isolated component ──
  else if (modal && modal.type === "inspectorApply") {
    modalUI = <ModalWrap>
      <InspectorApplyForm
        modal={modal}
        onSubmit={function (data) {
          call("/projects/" + modal.pid + "/apply-inspector", "POST", data, tk).then(function (d) {
            if (d.success) { show("✅ تم تقديم الترشيح"); setModal(null); loadData(); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
      />
    </ModalWrap>;
  }
  // ── Contractor Submit Modal — isolated component ──
  else if (modal && modal.type === "contractorSubmit") {
    modalUI = <ModalWrap>
      <ContractorSubmitForm
        modal={modal}
        onSubmit={function (data) {
          call("/items/" + modal.itemId + "/contractor-submit", "POST", data, tk).then(function (d) {
            if (d.success) { show("✅ تم تسليم البند بنجاح"); setModal(null); loadData(); if (proj) fetchProj(proj.id); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
      />
    </ModalWrap>;
  }
  // ── Inspector Review Modal — isolated component ──
  else if (modal && modal.type === "inspectorReview") {
    modalUI = <ModalWrap>
      <InspectorReviewForm
        modal={modal}
        onApprove={function (data) {
          call("/items/" + modal.itemId + "/inspector-review", "POST", { approved: true, notes: data.notes, rejection_reason: "", files: data.files }, tk).then(function (d) {
            if (d.success) { show("✅ تم اعتماد البند"); setModal(null); loadData(); if (proj) fetchProj(proj.id); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
        onReject={function (data) {
          call("/items/" + modal.itemId + "/inspector-review", "POST", { approved: false, notes: data.notes, rejection_reason: data.rejection_reason, files: data.files }, tk).then(function (d) {
            if (d.success) { show("❌ تم رفض البند"); setModal(null); loadData(); if (proj) fetchProj(proj.id); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
      />
    </ModalWrap>;
  }
  // ── Owner Decision Modal — isolated component ──
  else if (modal && modal.type === "ownerDecision") {
    modalUI = <ModalWrap>
      <OwnerDecisionForm
        modal={modal}
        onApprove={function (data) {
          call("/items/" + modal.itemId + "/owner-decision", "POST", { approved: true, rejection_reason: "", files: data.files }, tk).then(function (d) {
            if (d.success) { show("✅ تمت الموافقة والدفع"); setModal(null); loadData(); if (proj) fetchProj(proj.id); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
        onReject={function (data) {
          call("/items/" + modal.itemId + "/owner-decision", "POST", { approved: false, rejection_reason: data.rejection_reason, files: data.files }, tk).then(function (d) {
            if (d.success) { show("❌ تم رفض البند"); setModal(null); loadData(); if (proj) fetchProj(proj.id); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
      />
    </ModalWrap>;
  }
  // ── View Offers Modal (owner sees quotations + inspector apps for a project) ──
  else if (modal && modal.type === "viewOffers") {
    var lowestQ = offersQuotations.length > 0
      ? offersQuotations.reduce(function(mn, q) { return (q.total_price || q.price || 0) < (mn.total_price || mn.price || 0) ? q : mn; }, offersQuotations[0])
      : null;
    modalUI = <ModalWrap>
      {/* Modal header */}
      <div style={{ background: C.gNavy, borderRadius: 12, padding: "12px 14px", marginBottom: 14, color: "#fff" }}>
        <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 15, fontWeight: 900 }}>{t.compareOffers}</div>
        <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>{modal.projectTitle}</div>
        {!offersLoading && <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {offersQuotations.length > 0 && <span style={{ fontSize: 10, background: "rgba(232,114,12,.25)", color: "#FFB74D", padding: "3px 9px", borderRadius: 8, fontWeight: 700 }}>💰 {offersQuotations.length} {t.contractorOffer}</span>}
          {offersInspApps.length > 0 && <span style={{ fontSize: 10, background: "rgba(14,173,105,.25)", color: "#A5D6A7", padding: "3px 9px", borderRadius: 8, fontWeight: 700 }}>🔍 {offersInspApps.length} {t.inspectorOffer}</span>}
        </div>}
      </div>

      {offersLoading ? <div style={{ textAlign: "center", padding: 36, color: C.t3 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 12 }}>{t.loadingOffers}</div>
      </div> : <div>

        {/* ── Contractor Quotations ── */}
        {offersQuotations.length > 0 && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 3, height: 14, background: C.amber, borderRadius: 2, display: "inline-block" }} />
            {t.contractorOffers} ({offersQuotations.length}) — {t.compareAndChoose}
          </div>
          {offersQuotations.map(function (q) {
            var boq = []; try { boq = JSON.parse(q.breakdown || q.boq_data || "[]"); } catch (e) {}
            var price = Number(q.total_price || q.price || 0);
            var isLowest = lowestQ && q.id === lowestQ.id && offersQuotations.length > 1;
            var isPending = q.status === "pending";
            var isAccepted = q.status === "accepted";
            var boqExpKey = "boq_" + q.id;
            var boqExpanded = exp[boqExpKey];
            // Group BOQ by stage
            var boqStages = {};
            boq.forEach(function(b) {
              var stg = b.stage || (isEn ? "Other" : "أخرى");
              if (!boqStages[stg]) boqStages[stg] = [];
              boqStages[stg].push(b);
            });
            var stageKeys = Object.keys(boqStages);
            return <div key={q.id} style={{ border: "2px solid " + (isAccepted ? C.green : isLowest && isPending ? C.ocean : C.brd), borderRadius: 14, marginBottom: 12, overflow: "hidden", background: isAccepted ? "rgba(14,173,105,.03)" : "#fff", boxShadow: isLowest && isPending ? "0 4px 14px rgba(21,101,192,.12)" : "0 2px 8px rgba(13,27,42,.06)" }}>
              {/* Contractor header */}
              <div style={{ background: isAccepted ? C.gGreen : isLowest && isPending ? C.gBlue : "linear-gradient(135deg,rgba(13,27,42,.04),rgba(13,27,42,.01))", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isAccepted ? "rgba(255,255,255,.2)" : "rgba(232,114,12,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👷</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: isAccepted ? "#fff" : C.t1 }}>{q.contractor_name}</span>
                      {isLowest && isPending && <span style={{ fontSize: 9, background: "rgba(21,101,192,.15)", color: C.ocean, padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>{t.lowestPrice}</span>}
                    </div>
                    <div style={{ fontSize: 10, color: isAccepted ? "rgba(255,255,255,.6)" : C.t3 }}>
                      {q.company_name_ar && <span>{q.company_name_ar} </span>}
                      {q.cr_number && <span style={{ opacity: 0.7 }}>({isEn ? "CR" : "س.ت"}: {q.cr_number}) </span>}
                      {q.rating > 0 && <span>⭐ {q.rating}/5</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 16, color: isAccepted ? "#fff" : C.amber }}>{price.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: isAccepted ? "rgba(255,255,255,.5)" : C.t3 }}>{t.bhdTotal}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "10px 14px" }}>
                {/* Key metrics */}
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {[
                    { ic: "⏱️", v: (q.duration_months || q.durationMonths || 0) + " " + t.monthStr, l: t.duration },
                    { ic: "🛡️", v: (q.warranty_months || q.warrantyMonths || 0) + " " + t.monthStr, l: t.warranty },
                    { ic: "💰", v: price.toLocaleString() + " " + t.bhd, l: t.total, highlight: true }
                  ].map(function(m, i) {
                    return <div key={i} style={{ flex: 1, background: m.highlight ? "rgba(232,114,12,.07)" : "#F4F7FB", borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, marginBottom: 2 }}>{m.ic}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: m.highlight ? C.amber : C.t1 }}>{m.v}</div>
                      <div style={{ fontSize: 8, color: C.t3, marginTop: 1 }}>{m.l}</div>
                    </div>;
                  })}
                </div>

                {/* Submission date */}
                {q.createdAt && <div style={{ fontSize: 9, color: C.t3, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span>📅</span> {isEn ? "Submitted" : "تاريخ التقديم"}: {new Date(q.createdAt).toLocaleDateString("ar-BH", { year: "numeric", month: "long", day: "numeric" })}
                </div>}

                {q.notes && <div style={{ fontSize: 10, color: C.t2, padding: "7px 10px", background: "#F4F7FB", borderRadius: 8, marginBottom: 10, lineHeight: 1.5 }}>💬 {q.notes}</div>}

                {/* BOQ Excel file — visible to owner + submitting contractor only (server-enforced ACL) */}
                {q.has_boq_file && <div onClick={function(){ downloadBoq(q.id, q.boq_file_name); }} style={{ marginBottom: 10, padding: "10px 12px", background: "linear-gradient(135deg,rgba(16,185,129,.08),rgba(16,185,129,.04))", border: "1px solid rgba(16,185,129,.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 22 }}>📗</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.green }}>ملف BOQ مرفق (Excel)</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>{q.boq_file_name || "BOQ.xlsx"}{q.boq_file_size ? " • " + (q.boq_file_size / 1024).toFixed(1) + " KB" : ""}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.green, background: "rgba(16,185,129,.12)", padding: "4px 10px", borderRadius: 8 }}>📥 تحميل</span>
                </div>}

                {/* BOQ items — expandable with stage grouping */}
                {boq.length > 0 && <div style={{ marginBottom: 10 }}>
                  <div onClick={function() { setExp(function(prev) { var n = {}; n[boqExpKey] = !prev[boqExpKey]; return Object.assign({}, prev, n); }); }} style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{boqExpanded ? "▼" : "▶"}</span> {t.boqItemsLabel} ({boq.length} {t.itemLabel})
                    <span style={{ fontSize: 9, color: C.ocean, marginRight: 4 }}>{boqExpanded ? (isEn ? "collapse" : "طي") : (isEn ? "expand all" : "عرض الكل")}</span>
                  </div>
                  <div style={{ border: "1px solid " + C.brd, borderRadius: 8, overflow: "hidden" }}>
                    {!boqExpanded && boq.slice(0, 4).map(function (b, i) {
                      var itemTotal = (b.quantity || 1) * (b.unit_price || b.unitPrice || 0);
                      return <div key={i} style={{ display: "flex", alignItems: "center", padding: "5px 10px", fontSize: 9, borderBottom: i < Math.min(boq.length, 4) - 1 ? "1px solid #EDF1F7" : "none", background: i % 2 === 0 ? "#fff" : "#FAFBFD" }}>
                        <span style={{ flex: 1, color: C.t2 }}>{b.description || b.desc}</span>
                        <span style={{ color: C.t3, marginLeft: 8 }}>×{b.quantity || 1}</span>
                        <span style={{ color: C.amber, fontWeight: 700, marginRight: 0, minWidth: 64, textAlign: "left" }}>{Number(itemTotal).toLocaleString()} {t.bhd}</span>
                      </div>;
                    })}
                    {!boqExpanded && boq.length > 4 && <div onClick={function() { setExp(function(prev) { var n = {}; n[boqExpKey] = true; return Object.assign({}, prev, n); }); }} style={{ padding: "5px 10px", fontSize: 9, color: C.ocean, textAlign: "center", background: "#F8FAFC", cursor: "pointer", fontWeight: 600 }}>📋 {isEn ? "Show all " + boq.length + " items" : "عرض جميع البنود (" + boq.length + " بند)"}</div>}
                    {boqExpanded && stageKeys.map(function(stg, si) {
                      var stageItems = boqStages[stg];
                      var stageTotal = stageItems.reduce(function(sum, b) { return sum + ((b.quantity || 1) * (b.unit_price || b.unitPrice || 0)); }, 0);
                      return <div key={si}>
                        <div style={{ background: "#EDF2FA", padding: "5px 10px", fontSize: 9, fontWeight: 800, color: C.navy, display: "flex", justifyContent: "space-between", borderBottom: "1px solid " + C.brd }}>
                          <span>{stg}</span>
                          <span style={{ color: C.amber }}>{stageTotal.toLocaleString()} {t.bhd}</span>
                        </div>
                        {stageItems.map(function(b, i) {
                          var itemTotal = (b.quantity || 1) * (b.unit_price || b.unitPrice || 0);
                          return <div key={i} style={{ display: "flex", alignItems: "center", padding: "4px 10px", fontSize: 9, borderBottom: "1px solid #EDF1F7", background: i % 2 === 0 ? "#fff" : "#FAFBFD" }}>
                            <span style={{ flex: 1, color: C.t2 }}>{b.description || b.desc}</span>
                            {b.brand && <span style={{ fontSize: 8, color: C.ocean, background: "rgba(21,101,192,.08)", padding: "1px 5px", borderRadius: 4, marginLeft: 4 }}>{b.brand}</span>}
                            <span style={{ color: C.t3, marginLeft: 6, minWidth: 28, textAlign: "center", fontSize: 8 }}>{b.unit || ""}</span>
                            <span style={{ color: C.t3, marginLeft: 4, fontSize: 8 }}>×{b.quantity || 1}</span>
                            <span style={{ color: C.t3, marginLeft: 4, fontSize: 8 }}>@{Number(b.unit_price || b.unitPrice || 0).toLocaleString()}</span>
                            <span style={{ color: C.amber, fontWeight: 700, minWidth: 56, textAlign: "left", marginLeft: 6 }}>{Number(itemTotal).toLocaleString()}</span>
                          </div>;
                        })}
                      </div>;
                    })}
                    {boqExpanded && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.navy, color: "#fff", fontSize: 10, fontWeight: 800 }}>
                      <span>{isEn ? "Grand Total" : "الإجمالي الكلي"}</span>
                      <span>{price.toLocaleString()} {t.bhd}</span>
                    </div>}
                  </div>
                </div>}

                {/* Action button */}
                {isPending && <Btn v="green" sm f onClick={function () {
                  if (window.confirm && !window.confirm(t.confirmAcceptOffer + " " + q.contractor_name + " " + t.byValue + " " + price.toLocaleString() + " " + t.bhd + "?\n" + t.contractSentEmail)) return;
                  acceptQuotation(q.id);
                  setModal(null);
                }}>{t.acceptOfferStart}</Btn>}
                {isAccepted && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "rgba(14,173,105,.08)", borderRadius: 8 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div><div style={{ fontSize: 11, fontWeight: 800, color: C.green }}>{t.offerAccepted}</div><div style={{ fontSize: 9, color: C.t3 }}>{t.contractSentByEmail}</div></div>
                </div>}
                {q.status === "rejected" && <div style={{ padding: "6px 10px", background: "rgba(229,57,53,.07)", borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>✕ مرفوض</span>
                </div>}
              </div>
            </div>;
          })}
        </div>}

        {/* ── Inspector Applications ── */}
        {offersInspApps.length > 0 && <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 3, height: 14, background: C.green, borderRadius: 2, display: "inline-block" }} />
            {t.inspectorAppsTitle} ({offersInspApps.length})
          </div>
          {offersInspApps.map(function (ia) {
            var isAccepted = ia.status === "accepted";
            return <div key={ia.id} style={{ border: "2px solid " + (isAccepted ? C.green : C.brd), borderRadius: 14, marginBottom: 10, overflow: "hidden", background: isAccepted ? "rgba(14,173,105,.03)" : "#fff" }}>
              <div style={{ background: isAccepted ? C.gGreen : "linear-gradient(135deg,rgba(14,173,105,.06),rgba(14,173,105,.02))", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(14,173,105,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔍</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isAccepted ? "#fff" : C.t1 }}>{ia.name_ar}</div>
                    <div style={{ fontSize: 10, color: isAccepted ? "rgba(255,255,255,.6)" : C.t3 }}>
                      {ia.specialty && ia.specialty + " "}
                      {ia.rating > 0 && <span>⭐ {ia.rating}/5</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 15, color: isAccepted ? "#fff" : C.green }}>{Number(ia.fee || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: isAccepted ? "rgba(255,255,255,.5)" : C.t3 }}>د.ب أتعاب</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "10px 14px" }}>
                {ia.notes && <div style={{ fontSize: 10, color: C.t2, padding: "7px 10px", background: "#F4F7FB", borderRadius: 8, marginBottom: 10 }}>💬 {ia.notes}</div>}
                {ia.status === "pending" && <Btn v="green" sm f onClick={function () {
                  if (window.confirm && !window.confirm("هل تؤكد تعيين المفتش " + ia.name_ar + "؟")) return;
                  acceptInspector(ia.id);
                  setModal(null);
                }}>✅ تعيين هذا المفتش لمشروعك</Btn>}
                {isAccepted && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "rgba(14,173,105,.08)", borderRadius: 8 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.green }}>تم تعيين هذا المفتش</div>
                </div>}
                {ia.status === "rejected" && <div style={{ padding: "6px 10px", background: "rgba(229,57,53,.07)", borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>✕ مرفوض</span>
                </div>}
              </div>
            </div>;
          })}
        </div>}

        {/* ── Empty ── */}
        {offersQuotations.length === 0 && offersInspApps.length === 0 && <div style={{ textAlign: "center", padding: 36, color: C.t3 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t2 }}>لا توجد عروض بعد</div>
          <div style={{ fontSize: 10, marginTop: 4 }}>سيتم إشعارك فور تقديم أي عرض من المقاولين أو المفتشين</div>
        </div>}
      </div>}
    </ModalWrap>;
  }

  // ── Rating Modal — isolated component ──
  else if (modal && modal.type === "rate") {
    modalUI = <ModalWrap>
      <RatingForm
        modal={modal}
        onSubmit={function (data) {
          if (data.stars < 1 || data.stars > 5) { show("❌ اختر تقييماً صحيحاً"); return; }
          call("/achievements/" + modal.projectId + "/rate", "POST", {
            rated_user_id: modal.ratedUserId, rated_role: modal.ratedRole,
            rating: data.stars, review_ar: data.review
          }, tk).then(function (d) {
            if (d.success) { show("✅ " + d.message); setModal(null); fetchAchievements(); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
      />
    </ModalWrap>;
  }

  // ── Company Profile Modal (from achievements gallery) ──
  else if (modal && modal.type === "projectFiles") {
    var pf = modal.data;
    modalUI = <ModalWrap>
      <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, marginBottom: 4 }}>📂 جميع ملفات المشروع</div>
      <div style={{ fontSize: 11, color: C.t3, marginBottom: 14 }}>{pf.project_name} — {pf.total_files} ملف</div>

      {pf.stages.map(function (st) {
        if (st.total_files === 0) return null;
        return <div key={st.stage_id} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.ocean, marginBottom: 6, padding: "6px 10px", background: "rgba(26,111,181,.06)", borderRadius: 8 }}>
            {st.stage_name} {st.stage_name_en && <span style={{ fontSize: 9, color: C.t3 }}>({st.stage_name_en})</span>} — {st.total_files} ملف
          </div>

          {/* Stage-level files */}
          {st.stage_files.length > 0 && <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 4, paddingRight: 8 }}>📁 ملفات المرحلة</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingRight: 8 }}>
              {st.stage_files.map(function (f) {
                var fullUrl = f.file_path && f.file_path.startsWith("http") ? f.file_path : (BASE.replace("/api", "/") + f.file_path);
                return <div key={f.id} onClick={function () { if (f.file_path) window.open(fullUrl, "_blank"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#F4F7FB", borderRadius: 8, cursor: f.file_path ? "pointer" : "default", border: "1px solid " + C.brd }}>
                  <span style={{ fontSize: 14 }}>{f.file_type === "image" ? "🖼️" : f.file_type === "video" ? "🎥" : "📄"}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.t1, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
                    <div style={{ fontSize: 8, color: C.t3 }}>{f.role === "contractor" ? "👷 مقاول" : f.role === "inspector" ? "🔍 مفتش" : "👤 مالك"} • {(f.uploaded_at || "").substring(0, 10)}</div>
                  </div>
                </div>;
              })}
            </div>
          </div>}

          {/* Item-level files */}
          {st.item_files.length > 0 && <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, marginBottom: 4, paddingRight: 8 }}>📎 ملفات البنود</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingRight: 8 }}>
              {st.item_files.map(function (f) {
                var fullUrl = f.file_path && f.file_path.startsWith("http") ? f.file_path : (BASE.replace("/api", "/") + f.file_path);
                return <div key={f.id} onClick={function () { if (f.file_path) window.open(fullUrl, "_blank"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#FFFBF5", borderRadius: 8, cursor: f.file_path ? "pointer" : "default", border: "1px solid rgba(232,114,12,.2)" }}>
                  <span style={{ fontSize: 14 }}>{f.file_type === "image" ? "🖼️" : f.file_type === "video" ? "🎥" : "📄"}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.t1, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
                    <div style={{ fontSize: 8, color: C.t3 }}>{f.item_name} • {f.role === "contractor" ? "👷" : f.role === "inspector" ? "🔍" : "👤"} • {(f.uploaded_at || "").substring(0, 10)}</div>
                  </div>
                </div>;
              })}
            </div>
          </div>}
        </div>;
      })}

      {pf.total_files === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: C.t3, fontSize: 12 }}>
        لا توجد ملفات مرفوعة في هذا المشروع بعد
      </div>}
    </ModalWrap>;
  }

  else if (modal && modal.type === "companyProfile") {
    var co = modal.company;
    var coAvgRating = co.ratings.length > 0
      ? (co.ratings.reduce(function(s, r) { return s + r; }, 0) / co.ratings.length).toFixed(1)
      : "—";
    modalUI = <ModalWrap>
      {/* Company header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid " + C.brd }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: C.gNavy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🏢</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontSize: 16, fontWeight: 900, color: C.t1 }}>{co.company}</div>
          <div style={{ fontSize: 11, color: C.t3 }}>👷 {co.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <StarRating value={parseFloat(coAvgRating) || 0} size={14} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>{coAvgRating}/5</span>
            <span style={{ fontSize: 10, color: C.t3 }}>({co.projects.length} مشروع)</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { ic: "🏗️", v: co.projects.length, l: "مشروع منجز", c: C.ocean },
          { ic: "💰", v: Number(co.totalBudget).toLocaleString(), l: "د.ب إجمالي", c: C.amber },
          { ic: "⭐", v: coAvgRating, l: "متوسط التقييم", c: C.green }
        ].map(function(s, i) {
          return <div key={i} style={{ background: "linear-gradient(145deg,#F4F7FC,#EEF3FA)", borderRadius: 10, padding: "10px 6px", textAlign: "center", border: "1px solid " + C.brd }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{s.ic}</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontSize: i === 1 ? 10 : 16, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 8, color: C.t3 }}>{s.l}</div>
          </div>;
        })}
      </div>

      {/* All projects */}
      <div style={{ fontSize: 12, fontWeight: 800, color: C.t1, marginBottom: 10 }}>📂 جميع المشاريع المنجزة</div>
      {co.projects.map(function(p) {
        var myContractorRating = (p.ratings || []).find(function(r) { return r.rater_id === user.id && r.rated_role === "contractor"; });
        return <div key={p.id} style={{ border: "1.5px solid " + C.brd, borderRadius: 12, padding: "12px 14px", marginBottom: 10, background: "linear-gradient(145deg,#fff,#F8FAFD)" }}>
          {/* Project title */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{typeIcon(p.type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.t1 }}>{p.title_ar}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                <Badge c="blue">{typeLabel(p.type)}</Badge>
                <Badge c="green">{t.completedBadgeLabel}</Badge>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: "8px 10px", background: "#F4F7FB", borderRadius: 8, marginBottom: 10 }}>
            {p.location_ar && <div style={{ fontSize: 10, color: C.t2 }}>📍 {p.location_ar}</div>}
            {p.area_sqm > 0 && <div style={{ fontSize: 10, color: C.t2 }}>📐 {p.area_sqm}م²</div>}
            {p.floors > 0 && <div style={{ fontSize: 10, color: C.t2 }}>🏢 {p.floors} أدوار</div>}
            {p.total_budget > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: C.amber }}>💰 {Number(p.total_budget).toLocaleString()} د.ب</div>}
            {p.completed_at && <div style={{ fontSize: 10, color: C.green }}>✅ {(p.completed_at || "").substring(0, 10)}</div>}
            {p.contractor_avg_rating > 0 && <div style={{ fontSize: 10, color: C.t2, display: "flex", alignItems: "center", gap: 3 }}><StarRating value={p.contractor_avg_rating} size={10} /> {p.contractor_avg_rating}/5</div>}
          </div>

          {/* Reviews */}
          {(p.ratings || []).filter(function(r){ return r.review_ar; }).length > 0 &&
            <div style={{ padding: "6px 8px", background: "rgba(212,160,23,.05)", borderRadius: 8, borderRight: "3px solid " + C.gold, marginBottom: 8 }}>
              {(p.ratings || []).filter(function(r){ return r.review_ar; }).map(function(r, i) {
                return <div key={i} style={{ fontSize: 10, color: C.t2, marginBottom: i > 0 ? 4 : 0 }}>
                  <span style={{ fontWeight: 700 }}>{r.rater_name}: </span>{r.review_ar}
                </div>;
              })}
            </div>}

          {/* Rating button for project owner */}
          {role === "owner" && user.id === p.owner_id && p.contractor_id && (
            myContractorRating
              ? <div style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓ قيّمت هذا المقاول</div>
              : <Btn v="gold" sm onClick={function() {
                  setModal({ type: "rate", projectId: p.id, projectTitle: p.title_ar,
                    ratedUserId: p.contractor_id, ratedRole: "contractor", ratedName: co.name });
                }}>⭐ تقييم المقاول</Btn>
          )}
        </div>;
      })}
    </ModalWrap>;
  }

  // ── Edit Profile Modal ──
  else if (modal === "editProfile") {
    modalUI = <ModalWrap>
      <EditProfileForm
        user={user}
        onSubmit={function(data) {
          call("/auth/profile", "PUT", data, tk).then(function(d) {
            if (d.success) {
              // Update local user object with new data
              var updated = Object.assign({}, user, data);
              updated.name_ar = data.nameAr || user.name_ar;
              updated.company_name_ar = data.companyNameAr || user.company_name_ar;
              setUser(updated);
              show("✅ تم تحديث الملف الشخصي");
              setModal(null);
            } else show("❌ " + (d.error || "خطأ"));
          });
        }}
        onClose={function(){ setModal(null); }}
      />
    </ModalWrap>;
  }

  // ── Change Password Modal ──
  else if (modal === "changePassword") {
    modalUI = <ModalWrap>
      <ChangePasswordForm
        onSubmit={function(data) {
          call("/auth/change-password", "POST", data, tk).then(function(d) {
            if (d.success) { show("✅ " + d.message); setModal(null); }
            else show("❌ " + (d.error || "خطأ"));
          });
        }}
        onClose={function(){ setModal(null); }}
      />
    </ModalWrap>;
  }

  // ═══════ MAIN LAYOUT ═══════
  return (
    <div style={{ fontFamily: "Tajawal, sans-serif", background: "linear-gradient(180deg,#0A1628 0%,#0F1D32 30%,#131F33 60%,#0F172A 100%)", minHeight: "100vh", direction: isEn ? "ltr" : "rtl", paddingBottom: 0, WebkitOverflowScrolling: "touch", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{
        background: C.gNavy,
        padding: "0 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        height: 54,
        boxShadow: "0 4px 16px rgba(13,27,42,.35)"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#1565C0,#42A5F5)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(21,101,192,.5)" }}><WhaleLogo size={28} /></div>
          <div>
            <span style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 14, color: "#fff", letterSpacing: 1 }}>FIRST </span>
            <span style={{ fontFamily: "Cairo, sans-serif", fontWeight: 900, fontSize: 14, color: C.amber, letterSpacing: 1 }}>TOUCH</span>
          </div>
        </div>
        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {notifs.filter(function(n){return !n.is_read;}).length > 0 &&
            <div style={{ background: C.red, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 10, boxShadow: "0 2px 6px rgba(229,57,53,.5)" }}>
              🔔 {notifs.filter(function(n){return !n.is_read;}).length}
            </div>}
          <div onClick={function(){ setShowRoleSwitcher(!showRoleSwitcher); }} style={{ background: roleOverride ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.12)", border: roleOverride ? "1px solid rgba(245,158,11,.4)" : "1px solid rgba(255,255,255,.2)", padding: "4px 10px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", position: "relative" }}>
            {roleOverride && <Eye size={10} color={C.amber} />}
            <span style={{ fontSize: 10, fontWeight: 700, color: role === "owner" ? C.sky : role === "contractor" ? C.amber : role === "developer" ? "#A855F7" : C.green, display: "flex", alignItems: "center", gap: 3 }}>{ri} {rt}</span>
            <Repeat2 size={10} color={roleOverride ? C.amber : C.t3} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 14, paddingBottom: 100, maxWidth: 600, margin: "0 auto" }}>{pg}</div>

      {/* Bottom navigation — frosted glass bar */}
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 25 }} style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(10,22,40,.92)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,.06)",
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 calc(14px + env(safe-area-inset-bottom, 0px))", zIndex: 50,
        boxShadow: "0 -8px 32px rgba(0,0,0,.25)"
      }}>
        {nav.map(function (n) {
          var isActive = page === n.id;
          var activeColor = role === "owner" ? C.sky : role === "contractor" ? C.amber : C.green;
          return <motion.div key={n.id} whileTap={n.soon ? {} : { scale: 0.88 }} onClick={function () { if (n.soon) { show(t.comingSoonToast); return; } setPage(n.id); if (n.id === "home") loadData(); if (n.id === "achievements") fetchAchievements(); if (n.id === "tenders") loadData(); if (n.id === "offers") loadData(); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: n.soon ? "default" : "pointer", position: "relative", minWidth: 50, opacity: n.soon ? 0.35 : 1 }}>
            <motion.div animate={isActive && !n.soon ? { scale: 1.1 } : { scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} style={{
              fontSize: 19, width: 40, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 12,
              background: isActive && !n.soon ? activeColor + "22" : "transparent",
              position: "relative"
            }}>
              {n.ic}
              {n.badge && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", top: -3, right: -3, background: C.red, color: "#fff", fontSize: 8, fontWeight: 800, padding: "1px 4px", borderRadius: 6, minWidth: 14, textAlign: "center", boxShadow: "0 2px 6px rgba(239,68,68,.5)" }}>{n.badge}</motion.span>}
              {n.soon && <span style={{ position: "absolute", top: -6, right: -10, background: C.gold, color: "#fff", fontSize: 7, fontWeight: 800, padding: "1px 4px", borderRadius: 4 }}>{t.comingSoon}</span>}
            </motion.div>
            <span style={{ fontSize: 9, fontWeight: isActive && !n.soon ? 800 : 500, color: isActive && !n.soon ? activeColor : "rgba(255,255,255,.4)", transition: "all .2s" }}>{n.lb}</span>
            {isActive && !n.soon && <motion.div layoutId="navIndicator" style={{ position: "absolute", top: -1, width: 22, height: 2.5, background: activeColor, borderRadius: 2 }} />}
          </motion.div>;
        })}
      </motion.div>

      {/* ═══════ ROLE SWITCHER — Dropdown from Header ═══════ */}
      <AnimatePresence>
        {showRoleSwitcher && user && <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={function(){ setShowRoleSwitcher(false); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100 }}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed", top: 58, left: 14, right: 14,
              background: "rgba(15,23,42,.97)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(96,165,250,.2)",
              borderRadius: 16, padding: 14, zIndex: 101,
              boxShadow: "0 12px 40px rgba(0,0,0,.5)",
              maxWidth: 400, margin: isEn ? "0 0 0 auto" : "0 auto 0 0"
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 10, textAlign: "center", letterSpacing: 1 }}>
              {isEn ? "Switch Role — Preview Mode" : "تبديل الدور — وضع المعاينة"}
            </div>

            {[
              { id: "owner", label: "مالك المشروع", labelEn: "Owner", icon: <User size={18} />, color: C.ocean },
              { id: "contractor", label: "مقاول", labelEn: "Contractor", icon: <HardHat size={18} />, color: C.amber },
              { id: "inspector", label: "مفتش", labelEn: "Inspector", icon: <Search size={18} />, color: C.green },
              { id: "developer", label: "مطور عقاري", labelEn: "Developer", icon: <Building2 size={18} />, color: "#7B1FA2" }
            ].map(function(r) {
              var isActive = role === r.id;
              var isReal = realRole === r.id;
              return <motion.div
                key={r.id}
                whileTap={{ scale: 0.96 }}
                onClick={function(){
                  if (isReal) { setRoleOverride(null); }
                  else { setRoleOverride(r.id); }
                  setPage("home");
                  setShowRoleSwitcher(false);
                  loadData(tk, r.id);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12, marginBottom: 6,
                  cursor: "pointer",
                  background: isActive ? r.color + "22" : "rgba(255,255,255,.03)",
                  border: isActive ? "1.5px solid " + r.color + "55" : "1.5px solid transparent",
                  transition: "all .2s"
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isActive ? r.color : "rgba(255,255,255,.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isActive ? "#fff" : C.t3,
                  transition: "all .2s"
                }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 800 : 500, color: isActive ? r.color : C.t1, transition: "all .2s" }}>
                    {isEn ? r.labelEn : r.label}
                  </div>
                  {isReal && <div style={{ fontSize: 9, color: C.t3, fontWeight: 600 }}>{isEn ? "Your account" : "حسابك الأصلي"}</div>}
                </div>
                {isActive && <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, boxShadow: "0 0 10px " + r.color }} />}
              </motion.div>;
            })}

            {roleOverride && <motion.div
              whileTap={{ scale: 0.96 }}
              onClick={function(){ setRoleOverride(null); setPage("home"); setShowRoleSwitcher(false); loadData(tk, realRole); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 14px", borderRadius: 12, marginTop: 6,
                cursor: "pointer",
                background: "rgba(239,68,68,.12)",
                border: "1.5px solid rgba(239,68,68,.3)",
                color: "#EF4444", fontSize: 12, fontWeight: 700
              }}
            >
              <X size={14} />
              {isEn ? "Back to my role" : "العودة لدوري"}
            </motion.div>}
          </motion.div>
        </>}
      </AnimatePresence>

      {/* Modals */}
      {modalUI}

      {/* Toast — animated */}
      <AnimatePresence>
        {toast !== null && <motion.div initial={{ opacity: 0, y: 20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }} transition={{ type: "spring", stiffness: 400, damping: 25 }} style={{ position: "fixed", bottom: 80, left: "50%", background: toast.indexOf("❌") >= 0 ? "linear-gradient(135deg,#DC2626,#EF4444)" : "linear-gradient(135deg,#059669,#10B981)", color: "#fff", padding: "12px 22px", borderRadius: 14, fontWeight: 700, fontSize: 12, zIndex: 400, boxShadow: "0 8px 30px rgba(0,0,0,.2)", maxWidth: "90vw", textAlign: "center", backdropFilter: "blur(8px)" }}>{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
