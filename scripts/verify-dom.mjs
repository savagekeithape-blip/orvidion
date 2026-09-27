/**
 * DOM-Prüfung der ORVIDION-Seite.
 *
 * Animationen werden über den DOM-Zustand geprüft, nicht über Screenshots:
 * Klassen, berechnete Stile, CSS-Variablen, stroke-dashoffset. An drei
 * Stellen werden zusätzlich die gerenderten Pixel gemessen, weil dort der
 * DOM allein lügt.
 *
 * Aufruf:  npm run build && npm start -- -p 4300 &   dann  npm run verify
 * Ziel-URL über VERIFY_URL.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { PNG } from "pngjs";

const URL = process.env.VERIFY_URL ?? "http://localhost:4300/";
const LOCAL = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(
  existsSync(LOCAL) ? { executablePath: LOCAL } : {},
);

let fails = 0;
const log = (...a) => console.log(a.join(" "));
const check = (ok, name, detail = "") => {
  if (!ok) fails++;
  log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const settle = (p, ms = 2600) =>
  p.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !/favicon/i.test(m.text())) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("response", (r) => {
  if (r.status() >= 400 && !/favicon/.test(r.url()))
    errors.push(`${r.status()} ${r.url()}`);
});
await page.goto(URL, { waitUntil: "networkidle" });
await settle(page, 2400);

// ── Grundlagen ────────────────────────────────────────────────────────────

const fam = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check(/Space Grotesk/i.test(fam), "Space Grotesk geladen", fam.slice(0, 40));

check(
  (await page.evaluate(() => document.documentElement.lang)) === "de",
  "Dokumentsprache Deutsch",
);

const height = await page.evaluate(() => ({
  px: document.documentElement.scrollHeight,
  screens: document.documentElement.scrollHeight / window.innerHeight,
}));
check(
  height.screens < 10,
  "Scrollstrecke bleibt unter zehn Bildschirmen",
  `${height.px}px = ${height.screens.toFixed(1)}`,
);

// ── Farbpalette: nur die fünf Markenfarben ────────────────────────────────

const palette = await page.evaluate(() => {
  const allowed = new Set([
    "rgb(10, 15, 23)", "rgb(19, 32, 51)", "rgb(212, 175, 55)",
    "rgb(167, 173, 180)", "rgb(245, 246, 247)",
  ]);
  const norm = (c) => {
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
    return `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
  };
  const SHAPES = new Set(["circle","ellipse","rect","path","line","polygon","polyline","text"]);
  const bad = new Set();
  for (const el of document.querySelectorAll("body *")) {
    const tag = el.tagName.toLowerCase();
    if (["title","desc","script","style","defs","stop","lineargradient","radialgradient"].includes(tag)) continue;
    const cs = getComputedStyle(el);
    const hasText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
    );
    if (hasText) {
      const n = norm(cs.color);
      if (n && !allowed.has(n)) bad.add(`color(${tag}):${n}`);
    }
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") {
      const n = norm(cs.backgroundColor);
      if (n && !allowed.has(n)) bad.add(`bg(${tag}):${n}`);
    }
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      if (parseFloat(cs[`border${side}Width`]) > 0) {
        const n = norm(cs[`border${side}Color`]);
        if (n && !allowed.has(n)) bad.add(`border(${tag}):${n}`);
      }
    }
    if (SHAPES.has(tag)) {
      if (cs.fill && cs.fill !== "none" && !cs.fill.startsWith("url")) {
        const n = norm(cs.fill);
        if (n && !allowed.has(n)) bad.add(`fill(${tag}):${n}`);
      }
      if (cs.stroke && cs.stroke !== "none" && !cs.stroke.startsWith("url")
          && parseFloat(cs.strokeWidth) > 0) {
        const n = norm(cs.stroke);
        if (n && !allowed.has(n)) bad.add(`stroke(${tag}):${n}`);
      }
    }
  }
  return [...bad];
});
check(palette.length === 0, "nur die fünf Markenfarben im Einsatz",
  palette.slice(0, 4).join(" ") || "0 Fremdfarben");

// ── Tiefe ohne Schatten ───────────────────────────────────────────────────

const depth = await page.evaluate(() => {
  let shadows = 0;
  const radii = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.boxShadow !== "none") shadows++;
    if (cs.textShadow !== "none") shadows++;
    if (/drop-shadow/.test(cs.filter)) shadows++;
    const r = parseFloat(cs.borderTopLeftRadius) || 0;
    const w = el.getBoundingClientRect().width;
    if (r > 2 && !(w > 0 && Math.abs(r - w / 2) < 1.5) && r < 9990)
      radii.push(`${el.tagName.toLowerCase()}:${r}`);
  }
  return { shadows, radii };
});
check(depth.shadows === 0, "keine Schatten auf der Seite", `${depth.shadows}`);
check(depth.radii.length === 0, "keine Radien über 2px",
  depth.radii.slice(0, 4).join(" ") || "0");

// ── Eine Easing-Kurve ─────────────────────────────────────────────────────

const easings = await page.evaluate(() => {
  const split = (v) => {
    const out = []; let d = 0, cur = "";
    for (const ch of v) {
      if (ch === "(") d++;
      if (ch === ")") d--;
      if (ch === "," && d === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  const set = {};
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.animationName !== "none")
      for (const f of split(cs.animationTimingFunction)) set[f] = (set[f] || 0) + 1;
    if (parseFloat(cs.transitionDuration) > 0)
      for (const f of split(cs.transitionTimingFunction)) set[f] = (set[f] || 0) + 1;
  }
  return set;
});
const odd = Object.keys(easings).filter(
  (k) => !["cubic-bezier(0.16, 1, 0.3, 1)", "linear", "ease"].includes(k),
);
check(odd.length === 0, "eine Easing-Kurve (plus linear für Dauerrotation)",
  odd.join(" ") || JSON.stringify(easings));

// ── Hintergrundebenen sind sichtbar ───────────────────────────────────────
// Der Hintergrund eines im Fluss liegenden Elements wird NACH den Nachfahren
// mit negativem z-index gemalt. Ein deckender body-Hintergrund verdeckt damit
// Atmosphäre und Sternenfeld vollständig — im DOM völlig unauffällig.

{
  const region = { x0: 90, x1: 620, y0: 690, y1: 800 };
  const sample = async () => {
    const png = PNG.sync.read(await page.screenshot());
    const px = [];
    for (let y = region.y0; y < region.y1; y++)
      for (let x = region.x0; x < region.x1; x++) {
        const i = (png.width * y + x) << 2;
        px.push((png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3);
      }
    return px;
  };
  const withAll = await sample();
  await page.evaluate(() => {
    document.querySelector("canvas").style.visibility = "hidden";
  });
  await settle(page, 400);
  const noStars = await sample();
  await page.evaluate(() => {
    document.querySelector("canvas").style.visibility = "";
  });

  let lit = 0, peak = 0;
  for (let i = 0; i < withAll.length; i++) {
    const d = withAll[i] - noStars[i];
    if (d > 3) lit++;
    if (d > peak) peak = d;
  }
  check(lit > 30 && peak > 60, "Sternenfeld trägt sichtbar bei",
    `${lit} Pixel aufgehellt, Spitze +${peak.toFixed(0)}`);

  // Die Seite muss dunkel sein — auch dann, wenn ein fremdes Grundgerüst
  // ein helles `body { background }` mitbringt. Genau so wurde die Vorschau
  // einmal weiß: body war transparent, und der Grundton lag nur auf html,
  // wo ihn der body des Wirts übermalt hat.
  const corners = await (async () => {
    const png = PNG.sync.read(await page.screenshot());
    return [[20, 20], [1420, 20], [20, 880], [700, 880]].map(([x, y]) => {
      const i = (png.width * y + x) << 2;
      return (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    });
  })();
  check(corners.every((l) => l < 70), "die Seite rendert dunkel",
    corners.map((l) => l.toFixed(0)).join("/"));

  const layerZ = await page.evaluate(() => {
    const z = (el) => parseInt(getComputedStyle(el).zIndex || "0", 10) || 0;
    return {
      canvas: z(document.querySelector("canvas")),
      atmosphere: z(document.querySelector('[aria-hidden="true"].fixed.inset-0')),
      body: getComputedStyle(document.body).backgroundColor,
    };
  });
  // Negative z-index würde die Ebenen hinter jeden body-Hintergrund schieben.
  check(layerZ.canvas >= 0 && layerZ.atmosphere >= 0,
    "Hintergrundebenen liegen über body, nicht dahinter",
    `canvas z=${layerZ.canvas}, Atmosphäre z=${layerZ.atmosphere}`);
  check(layerZ.body !== "rgba(0, 0, 0, 0)",
    "body trägt selbst den Grundton (gegen fremde Grundgerüste)", layerZ.body);
}

// ── Die gescrubbte Szene ──────────────────────────────────────────────────

const scene = await page.evaluate(() => {
  const el = document.getElementById("prinzip");
  return { h: el.offsetHeight, top: el.offsetTop, vh: window.innerHeight };
});
const travel = scene.h - scene.vh;
const readP = () =>
  page.evaluate(() =>
    parseFloat(getComputedStyle(document.getElementById("prinzip")).getPropertyValue("--p")),
  );
const goTo = async (y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await settle(page, 2800);
};

await goTo(0);
check((await readP()) === 0, "vor dem Scrollen steht die Szene bei --p = 0");
await goTo(scene.top + travel * 0.5);
const pm = await readP();
check(pm > 0.45 && pm < 0.55, "--p in der Mitte ≈ 0.5", pm.toFixed(3));
await goTo(scene.top + travel);
const pe = await readP();
check(pe > 0.99, "--p erreicht am Ende 1", pe.toFixed(3));

const scrub = await page.evaluate(() => {
  const els = [...document.querySelectorAll(".scrub")];
  const bad = [];
  let paused = 0, animated = 0;
  for (const el of els) {
    const cs = getComputedStyle(el);
    if (cs.animationPlayState === "paused") paused++;
    if (cs.animationName !== "none") animated++;
    // --lp ist nicht registriert; das echte Signal ist das negative Delay.
    const ms = parseFloat(cs.animationDelay) * (/ms$/.test(cs.animationDelay) ? 1 : 1000);
    if (!Number.isFinite(ms) || ms < -1000.5 || ms > 0.5) bad.push(cs.animationDelay);
  }
  return { total: els.length, bad, paused, animated };
});
check(scrub.bad.length === 0, "alle Scrub-Delays in -1000…0 ms (--lp in 0…1)",
  scrub.bad.slice(0, 3).join(" ") || `${scrub.total} Elemente`);
check(scrub.paused === scrub.total && scrub.animated === scrub.total,
  "alle Scrub-Elemente pausiert und animiert",
  `${scrub.paused}/${scrub.animated}/${scrub.total}`);

const drawn = await page.evaluate(() =>
  [...document.querySelectorAll("#prinzip [stroke-dasharray]")].map((n) => ({
    pathLength: parseFloat(n.getAttribute("pathLength")),
    dash: parseFloat(getComputedStyle(n).strokeDasharray),
    len: parseFloat(getComputedStyle(n).getPropertyValue("--len")),
    off: parseFloat(getComputedStyle(n).strokeDashoffset),
  })),
);
// Weichen pathLength, dasharray und --len voneinander ab, skaliert der
// Browser das Strichmuster — eine fertige Linie erscheint dann gestrichelt.
check(drawn.every((d) => d.pathLength === d.dash && d.dash === d.len),
  "pathLength = stroke-dasharray = --len (sonst Strichmuster)",
  `${drawn.length} Konturen`);
check(drawn.every((d) => d.off < 1.5), "am Ende sind alle Bahnen gezeichnet",
  `max ${Math.max(...drawn.map((d) => d.off)).toFixed(2)}`);

// ── Kopfzeile und Fortschritt ─────────────────────────────────────────────

const header = await page.evaluate(() => {
  const h = document.querySelector("header");
  const bar = document.querySelector("header")?.previousElementSibling;
  const m = getComputedStyle(bar).transform.match(/matrix\(([\d.]+)/);
  return { opacity: getComputedStyle(h).opacity, scaleX: m ? parseFloat(m[1]) : -1 };
});
check(parseFloat(header.opacity) > 0.9, "Kopfzeile ist nach dem Hero sichtbar",
  header.opacity);
check(header.scaleX > 0.05 && header.scaleX <= 1,
  "Fortschrittslinie folgt dem Scroll", header.scaleX.toFixed(3));

await page.evaluate(() => window.scrollTo(0, 0));
await settle(page, 1400);
check(
  parseFloat(await page.evaluate(() => getComputedStyle(document.querySelector("header")).opacity)) < 0.1,
  "Kopfzeile bleibt im Hero verborgen",
);

// ── Einblendungen, auch die im SVG ────────────────────────────────────────
// Ein Observer auf dem Wrapper erreicht dessen Kinder nicht. Ohne eigene
// Behandlung bleiben Linien und Punkte im SVG für immer auf ihrem Startwert.

const reveals = await page.evaluate(async () => {
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y <= H; y += window.innerHeight / 2) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 110));
  }
  window.scrollTo(0, H);
  await new Promise((r) => setTimeout(r, 3200));
  const all = [...document.querySelectorAll("[data-reveal]")].filter(
    (e) => e.getClientRects().length > 0,
  );
  const stuck = [];
  for (const el of all) {
    if (!el.classList.contains("is-in")) {
      stuck.push(`kein is-in: ${el.tagName.toLowerCase()}`);
      continue;
    }
    const cs = getComputedStyle(el);
    const kind = el.getAttribute("data-reveal");
    if (kind === "line") {
      if (cs.transform !== "none" && !/matrix\(1,/.test(cs.transform))
        stuck.push(`line ${cs.transform}`);
    } else if (kind === "draw") {
      if (parseFloat(cs.strokeDashoffset) > 1.5)
        stuck.push(`draw offset ${cs.strokeDashoffset}`);
    } else if (parseFloat(cs.opacity) < 0.99) {
      stuck.push(`opacity ${cs.opacity}`);
    }
  }
  const inSvg = all.filter((e) => e.ownerSVGElement);
  return { total: all.length, inSvg: inSvg.length, stuck };
});
check(reveals.stuck.length === 0, "alle Einblendungen abgeschlossen",
  reveals.stuck.slice(0, 4).join(" | ") || `${reveals.total} Elemente`);
check(reveals.inSvg > 0 &&
  reveals.stuck.filter((s) => /draw|is-in/.test(s)).length === 0,
  "auch die Einblendungen im SVG laufen durch", `${reveals.inSvg} im SVG`);

// ── Inhalt und Ehrlichkeit ────────────────────────────────────────────────

const gold = await page.evaluate(() =>
  [...document.querySelectorAll("a, button")]
    .filter((e) => /rgba?\(212,\s*175,\s*55/.test(getComputedStyle(e).backgroundColor))
    .map((e) => e.textContent.trim().slice(0, 30)),
);
check(gold.length === 1, "genau ein gefüllter goldener CTA", gold.join(" | "));

const honesty = await page.evaluate(() => {
  const t = document.body.innerText.replace(/\s+/g, " ");
  return {
    korridor: /Zielkorridore aus unserer Projektplanung/.test(t),
    keine: /keine Logos und keine Testimonials/.test(t),
  };
});
check(honesty.korridor, "Zahlen sind als Zielkorridore ausgewiesen");
check(honesty.keine, "Hinweis, dass es keine Logos/Testimonials gibt");

check(errors.length === 0, "keine Konsolen- oder Netzwerkfehler",
  errors.slice(0, 3).join(" | "));
await page.close();

// ── Kein abgeschnittener Text, kein waagerechter Überlauf ─────────────────

log("");
for (const [w, h] of [[390,640],[390,844],[768,700],[768,1024],[1024,640],[1280,800],[1440,900],[1920,1080]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: "networkidle" });
  const r = await p.evaluate(async () => {
    const out = [];
    // Die Sticky-Bühne bis ans Ende durchfahren und dabei prüfen.
    const el = document.getElementById("prinzip");
    const stage = el.querySelector(":scope > .sticky");
    for (const f of [0.05, 0.5, 0.98]) {
      window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * f);
      await new Promise((r) => setTimeout(r, 2600));
      const sr = stage.getBoundingClientRect();
      for (const t of stage.querySelectorAll("h2,p,li,text")) {
        if (!(t.textContent || "").trim()) continue;
        if (parseFloat(getComputedStyle(t).opacity) < 0.05) continue;
        const tr = t.getBoundingClientRect();
        if (!tr.width || !tr.height) continue;
        const over = Math.max(
          tr.bottom - sr.bottom, sr.top - tr.top,
          tr.right - sr.right, sr.left - tr.left,
        );
        if (over > 2) out.push(`"${t.textContent.trim().slice(0, 22)}" ${Math.round(over)}px`);
      }
    }
    window.scrollTo(0, 0);
    return {
      clipped: [...new Set(out)],
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    };
  });
  check(r.clipped.length === 0 && r.sw <= r.cw + 1, `${w}x${h}: nichts beschnitten, kein Überlauf`,
    r.clipped.slice(0, 2).join(" ") || `${r.sw}/${r.cw}`);
  await p.close();
}

// ── Gezeichnete Linien wirklich durchgezogen (Pixel) ──────────────────────
// Der Strichmuster-Fehler war im DOM unsichtbar: dashoffset stand auf 0.

log("");
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: "networkidle" });
  const geo = await p.evaluate(async () => {
    const sec = document.getElementById("ablauf");
    window.scrollTo(0, sec.offsetTop - 40);
    await new Promise((r) => setTimeout(r, 4200));
    const svg = sec.querySelector("svg");
    const r = svg.getBoundingClientRect();
    return { ox: r.x, oy: r.y, sx: r.width / 1200, sy: r.height / 420 };
  });
  const png = PNG.sync.read(await p.screenshot());
  const at = (x, y) => {
    const i = (png.width * Math.round(y) + Math.round(x)) << 2;
    return [png.data[i], png.data[i + 1], png.data[i + 2]];
  };
  let on = 0, n = 0;
  for (let t = 0.08; t <= 0.92; t += 0.01) {
    const ux = 110 + (430 - 110) * t;
    const uy = 300 + (96 - 300) * t;
    const x = geo.ox + ux * geo.sx;
    const y = geo.oy + uy * geo.sy;
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
  check(cover >= 96, "Konstellationslinie ist durchgezogen", `${cover}% Deckung`);
  await p.close();
}

// ── Reduced Motion ────────────────────────────────────────────────────────

log("");
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  await settle(p, 1200);
  const r = await p.evaluate(() => {
    const revs = [...document.querySelectorAll("[data-reveal]")].filter(
      (e) => e.getClientRects().length,
    );
    return {
      total: revs.length,
      hidden: revs.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length,
      scrubbing: [...document.querySelectorAll(".scrub")].filter(
        (e) => getComputedStyle(e).animationName !== "none",
      ).length,
    };
  });
  check(r.hidden === 0, "reduced motion: alles sofort sichtbar", `${r.hidden}/${r.total}`);
  check(r.scrubbing === 0, "reduced motion: keine Scrub-Animationen", String(r.scrubbing));
  await ctx.close();
}

await browser.close();
log("");
log(fails === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${fails} PRÜFUNG(EN) FEHLGESCHLAGEN`);
process.exit(fails === 0 ? 0 : 1);
