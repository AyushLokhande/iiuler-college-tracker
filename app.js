/* ========== SUPABASE CLOUD SYNC ========== */

const SUPABASE_URL = "https://fbppupqcndsrmkedvypj.supabase.co";
const SUPABASE_KEY = "sb_publishable_18cWVacawL1xbgirE-llAQ_zzz27Fqu";

const cloud = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let cloudReady = false;
let applyingCloudChange = false;

async function cloudWrite(key, value) {
  if (!cloudReady || applyingCloudChange) return;

  const { error } = await cloud
    .from("shared_app_data")
    .upsert({
      data_key: key,
      value: value,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Cloud save failed:", key, error);
    alert("Cloud sync failed. Check your connection and sign-in.");
  }
}

async function loadCloudData() {
  const { data, error } = await cloud
    .from("shared_app_data")
    .select("data_key, value");

  if (error) throw error;

  const remote = Object.fromEntries(
    (data || []).map(row => [row.data_key, row.value])
  );

  const localAttendance = JSON.parse(
    localStorage.getItem("iiuler_attendance_v2") || '{"attendanceRecords":{}}'
  );

  const localTimetable = JSON.parse(
    localStorage.getItem("iiuler_timetable_override_v1") || "null"
  );

  const localMess = JSON.parse(
    localStorage.getItem("iiuler_mess_menu_v1") || "null"
  );

  const localHolidays = { ...HOLIDAYS };

  // If a cloud record exists, it takes priority.
  // Otherwise, migrate the current device's data.
  if (Object.hasOwn(remote, "attendance")) {
    state = remote.attendance;
  } else {
    state = localAttendance;
    await cloudWrite("attendance", state);
  }

  if (Object.hasOwn(remote, "timetable")) {
    timetableOverride = remote.timetable;
  } else {
    timetableOverride = localTimetable;
    await cloudWrite("timetable", timetableOverride);
  }

  if (Object.hasOwn(remote, "holidays")) {
    HOLIDAYS = remote.holidays;
  } else {
    HOLIDAYS = localHolidays;
    await cloudWrite("holidays", HOLIDAYS);
  }

  if (Object.hasOwn(remote, "mess")) {
    savedMessMenu = remote.mess;
  } else {
    savedMessMenu = localMess;
    await cloudWrite("mess", savedMessMenu);
  }

  // Keep local storage as a local cache.
  localStorage.setItem("iiuler_attendance_v2", JSON.stringify(state));
  localStorage.setItem(
    "iiuler_timetable_override_v1",
    JSON.stringify(timetableOverride)
  );
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
    switch (row.data_key) {
      case "attendance":
        state = row.value;
        localStorage.setItem("iiuler_attendance_v2", JSON.stringify(state));
        break;

      case "timetable":
        timetableOverride = row.value;
        localStorage.setItem(
          "iiuler_timetable_override_v1",
          JSON.stringify(timetableOverride)
        );
        break;

      case "holidays":
        HOLIDAYS = row.value;
        break;

      case "mess":
        savedMessMenu = row.value;
        localStorage.setItem(
          "iiuler_mess_menu_v1",
          JSON.stringify(savedMessMenu)
        );
        break;
    }

    renderAttendance();
    renderCalendar();
    renderMess();
  } finally {
    applyingCloudChange = false;
  }
}

function startCloudRealtime() {
  cloud
    .channel("iiuler-shared-data")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "shared_app_data"
      },
      payload => {
        if (payload.new) applyRemoteChange(payload.new);
      }
    )
    .subscribe(status => {
      console.log("Cloud realtime status:", status);
    });
}

async function startCloudApp() {
  const login = document.getElementById("cloudLogin");
  const app = document.querySelector(".app");
  const status = document.getElementById("cloudLoginStatus");

  document.getElementById("cloudLoginForm").addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      status.textContent = "Signing in…";

      const email = document.getElementById("cloudEmail").value.trim();
      const password = document.getElementById("cloudPassword").value;

      const { error } = await cloud.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        status.textContent = error.message;
        return;
      }

      try {
        await loadCloudData();
        startCloudRealtime();

        login.style.display = "none";
        app.style.display = "";
      } catch (err) {
        console.error(err);
        status.textContent =
          "Signed in, but cloud data could not load. Check the database setup.";
        await cloud.auth.signOut();
      }
    }
  );

  const { data: { session } } = await cloud.auth.getSession();

  if (session) {
    try {
      await loadCloudData();
      startCloudRealtime();
      login.style.display = "none";
      app.style.display = "";
    } catch (err) {
      console.error(err);
      status.textContent = "Could not load cloud data. Please sign in again.";
    }
  }
}

/* =========================================================
   IIULER ATTENDANCE APP
   ========================================================= */

/* =========================
   CURRENT ATTENDANCE
   ========================= */

const SUBJECTS = {
  "Legal Methods": { attended: 10, total: 16 },
  "Economics I": { attended: 13, total: 23 },
  "Law of Torts": { attended: 15, total: 25 },
  "English I": { attended: 21, total: 32 },
  "Principles of Management": { attended: 18, total: 29 },
  "Marketing Management": { attended: 19, total: 26 }
};

const ATTENDANCE_START = "2026-10-14";
const ATTENDANCE_CUTOFF = "2026-11-25";

/* =========================
   HOLIDAYS
   ========================= */

let HOLIDAYS = {
  "2026-08-15": "Independence Day",
  "2026-08-25": "Id-e-Milad",
  "2026-09-04": "Janmashtami",
  "2026-09-14": "Ganesh Chaturthi",
  "2026-09-15": "Ganesh Chaturthi",
  "2026-10-02": "Gandhi Jayanti",
  "2026-10-20": "Dussehra",
  "2026-10-21": "Dussehra",
  "2026-11-08": "Diwali",
  "2026-11-09": "Diwali",
  "2026-12-03": "St Francis Xavier's Feast",
  "2026-12-19": "Goa Liberation Day",
  "2026-12-25": "Christmas"
};

/* =========================
   OFFICIAL TIMETABLE
   Effective 28 September 2026
   ========================= */

