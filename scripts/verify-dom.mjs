/**
 * DOM-Prüfung der ORVIDION-Seite.
 *
 * Animationen werden über den DOM-Zustand geprüft, nicht über Screenshots:
 * Klassen, berechnete Stile, CSS-Variablen und stroke-dashoffset. Screenshots
 * verschweigen genau die Fehler, die hier wichtig sind — hängengebliebene
 * Einblendungen und in der Sticky-Bühne abgeschnittener Text.
 *
 * Aufruf:  npm run build && npm start -- -p 4300 &   dann  npm run verify
 * Ziel-URL über VERIFY_URL setzbar.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { PNG } from "pngjs";

const URL = process.env.VERIFY_URL ?? "http://localhost:4300/";

// Im Container liegt ein vorinstallierter Chromium, dessen Build nicht zur
// Playwright-Version passt — dann direkt darauf zeigen statt nachzuladen.
const LOCAL = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const launchOpts = existsSync(LOCAL) ? { executablePath: LOCAL } : {};

const browser = await chromium.launch(launchOpts);


const out = [];
const log = (...a) => { const s = a.join(" "); out.push(s); console.log(s); };
let fails = 0;
const check = (ok, name, detail = "") => {
  if (!ok) fails++;
  log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });

// Warten, bis die gedämpften Werte zur Ruhe gekommen sind.
const settle = async (ms = 1400) => {
  await page.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);
};

// ── Schrift ───────────────────────────────────────────────────────────────
const fam = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check(/Space Grotesk/i.test(fam), "Space Grotesk geladen", fam.slice(0, 60));

// ── Farbpalette: keine Fremdfarben ────────────────────────────────────────
const palette = await page.evaluate(() => {
  const allowed = new Set([
    "rgb(10, 15, 23)", "rgb(19, 32, 51)", "rgb(212, 175, 55)",
    "rgb(167, 173, 180)", "rgb(245, 246, 247)",
  ]);
  const norm = (c) => {
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null; // unsichtbar
    return `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
  };
  const PAINTS_FILL = new Set(["circle", "ellipse", "rect", "path", "line", "polygon", "polyline", "text"]);
  const bad = new Set();
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    if (tag === "title" || tag === "desc" || tag === "script" || tag === "style") continue;

    // Textfarbe nur, wenn das Element eigenen Text hat.
    const hasText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
    );
    if (hasText) {
      const n = norm(cs.color);
      if (n && !allowed.has(n)) bad.add(`color(${tag}):${n}`);
    }

    // Hintergrund nur, wenn nicht transparent.
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
      const n = norm(cs.backgroundColor);
      if (n && !allowed.has(n)) bad.add(`bg(${tag}):${n}`);
    }

    // Rahmen nur, wenn er Breite hat.
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      if (parseFloat(cs[`border${side}Width`]) > 0) {
        const n = norm(cs[`border${side}Color`]);
        if (n && !allowed.has(n)) bad.add(`border(${tag}):${n}`);
      }
    }

    // fill/stroke nur auf Formen, die wirklich malen.
    if (PAINTS_FILL.has(tag)) {
      if (cs.fill && cs.fill !== "none") {
        const n = norm(cs.fill);
        if (n && !allowed.has(n)) bad.add(`fill(${tag}):${n}`);
      }
      if (cs.stroke && cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0) {
        const n = norm(cs.stroke);
        if (n && !allowed.has(n)) bad.add(`stroke(${tag}):${n}`);
      }
    }
  }
  return [...bad];
});
check(palette.length === 0, "nur die fünf Markenfarben im Einsatz",
  palette.length ? palette.join(" ") : "0 Fremdfarben");

// ── Keine Schatten, keine großen Radien ───────────────────────────────────
const depth = await page.evaluate(() => {
  let shadows = 0, bigRadius = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.boxShadow && cs.boxShadow !== "none") shadows++;
    if (cs.textShadow && cs.textShadow !== "none") shadows++;
    if (cs.filter && /drop-shadow/.test(cs.filter)) shadows++;
    const r = parseFloat(cs.borderTopLeftRadius) || 0;
    // Kreise (rounded-full) sind erlaubt: Radius == halbe Breite
    const w = el.getBoundingClientRect().width;
    if (r > 2 && !(w > 0 && Math.abs(r - w / 2) < 1.5) && r < 9990) {
      bigRadius.push(`${el.tagName.toLowerCase()}:${r}px`);
    }
  }
  return { shadows, bigRadius };
});
check(depth.shadows === 0, "keine Schatten auf der Seite", `${depth.shadows} gefunden`);
check(depth.bigRadius.length === 0, "keine Radien über 2px",
  depth.bigRadius.slice(0, 5).join(" ") || "0");

// ── Eine Easing-Kurve ─────────────────────────────────────────────────────
const easings = await page.evaluate(() => {
  // Auf Kommas trennen, die nicht in Klammern stehen.
  const split = (v) => {
    const out = []; let depth = 0, cur = "";
    for (const ch of v) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  const set = {};
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.animationName !== "none") {
      for (const f of split(cs.animationTimingFunction)) set[f] = (set[f] || 0) + 1;
    }
    if (parseFloat(cs.transitionDuration) > 0) {
      for (const f of split(cs.transitionTimingFunction)) set[f] = (set[f] || 0) + 1;
    }
  }
  return set;
});
const nonStandard = Object.keys(easings).filter(
  (k) => k !== "cubic-bezier(0.16, 1, 0.3, 1)" && k !== "linear" && k !== "ease",
);
check(nonStandard.length === 0, "eine Easing-Kurve (plus bewusstes linear)",
  nonStandard.join(" ") || JSON.stringify(easings));

// ── Sticky-Sektionen und Fortschritt --p ──────────────────────────────────
const sections = await page.evaluate(() =>
  [...document.querySelectorAll("main section")].filter((s) => s.id && s.querySelector(":scope > .sticky") && s.offsetHeight > 0).map((s) => ({
    id: s.id, h: s.offsetHeight, top: s.offsetTop, vh: window.innerHeight,
  })),
);
check(sections.length === 5, "fünf Sticky-Szenen registriert",
  sections.map((s) => `${s.id}:${Math.round((s.h / s.vh) * 100)}vh`).join(" "));

const readP = (id) => page.evaluate((i) => {
  const el = document.getElementById(i);
  return el ? parseFloat(getComputedStyle(el).getPropertyValue("--p")) : NaN;
}, id);

// Oben: alle --p auf 0 (bzw. die erste Szene bei 0)
await settle();
check((await readP("prinzip")) === 0, "vor dem Scrollen steht der Kern bei --p = 0",
  String(await readP("prinzip")));

// Durch jede Szene fahren und Fortschritt prüfen.
const scrollTo = async (y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await settle(1600);
};

for (const s of sections) {
  const travel = await page.evaluate((id) => {
    const el = document.getElementById(id);
    return el.offsetHeight - window.innerHeight;
  }, s.id);
  const mid = s.top + travel * 0.5;
  const end = s.top + travel;

  await scrollTo(mid);
  const pm = await readP(s.id);
  await scrollTo(end);
  const pe = await readP(s.id);

  check(pm > 0.3 && pm < 0.7, `${s.id}: --p in der Mitte ≈ 0.5`, pm.toFixed(3));
  check(pe > 0.985, `${s.id}: --p erreicht am Ende 1`, pe.toFixed(3));
}

// ── Scrub: lokaler Fortschritt und negatives Delay ────────────────────────
const scrub = await page.evaluate(() => {
  const els = [...document.querySelectorAll(".scrub")];
  let bad = [], animating = 0, paused = 0;
  for (const el of els) {
    const cs = getComputedStyle(el);
    // --lp ist keine registrierte Custom Property; getComputedStyle gibt
    // den unaufgelösten Text zurück. Das echte Signal ist das negative
    // Delay: delay = --lp * -1000ms, muss also in [-1000ms, 0ms] liegen.
    const ms = parseFloat(cs.animationDelay) * (/ms$/.test(cs.animationDelay) ? 1 : 1000);
    if (!Number.isFinite(ms) || ms < -1000.5 || ms > 0.5) bad.push(`delay=${cs.animationDelay}`);
    if (cs.animationName !== "none") animating++;
    if (cs.animationPlayState === "paused") paused++;
  }
  return { total: els.length, bad, animating, paused };
});
check(scrub.bad.length === 0, "alle Scrub-Delays innerhalb -1000…0 ms (--lp in 0…1)",
  scrub.bad.slice(0, 4).join(" ") || `${scrub.total} Elemente`);
check(scrub.paused === scrub.total, "alle Scrub-Animationen pausiert (scroll-gebunden)",
  `${scrub.paused}/${scrub.total}`);
check(scrub.animating === scrub.total, "alle Scrub-Elemente haben eine Animation",
  `${scrub.animating}/${scrub.total}`);

// ── Gezeichnete Linien: exakte Längen gemessen, Zeichnen läuft ────────────
await page.evaluate(() => {
  const el = document.getElementById("prinzip");
  window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.28);
});
await settle(1800);
const drawMid = await page.evaluate(() =>
  [...document.querySelectorAll("#prinzip [data-draw]")].slice(0, 3).map((n) => {
    const cs = getComputedStyle(n);
    return {
      pathLength: parseFloat(n.getAttribute("pathLength")),
      dash: parseFloat(cs.strokeDasharray),
      len: parseFloat(cs.getPropertyValue("--len")),
      off: parseFloat(cs.strokeDashoffset),
      real: n.getTotalLength(),
    };
  }),
);

/**
 * Der Invariant, dessen Bruch die Linien gestrichelt gemacht hat: weichen
 * pathLength, stroke-dasharray und --len voneinander ab, skaliert der Browser
 * das Strichmuster im Verhältnis der Längen — die Linie wird gestrichelt
 * statt durchgezogen. Die drei Werte müssen übereinstimmen.
 */
