const root = document.documentElement;
const body = document.body;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;


const DOB = new Date(2007, 8, 15);
const ageCounter = document.getElementById("age-counter");

function updateAge() {
  if (!ageCounter) return;
  const years = (Date.now() - DOB.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  ageCounter.textContent = years.toFixed(9);
}

if (ageCounter) {
  updateAge();
  setInterval(updateAge, 100);
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();


const streakContainer = document.getElementById("streaks");
if (streakContainer) {
  const streakCount = innerWidth < 700 ? 22 : 44;

  for (let index = 0; index < streakCount; index += 1) {
    const streak = document.createElement("span");
    streak.className = "streak";
    streak.style.setProperty("--top", `${Math.random() * 92}%`);
    streak.style.setProperty("--left", `${Math.random() * 100}%`);
    streak.style.setProperty("--length", `${28 + Math.random() * 58}px`);
    streak.style.setProperty("--opacity", `${0.25 + Math.random() * 0.55}`);
    streak.style.setProperty("--duration", `${5 + Math.random() * 7}s`);
    streak.style.setProperty("--delay", `${Math.random() * -12}s`);
    streakContainer.appendChild(streak);
  }
}


const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: "0px 0px -4%" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));


const navLinks = document.querySelectorAll(".nav-links a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      link.classList.toggle("is-active", href === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-42% 0px -48%", threshold: 0 });

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

const themeToggle = document.querySelector(".theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "dark" ? "#08090a" : "#ffffff";
  });
}


const terminal = document.querySelector(".terminal");
const terminalToggle = document.querySelector(".terminal-toggle");

if (terminal && terminalToggle) {
  terminalToggle.addEventListener("click", () => terminal.classList.toggle("is-open"));
  document.addEventListener("click", (event) => {
    if (!terminal.contains(event.target) && !terminalToggle.contains(event.target)) {
      terminal.classList.remove("is-open");
    }
  });
}

document.querySelectorAll(".image-fallback img").forEach((image) => {
  const fallback = () => image.parentElement.classList.add("is-missing");
  image.addEventListener("error", fallback);
  if (image.complete && image.naturalWidth === 0) fallback();
});

const HOVER_TARGET = "a, button, .interactive, .interactive-card, .nav-links a, .project, .experience-card";

if (finePointer && !reducedMotion) {
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let angle = 0;

    body.classList.add("has-cursor");

    addEventListener("pointermove", (event) => {
      const dx = event.clientX - mouseX;
      const dy = event.clientY - mouseY;
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 1.5) angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      body.classList.add("has-cursor");
    }, { passive: true });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%) rotate(${angle}deg)`;
      requestAnimationFrame(animateCursor);
    }

    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(HOVER_TARGET)) cursor.classList.add("is-hovering");
    });

    document.addEventListener("pointerout", (event) => {
      const leaving = event.target.closest(HOVER_TARGET);
      const entering = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest(HOVER_TARGET) : null;
      if (leaving && !entering) cursor.classList.remove("is-hovering");
    });

    addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
    addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
    addEventListener("blur", () => body.classList.remove("has-cursor"));
    animateCursor();
  }
}

const githubCard = document.querySelector(".github-card");

if (githubCard) {
  const username = githubCard.dataset.username;
  const statusEl = githubCard.querySelector(".github-status");
  const monthsEl = githubCard.querySelector(".github-months");
  const gridEl = githubCard.querySelector(".github-grid");
  const totalEl = githubCard.querySelector(".github-total");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function renderContributions(weeks, total) {
    statusEl.style.display = "none";
    gridEl.innerHTML = "";
    monthsEl.innerHTML = "";

    let lastMonth = -1;
    weeks.forEach((week) => {
      const firstRealDay = week.find((day) => day.date);
      const label = document.createElement("span");
      if (firstRealDay) {
        const month = new Date(firstRealDay.date).getMonth();
        if (month !== lastMonth) {
          label.textContent = monthNames[month];
          lastMonth = month;
        }
      }
      monthsEl.appendChild(label);
    });

    weeks.forEach((week) => {
      week.forEach((day) => {
        const cell = document.createElement("i");
        if (day.count >= 0) {
          cell.dataset.level = day.level;
          cell.title = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`;
        }
        gridEl.appendChild(cell);
      });
    });

    totalEl.textContent = `${total.toLocaleString()} contributions in the last year`;
  }

  function toWeeks(days) {
    const firstDate = new Date(days[0].date);
    const padCount = firstDate.getDay();
    const padded = Array.from({ length: padCount }, () => ({ date: "", count: -1, level: 0 })).concat(days);

    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
  }

  async function loadContributions() {
    try {
      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const days = data.contributions
        .filter((day) => day.date && new Date(day.date) <= new Date())
        .map((day) => ({ date: day.date, count: day.count, level: day.level }));

      if (!days.length) throw new Error("No data");

      const total = data.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0);
      renderContributions(toWeeks(days), total);
    } catch (error) {
      statusEl.textContent = `Couldn't load contributions for @${username} right now.`;
      githubCard.classList.add("has-error");
    }
  }

  loadContributions();
}