const TIMETABLE = {
  1: [
    ["09:55", "10:45", "Law of Torts"],
    ["10:50", "11:40", "Principles of Management"],
    ["12:00", "12:50", "Principles of Management"],
    ["12:55", "13:35", "English I"],
    ["14:30", "15:20", "Marketing Management"],
    ["15:25", "16:15", "Legal Methods"]
  ],
  2: [
    ["09:55", "10:45", "Legal Methods"],
    ["10:50", "11:40", "Law of Torts"],
    ["12:00", "12:50", "Economics I"],
    ["12:55", "13:35", "English I"],
    ["14:30", "15:20", "Marketing Management"],
    ["15:25", "16:15", "Marketing Management"]
  ],
  3: [
    ["09:55", "10:45", "Legal Methods"],
    ["10:50", "11:40", "Marketing Management"],
    ["12:00", "12:50", "Economics I"],
    ["12:55", "13:35", "Principles of Management"],
    ["14:30", "15:20", "Law of Torts"],
    ["15:25", "16:15", "Law of Torts"]
  ],
  4: [
    ["09:55", "10:45", "Economics I"],
    ["10:50", "11:40", "English I"],
    ["12:00", "12:50", "English I"],
    ["12:55", "13:35", "Economics I"],
    ["14:30", "15:20", "Principles of Management"],
    ["15:25", "16:15", "Principles of Management"]
  ],
  5: [
    ["09:55", "10:45", "Economics I"],
    ["10:50", "11:40", "Legal Methods"],
    ["12:00", "12:50", "English I"],
    ["12:55", "13:35", "Marketing Management"],
    ["14:30", "15:20", "Legal Methods"],
    ["15:25", "16:15", "Law of Torts"]
  ]
};

/* =========================
   MESS MENU
   ========================= */

const OCTOBER_MENU = {
  monday: {
    breakfast: [
      "Aloo Pyaz Paratha",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Veg Korma",
      "Black Chana Masala",
      "Dal Amritsari",
      "Plain Rice",
      "Chapati",
      "Rasam",
      "Fryums",
      "Green Salad",
      "Plain Curd",
      "Gulab Jamun"
    ],
    snacks: ["Spicy Bhelpuri", "Tea & Coffee"],
    dinner: [
      "Paneer Butter Masala",
      "Veg Kolhapuri",
      "Dal Fry",
      "Plain Rice",
      "Chapati",
      "Toss Salad",
      "Boondi Raita",
      "Punjabi Egg Curry"
    ]
  },

  tuesday: {
    breakfast: [
      "Medu Vada",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Punjabi Rajma",
      "Tawa Mix Veg Dry",
      "Dal Kolhapuri",
      "Plain Rice",
      "Chapati",
      "Sambhar",
      "Roasted Papad",
      "Masala Chopped Salad",
      "Fruit Custard"
    ],
    snacks: ["Sabudana Tikki", "Tea & Coffee"],
    dinner: [
      "Dahi Kachori + Chutney (Green and Red)",
      "Veg Makhawala",
      "Dahi Curry",
      "Plain Rice",
      "Chapati",
      "Macaroni Salad",
      "Plain Curd"
    ]
  },

  wednesday: {
    breakfast: [
      "Onion Poha",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Soya Chilli",
      "Beans Dry",
      "Dal Makhni",
      "Jeera Rice",
      "Chapati",
      "Rasam",
      "Carrot Beetroot Salad",
      "Rasmalai"
    ],
    snacks: ["Bread Pakoda", "Tea & Coffee"],
    dinner: [
      "Paneer Biryani",
      "Gobhi Masala",
      "Dal Kolhapuri",
      "Plain Rice",
      "Chapati",
      "Mix Salad + Fried Papad",
      "Veg Raita",
      "Chicken Biryani"
    ]
  },

  thursday: {
    breakfast: [
      "Moong Dal Chilla",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Chhole Amritsari",
      "Aloo Methi",
      "Dal Tadka",
      "Plain Rice",
      "Puri + Chapati",
      "Sambhar",
      "Fried Papad",
      "Toss Salad",
      "Shrikhand"
    ],
    snacks: ["Dabeli", "Tea & Coffee"],
    dinner: [
      "Mushroom Masala",
      "Mix Veg",
      "Dal Makhani",
      "Jeera Rice",
      "Chapati",
      "Plain Curd"
    ]
  },

  friday: {
    breakfast: [
      "Misal Pav",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Veg Kofta Gravy",
      "Jeera Aloo",
      "Masoor Dal",
      "Plain Rice",
      "Chapati",
      "Rasam",
      "Roasted Papad",
      "Dhokla + Chutney",
      "Plain Curd",
      "Boondi"
    ],
    snacks: ["Maggi", "Tea & Coffee"],
    dinner: [
      "Paneer Lazeez",
      "Aloo Baingan",
      "Dal Tadka",
      "Jeera Rice",
      "Chapati + Paratha",
      "Sirka Onion",
      "Boondi Raita",
      "Chicken Patiala / Egg Kolhapuri"
    ]
  },

  saturday: {
    breakfast: [
      "Masala Idli",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Dum Aloo Gravy",
      "Veg Jalfrezi",
      "Dal Punjabi",
      "Plain Rice",
      "Chapati",
      "Sambhar",
      "Fried Papad",
      "Sprout Moong Salad",
      "Shahi Tukda"
    ],
    snacks: ["Vada Pav", "Tea & Coffee"],
    dinner: [
      "Rajma Masala",
      "Soya Kheema",
      "Dal Kolhapuri",
      "Plain Rice",
      "Chapati",
      "Toss Salad",
      "Plain Curd"
    ]
  },

  sunday: {
    breakfast: [
      "Podi Masala Dosa",
      "Omelette or Boiled Egg",
      "Bread + Butter + Jam",
      "Bournvita",
      "Milk",
      "Tea & Coffee",
      "Cornflakes"
    ],
    lunch: [
      "Pyaaz Paratha",
      "Thecha + Lehsun Chutney",
      "Soya Biryani",
      "Kokam Rasam",
      "Roasted Papad",
      "Dahi Vada",
      "Veg Raita"
    ],
    snacks: ["French Fries", "Tea & Coffee"],
    dinner: [
      "Amritsari Chhole",
      "Bhature / Stuffed Kulcha",
      "Masala Khichadi",
      "Chapati",
      "Onion Salad"
    ]
  }
};

/* =========================
   STATE
   ========================= */

const STORAGE_KEY = "iiuler_attendance_v2";

let state = {
  attendanceRecords: {}
};

try {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    state = JSON.parse(saved);
  }

  if (!state.attendanceRecords) {
    state.attendanceRecords = {};
  }
} catch (error) {
  state = {
    attendanceRecords: {}
  };
}

/* =========================
   HELPERS
   ========================= */

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function parseDate(key) {
  return new Date(key + "T12:00:00");
}

