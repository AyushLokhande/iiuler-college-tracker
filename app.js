/* =========================================================
   SUPABASE CLOUD SYNC
   ========================================================= */

const SUPABASE_URL = "https://fbppupqcndsrmkedvypj.supabase.co";
const SUPABASE_KEY = "sb_publishable_18cWVacawL1xbgirE-llAQ_zzz27Fqu";

const cloud = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cloudReady = false;
let applyingCloudChange = false;

async function cloudWrite(key, value) {
  if (!cloudReady || applyingCloudChange) return;
  const { error } = await cloud
    .from("shared_app_data")
    .upsert({ data_key: key, value: value, updated_at: new Date().toISOString() });
  if (error) {
    console.error("Cloud save failed:", key, error);
    alert("Cloud sync failed. Check your connection and sign-in.");
  }
}

async function loadCloudData() {
  const { data, error } = await cloud.from("shared_app_data").select("data_key, value");
  if (error) throw error;

  const remote = Object.fromEntries((data || []).map(row => [row.data_key, row.value]));

  state = remote.attendance || JSON.parse(localStorage.getItem("iiuler_attendance_v2") || '{"attendanceRecords":{}}');
  timetableOverride = remote.timetable || JSON.parse(localStorage.getItem("iiuler_timetable_override_v1") || "null");

  // Merge default holidays with remote cloud holidays so new holidays from code always reflect
  HOLIDAYS = { ...HOLIDAYS, ...(remote.holidays || {}) };
  await cloudWrite("holidays", HOLIDAYS);

  savedMessMenu = remote.mess || JSON.parse(localStorage.getItem("iiuler_mess_menu_v1") || "null");

  if (!remote.attendance) await cloudWrite("attendance", state);
  if (!remote.timetable) await cloudWrite("timetable", timetableOverride);
  if (!remote.mess) await cloudWrite("mess", savedMessMenu);

  localStorage.setItem("iiuler_attendance_v2", JSON.stringify(state));
  localStorage.setItem("iiuler_timetable_override_v1", JSON.stringify(timetableOverride));
  localStorage.setItem("iiuler_mess_menu_v1", JSON.stringify(savedMessMenu));

  cloudReady = true;

  renderAttendance();
  renderCalendar();
  renderMess();
}

function applyRemoteChange(row) {
  if (!row) return;
  applyingCloudChange = true;
  try {
    const map = {
      attendance: () => { state = row.value; localStorage.setItem("iiuler_attendance_v2", JSON.stringify(state)); },
      timetable: () => { timetableOverride = row.value; localStorage.setItem("iiuler_timetable_override_v1", JSON.stringify(timetableOverride)); },
      holidays: () => { HOLIDAYS = row.value; },
      mess: () => { savedMessMenu = row.value; localStorage.setItem("iiuler_mess_menu_v1", JSON.stringify(savedMessMenu)); }
    };
    if (map[row.data_key]) map[row.data_key]();
    renderAttendance();
    renderCalendar();
    renderMess();
  } finally {
    applyingCloudChange = false;
  }
}

function startCloudRealtime() {
  cloud.channel("iiuler-shared-data")
    .on("postgres_changes", { event: "*", schema: "public", table: "shared_app_data" }, payload => {
      if (payload.new) applyRemoteChange(payload.new);
    })
    .subscribe();
}

async function startCloudApp() {
  const login = document.getElementById("cloudLogin");
  const app = document.querySelector(".app");
  const status = document.getElementById("cloudLoginStatus");

  document.getElementById("cloudLoginForm").addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "Signing in…";
    const email = document.getElementById("cloudEmail").value.trim();
    const password = document.getElementById("cloudPassword").value;

    const { error } = await cloud.auth.signInWithPassword({ email, password });
    if (error) { status.textContent = error.message; return; }

    try {
      await loadCloudData();
      startCloudRealtime();
      login.style.display = "none";
      app.style.display = "";
    } catch (err) {
      console.error(err);
      status.textContent = "Signed in, but cloud data could not load.";
      await cloud.auth.signOut();
    }
  });

  const { data: { session } } = await cloud.auth.getSession();
  if (session) {
    try {
      await loadCloudData();
      startCloudRealtime();
      login.style.display = "none";
      app.style.display = "";
    } catch (err) {
      status.textContent = "Could not load cloud data. Please sign in again.";
    }
  }
}

/* =========================================================
   ATTENDANCE & BASELINE CONFIG (Official Sheet: 06.11.2026)
   ========================================================= */

const OFFICIAL_BASELINE = {
  "Legal Methods": { attended: 16, total: 23 },
  "Economics I": { attended: 23, total: 35 },
  "Law of Torts": { attended: 22, total: 33 },
  "English I": { attended: 31, total: 45 },
  "Principles of Management": { attended: 25, total: 38 },
  "Marketing Management": { attended: 21, total: 29 }
};

const SUBJECTS = OFFICIAL_BASELINE;
const ATTENDANCE_START = "2026-11-01";
const ATTENDANCE_CUTOFF = "2026-11-25";