document.querySelectorAll(".project").forEach((row) => {
  const thumb = row.querySelector(".project-thumb");
  if (!thumb) return;

  row.addEventListener("mousemove", (e) => {
    const rowBounds = row.getBoundingClientRect();
    const mouseX = e.clientX - rowBounds.left;
    const mouseY = e.clientY - rowBounds.top;
    thumb.style.left = `${mouseX}px`;
    thumb.style.top = `${mouseY}px`;
  });

  row.addEventListener("mouseleave", () => {
    thumb.style.transition = "all 0.3s ease";
  });

  row.addEventListener("mouseenter", () => {
    thumb.style.transition = "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
  });
});

const dialogCuboid = document.getElementById("specCuboid");
const specDialog = document.getElementById("victusDialog");

if (dialogCuboid && specDialog) {
  let rotationX = 6;
  let rotationY = -10;
  let activeDrag = false;
  let startX = 0;
  let startY = 0;

  dialogCuboid.addEventListener("mousedown", (e) => {
    if (e.target.closest(".close-btn")) return;
    activeDrag = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!activeDrag) return;
    const moveX = e.clientX - startX;
    const moveY = e.clientY - startY;
    rotationY += moveX * 0.3;
    rotationX -= moveY * 0.3;
    dialogCuboid.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    activeDrag = false;
  });

  specDialog.addEventListener("close", () => {
    activeDrag = false;
    rotationX = 6;
    rotationY = -10;
    dialogCuboid.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  });
}

/* ===== Get in touch card ===== */
(function () {
  const card = document.getElementById("gtCard");
  if (!card) return;
  const wrap = card.parentElement;
  const button = card.querySelector(".gt-button");
  const sig = card.querySelector(".gt-signature");
  const mail = card.querySelector(".gt-email");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  new IntersectionObserver((entries, io) => {
    if (entries[0].isIntersecting) { card.classList.add("is-drawn"); io.disconnect(); }
  }, { threshold: 0.4 }).observe(card);

  sig.addEventListener("click", () => {
    sig.classList.remove("is-replay");
    card.classList.remove("is-drawn");
    void sig.offsetWidth;
    sig.classList.add("is-replay");
  });

  if (fine && !reducedMotion) {
    wrap.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      card.style.setProperty("--ry", ((x / r.width - 0.5) * 7).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - y / r.height) * 7).toFixed(2) + "deg");
      const b = button.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      const near = Math.hypot(dx, dy) < 110;
      button.style.setProperty("--bx", near ? (dx * 0.22).toFixed(1) + "px" : "0px");
      button.style.setProperty("--by", near ? (dy * 0.32).toFixed(1) + "px" : "0px");
    });
    wrap.addEventListener("pointerleave", () => {
      ["--rx", "--ry"].forEach((k) => card.style.setProperty(k, "0deg"));
      ["--bx", "--by"].forEach((k) => button.style.setProperty(k, "0px"));
    });
  }

  const label = mail.querySelector("em");
  const live = card.querySelector(".gt-live");
  let timer;
  function copied() {
    mail.classList.add("is-copied");
    label.textContent = "Copied ✓";
    live.textContent = "Email copied";
    clearTimeout(timer);
    timer = setTimeout(() => { mail.classList.remove("is-copied"); label.textContent = "Copy"; }, 1800);
  }
  mail.addEventListener("click", () => {
    const text = mail.dataset.email;
    const fallback = () => {
      const t = document.createElement("textarea");
      t.value = text; t.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); copied(); } catch (e) { location.href = "mailto:" + text; }
      t.remove();
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(copied, fallback); else fallback();
  });
})();