function formatDisplayDate(key) {
  return parseDate(key).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function prettySubject(subject) {
  if (subject === "Economics I") return "Economics";
  if (subject === "English I") return "English";
  return subject;
}

function percentage(a, t) {
  return t > 0 ? (a / t) * 100 : 0;
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
 cloudWrite("attendance", state);
}
/* =========================
   TIMETABLE AND LIVE STATUS
   ========================= */

const TIMETABLE_STORAGE_KEY = "iiuler_timetable_override_v1";

let timetableOverride = null;

try {
  timetableOverride = JSON.parse(
    localStorage.getItem(TIMETABLE_STORAGE_KEY) || "null"
  );
} catch (error) {
  timetableOverride = null;
}

function getActiveTimetable() {
  return timetableOverride && typeof timetableOverride === "object"
    ? timetableOverride
    : TIMETABLE;
}

function parseClock(value) {
  const [hour, minute] = String(value).split(":").map(Number);
  return hour * 60 + minute;
}

function clockNow(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function timeLabel(value) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${(hour % 12) || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function getDayStatus(date = new Date()) {
  const key = dateKey(date);
  const day = date.getDay();
  const now = clockNow(date);

  if (HOLIDAYS[key]) {
    return {
      kind: "off",
      title: HOLIDAYS[key],
      detail: "College holiday — enjoy your day."
    };
  }

  if (day === 0) {
    return {
      kind: "off",
      title: "Sunday off",
      detail: "No regular classes today."
    };
  }

  if (day === 6) {
    return {
      kind: "off",
      title: "Co-curricular activities / guest lectures",
      detail: "Saturday timetable lists activities rather than regular classes."
    };
  }

  const slots = (getActiveTimetable()[day] || [])
    .slice()
    .sort((a, b) => parseClock(a[0]) - parseClock(b[0]));

  if (!slots.length) {
    return {
      kind: "off",
      title: "No classes today",
      detail: "No scheduled classes found."
    };
  }

  for (const lesson of slots) {
    const start = parseClock(lesson[0]);
    const end = parseClock(lesson[1]);

    if (now >= start && now < end) {
      return {
        kind: "class",
        title: `Class now: ${lesson[2]}`,
        detail: `${timeLabel(lesson[0])} – ${timeLabel(lesson[1])}`
      };
    }
  }

  const breaks = [
    { start: "11:40", end: "12:00", name: "Tea break ☕" },
    { start: "13:35", end: "14:30", name: "Lunch break 🍱" }
  ];

  for (const pause of breaks) {
    if (now >= parseClock(pause.start) && now < parseClock(pause.end)) {
      const next = slots.find(lesson => parseClock(lesson[0]) >= parseClock(pause.end));

      return {
        kind: "break",
        title: pause.name,
        detail: next
          ? `Next: ${next[2]} at ${timeLabel(next[0])}`
          : "Enjoy your break."
      };
    }
  }

  const next = slots.find(lesson => parseClock(lesson[0]) > now);
  const previous = [...slots].reverse().find(lesson => parseClock(lesson[1]) <= now);

  if (next && previous) {
    return {
      kind: "break",
      title: "Break time ☕",
      detail: `Next: ${next[2]} at ${timeLabel(next[0])}`
    };
  }

  if (next) {
    return {
      kind: "upcoming",
      title: "No class right now",
      detail: `Next: ${next[2]} at ${timeLabel(next[0])}`
    };
  }

  return {
    kind: "done",
    title: "Classes finished",
    detail: "You're done for today."
  };
}

function timetableStatusHTML() {
  const status = getDayStatus();

  const isFinished = status.kind === "done";
  const isBreak = status.kind === "break";
  const isOff = status.kind === "off";

  const icon = isFinished ? "🎉" : isBreak ? "☕" : isOff ? "🌿" : "📚";

  return `
    <div class="today-status-card ${
      isFinished ? "today-status-finished" :
      isBreak ? "today-status-break" :
      isOff ? "today-status-finished" :
      "today-status-class"
    }">
      <div class="today-attendance-left">
        <div class="today-attendance-label">RIGHT NOW</div>
        <div class="today-attendance-title">
          ${status.title} ${icon}
        </div>
        <div class="today-attendance-meta">${status.detail}</div>
      </div>
    </div>
  `;
}

/* =========================
   TIMETABLE EDITOR
   ========================= */



function openTimetableManager() {
  document.getElementById("modal").innerHTML = `
    <div class="timetable-overlay" onclick="if(event.target===this)closeTimetableManager()">
      <div class="timetable-modal" onclick="event.stopPropagation()">
        <div class="timetable-modal-head">
          <div>
            <div class="attendance-greeting-small">SCHEDULE SETTINGS</div>
            <h2>Update timetable</h2>
          </div>
          <button class="close-button" onclick="closeTimetableManager()">✕</button>
        </div>

        <p class="timetable-note">
          Upload a clear photo of the timetable. Save it when you're done.
        </p>

        <label class="upload-timetable-button">
          📷 Upload timetable image
          <input
            id="timetableImageInput"
            type="file"
            accept="image/*"
            onchange="previewTimetableImage(event)"
          >
        </label>

        <div id="timetableImagePreview" style="margin-top:16px"></div>

        <button
          class="save-attendance-button timetable-save"
          onclick="saveTimetableImage()"
        >Save changes</button>
      </div>
    </div>
  `;
}

function previewTimetableImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const preview = document.getElementById("timetableImagePreview");
    if (!preview) return;

    preview.innerHTML = `
      <img
        src="${reader.result}"
        alt="Timetable preview"
        style="width:100%;max-height:400px;object-fit:contain;border-radius:12px;background:#080a0f"
      >
    `;
  };

  reader.readAsDataURL(file);
}

async function saveTimetableImage() {
  const input = document.getElementById("timetableImageInput");
  const file = input?.files?.[0];

  if (!file) {
    alert("Please upload a timetable image first.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      localStorage.setItem("iiuler_timetable_image_v1", reader.result);
      closeTimetableManager();
      alert("Timetable image saved!");
    } catch (error) {
      console.error(error);
      alert("Image is too large to save. Please upload a smaller image.");
    }
  };

  reader.readAsDataURL(file);
}



function closeTimetableManager() {
  document.getElementById("modal").innerHTML = "";
}

/*
  IMPORTANT:
  This deliberately previews the uploaded image instead of making
  unreliable OCR guesses. Review and edit the actual timetable cells
  before saving.
*/

async function readTimetablePhoto(event) {
  const file = event.target.files && event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a timetable image.");
    return;
  }

  const imageUrl = URL.createObjectURL(file);

  openTimetableManager();

  const status = document.getElementById("timetableOcrStatus");

  if (status) {
    status.innerHTML = `
      <div style="color:#e7edf7;font-weight:700;margin-bottom:8px">
        Uploaded timetable preview
      </div>

      <img
        src="${imageUrl}"
        alt="Uploaded timetable for reference"
        style="
          display:block;
          width:100%;
          max-height:260px;
          object-fit:contain;
          background:#080a0f;
          border:1px solid #303847;
          border-radius:12px;
          margin-bottom:10px;
        "
      >

      <div style="color:#e6b95e;line-height:1.6">
        Timetable photo uploaded. Review the subjects below before saving.
      </div>
    `;
  }
}