const consistent = drawMid.every(
  (d) => d.pathLength === d.dash && d.dash === d.len,
);
check(consistent, "pathLength = stroke-dasharray = --len (sonst Strichmuster)",
  drawMid.map((d) => `${d.pathLength}/${d.dash}/${d.len}`).join(" "));
const longEnough = drawMid.every((d) => d.pathLength >= d.real);
check(longEnough, "normierte Länge deckt jede echte Kontur ab",
  drawMid.map((d) => `${d.pathLength}>=${d.real.toFixed(0)}`).join(" "));
const partial = drawMid.some((d) => d.off > 1 && d.off < d.len - 1);
check(partial, "eine Bahn ist mitten im Zeichnen (dashoffset dazwischen)",
  drawMid.map((d) => `off=${d.off.toFixed(0)}/${d.len.toFixed(0)}`).join(" "));

await page.evaluate(() => {
  const el = document.getElementById("prinzip");
  window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight));
});
await settle(2200);
const drawEnd = await page.evaluate(() =>
  [...document.querySelectorAll("#prinzip [data-draw]")].map((n) =>
    parseFloat(getComputedStyle(n).strokeDashoffset),
  ),
);
check(drawEnd.every((o) => o < 1.5), "am Ende sind alle Bahnen vollständig gezeichnet",
  `max dashoffset ${Math.max(...drawEnd).toFixed(2)}`);