/* ===== Typing role line ===== */
(function () {
  const el = document.getElementById("role-text");
  if (!el || reducedMotion) return;
  const roles = ["Software & AI developer", "BCA student", "FastAPI + Django builder", "SQL & backend tinkerer", "Open to internships"];
  let i = 0, n = 0, deleting = false;
  function tick() {
    const word = roles[i];
    n += deleting ? -1 : 1;
    el.textContent = word.slice(0, n);
    let wait = deleting ? 35 : 70;
    if (!deleting && n === word.length) { deleting = true; wait = 1400; }
    else if (deleting && n === 0) { deleting = false; i = (i + 1) % roles.length; wait = 350; }
    setTimeout(tick, wait);
  }
  el.textContent = ""; tick();
})();

/* ===== Interactive terminal ===== */
(function () {
  const term = document.querySelector(".terminal");
  const out = document.getElementById("termOut");
  const form = document.getElementById("termForm");
  const input = document.getElementById("termInput");
  const toggle = document.querySelector(".terminal-toggle");
  if (!term || !out || !form || !input) return;

  const history = []; let h = 0;
  const print = (text, cls) => {
    const line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  };
  const go = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    print("-> scrolling to #" + id, "ok");
  };

  const commands = {
    help: () => print("commands: about, projects, experience, stack, github, education, contact, theme, whoami, date, clear"),
    about: () => print("Rajdeep Gogoi: BCA student into software and AI. Builds with FastAPI, Django and SQL."),
    whoami: () => print("rajdeep, full-stack builder, open to internships"),
    projects: () => go("projects"),
    experience: () => go("experience"),
    stack: () => { print("C, Python, Java, JavaScript, HTML, CSS, FastAPI, Django, SQLite, SQL, Git"); go("stack"); },
    github: () => go("github"),
    education: () => go("education"),
    contact: () => go("contact"),
    date: () => print(new Date().toString()),
    clear: () => { out.textContent = ""; },
    theme: (arg) => {
      const next = arg === "dark" || arg === "light" ? arg : (root.dataset.theme === "dark" ? "light" : "dark");
      root.dataset.theme = next;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = next === "dark" ? "#08090a" : "#ffffff";
      print("theme set to " + next, "ok");
    },
    ls: () => print("projects/  experience/  stack/  github/  education/  contact/"),
    sudo: () => print("nice try. permission denied."),
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    history.push(raw); h = history.length;
    print("$ " + raw, "cmd");
    const [name, ...args] = raw.toLowerCase().split(/\s+/);
    if (commands[name]) commands[name](args[0]); else print("command not found: " + name + " (try help)");
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) { h = Math.max(0, h - 1); input.value = history[h]; e.preventDefault(); }
    if (e.key === "ArrowDown") { h = Math.min(history.length, h + 1); input.value = history[h] || ""; e.preventDefault(); }
    if (e.key === "Escape") term.classList.remove("is-open");
  });

  const open = () => { term.classList.add("is-open"); setTimeout(() => input.focus(), 60); };
  if (toggle) toggle.addEventListener("click", () => { if (term.classList.contains("is-open")) setTimeout(() => input.focus(), 60); });
  addEventListener("keydown", (e) => {
    const typing = /input|textarea/i.test(document.activeElement.tagName);
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (!typing && e.key === "`")) {
      e.preventDefault();
      term.classList.contains("is-open") ? term.classList.remove("is-open") : open();
    }
  });
  print("type help. shortcut: Ctrl/Cmd+K or `");
})();


/* ===== Discord Presence (via Lanyard) ===== */
(function () {
  // Your Discord numeric User ID (not your username)
  const DISCORD_ID = "1520485141544435792";
  const link = document.getElementById("discordLink");

  if (!link || !/^\d{15,25}$/.test(DISCORD_ID)) return;

  // Discord profile link
  link.href = "https://discord.com/users/" + DISCORD_ID;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.title = "Discord: checking status...";

  async function updateDiscordStatus() {
    try {
      const res = await fetch(
        "https://api.lanyard.rest/v1/users/" + DISCORD_ID
      );

      if (!res.ok) throw new Error("Lanyard API unavailable");

      const json = await res.json();
      if (!json.success) throw new Error("Discord user not found");

      const status = json.data.discord_status || "offline";

      link.dataset.status = status;
      link.title = "Discord: " + status;
    } catch (error) {
      link.dataset.status = "unknown";
      link.title = "Discord status unavailable";
    }
  }

  updateDiscordStatus();
  setInterval(updateDiscordStatus, 30000);
})();