function saveTimetableEdits() {
  const original = getActiveTimetable();
  const schedule = {};

  for (let day = 1; day <= 5; day++) {
    schedule[day] = (original[day] || []).map((lesson, index) => {
      const select = document.querySelector(
        `.tt-subject[data-day="${day}"][data-index="${index}"]`
      );

      return [
        lesson[0],
        lesson[1],
        select ? select.value : lesson[2]
      ];
    }).filter(lesson => lesson[2]);
  }

  timetableOverride = schedule;

  localStorage.setItem(
    TIMETABLE_STORAGE_KEY,
    JSON.stringify(schedule)
    
  );
  cloudWrite("timetable", schedule);

  closeTimetableManager();
  renderAttendance();
  renderCalendar();

  alert("Timetable saved!");
}

function resetTimetable() {
  if (!confirm("Reset the timetable to the official timetable currently built into the app?")) {
    return;
  }

  timetableOverride = null;

  localStorage.removeItem(TIMETABLE_STORAGE_KEY);
  cloudWrite("timetable", null);

  closeTimetableManager();
  renderAttendance();
  renderCalendar();
}

function getClassesForDate(date) {
  const key = dateKey(date);
  const day = date.getDay();

  if (day === 0 || day === 6) return [];
  if (HOLIDAYS[key]) return [];
  if (key < "2026-09-28") return [];

  return getActiveTimetable()[day] || [];
}

/* =========================
   ACTUAL ATTENDANCE
   ========================= */

function getActualAttendance() {
  const result = {};

  for (const subject in SUBJECTS) {
    result[subject] = {
      attended: SUBJECTS[subject].attended,
      total: SUBJECTS[subject].total
    };
  }

  for (const key in state.attendanceRecords) {
    if (key < ATTENDANCE_START || key > ATTENDANCE_CUTOFF) {
      continue;
    }

    const records = state.attendanceRecords[key] || {};

    if (Array.isArray(records)) {
      for (const record of records) {
        if (!result[record.subject]) continue;

        if (record.status === "present" || record.status === "absent") {
          result[record.subject].total++;
        }

        if (record.status === "present") {
          result[record.subject].attended++;
        }
      }
    } else {
      for (const subject in records) {
        if (!result[subject]) continue;

        const status = records[subject];

        if (status === "present" || status === "absent") {
          result[subject].total++;

          if (status === "present") {
            result[subject].attended++;
          }
        }
      }
    }
  }

  return result;
}

/* =========================
   CHECK IF DAY RECORDED
   ========================= */

function hasAttendanceRecord(key) {
  const records = state.attendanceRecords[key];

  if (!records) return false;

  if (Array.isArray(records)) {
    return records.some(record =>
      record.status === "present" ||
      record.status === "absent"
    );
  }

  return Object.values(records).some(status =>
    status === "present" ||
    status === "absent"
  );
}

/* =========================
   PREDICTION
   ========================= */

function getFutureClasses() {
  const days = [];

  let date = parseDate(ATTENDANCE_START);
  const cutoff = parseDate(ATTENDANCE_CUTOFF);

  while (date <= cutoff) {
    const key = dateKey(date);
    const classes = getClassesForDate(date);

    if (classes.length) {
      days.push({
        key,
        date: new Date(date),
        classes
      });
    }

    date.setDate(date.getDate() + 1);
  }

  return days;
}

function getPrediction(dayChoices = {}) {
  const actual = getActualAttendance();
  const result = {};

  for (const subject in actual) {
    result[subject] = {
      attended: actual[subject].attended,
      total: actual[subject].total
    };
  }

  for (const item of getFutureClasses()) {
    const key = item.key;

    if (hasAttendanceRecord(key)) continue;

    const choice = dayChoices[key] || "attending";

    if (choice === "ignored") continue;

    for (const lesson of item.classes) {
      const subject = lesson[2];

      result[subject].total++;

      if (choice === "attending") {
        result[subject].attended++;
      }
    }
  }

  return result;
}

/* =========================
   CAN MISS / MUST ATTEND
   ========================= */

function calculateCanMiss(attended, total, remaining) {
  let maxMiss = 0;

  for (let missed = 0; missed <= remaining; missed++) {
    const futureAttended = attended + (remaining - missed);
    const futureTotal = total + remaining;

    if (percentage(futureAttended, futureTotal) >= 75) {
      maxMiss = missed;
    }
  }

  return maxMiss;
}

function calculateMustAttend(attended, total, remaining) {
  let mustAttend = 0;

  while (
    mustAttend <= remaining &&
    percentage(attended + mustAttend, total + remaining) < 75
  ) {
    mustAttend++;
  }

  if (
    percentage(attended + mustAttend, total + remaining) < 75
  ) {
    return null;
  }

  return mustAttend;
}

function countRemainingSubjectClasses(subject, choices) {
  let count = 0;

  for (const item of getFutureClasses()) {
    const key = item.key;

    if (hasAttendanceRecord(key)) continue;

    const choice = choices[key] || "attending";

    if (choice === "ignored") continue;

    for (const lesson of item.classes) {
      if (lesson[2] === subject) count++;
    }
  }

  return count;
}

/* =========================================================
   ADMIN RESET
   ========================================================= */

const ADMIN_PIN = "1909";

let adminMode = false;

function enableAdminMode() {
  const pin = prompt("Admin PIN:");

  if (pin !== ADMIN_PIN) {
    alert("Incorrect PIN.");
    return;
  }

  adminMode = true;
  renderAttendance();

  alert("Admin mode enabled.");
}