// ── Reveals: nichts bleibt halbfertig stehen ──────────────────────────────
const reveals = await page.evaluate(async () => {
  // Alles einmal durchscrollen, damit jeder Observer feuert.
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y <= H; y += window.innerHeight / 2) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
  window.scrollTo(0, H);
  await new Promise((r) => setTimeout(r, 2500));
  // Nicht gerenderte Elemente (ausgeblendete Fassung) überspringen: dort
  // laufen CSS-Animationen nicht, sie sind aber auch nicht sichtbar.
  const all = [...document.querySelectorAll("[data-reveal]")].filter(
    (e) => e.getClientRects().length > 0,
  );
  const stuck = [];
  for (const el of all) {
    if (!el.classList.contains("is-in")) { stuck.push("kein is-in"); continue; }
    const cs = getComputedStyle(el);
    const op = parseFloat(cs.opacity);
    const kind = el.getAttribute("data-reveal");
    if (kind === "line") {
      if (!/matrix\(1,/.test(cs.transform) && cs.transform !== "none")
        stuck.push(`line transform ${cs.transform}`);
    } else if (op < 0.99) {
      stuck.push(`opacity ${op}`);
    }
    if (cs.animationFillMode !== "both") stuck.push(`fill-mode ${cs.animationFillMode}`);
  }
  return { total: all.length, stuck };
});
check(reveals.stuck.length === 0,
  "alle Einblendungen vollständig abgeschlossen (fill-mode: both)",
  reveals.stuck.slice(0, 5).join(" ") || `${reveals.total} Elemente`);