let HOLIDAYS = {
  "2026-08-15": "Independence Day",
  "2026-08-25": "Id-e-Milad",
  "2026-09-04": "Janmashtami",
  "2026-09-14": "Ganesh Chaturthi",
  "2026-09-15": "Ganesh Chaturthi",
  "2026-10-02": "Gandhi Jayanti",
  "2026-10-20": "Dussehra",
  "2026-10-21": "Dussehra",
  "2026-11-06": "Diwali",
  "2026-11-07": "Diwali",
  "2026-11-08": "Diwali",
  "2026-11-09": "Diwali",
  "2026-12-03": "St Francis Xavier's Feast",
  "2026-12-19": "Goa Liberation Day",
  "2026-12-25": "Christmas"
};

const TIMETABLE = {
  1: [["09:55", "10:45", "Law of Torts"], ["10:50", "11:40", "Principles of Management"], ["12:00", "12:50", "Principles of Management"], ["12:55", "13:35", "English I"], ["14:30", "15:20", "Marketing Management"], ["15:25", "16:15", "Legal Methods"]],
  2: [["09:55", "10:45", "Legal Methods"], ["10:50", "11:40", "Law of Torts"], ["12:00", "12:50", "Economics I"], ["12:55", "13:35", "English I"], ["14:30", "15:20", "Marketing Management"], ["15:25", "16:15", "Marketing Management"]],
  3: [["09:55", "10:45", "Legal Methods"], ["10:50", "11:40", "Marketing Management"], ["12:00", "12:50", "Economics I"], ["12:55", "13:35", "Principles of Management"], ["14:30", "15:20", "Law of Torts"], ["15:25", "16:15", "Law of Torts"]],
  4: [["09:55", "10:45", "Economics I"], ["10:50", "11:40", "English I"], ["12:00", "12:50", "English I"], ["12:55", "13:35", "Economics I"], ["14:30", "15:20", "Principles of Management"], ["15:25", "16:15", "Principles of Management"]],
  5: [["09:55", "10:45", "Economics I"], ["10:50", "11:40", "Legal Methods"], ["12:00", "12:50", "English I"], ["12:55", "13:35", "Marketing Management"], ["14:30", "15:20", "Legal Methods"], ["15:25", "16:15", "Law of Torts"]]
};