document.addEventListener("keydown", function(event) {
  if (
    event.ctrlKey &&
    event.shiftKey &&
    event.key.toLowerCase() === "a"
  ) {
    event.preventDefault();
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

  let attended = 0;
  let total = 0;

  for (const subject in data) {
    attended += data[subject].attended;
    total += data[subject].total;
  }

  const overall = percentage(attended, total);
  const today = new Date();
  const todayKey = dateKey(today);

  let todayClasses = [];

  if (
    todayKey >= ATTENDANCE_START &&
    todayKey <= ATTENDANCE_CUTOFF
  ) {
    todayClasses = getClassesForDate(today);
  }

  const todayRecords = state.attendanceRecords[todayKey] || {};
  let markedToday = 0;

  todayClasses.forEach(lesson => {
    const subject = lesson[2];
    let status = "";

    if (Array.isArray(todayRecords)) {
      const record = todayRecords.find(item =>
        item.subject === subject &&
        (item.status === "present" || item.status === "absent")
      );

      status = record ? record.status : "";
    } else {
      status = todayRecords[subject] || "";
    }

    if (status === "present" || status === "absent") {
      markedToday++;
    }
  });

  let html = `
  <div class="attendance-greeting">
  <div class="attendance-greeting-title">Hey, Avni Parmar 👋</div>
  <div class="attendance-greeting-subtitle">Here's your attendance overview</div>
</div>
    <div class="card overall-card">
      <div class="overall-title">Overall Attendance</div>

      <div class="overall-number">${overall.toFixed(2)}%</div>

      <div class="progress">
        <div
          class="progress-fill"
          style="width:${Math.min(overall, 100)}%"
        ></div>
      </div>

      <div class="subject-info">
        <span>${attended} attended / ${total} total</span>
      </div>
    </div>
  `;

  if (todayClasses.length > 0) {
    html += `
      <button
        class="today-attendance-card"
        onclick="openAttendanceModal('${todayKey}')"
      >
        <div class="today-attendance-left">
          <div class="today-attendance-label">TODAY'S ATTENDANCE</div>
          <div class="today-attendance-title">Mark today's classes</div>
          <div class="today-attendance-meta">
            ${todayClasses.length} classes · ${markedToday}/${todayClasses.length} marked
          </div>
        </div>

        <div class="today-attendance-arrow">→</div>
      </button>
    `;
  }

  html += `
    <button
      class="predictor-button"
      onclick="openPredictor()"
    >📊 Attendance Predictor</button>
  `;

  for (const subject in data) {
    const a = data[subject].attended;
    const t = data[subject].total;
    const p = percentage(a, t);

    let cls = "danger";

    if (p >= 75) {
      cls = "good";
    } else if (p >= 70) {
      cls = "warning";
    }

    html += `
      <div class="card">
        <div class="subject-header">
          <div class="subject-name">${prettySubject(subject)}</div>
          <div class="percentage ${cls}">${p.toFixed(2)}%</div>
        </div>

        <div class="progress">
          <div
            class="progress-fill"
            style="width:${Math.min(p, 100)}%"
          ></div>
        </div>

        <div class="subject-info">
          <span>${a} / ${t}</span>
        </div>
      </div>
    `;
  }

  if (adminMode) {
    html += `
      <button
        class="reset-attendance-button"
        onclick="resetAttendance()"
      >Reset Test Attendance</button>
    `;
  }

  page.innerHTML = html;
}

/* =========================
   CALENDAR
   ========================= */

let calendarDate = new Date(2026, 9, 1);

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

    <button
      class="secondary-button calendar-timetable-button"
      onclick="openTimetableManager()"
    >📷 Update timetable</button>

    <div class="card">
      <div class="weekdays">
        ${DAY_NAMES.map(day => `
          <div class="weekday">${day.substring(0, 3)}</div>
        `).join("")}
      </div>

      <div class="calendar-grid">
  `;

  for (let index = 0; index < first.getDay(); index++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  for (let day = 1; day <= last.getDate(); day++) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const classes = getClassesForDate(date);
    const holiday = HOLIDAYS[key];
    const today = key === dateKey(new Date());

    html += `
      <button
        class="calendar-day ${today ? "today" : ""} ${holiday ? "holiday" : ""}"
        onclick="openDay('${key}')"
      >
        <div class="day-number">${day}</div>

        ${holiday ? `<div class="day-label">${holiday}</div>` : ""}

        ${classes.length ? `<div class="class-dot"></div>` : ""}
      </button>
    `;
  }

  html += `
      </div>
    </div>

    <div id="selectedDay"></div>
  `;

  page.innerHTML = html;
}

function changeMonth(amount) {
  calendarDate = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + amount,
    1
  );

  renderCalendar();
}

function openDay(key) {
  const date = parseDate(key);
  const classes = getClassesForDate(date);
  const holiday = HOLIDAYS[key];

  let html = `
    <div class="card">
      <div class="subject-header">
        <div class="subject-name">
          ${date.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long"
          })}
        </div>

        <div class="percentage">${classes.length}</div>
      </div>
  `;

  if (holiday) {
    html += `
      <div style="margin-top:10px;color:#ff9ba4;font-size:13px">
        Holiday: ${holiday}
      </div>
    `;
  }

  if (!classes.length) {
    html += `
      <div style="margin-top:14px;color:var(--muted);font-size:13px">
        No classes scheduled.
      </div>
    `;
  }

  if (classes.length) {
    html += `<div class="class-list">`;

    for (const lesson of classes) {
      html += `
        <div class="class-item">
          <div class="class-time">${lesson[0]}<br>${lesson[1]}</div>
          <div class="class-name">${prettySubject(lesson[2])}</div>
        </div>
      `;
    }

    html += `</div>`;

    if (key >= ATTENDANCE_START && key <= ATTENDANCE_CUTOFF) {
      html += `
        <button
          class="primary-button"
          onclick="openAttendanceModal('${key}')"
        >Mark Attendance</button>
      `;
    }
  }

  html += `</div>`;

  document.getElementById("selectedDay").innerHTML = html;
}

/* =========================
   ATTENDANCE MODAL
   ========================= */

function openAttendanceModal(key) {
  const date = parseDate(key);
  const classes = getClassesForDate(date);

  if (!classes.length) return;

  const existing = state.attendanceRecords[key] || {};
  let existingMap = {};

  if (Array.isArray(existing)) {
    existing.forEach(record => {
      if (record.subject) {
        existingMap[record.subject] = record.status;
      }
    });
  } else {
    existingMap = existing;
  }

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
          <button
            type="button"
            class="attendance-choice present-choice ${current === "present" ? "selected" : ""}"
            data-index="${index}"
            data-subject="${subject}"
            data-status="present"
            onclick="setAttendanceChoice(this,'present')"
          >Present</button>

          <button
            type="button"
            class="attendance-choice absent-choice ${current === "absent" ? "selected" : ""}"
            data-index="${index}"
            data-subject="${subject}"
            data-status="absent"
            onclick="setAttendanceChoice(this,'absent')"
          >Absent</button>
        </div>
      </div>
    `;
  });

  const modal = document.getElementById("modal");

  if (!modal) return;

  modal.innerHTML = `
    <div class="predictor-overlay" onclick="closeModal(event)">
      <div
        class="predictor-modal attendance-modal"
        onclick="event.stopPropagation()"
      >
        <div class="predictor-top">
          <div>
            <h2>Mark Attendance</h2>
            <div class="cutoff">${formatDisplayDate(key)}</div>
          </div>

          <button class="close-button" onclick="closeModal()">×</button>
        </div>

        <div class="attendance-helper">
          Tap Present or Absent for each class.
        </div>

        <div class="attendance-class-list">${rows}</div>

        <div class="attendance-modal-actions">
          <button
            type="button"
            class="all-present-button"
            onclick="markAllPresent()"
          >All Present</button>

          <button
            type="button"
            class="save-attendance-button"
            onclick="saveAttendance('${key}')"
          >Save Attendance</button>
        </div>
      </div>
    </div>
  `;
}

function setAttendanceChoice(button, status) {
  const row = button.closest(".attendance-class-row");

  if (!row) return;

  row.querySelectorAll(".attendance-choice").forEach(choice => {
    choice.classList.remove("selected");
  });

  button.classList.add("selected");
}