// ── Kein horizontales Scrollen, auch schmal ───────────────────────────────
for (const w of [390, 768, 1440, 1920]) {
  await page.setViewportSize({ width: w, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(400);
  const over = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  check(over.sw <= over.cw + 1, `kein horizontaler Überlauf bei ${w}px`,
    `${over.sw} vs ${over.cw}`);
}

// ── Genau ein gefüllter goldener CTA ──────────────────────────────────────
await page.setViewportSize({ width: 1440, height: 900 });
const goldFills = await page.evaluate(() => {
  let n = [];
  for (const el of document.querySelectorAll("a, button")) {
    const bg = getComputedStyle(el).backgroundColor;
    if (/rgba?\(212,\s*175,\s*55/.test(bg)) n.push(el.textContent.trim().slice(0, 40));
  }
  return n;
});
check(goldFills.length === 1, "genau ein gefüllter goldener CTA", goldFills.join(" | "));

// ── Sprache und Ehrlichkeit ───────────────────────────────────────────────
const lang = await page.evaluate(() => document.documentElement.lang);
check(lang === "de", "Dokumentsprache Deutsch", lang);
const honesty = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    disclaimer: /Zielkorridore aus unserer\s+Projektplanung/.test(t.replace(/\s+/g, " "))
      || /Zielkorridore/.test(t),
    noTestimonials: /keine Logos und keine Testimonials/.test(t.replace(/\s+/g, " ")),
  };
});
check(honesty.disclaimer, "Zahlen sind als Zielkorridore ausgewiesen");
check(honesty.noTestimonials, "Hinweis, dass es keine Logos/Testimonials gibt");

// ── Reduced Motion ────────────────────────────────────────────────────────
const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 }, reducedMotion: "reduce",
});
const rmPage = await rm.newPage();
await rmPage.goto(URL, { waitUntil: "networkidle" });
await rmPage.evaluate(() => new Promise((r) => setTimeout(r, 900)));
const rmState = await rmPage.evaluate(() => {
  const revs = [...document.querySelectorAll("[data-reveal]")];
  const hidden = revs.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length;
  const scrubAnimated = [...document.querySelectorAll(".scrub")]
    .filter((e) => getComputedStyle(e).animationName !== "none").length;
  return { revs: revs.length, hidden, scrubAnimated };
});
check(rmState.hidden === 0, "reduced motion: alles sofort sichtbar",
  `${rmState.hidden}/${rmState.revs} verdeckt`);
check(rmState.scrubAnimated === 0, "reduced motion: keine Scrub-Animationen",
  String(rmState.scrubAnimated));
await rm.close();

// ── Konsole ───────────────────────────────────────────────────────────────
check(errors.length === 0, "keine Konsolenfehler", errors.slice(0, 3).join(" | "));


log("");


// ── Kein Text darf in einer Sticky-Bühne abgeschnitten werden ─────────────
log("");