const OCTOBER_MENU = {
  monday: { breakfast: ["Aloo Pyaz Paratha", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Veg Korma", "Black Chana Masala", "Dal Amritsari", "Plain Rice", "Chapati", "Rasam", "Fryums", "Green Salad", "Plain Curd", "Gulab Jamun"], snacks: ["Spicy Bhelpuri", "Tea & Coffee"], dinner: ["Paneer Butter Masala", "Veg Kolhapuri", "Dal Fry", "Plain Rice", "Chapati", "Toss Salad", "Boondi Raita", "Punjabi Egg Curry"] },
  tuesday: { breakfast: ["Medu Vada", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Punjabi Rajma", "Tawa Mix Veg Dry", "Dal Kolhapuri", "Plain Rice", "Chapati", "Sambhar", "Roasted Papad", "Masala Chopped Salad", "Fruit Custard"], snacks: ["Sabudana Tikki", "Tea & Coffee"], dinner: ["Dahi Kachori + Chutney", "Veg Makhawala", "Dahi Curry", "Plain Rice", "Chapati", "Macaroni Salad", "Plain Curd"] },
  wednesday: { breakfast: ["Onion Poha", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Soya Chilli", "Beans Dry", "Dal Makhni", "Jeera Rice", "Chapati", "Rasam", "Carrot Beetroot Salad", "Rasmalai"], snacks: ["Bread Pakoda", "Tea & Coffee"], dinner: ["Paneer Biryani", "Gobhi Masala", "Dal Kolhapuri", "Plain Rice", "Chapati", "Mix Salad + Fried Papad", "Veg Raita", "Chicken Biryani"] },
  thursday: { breakfast: ["Moong Dal Chilla", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Chhole Amritsari", "Aloo Methi", "Dal Tadka", "Plain Rice", "Puri + Chapati", "Sambhar", "Fried Papad", "Toss Salad", "Shrikhand"], snacks: ["Dabeli", "Tea & Coffee"], dinner: ["Mushroom Masala", "Mix Veg", "Dal Makhani", "Jeera Rice", "Chapati", "Plain Curd"] },
  friday: { breakfast: ["Misal Pav", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Veg Kofta Gravy", "Jeera Aloo", "Masoor Dal", "Plain Rice", "Chapati", "Rasam", "Roasted Papad", "Dhokla + Chutney", "Plain Curd", "Boondi"], snacks: ["Maggi", "Tea & Coffee"], dinner: ["Paneer Lazeez", "Aloo Baingan", "Dal Tadka", "Jeera Rice", "Chapati + Paratha", "Sirka Onion", "Boondi Raita", "Chicken Patiala / Egg Kolhapuri"] },
  saturday: { breakfast: ["Masala Idli", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Dum Aloo Gravy", "Veg Jalfrezi", "Dal Punjabi", "Plain Rice", "Chapati", "Sambhar", "Fried Papad", "Sprout Moong Salad", "Shahi Tukda"], snacks: ["Vada Pav", "Tea & Coffee"], dinner: ["Rajma Masala", "Soya Kheema", "Dal Kolhapuri", "Plain Rice", "Chapati", "Toss Salad", "Plain Curd"] },
  sunday: { breakfast: ["Podi Masala Dosa", "Omelette or Boiled Egg", "Bread + Butter + Jam", "Bournvita", "Milk", "Tea & Coffee", "Cornflakes"], lunch: ["Pyaaz Paratha", "Thecha + Lehsun Chutney", "Soya Biryani", "Kokam Rasam", "Roasted Papad", "Dahi Vada", "Veg Raita"], snacks: ["French Fries", "Tea & Coffee"], dinner: ["Amritsari Chhole", "Bhature / Stuffed Kulcha", "Masala Khichadi", "Chapati", "Onion Salad"] }
};

/* =========================
   STATE & INITIAL RECORDS
   ========================= */

const STORAGE_KEY = "iiuler_attendance_v2";

let state = {
  attendanceRecords: {
    "2026-11-02": { "Law of Torts": "present", "Principles of Management": "present", "English I": "present", "Marketing Management": "present", "Legal Methods": "present" },
    "2026-11-03": { "Legal Methods": "present", "Law of Torts": "present", "Economics I": "present", "English I": "present", "Marketing Management": "present" },
    "2026-11-04": { "Legal Methods": "present", "Marketing Management": "absent", "Economics I": "present", "Principles of Management": "present", "Law of Torts": "present" },
    "2026-11-05": { "Economics I": "present", "English I": "present", "Marketing Management": "present", "Legal Methods": "present", "Law of Torts": "present" }
  }
};

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) state = JSON.parse(saved);
  if (!state.attendanceRecords) state.attendanceRecords = {};
} catch (e) {
  state = { attendanceRecords: {} };
}

/* =========================
   HELPERS
   ========================= */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function parseDate(key) { return new Date(key + "T12:00:00"); }

function formatDisplayDate(key) {
  return parseDate(key).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function prettySubject(s) {
  return s === "Economics I" ? "Economics" : s === "English I" ? "English" : s;
}

function percentage(a, t) { return t > 0 ? (a / t) * 100 : 0; }

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cloudWrite("attendance", state);
}

function getBaseline() {
  return state.customBaseline || OFFICIAL_BASELINE;
}

/* =========================
   TIMETABLE HELPERS
   ========================= */

const TIMETABLE_STORAGE_KEY = "iiuler_timetable_override_v1";
let timetableOverride = null;

try {
  timetableOverride = JSON.parse(localStorage.getItem(TIMETABLE_STORAGE_KEY) || "null");
} catch (e) { timetableOverride = null; }

function getActiveTimetable() {
  return timetableOverride && typeof timetableOverride === "object" ? timetableOverride : TIMETABLE;
}

function getClassesForDate(date) {
  const key = dateKey(date);
  const day = date.getDay();
  if (day === 0 || day === 6 || HOLIDAYS[key] || key < "2026-09-28") return [];
  return getActiveTimetable()[day] || [];
}

/* =========================
   TIMETABLE MANAGER
   ========================= */

function openTimetableManager() {
  document.getElementById("modal").innerHTML = `
    <div class="timetable-overlay" onclick="if(event.target===this)closeTimetableManager()">
      <div class="timetable-modal" onclick="event.stopPropagation()">
        <div class="timetable-modal-head">
          <div><div class="attendance-greeting-small">SCHEDULE SETTINGS</div><h2>Update timetable</h2></div>
          <button class="close-button" onclick="closeTimetableManager()">✕</button>
        </div>
        <p class="timetable-note">Upload a clear photo of the timetable. Save it when you're done.</p>
        <label class="upload-timetable-button">📷 Upload timetable image
          <input id="timetableImageInput" type="file" accept="image/*" onchange="previewTimetableImage(event)">
        </label>
        <div id="timetableImagePreview" style="margin-top:16px"></div>
        <button class="save-attendance-button timetable-save" onclick="saveTimetableImage()">Save changes</button>
      </div>
    </div>`;
}

function previewTimetableImage(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const preview = document.getElementById("timetableImagePreview");
    if (preview) preview.innerHTML = `<img src="${reader.result}" alt="Preview" style="width:100%;max-height:400px;object-fit:contain;border-radius:12px;background:#080a0f">`;
  };
  reader.readAsDataURL(file);
}

async function saveTimetableImage() {
  const input = document.getElementById("timetableImageInput");
  const file = input?.files?.[0];
  if (!file) { alert("Please upload a timetable image first."); return; }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      localStorage.setItem("iiuler_timetable_image_v1", reader.result);
      closeTimetableManager();
      alert("Timetable image saved!");
    } catch (e) { alert("Image is too large to save."); }
  };
  reader.readAsDataURL(file);
}

function closeTimetableManager() { document.getElementById("modal").innerHTML = ""; }

/* =========================
   ACTUAL ATTENDANCE
   ========================= */

function getActualAttendance() {
  const result = {};
  const baseline = getBaseline();

  for (const subject in baseline) {
    result[subject] = { attended: baseline[subject].attended, total: baseline[subject].total };
  }

  for (const key in state.attendanceRecords) {
    if (key < ATTENDANCE_START || key > ATTENDANCE_CUTOFF) continue;
    const records = state.attendanceRecords[key] || {};

    if (Array.isArray(records)) {
      for (const record of records) {
        if (!result[record.subject]) continue;
        if (record.status === "present" || record.status === "absent") result[record.subject].total++;
        if (record.status === "present") result[record.subject].attended++;
      }
    } else {
      for (const subject in records) {
        if (!result[subject]) continue;
        const status = records[subject];
        if (status === "present" || status === "absent") result[subject].total++;
        if (status === "present") result[subject].attended++;
      }
    }
  }

  return result;
}

function hasAttendanceRecord(key) {
  const records = state.attendanceRecords[key];
  if (!records) return false;
  if (Array.isArray(records)) return records.some(r => r.status === "present" || r.status === "absent");
  return Object.values(records).some(s => s === "present" || s === "absent");
}

/* =========================
   PREDICTION & MATH
   ========================= */

function getFutureClasses() {
  const days = [];
  const todayKey = dateKey(new Date());
  
  // Filter out days before today
  let startDateKey = ATTENDANCE_START > todayKey ? ATTENDANCE_START : todayKey;
  let date = parseDate(startDateKey);
  const cutoff = parseDate(ATTENDANCE_CUTOFF);

  while (date <= cutoff) {
    const key = dateKey(date);
    const classes = getClassesForDate(date);
    if (classes.length) days.push({ key, date: new Date(date), classes });
    date.setDate(date.getDate() + 1);
  }

  return days;
}

function getPrediction(dayChoices = {}) {
  const actual = getActualAttendance();
  const result = {};
  for (const s in actual) result[s] = { attended: actual[s].attended, total: actual[s].total };

  for (const item of getFutureClasses()) {
    const key = item.key;
    if (hasAttendanceRecord(key)) continue;
    const choice = dayChoices[key] || "attending";
    if (choice === "ignored") continue;

    for (const lesson of item.classes) {
      const subject = lesson[2];
      result[subject].total++;
      if (choice === "attending") result[subject].attended++;
    }
  }

  return result;
}

function calculateCanMiss(attended, total, remaining) {
  let maxMiss = 0;
  for (let missed = 0; missed <= remaining; missed++) {
    if (percentage(attended + (remaining - missed), total + remaining) >= 75) maxMiss = missed;
  }
  return maxMiss;
}

function calculateMustAttend(attended, total, remaining) {
  let mustAttend = 0;
  while (mustAttend <= remaining && percentage(attended + mustAttend, total + remaining) < 75) mustAttend++;
  return percentage(attended + mustAttend, total + remaining) < 75 ? null : mustAttend;
}

function countRemainingSubjectClasses(subject, choices) {
  let count = 0;
  for (const item of getFutureClasses()) {
    if (hasAttendanceRecord(item.key)) continue;
    const choice = choices[item.key] || "attending";
    if (choice === "ignored") continue;
    for (const lesson of item.classes) if (lesson[2] === subject) count++;
  }
  return count;
}

/* =========================
   ADMIN MODE
   ========================= */

const ADMIN_PIN = "1909";
let adminMode = false;

function enableAdminMode() {
  if (prompt("Admin PIN:") === ADMIN_PIN) {
    adminMode = true;
    renderAttendance();
    alert("Admin mode enabled.");
  } else {
    alert("Incorrect PIN.");
  }
}

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    e.preventDefault();
    enableAdminMode();
  }
});

/* =========================
   ATTENDANCE PAGE
   ========================= */

function renderAttendance() {
  const page = document.getElementById("attendancePage");
  if (!page) return;

  const data = getActualAttendance();
  let attended = 0, total = 0;
  for (const s in data) { attended += data[s].attended; total += data[s].total; }

  const overall = percentage(attended, total);
  const today = new Date();
  const todayKey = dateKey(today);

  let todayClasses = (todayKey >= ATTENDANCE_START && todayKey <= ATTENDANCE_CUTOFF) ? getClassesForDate(today) : [];
  const todayRecords = state.attendanceRecords[todayKey] || {};
  let markedToday = 0;

  todayClasses.forEach(lesson => {
    const subject = lesson[2];
    const status = Array.isArray(todayRecords)
      ? (todayRecords.find(i => i.subject === subject)?.status || "")
      : (todayRecords[subject] || "");
    if (status === "present" || status === "absent") markedToday++;
  });

  let html = `
    <div class="attendance-greeting">
      <div class="attendance-greeting-title">Hey, Avni Parmar 👋</div>
      <div class="attendance-greeting-subtitle">Here's your attendance overview</div>
    </div>
    <div class="card overall-card">
      <div class="overall-title">Overall Attendance</div>
      <div class="overall-number">${overall.toFixed(2)}%</div>
      <div class="progress"><div class="progress-fill" style="width:${Math.min(overall, 100)}%"></div></div>
      <div class="subject-info"><span>${attended} attended / ${total} total</span></div>
    </div>`;

  if (todayClasses.length > 0) {
    html += `
      <button class="today-attendance-card" onclick="openAttendanceModal('${todayKey}')">
        <div class="today-attendance-left">
          <div class="today-attendance-label">TODAY'S ATTENDANCE</div>
          <div class="today-attendance-title">Mark today's classes</div>
          <div class="today-attendance-meta">${todayClasses.length} classes · ${markedToday}/${todayClasses.length} marked</div>
        </div>
        <div class="today-attendance-arrow">→</div>
      </button>`;
  }

  html += `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <button class="predictor-button" style="margin-bottom:0" onclick="openPredictor()">📊 Predictor</button>
      <button class="secondary-button" style="min-height:46px;margin-top:0" onclick="openBaselineManager()">✏️ Edit Attendance</button>
    </div>`;

  for (const subject in data) {
    const a = data[subject].attended;
    const t = data[subject].total;
    const p = percentage(a, t);
    const cls = p >= 75 ? "good" : p >= 70 ? "warning" : "danger";

    html += `
      <div class="card">
        <div class="subject-header">
          <div class="subject-name">${prettySubject(subject)}</div>
          <div class="percentage ${cls}">${p.toFixed(2)}%</div>
        </div>
        <div class="progress"><div class="progress-fill" style="width:${Math.min(p, 100)}%"></div></div>
        <div class="subject-info"><span>${a} / ${t}</span></div>
      </div>`;
  }

  if (adminMode) {
    html += `<button class="reset-attendance-button" onclick="resetAttendance()">Reset Test Attendance</button>`;
  }

  page.innerHTML = html;
}

/* =========================
   CALENDAR PAGE
   ========================= */

let calendarDate = new Date();

function renderCalendar() {
  const page = document.getElementById("calendarPage");
  if (!page) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  let html = `
    <div class="calendar-toolbar">
      <button class="month-button" onclick="changeMonth(-1)">‹</button>
      <div class="month-title">${MONTH_NAMES[month]} ${year}</div>
      <button class="month-button" onclick="changeMonth(1)">›</button>
    </div>
    <button class="secondary-button calendar-timetable-button" onclick="openTimetableManager()">📷 Update timetable</button>
    <div class="card">
      <div class="weekdays">${DAY_NAMES.map(d => `<div class="weekday">${d.substring(0, 3)}</div>`).join("")}</div>
      <div class="calendar-grid">`;

  for (let i = 0; i < first.getDay(); i++) html += `<div class="calendar-day empty"></div>`;

  for (let day = 1; day <= last.getDate(); day++) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const classes = getClassesForDate(date);
    const holiday = HOLIDAYS[key];
    const today = key === dateKey(new Date());

    html += `
      <button class="calendar-day ${today ? "today" : ""} ${holiday ? "holiday" : ""}" onclick="openDay('${key}')">
        <div class="day-number">${day}</div>
        ${holiday ? `<div class="day-label">${holiday}</div>` : ""}
        ${classes.length ? `<div class="class-dot"></div>` : ""}
      </button>`;
  }

  html += `</div></div><div id="selectedDay"></div>`;
  page.innerHTML = html;
}

function changeMonth(amount) {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + amount, 1);
  renderCalendar();
}

function openDay(key) {
  const date = parseDate(key);
  const classes = getClassesForDate(date);
  const holiday = HOLIDAYS[key];

  let html = `
    <div class="card">
      <div class="subject-header">
        <div class="subject-name">${date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
        <div class="percentage">${classes.length}</div>
      </div>`;

  if (holiday) html += `<div style="margin-top:10px;color:#ff9ba4;font-size:13px">Holiday: ${holiday}</div>`;
  if (!classes.length) html += `<div style="margin-top:14px;color:var(--muted);font-size:13px">No classes scheduled.</div>`;

  if (classes.length) {
    html += `<div class="class-list">`;
    for (const lesson of classes) {
      html += `
        <div class="class-item">
          <div class="class-time">${lesson[0]}<br>${lesson[1]}</div>
          <div class="class-name">${prettySubject(lesson[2])}</div>
        </div>`;
    }
    html += `</div>`;

    if (key >= ATTENDANCE_START && key <= ATTENDANCE_CUTOFF) {
      html += `<button class="primary-button" onclick="openAttendanceModal('${key}')">Mark Attendance</button>`;
    }
  }

  html += `</div>`;
  document.getElementById("selectedDay").innerHTML = html;
}

/* =========================
   ATTENDANCE MARKING MODAL
   ========================= */

function openAttendanceModal(key) {
  const classes = getClassesForDate(parseDate(key));
  if (!classes.length) return;

  const existing = state.attendanceRecords[key] || {};
  let existingMap = Array.isArray(existing) ? Object.fromEntries(existing.map(r => [r.subject, r.status])) : existing;

  let rows = "";
  classes.forEach((lesson, index) => {
    const subject = lesson[2];
    const current = existingMap[subject] || "";

    rows += `
      <div class="attendance-class-row">
        <div class="attendance-class-info">
          <div class="attendance-class-name">${prettySubject(subject)}</div>
          <div class="attendance-class-time">${lesson[0]} – ${lesson[1]}</div>
        </div>
        <div class="attendance-toggle">
          <button type="button" class="attendance-choice present-choice ${current === "present" ? "selected" : ""}" data-index="${index}" onclick="setAttendanceChoice(this,'present')">Present</button>
          <button type="button" class="attendance-choice absent-choice ${current === "absent" ? "selected" : ""}" data-index="${index}" onclick="setAttendanceChoice(this,'absent')">Absent</button>
        </div>
      </div>`;
  });

  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="predictor-overlay" onclick="closeModal(event)">
      <div class="predictor-modal attendance-modal" onclick="event.stopPropagation()">
        <div class="predictor-top">
          <div><h2>Mark Attendance</h2><div class="cutoff">${formatDisplayDate(key)}</div></div>
          <button class="close-button" onclick="closeModal()">×</button>
        </div>
        <div class="attendance-helper">Tap Present or Absent for each class.</div>
        <div class="attendance-class-list">${rows}</div>
        <div class="attendance-modal-actions">
          <button type="button" class="all-present-button" onclick="markAllPresent()">All Present</button>
          <button type="button" class="save-attendance-button" onclick="saveAttendance('${key}')">Save Attendance</button>
        </div>
      </div>
    </div>`;
}

function setAttendanceChoice(button) {
  const row = button.closest(".attendance-class-row");
  if (!row) return;
  row.querySelectorAll(".attendance-choice").forEach(c => c.classList.remove("selected"));
  button.classList.add("selected");
}

function markAllPresent() {
  document.querySelectorAll(".attendance-class-row .present-choice").forEach(b => setAttendanceChoice(b));
}

function saveAttendance(key) {
  const rows = document.querySelectorAll(".attendance-class-row");
  const classes = getClassesForDate(parseDate(key));
  const records = {};

  rows.forEach((row, index) => {
    const selected = row.querySelector(".attendance-choice.selected");
    if (selected) records[classes[index][2]] = selected.classList.contains("present-choice") ? "present" : "absent";
  });

  if (Object.keys(records).length > 0) state.attendanceRecords[key] = records;
  saveState();
  closeModal();
  renderAttendance();
  renderCalendar();
}

function resetAttendance() {
  if (!adminMode || !confirm("Reset all manual attendance records?")) return;
  state.attendanceRecords = {};
  saveState();
  renderAttendance();
  renderCalendar();
}

/* =========================
   PREDICTOR
   ========================= */

let predictorChoices = {};

function cyclePredictorDay(key) {
  const current = predictorChoices[key] || "attending";
  predictorChoices[key] = current === "attending" ? "absent" : current === "absent" ? "ignored" : "attending";
  renderPredictor();
}

function renderPredictor() {
  const days = getFutureClasses();
  const prediction = getPrediction(predictorChoices);
  let totalA = 0, totalT = 0;
  for (const s in prediction) { totalA += prediction[s].attended; totalT += prediction[s].total; }

  const overall = percentage(totalA, totalT);

  let html = `
    <div class="predictor-overlay">
      <div class="predictor-modal" onclick="event.stopPropagation()">
        <div class="predictor-top">
          <div><h2>Attendance Predictor</h2><div class="cutoff">Attendance counted until 25 November 2026</div></div>
          <button class="close-button" onclick="closePredictor()">×</button>
        </div>
        <div class="predictor-controls">
          <div class="predictor-month">Remaining Days</div>
        </div>
        <div class="info-box">
          Tap a class day to cycle: <b>Attending</b> → <b style="color:var(--red)">Not Attending</b> → <b>Ignored</b>.<br><br>
          The prediction stops at <b>25 November 2026</b>.
        </div>
        <div class="predictor-summary">
          <div class="predicted-label">PREDICTED OVERALL ATTENDANCE</div>
          <div class="predicted-number">${overall.toFixed(2)}%</div>
        </div>
        <div class="legend">
          <div class="legend-item"><span class="legend-dot legend-attending"></span>Attending</div>
          <div class="legend-item"><span class="legend-dot legend-absent"></span>Not Attending</div>
          <div class="legend-item"><span class="legend-dot legend-ignored"></span>Ignored</div>
        </div>
        <div class="predictor-days">`;

  for (const item of days) {
    const choice = predictorChoices[item.key] || "attending";
    html += `
      <button class="predictor-day ${choice}" onclick="cyclePredictorDay('${item.key}')">
        <div class="date">${item.date.getDate()}</div>
        <div class="weekday">${DAY_NAMES[item.date.getDay()].substring(0, 3).toUpperCase()}</div>
      </button>`;
  }

  html += `</div>`;

  for (const subject in prediction) {
    const a = prediction[subject].attended;
    const t = prediction[subject].total;
    const p = percentage(a, t);
    const remaining = countRemainingSubjectClasses(subject, predictorChoices);
    const canMiss = calculateCanMiss(a, t, remaining);
    const mustAttend = calculateMustAttend(a, t, remaining);
    const cls = p >= 75 ? "forecast-good" : p >= 70 ? "forecast-warning" : "forecast-danger";

    let advice = p >= 75
      ? `You can miss ${canMiss} more ${canMiss === 1 ? "class" : "classes"} and still finish at 75%+`
      : mustAttend !== null ? `Need to attend ${mustAttend} of the ${remaining} remaining` : "75% is not reachable by 25 Nov";

    html += `
      <div class="subject-forecast">
        <div class="forecast-header">
          <div class="forecast-subject">${prettySubject(subject)}</div>
          <div class="forecast-percent ${cls}">${p.toFixed(2)}%</div>
        </div>
        <div class="forecast-details"><span>${a} / ${t}</span><span>${remaining} classes remaining</span></div>
        <div class="forecast-details ${cls}" style="margin-top:6px">${advice}</div>
      </div>`;
  }

  html += `<button class="secondary-button" style="margin-top:12px" onclick="resetPredictor()">Reset prediction</button></div></div>`;
  document.getElementById("modal").innerHTML = html;
}

function openPredictor() { predictorChoices = {}; renderPredictor(); }
function closePredictor() { const m = document.getElementById("modal"); if (m) m.innerHTML = ""; }
function resetPredictor() { predictorChoices = {}; renderPredictor(); }
function closeModal(e) { if (!e || e.target.classList.contains("predictor-overlay")) closePredictor(); }

/* =========================
   MESS MENU & OCR
   ========================= */

let messDate = new Date();
const MESS_STORAGE_KEY = "iiuler_mess_menu_v1";
let savedMessMenu = null;

try { savedMessMenu = JSON.parse(localStorage.getItem(MESS_STORAGE_KEY) || "null"); } catch (e) { savedMessMenu = null; }

const MESS_MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" }
];

function escapeMessHTML(val) {
  return String(val ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function getMessMenu(date) {
  const day = DAY_NAMES[date.getDay()].toLowerCase();
  return (savedMessMenu && savedMessMenu[day]) || OCTOBER_MENU[day] || null;
}

function renderMess() {
  const page = document.getElementById("messPage");
  if (!page) return;

  const menu = getMessMenu(messDate);
  const dayName = DAY_NAMES[messDate.getDay()];
  const dayKey = dayName.toLowerCase();

  let html = `
    <div class="mess-topline">
      <div><p class="eyebrow">DAILY DINING</p><h2 class="mess-heading">What's on the menu?</h2></div>
      <button class="mess-edit-button" onclick="openMessMenuManager()"><span>＋</span> Update</button>
    </div>
    <div class="mess-date-picker">
      <button class="month-button" onclick="changeMessDate(-1)">‹</button>
      <div class="mess-date-center">
        <div class="mess-current-day">${dayName}</div>
        <div class="mess-current-date">${messDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
      <button class="month-button" onclick="changeMessDate(1)">›</button>
    </div>`;

  if (!menu) { page.innerHTML = html + `<div class="card">No menu available for this day.</div>`; return; }

  const mealIcons = { breakfast: "☀", lunch: "◒", snacks: "☕", dinner: "☾" };
  html += `<div class="mess-meal-grid">`;
  for (const meal of MESS_MEALS) {
    const items = Array.isArray(menu[meal.key]) ? menu[meal.key] : [];
    html += `
      <article class="mess-meal-card">
        <div class="mess-meal-top">
          <div class="mess-meal-icon">${mealIcons[meal.key]}</div>
          <div><h3>${meal.label === "snacks" ? "Evening snacks" : meal.label}</h3></div>
        </div>
        ${items.length ? `<ul class="mess-food-list">${items.map(i => `<li>${escapeMessHTML(i)}</li>`).join("")}</ul>` : `<p class="mess-empty">Menu not added yet.</p>`}
      </article>`;
  }

  html += `</div>`;
  if (savedMessMenu && savedMessMenu[dayKey]) html += `<p class="mess-saved-note"><span>●</span> Updated menu saved on this device</p>`;
  page.innerHTML = html;
}

function changeMessDate(amount) {
  messDate = new Date(messDate.getFullYear(), messDate.getMonth(), messDate.getDate() + amount);
  renderMess();
}

function openMessMenuManager() {
  let fields = "";
  for (const day of DAY_NAMES) {
    const key = day.toLowerCase();
    const existing = (savedMessMenu && savedMessMenu[key]) || OCTOBER_MENU[key] || {};
    fields += `<section class="mess-editor-day"><h3>${day}</h3>`;
    for (const meal of MESS_MEALS) {
      const val = Array.isArray(existing[meal.key]) ? existing[meal.key].join("\n") : "";
      fields += `<label class="mess-editor-field"><span>${meal.label}</span><textarea rows="3" data-menu-day="${key}" data-menu-meal="${meal.key}">${escapeMessHTML(val)}</textarea></label>`;
    }
    fields += `</section>`;
  }

  document.getElementById("modal").innerHTML = `
    <div class="predictor-overlay mess-editor-overlay" onclick="closeMessMenuManager(event)">
      <div class="predictor-modal mess-editor-modal" onclick="event.stopPropagation()">
        <div class="predictor-top">
          <div><p class="eyebrow">MESS SETTINGS</p><h2>Update menu</h2></div>
          <button class="close-button" onclick="closeMessMenuManager()">×</button>
        </div>
        <div id="messMenuEditorFields">${fields}</div>
        <div class="mess-editor-actions">
          <button class="secondary-button" onclick="closeMessMenuManager()">Cancel</button>
          <button class="primary-button" onclick="saveMessMenu()">Save menu</button>
        </div>
      </div>
    </div>`;
}

function closeMessMenuManager(e) { if (!e || e.target.classList.contains("mess-editor-overlay")) closeModal(); }

async function saveMessMenu() {
  const menu = {};
  for (const day of DAY_NAMES) {
    const key = day.toLowerCase();
    menu[key] = {};
    for (const meal of MESS_MEALS) {
      const field = document.querySelector(`[data-menu-day="${key}"][data-menu-meal="${meal.key}"]`);
      menu[key][meal.key] = field ? field.value.split(/\r?\n/).map(i => i.trim()).filter(Boolean) : [];
    }
  }
  localStorage.setItem(MESS_STORAGE_KEY, JSON.stringify(menu));
  savedMessMenu = menu;
  await cloudWrite("mess", menu);
  closeModal();
  renderMess();
  alert("Mess menu saved successfully.");
}

/* =========================
   BASELINE MANAGER MODAL
   ========================= */

function openBaselineManager() {
  const currentBaseline = getBaseline();
  let rows = "";

  for (const subject in OFFICIAL_BASELINE) {
    const counts = currentBaseline[subject] || OFFICIAL_BASELINE[subject];
    rows += `
      <div style="margin-bottom:12px;padding:12px;background:#10141b;border:1px solid #252b34;border-radius:12px">
        <div style="color:#e8edf5;font-weight:700;font-size:13px;margin-bottom:8px">${prettySubject(subject)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label style="color:#858c98;font-size:10px">Attended:
            <input type="number" min="0" class="baseline-attended" data-subject="${subject}" value="${counts.attended}" style="width:100%;height:36px;margin-top:4px;padding:0 8px;border:1px solid #303744;border-radius:8px;background:#0b0e13;color:#e6ebf2;font-size:13px;font-weight:600">
          </label>
          <label style="color:#858c98;font-size:10px">Total Conducted:
            <input type="number" min="0" class="baseline-total" data-subject="${subject}" value="${counts.total}" style="width:100%;height:36px;margin-top:4px;padding:0 8px;border:1px solid #303744;border-radius:8px;background:#0b0e13;color:#e6ebf2;font-size:13px;font-weight:600">
          </label>
        </div>
      </div>`;
  }

  document.getElementById("modal").innerHTML = `
    <div class="predictor-overlay" onclick="closeModal(event)">
      <div class="predictor-modal" onclick="event.stopPropagation()">
        <div class="predictor-top">
          <div><h2>Edit Baseline Counts</h2><div class="cutoff">Official counts (up to 31 Oct 2026)</div></div>
          <button class="close-button" onclick="closeModal()">×</button>
        </div>
        <div style="margin:12px 0 16px;color:#858c98;font-size:11px;line-height:1.4">
          Update official baseline attended and total conducted counts below. Changes sync to cloud and update percentages automatically.
        </div>
        <div>${rows}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
          <button class="secondary-button" onclick="resetBaselineCounts()">Reset Defaults</button>
          <button class="primary-button" style="margin-top:0" onclick="saveBaselineCounts()">Save Baseline</button>
        </div>
      </div>
    </div>`;
}

function saveBaselineCounts() {
  const newBaseline = {};
  document.querySelectorAll(".baseline-attended").forEach(input => {
    const subject = input.dataset.subject;
    const attended = parseInt(input.value, 10) || 0;
    const totalInput = document.querySelector(`.baseline-total[data-subject="${subject}"]`);
    const total = parseInt(totalInput ? totalInput.value : 0, 10) || 0;
    newBaseline[subject] = { attended, total };
  });

  state.customBaseline = newBaseline;
  saveState();
  closeModal();
  renderAttendance();
  renderCalendar();
  alert("Baseline counts updated!");
}

function resetBaselineCounts() {
  if (confirm("Reset baseline counts back to official sheet values?")) {
    delete state.customBaseline;
    saveState();
    closeModal();
    renderAttendance();
    renderCalendar();
  }
}

/* =========================
   NAVIGATION & INIT
   ========================= */

function changePage(page) {
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-button").forEach(el => el.classList.remove("active"));

  const target = document.getElementById(`${page}Page`);
  const nav = document.getElementById(`nav${page.charAt(0).toUpperCase()}${page.slice(1)}`);
  if (target) target.classList.add("active");
  if (nav) nav.classList.add("active");

  const title = document.getElementById("pageTitle");
  if (title) title.textContent = { attendance: "Attendance", calendar: "Calendar", mess: "Mess" }[page];

  if (page === "attendance") renderAttendance();
  if (page === "calendar") {
    calendarDate = new Date();
    renderCalendar();
    setTimeout(() => openDay(dateKey(new Date())), 30);
  }
  if (page === "mess") renderMess();
}

function goToday() {
  calendarDate = new Date();
  messDate = new Date();
  changePage("calendar");
}

startCloudApp();

setInterval(() => {
  const page = document.getElementById("attendancePage");
  if (page && page.classList.contains("active")) renderAttendance();
}, 60000);