function markAllPresent() {
  document.querySelectorAll(".attendance-class-row .present-choice")
    .forEach(button => {
      const row = button.closest(".attendance-class-row");

      if (!row) return;

      row.querySelectorAll(".attendance-choice").forEach(choice => {
        choice.classList.remove("selected");
      });

      button.classList.add("selected");
    });
}

function saveAttendance(key) {
  const rows = document.querySelectorAll(".attendance-class-row");
  const classes = getClassesForDate(parseDate(key));
  const records = {};

  rows.forEach((row, index) => {
    const selected = row.querySelector(".attendance-choice.selected");

    if (!selected) return;

    const subject = classes[index][2];
    records[subject] = selected.dataset.status;
  });

  if (Object.keys(records).length > 0) {
    state.attendanceRecords[key] = records;
  }

  saveState();
  closeModal();
  renderAttendance();
  renderCalendar();
}

/* =========================
   RESET TEST ATTENDANCE
   ========================= */

function resetAttendance() {
  if (!adminMode) {
    alert("Admin access required.");
    return;
  }

  const confirmed = confirm(
    "Reset all attendance entered on this website?\n\n" +
    "This will remove test entries and restore the original attendance."
  );

  if (!confirmed) return;

  state.attendanceRecords = {};

  saveState();
  renderAttendance();
  renderCalendar();
}

/* =========================
   PREDICTOR
   ========================= */

let predictorMonth = 9;
let predictorChoices = {};

function getPredictorDays() {
  return getFutureClasses().filter(item =>
    item.date.getMonth() === predictorMonth
  );
}

function getPredictorChoice(key) {
  return predictorChoices[key] || "attending";
}

function cyclePredictorDay(key) {
  const current = getPredictorChoice(key);

  if (current === "attending") {
    predictorChoices[key] = "absent";
  } else if (current === "absent") {
    predictorChoices[key] = "ignored";
  } else {
    predictorChoices[key] = "attending";
  }

  renderPredictor();
}

function renderPredictor() {
  const days = getPredictorDays();
  const prediction = getPrediction(predictorChoices);

  let totalA = 0;
  let totalT = 0;

  for (const subject in prediction) {
    totalA += prediction[subject].attended;
    totalT += prediction[subject].total;
  }

  const overall = percentage(totalA, totalT);

  let html = `
    <div class="predictor-overlay">
      <div
        class="predictor-modal"
        onclick="event.stopPropagation()"
      >
        <div class="predictor-top">
          <div>
            <h2>Attendance Predictor</h2>
            <div class="cutoff">
              Attendance counted until 25 November 2026
            </div>
          </div>

          <button class="close-button" onclick="closePredictor()">×</button>
        </div>

        <div class="predictor-controls">
          <div class="predictor-month">${MONTH_NAMES[predictorMonth]} 2026</div>

          <div class="predictor-nav">
            <button onclick="changePredictorMonth(-1)">‹</button>
            <button onclick="changePredictorMonth(1)">›</button>
          </div>
        </div>

        <div class="month-filter">
          <button
            class="${predictorMonth === 9 ? "active" : ""}"
            onclick="setPredictorMonth(9)"
          >October</button>

          <button
            class="${predictorMonth === 10 ? "active" : ""}"
            onclick="setPredictorMonth(10)"
          >November</button>
        </div>

        <div class="info-box">
          Tap a class day to cycle between:
          <b>Attending</b> →
          <b style="color:var(--red)">Not Attending</b> →
          <b>Ignored</b>.

          <br><br>

          The prediction stops at <b>25 November 2026</b>.
        </div>

        <div class="predictor-summary">
          <div class="predicted-label">PREDICTED OVERALL ATTENDANCE</div>
          <div class="predicted-number">${overall.toFixed(2)}%</div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <span class="legend-dot legend-attending"></span>
            Attending
          </div>

          <div class="legend-item">
            <span class="legend-dot legend-absent"></span>
            Not Attending
          </div>

          <div class="legend-item">
            <span class="legend-dot legend-ignored"></span>
            Ignored
          </div>
        </div>

        <div class="predictor-days">
  `;

  for (const item of days) {
    const key = item.key;
    const choice = getPredictorChoice(key);
    const date = item.date;

    html += `
      <button
        class="predictor-day ${choice}"
        onclick="cyclePredictorDay('${key}')"
      >
        <div class="date">${date.getDate()}</div>

        <div class="weekday">
          ${DAY_NAMES[date.getDay()].substring(0, 3).toUpperCase()}
        </div>
      </button>
    `;
  }

  html += `</div>`;

  for (const subject in prediction) {
    const attended = prediction[subject].attended;
    const total = prediction[subject].total;
    const p = percentage(attended, total);

    const remaining = countRemainingSubjectClasses(
      subject,
      predictorChoices
    );

    const canMiss = calculateCanMiss(attended, total, remaining);
    const mustAttend = calculateMustAttend(attended, total, remaining);

    let cls = "forecast-danger";

    if (p >= 75) {
      cls = "forecast-good";
    } else if (p >= 70) {
      cls = "forecast-warning";
    }

    let advice;

    if (p >= 75) {
      advice = `You can miss ${canMiss} more ${canMiss === 1 ? "class" : "classes"} and still finish at 75%+`;
    } else if (mustAttend !== null) {
      advice = `Need to attend ${mustAttend} of the ${remaining} remaining`;
    } else {
      advice = "75% is not reachable by 25 Nov";
    }

    html += `
      <div class="subject-forecast">
        <div class="forecast-header">
          <div class="forecast-subject">${prettySubject(subject)}</div>
          <div class="forecast-percent ${cls}">${p.toFixed(2)}%</div>
        </div>

        <div class="forecast-details">
          <span>${attended} / ${total}</span>
          <span>${remaining} classes remaining</span>
        </div>

        <div class="forecast-details ${cls}" style="margin-top:6px">
          ${advice}
        </div>
      </div>
    `;
  }

  const selectedAbsent = Object.keys(predictorChoices).filter(
    key => predictorChoices[key] === "absent"
  );

  if (selectedAbsent.length) {
    html += `
      <div class="what-if">
        <div class="what-if-title">If you skip the selected day(s)</div>
    `;

    const current = getActualAttendance();
    const skippedBySubject = {};

    for (const key of selectedAbsent) {
      const date = parseDate(key);
      const classes = getClassesForDate(date);

      for (const lesson of classes) {
        const subject = lesson[2];

        skippedBySubject[subject] =
          (skippedBySubject[subject] || 0) + 1;
      }
    }

    for (const subject in current) {
      const attended = current[subject].attended;
      const total = current[subject].total;
      const currentP = percentage(attended, total);
      const skipped = skippedBySubject[subject] || 0;

      if (skipped === 0) {
        html += `
          <div class="what-if-row">
            <span>${prettySubject(subject)}</span>
            <span>
              ${currentP.toFixed(2)}% → ${currentP.toFixed(2)}%
              <small style="color:var(--muted)">(no class)</small>
            </span>
          </div>
        `;

        continue;
      }

      const afterSkipP = percentage(attended, total + skipped);
      const reduction = currentP - afterSkipP;

      html += `
        <div class="what-if-row">
          <span>${prettySubject(subject)}</span>
          <span class="forecast-danger">
            ${currentP.toFixed(2)}% → ${afterSkipP.toFixed(2)}%
            <small>(-${reduction.toFixed(2)}%)</small>
          </span>
        </div>
      `;
    }

    html += `
        <div style="margin-top:10px;color:var(--muted);font-size:10px">
          This shows your current attendance and exactly how much
          it drops from skipping the selected day(s).
        </div>
      </div>
    `;
  }

  html += `
        <button
          class="secondary-button"
          style="margin-top:12px"
          onclick="resetPredictor()"
        >Reset prediction</button>
      </div>
    </div>
  `;

  document.getElementById("modal").innerHTML = html;
}

