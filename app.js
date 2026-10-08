/* =========================================================
   IIULER ATTENDANCE APP
   ========================================================= */

/* =========================
   CURRENT ATTENDANCE
   ========================= */

const SUBJECTS = {
  "Legal Methods": { attended: 12, total: 21 },
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

const HOLIDAYS = {
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
   TIMETABLE
   ========================= */

const TIMETABLE = {
  1: [
    ["09:55", "10:45", "Principles of Management"],
    ["10:50", "11:40", "Principles of Management"],
    ["12:00", "12:50", "Law of Torts"],
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
    ["10:50", "11:40", "Law of Torts"],
    ["12:00", "12:50", "Economics I"],
    ["12:55", "13:35", "Economics I"],
    ["14:30", "15:20", "Principles of Management"],
    ["15:25", "16:15", "Principles of Management"]
  ],

  4: [
    ["09:55", "10:45", "Economics I"],
    ["10:50", "11:40", "English I"],
    ["12:00", "12:50", "English I"],
    ["12:55", "13:35", "Law of Torts"],
    ["14:30", "15:20", "Marketing Management"],
    ["15:25", "16:15", "Marketing Management"]
  ],

  5: [
    ["09:55", "10:45", "Economics I"],
    ["10:50", "11:40", "Legal Methods"],
    ["12:00", "12:50", "English I"],
    ["12:55", "13:35", "Principles of Management"],
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
} catch (e) {
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
}


/* =========================
   TIMETABLE
   ========================= */

function getClassesForDate(date) {
  const key = dateKey(date);
  const day = date.getDay();

  if (day === 0 || day === 6) return [];
  if (HOLIDAYS[key]) return [];
  if (key < "2026-09-28") return [];

  return TIMETABLE[day] || [];
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
    if (
      key < ATTENDANCE_START ||
      key > ATTENDANCE_CUTOFF
    ) {
      continue;
    }

    const records =
      state.attendanceRecords[key] || {};

    if (Array.isArray(records)) {
      for (const record of records) {
        if (!result[record.subject]) continue;

        if (
          record.status === "present" ||
          record.status === "absent"
        ) {
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

        if (
          status === "present" ||
          status === "absent"
        ) {
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
  const records =
    state.attendanceRecords[key];

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

  let date =
    parseDate(ATTENDANCE_START);

  const cutoff =
    parseDate(ATTENDANCE_CUTOFF);

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

    date.setDate(
      date.getDate() + 1
    );
  }

  return days;
}

function getPrediction(dayChoices = {}) {
  const actual =
    getActualAttendance();

  const result = {};

  for (const subject in actual) {
    result[subject] = {
      attended: actual[subject].attended,
      total: actual[subject].total
    };
  }

  for (const item of getFutureClasses()) {
    const key = item.key;

    if (hasAttendanceRecord(key)) {
      continue;
    }

    const choice =
      dayChoices[key] || "attending";

    if (choice === "ignored") {
      continue;
    }

    for (const cls of item.classes) {
      const subject = cls[2];

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

function calculateCanMiss(
  attended,
  total,
  remaining
) {
  let maxMiss = 0;

  for (
    let missed = 0;
    missed <= remaining;
    missed++
  ) {
    const futureAttended =
      attended +
      (remaining - missed);

    const futureTotal =
      total + remaining;

    if (
      percentage(
        futureAttended,
        futureTotal
      ) >= 75
    ) {
      maxMiss = missed;
    }
  }

  return maxMiss;
}

function calculateMustAttend(
  attended,
  total,
  remaining
) {
  let mustAttend = 0;

  while (
    mustAttend <= remaining &&
    percentage(
      attended + mustAttend,
      total + remaining
    ) < 75
  ) {
    mustAttend++;
  }

  if (
    percentage(
      attended + mustAttend,
      total + remaining
    ) < 75
  ) {
    return null;
  }

  return mustAttend;
}

function countRemainingSubjectClasses(
  subject,
  choices
) {
  let count = 0;

  for (const item of getFutureClasses()) {
    const key = item.key;

    if (hasAttendanceRecord(key)) {
      continue;
    }

    const choice =
      choices[key] || "attending";

    if (choice === "ignored") {
      continue;
    }

    for (const cls of item.classes) {
      if (cls[2] === subject) {
        count++;
      }
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


/* SECRET ADMIN SHORTCUT
   Ctrl + Shift + A
*/

document.addEventListener("keydown", function (event) {

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
  const page =
    document.getElementById(
      "attendancePage"
    );

  if (!page) return;

  const data =
    getActualAttendance();

  let attended = 0;
  let total = 0;

  for (const subject in data) {
    attended += data[subject].attended;
    total += data[subject].total;
  }

  const overall =
    percentage(attended, total);

  const today = new Date();
  const todayKey = dateKey(today);

  let todayClasses = [];

  if (
    todayKey >= ATTENDANCE_START &&
    todayKey <= ATTENDANCE_CUTOFF
  ) {
    todayClasses =
      getClassesForDate(today);
  }

  const todayRecords =
    state.attendanceRecords[todayKey] || {};

  let markedToday = 0;

  todayClasses.forEach(cls => {
    const subject = cls[2];
    let status = "";

    if (Array.isArray(todayRecords)) {
      const record =
        todayRecords.find(r =>
          r.subject === subject &&
          (
            r.status === "present" ||
            r.status === "absent"
          )
        );

      status =
        record ? record.status : "";
    } else {
      status =
        todayRecords[subject] || "";
    }

    if (
      status === "present" ||
      status === "absent"
    ) {
      markedToday++;
    }
  });

  let html = `
    <div class="card overall-card">

      <div class="overall-title">
        Overall Attendance
      </div>

      <div class="overall-number">
        ${overall.toFixed(2)}%
      </div>

      <div class="progress">
        <div
          class="progress-fill"
          style="width:${Math.min(overall, 100)}%"
        ></div>
      </div>

      <div class="subject-info">
        <span>
          ${attended} attended / ${total} total
        </span>
      </div>

    </div>
  `;


  /* TODAY CARD */

  if (todayClasses.length > 0) {

    html += `
      <button
        class="today-attendance-card"
        onclick="openAttendanceModal('${todayKey}')"
      >

        <div class="today-attendance-left">

          <div class="today-attendance-label">
            TODAY'S ATTENDANCE
          </div>

          <div class="today-attendance-title">
            Mark today's classes
          </div>

          <div class="today-attendance-meta">
            ${todayClasses.length} classes ·
            ${markedToday}/${todayClasses.length} marked
          </div>

        </div>

        <div class="today-attendance-arrow">
          →
        </div>

      </button>
    `;

  } else if (
    todayKey >= ATTENDANCE_START &&
    todayKey <= ATTENDANCE_CUTOFF
  ) {

    html += `
      <div class="today-status-card">

        <div class="today-attendance-left">

          <div class="today-attendance-label">
            TODAY
          </div>

          <div class="today-attendance-title">
            No classes today
          </div>

          <div class="today-attendance-meta">
            No attendance to mark today.
          </div>

        </div>

      </div>
    `;
  }


  /* PREDICTOR */

  html += `
    <button
      class="predictor-button"
      onclick="openPredictor()"
    >
      📊 Attendance Predictor
    </button>
  `;


  /* SUBJECT CARDS */

  for (const subject in data) {
    const a =
      data[subject].attended;

    const t =
      data[subject].total;

    const p =
      percentage(a, t);

    let cls = "danger";

    if (p >= 75) {
      cls = "good";
    } else if (p >= 70) {
      cls = "warning";
    }

    html += `
      <div class="card">

        <div class="subject-header">

          <div class="subject-name">
            ${prettySubject(subject)}
          </div>

          <div class="percentage ${cls}">
            ${p.toFixed(2)}%
          </div>

        </div>

        <div class="progress">

          <div
            class="progress-fill"
            style="width:${Math.min(p, 100)}%"
          ></div>

        </div>

        <div class="subject-info">
          <span>
            ${a} / ${t}
          </span>
        </div>

      </div>
    `;
  }


  /* RESET BUTTON */

  if (adminMode) {
    html += `
      <button
        class="reset-attendance-button"
        onclick="resetAttendance()"
      >
        Reset Test Attendance
      </button>
    `;
  }


  page.innerHTML = html;
}


/* =========================
   CALENDAR
   ========================= */

let calendarDate =
  new Date(2026, 9, 1);

function renderCalendar() {
  const page =
    document.getElementById(
      "calendarPage"
    );

  if (!page) return;

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const first =
    new Date(year, month, 1);

  const last =
    new Date(year, month + 1, 0);

  let html = `
    <div class="calendar-toolbar">

      <button
        class="month-button"
        onclick="changeMonth(-1)"
      >
        ‹
      </button>

      <div class="month-title">
        ${MONTH_NAMES[month]} ${year}
      </div>

      <button
        class="month-button"
        onclick="changeMonth(1)"
      >
        ›
      </button>

    </div>

    <div class="card">

      <div class="weekdays">

        ${DAY_NAMES.map(d => `
          <div class="weekday">
            ${d.substring(0, 3)}
          </div>
        `).join("")}

      </div>

      <div class="calendar-grid">
  `;

  for (
    let i = 0;
    i < first.getDay();
    i++
  ) {
    html += `
      <div class="calendar-day empty"></div>
    `;
  }

  for (
    let day = 1;
    day <= last.getDate();
    day++
  ) {
    const date =
      new Date(
        year,
        month,
        day
      );

    const key =
      dateKey(date);

    const classes =
      getClassesForDate(date);

    const holiday =
      HOLIDAYS[key];

    const today =
      key === dateKey(new Date());

    html += `
      <button
        class="
          calendar-day
          ${today ? "today" : ""}
          ${holiday ? "holiday" : ""}
        "
        onclick="openDay('${key}')"
      >

        <div class="day-number">
          ${day}
        </div>

        ${
          holiday
            ? `<div class="day-label">${holiday}</div>`
            : ""
        }

        ${
          classes.length
            ? `<div class="class-dot"></div>`
            : ""
        }

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
  calendarDate =
    new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + amount,
      1
    );

  renderCalendar();
}

function openDay(key) {
  const date =
    parseDate(key);

  const classes =
    getClassesForDate(date);

  const holiday =
    HOLIDAYS[key];

  let html = `
    <div class="card">

      <div class="subject-header">

        <div class="subject-name">
          ${date.toLocaleDateString(
            "en-IN",
            {
              weekday: "long",
              day: "numeric",
              month: "long"
            }
          )}
        </div>

        <div class="percentage">
          ${classes.length}
        </div>

      </div>
  `;

  if (holiday) {
    html += `
      <div
        style="
          margin-top:10px;
          color:#ff9ba4;
          font-size:13px;
        "
      >
        Holiday: ${holiday}
      </div>
    `;
  }

  if (!classes.length) {
    html += `
      <div
        style="
          margin-top:14px;
          color:var(--muted);
          font-size:13px;
        "
      >
        No classes scheduled.
      </div>
    `;
  }

  if (classes.length) {
    html += `
      <div class="class-list">
    `;

    for (const item of classes) {
      html += `
        <div class="class-item">

          <div class="class-time">
            ${item[0]}<br>${item[1]}
          </div>

          <div class="class-name">
            ${prettySubject(item[2])}
          </div>

        </div>
      `;
    }

    html += `
      </div>
    `;

    if (
      key >= ATTENDANCE_START &&
      key <= ATTENDANCE_CUTOFF
    ) {
      html += `
        <button
          class="primary-button"
          onclick="openAttendanceModal('${key}')"
        >
          Mark Attendance
        </button>
      `;
    }
  }

  html += `
    </div>
  `;

  document.getElementById(
    "selectedDay"
  ).innerHTML = html;
}


/* =========================
   ATTENDANCE MODAL
   ========================= */

function openAttendanceModal(key) {
  const date =
    parseDate(key);

  const classes =
    getClassesForDate(date);

  if (!classes.length) return;

  const existing =
    state.attendanceRecords[key] || {};

  let existingMap = {};

  if (Array.isArray(existing)) {
    existing.forEach(record => {
      if (record.subject) {
        existingMap[record.subject] =
          record.status;
      }
    });
  } else {
    existingMap = existing;
  }

  let rows = "";

  classes.forEach((item, index) => {
    const subject =
      item[2];

    const current =
      existingMap[subject] || "";

    rows += `
      <div class="attendance-class-row">

        <div class="attendance-class-info">

          <div class="attendance-class-name">
            ${prettySubject(subject)}
          </div>

          <div class="attendance-class-time">
            ${item[0]} – ${item[1]}
          </div>

        </div>

        <div class="attendance-toggle">

          <button
            type="button"
            class="
              attendance-choice
              present-choice
              ${current === "present" ? "selected" : ""}
            "
            data-index="${index}"
            data-subject="${subject}"
            data-status="present"
            onclick="setAttendanceChoice(this,'present')"
          >
            Present
          </button>

          <button
            type="button"
            class="
              attendance-choice
              absent-choice
              ${current === "absent" ? "selected" : ""}
            "
            data-index="${index}"
            data-subject="${subject}"
            data-status="absent"
            onclick="setAttendanceChoice(this,'absent')"
          >
            Absent
          </button>

        </div>

      </div>
    `;
  });

  const modal =
    document.getElementById("modal");

  if (!modal) return;

  modal.innerHTML = `
    <div
      class="predictor-overlay"
      onclick="closeModal(event)"
    >

      <div
        class="predictor-modal attendance-modal"
        onclick="event.stopPropagation()"
      >

        <div class="predictor-top">

          <div>

            <h2>
              Mark Attendance
            </h2>

            <div class="cutoff">
              ${formatDisplayDate(key)}
            </div>

          </div>

          <button
            class="close-button"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>

        <div class="attendance-helper">
          Tap Present or Absent for each class.
        </div>

        <div class="attendance-class-list">
          ${rows}
        </div>

        <div class="attendance-modal-actions">

          <button
            type="button"
            class="all-present-button"
            onclick="markAllPresent()"
          >
            All Present
          </button>

          <button
            type="button"
            class="save-attendance-button"
            onclick="saveAttendance('${key}')"
          >
            Save Attendance
          </button>

        </div>

      </div>

    </div>
  `;
}

function setAttendanceChoice(
  button,
  status
) {
  const row =
    button.closest(
      ".attendance-class-row"
    );

  if (!row) return;

  row
    .querySelectorAll(
      ".attendance-choice"
    )
    .forEach(btn => {
      btn.classList.remove(
        "selected"
      );
    });

  button.classList.add(
    "selected"
  );
}

function markAllPresent() {
  document
    .querySelectorAll(
      ".attendance-class-row .present-choice"
    )
    .forEach(button => {

      const row =
        button.closest(
          ".attendance-class-row"
        );

      if (!row) return;

      row
        .querySelectorAll(
          ".attendance-choice"
        )
        .forEach(btn => {
          btn.classList.remove(
            "selected"
          );
        });

      button.classList.add(
        "selected"
      );
    });
}

function saveAttendance(key) {
  const rows =
    document.querySelectorAll(
      ".attendance-class-row"
    );

  const classes =
    getClassesForDate(
      parseDate(key)
    );

  const records = {};

  rows.forEach((row, index) => {
    const selected =
      row.querySelector(
        ".attendance-choice.selected"
      );

    if (!selected) return;

    const subject =
      classes[index][2];

    records[subject] =
      selected.dataset.status;
  });

  /*
    Only save if at least one class was marked.
  */

  if (Object.keys(records).length > 0) {
    state.attendanceRecords[key] =
      records;
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
  const confirmed = confirm(
    "Reset all attendance entered on this website?\n\n" +
    "This will remove your test entries and restore the original attendance."
  );

  if (!confirmed) {
    return;
  }

  /*
    IMPORTANT:
    This only clears attendance entered
    through this website.

    It does NOT change SUBJECTS.
    Therefore the original values such as
    12/21, 13/23, etc. come back.
  */

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
    item.date.getMonth() ===
    predictorMonth
  );
}

function getPredictorChoice(key) {
  return (
    predictorChoices[key] ||
    "attending"
  );
}

function cyclePredictorDay(key) {
  const current =
    getPredictorChoice(key);

  if (current === "attending") {
    predictorChoices[key] =
      "absent";
  } else if (current === "absent") {
    predictorChoices[key] =
      "ignored";
  } else {
    predictorChoices[key] =
      "attending";
  }

  renderPredictor();
}

function renderPredictor() {
  const days =
    getPredictorDays();

  const prediction =
    getPrediction(
      predictorChoices
    );

  let totalA = 0;
  let totalT = 0;

  for (const subject in prediction) {
    totalA +=
      prediction[subject].attended;

    totalT +=
      prediction[subject].total;
  }

  const overall =
    percentage(
      totalA,
      totalT
    );

  let html = `
    <div class="predictor-overlay">

      <div
        class="predictor-modal"
        onclick="event.stopPropagation()"
      >

        <div class="predictor-top">

          <div>

            <h2>
              Attendance Predictor
            </h2>

            <div class="cutoff">
              Attendance counted until 25 November 2026
            </div>

          </div>

          <button
            class="close-button"
            onclick="closePredictor()"
          >
            ×
          </button>

        </div>

        <div class="predictor-controls">

          <div class="predictor-month">
            ${MONTH_NAMES[predictorMonth]} 2026
          </div>

          <div class="predictor-nav">

            <button
              onclick="changePredictorMonth(-1)"
            >
              ‹
            </button>

            <button
              onclick="changePredictorMonth(1)"
            >
              ›
            </button>

          </div>

        </div>

        <div class="month-filter">

          <button
            class="${predictorMonth === 9 ? "active" : ""}"
            onclick="setPredictorMonth(9)"
          >
            October
          </button>

          <button
            class="${predictorMonth === 10 ? "active" : ""}"
            onclick="setPredictorMonth(10)"
          >
            November
          </button>

        </div>

        <div class="info-box">

          Tap a class day to cycle between:

          <b>Attending</b> →

          <b style="color:var(--red)">
            Not Attending
          </b> →

          <b>Ignored</b>

          <br><br>

          The prediction stops at
          <b>25 November 2026</b>.

        </div>

        <div class="predictor-summary">

          <div class="predicted-label">
            PREDICTED OVERALL ATTENDANCE
          </div>

          <div class="predicted-number">
            ${overall.toFixed(2)}%
          </div>

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
    const choice =
      getPredictorChoice(key);

    const d = item.date;

    html += `
      <button
        class="predictor-day ${choice}"
        onclick="cyclePredictorDay('${key}')"
      >

        <div class="date">
          ${d.getDate()}
        </div>

        <div class="weekday">
          ${DAY_NAMES[
            d.getDay()
          ].substring(0,3).toUpperCase()}
        </div>

      </button>
    `;
  }

  html += `
        </div>
  `;


  /* SUBJECT FORECASTS */

  for (const subject in prediction) {
    const a =
      prediction[subject].attended;

    const t =
      prediction[subject].total;

    const p =
      percentage(a, t);

    const remaining =
      countRemainingSubjectClasses(
        subject,
        predictorChoices
      );

    const canMiss =
      calculateCanMiss(
        a,
        t,
        remaining
      );

    const mustAttend =
      calculateMustAttend(
        a,
        t,
        remaining
      );

    let cls =
      "forecast-danger";

    if (p >= 75) {
      cls = "forecast-good";
    } else if (p >= 70) {
      cls = "forecast-warning";
    }

    let advice;

    if (p >= 75) {
      advice =
        `You can miss ${canMiss} more ${
          canMiss === 1
            ? "class"
            : "classes"
        } and still finish at 75%+`;
    } else if (mustAttend !== null) {
      advice =
        `Need to attend ${mustAttend} of the ${remaining} remaining`;
    } else {
      advice =
        `75% is not reachable by 25 Nov`;
    }

    html += `
      <div class="subject-forecast">

        <div class="forecast-header">

          <div class="forecast-subject">
            ${prettySubject(subject)}
          </div>

          <div class="forecast-percent ${cls}">
            ${p.toFixed(2)}%
          </div>

        </div>

        <div class="forecast-details">

          <span>
            ${a} / ${t}
          </span>

          <span>
            ${remaining} classes remaining
          </span>

        </div>

        <div
          class="forecast-details ${cls}"
          style="margin-top:6px"
        >
          ${advice}
        </div>

      </div>
    `;
  }


  /* WHAT IF */

  const selectedAbsent =
    Object.keys(
      predictorChoices
    ).filter(
      key =>
        predictorChoices[key] ===
        "absent"
    );

  if (selectedAbsent.length) {

    html += `
      <div class="what-if">

        <div class="what-if-title">
          If you skip the selected day(s)
        </div>
    `;

    const current =
      getActualAttendance();

    const skippedBySubject = {};

    for (const key of selectedAbsent) {
      const date =
        parseDate(key);

      const classes =
        getClassesForDate(date);

      for (const item of classes) {
        const subject =
          item[2];

        skippedBySubject[subject] =
          (
            skippedBySubject[subject] ||
            0
          ) + 1;
      }
    }

    for (const subject in current) {
      const a =
        current[subject].attended;

      const t =
        current[subject].total;

      const currentP =
        percentage(a, t);

      const skipped =
        skippedBySubject[subject] || 0;

      if (skipped === 0) {
        html += `
          <div class="what-if-row">

            <span>
              ${prettySubject(subject)}
            </span>

            <span>
              ${currentP.toFixed(2)}%
              →
              ${currentP.toFixed(2)}%

              <small style="color:var(--muted)">
                (no class)
              </small>
            </span>

          </div>
        `;

        continue;
      }

      const afterSkipP =
        percentage(
          a,
          t + skipped
        );

      const reduction =
        currentP - afterSkipP;

      html += `
        <div class="what-if-row">

          <span>
            ${prettySubject(subject)}
          </span>

          <span class="forecast-danger">

            ${currentP.toFixed(2)}%
            →
            ${afterSkipP.toFixed(2)}%

            <small>
              (-${reduction.toFixed(2)}%)
            </small>

          </span>

        </div>
      `;
    }

    html += `
        <div
          style="
            margin-top:10px;
            color:var(--muted);
            font-size:10px;
          "
        >
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
        >
          Reset prediction
        </button>

      </div>

    </div>
  `;

  document.getElementById(
    "modal"
  ).innerHTML = html;
}

function openPredictor() {
  predictorChoices = {};
  predictorMonth = 9;
  renderPredictor();
}

function closePredictor() {
  const modal =
    document.getElementById("modal");

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

  if (predictorMonth < 9) {
    predictorMonth = 9;
  }

  if (predictorMonth > 10) {
    predictorMonth = 10;
  }

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
    !event.target.classList.contains(
      "predictor-overlay"
    )
  ) {
    return;
  }

  const modal =
    document.getElementById("modal");

  if (modal) {
    modal.innerHTML = "";
  }
}


/* =========================
   MESS
   ========================= */

let messDate = new Date();

function getMessMenu(date) {
  const day =
    DAY_NAMES[
      date.getDay()
    ].toLowerCase();

  return OCTOBER_MENU[day];
}

function renderMess() {
  const page =
    document.getElementById(
      "messPage"
    );

  if (!page) return;

  const menu =
    getMessMenu(messDate);

  const dayName =
    DAY_NAMES[
      messDate.getDay()
    ];

  if (!menu) {
    page.innerHTML = `
      <div class="card">
        Mess menu unavailable.
      </div>
    `;

    return;
  }

  let html = `
    <div class="calendar-toolbar">

      <button
        class="month-button"
        onclick="changeMessDate(-1)"
      >
        ‹
      </button>

      <div style="text-align:center">

        <div class="mess-date">
          ${dayName}
        </div>

        <div class="month-title">
          ${messDate.toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "long"
            }
          )}
        </div>

      </div>

      <button
        class="month-button"
        onclick="changeMessDate(1)"
      >
        ›
      </button>

    </div>

    <div class="card">

      <div class="mess-header">

        <div>

          <div class="mess-date">
            ${dayName}
          </div>

          <h2 class="mess-title">
            Mess Menu
          </h2>

        </div>

      </div>
  `;

  const meals = [
    ["Breakfast", menu.breakfast],
    ["Lunch", menu.lunch],
    ["Snacks", menu.snacks],
    ["Dinner", menu.dinner]
  ];

  for (const [name, items] of meals) {
    html += `
      <div class="meal">

        <div class="meal-title">
          ${name}
        </div>

        <div class="meal-items">
          ${items.join(" • ")}
        </div>

      </div>
    `;
  }

  html += `
    </div>
  `;

  page.innerHTML = html;
}

function changeMessDate(amount) {
  messDate =
    new Date(
      messDate.getFullYear(),
      messDate.getMonth(),
      messDate.getDate() + amount
    );

  renderMess();
}


/* =========================
   NAVIGATION
   ========================= */

function changePage(page) {
  document
    .querySelectorAll(".page")
    .forEach(el =>
      el.classList.remove("active")
    );

  document
    .querySelectorAll(".nav-button")
    .forEach(el =>
      el.classList.remove("active")
    );

  const target =
    document.getElementById(
      `${page}Page`
    );

  const nav =
    document.getElementById(
      `nav${
        page.charAt(0).toUpperCase()
      }${page.slice(1)}`
    );

  if (target) {
    target.classList.add("active");
  }

  if (nav) {
    nav.classList.add("active");
  }

  const titles = {
    attendance: "Attendance",
    calendar: "Calendar",
    mess: "Mess"
  };

  const title =
    document.getElementById(
      "pageTitle"
    );

  if (title) {
    title.textContent =
      titles[page];
  }

  if (page === "attendance") {
    renderAttendance();
  }

  if (page === "calendar") {
    renderCalendar();
  }

  if (page === "mess") {
    renderMess();
  }
}

function goToday() {
  calendarDate = new Date();
  messDate = new Date();

  changePage("calendar");

  setTimeout(() => {
    openDay(
      dateKey(new Date())
    );
  }, 30);
}


/* =========================
   INITIALIZE
   ========================= */

renderAttendance();
renderCalendar();
renderMess();