for (const [w, h] of [[390, 640], [390, 844], [768, 700], [1024, 640], [1280, 800], [1440, 780], [1440, 900], [1920, 1080]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: "networkidle" });
  const bad = await p.evaluate(() => {
    const out = [];
    for (const stage of document.querySelectorAll("main > section > .sticky")) {
      const sr = stage.getBoundingClientRect();
      for (const el of stage.querySelectorAll("h1,h2,h3,p,a,span")) {
        const t = (el.textContent || "").trim();
        if (!t) continue;
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.width === 0) continue;
        // Beschneidung in alle vier Richtungen. Waagerecht ist genauso
        // wichtig: die Bühne hat overflow:hidden, ein zu weit rechts
        // gesetztes Label verschwindet einfach, ohne die Seite zu verbreitern.
        const over = Math.max(
          r.bottom - sr.bottom,
          sr.top - r.top,
          r.right - sr.right,
          sr.left - r.left,
        );
        if (over > 2) {
          out.push(`${stage.parentElement.id}: "${t.slice(0, 34)}" ragt ${Math.round(over)}px heraus`);
        }
      }
    }
    return [...new Set(out)];
  });
  if (bad.length) { fails++; log(`FAIL ${w}x${h}`); bad.slice(0, 6).forEach((x) => log("      " + x)); }
  else log(`PASS ${w}x${h}  — kein Text beschnitten`);
  await p.close();
}



// ── Streuungs-Beschriftungen dürfen den Textblock nicht überlagern ────────
log("");
for (const [w, h] of [[390, 844], [768, 1024], [1280, 800], [1440, 900], [1920, 1080]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: "networkidle" });
  const hits = await p.evaluate(async () => {
    const sec = document.getElementById("ausgangslage");
    window.scrollTo(0, sec.offsetTop + (sec.offsetHeight - window.innerHeight) * 0.6);
    await new Promise((r) => setTimeout(r, 2600));
    const stage = sec.querySelector(":scope > .sticky");
    const texts = [...stage.querySelectorAll("h2, p.t-lead, p.t-label")].filter(
      (e) => e.getClientRects().length,
    );
    const labels = [...stage.querySelectorAll(".scatter-node")].filter(
      (e) => e.getClientRects().length,
    );
    const bad = [];
    for (const l of labels) {
      const a = l.getBoundingClientRect();
      for (const t of texts) {
        const b = t.getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 0 && oy > 0) {
          bad.push(`"${l.textContent.trim()}" über "${t.textContent.trim().slice(0, 22)}"`);
        }
      }
    }
    return [...new Set(bad)];
  });
  check(hits.length === 0, `Streuung ${w}x${h}: keine Überlagerung von Text`,
    hits.slice(0, 3).join(" | ") || "frei");
  await p.close();
}

// ── Kompakt-Fassung auf kleinen Fenstern ──────────────────────────────────
log("");