function openPredictor() {
  predictorChoices = {};
  predictorMonth = 9;
  renderPredictor();
}

function closePredictor() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.innerHTML = "";
  }
}

function resetPredictor() {
  predictorChoices = {};
  renderPredictor();
}

function changePredictorMonth(amount) {
  predictorMonth += amount;

  if (predictorMonth < 9) predictorMonth = 9;
  if (predictorMonth > 10) predictorMonth = 10;

  renderPredictor();
}

function setPredictorMonth(month) {
  predictorMonth = month;
  renderPredictor();
}

/* =========================
   MODAL
   ========================= */

function closeModal(event) {
  if (
    event &&
    event.target &&
    !event.target.classList.contains("predictor-overlay")
  ) {
    return;
  }

  const modal = document.getElementById("modal");

  if (modal) {
    modal.innerHTML = "";
  }
}

/* =========================
   MESS MENU + PHOTO OCR
   ========================= */

let messDate = new Date();

const MESS_STORAGE_KEY = "iiuler_mess_menu_v1";
let savedMessMenu = null;

try {
  savedMessMenu = JSON.parse(localStorage.getItem(MESS_STORAGE_KEY) || "null");
} catch (error) {
  savedMessMenu = null;
}

const MESS_MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" }
];

function escapeMessHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getMessMenu(date) {
  const day = DAY_NAMES[date.getDay()].toLowerCase();
  if (savedMessMenu && savedMessMenu[day]) return savedMessMenu[day];
  return OCTOBER_MENU[day] || null;
}

function renderMess() {
  const page = document.getElementById("messPage");
  if (!page) return;

  const menu = getMessMenu(messDate);
  const dayName = DAY_NAMES[messDate.getDay()];
  const dayKey = dayName.toLowerCase();

  let html = `
    <div class="mess-topline">
      <div>
        <p class="eyebrow">DAILY DINING</p>
        <h2 class="mess-heading">What's on the menu?</h2>
      </div>
      <button class="mess-edit-button" onclick="openMessMenuManager()">
        <span>＋</span> Update
      </button>
    </div>
    <div class="mess-date-picker">
      <button class="month-button" onclick="changeMessDate(-1)" aria-label="Previous day">‹</button>
      <div class="mess-date-center">
        <div class="mess-current-day">${dayName}</div>
        <div class="mess-current-date">${messDate.toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric"
        })}</div>
      </div>
      <button class="month-button" onclick="changeMessDate(1)" aria-label="Next day">›</button>
    </div>`;

  if (!menu) {
    page.innerHTML = html + `<div class="card">No menu available for this day.</div>`;
    return;
  }

  const mealIcons = { breakfast: "☀", lunch: "◒", snacks: "☕", dinner: "☾" };
  html += `<div class="mess-meal-grid">`;

  for (const meal of MESS_MEALS) {
    const items = Array.isArray(menu[meal.key]) ? menu[meal.key] : [];
    html += `
      <article class="mess-meal-card">
        <div class="mess-meal-top">
          <div class="mess-meal-icon">${mealIcons[meal.key]}</div>
          <div><h3>${meal.label === "snacks" ? "Evening snacks" : meal.label}</h3>
          <p>${({ breakfast: "Morning", lunch: "Afternoon", snacks: "Evening", dinner: "Night" })[meal.key]}</p></div>
        </div>
        ${items.length
          ? `<ul class="mess-food-list">${items.map(item => `<li>${escapeMessHTML(item)}</li>`).join("")}</ul>`
          : `<p class="mess-empty">Menu not added yet.</p>`}
      </article>`;
  }

  html += `</div>`;
  if (savedMessMenu && savedMessMenu[dayKey]) {
    html += `<p class="mess-saved-note"><span>●</span> Updated menu saved on this device</p>`;
  }
  page.innerHTML = html;
}

function changeMessDate(amount) {
  messDate = new Date(messDate.getFullYear(), messDate.getMonth(), messDate.getDate() + amount);
  renderMess();
}

function openMessMenuManager() {
  const draft = {};

  for (const day of DAY_NAMES) {
    const key = day.toLowerCase();
    const existing = (savedMessMenu && savedMessMenu[key]) || OCTOBER_MENU[key] || {};
    draft[key] = {};
    for (const meal of MESS_MEALS) {
      draft[key][meal.key] = Array.isArray(existing[meal.key]) ? existing[meal.key].join("\n") : "";
    }
  }

  let fields = "";
  for (const day of DAY_NAMES) {
    const key = day.toLowerCase();
    fields += `<section class="mess-editor-day"><h3>${day}</h3>`;
    for (const meal of MESS_MEALS) {
      fields += `
        <label class="mess-editor-field">
          <span>${meal.label}</span>
          <textarea rows="3" data-menu-day="${key}" data-menu-meal="${meal.key}"
            placeholder="One food item per line">${escapeMessHTML(draft[key][meal.key])}</textarea>
        </label>`;
    }
    fields += `</section>`;
  }

  document.getElementById("modal").innerHTML = `
    <div class="predictor-overlay mess-editor-overlay" onclick="closeMessMenuManager(event)">
      <div class="predictor-modal mess-editor-modal" onclick="event.stopPropagation()">
        <div class="predictor-top">
          <div><p class="eyebrow">MESS SETTINGS</p><h2>Update menu</h2>
          <p class="mess-subtitle">Upload a photo, review the text, then save.</p></div>
          <button class="close-button" onclick="closeMessMenuManager()">×</button>
        </div>
        <label class="mess-upload-area" for="messMenuPhoto">
          <span class="mess-upload-symbol">↑</span>
          <strong>Upload menu photo</strong><span>JPG, PNG or WEBP</span>
          <input type="file" id="messMenuPhoto" accept="image/*" onchange="readMessMenuPhoto(event)">
        </label>
        <div id="messOcrStatus" class="mess-ocr-status" aria-live="polite">
          Your current menu is loaded below. You can edit it manually too.
        </div>
        <div id="messMenuEditorFields">${fields}</div>
        <div class="mess-editor-actions">
          <button class="secondary-button" onclick="closeMessMenuManager()">Cancel</button>
          <button class="primary-button" onclick="saveMessMenu()">Save menu</button>
        </div>
      </div>
    </div>`;
}

function closeMessMenuManager(event) {
  if (event && event.target && !event.target.classList.contains("mess-editor-overlay")) return;
  const modal = document.getElementById("modal");
  if (modal) modal.innerHTML = "";
}

function parseMessOCR(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(line => line.replace(/[•·▪●]/g, "").trim())
    .filter(Boolean);

  const result = {};
  for (const day of DAY_NAMES) {
    result[day.toLowerCase()] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
  }

  const dayPattern = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const mealPattern = /\b(breakfast|lunch|snacks?|tea|dinner)\b/i;
  let currentDay = "";
  let currentMeal = "";

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[\d.\-:]+\s*/, "").trim();
    const dayMatch = line.match(dayPattern);
    if (dayMatch) {
      currentDay = dayMatch[1].toLowerCase();
      const remainder = line.slice(dayMatch[0].length).replace(/^[:\-|,\s]+/, "").trim();
      if (!remainder) continue;
      const mealMatch = remainder.match(mealPattern);
      if (mealMatch) {
        currentMeal = mealMatch[1].toLowerCase().startsWith("break") ? "breakfast"
          : mealMatch[1].toLowerCase().startsWith("lunch") ? "lunch"
          : mealMatch[1].toLowerCase().startsWith("snack") || mealMatch[1].toLowerCase() === "tea" ? "snacks"
          : "dinner";
        const item = remainder.slice(mealMatch.index + mealMatch[0].length).replace(/^[:\-|,\s]+/, "").trim();
        if (item) result[currentDay][currentMeal].push(item);
      } else if (currentMeal && remainder) {
        result[currentDay][currentMeal].push(remainder);
      }
      continue;
    }

    const mealMatch = line.match(mealPattern);
    if (mealMatch && currentDay) {
      currentMeal = mealMatch[1].toLowerCase().startsWith("breakfast") ? "breakfast"
        : mealMatch[1].toLowerCase().startsWith("lunch") ? "lunch"
        : mealMatch[1].toLowerCase().startsWith("snack") || mealMatch[1].toLowerCase() === "tea" ? "snacks"
        : "dinner";
      const item = line.slice(mealMatch.index + mealMatch[0].length).replace(/^[:\-|,\s]+/, "").trim();
      if (item) result[currentDay][currentMeal].push(item);
      continue;
    }

    if (currentDay && currentMeal && !/^(menu|items|food|day|date)$/i.test(line)) {
      result[currentDay][currentMeal].push(line.replace(/^[-•*]\s*/, ""));
    }
  }

  return result;
}

async function readMessMenuPhoto(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Please upload a menu image.");
    return;
  }

  const status = document.getElementById("messOcrStatus");
  if (!status) return;

  if (!window.Tesseract) {
    status.textContent = "OCR library did not load. You can still edit the menu manually.";
    return;
  }

  status.textContent = "Reading the menu photo… this can take a little while.";
  try {
    const result = await Tesseract.recognize(file, "eng", {
      logger: message => {
        if (message.status === "recognizing text") {
          const percent = Math.round((message.progress || 0) * 100);
          const node = document.getElementById("messOcrStatus");
          if (node) node.textContent = `Reading menu photo… ${percent}%`;
        }
      }
    });

    const parsed = parseMessOCR(result.data.text || "");
    let populated = 0;

    for (const day of DAY_NAMES) {
      const key = day.toLowerCase();
      for (const meal of MESS_MEALS) {
        const items = parsed[key][meal.key];
        if (!items.length) continue;
        const field = document.querySelector(`[data-menu-day="${key}"][data-menu-meal="${meal.key}"]`);
        if (field) {
          field.value = items.join("\n");
          populated += items.length;
        }
      }
    }

    status.textContent = populated
      ? `Text extracted. ${populated} line(s) were placed into matching day/meal fields where recognizable. Review everything carefully before saving.`
      : "The text was read, but days and meal headings could not be reliably matched. Please enter the items manually below.";
  } catch (error) {
    console.error("Mess OCR failed:", error);
    status.textContent = "Could not read this photo. Try a clearer, well-lit image or edit the menu manually.";
  }
}


async function saveMessMenu() {
  const menu = {};

  for (const day of DAY_NAMES) {
    const key = day.toLowerCase();
    menu[key] = {};

    for (const meal of MESS_MEALS) {
      const field = document.querySelector(
        `[data-menu-day="${key}"][data-menu-meal="${meal.key}"]`
      );

      menu[key][meal.key] = field
        ? field.value.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
        : [];
    }
  }

  try {
    localStorage.setItem(MESS_STORAGE_KEY, JSON.stringify(menu));
    savedMessMenu = menu;

    await cloudWrite("mess", menu);

    closeMessMenuManager();
    renderMess();
    alert("Mess menu saved successfully.");
  } catch (error) {
    console.error("Could not save mess menu:", error);
    alert("Could not save the menu. Please check the console.");
  }
}

/* =========================
   NAVIGATION
   ========================= */

function changePage(page) {
  document.querySelectorAll(".page").forEach(element => {
    element.classList.remove("active");
  });

  document.querySelectorAll(".nav-button").forEach(element => {
    element.classList.remove("active");
  });

  const target = document.getElementById(`${page}Page`);

  const nav = document.getElementById(
    `nav${page.charAt(0).toUpperCase()}${page.slice(1)}`
  );

  if (target) target.classList.add("active");
  if (nav) nav.classList.add("active");

  const titles = {
    attendance: "Attendance",
    calendar: "Calendar",
    mess: "Mess"
  };

  const title = document.getElementById("pageTitle");

  if (title) {
    title.textContent = titles[page];
  }

  if (page === "attendance") renderAttendance();
  if (page === "calendar") renderCalendar();
  if (page === "mess") renderMess();
}

function goToday() {
  calendarDate = new Date();
  messDate = new Date();

  changePage("calendar");

  setTimeout(() => {
    openDay(dateKey(new Date()));
  }, 30);
}

/* =========================
   INITIALIZE
   ========================= */

startCloudApp();

/* Refresh live timetable status periodically while the app is open. */
setInterval(() => {
  const attendancePage = document.getElementById("attendancePage");
  if (attendancePage && attendancePage.classList.contains("active")) {
    renderAttendance();
  }
}, 60000);