for (const [w, h] of [[390, 844], [768, 1024]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(URL, { waitUntil: "networkidle" });
  const r = await p.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y <= H; y += window.innerHeight / 3) {
      window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, H);
    await new Promise((r) => setTimeout(r, 2500));
    const vis = [...document.querySelectorAll("[data-reveal]")].filter((e) => e.getClientRects().length);
    const stuck = vis.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length;
    // Sind alle vier Ablauf-Schritte sichtbar und lesbar?
    const steps = [...document.querySelectorAll("#ablauf-kompakt h3")].map((h) => h.textContent);
    return { vis: vis.length, stuck, steps, h: H };
  });
  const ok = r.stuck === 0 && r.steps.length === 4 && errs.length === 0;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${w}x${h} — ${r.vis} Reveals, ${r.stuck} hängen, Schritte: ${r.steps.join("/")}, Seitenhöhe ${r.h}px${errs.length ? " ERR:" + errs[0] : ""}`);
  await p.close();
}




// ── Sind fertig gezeichnete Linien wirklich durchgezogen? ─────────────────
// Der Strichmuster-Fehler war im DOM unsichtbar: dashoffset stand korrekt auf
// 0. Erst die Pixel zeigen ihn. Deshalb hier gemessen statt nur abgefragt.
log("");
{
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p2.goto(URL, { waitUntil: "networkidle" });
  const geo = await p2.evaluate(async () => {
    const el = document.getElementById("ablauf");
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.95);
    await new Promise((r) => setTimeout(r, 3000));
    const svg = document.querySelector("#ablauf svg");
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / 1000, r.height / 620);
    return {
      ox: r.x + (r.width - 1000 * scale) / 2,
      oy: r.y + (r.height - 620 * scale) / 2,
      scale,
    };
  });
  const png = PNG.sync.read(await p2.screenshot());
  const at = (x, y) => {
    const i = (png.width * Math.round(y) + Math.round(x)) << 2;
    return [png.data[i], png.data[i + 1], png.data[i + 2]];
  };
  let on = 0, n = 0;
  for (let t = 0.08; t <= 0.92; t += 0.01) {
    const ux = 130 + (386 - 130) * t;
    const uy = 430 + (168 - 430) * t;
    const x = geo.ox + ux * geo.scale;
    const y = geo.oy + uy * geo.scale;
    let hit = false;
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++) {
        const [r, , b2] = at(x + dx, y + dy);
        if (r > 22 && r > b2 + 6) hit = true;
      }
    n++;
    if (hit) on++;
  }
  const cover = Math.round((on / n) * 100);
  check(cover >= 96, "gezeichnete Linie ist durchgezogen, nicht gestrichelt",
    `${cover}% Deckung`);
  await p2.close();
}


// ── Beschriftungen müssen an ihren Knoten sitzen ──────────────────────────
// preserveAspectRatio passt die Figur in den Kasten ein. Zeigen die prozentual
// gesetzten Beschriftungen auf den ungepassten Kasten, wandern sie weg.
log("");
for (const [w, h] of [[1024, 700], [1440, 900], [1920, 1080]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: "networkidle" });
  const r = await p.evaluate(async () => {
    const el = document.getElementById("ablauf");
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.95);
    await new Promise((r) => setTimeout(r, 2800));
    const svg = document.querySelector("#ablauf svg");
    const box = svg.getBoundingClientRect();
    const scale = Math.min(box.width / 1000, box.height / 620);
    const ox = box.x + (box.width - 1000 * scale) / 2;
    const oy = box.y + (box.height - 620 * scale) / 2;
    const P = [[130,430],[386,168],[648,474],[902,196]];
    const labels = [...document.querySelectorAll("#ablauf .absolute.inset-0 > div")];
    return labels.map((l, i) => {
      const lr = l.querySelector("span").getBoundingClientRect();
      const dotX = ox + P[i][0] * scale, dotY = oy + P[i][1] * scale;
      return {
        step: l.textContent.trim(),
        dy: Math.round(lr.y + lr.height / 2 - dotY),
        gap: Math.round(i === 3 ? dotX - lr.right : lr.x - dotX),
      };
    });
  });
  check(
    r.every((x) => Math.abs(x.dy) <= 3 && x.gap >= 14 && x.gap <= 44),
    `Konstellation ${w}x${h}: Beschriftungen sitzen an ihren Knoten`,
    r.map((x) => `${x.step} Δy=${x.dy} Abstand=${x.gap}`).join(" | "),
  );
  await p.close();
}



// ── Die Goldlinie unter „System" darf nicht von der Zeilenmaske fallen ────
log("");
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.evaluate(() => new Promise((r) => setTimeout(r, 2400)));
  const box = await p.evaluate(() => {
    const el = [...document.querySelectorAll("#start h1 span")].find((s) => s.className.includes("underline"));
    return el ? el.getBoundingClientRect().toJSON() : null;
  });
  const png = PNG.sync.read(await p.screenshot());
  const at = (x, y) => { const i = (png.width * Math.round(y) + Math.round(x)) << 2; return [png.data[i], png.data[i+1], png.data[i+2]]; };
  // Unterhalb der Grundlinie nach Gold suchen
  let best = { y: 0, n: 0 };
  for (let y = Math.round(box.y); y < Math.round(box.bottom) + 30; y++) {
    let n = 0;
    for (let x = Math.round(box.x); x < Math.round(box.right); x++) {
      const [r, g, bl] = at(x, y);
      if (r > 90 && g > 70 && bl < 90) n++;
    }
    if (n > best.n) best = { y, n };
  }
  check(best.n > box.width * 0.6, "Goldlinie unter \u201eSystem\u201c wird gezeichnet",
      `${best.n}px Gold unter einem ${Math.round(box.width)}px breiten Wort`);
  await p.close();
}

await browser.close();
log("");
log(fails === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${fails} PRÜFUNG(EN) FEHLGESCHLAGEN`);
process.exit(fails === 0 ? 0 : 1);
