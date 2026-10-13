/**
 * 《最后一矛》 / The Last Spear — Ch.1～Ch.4 完整垂直切片原型
 * 红黑涂鸦风 · 键鼠可玩 · 无构建
 * v1.4：Ch.4 蓝心开合 / 天裂之主·蓝心；拆荚→攀关节→蓝心窗；结局 A/B；钉头掩体
 * v1.3：Ch.3 哨兵一锤 / 节触哨·钉头（说服收编或击败）；蓝心远光；Ch.4 掩体钩子
 * v1.2：Ch.2 笑墙合拢 / Boss 城魂·咧嘴；标题选章；通关解锁
 * v1.1 画面精致化：纸纹/褶皱/撕边、角色交叉阴影、塔厚度、弹幕预警余晖、特效
 */
(function () {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const RED = "#c81e1e";
  const RED_DIM = "#a01818";
  const RED_SOFT = "rgba(200,30,30,0.35)";
  const BLACK = "#1a1a1a";
  const PAPER = "#faf7f0";
  const PAPER_DARK = "#ebe4d4";
  const TAPE = "#f0e6c8";
  const INK = "#2a2a2a";
  const BLUE_HINT = "#4a7ab5";

  // ——— Meta / chapter ———
  let unlockedCh2 = true; // 开发期可直接选章；通关也会解锁
  let unlockedCh3 = true;
  let unlockedCh4 = true; // 开发期可直接选终章；Ch.3 通关也会解锁
  let selectedChapter = 1;
  let lastChapter = 1;
  let nailRecruited = false; // Ch.3 收编 → Ch.4 钉头掩体加成
  const BOSS_LINES = [
    "城魂·咧嘴：小火柴，你坐骑的名字，借我咬一口。",
    "咧嘴：笑得越大……缝越大。钻不钻？",
    "咧嘴：墙在听我的——合拢！",
    "咧嘴：怒视——慢一点，让我看清楚。",
    "旁白：笑墙合拢。要塞的脸，贴在红线上。",
  ];
  const NAIL_LINES = [
    "节触哨·钉头：……别用蓝心看我。",
    "钉头：触手——卷住那根矛！",
    "钉头：钉砸！站进圈里——雨穿不透。",
    "旁白：蓝心远光扫过。钉头在抖。",
    "钉头：你……挡了那一眼？……跟你走。",
    "旁白：中立哨区。说服，或一矛了结。",
  ];
  const SKY_LINES = [
    "天裂之主·蓝心：纸画满了——该涂改了。",
    "蓝心：四肢圆荚——爆。",
    "蓝心：锁定。你跑不掉名字。",
    "旁白：红雨变成有节奏的谱。蓝心开合。",
    "蓝心：扎进来。或者……扎回你自己的「还要」。",
    "旁白：关节阴影处，可以攀上去。",
    "钉头（掩体）：砸！——雨穿不透这边。",
    "旁白：最后一矛——扎向谁？",
  ];

  // ——— RNG ———
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function irand(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function pick(arr) {
    return arr[irand(0, arr.length - 1)];
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  // ——— Cached paper fiber texture (once) ———
  const paperTex = document.createElement("canvas");
  paperTex.width = W;
  paperTex.height = H;
  (function buildPaper() {
    const p = paperTex.getContext("2d");
    p.fillStyle = PAPER;
    p.fillRect(0, 0, W, H);
    // soft fold shadows (diagonal creases)
    p.globalAlpha = 0.06;
    for (let i = 0; i < 5; i++) {
      const x0 = rand(-50, W * 0.3);
      const y0 = rand(0, H);
      const grd = p.createLinearGradient(x0, y0, x0 + 180, y0 + 40);
      grd.addColorStop(0, "transparent");
      grd.addColorStop(0.5, "#000");
      grd.addColorStop(1, "transparent");
      p.fillStyle = grd;
      p.fillRect(0, y0 - 20, W, 60);
    }
    // fiber flecks
    p.globalAlpha = 0.14;
    for (let i = 0; i < 1400; i++) {
      p.fillStyle = Math.random() < 0.18 ? RED : BLACK;
      const x = Math.random() * W;
      const y = Math.random() * H;
      p.fillRect(x, y, Math.random() < 0.65 ? 1 : 2, Math.random() < 0.45 ? 1 : rand(1, 3.5));
    }
    // soft fold bands (stronger)
    p.globalAlpha = 0.07;
    for (let i = 0; i < 4; i++) {
      const yy = rand(40, H - 40);
      const g = p.createLinearGradient(0, yy - 30, 0, yy + 30);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, "rgba(0,0,0,0.55)");
      g.addColorStop(1, "transparent");
      p.fillStyle = g;
      p.fillRect(0, yy - 30, W, 60);
    }
    // hairline fibers
    p.globalAlpha = 0.07;
    p.strokeStyle = BLACK;
    p.lineWidth = 1;
    for (let i = 0; i < 80; i++) {
      const y = Math.random() * H;
      p.beginPath();
      p.moveTo(0, y);
      for (let x = 0; x < W; x += 40) {
        p.lineTo(x, y + Math.sin(x * 0.02 + i) * 1.5);
      }
      p.stroke();
    }
    // edge discoloration
    p.globalAlpha = 0.12;
    const eg = p.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
    eg.addColorStop(0, "transparent");
    eg.addColorStop(1, "#c8b898");
    p.fillStyle = eg;
    p.fillRect(0, 0, W, H);
    p.globalAlpha = 1;
  })();

  // distant skyline silhouettes (static)
  const skyline = [];
  (function buildSkyline() {
    let x = 30;
    while (x < W - 30) {
      const bw = rand(18, 48);
      const bh = rand(18, 70);
      skyline.push({ x, w: bw, h: bh, spikes: irand(0, 2) });
      x += bw + rand(6, 22);
    }
  })();

  // ambient rain layers (parallax)
  const rainFar = [];
  const rainMid = [];
  for (let i = 0; i < 34; i++) {
    rainFar.push({ x: rand(0, W), y: rand(0, H), r: rand(1.2, 2.6), vy: rand(25, 45), a: rand(0.12, 0.24) });
  }
  for (let i = 0; i < 22; i++) {
    rainMid.push({ x: rand(0, W), y: rand(0, H), r: rand(2.2, 4), vy: rand(50, 85), a: rand(0.22, 0.38) });
  }

  // ——— Jitter line helpers (doodle style) ———
  function jitterPath(points, amp) {
    const out = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      out.push([p[0] + rand(-amp, amp), p[1] + rand(-amp, amp)]);
    }
    return out;
  }

  function strokeJitterPoly(pts, color, lw, amp) {
    const j = jitterPath(pts, amp == null ? 1.2 : amp);
    ctx.beginPath();
    ctx.moveTo(j[0][0], j[0][1]);
    for (let i = 1; i < j.length; i++) ctx.lineTo(j[i][0], j[i][1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function fillJitterPoly(pts, color, amp) {
    const j = jitterPath(pts, amp == null ? 1 : amp);
    ctx.beginPath();
    ctx.moveTo(j[0][0], j[0][1]);
    for (let i = 1; i < j.length; i++) ctx.lineTo(j[i][0], j[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function strokeJitterLine(x1, y1, x2, y2, color, lw, amp, segs) {
    const n = segs || 6;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
    strokeJitterPoly(pts, color, lw, amp);
  }

  function fillJitterEllipse(cx, cy, rx, ry, color, amp) {
    const n = 14;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([
        cx + Math.cos(a) * rx + rand(-amp, amp),
        cy + Math.sin(a) * ry + rand(-amp, amp),
      ]);
    }
    pts.push(pts[0]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function strokeJitterEllipse(cx, cy, rx, ry, color, lw, amp) {
    const n = 16;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([
        cx + Math.cos(a) * rx + rand(-amp, amp),
        cy + Math.sin(a) * ry + rand(-amp, amp),
      ]);
    }
    strokeJitterPoly(pts, color, lw, 0);
  }

  function hatchRect(x, y, w, h, color, spacing, angleDeg, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha = alpha == null ? 0.35 : alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const rad = ((angleDeg || 35) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const diag = Math.hypot(w, h) * 1.5;
    const sp = spacing || 6;
    for (let i = -diag; i < diag; i += sp) {
      const ox = x + w / 2 + cos * i - sin * diag;
      const oy = y + h / 2 + sin * i + cos * diag;
      const ox2 = x + w / 2 + cos * i + sin * diag;
      const oy2 = y + h / 2 + sin * i - cos * diag;
      ctx.beginPath();
      ctx.moveTo(ox + rand(-0.5, 0.5), oy + rand(-0.5, 0.5));
      ctx.lineTo(ox2 + rand(-0.5, 0.5), oy2 + rand(-0.5, 0.5));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTornEdge() {
    // torn paper rim along canvas border
    ctx.save();
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    const step = 12;
    // top
    ctx.moveTo(0, 4 + rand(-1, 1));
    for (let x = 0; x <= W; x += step) {
      ctx.lineTo(x, 3 + Math.sin(x * 0.08 + state.t * 0.3) * 2 + rand(-1.2, 1.2));
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, H - 4);
    for (let x = 0; x <= W; x += step) {
      ctx.lineTo(x, H - 3 + Math.sin(x * 0.09) * 2 + rand(-1.2, 1.2));
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 0);
    for (let y = 0; y <= H; y += step) {
      ctx.lineTo(3 + Math.sin(y * 0.07) * 2 + rand(-1, 1), y);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W - 4, 0);
    for (let y = 0; y <= H; y += step) {
      ctx.lineTo(W - 3 + Math.sin(y * 0.08) * 2 + rand(-1, 1), y);
    }
    ctx.stroke();
    // tiny tear nicks
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
      const side = i % 4;
      let tx, ty;
      if (side === 0) { tx = rand(40, W - 40); ty = rand(2, 8); }
      else if (side === 1) { tx = rand(40, W - 40); ty = H - rand(2, 8); }
      else if (side === 2) { tx = rand(2, 8); ty = rand(40, H - 40); }
      else { tx = W - rand(2, 8); ty = rand(40, H - 40); }
      strokeJitterLine(tx, ty, tx + rand(-6, 6), ty + rand(-6, 6), BLACK, 1.2, 0.8, 2);
    }
    ctx.restore();
  }

  function drawPencilText(text, x, y, size, color, align) {
    ctx.save();
    ctx.font = "bold " + size + "px 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = align || "center";
    ctx.textBaseline = "middle";
    // soft graphite under-layer
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = color;
    ctx.fillText(text, x + 1.2, y + 1.2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.fillText(text, x + rand(-0.4, 0.4), y + rand(-0.3, 0.3));
    // thin outline like pencil edge
    ctx.strokeStyle = color === RED ? BLACK : INK;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.35;
    ctx.strokeText(text, x, y);
    ctx.restore();
  }

  function drawTapeRect(x, y, w, h, borderColor) {
    ctx.save();
    ctx.fillStyle = TAPE;
    ctx.globalAlpha = 0.92;
    // slightly skewed tape
    ctx.beginPath();
    ctx.moveTo(x + rand(0, 1), y + rand(0, 1));
    ctx.lineTo(x + w + rand(-1, 1), y + rand(0, 1));
    ctx.lineTo(x + w + rand(-1, 0), y + h + rand(-1, 1));
    ctx.lineTo(x + rand(0, 1), y + h + rand(-1, 0));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    strokeJitterPoly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [x, y],
      ],
      borderColor || RED,
      1.4,
      0.7
    );
    // tape shine line
    ctx.globalAlpha = 0.2;
    strokeJitterLine(x + 3, y + 3, x + w - 3, y + 3, "#fff", 1, 0.3, 3);
    ctx.restore();
  }

  // ——— Input ———
  const keys = Object.create(null);
  let mouseDownL = false;
  let mouseDownR = false;
  let mouseX = W / 2;
  let mouseY = H / 2;

  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
    if (state.mode === "title") {
      if (e.code === "Digit1" || e.code === "Numpad1") selectedChapter = 1;
      if ((e.code === "Digit2" || e.code === "Numpad2") && unlockedCh2) selectedChapter = 2;
      if ((e.code === "Digit3" || e.code === "Numpad3") && unlockedCh3) selectedChapter = 3;
      if ((e.code === "Digit4" || e.code === "Numpad4") && unlockedCh4) selectedChapter = 4;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        selectedChapter = Math.max(1, selectedChapter - 1);
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        let maxCh = 1;
        if (unlockedCh2) maxCh = 2;
        if (unlockedCh3) maxCh = 3;
        if (unlockedCh4) maxCh = 4;
        selectedChapter = Math.min(maxCh, selectedChapter + 1);
      }
      if (e.code === "Enter" || e.code === "Space") startGame(selectedChapter);
    }
    if (state.mode === "win" || state.mode === "lose") {
      if (e.code === "Enter" || e.code === "Space") {
        if (state.mode === "win") {
          if (state.chapter === 1 && unlockedCh2) startGame(2);
          else if (state.chapter === 2 && unlockedCh3) startGame(3);
          else if (state.chapter === 3 && unlockedCh4) startGame(4);
          else goTitle();
        } else {
          startGame(state.chapter || lastChapter);
        }
      }
      if (e.code === "KeyR") startGame(state.chapter || lastChapter);
      if (e.code === "Escape" || e.code === "KeyT") goTitle();
      if (state.mode === "win" && state.chapter === 1 && (e.code === "Digit2" || e.code === "Numpad2")) startGame(2);
      if (state.mode === "win" && state.chapter === 2 && unlockedCh3 && (e.code === "Digit3" || e.code === "Numpad3")) startGame(3);
      if (state.mode === "win" && state.chapter === 3 && unlockedCh4 && (e.code === "Digit4" || e.code === "Numpad4")) startGame(4);
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      mouseDownL = true;
      const r = canvas.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * W;
      const my = ((e.clientY - r.top) / r.height) * H;
      if (state.mode === "title") {
        // chapter cards (4 across) — match drawTitle chCard geometry
        if (my > 348 && my < 412) {
          if (mx > W / 2 - 270 && mx < W / 2 - 155) { selectedChapter = 1; startGame(1); return; }
          if (mx > W / 2 - 140 && mx < W / 2 - 25 && unlockedCh2) { selectedChapter = 2; startGame(2); return; }
          if (mx > W / 2 - 10 && mx < W / 2 + 105 && unlockedCh3) { selectedChapter = 3; startGame(3); return; }
          if (mx > W / 2 + 120 && mx < W / 2 + 235 && unlockedCh4) { selectedChapter = 4; startGame(4); return; }
        }
        startGame(selectedChapter);
      }
      if (state.mode === "win") {
        if (state.chapter === 1 && unlockedCh2 && my > 360 && my < 430) startGame(2);
        else if (state.chapter === 2 && unlockedCh3 && my > 360 && my < 430) startGame(3);
        else if (state.chapter === 3 && unlockedCh4 && my > 360 && my < 430) startGame(4);
        else goTitle();
      }
      if (state.mode === "lose") startGame(state.chapter || lastChapter);
    }
    if (e.button === 2) mouseDownR = true;
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseDownL = false;
    if (e.button === 2) mouseDownR = false;
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) * W;
    mouseY = ((e.clientY - r.top) / r.height) * H;
  });

  function pressed(code) {
    return !!keys[code];
  }

  // ——— Game state ———
  const FORGET_LINES = [
    "无限：……你叫什么来着？",
    "无限歪了歪头。——名字，被雨冲走了。",
    "旁白：它忘了「烬矛」三个字。",
    "无限：骑在背上的……还是那根矛。",
    "旁白：冲得越远，记得越少。",
    "无限：……还要？好像听过。",
  ];

  let state = {};

  function goTitle() {
    state = {
      mode: "title",
      t: 0,
      particles: [],
      titleDots: [],
      hitWrinkle: 0,
      dashTrail: [],
      afterglows: [],
      inkBlots: [],
      blockPulse: 0,
      chapter: 0,
    };
    for (let i = 0; i < 55; i++) {
      state.titleDots.push({
        x: rand(40, W - 40),
        y: rand(40, H - 40),
        r: rand(1.2, 4.5),
        vy: rand(10, 38),
        layer: Math.random(),
      });
    }
  }

  function basePlayState(chapter) {
    return {
      mode: "playing",
      chapter: chapter,
      t: 0,
      score: 0,
      saved: 0,
      dashes: 0,
      forgets: 0,
      hp: chapter >= 2 ? 6 : 5,
      maxHp: chapter >= 2 ? 6 : 5,
      invuln: 1.2,
      blocking: false,
      blockCd: 0,
      spearCd: 0,
      spearActive: 0,
      dashCd: 0,
      dashTimer: 0,
      dashDir: { x: 1, y: 0 },
      forgetFlash: 0,
      forgetText: "",
      forgetChars: [],
      cameraShake: 0,
      particles: [],
      bullets: [],
      slashBursts: [],
      rings: [],
      floatTexts: [],
      patternTimer: 1.2,
      patternPhase: 0,
      winDelay: 0,
      px: chapter === 4 ? 240 : chapter === 3 ? 200 : chapter === 2 ? 220 : 280,
      py: H * 0.55,
      vx: 0,
      vy: 0,
      facing: 1,
      groundY: H - 40,
      crushWarn: 0,
      allyFlicker: 0,
      hitWrinkle: 0,
      dashTrail: [],
      afterglows: [],
      inkBlots: [],
      blockPulse: 0,
      tears: [],
      slowMul: 1,
      bossTaunt: 0,
      bossTauntText: "",
      speedMul: 1,
    };
  }

  function startGame(chapter) {
    chapter = chapter || selectedChapter || 1;
    if (chapter === 2 && !unlockedCh2) chapter = 1;
    if (chapter === 3 && !unlockedCh3) chapter = unlockedCh2 ? 2 : 1;
    if (chapter === 4 && !unlockedCh4) chapter = unlockedCh3 ? 3 : (unlockedCh2 ? 2 : 1);
    lastChapter = chapter;
    selectedChapter = chapter;
    state = basePlayState(chapter);
    state.nail = null;
    state.blueEye = null;
    state.safeZones = [];
    state.tentacles = [];
    state.ch3Outcome = null; // "recruit" | "defeat"
    state.skyLord = null;
    state.pods = [];
    state.joints = [];
    state.nailAlly = null;
    state.ch4Ending = null; // "A" | "B"
    state.choiceTargets = null;
    if (chapter === 1) {
      state.towers = [
        {
          side: "left",
          x: 80,
          w: 70,
          h: 320,
          yp: H - 40 - 320,
          symbol: "+",
          hp: 4,
          maxHp: 4,
          alive: true,
          closeSpeed: 12,
          crack: 0,
        },
        {
          side: "right",
          x: W - 150,
          w: 70,
          h: 320,
          yp: H - 40 - 320,
          symbol: "×",
          hp: 4,
          maxHp: 4,
          alive: true,
          closeSpeed: 12,
          crack: 0,
        },
      ];
      state.boss = null;
      state.fortress = null;
      floatText(W / 2, 140, "Ch.1 矛阵起夜", BLACK);
    } else if (chapter === 2) {
      // Ch.2 — 笑墙合拢：密线要塞 + 夹击塔墙 + 城魂·咧嘴
      state.towers = [
        {
          side: "left",
          x: 55,
          w: 78,
          h: 340,
          yp: H - 40 - 340,
          symbol: "+",
          hp: 5,
          maxHp: 5,
          alive: true,
          closeSpeed: 16,
          crack: 0,
          fortress: true,
        },
        {
          side: "right",
          x: W - 145,
          w: 78,
          h: 340,
          yp: H - 40 - 340,
          symbol: "×",
          hp: 5,
          maxHp: 5,
          alive: true,
          closeSpeed: 16,
          crack: 0,
          fortress: true,
        },
      ];
      state.fortress = {
        x: W - 280,
        y: H - 40 - 210,
        w: 240,
        h: 210,
      };
      state.boss = {
        hp: 10,
        maxHp: 10,
        // face attached to fortress wall
        cx: W - 155,
        cy: H - 160,
        smile: 0.35,
        phase: "intro",
        phaseT: 2.2,
        glareT: 0,
        vulnerable: false,
        stagger: 0,
        mouthOpen: 0.2,
        pulse: 0,
        dead: false,
        hitFlash: 0,
      };
      state.bossTaunt = 3.2;
      state.bossTauntText = BOSS_LINES[0];
      floatText(W / 2, 140, "Ch.2 笑墙合拢", RED);
    } else if (chapter === 3) {
      // Ch.3 — 哨兵一锤：中立节触哨 · 钉头（可收编）
      // 无合拢塔：用两座已死虚塔占位，避免边界逻辑崩
      state.towers = [
        { side: "left", x: -120, w: 40, h: 100, yp: H, symbol: "+", hp: 0, maxHp: 1, alive: false, closeSpeed: 0, crack: 1 },
        { side: "right", x: W + 80, w: 40, h: 100, yp: H, symbol: "×", hp: 0, maxHp: 1, alive: false, closeSpeed: 0, crack: 1 },
      ];
      state.boss = null;
      state.fortress = null;
      state.nail = {
        hp: 8,
        maxHp: 8,
        cx: W * 0.55,
        cy: H * 0.52,
        pulse: 0,
        phase: "intro",
        phaseT: 2.4,
        persuasion: 0,
        maxPersuasion: 100,
        hitFlash: 0,
        stagger: 0,
        fear: 0,
        sway: 0,
        dead: false,
        recruited: false,
        smashTele: 0,
        smashX: 0,
        smashY: 0,
        tentCd: 0,
        bob: 0,
      };
      state.blueEye = {
        x: W * 0.5,
        y: 58,
        beamOn: false,
        beamAng: -0.35,
        beamSweep: 0.55,
        beamT: 0,
        nextBeam: 4.0,
        open: 0.3,
      };
      state.safeZones = [];
      state.tentacles = [];
      state.bossTaunt = 3.4;
      state.bossTauntText = NAIL_LINES[5];
      floatText(W / 2, 140, "Ch.3 哨兵一锤", RED);
    } else if (chapter === 4) {
      // Ch.4 — 蓝心开合：天裂之主·蓝心终局
      state.towers = [
        { side: "left", x: -120, w: 40, h: 100, yp: H, symbol: "+", hp: 0, maxHp: 1, alive: false, closeSpeed: 0, crack: 1 },
        { side: "right", x: W + 80, w: 40, h: 100, yp: H, symbol: "×", hp: 0, maxHp: 1, alive: false, closeSpeed: 0, crack: 1 },
      ];
      state.boss = null;
      state.fortress = null;
      const podDefs = [
        { ang: -2.2, dist: 210 },
        { ang: -0.95, dist: 230 },
        { ang: 0.95, dist: 230 },
        { ang: 2.2, dist: 210 },
      ];
      state.pods = podDefs.map((d, i) => {
        const jx = W * 0.5 + Math.cos(d.ang) * (d.dist * 0.45);
        const jy = 110 + Math.sin(Math.abs(d.ang)) * 55 + (i % 2) * 20;
        const px = W * 0.5 + Math.cos(d.ang) * d.dist;
        const py = 95 + Math.sin(Math.abs(d.ang)) * 120 + 40;
        return {
          id: i,
          x: clamp(px, 70, W - 70),
          y: clamp(py, 120, H - 100),
          jointX: clamp(jx, 100, W - 100),
          jointY: clamp(jy, 100, 280),
          hp: 3,
          maxHp: 3,
          alive: true,
          explodeCd: 1.8 + i * 0.55,
          pulse: rand(0, 3),
          hitFlash: 0,
        };
      });
      state.joints = state.pods.map((p) => ({
        x: p.jointX,
        y: p.jointY,
        active: false,
        climbed: false,
        glow: 0,
      }));
      state.skyLord = {
        hp: 10,
        maxHp: 10,
        cx: W * 0.5,
        cy: 78,
        phase: "intro",
        phaseT: 2.6,
        open: 0.25,
        lockOn: false,
        lockT: 0,
        lockAng: 0,
        pulse: 0,
        hitFlash: 0,
        stagger: 0,
        climbed: false,
        climbProgress: 0,
        podsNeeded: 4,
        windowHits: 0,
        choiceReady: false,
        dead: false,
        rainMul: 1,
      };
      if (nailRecruited) {
        state.nailAlly = {
          x: 110,
          y: H * 0.58,
          cd: 2.5,
          pulse: 0,
          smashTele: 0,
        };
        state.bossTaunt = 3.6;
        state.bossTauntText = "钉头跟上来了——掩体就绪。";
      } else {
        state.nailAlly = null;
        state.bossTaunt = 3.6;
        state.bossTauntText = SKY_LINES[0];
      }
      floatText(W / 2, 140, "Ch.4 蓝心开合", BLUE_HINT);
    }
  }

  // ——— Entities helpers ———
  function addParticle(x, y, opts) {
    opts = opts || {};
    state.particles.push({
      x, y,
      vx: opts.vx != null ? opts.vx : rand(-40, 40),
      vy: opts.vy != null ? opts.vy : rand(-60, -10),
      life: opts.life != null ? opts.life : rand(0.3, 0.9),
      maxLife: opts.life != null ? opts.life : rand(0.3, 0.9),
      r: opts.r != null ? opts.r : rand(1.5, 4),
      color: opts.color || RED,
      kind: opts.kind || "dot",
      rot: opts.rot || 0,
    });
  }

  function addAfterglow(x, y, opts) {
    opts = opts || {};
    if (!state.afterglows) state.afterglows = [];
    state.afterglows.push({
      x, y,
      r: opts.r || 4,
      life: opts.life || 0.35,
      maxLife: opts.life || 0.35,
      color: opts.color || RED,
      kind: opts.kind || "dot",
      len: opts.len || 0,
      ang: opts.ang || 0,
    });
  }

  function addInkBlot(x, y, big) {
    if (!state.inkBlots) state.inkBlots = [];
    state.inkBlots.push({
      x, y,
      r: big ? rand(18, 36) : rand(8, 16),
      life: big ? 1.4 : 0.8,
      maxLife: big ? 1.4 : 0.8,
      color: Math.random() < 0.55 ? RED : BLACK,
      lobes: irand(3, 6),
    });
  }

  function addTear(x, y, dirx, diry) {
    if (!state.tears) state.tears = [];
    for (let i = 0; i < 5; i++) {
      state.tears.push({
        x: x + rand(-8, 8),
        y: y + rand(-8, 8),
        vx: -dirx * rand(40, 140) + rand(-30, 30),
        vy: -diry * rand(40, 100) + rand(-40, 40),
        life: rand(0.25, 0.55),
        maxLife: 0.5,
        w: rand(8, 22),
        h: rand(3, 8),
      });
    }
  }

  function floatText(x, y, text, color) {
    state.floatTexts.push({
      x, y, text,
      color: color || BLACK,
      life: 1.2,
      vy: -30,
    });
  }

  function spawnRain(n) {
    for (let i = 0; i < n; i++) {
      state.bullets.push({
        type: "rain",
        x: rand(120, W - 120),
        y: rand(-80, -10),
        vx: rand(-20, 20),
        vy: rand(110, 180),
        r: rand(3, 5.5),
        alive: true,
        warn: 0.25,
        trail: [],
      });
    }
  }

  function spawnSlash() {
    const fromLeft = Math.random() < 0.5;
    const y = rand(120, H - 120);
    state.slashBursts.push({
      x: fromLeft ? -20 : W + 20,
      y,
      vx: fromLeft ? rand(220, 320) : -rand(220, 320),
      vy: rand(-40, 40),
      len: rand(28, 48),
      life: 2.2,
      alive: true,
      warned: 0.35,
      warnT: 0.35,
      trail: [],
    });
  }

  function spawnRing(cx, cy) {
    state.rings.push({
      x: cx,
      y: cy,
      r: 8,
      maxR: rand(90, 140),
      speed: rand(70, 110),
      life: 1.6,
      alive: true,
      warned: 0.4,
      warnT: 0.4,
    });
  }

  // ——— Combat ———
  function trySpear() {
    if (state.spearCd > 0 || state.dashTimer > 0) return;
    state.spearCd = 0.28;
    state.spearActive = 0.14;
    const tipX = state.px + state.facing * 58;
    const tipY = state.py + 12;
    for (const tw of state.towers) {
      if (!tw.alive) continue;
      const bx = tw.x + tw.w / 2;
      const by = Math.min(state.groundY - 8, tw.yp + tw.h + 10);
      const dx = tipX - bx;
      const dy = tipY - by;
      if (dx * dx + dy * dy < 72 * 72) {
        tw.hp -= 1;
        tw.crack = Math.min(1, (tw.maxHp - tw.hp) / tw.maxHp);
        state.score += 50;
        floatText(bx, by - 20, tw.symbol + "!", RED);
        for (let i = 0; i < 10; i++) addParticle(bx, by, { color: RED, vy: rand(-80, -20) });
        addInkBlot(bx + rand(-10, 10), by + rand(-10, 10), false);
        state.cameraShake = 0.15;
        if (tw.hp <= 0) {
          tw.alive = false;
          state.score += 200;
          floatText(bx, by - 40, "塔裂！", BLACK);
          addInkBlot(bx, by - 40, true);
          addInkBlot(tw.x + tw.w / 2, tw.yp + tw.h / 2, true);
          for (let i = 0; i < 28; i++) {
            addParticle(tw.x + rand(0, tw.w), tw.yp + rand(0, tw.h), {
              color: Math.random() < 0.5 ? RED : BLACK,
              vx: rand(-120, 120),
              vy: rand(-100, 40),
              life: rand(0.5, 1.2),
              kind: Math.random() < 0.3 ? "shard" : "dot",
            });
          }
        }
      }
    }
    // Ch.2 boss face — only when walls cracked / vulnerable or smile gap large
    if (state.boss && !state.boss.dead) {
      const b = state.boss;
      const wallsDown = state.towers.filter((t) => !t.alive).length;
      const crackSum = state.towers.reduce((s, t) => s + (t.alive ? t.crack : 1), 0);
      b.vulnerable = wallsDown >= 1 || crackSum >= 1.2 || b.smile > 0.72;
      const faceR = 36 + b.smile * 18;
      const dx = tipX - b.cx;
      const dy = tipY - b.cy;
      if (b.vulnerable && b.stagger <= 0 && dx * dx + dy * dy < (faceR + 28) * (faceR + 28)) {
        b.hp -= 1;
        b.hitFlash = 0.35;
        b.stagger = 0.9;
        b.smile = Math.max(0.15, b.smile - 0.18);
        state.score += 120;
        state.cameraShake = 0.22;
        floatText(b.cx, b.cy - 50, "打脸！", RED);
        addInkBlot(b.cx, b.cy, true);
        for (let i = 0; i < 18; i++) addParticle(b.cx, b.cy, { color: Math.random() < 0.5 ? RED : BLACK, vx: rand(-140, 140), vy: rand(-120, 20) });
        if (b.hp <= 0) {
          b.dead = true;
          b.hp = 0;
          state.score += 500;
          floatText(b.cx, b.cy - 70, "城魂裂开！", BLACK);
          for (const tw of state.towers) {
            if (tw.alive) {
              tw.alive = false;
              tw.hp = 0;
            }
          }
          for (let i = 0; i < 50; i++) {
            addParticle(b.cx + rand(-40, 40), b.cy + rand(-40, 40), {
              color: Math.random() < 0.55 ? RED : BLACK,
              life: rand(0.7, 1.5),
              vx: rand(-160, 160),
              vy: rand(-140, 40),
            });
          }
        }
      } else if (!b.vulnerable && dx * dx + dy * dy < (faceR + 40) * (faceR + 40)) {
        floatText(b.cx, tipY - 20, "先拆墙！", BLACK);
      }
    }
    // Ch.3 钉头 — 可矛戳；血空=击败；收编靠挡蓝心
    if (state.nail && !state.nail.dead && !state.nail.recruited) {
      const n = state.nail;
      const dx = tipX - n.cx;
      const dy = tipY - n.cy;
      const hitR = 55;
      if (n.stagger <= 0 && dx * dx + dy * dy < hitR * hitR) {
        n.hp -= 1;
        n.hitFlash = 0.35;
        n.stagger = 0.55;
        n.persuasion = Math.max(0, n.persuasion - 8);
        state.score += 80;
        state.cameraShake = 0.18;
        floatText(n.cx, n.cy - 60, "钉裂！", RED);
        addInkBlot(n.cx, n.cy, true);
        for (let i = 0; i < 14; i++) addParticle(n.cx, n.cy, { color: Math.random() < 0.5 ? RED : BLACK, vx: rand(-120, 120), vy: rand(-100, 20) });
        if (n.hp <= 0) {
          n.dead = true;
          n.hp = 0;
          state.ch3Outcome = "defeat";
          nailRecruited = false;
          state.score += 400;
          floatText(n.cx, n.cy - 80, "哨兵倒下", BLACK);
          state.bossTaunt = 2.5;
          state.bossTauntText = "旁白：一矛了结。路上少了一座锤子。";
          for (let i = 0; i < 40; i++) {
            addParticle(n.cx + rand(-30, 30), n.cy + rand(-50, 30), {
              color: Math.random() < 0.5 ? RED : BLACK,
              life: rand(0.6, 1.4),
              vx: rand(-140, 140),
              vy: rand(-120, 40),
            });
          }
        }
      }
    }

    // Ch.4 pods / blue heart / ending choice
    if (state.chapter === 4 && state.skyLord) {
      const lord = state.skyLord;
      if (lord.choiceReady && state.choiceTargets) {
        for (const ct of state.choiceTargets) {
          if (!ct.alive) continue;
          const dx = tipX - ct.x;
          const dy = tipY - ct.y;
          if (dx * dx + dy * dy < 55 * 55) {
            ct.alive = false;
            state.ch4Ending = ct.ending;
            lord.dead = true;
            state.score += ct.ending === "B" ? 800 : 600;
            floatText(ct.x, ct.y - 40, ct.ending === "B" ? "还要！" : "扎进蓝心！", ct.ending === "B" ? BLACK : BLUE_HINT);
            for (let i = 0; i < 40; i++) {
              addParticle(ct.x + rand(-30, 30), ct.y + rand(-30, 30), {
                color: ct.ending === "B" ? BLACK : BLUE_HINT,
                life: rand(0.7, 1.5),
                vx: rand(-140, 140),
                vy: rand(-120, 20),
              });
            }
            state.bossTaunt = 3.2;
            state.bossTauntText = ct.ending === "B"
              ? "旁白：最后一矛扎进「还要」。蓝心闭合。"
              : "旁白：蓝心被扎穿。红雨暂停。——名字，也被吞掉。";
            state.cameraShake = 0.35;
            return;
          }
        }
      }
      if (!lord.choiceReady) {
        for (const pod of state.pods) {
          if (!pod.alive) continue;
          const dx = tipX - pod.x;
          const dy = tipY - pod.y;
          if (dx * dx + dy * dy < 48 * 48) {
            pod.hp -= 1;
            pod.hitFlash = 0.3;
            state.score += 60;
            state.cameraShake = 0.14;
            floatText(pod.x, pod.y - 28, "荚裂！", RED);
            addInkBlot(pod.x, pod.y, false);
            for (let i = 0; i < 10; i++) addParticle(pod.x, pod.y, { color: Math.random() < 0.5 ? RED : BLACK });
            if (pod.hp <= 0) {
              pod.alive = false;
              state.score += 150;
              floatText(pod.x, pod.y - 48, "圆荚爆碎", BLACK);
              addInkBlot(pod.x, pod.y, true);
              spawnRing(pod.x, pod.y);
              spawnRain(5);
              const ji = state.joints[pod.id];
              if (ji) { ji.active = true; ji.glow = 1; }
              for (let i = 0; i < 24; i++) {
                addParticle(pod.x + rand(-20, 20), pod.y + rand(-20, 20), {
                  color: Math.random() < 0.55 ? RED : BLACK,
                  life: rand(0.5, 1.2),
                  vx: rand(-160, 160),
                  vy: rand(-120, 40),
                });
              }
            }
          }
        }
        if (lord.phase === "window" && lord.stagger <= 0 && !lord.dead) {
          const dx = tipX - lord.cx;
          const dy = tipY - lord.cy;
          const reach = lord.climbed ? 95 : 70;
          if (dx * dx + dy * dy < reach * reach) {
            const dmg = lord.climbed ? 2 : 1;
            lord.hp -= dmg;
            lord.hitFlash = 0.4;
            lord.stagger = 0.7;
            lord.windowHits += 1;
            state.score += 100 * dmg;
            state.cameraShake = 0.22;
            floatText(lord.cx, lord.cy + 40, lord.climbed ? "蓝心窗！" : "擦到蓝心", BLUE_HINT);
            addInkBlot(lord.cx, lord.cy + 20, true);
            for (let i = 0; i < 16; i++) addParticle(lord.cx, lord.cy + 10, { color: BLUE_HINT, vx: rand(-100, 100), vy: rand(20, 100) });
            if (lord.hp <= 0) {
              lord.hp = 0;
              enterCh4Choice();
            }
          } else if (!lord.climbed && dy < 0) {
            floatText(state.px, state.py - 40, "先攀关节！", BLACK);
          }
        }
      }
    }

    for (const b of state.bullets) {
      if (!b.alive) continue;
      const dx = tipX - b.x;
      const dy = tipY - b.y;
      if (dx * dx + dy * dy < 40 * 40) {
        b.alive = false;
        addParticle(b.x, b.y, { color: RED });
        addAfterglow(b.x, b.y, { r: b.r * 1.5, life: 0.3 });
        state.score += 5;
      }
    }
    // spear can also pop tooth blades

    for (const b of state.bullets) {
      if (!b.alive || b.type !== "tooth") continue;
      const dx = tipX - b.x;
      const dy = tipY - b.y;
      if (dx * dx + dy * dy < 48 * 48) {
        b.alive = false;
        addParticle(b.x, b.y, { color: BLACK });
        state.score += 8;
      }
    }
  }

  function tryBlock() {
    if (state.blockCd > 0 || state.dashTimer > 0) return;
    state.blocking = true;
  }

  function tryDash() {
    if (state.dashCd > 0 || state.dashTimer > 0) return;
    let dx = 0, dy = 0;
    if (pressed("KeyA") || pressed("ArrowLeft")) dx -= 1;
    if (pressed("KeyD") || pressed("ArrowRight")) dx += 1;
    if (pressed("KeyW") || pressed("ArrowUp")) dy -= 1;
    if (pressed("KeyS") || pressed("ArrowDown")) dy += 1;
    if (dx === 0 && dy === 0) {
      dx = state.facing;
    }
    const len = Math.hypot(dx, dy) || 1;
    state.dashDir = { x: dx / len, y: dy / len };
    state.dashTimer = 0.22;
    state.dashCd = 0.85;
    state.invuln = Math.max(state.invuln, 0.28);
    state.dashes += 1;
    state.cameraShake = 0.1;
    addTear(state.px, state.py, state.dashDir.x, state.dashDir.y);
    for (let i = 0; i < 12; i++) {
      addParticle(state.px, state.py, {
        color: BLACK,
        vx: -state.dashDir.x * rand(40, 120),
        vy: -state.dashDir.y * rand(40, 120) + rand(-20, 20),
        life: 0.35,
        kind: "tear",
      });
    }
    if (Math.random() < 0.45) {
      state.forgetFlash = 2.4;
      state.forgetText = pick(FORGET_LINES);
      state.forgetChars = state.forgetText.split("").map((ch, i) => ({
        ch,
        drop: 0,
        delay: i * 0.04 + rand(0, 0.08),
        gone: false,
      }));
      state.forgets += 1;
    }
  }

  function hurtPlayer(amount, srcX, srcY) {
    if (state.invuln > 0 || state.dashTimer > 0) return;
    if (state.blocking) {
      state.score += 15;
      state.blockPulse = 0.35;
      floatText(state.px, state.py - 30, "格挡!", BLACK);
      for (let i = 0; i < 6; i++) {
        addParticle(state.px, state.py, {
          color: RED,
          vx: (state.px - srcX) * 0.5 + rand(-40, 40),
          vy: rand(-60, -10),
        });
      }
      addAfterglow(state.px, state.py, { r: 22, life: 0.25, kind: "ring" });
      state.blockCd = 0.15;
      return;
    }
    state.hp -= amount;
    state.invuln = 0.9;
    state.cameraShake = 0.25;
    state.hitWrinkle = 0.55;
    floatText(state.px, state.py - 40, "-" + amount, RED);
    for (let i = 0; i < 14; i++) addParticle(state.px, state.py, { color: RED });
    addInkBlot(state.px + rand(-15, 15), state.py + rand(-10, 10), false);
    if (state.hp <= 0) {
      state.hp = 0;
      state.mode = "lose";
    }
  }

  function playerHitbox() {
    return { x: state.px, y: state.py, r: 18 };
  }


  function spawnToothFan(cx, cy, n, spread) {
    n = n || 5;
    spread = spread == null ? 0.9 : spread;
    const base = Math.atan2(state.py - cy, state.px - cx);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const ang = base + (t - 0.5) * spread;
      const spd = rand(150, 210);
      state.bullets.push({
        type: "tooth",
        x: cx + Math.cos(ang) * 20,
        y: cy + Math.sin(ang) * 14,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 7,
        alive: true,
        warn: 0.18,
        trail: [],
        rot: ang,
      });
    }
  }

  function updateBoss(dt) {
    const b = state.boss;
    if (!b || b.dead) return;
    b.pulse += dt;
    if (b.hitFlash > 0) b.hitFlash -= dt;
    if (b.stagger > 0) {
      b.stagger -= dt;
      return;
    }
    // smile grows slowly over fight, resets a bit after attacks
    b.smile = clamp(b.smile + dt * 0.035, 0.15, 1);
    b.mouthOpen = 0.15 + b.smile * 0.75;

    const wallsDown = state.towers.filter((t) => !t.alive).length;
    const crackSum = state.towers.reduce((s, t) => s + (t.alive ? t.crack : 1), 0);
    b.vulnerable = wallsDown >= 1 || crackSum >= 1.2 || b.smile > 0.72;

    b.phaseT -= dt;
    if (b.phase === "intro") {
      if (b.phaseT <= 0) {
        b.phase = "glare";
        b.phaseT = 2.4;
        state.bossTaunt = 2.2;
        state.bossTauntText = BOSS_LINES[3];
      }
      return;
    }

    if (b.phase === "glare") {
      b.glareT = 1;
      // slow player in glare cone (facing left from face)
      const ang = Math.atan2(state.py - b.cy, state.px - b.cx);
      const toPlayer = Math.hypot(state.px - b.cx, state.py - b.cy);
      const cone = 0.55;
      const aim = Math.PI; // mostly leftward
      let diff = Math.abs(((ang - aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      // simpler: if player is left of face and within vertical band
      if (state.px < b.cx - 20 && Math.abs(state.py - b.cy) < 90 + b.smile * 40 && toPlayer < 520) {
        state.speedMul = 0.42;
        if (Math.random() < 0.08) addParticle(state.px, state.py - 20, { color: BLUE_HINT, r: 2, life: 0.3, vy: rand(-20, -5) });
      } else {
        state.speedMul = 1;
      }
      if (b.phaseT <= 0) {
        state.speedMul = 1;
        b.glareT = 0;
        b.phase = "teeth";
        b.phaseT = 2.8;
        state.bossTaunt = 2.0;
        state.bossTauntText = BOSS_LINES[1];
      }
      return;
    }

    if (b.phase === "teeth") {
      state.speedMul = 1;
      // fire tooth fans periodically
      if (!b._toothCd) b._toothCd = 0;
      b._toothCd -= dt;
      if (b._toothCd <= 0) {
        const n = 4 + Math.floor(b.smile * 3);
        spawnToothFan(b.cx - 10, b.cy + 8, n, 0.7 + b.smile * 0.5);
        b._toothCd = 0.55;
        // bigger smile = denser but also more gaps between waves
        if (b.smile > 0.6 && Math.random() < 0.4) b._toothCd = 0.95;
      }
      // ambient rain lighter during teeth
      if (Math.random() < 0.02) spawnRain(2);
      if (b.phaseT <= 0) {
        b.phase = "clamp";
        b.phaseT = 3.5;
        state.bossTaunt = 2.4;
        state.bossTauntText = BOSS_LINES[2];
        state.crushWarn = 0.8;
      }
      return;
    }

    if (b.phase === "clamp") {
      state.speedMul = 1;
      // accelerate wall close; smile gap means center is safer from teeth
      const bothAlive = state.towers[0].alive && state.towers[1].alive;
      if (bothAlive) {
        const boost = 1.6 + b.smile * 0.8;
        state.towers[0].x += state.towers[0].closeSpeed * dt * 0.7 * boost;
        state.towers[1].x -= state.towers[1].closeSpeed * dt * 0.7 * boost;
      }
      // gap projectiles: when smile large, shoot around gap leaving center clear
      if (!b._gapCd) b._gapCd = 0;
      b._gapCd -= dt;
      if (b._gapCd <= 0) {
        const gapY = b.cy + Math.sin(state.t * 2) * 30;
        const gapH = 40 + b.smile * 70; // bigger smile = bigger safe gap
        // rain above and below gap
        for (let i = 0; i < 3; i++) {
          state.bullets.push({
            type: "rain",
            x: rand(140, W - 200),
            y: -20,
            vx: rand(-15, 15),
            vy: rand(130, 180),
            r: rand(3, 5),
            alive: true,
            warn: 0.2,
            trail: [],
            _avoidY: gapY,
            _avoidH: gapH,
          });
        }
        spawnToothFan(b.cx - 10, b.cy - gapH * 0.35, 3, 0.45);
        spawnToothFan(b.cx - 10, b.cy + gapH * 0.35, 3, 0.45);
        b._gapCd = 0.7;
      }
      if (b.phaseT <= 0) {
        b.phase = "glare";
        b.phaseT = 2.2;
        b.smile = clamp(b.smile + 0.08, 0.2, 1);
        state.bossTaunt = 1.8;
        state.bossTauntText = pick(BOSS_LINES);
      }
      return;
    }
  }

  function playerInSafeZone() {
    if (!state.safeZones) return false;
    for (const z of state.safeZones) {
      if (z.life <= 0) continue;
      const d = Math.hypot(state.px - z.x, state.py - z.y);
      if (d < z.r) return true;
    }
    return false;
  }

  function nailInSafeZone(n) {
    if (!state.safeZones) return false;
    for (const z of state.safeZones) {
      if (z.life <= 0) continue;
      const d = Math.hypot(n.cx - z.x, n.cy - z.y);
      if (d < z.r + 20) return true;
    }
    return false;
  }

  function spawnTentacleGrab(n) {
    const ang = Math.atan2(state.py - n.cy, state.px - n.cx);
    const len = 40 + rand(20, 50);
    state.tentacles.push({
      x0: n.cx,
      y0: n.cy - 50,
      x1: n.cx + Math.cos(ang) * len,
      y1: n.cy - 50 + Math.sin(ang) * len,
      tx: state.px,
      ty: state.py,
      life: 1.1,
      maxLife: 1.1,
      grabbed: false,
      warn: 0.35,
    });
  }

  function updateNailhead(dt) {
    const n = state.nail;
    if (!n || n.dead || n.recruited) return;
    n.pulse += dt;
    n.bob = Math.sin(n.pulse * 2.2) * 4;
    n.sway = Math.sin(n.pulse * 1.4) * 6;
    if (n.hitFlash > 0) n.hitFlash -= dt;
    if (n.stagger > 0) {
      n.stagger -= dt;
      return;
    }
    if (n.fear > 0) n.fear = Math.max(0, n.fear - dt);

    // blue eye schedule
    const eye = state.blueEye;
    if (eye) {
      eye.open = 0.25 + 0.2 * Math.sin(state.t * 1.5);
      if (!eye.beamOn) {
        eye.nextBeam -= dt;
        if (eye.nextBeam <= 0) {
          eye.beamOn = true;
          eye.beamT = 3.6;
          eye.beamAng = -0.25;
          state.bossTaunt = 2.4;
          state.bossTauntText = NAIL_LINES[3];
        }
      } else {
        eye.beamT -= dt;
        eye.beamAng += eye.beamSweep * dt;
        // beam line from eye downward
        const beamLen = H - 40;
        const bx2 = eye.x + Math.sin(eye.beamAng) * beamLen;
        const by2 = eye.y + Math.cos(eye.beamAng) * beamLen * 0.15 + beamLen * 0.85;
        // approximate beam as thick segment from eye to ground along angle
        const ang = Math.PI / 2 + eye.beamAng; // mostly downward with sweep
        const ex = eye.x + Math.cos(ang) * 20;
        const ey = eye.y + 20;
        const endX = eye.x + Math.sin(eye.beamAng) * 420;
        const endY = H - 50;

        function distToBeam(px, py) {
          return pointSegDist(px, py, eye.x, eye.y + 10, endX, endY);
        }

        const pDist = distToBeam(state.px, state.py);
        const nDist = distToBeam(n.cx, n.cy);
        const pSafe = playerInSafeZone();
        const nSafe = nailInSafeZone(n);
        const playerShielding = Math.hypot(state.px - n.cx, state.py - n.cy) < 95 && (state.blocking || pSafe);

        if (pDist < 34 && !pSafe && state.invuln <= 0) {
          hurtPlayer(1, eye.x, eye.y);
        }

        // beam near nail, or both sheltering in safe zone while beam is on
        if (nDist < 72 || (nSafe && eye.beamOn)) {
          if (nSafe || playerShielding) {
            // help: persuasion up
            n.persuasion = Math.min(n.maxPersuasion, n.persuasion + dt * 42);
            if (Math.random() < 0.08) {
              floatText(n.cx, n.cy - 70, "挡眼！", BLUE_HINT);
              addParticle(n.cx, n.cy - 40, { color: BLUE_HINT, r: 2, life: 0.4, vy: -30 });
            }
            if (n.persuasion >= n.maxPersuasion) {
              n.recruited = true;
              n.persuasion = n.maxPersuasion;
              state.ch3Outcome = "recruit";
              nailRecruited = true;
              state.score += 600;
              state.bossTaunt = 3.0;
              state.bossTauntText = NAIL_LINES[4];
              floatText(n.cx, n.cy - 90, "收编！", BLACK);
              for (let i = 0; i < 30; i++) {
                addParticle(n.cx + rand(-20, 20), n.cy + rand(-40, 20), {
                  color: BLUE_HINT,
                  life: rand(0.5, 1.2),
                  vx: rand(-80, 80),
                  vy: rand(-100, -10),
                });
              }
              // clear hostile tentacles
              state.tentacles = [];
              return;
            }
          } else {
            n.fear = 1.2;
            n.persuasion = Math.max(0, n.persuasion - dt * 12);
            if (Math.random() < 0.06) floatText(n.cx, n.cy - 50, "怕蓝心…", RED);
          }
        }

        if (eye.beamT <= 0) {
          eye.beamOn = false;
          eye.nextBeam = 4.5 + rand(0, 1.5);
        }
      }
    }

    // safe zones decay
    for (const z of state.safeZones) z.life -= dt;
    state.safeZones = state.safeZones.filter((z) => z.life > 0);

    // tentacles update
    for (const t of state.tentacles) {
      if (t.warn > 0) {
        t.warn -= dt;
        // grow toward target
        const k = 1 - t.warn / 0.35;
        t.x1 = t.x0 + (t.tx - t.x0) * k * 0.85;
        t.y1 = t.y0 + (t.ty - t.y0) * k * 0.85;
        continue;
      }
      t.life -= dt;
      // track player a bit
      t.x1 += (state.px - t.x1) * dt * 1.8;
      t.y1 += (state.py - t.y1) * dt * 1.8;
      const d = Math.hypot(state.px - t.x1, state.py - t.y1);
      if (!t.grabbed && d < 26) {
        t.grabbed = true;
        hurtPlayer(1, t.x1, t.y1);
        // pull slightly
        state.px += (t.x0 - state.px) * 0.12;
        state.py += (t.y0 - state.py) * 0.12;
        floatText(state.px, state.py - 35, "卷住！", RED);
      }
    }
    state.tentacles = state.tentacles.filter((t) => t.life > 0 || t.warn > 0);

    // smash telegraph damage
    if (n.smashTele > 0) {
      n.smashTele -= dt;
      if (n.smashTele <= 0) {
        // impact
        state.cameraShake = 0.3;
        addInkBlot(n.smashX, n.smashY, true);
        for (let i = 0; i < 20; i++) {
          addParticle(n.smashX, n.smashY, { color: RED, vx: rand(-100, 100), vy: rand(-80, 10) });
        }
        const d = Math.hypot(state.px - n.smashX, state.py - n.smashY);
        if (d < 55) hurtPlayer(2, n.smashX, n.smashY);
        // create safe zone (larger than smash hurt)
        state.safeZones.push({
          x: n.smashX,
          y: n.smashY,
          r: 78,
          life: 5.5,
          maxLife: 5.5,
        });
        floatText(n.smashX, n.smashY - 40, "安全区", BLACK);
        state.bossTaunt = 1.8;
        state.bossTauntText = NAIL_LINES[2];
      }
    }

    n.phaseT -= dt;
    if (n.phase === "intro") {
      if (n.phaseT <= 0) {
        n.phase = "tentacle";
        n.phaseT = 3.2;
        state.bossTaunt = 2.0;
        state.bossTauntText = NAIL_LINES[1];
      }
      return;
    }

    if (n.phase === "tentacle") {
      n.tentCd -= dt;
      if (n.tentCd <= 0) {
        spawnTentacleGrab(n);
        if (Math.random() < 0.45) spawnTentacleGrab(n);
        n.tentCd = 0.85;
      }
      if (Math.random() < 0.015) spawnRain(2);
      if (n.phaseT <= 0) {
        n.phase = "smash";
        n.phaseT = 2.8;
        n.smashX = clamp(state.px + rand(-40, 40), 120, W - 120);
        n.smashY = clamp(state.py + rand(-30, 30), 140, H - 80);
        n.smashTele = 1.15;
        state.crushWarn = 0.9;
        state.bossTaunt = 2.0;
        state.bossTauntText = NAIL_LINES[2];
      }
      return;
    }

    if (n.phase === "smash") {
      if (n.phaseT <= 0) {
        // after smash, force a beam window soon if not already
        if (eye && !eye.beamOn) eye.nextBeam = Math.min(eye.nextBeam, 1.2);
        n.phase = "beamwait";
        n.phaseT = 3.8;
        state.bossTaunt = 2.2;
        state.bossTauntText = NAIL_LINES[0];
      }
      return;
    }

    if (n.phase === "beamwait") {
      // ambient light patterns; player should use safe zones when beam comes
      if (Math.random() < 0.02) spawnRain(3);
      if (n.phaseT <= 0) {
        n.phase = "tentacle";
        n.phaseT = 3.0;
        state.bossTaunt = 1.6;
        state.bossTauntText = pick(NAIL_LINES);
      }
      return;
    }
  }

  function enterCh4Choice() {
    const lord = state.skyLord;
    if (!lord || lord.choiceReady) return;
    lord.choiceReady = true;
    lord.phase = "choice";
    lord.phaseT = 99;
    lord.lockOn = false;
    lord.open = 0.85;
    state.bullets = [];
    state.slashBursts = [];
    state.rings = [];
    state.choiceTargets = [
      {
        ending: "A",
        x: lord.cx,
        y: lord.cy + 55,
        alive: true,
        label: "A 扎蓝心",
        sub: "红雨暂停 · 名字被吞",
      },
      {
        ending: "B",
        x: state.px,
        y: state.py - 55,
        alive: true,
        label: "B 扎「还要」",
        sub: "正史 · 雨变细 · 龙睡着",
      },
    ];
    state.bossTaunt = 4.5;
    state.bossTauntText = SKY_LINES[7];
    floatText(W / 2, 160, "最后一矛——选边", RED);
  }

  function playerInNailCover() {
    if (!state.safeZones) return false;
    for (const z of state.safeZones) {
      if (Math.hypot(state.px - z.x, state.py - z.y) < z.r * 0.85) return true;
    }
    return false;
  }

  function updateNailAlly(dt) {
    const a = state.nailAlly;
    if (!a) return;
    a.pulse += dt;
    a.cd -= dt;
    if (a.smashTele > 0) {
      a.smashTele -= dt;
      if (a.smashTele <= 0) {
        const sx = clamp(state.px + rand(-30, 30), 80, W - 80);
        const sy = clamp(state.py + rand(-20, 20), 140, H - 70);
        state.safeZones.push({ x: sx, y: sy, r: 85, life: 6.5, maxLife: 6.5 });
        floatText(sx, sy - 35, "钉头掩体！", BLUE_HINT);
        addInkBlot(sx, sy, false);
        for (let i = 0; i < 12; i++) addParticle(sx, sy, { color: BLUE_HINT, vy: rand(-60, -10) });
        state.bossTaunt = 1.6;
        state.bossTauntText = SKY_LINES[6];
        a.cd = 5.5;
      }
    } else if (a.cd <= 0) {
      a.smashTele = 0.9;
      a.cd = 99;
    }
    if (state.safeZones) {
      for (const z of state.safeZones) z.life -= dt;
      state.safeZones = state.safeZones.filter((z) => z.life > 0);
    }
  }

  function updateSkyLord(dt) {
    const lord = state.skyLord;
    if (!lord || lord.dead) return;
    lord.pulse += dt;
    if (lord.hitFlash > 0) lord.hitFlash -= dt;
    if (lord.stagger > 0) lord.stagger -= dt;

    if (lord.choiceReady && state.choiceTargets) {
      for (const ct of state.choiceTargets) {
        if (ct.ending === "B" && ct.alive) {
          ct.x += (state.px - ct.x) * dt * 4;
          ct.y += (state.py - 55 - ct.y) * dt * 4;
        }
        if (ct.ending === "A" && ct.alive) {
          ct.x = lord.cx + Math.sin(lord.pulse * 2) * 4;
          ct.y = lord.cy + 55;
        }
      }
      lord.open = 0.7 + 0.2 * Math.sin(lord.pulse * 3);
      return;
    }

    for (const pod of state.pods) {
      if (!pod.alive) continue;
      pod.pulse += dt;
      if (pod.hitFlash > 0) pod.hitFlash -= dt;
      pod.explodeCd -= dt;
      if (pod.explodeCd <= 0) {
        pod.explodeCd = 3.2 + rand(0, 1.2);
        spawnRing(pod.x, pod.y);
        spawnRain(3);
        const d = Math.hypot(state.px - pod.x, state.py - pod.y);
        if (d < 70 && !playerInNailCover()) {
          hurtPlayer(1, pod.x, pod.y);
        }
        floatText(pod.x, pod.y - 30, "荚爆", RED);
        for (let i = 0; i < 10; i++) addParticle(pod.x, pod.y, { color: RED });
      }
    }

    const podsLeft = state.pods.filter((p) => p.alive).length;
    const podsDown = state.pods.length - podsLeft;

    for (const j of state.joints) {
      if (!j.active) continue;
      j.glow = Math.min(1, j.glow + dt * 0.5);
      const d = Math.hypot(state.px - j.x, state.py - j.y);
      if (d < 55) {
        lord.climbProgress = Math.min(100, lord.climbProgress + dt * 55);
        if (Math.random() < 0.1) floatText(j.x, j.y - 20, "攀…", BLACK);
        if (lord.climbProgress >= 100 && !lord.climbed) {
          lord.climbed = true;
          j.climbed = true;
          state.score += 200;
          floatText(state.px, state.py - 50, "攀上关节！", BLACK);
          state.bossTaunt = 2.2;
          state.bossTauntText = SKY_LINES[5];
          for (let i = 0; i < 20; i++) addParticle(j.x, j.y, { color: BLACK, vy: rand(-80, -20) });
        }
      }
    }

    if (lord.lockOn) {
      lord.lockT -= dt;
      lord.lockAng = Math.atan2(state.py - lord.cy, state.px - lord.cx);
      state.speedMul = playerInNailCover() ? 0.85 : 0.45;
      const rayLen = 520;
      const ex = lord.cx + Math.cos(lord.lockAng) * rayLen;
      const ey = lord.cy + Math.sin(lord.lockAng) * rayLen;
      const dist = pointSegDist(state.px, state.py, lord.cx, lord.cy, ex, ey);
      if (dist < 28 && !playerInNailCover() && state.invuln <= 0) {
        hurtPlayer(1, lord.cx, lord.cy);
      }
      if (lord.lockT <= 0) {
        lord.lockOn = false;
        state.speedMul = 1;
      }
    } else if (lord.phase !== "intro" && lord.phase !== "window") {
      state.speedMul = 1;
    }

    lord.phaseT -= dt;

    if (lord.phase === "intro") {
      lord.open = 0.2 + 0.1 * Math.sin(lord.pulse * 2);
      if (lord.phaseT <= 0) {
        lord.phase = "pods";
        lord.phaseT = 8;
        state.bossTaunt = 2.4;
        state.bossTauntText = SKY_LINES[1];
      }
      return;
    }

    if (lord.phase === "pods") {
      lord.open = 0.25 + 0.08 * Math.sin(lord.pulse * 4);
      if (Math.random() < 0.04 * lord.rainMul) spawnRain(2);
      if (podsDown >= lord.podsNeeded || (podsDown >= 3 && lord.phaseT <= 0) || (podsDown >= 2 && lord.phaseT <= -4)) {
        lord.phase = "climb";
        lord.phaseT = 7;
        state.pods.forEach((p, i) => {
          if (!p.alive && state.joints[i]) state.joints[i].active = true;
        });
        state.bossTaunt = 2.6;
        state.bossTauntText = SKY_LINES[5];
        floatText(W / 2, 130, "阴影关节可攀！", BLACK);
      } else if (lord.phaseT <= 0 && podsDown === 0) {
        lord.phaseT = 4;
        spawnRain(6);
      }
      return;
    }

    if (lord.phase === "climb") {
      lord.open = 0.35 + 0.1 * Math.sin(lord.pulse * 3);
      if (Math.random() < 0.025) spawnSlash();
      if (lord.climbed || lord.phaseT <= 0) {
        lord.phase = "lock";
        lord.phaseT = 3.2;
        lord.lockOn = true;
        lord.lockT = 2.8;
        state.bossTaunt = 2.4;
        state.bossTauntText = SKY_LINES[2];
        floatText(W / 2, 120, "蓝心锁定！", BLUE_HINT);
      }
      return;
    }

    if (lord.phase === "lock") {
      lord.open = 0.15;
      if (lord.phaseT <= 0) {
        lord.phase = "window";
        lord.phaseT = 3.8;
        lord.lockOn = false;
        lord.open = 0.95;
        state.speedMul = 1;
        state.bossTaunt = 2.5;
        state.bossTauntText = SKY_LINES[3];
        floatText(W / 2, 125, "蓝心开窗——输出！", BLUE_HINT);
      }
      return;
    }

    if (lord.phase === "window") {
      lord.open = 0.75 + 0.2 * Math.sin(lord.pulse * 6);
      if (Math.random() < 0.02) spawnRain(2);
      if (lord.phaseT <= 0) {
        if (lord.hp <= 0) {
          enterCh4Choice();
          return;
        }
        if (podsLeft > 0 && lord.windowHits < 2) {
          lord.phase = "pods";
          lord.phaseT = 5;
          state.bossTaunt = 2.0;
          state.bossTauntText = SKY_LINES[1];
        } else {
          lord.phase = "lock";
          lord.phaseT = 2.8;
          lord.lockOn = true;
          lord.lockT = 2.5;
          state.bossTaunt = 2.0;
          state.bossTauntText = SKY_LINES[2];
        }
      }
      return;
    }
  }


  // ——— Update ———
  function update(dt) {
    state.t += dt;

    // ambient rain always moves
    for (const d of rainFar) {
      d.y += d.vy * dt;
      if (d.y > H + 10) { d.y = -10; d.x = rand(0, W); }
    }
    for (const d of rainMid) {
      d.y += d.vy * dt;
      if (d.y > H + 10) { d.y = -10; d.x = rand(0, W); }
    }

    if (state.mode === "title") {
      for (const d of state.titleDots) {
        d.y += d.vy * dt;
        if (d.y > H + 10) {
          d.y = -10;
          d.x = rand(40, W - 40);
        }
      }
      return;
    }

    if (state.hitWrinkle > 0) state.hitWrinkle = Math.max(0, state.hitWrinkle - dt);
    if (state.blockPulse > 0) state.blockPulse = Math.max(0, state.blockPulse - dt);

    if (state.mode === "win" || state.mode === "lose") {
      for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      }
      state.particles = state.particles.filter((p) => p.life > 0);
      if (state.inkBlots) {
        for (const b of state.inkBlots) b.life -= dt;
        state.inkBlots = state.inkBlots.filter((b) => b.life > 0);
      }
      return;
    }

    state.invuln = Math.max(0, state.invuln - dt);
    state.spearCd = Math.max(0, state.spearCd - dt);
    state.spearActive = Math.max(0, state.spearActive - dt);
    state.dashCd = Math.max(0, state.dashCd - dt);
    state.blockCd = Math.max(0, state.blockCd - dt);
    state.forgetFlash = Math.max(0, state.forgetFlash - dt);
    state.cameraShake = Math.max(0, state.cameraShake - dt);
    state.crushWarn = Math.max(0, state.crushWarn - dt);

    // forget eraser chars
    if (state.forgetFlash > 0 && state.forgetChars && state.forgetChars.length) {
      const elapsed = 2.4 - state.forgetFlash;
      for (const c of state.forgetChars) {
        if (!c.gone && elapsed > c.delay + 0.6) {
          c.drop += dt * 40;
          if (c.drop > 28) c.gone = true;
        }
      }
    }

    let mx = 0, my = 0;
    if (pressed("KeyA") || pressed("ArrowLeft")) mx -= 1;
    if (pressed("KeyD") || pressed("ArrowRight")) mx += 1;
    if (pressed("KeyW") || pressed("ArrowUp")) my -= 1;
    if (pressed("KeyS") || pressed("ArrowDown")) my += 1;
    if (mx !== 0) state.facing = mx > 0 ? 1 : -1;

    if (state.bossTaunt > 0) state.bossTaunt = Math.max(0, state.bossTaunt - dt);
    // reset slow unless boss glare sets it
    if (!state.boss || state.boss.phase !== "glare") state.speedMul = 1;

    const speed = (state.dashTimer > 0 ? 520 : 210) * (state.dashTimer > 0 ? 1 : (state.speedMul || 1));
    if (state.dashTimer > 0) {
      state.dashTimer -= dt;
      state.vx = state.dashDir.x * speed;
      state.vy = state.dashDir.y * speed;
      if (!state.dashTrail) state.dashTrail = [];
      state.dashTrail.push({ x: state.px, y: state.py, life: 0.28, facing: state.facing });
    } else {
      const len = Math.hypot(mx, my);
      if (len > 0) {
        state.vx = (mx / len) * speed;
        state.vy = (my / len) * speed;
      } else {
        state.vx *= 0.8;
        state.vy *= 0.8;
      }
    }
    if (state.dashTrail) {
      for (const g of state.dashTrail) g.life -= dt;
      state.dashTrail = state.dashTrail.filter((g) => g.life > 0);
    }

    state.px += state.vx * dt;
    state.py += state.vy * dt;

    const leftBound = state.towers[0].alive
      ? state.towers[0].x + state.towers[0].w + 16
      : 40;
    const rightBound = state.towers[1].alive
      ? state.towers[1].x - 16
      : W - 40;
    state.px = Math.max(leftBound, Math.min(rightBound, state.px));
    state.py = Math.max(70, Math.min(state.groundY - 30, state.py));

    state.blocking = false;
    if (pressed("KeyK") || pressed("KeyX") || mouseDownR) tryBlock();
    if ((pressed("KeyJ") || pressed("KeyZ") || mouseDownL) && state.spearCd <= 0) trySpear();
    if (!state._dashHeld && (pressed("Space") || pressed("KeyL") || pressed("KeyC"))) {
      tryDash();
    }
    state._dashHeld = pressed("Space") || pressed("KeyL") || pressed("KeyC");

    // Ch.1 tower close; Ch.2 clamp; Ch.3/Ch.4 no towers
    if (state.chapter !== 3 && state.chapter !== 4 && (state.chapter !== 2 || !state.boss || state.boss.phase !== "clamp")) {
      const bothAlive = state.towers[0].alive && state.towers[1].alive;
      if (bothAlive) {
        const close = state.towers[0].closeSpeed * dt;
        const accel = 1 + state.t * 0.035 * (state.chapter === 2 ? 0.6 : 1);
        const rate = state.chapter === 2 ? 0.35 : 0.55;
        state.towers[0].x += close * rate * accel;
        state.towers[1].x -= close * rate * accel;
      }
    }
    if (state.chapter !== 3 && state.chapter !== 4) {
      const bothAlive = state.towers[0].alive && state.towers[1].alive;
      if (bothAlive) {
        const gap = state.towers[1].x - (state.towers[0].x + state.towers[0].w);
        if (gap < 110) state.crushWarn = 0.5;
        if (gap < 52) {
          hurtPlayer(5, state.px, state.py);
          if (state.hp <= 0) state.mode = "lose";
        }
      }
    }

    if (state.chapter === 2 && state.boss) {
      updateBoss(dt);
      state.patternTimer -= dt;
      if (state.patternTimer <= 0 && state.boss.phase !== "teeth") {
        if (Math.random() < 0.5) spawnRain(irand(3, 5));
        else spawnSlash();
        state.patternTimer = 1.4;
      }
    } else if (state.chapter === 3 && state.nail) {
      updateNailhead(dt);
      state.patternTimer -= dt;
      if (state.patternTimer <= 0 && state.nail.phase !== "smash") {
        if (Math.random() < 0.55) spawnRain(irand(2, 4));
        else spawnSlash();
        state.patternTimer = 1.6;
      }
    } else if (state.chapter === 4 && state.skyLord) {
      updateNailAlly(dt);
      updateSkyLord(dt);
      state.patternTimer -= dt;
      if (state.patternTimer <= 0 && !state.skyLord.choiceReady && state.skyLord.phase !== "window") {
        if (Math.random() < 0.6) spawnRain(irand(4, 7));
        else { spawnSlash(); if (Math.random() < 0.4) spawnRing(rand(150, W - 150), rand(160, H - 120)); }
        state.patternTimer = state.skyLord.phase === "pods" ? 0.85 : 1.2;
      }
    } else {
      state.patternTimer -= dt;
      if (state.patternTimer <= 0) {
        state.patternPhase = (state.patternPhase + 1) % 6;
        if (state.patternPhase === 0 || state.patternPhase === 1) {
          spawnRain(irand(5, 9));
          state.patternTimer = 0.9;
        } else if (state.patternPhase === 2 || state.patternPhase === 3) {
          spawnSlash();
          if (Math.random() < 0.5) spawnSlash();
          state.patternTimer = 1.1;
        } else if (state.patternPhase === 4) {
          spawnRing(rand(200, W - 200), rand(140, H - 160));
          state.patternTimer = 1.0;
        } else {
          spawnRain(4);
          spawnRing(state.px + rand(-80, 80), state.py + rand(-60, 60));
          state.patternTimer = 1.2;
        }
      }
    }

    const pb = playerHitbox();
    for (const b of state.bullets) {
      if (!b.alive) continue;
      if (b.warn > 0) {
        b.warn -= dt;
        continue;
      }
      if (!b.trail) b.trail = [];
      b.trail.push({ x: b.x, y: b.y, life: 0.25 });
      for (const t of b.trail) t.life -= dt;
      b.trail = b.trail.filter((t) => t.life > 0);
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y > H + 20 || b.x < -40 || b.x > W + 40) {
        b.alive = false;
        addAfterglow(b.x, clamp(b.y, 0, H), { r: b.r, life: 0.2 });
      } else {
        const dx = b.x - pb.x;
        const dy = b.y - pb.y;
        if (dx * dx + dy * dy < (pb.r + b.r) * (pb.r + b.r)) {
          b.alive = false;
          addAfterglow(b.x, b.y, { r: b.r * 2, life: 0.3 });
          if (state.chapter === 4 && typeof playerInNailCover === "function" && playerInNailCover()) {
            floatText(state.px, state.py - 28, "掩体挡雨", BLUE_HINT);
            state.score += 5;
          } else {
            hurtPlayer(1, b.x, b.y);
          }
        }
      }
    }
    state.bullets = state.bullets.filter((b) => b.alive);

    for (const s of state.slashBursts) {
      if (!s.alive) continue;
      if (s.warned > 0) {
        s.warned -= dt;
        continue;
      }
      if (!s.trail) s.trail = [];
      s.trail.push({ x: s.x, y: s.y, life: 0.2 });
      for (const t of s.trail) t.life -= dt;
      s.trail = s.trail.filter((t) => t.life > 0);
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0 || s.x < -80 || s.x > W + 80) {
        s.alive = false;
        addAfterglow(s.x, s.y, { r: 10, life: 0.25, kind: "slash", len: s.len, ang: s.vx > 0 ? 0 : Math.PI });
      } else {
        const x2 = s.x + (s.vx > 0 ? s.len : -s.len);
        const dist = pointSegDist(pb.x, pb.y, s.x, s.y, x2, s.y + s.vy * 0.05);
        if (dist < pb.r + 4) {
          s.alive = false;
          addAfterglow(s.x, s.y, { r: 12, life: 0.3, kind: "slash", len: s.len });
          hurtPlayer(1, s.x, s.y);
        }
      }
    }
    state.slashBursts = state.slashBursts.filter((s) => s.alive);

    for (const r of state.rings) {
      if (!r.alive) continue;
      if (r.warned > 0) {
        r.warned -= dt;
        continue;
      }
      r.r += r.speed * dt;
      r.life -= dt;
      if (r.r >= r.maxR || r.life <= 0) {
        r.alive = false;
        addAfterglow(r.x, r.y, { r: r.r, life: 0.35, kind: "ring" });
      } else {
        const d = Math.hypot(pb.x - r.x, pb.y - r.y);
        const band = 8;
        if (Math.abs(d - r.r) < band + pb.r * 0.5) {
          if (!r.hit) {
            r.hit = true;
            hurtPlayer(1, r.x, r.y);
          }
        }
      }
    }
    state.rings = state.rings.filter((r) => r.alive);

    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    if (state.afterglows) {
      for (const a of state.afterglows) a.life -= dt;
      state.afterglows = state.afterglows.filter((a) => a.life > 0);
    }
    if (state.inkBlots) {
      for (const b of state.inkBlots) b.life -= dt;
      state.inkBlots = state.inkBlots.filter((b) => b.life > 0);
    }
    if (state.tears) {
      for (const t of state.tears) {
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        t.life -= dt;
      }
      state.tears = state.tears.filter((t) => t.life > 0);
    }

    for (const f of state.floatTexts) {
      f.y += f.vy * dt;
      f.life -= dt;
    }
    state.floatTexts = state.floatTexts.filter((f) => f.life > 0);

    let cleared = false;
    if (state.chapter === 2) {
      cleared = !!(state.boss && state.boss.dead);
    } else if (state.chapter === 3) {
      cleared = !!(state.nail && (state.nail.dead || state.nail.recruited));
    } else if (state.chapter === 4) {
      cleared = !!state.ch4Ending;
    } else {
      cleared = !state.towers[0].alive && !state.towers[1].alive;
    }
    if (cleared) {
      state.winDelay += dt;
      if (state.winDelay > 0.7) {
        state.mode = "win";
        state.score += Math.floor(state.hp * 100);
        if (state.chapter === 1) unlockedCh2 = true;
        if (state.chapter === 2) unlockedCh3 = true;
        if (state.chapter === 3) {
          unlockedCh4 = true;
          if (state.ch3Outcome === "recruit") nailRecruited = true;
        }
        for (let i = 0; i < 40; i++) {
          let col = Math.random() < 0.6 ? RED : BLACK;
          if (state.chapter === 4) col = state.ch4Ending === "B" ? BLACK : BLUE_HINT;
          else if (state.chapter === 3 && state.ch3Outcome === "recruit") col = BLUE_HINT;
          addParticle(rand(100, W - 100), rand(100, H - 100), {
            color: col,
            life: rand(0.8, 1.6),
          });
        }
      }
    }
  }

  function pointSegDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const qx = x1 + t * dx;
    const qy = y1 + t * dy;
    return Math.hypot(px - qx, py - qy);
  }

  // ——— Draw ———
  function drawPaperBg() {
    ctx.drawImage(paperTex, 0, 0);
    // living faint fibers
    ctx.globalAlpha = 0.035;
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = ((i * 53 + state.t * 4) % H);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + Math.sin(state.t + i) * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    drawTornEdge();
  }

  function drawSkyline() {
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (const b of skyline) {
      const baseY = state.groundY - 8;
      const top = baseY - b.h;
      strokeJitterPoly(
        [
          [b.x, baseY],
          [b.x, top],
          [b.x + b.w * 0.3, top - (b.spikes > 0 ? 8 : 0)],
          [b.x + b.w * 0.55, top],
          [b.x + b.w, top + 4],
          [b.x + b.w, baseY],
        ],
        BLACK,
        1.2,
        0.8
      );
      if (b.spikes > 1) {
        strokeJitterLine(b.x + b.w * 0.7, top, b.x + b.w * 0.75, top - 12, RED, 1, 0.5, 2);
      }
    }
    ctx.restore();
  }

  function drawAmbientRain() {
    for (const d of rainFar) {
      ctx.globalAlpha = d.a;
      fillJitterEllipse(d.x, d.y, d.r, d.r * 1.3, RED, 0.3);
    }
    for (const d of rainMid) {
      ctx.globalAlpha = d.a;
      fillJitterEllipse(d.x, d.y, d.r, d.r * 1.4, RED, 0.4);
      strokeJitterEllipse(d.x, d.y, d.r, d.r * 1.4, BLACK, 0.6, 0.2);
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    // layered ground bands
    ctx.globalAlpha = 0.12;
    fillJitterPoly(
      [
        [0, state.groundY - 18],
        [W, state.groundY - 14],
        [W, H],
        [0, H],
      ],
      PAPER_DARK,
      1.5
    );
    ctx.globalAlpha = 0.08;
    fillJitterPoly(
      [
        [0, state.groundY + 6],
        [W, state.groundY + 10],
        [W, H],
        [0, H],
      ],
      "#d8cfc0",
      1
    );
    ctx.globalAlpha = 1;

    strokeJitterLine(16, state.groundY, W - 16, state.groundY, BLACK, 2.8, 1.6, 24);
    // second ground scribble
    ctx.globalAlpha = 0.45;
    strokeJitterLine(30, state.groundY + 7, W - 30, state.groundY + 9, BLACK, 1.4, 1.2, 16);
    ctx.globalAlpha = 1;
    // grass / ink ticks
    for (let x = 36; x < W - 36; x += 22) {
      const h = rand(5, 12);
      strokeJitterLine(x, state.groundY, x + rand(-5, 5), state.groundY - h, BLACK, 1.2, 0.7, 2);
      if (Math.random() < 0.25) {
        strokeJitterLine(x + 3, state.groundY, x + rand(2, 8), state.groundY - h * 0.6, RED, 1, 0.5, 2);
      }
    }
  }

  function drawHitWrinkle() {
    if (!state.hitWrinkle || state.hitWrinkle <= 0) return;
    const a = state.hitWrinkle / 0.55;
    ctx.save();
    ctx.globalAlpha = a * 0.45;
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 1.5;
    const cx = state.px;
    const cy = state.py;
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + state.t;
      const r0 = 20;
      const r1 = 70 + a * 40;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 0.7);
      for (let s = 1; s <= 6; s++) {
        const t = s / 6;
        const rr = r0 + (r1 - r0) * t;
        const wob = Math.sin(t * 8 + i) * 6 * a;
        ctx.lineTo(
          cx + Math.cos(ang) * rr + Math.cos(ang + 1.2) * wob,
          cy + Math.sin(ang) * rr * 0.7 + Math.sin(ang + 1.2) * wob * 0.6
        );
      }
      ctx.stroke();
    }
    // paper crease band
    ctx.globalAlpha = a * 0.2;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, cy - 8, W, 16 * a);
    ctx.restore();
  }

  function drawInkBlots() {
    if (!state.inkBlots) return;
    for (const b of state.inkBlots) {
      const a = Math.max(0, b.life / b.maxLife);
      ctx.globalAlpha = a * 0.55;
      const n = b.lobes || 4;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        const rr = b.r * (0.6 + 0.5 * Math.sin(i * 2.1 + state.t));
        pts.push([b.x + Math.cos(ang) * rr, b.y + Math.sin(ang) * rr * 0.85]);
      }
      fillJitterPoly(pts, b.color, 1.5);
      ctx.globalAlpha = a * 0.3;
      strokeJitterPoly(pts.concat([pts[0]]), BLACK, 1.2, 1);
      ctx.globalAlpha = 1;
    }
  }

  function drawTears() {
    if (!state.tears) return;
    for (const t of state.tears) {
      const a = Math.max(0, t.life / t.maxLife);
      ctx.globalAlpha = a * 0.7;
      fillJitterPoly(
        [
          [t.x, t.y],
          [t.x + t.w, t.y + rand(-2, 2)],
          [t.x + t.w * 0.7, t.y + t.h],
          [t.x - 2, t.y + t.h * 0.6],
        ],
        PAPER,
        1
      );
      strokeJitterPoly(
        [
          [t.x, t.y],
          [t.x + t.w, t.y],
          [t.x + t.w * 0.7, t.y + t.h],
          [t.x, t.y + t.h * 0.5],
          [t.x, t.y],
        ],
        BLACK,
        1.2,
        0.8
      );
      ctx.globalAlpha = 1;
    }
  }


  function drawBlueEye() {
    const eye = state.blueEye;
    if (!eye) return;
    const ex = eye.x + Math.sin(state.t * 0.8) * 2;
    const ey = eye.y;
    // distant limbs hint
    ctx.globalAlpha = 0.2;
    strokeJitterLine(ex - 60, ey - 10, ex - 20, ey + 5, BLACK, 2, 1.2, 5);
    strokeJitterLine(ex + 60, ey - 10, ex + 20, ey + 5, BLACK, 2, 1.2, 5);
    strokeJitterLine(ex - 40, ey + 15, ex - 80, ey + 50, RED, 1.5, 1, 4);
    strokeJitterLine(ex + 40, ey + 15, ex + 80, ey + 50, RED, 1.5, 1, 4);
    ctx.globalAlpha = 1;
    // blue heart / eye
    const open = 10 + eye.open * 14;
    fillJitterEllipse(ex, ey, 22, open, "rgba(74,122,181,0.35)", 1.2);
    strokeJitterEllipse(ex, ey, 22, open, BLACK, 2.4, 1.2);
    fillJitterEllipse(ex, ey, 8, 8, BLUE_HINT, 0.5);
    strokeJitterEllipse(ex, ey, 8, 8, BLACK, 1.2, 0.4);
    fillJitterEllipse(ex + 2, ey - 2, 2.5, 2.5, "#fff", 0.2);
    drawPencilText("蓝心", ex, ey - open - 14, 12, BLUE_HINT, "center");

    if (eye.beamOn) {
      const endX = eye.x + Math.sin(eye.beamAng) * 420;
      const endY = H - 50;
      ctx.globalAlpha = 0.14 + 0.06 * Math.sin(state.t * 14);
      ctx.strokeStyle = BLUE_HINT;
      ctx.lineWidth = 36;
      ctx.beginPath();
      ctx.moveTo(eye.x, eye.y + 10);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.globalAlpha = 0.45;
      strokeJitterLine(eye.x, eye.y + 10, endX, endY, BLUE_HINT, 3, 1.5, 12);
      ctx.globalAlpha = 0.7;
      drawPencilText("远光扫射", W / 2, 100, 14, BLUE_HINT, "center");
      ctx.globalAlpha = 1;
      // hint to help nail
      if (state.nail && !state.nail.recruited && !state.nail.dead) {
        ctx.globalAlpha = 0.55 + 0.3 * Math.sin(state.t * 8);
        drawPencilText("帮钉头挡蓝心一眼！（靠近+格挡 / 站安全区）", W / 2, 122, 13, BLACK, "center");
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawSafeZones() {
    if (!state.safeZones) return;
    for (const z of state.safeZones) {
      const a = Math.min(1, z.life / 1.2) * 0.85;
      ctx.globalAlpha = 0.12 * a;
      fillJitterEllipse(z.x, z.y, z.r, z.r * 0.7, BLUE_HINT, 2);
      ctx.globalAlpha = 0.55 * a;
      strokeJitterEllipse(z.x, z.y, z.r, z.r * 0.7, BLACK, 2, 1.5);
      strokeJitterEllipse(z.x, z.y, z.r - 8, z.r * 0.7 - 6, BLUE_HINT, 1.4, 1);
      // cross hatch safe mark
      hatchRect(z.x - z.r * 0.5, z.y - z.r * 0.35, z.r, z.r * 0.7, BLUE_HINT, 8, 28, 0.25 * a);
      ctx.globalAlpha = a;
      drawPencilText("无弹区", z.x, z.y - z.r * 0.55, 11, BLACK, "center");
      ctx.globalAlpha = 1;
    }
  }

  function drawTentacles() {
    if (!state.tentacles) return;
    for (const t of state.tentacles) {
      const a = t.warn > 0 ? 0.4 : 0.9;
      ctx.globalAlpha = a;
      // segmented tentacle
      const segs = 6;
      let px = t.x0, py = t.y0;
      for (let i = 1; i <= segs; i++) {
        const k = i / segs;
        const nx = t.x0 + (t.x1 - t.x0) * k + Math.sin(state.t * 8 + i) * 4;
        const ny = t.y0 + (t.y1 - t.y0) * k + Math.cos(state.t * 6 + i) * 3;
        strokeJitterLine(px, py, nx, ny, i % 2 ? RED : BLACK, t.warn > 0 ? 2 : 3.2, 1.2, 3);
        px = nx; py = ny;
      }
      fillJitterEllipse(t.x1, t.y1, 6, 6, RED, 0.8);
      strokeJitterEllipse(t.x1, t.y1, 6, 6, BLACK, 1.2, 0.4);
      if (t.warn > 0) {
        ctx.globalAlpha = 0.35;
        strokeJitterEllipse(t.tx, t.ty, 22, 16, RED, 1.5, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawNailhead() {
    const n = state.nail;
    if (!n) return;
    const cx = n.cx + n.sway + (n.hitFlash > 0 ? rand(-3, 3) : 0);
    const cy = n.cy + n.bob + (n.hitFlash > 0 ? rand(-2, 2) : 0);
    const alpha = n.recruited ? 0.85 : n.dead ? 0.35 : 1;
    ctx.globalAlpha = alpha;

    // smash telegraph
    if (n.smashTele > 0) {
      const k = 1 - n.smashTele / 1.15;
      ctx.globalAlpha = 0.25 + 0.35 * Math.sin(state.t * 16);
      strokeJitterEllipse(n.smashX, n.smashY, 50 + k * 10, 36 + k * 8, RED, 2.5, 1.5);
      drawPencilText("钉砸！", n.smashX, n.smashY - 50, 14, RED, "center");
      ctx.globalAlpha = alpha;
    }

    // body segments (vertical节状)
    const segH = 22;
    const segs = 5;
    const topY = cy - 70;
    for (let i = 0; i < segs; i++) {
      const sy = topY + i * segH;
      const sw = 18 + (i % 2) * 6;
      fillJitterEllipse(cx, sy, sw, 12, i % 2 ? "rgba(200,30,30,0.15)" : "rgba(26,26,26,0.08)", 1);
      strokeJitterEllipse(cx, sy, sw, 12, i % 2 ? RED : BLACK, 2.2, 1.1);
      // cross hatch
      hatchRect(cx - sw + 4, sy - 8, sw * 2 - 8, 14, BLACK, 6, 30, 0.2);
    }

    // tentacle crown (idle)
    for (let i = 0; i < 4; i++) {
      const a0 = -Math.PI / 2 + (i - 1.5) * 0.35;
      const len = 36 + Math.sin(n.pulse * 3 + i) * 8;
      const tx = cx + Math.cos(a0) * len;
      const ty = topY - 8 + Math.sin(a0) * len * 0.4 - 20;
      strokeJitterLine(cx, topY - 10, tx, ty, i % 2 ? RED : BLACK, 2.4, 1.3, 5);
      fillJitterEllipse(tx, ty, 4, 4, RED, 0.5);
    }

    // nail hammer head at bottom
    const nailY = cy + 55;
    // shaft
    strokeJitterLine(cx, cy + 30, cx, nailY + 10, BLACK, 4, 0.8, 4);
    strokeJitterLine(cx + 3, cy + 30, cx + 3, nailY + 10, RED, 1.5, 0.6, 3);
    // hammer / nail tip
    fillJitterPoly(
      [
        [cx - 28, nailY],
        [cx + 28, nailY],
        [cx + 18, nailY + 22],
        [cx - 18, nailY + 22],
      ],
      "rgba(200,30,30,0.25)",
      1.2
    );
    strokeJitterPoly(
      [
        [cx - 28, nailY],
        [cx + 28, nailY],
        [cx + 18, nailY + 22],
        [cx - 18, nailY + 22],
        [cx - 28, nailY],
      ],
      BLACK,
      2.8,
      1.2
    );
    // tip spike
    strokeJitterPoly(
      [
        [cx - 8, nailY + 22],
        [cx, nailY + 42],
        [cx + 8, nailY + 22],
        [cx - 8, nailY + 22],
      ],
      RED,
      2.2,
      0.8
    );

    // face scribble on mid segment
    const fy = topY + segH * 2;
    strokeJitterLine(cx - 8, fy - 2, cx - 3, fy, BLACK, 1.8, 0.4, 2);
    strokeJitterLine(cx + 3, fy, cx + 8, fy - 2, BLACK, 1.8, 0.4, 2);
    if (n.fear > 0) {
      strokeJitterLine(cx - 6, fy + 8, cx + 6, fy + 10, RED, 1.5, 0.5, 3);
      drawPencilText("怕！", cx + 40, fy, 12, RED, "left");
    } else if (n.recruited) {
      strokeJitterLine(cx - 8, fy + 10, cx, fy + 14, BLACK, 1.5, 0.5, 2);
      strokeJitterLine(cx, fy + 14, cx + 8, fy + 10, BLACK, 1.5, 0.5, 2);
    } else {
      strokeJitterLine(cx - 6, fy + 8, cx + 6, fy + 8, BLACK, 1.5, 0.4, 2);
    }

    if (n.hitFlash > 0) {
      ctx.globalAlpha = 0.4;
      fillJitterEllipse(cx, cy, 40, 70, "#fff", 2);
    }

    if (n.dead) {
      strokeJitterLine(cx - 25, cy - 40, cx + 20, cy + 30, BLACK, 2.5, 1, 4);
      strokeJitterLine(cx + 22, cy - 35, cx - 18, cy + 28, BLACK, 2.5, 1, 4);
      drawPencilText("哨兵安静了。", cx, cy + 80, 13, BLACK, "center");
    } else if (n.recruited) {
      drawPencilText("钉头：跟你走。", cx, cy + 80, 14, BLUE_HINT, "center");
      // ally aura
      ctx.globalAlpha = 0.3 + 0.15 * Math.sin(state.t * 5);
      strokeJitterEllipse(cx, cy, 50, 80, BLUE_HINT, 2, 1.5);
    }

    ctx.globalAlpha = 1;

    // HP + persuasion meters
    const hx = 14, hy = 54;
    drawTapeRect(hx, hy, 170, 18, RED);
    drawPencilText("节触哨·钉头", hx + 85, hy + 11, 12, BLACK, "center");
    for (let i = 0; i < n.maxHp; i++) {
      const x = hx + i * 18;
      const y = hy + 24;
      if (i < n.hp) {
        fillJitterEllipse(x + 6, y, 5, 6, RED, 0.5);
        strokeJitterEllipse(x + 6, y, 5, 6, BLACK, 1, 0.3);
      } else {
        strokeJitterEllipse(x + 6, y, 5, 6, BLACK, 1, 0.3);
      }
    }
    // persuasion bar
    drawTapeRect(hx, hy + 40, 170, 16, BLUE_HINT);
    const pw = (n.persuasion / n.maxPersuasion) * 162;
    if (pw > 2) {
      ctx.globalAlpha = 0.45;
      fillJitterPoly([[hx + 4, hy + 43], [hx + 4 + pw, hy + 43], [hx + 4 + pw, hy + 53], [hx + 4, hy + 53]], BLUE_HINT, 0.5);
      ctx.globalAlpha = 1;
    }
    drawPencilText("收编 " + Math.round(n.persuasion) + "%", hx + 85, hy + 50, 11, BLACK, "center");
    if (n.recruited) {
      drawPencilText("Ch.4 掩体钩子已就绪", hx + 200, hy + 50, 11, BLUE_HINT, "left");
    }
  }

  function drawCh3Decor() {
    // neutral sentinel posts
    const posts = [
      { x: 90, h: 90 },
      { x: W - 110, h: 110 },
      { x: 160, h: 60 },
    ];
    for (const p of posts) {
      ctx.globalAlpha = 0.35;
      strokeJitterLine(p.x, state.groundY, p.x, state.groundY - p.h, BLACK, 2, 1, 6);
      strokeJitterLine(p.x - 12, state.groundY - p.h, p.x + 12, state.groundY - p.h, RED, 1.5, 0.8, 3);
      ctx.globalAlpha = 1;
    }
    drawPencilText("中立哨区", 90, state.groundY - 100, 11, BLACK, "center");
  }


  function drawPodsAndJoints() {
    if (!state.pods) return;
    // limbs from sky lord to pods
    const lord = state.skyLord;
    if (lord) {
      for (const pod of state.pods) {
        ctx.globalAlpha = pod.alive ? 0.55 : 0.2;
        strokeJitterLine(lord.cx, lord.cy + 10, pod.jointX, pod.jointY, BLACK, 2.4, 1.2, 6);
        strokeJitterLine(pod.jointX, pod.jointY, pod.x, pod.y, RED, 2, 1.1, 5);
        ctx.globalAlpha = 1;
      }
    }
    // joints
    if (state.joints) {
      for (const j of state.joints) {
        if (!j.active) continue;
        const a = 0.35 + 0.35 * j.glow + 0.15 * Math.sin(state.t * 8);
        ctx.globalAlpha = a;
        strokeJitterEllipse(j.x, j.y, 22, 16, BLACK, 2.2, 1.2);
        hatchRect(j.x - 14, j.y - 10, 28, 20, BLACK, 5, 35, 0.35);
        drawPencilText(j.climbed ? "已攀" : "关节", j.x, j.y - 22, 11, BLACK, "center");
        ctx.globalAlpha = 1;
      }
    }
    // pods
    for (const pod of state.pods) {
      if (!pod.alive) {
        ctx.globalAlpha = 0.25;
        strokeJitterEllipse(pod.x, pod.y, 18, 14, BLACK, 1.5, 1);
        strokeJitterLine(pod.x - 12, pod.y - 10, pod.x + 12, pod.y + 10, BLACK, 1.5, 0.8, 3);
        ctx.globalAlpha = 1;
        continue;
      }
      const shake = pod.hitFlash > 0 ? rand(-3, 3) : 0;
      const px = pod.x + shake;
      const py = pod.y + shake + Math.sin(pod.pulse * 3) * 2;
      fillJitterEllipse(px, py, 22, 18, "rgba(200,30,30,0.22)", 1.2);
      strokeJitterEllipse(px, py, 22, 18, RED, 2.8, 1.3);
      strokeJitterEllipse(px, py, 14, 11, BLACK, 1.6, 0.9);
      hatchRect(px - 12, py - 10, 24, 20, BLACK, 5, 40, 0.3);
      // hp pips
      for (let i = 0; i < pod.maxHp; i++) {
        const hx = px - 12 + i * 12;
        if (i < pod.hp) fillJitterEllipse(hx, py + 26, 3.5, 3.5, RED, 0.3);
        else strokeJitterEllipse(hx, py + 26, 3.5, 3.5, BLACK, 1, 0.2);
      }
      if (pod.explodeCd < 0.6) {
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(state.t * 20);
        strokeJitterEllipse(px, py, 30, 24, RED, 2, 1.5);
        drawPencilText("爆!", px, py - 30, 12, RED, "center");
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawSkyLordBoss() {
    const lord = state.skyLord;
    if (!lord) return;
    const cx = lord.cx + (lord.hitFlash > 0 ? rand(-2, 2) : 0);
    const cy = lord.cy;
    // multi limbs silhouette
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI + (i / 5) * Math.PI;
      const len = 70 + (i % 2) * 30;
      strokeJitterLine(cx, cy, cx + Math.cos(ang) * len, cy + 20 + Math.sin(ang) * 40, i % 2 ? RED : BLACK, 2.2, 1.4, 5);
    }
    ctx.globalAlpha = 1;
    // body ridge
    strokeJitterPoly(
      [[cx - 50, cy + 5], [cx - 20, cy - 18], [cx + 20, cy - 18], [cx + 50, cy + 5], [cx + 30, cy + 28], [cx - 30, cy + 28], [cx - 50, cy + 5]],
      BLACK, 2.6, 1.5
    );
    hatchRect(cx - 40, cy - 10, 80, 35, BLACK, 7, 28, 0.2);
    // blue heart eye
    const open = 8 + lord.open * 22;
    fillJitterEllipse(cx, cy, 28, open, "rgba(74,122,181,0.45)", 1.4);
    strokeJitterEllipse(cx, cy, 28, open, BLACK, 3, 1.3);
    fillJitterEllipse(cx, cy, 10 + lord.open * 4, 10 + lord.open * 4, BLUE_HINT, 0.6);
    strokeJitterEllipse(cx, cy, 10 + lord.open * 4, 10 + lord.open * 4, BLACK, 1.4, 0.4);
    fillJitterEllipse(cx + 3, cy - 3, 3, 3, "#fff", 0.2);
    drawPencilText("天裂之主·蓝心", cx, cy - open - 16, 13, BLUE_HINT, "center");
    if (lord.hitFlash > 0) {
      ctx.globalAlpha = 0.35;
      fillJitterEllipse(cx, cy, 36, open + 8, "#fff", 2);
      ctx.globalAlpha = 1;
    }
    // lock ray
    if (lord.lockOn) {
      const rayLen = 520;
      const ex = lord.cx + Math.cos(lord.lockAng) * rayLen;
      const ey = lord.cy + Math.sin(lord.lockAng) * rayLen;
      ctx.globalAlpha = 0.12 + 0.06 * Math.sin(state.t * 16);
      ctx.strokeStyle = BLUE_HINT;
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.moveTo(lord.cx, lord.cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.globalAlpha = 0.7;
      strokeJitterLine(lord.cx, lord.cy, ex, ey, BLUE_HINT, 3, 1.5, 14);
      drawPencilText("锁定射线", W / 2, 108, 14, BLUE_HINT, "center");
      ctx.globalAlpha = 1;
    }
    if (lord.phase === "window") {
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(state.t * 10);
      strokeJitterEllipse(cx, cy, 40, open + 10, BLUE_HINT, 2.5, 1.5);
      drawPencilText(lord.climbed ? "窗开·可打！" : "窗开·攀高再打更疼", cx, cy + open + 28, 13, BLACK, "center");
      ctx.globalAlpha = 1;
    }
    // HP bar
    const hx = W / 2 - 110, hy = 12;
    drawTapeRect(hx, hy, 220, 18, BLUE_HINT);
    drawPencilText("蓝心 " + Math.max(0, lord.hp) + "/" + lord.maxHp, hx + 110, hy + 11, 12, BLACK, "center");
    for (let i = 0; i < lord.maxHp; i++) {
      const x = hx + 8 + i * 20;
      const y = hy + 24;
      if (i < lord.hp) {
        fillJitterEllipse(x, y, 6, 7, BLUE_HINT, 0.4);
        strokeJitterEllipse(x, y, 6, 7, BLACK, 1, 0.3);
      } else {
        strokeJitterEllipse(x, y, 6, 7, BLACK, 1, 0.3);
      }
    }
    // climb meter
    if (!lord.climbed && lord.phase !== "intro" && !lord.choiceReady) {
      drawTapeRect(14, 54, 150, 16, BLACK);
      const cw = (lord.climbProgress / 100) * 142;
      if (cw > 2) {
        ctx.globalAlpha = 0.4;
        fillJitterPoly([[18, 57], [18 + cw, 57], [18 + cw, 67], [18, 67]], BLACK, 0.4);
        ctx.globalAlpha = 1;
      }
      drawPencilText("攀爬 " + Math.round(lord.climbProgress) + "%", 89, 64, 11, BLACK, "center");
    } else if (lord.climbed && !lord.choiceReady) {
      drawTapeRect(14, 54, 120, 16, BLUE_HINT);
      drawPencilText("已攀关节", 74, 64, 11, BLACK, "center");
    }
    // phase label
    const phaseNames = { intro: "降临", pods: "拆圆荚", climb: "攀关节", lock: "锁定", window: "蓝心窗", choice: "终局一矛" };
    drawPencilText(phaseNames[lord.phase] || lord.phase, W - 70, 48, 12, RED, "center");
  }

  function drawNailAlly() {
    const a = state.nailAlly;
    if (!a) return;
    const cx = a.x + Math.sin(a.pulse * 2) * 3;
    const cy = a.y + Math.sin(a.pulse * 2.5) * 2;
    ctx.globalAlpha = 0.9;
    // mini nail
    for (let i = 0; i < 3; i++) {
      strokeJitterEllipse(cx, cy - 30 + i * 16, 12 + (i % 2) * 3, 8, i % 2 ? RED : BLACK, 1.8, 0.8);
    }
    strokeJitterLine(cx, cy + 10, cx, cy + 40, BLACK, 3, 0.6, 3);
    fillJitterPoly([[cx - 16, cy + 38], [cx + 16, cy + 38], [cx + 10, cy + 52], [cx - 10, cy + 52]], "rgba(200,30,30,0.2)", 0.8);
    strokeJitterPoly([[cx - 16, cy + 38], [cx + 16, cy + 38], [cx + 10, cy + 52], [cx - 10, cy + 52], [cx - 16, cy + 38]], BLACK, 2, 0.8);
    strokeJitterEllipse(cx, cy, 28, 48, BLUE_HINT, 1.5, 1);
    drawPencilText("钉头掩体", cx, cy - 55, 11, BLUE_HINT, "center");
    if (a.smashTele > 0) {
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(state.t * 14);
      strokeJitterEllipse(state.px, state.py, 50, 36, BLUE_HINT, 2, 1.2);
      drawPencilText("掩体砸下…", state.px, state.py - 45, 12, BLUE_HINT, "center");
    }
    ctx.globalAlpha = 1;
  }

  function drawChoiceTargets() {
    if (!state.choiceTargets) return;
    // dim overlay
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    drawTapeRect(W / 2 - 180, 100, 360, 36, RED);
    drawPencilText("终局：最后一矛扎向谁？", W / 2, 120, 16, BLACK, "center");
    drawPencilText("矛戳选边 · B 为正史推荐", W / 2, 148, 12, RED, "center");
    for (const ct of state.choiceTargets) {
      if (!ct.alive) continue;
      const pulse = 1 + 0.08 * Math.sin(state.t * 6);
      if (ct.ending === "A") {
        fillJitterEllipse(ct.x, ct.y, 32 * pulse, 26 * pulse, "rgba(74,122,181,0.4)", 1.5);
        strokeJitterEllipse(ct.x, ct.y, 32 * pulse, 26 * pulse, BLUE_HINT, 3, 1.4);
        fillJitterEllipse(ct.x, ct.y, 12, 12, BLUE_HINT, 0.5);
        drawPencilText(ct.label, ct.x, ct.y + 42, 14, BLUE_HINT, "center");
        drawPencilText(ct.sub, ct.x, ct.y + 60, 11, BLACK, "center");
      } else {
        drawTapeRect(ct.x - 50, ct.y - 22, 100, 44, BLACK);
        drawPencilText("还要", ct.x, ct.y, 20, RED, "center");
        strokeJitterEllipse(ct.x, ct.y, 48 * pulse, 36 * pulse, RED, 2.2, 1.3);
        drawPencilText(ct.label, ct.x, ct.y + 42, 14, RED, "center");
        drawPencilText(ct.sub, ct.x, ct.y + 60, 11, BLACK, "center");
      }
    }
  }

  function drawCh4Decor() {
    // torn sky edge
    ctx.globalAlpha = 0.25;
    strokeJitterLine(40, 30, W / 2 - 60, 50, RED, 2, 1.5, 10);
    strokeJitterLine(W - 40, 30, W / 2 + 60, 50, RED, 2, 1.5, 10);
    ctx.globalAlpha = 0.4;
    drawPencilText("天裂", 70, 48, 12, RED, "center");
    ctx.globalAlpha = 1;
  }


  function drawFortress() {
    const f = state.fortress;
    if (!f) return;
    // dense red-line fortress block (right-bottom)
    ctx.globalAlpha = 0.14;
    fillJitterPoly(
      [
        [f.x, f.y],
        [f.x + f.w, f.y],
        [f.x + f.w, f.y + f.h],
        [f.x, f.y + f.h],
      ],
      RED,
      1.5
    );
    ctx.globalAlpha = 1;
    const cols = 14;
    for (let i = 0; i < cols; i++) {
      const lx = f.x + 8 + (i / (cols - 1)) * (f.w - 16);
      strokeJitterLine(lx, f.y + 6, lx, f.y + f.h - 6, RED, i % 2 === 0 ? 2.2 : 1.4, 1.2, 10);
    }
    hatchRect(f.x + 6, f.y + 8, f.w - 12, f.h - 16, RED, 5, 28, 0.42);
    hatchRect(f.x + 6, f.y + 8, f.w - 12, f.h - 16, BLACK, 9, -35, 0.18);
    strokeJitterPoly(
      [
        [f.x, f.y],
        [f.x + f.w, f.y],
        [f.x + f.w, f.y + f.h],
        [f.x, f.y + f.h],
        [f.x, f.y],
      ],
      BLACK,
      3.2,
      1.8
    );
    // top battlement nicks
    for (let i = 0; i < 6; i++) {
      const bx = f.x + 18 + i * 36;
      strokeJitterLine(bx, f.y, bx + 10, f.y - 12, RED, 2, 0.8, 2);
      strokeJitterLine(bx + 10, f.y - 12, bx + 20, f.y, BLACK, 1.6, 0.7, 2);
    }
    drawPencilText("要塞", f.x + f.w / 2, f.y + 22, 12, BLACK, "center");
  }

  function drawGrinBoss() {
    const b = state.boss;
    if (!b) return;
    const cx = b.cx + (b.hitFlash > 0 ? rand(-3, 3) : 0);
    const cy = b.cy + Math.sin(b.pulse * 3) * 2 + (b.hitFlash > 0 ? rand(-2, 2) : 0);
    const smile = b.smile;
    const rx = 52 + smile * 10;
    const ry = 48 + smile * 6;

    // attach stalk to fortress
    if (state.fortress) {
      strokeJitterLine(state.fortress.x + 20, cy, cx - rx + 8, cy, RED, 3, 1.2, 6);
      strokeJitterLine(state.fortress.x + 20, cy + 8, cx - rx + 10, cy + 10, BLACK, 1.5, 1, 5);
    }

    // face fill
    ctx.globalAlpha = b.dead ? 0.35 : 0.2;
    fillJitterEllipse(cx, cy, rx, ry, RED, 2);
    ctx.globalAlpha = 1;
    if (b.hitFlash > 0) {
      ctx.globalAlpha = 0.45;
      fillJitterEllipse(cx, cy, rx + 4, ry + 4, "#fff", 2);
      ctx.globalAlpha = 1;
    }
    strokeJitterEllipse(cx, cy, rx, ry, BLACK, 3.2, 1.8);
    strokeJitterEllipse(cx, cy, rx - 4, ry - 3, RED, 1.6, 1.2);

    // angry eyes (horizontal glare lines)
    const eyeY = cy - 10;
    const eyeSpread = 16 + smile * 4;
    strokeJitterLine(cx - eyeSpread - 10, eyeY - 2, cx - eyeSpread + 10, eyeY + 3, BLACK, 2.6, 0.6, 3);
    strokeJitterLine(cx + eyeSpread - 10, eyeY + 3, cx + eyeSpread + 10, eyeY - 2, BLACK, 2.6, 0.6, 3);
    // pupils
    fillJitterEllipse(cx - eyeSpread, eyeY + 1, 4, 5, RED, 0.4);
    fillJitterEllipse(cx + eyeSpread, eyeY + 1, 4, 5, RED, 0.4);
    strokeJitterEllipse(cx - eyeSpread, eyeY + 1, 4, 5, BLACK, 1, 0.3);
    strokeJitterEllipse(cx + eyeSpread, eyeY + 1, 4, 5, BLACK, 1, 0.3);

    // glare cone
    if (b.phase === "glare" && !b.dead) {
      ctx.globalAlpha = 0.12 + 0.06 * Math.sin(state.t * 12);
      ctx.fillStyle = BLUE_HINT;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(40, cy - 70 - smile * 30);
      ctx.lineTo(40, cy + 70 + smile * 30);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.35;
      strokeJitterLine(cx - 8, cy, 50, cy - 65, BLUE_HINT, 1.5, 1, 8);
      strokeJitterLine(cx - 8, cy, 50, cy + 65, BLUE_HINT, 1.5, 1, 8);
      ctx.globalAlpha = 1;
      drawPencilText("怒视", cx - 70, cy - ry - 12, 12, BLUE_HINT, "center");
    }

    // grinning mouth — bigger smile = wider gap (teeth spaced)
    const mouthW = 28 + smile * 34;
    const mouthH = 8 + smile * 22;
    const my = cy + 14;
    strokeJitterLine(cx - mouthW, my, cx + mouthW, my + mouthH * 0.15, BLACK, 2.4, 1, 8);
    // upper/lower lip arc
    const teeth = 5 + Math.floor(smile * 5);
    for (let i = 0; i < teeth; i++) {
      const t = teeth === 1 ? 0.5 : i / (teeth - 1);
      const tx = cx - mouthW + t * mouthW * 2;
      const gap = 4 + smile * 6; // bigger smile → more spacing (空档)
      const tw = 5;
      // tooth triangle
      strokeJitterPoly(
        [
          [tx - tw, my + 2],
          [tx, my + mouthH],
          [tx + tw, my + 2],
          [tx - tw, my + 2],
        ],
        RED,
        1.8,
        0.6
      );
      if (i < teeth - 1) {
        // gap tick
        ctx.globalAlpha = 0.35;
        strokeJitterLine(tx + tw + gap * 0.3, my + mouthH * 0.4, tx + tw + gap * 0.3, my + 4, BLACK, 1, 0.3, 2);
        ctx.globalAlpha = 1;
      }
    }
    // smile label
    if (smile > 0.65 && b.vulnerable) {
      ctx.globalAlpha = 0.5 + 0.4 * Math.sin(state.t * 8);
      drawPencilText("空档！打脸", cx, cy + ry + 18, 13, RED, "center");
      ctx.globalAlpha = 1;
    } else if (!b.vulnerable && !b.dead) {
      ctx.globalAlpha = 0.4;
      drawPencilText("先拆 + / × 墙", cx, cy + ry + 18, 12, BLACK, "center");
      ctx.globalAlpha = 1;
    }

    if (b.dead) {
      strokeJitterLine(cx - 20, cy - 10, cx + 18, cy + 16, BLACK, 2.5, 1, 4);
      strokeJitterLine(cx + 18, cy - 12, cx - 16, cy + 14, BLACK, 2.5, 1, 4);
      drawPencilText("……下次，画轻一点。", cx, cy + ry + 28, 13, BLACK, "center");
    }

    // boss HP tape
    const hx = 14, hy = 54;
    drawTapeRect(hx, hy, 160, 18, RED);
    drawPencilText("城魂·咧嘴", hx + 80, hy + 11, 12, BLACK, "center");
    for (let i = 0; i < b.maxHp; i++) {
      const x = hx + i * 15;
      const y = hy + 24;
      if (i < b.hp) {
        fillJitterEllipse(x + 6, y, 5, 5, RED, 0.5);
        strokeJitterEllipse(x + 6, y, 5, 5, BLACK, 1, 0.3);
      } else {
        strokeJitterEllipse(x + 6, y, 5, 5, BLACK, 1, 0.3);
      }
    }
    // smile meter
    drawPencilText("笑 " + Math.round(smile * 100) + "%", hx + 200, hy + 12, 12, RED, "left");
  }

  function drawTower(tw) {
    if (!tw.alive) {
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 7; i++) {
        strokeJitterLine(
          tw.x + rand(0, tw.w),
          state.groundY - rand(5, 40),
          tw.x + rand(0, tw.w),
          state.groundY,
          RED, 2.2, 1.2, 3
        );
      }
      // ink stain where tower fell
      ctx.globalAlpha = 0.25;
      fillJitterEllipse(tw.x + tw.w / 2, state.groundY - 8, 28, 10, RED, 2);
      ctx.globalAlpha = 1;
      return;
    }
    const x = tw.x, y = tw.yp, w = tw.w, h = tw.h;
    const depth = 14; // fake thickness

    // side face (thickness)
    ctx.globalAlpha = 0.55;
    fillJitterPoly(
      [
        [x + w, y],
        [x + w + depth, y - 6],
        [x + w + depth, y + h - 6],
        [x + w, y + h],
      ],
      RED_DIM,
      1
    );
    strokeJitterPoly(
      [
        [x + w, y],
        [x + w + depth, y - 6],
        [x + w + depth, y + h - 6],
        [x + w, y + h],
        [x + w, y],
      ],
      BLACK,
      1.5,
      1
    );
    ctx.globalAlpha = 1;

    // front fill wash
    ctx.globalAlpha = 0.12;
    fillJitterPoly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      RED,
      1.2
    );
    ctx.globalAlpha = 1;

    // dense vertical red fence lines
    const cols = 7;
    for (let i = 0; i < cols; i++) {
      const lx = x + 6 + (i / (cols - 1)) * (w - 12);
      strokeJitterLine(lx, y + 4, lx, y + h - 4, RED, i % 2 === 0 ? 2.4 : 1.6, 1.3, 12);
    }
    // dense cross hatch fill
    hatchRect(x + 4, y + 8, w - 8, h - 16, RED, 4.5, 32, 0.38);
    hatchRect(x + 4, y + 8, w - 8, h - 16, BLACK, 8, -40, 0.16);

    // crack lines based on damage
    if (tw.crack > 0) {
      ctx.globalAlpha = 0.5 + tw.crack * 0.4;
      const cx = x + w * 0.45;
      strokeJitterLine(cx, y + 20, cx + 8 * tw.crack, y + h * 0.4, BLACK, 1.8, 1.2, 6);
      strokeJitterLine(cx + 8 * tw.crack, y + h * 0.4, cx - 5, y + h * 0.7, BLACK, 1.5, 1, 5);
      strokeJitterLine(cx - 5, y + h * 0.7, cx + 12, y + h - 10, RED, 1.5, 1, 4);
      ctx.globalAlpha = 1;
    }

    // outer box (double stroke for weight)
    strokeJitterPoly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [x, y],
      ],
      BLACK,
      3,
      1.6
    );
    ctx.globalAlpha = 0.5;
    strokeJitterPoly(
      [
        [x + 3, y + 3],
        [x + w - 3, y + 3],
        [x + w - 3, y + h - 3],
        [x + 3, y + h - 3],
        [x + 3, y + 3],
      ],
      RED,
      1.2,
      1
    );
    ctx.globalAlpha = 1;

    // base symbol pedestal — sit above ground, high contrast
    const bx = x + w / 2;
    const by = Math.min(state.groundY - 18, y + h - 8);
    // taped pedestal plate
    drawTapeRect(bx - 22, by - 16, 44, 32, RED);
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(state.t * 7);
    fillJitterEllipse(bx, by, 26, 18, RED, 1.2);
    ctx.globalAlpha = 1;
    strokeJitterEllipse(bx, by, 22, 15, BLACK, 2.4, 1);
    strokeJitterEllipse(bx, by, 15, 11, RED, 1.8, 0.9);
    // symbol with pencil weight
    ctx.save();
    ctx.translate(bx + rand(-0.4, 0.4), by + rand(-0.4, 0.4));
    ctx.font = "bold 34px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = RED;
    ctx.fillText(tw.symbol, 0, 1);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2.2;
    ctx.strokeText(tw.symbol, 0, 1);
    ctx.restore();
    // pointer hint ticks
    strokeJitterLine(bx - 30, by - 2, bx - 24, by - 10, RED, 1.8, 0.5, 2);
    strokeJitterLine(bx + 30, by - 2, bx + 24, by - 10, RED, 1.8, 0.5, 2);
    // "戳!" pulse when player near
    const near = Math.hypot(state.px - bx, state.py - by) < 100;
    if (near) {
      ctx.globalAlpha = 0.45 + 0.35 * Math.sin(state.t * 10);
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = RED;
      ctx.textAlign = "center";
      ctx.fillText("戳!", bx, by - 28);
      ctx.globalAlpha = 1;
    }

    // HP ticks as ink blobs
    for (let i = 0; i < tw.maxHp; i++) {
      const hx = x + 10 + i * 14;
      const hy = y - 14;
      if (i < tw.hp) {
        fillJitterEllipse(hx, hy, 5, 5, RED, 0.6);
        strokeJitterEllipse(hx, hy, 5, 5, BLACK, 1.2, 0.4);
      } else {
        strokeJitterEllipse(hx, hy, 5, 5, BLACK, 1, 0.4);
        strokeJitterLine(hx - 3, hy - 3, hx + 3, hy + 3, BLACK, 1, 0.3, 2);
      }
    }
  }

  function drawDragonBody(stretch, bob, ghostAlpha) {
    if (ghostAlpha != null) ctx.globalAlpha = ghostAlpha;
    // body fill wash
    ctx.globalAlpha = (ghostAlpha != null ? ghostAlpha : 1) * 0.08;
    fillJitterPoly(
      [
        [-48 * stretch, 10 + bob],
        [-20 * stretch, -8 + bob],
        [30 * stretch, -6 + bob],
        [52 * stretch, 12 + bob],
        [20 * stretch, 20 + bob],
        [-30 * stretch, 18 + bob],
      ],
      BLACK,
      1.5
    );
    ctx.globalAlpha = ghostAlpha != null ? ghostAlpha : 1;

    const body = [
      [-50 * stretch, 8 + bob],
      [-30 * stretch, -6 + bob],
      [-5 * stretch, -10 + bob],
      [25 * stretch, -4 + bob],
      [45 * stretch, 6 + bob],
      [55 * stretch, 14 + bob],
    ];
    strokeJitterPoly(body, BLACK, 3.2, 1.5);
    // double body line for weight
    ctx.globalAlpha = (ghostAlpha != null ? ghostAlpha : 1) * 0.45;
    strokeJitterPoly(
      [
        [-46 * stretch, 11 + bob],
        [-5 * stretch, -5 + bob],
        [42 * stretch, 9 + bob],
      ],
      BLACK,
      1.4,
      1
    );
    ctx.globalAlpha = ghostAlpha != null ? ghostAlpha : 1;

    // belly
    strokeJitterPoly(
      [
        [-40 * stretch, 14 + bob],
        [0, 18 + bob],
        [40 * stretch, 12 + bob],
      ],
      BLACK,
      1.6,
      1
    );
    // belly cross-hatch
    hatchRect(-35 * stretch, 8 + bob, 70 * stretch, 12, BLACK, 5, 25, 0.2);

    // back spikes (more defined, red)
    for (let i = 0; i < 5; i++) {
      const sx = -38 * stretch + i * 16 * stretch;
      const sh = 14 + (i % 2) * 4;
      strokeJitterLine(sx, -4 + bob, sx + 5, -4 - sh + bob, RED, 2.2, 0.9, 2);
      strokeJitterLine(sx + 5, -4 - sh + bob, sx + 12, -2 + bob, RED, 2.2, 0.9, 2);
      // spike fill tick
      ctx.globalAlpha = (ghostAlpha != null ? ghostAlpha : 1) * 0.35;
      strokeJitterLine(sx + 2, -6 + bob, sx + 5, -4 - sh + 4 + bob, BLACK, 1, 0.4, 2);
      ctx.globalAlpha = ghostAlpha != null ? ghostAlpha : 1;
    }

    // head
    strokeJitterPoly(
      [
        [45 * stretch, 6 + bob],
        [70 * stretch, -4 + bob],
        [76 * stretch, 8 + bob],
        [60 * stretch, 16 + bob],
      ],
      BLACK,
      2.6,
      1.2
    );
    // snout hatch
    hatchRect(50 * stretch, 0 + bob, 22 * stretch, 12, BLACK, 4, 20, 0.18);

    // round eye — clear highlight
    fillJitterEllipse(63 * stretch, 3 + bob, 5.5, 5.5, "#fff8e8", 0.2);
    strokeJitterEllipse(63 * stretch, 3 + bob, 5.5, 5.5, BLACK, 1.6, 0.3);
    fillJitterEllipse(64 * stretch, 3 + bob, 2.8, 2.8, RED, 0.2);
    fillJitterEllipse(65.2 * stretch, 2 + bob, 1.1, 1.1, "#fff", 0.1);

    // jaw / teeth
    strokeJitterLine(68 * stretch, 9 + bob, 74 * stretch, 14 + bob, BLACK, 1.6, 0.5, 2);
    strokeJitterLine(70 * stretch, 10 + bob, 72 * stretch, 15 + bob, RED, 1.2, 0.4, 2);

    // legs with claws
    strokeJitterLine(-22 * stretch, 14 + bob, -26 * stretch, 30 + bob, BLACK, 2.2, 1, 3);
    strokeJitterLine(-26 * stretch, 30 + bob, -30 * stretch, 30 + bob, BLACK, 1.5, 0.5, 2);
    strokeJitterLine(16 * stretch, 14 + bob, 20 * stretch, 30 + bob, BLACK, 2.2, 1, 3);
    strokeJitterLine(20 * stretch, 30 + bob, 24 * stretch, 30 + bob, RED, 1.5, 0.5, 2);

    // tail with arrow tip
    strokeJitterPoly(
      [
        [-50 * stretch, 8 + bob],
        [-72 * stretch, -2 + bob],
        [-90 * stretch, 14 + bob],
      ],
      RED,
      2.4,
      1.5
    );
    strokeJitterLine(-88 * stretch, 12 + bob, -96 * stretch, 6 + bob, RED, 2, 0.8, 2);
    strokeJitterLine(-88 * stretch, 12 + bob, -96 * stretch, 18 + bob, RED, 2, 0.8, 2);

    if (ghostAlpha != null) ctx.globalAlpha = 1;
  }

  function drawRider(bob) {
    const rx = -5;
    const ry = -28 + bob;
    // head with hair scribble
    fillJitterEllipse(rx, ry - 10, 7.5, 7.5, PAPER, 0.4);
    strokeJitterEllipse(rx, ry - 10, 7.5, 7.5, BLACK, 2.1, 0.55);
    // eyes
    fillJitterEllipse(rx - 2.5, ry - 11, 1.2, 1.2, BLACK, 0.1);
    fillJitterEllipse(rx + 2.5, ry - 11, 1.2, 1.2, BLACK, 0.1);
    // hair
    strokeJitterLine(rx - 5, ry - 15, rx - 2, ry - 20, BLACK, 1.5, 0.5, 2);
    strokeJitterLine(rx + 2, ry - 16, rx + 5, ry - 19, RED, 1.3, 0.4, 2);
    // body
    strokeJitterLine(rx, ry - 3, rx, ry + 14, BLACK, 2.2, 0.8, 3);
    // scarf / cape tick
    strokeJitterLine(rx, ry + 2, rx - 8, ry + 8, RED, 1.5, 0.6, 2);

    const spearOn = state.spearActive > 0;
    const spearReach = spearOn ? 72 : 44;
    // spear shaft
    strokeJitterLine(rx, ry + 2, rx + spearReach, ry + 6, BLACK, 2.2, 0.7, 5);
    // spear tip diamond
    const tip = rx + spearReach;
    strokeJitterPoly(
      [
        [tip - 6, ry + 3],
        [tip + 8, ry + 7],
        [tip - 4, ry + 11],
        [tip - 6, ry + 3],
      ],
      RED,
      2.2,
      0.5
    );
    if (spearOn) {
      ctx.globalAlpha = 0.4;
      strokeJitterLine(tip, ry + 6, tip + 18, ry + 8, RED, 2, 1, 3);
      ctx.globalAlpha = 1;
    }

    // shield wheel
    if (state.blocking) {
      const sx = rx - 18;
      const sy = ry + 4;
      // outer feedback ring
      const pulse = state.blockPulse > 0 ? 1 + state.blockPulse * 1.5 : 1;
      ctx.globalAlpha = 0.35 + (state.blockPulse > 0 ? 0.4 : 0);
      strokeJitterEllipse(sx, sy, 20 * pulse, 20 * pulse, RED, 2.5, 1.2);
      ctx.globalAlpha = 1;
      strokeJitterEllipse(sx, sy, 15, 15, BLACK, 2.8, 1);
      // wheel spokes
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + state.t * 3;
        strokeJitterLine(
          sx + Math.cos(a) * 4,
          sy + Math.sin(a) * 4,
          sx + Math.cos(a) * 13,
          sy + Math.sin(a) * 13,
          RED,
          1.5,
          0.5,
          2
        );
      }
      fillJitterEllipse(sx, sy, 4, 4, RED, 0.3);
      strokeJitterEllipse(sx, sy, 8, 8, BLACK, 1.4, 0.5);
      if (state.blockPulse > 0) {
        ctx.globalAlpha = state.blockPulse / 0.35;
        strokeJitterEllipse(sx, sy, 28, 28, RED, 2, 1.5);
        ctx.globalAlpha = 1;
      }
    } else {
      strokeJitterLine(rx, ry + 4, rx - 14, ry + 10, BLACK, 1.9, 0.7, 2);
      // small idle shield disc on back
      strokeJitterEllipse(rx - 12, ry + 8, 5, 5, BLACK, 1.2, 0.4);
    }

    // legs
    strokeJitterLine(rx, ry + 14, rx - 11, ry + 26, BLACK, 1.9, 0.7, 2);
    strokeJitterLine(rx, ry + 14, rx + 11, ry + 24, BLACK, 1.9, 0.7, 2);

    // name tag
    if (Math.floor(state.t * 2) % 5 === 0) {
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillStyle = RED;
      ctx.textAlign = "left";
      ctx.globalAlpha = 0.85;
      ctx.fillText("无限", -42, -24 + bob);
      ctx.globalAlpha = 1;
    }
  }

  function drawDragonAndRider(px, py, facing) {
    // dash ghost trail
    if (state.dashTrail && state.dashTrail.length) {
      for (let i = 0; i < state.dashTrail.length; i++) {
        const g = state.dashTrail[i];
        const a = (g.life / 0.28) * 0.28;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.scale(g.facing, 1);
        drawDragonBody(1.15, 0, a);
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(facing, 1);
    const bob = Math.sin(state.t * 8) * 2.2;
    const stretch = state.dashTimer > 0 ? 1.28 : 1;

    drawDragonBody(stretch, bob, null);
    drawRider(bob);

    ctx.restore();

    // dash motion streaks
    if (state.dashTimer > 0) {
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 4; i++) {
        const ox = -state.dashDir.x * (20 + i * 14);
        const oy = -state.dashDir.y * (14 + i * 10);
        strokeJitterLine(px + ox, py + oy - 6, px + ox - state.dashDir.x * 20, py + oy + 6, BLACK, 1.5, 1, 3);
        strokeJitterLine(px + ox, py + oy + 4, px + ox - state.dashDir.x * 16, py + oy + 10, RED, 1.2, 0.8, 2);
      }
      ctx.globalAlpha = 1;
    }

    if (state.invuln > 0 && Math.floor(state.t * 20) % 2 === 0) {
      strokeJitterEllipse(px, py, 30, 22, RED, 1.6, 1.5);
    }
  }

  function drawBullets() {
    // afterglows first
    if (state.afterglows) {
      for (const a of state.afterglows) {
        const t = Math.max(0, a.life / a.maxLife);
        ctx.globalAlpha = t * 0.5;
        if (a.kind === "ring") {
          strokeJitterEllipse(a.x, a.y, a.r, a.r * 0.92, RED, 2, 1.2);
        } else if (a.kind === "slash") {
          const dir = a.ang === Math.PI ? -1 : 1;
          strokeJitterLine(a.x, a.y, a.x + dir * (a.len || 30), a.y, RED, 2.5, 1, 3);
        } else {
          fillJitterEllipse(a.x, a.y, a.r * (1 + (1 - t)), a.r * (1 + (1 - t)), RED, 0.5);
        }
        ctx.globalAlpha = 1;
      }
    }

    for (const b of state.bullets) {
      // trail afterglow
      if (b.trail) {
        for (const t of b.trail) {
          ctx.globalAlpha = (t.life / 0.25) * 0.35;
          fillJitterEllipse(t.x, t.y, b.r * 0.7, b.r * 0.9, RED, 0.3);
        }
        ctx.globalAlpha = 1;
      }
      if (b.warn > 0) {
        // rain warning ghost at impact lane
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(state.t * 18);
        strokeJitterEllipse(b.x, Math.min(b.y + 40, 80), b.r + 3, b.r + 6, RED, 1.2, 0.6);
        strokeJitterLine(b.x, 20, b.x, 70, RED, 1, 0.8, 4);
        ctx.globalAlpha = 1;
        continue;
      }
      if (b.type === "tooth") {
        const ang = b.rot || Math.atan2(b.vy, b.vx);
        const len = 12;
        const ox = Math.cos(ang) * len;
        const oy = Math.sin(ang) * len;
        const px = -Math.sin(ang) * 5;
        const py = Math.cos(ang) * 5;
        strokeJitterPoly(
          [
            [b.x - ox * 0.3 + px, b.y - oy * 0.3 + py],
            [b.x + ox, b.y + oy],
            [b.x - ox * 0.3 - px, b.y - oy * 0.3 - py],
            [b.x - ox * 0.3 + px, b.y - oy * 0.3 + py],
          ],
          RED,
          2.2,
          0.7
        );
        strokeJitterPoly(
          [
            [b.x - ox * 0.3 + px, b.y - oy * 0.3 + py],
            [b.x + ox, b.y + oy],
            [b.x - ox * 0.3 - px, b.y - oy * 0.3 - py],
            [b.x - ox * 0.3 + px, b.y - oy * 0.3 + py],
          ],
          BLACK,
          1.1,
          0.4
        );
      } else {
        fillJitterEllipse(b.x, b.y, b.r, b.r * 1.25, RED, 0.55);
        strokeJitterEllipse(b.x, b.y, b.r, b.r * 1.25, BLACK, 1.1, 0.35);
        ctx.globalAlpha = 0.4;
        fillJitterEllipse(b.x - 1, b.y - 1.5, b.r * 0.35, b.r * 0.35, "#fff", 0.1);
        ctx.globalAlpha = 1;
      }
    }

    for (const s of state.slashBursts) {
      if (s.warned > 0) {
        const flash = 0.3 + 0.35 * Math.sin(state.t * 22);
        ctx.globalAlpha = flash;
        const dir = s.vx > 0 ? 1 : -1;
        // dashed warn lane
        for (let i = 0; i < 8; i++) {
          const x0 = s.x + dir * i * 28;
          strokeJitterLine(x0, s.y, x0 + dir * 16, s.y, RED, 1.8, 1, 2);
        }
        // arrow head warn
        ctx.font = "14px sans-serif";
        ctx.fillStyle = RED;
        ctx.textAlign = "center";
        ctx.fillText(dir > 0 ? "→" : "←", s.x + dir * 40, s.y - 8);
        ctx.globalAlpha = 1;
      } else {
        if (s.trail) {
          for (const t of s.trail) {
            ctx.globalAlpha = (t.life / 0.2) * 0.4;
            const dir = s.vx > 0 ? 1 : -1;
            strokeJitterLine(t.x, t.y, t.x + dir * s.len * 0.6, t.y, RED, 2, 0.8, 2);
          }
          ctx.globalAlpha = 1;
        }
        const dir = s.vx > 0 ? 1 : -1;
        strokeJitterLine(s.x, s.y, s.x + dir * s.len, s.y, RED, 3.8, 1.2, 4);
        strokeJitterLine(s.x, s.y - 4, s.x + dir * s.len, s.y + 4, BLACK, 1.6, 0.8, 3);
        // tip spark
        fillJitterEllipse(s.x + dir * s.len, s.y, 3, 3, RED, 0.4);
      }
    }

    for (const r of state.rings) {
      if (r.warned > 0) {
        const pulse = 16 + Math.sin(state.t * 16) * 6;
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(state.t * 14);
        strokeJitterEllipse(r.x, r.y, pulse, pulse, RED, 2, 1.2);
        strokeJitterEllipse(r.x, r.y, pulse * 0.5, pulse * 0.5, BLACK, 1, 0.8);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = RED;
        ctx.textAlign = "center";
        ctx.fillText("◎ 爆", r.x, r.y + 4);
        ctx.globalAlpha = 1;
      } else {
        // outer glow ring
        ctx.globalAlpha = 0.25;
        strokeJitterEllipse(r.x, r.y, r.r + 4, r.r * 0.92 + 3, RED, 3, 1.5);
        ctx.globalAlpha = 1;
        strokeJitterEllipse(r.x, r.y, r.r, r.r * 0.92, RED, 2.6, 1.4);
        strokeJitterEllipse(r.x, r.y, r.r - 4, r.r * 0.92 - 3, BLACK, 1.2, 1);
        // ink ticks on ring
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + state.t;
          const px = r.x + Math.cos(a) * r.r;
          const py = r.y + Math.sin(a) * r.r * 0.92;
          fillJitterEllipse(px, py, 2, 2, RED, 0.3);
        }
      }
    }
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      if (p.kind === "shard") {
        strokeJitterLine(p.x, p.y, p.x + p.r * 2, p.y + p.r, p.color, 1.8, 0.5, 2);
      } else if (p.kind === "tear") {
        fillJitterPoly(
          [
            [p.x, p.y],
            [p.x + 8, p.y + 1],
            [p.x + 5, p.y + 5],
            [p.x, p.y + 3],
          ],
          PAPER,
          0.8
        );
        strokeJitterLine(p.x, p.y, p.x + 8, p.y + 2, BLACK, 1, 0.4, 2);
      } else {
        fillJitterEllipse(p.x, p.y, p.r, p.r, p.color, 0.4);
      }
      ctx.globalAlpha = 1;
    }
    for (const f of state.floatTexts) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.font = "bold 16px 'Segoe UI', sans-serif";
      ctx.fillStyle = f.color;
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x + rand(-0.3, 0.3), f.y);
      ctx.globalAlpha = 1;
    }
  }

  function drawHUD() {
    // paper tape name plate
    drawTapeRect(12, 8, 42, 22, BLACK);
    drawPencilText("烬矛", 33, 20, 13, BLACK, "center");

    for (let i = 0; i < state.maxHp; i++) {
      const x = 62 + i * 24;
      const y = 10;
      if (i < state.hp) {
        drawTapeRect(x, y, 20, 16, RED);
        // red plus scribble on tape
        strokeJitterLine(x + 5, y + 8, x + 15, y + 8, RED, 1.5, 0.4, 2);
        strokeJitterLine(x + 10, y + 3, x + 10, y + 13, RED, 1.5, 0.4, 2);
      } else {
        ctx.globalAlpha = 0.45;
        strokeJitterPoly(
          [
            [x, y],
            [x + 20, y],
            [x + 20, y + 16],
            [x, y + 16],
            [x, y],
          ],
          BLACK,
          1.1,
          0.5
        );
        ctx.globalAlpha = 1;
      }
    }

    // chapter tape
    drawTapeRect(W - 150, 8, 136, 20, BLACK);
    const chLabel = state.chapter === 4 ? "Ch.4 蓝心开合" : state.chapter === 3 ? "Ch.3 哨兵一锤" : state.chapter === 2 ? "Ch.2 笑墙合拢" : "Ch.1 矛阵起夜";
    drawPencilText(chLabel, W - 82, 19, 12, BLACK, "center");
    ctx.textAlign = "right";
    ctx.fillStyle = RED;
    ctx.font = "bold 14px 'Segoe UI', sans-serif";
    ctx.fillText("分 " + state.score, W - 18, 48);

    // cooldown as mini tapes
    const cdY = H - 22;
    const cds = [
      { label: "矛", ok: state.spearCd <= 0, active: state.spearActive > 0 },
      { label: "盾", ok: state.blockCd <= 0, active: state.blocking },
      { label: "冲", ok: state.dashCd <= 0, active: state.dashTimer > 0 },
    ];
    for (let i = 0; i < cds.length; i++) {
      const c = cds[i];
      const x = 14 + i * 52;
      drawTapeRect(x, cdY - 12, 46, 18, c.active ? RED : c.ok ? BLACK : "#888");
      drawPencilText(c.label + (c.active ? "!" : c.ok ? "✓" : "…"), x + 23, cdY - 2, 11, c.active ? RED : BLACK, "center");
    }

    ctx.textAlign = "center";
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = BLACK;
    ctx.font = "11px sans-serif";
    ctx.fillText(
      state.chapter === 4
        ? "WASD · J矛 · K盾 · 空格冲  |  拆荚 → 攀关节 → 蓝心窗 → 选结局"
        : state.chapter === 3
        ? "WASD · J矛 · K盾 · 空格冲  |  挡蓝心收编，或矛戳击败钉头"
        : state.chapter === 2
        ? "WASD · J矛 · K盾 · 空格冲  |  拆墙 → 笑空档打脸"
        : "WASD移动 · J矛 · K盾 · 空格无限冲  |  戳塔底 + / ×",
      W / 2,
      H - 18
    );
    ctx.globalAlpha = 1;

    // forget — eraser dropping letters
    if (state.forgetFlash > 0) {
      const a = Math.min(1, state.forgetFlash);
      ctx.globalAlpha = a * 0.92;
      // taped note
      drawTapeRect(W * 0.14, 52, W * 0.72, 42, BLACK);
      // eraser dust
      ctx.globalAlpha = a * 0.4;
      for (let i = 0; i < 8; i++) {
        fillJitterEllipse(W * 0.2 + i * 70 + rand(-10, 10), 70 + rand(-6, 10), 2, 1.5, "#c4b8a0", 0.3);
      }
      ctx.globalAlpha = a;
      if (state.forgetChars && state.forgetChars.length) {
        ctx.font = "14px 'Segoe UI', 'PingFang SC', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const totalW = ctx.measureText(state.forgetText).width;
        let cx = W / 2 - totalW / 2;
        for (const c of state.forgetChars) {
          if (c.gone) {
            cx += ctx.measureText(c.ch).width;
            continue;
          }
          const chW = ctx.measureText(c.ch).width;
          ctx.save();
          ctx.globalAlpha = a * Math.max(0.15, 1 - c.drop / 28);
          ctx.fillStyle = BLACK;
          ctx.fillText(c.ch, cx + rand(-0.3, 0.3), 74 + c.drop);
          // eraser smear
          if (c.drop > 0) {
            ctx.globalAlpha = a * 0.25;
            ctx.fillStyle = "#d8cfc0";
            ctx.fillRect(cx, 68, chW, 3 + c.drop * 0.3);
          }
          ctx.restore();
          cx += chW;
        }
      } else {
        drawPencilText(state.forgetText, W / 2, 74, 14, BLACK, "center");
      }
      ctx.globalAlpha = 1;
    }

    if (state.crushWarn > 0) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(state.t * 15);
      ctx.fillStyle = RED;
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(state.chapter === 4 ? "红雨全屏！" : state.chapter === 3 ? "钉砸预警！" : state.chapter === 2 ? "笑墙合拢！" : "塔墙合拢！", W / 2, 120);
      strokeJitterLine(80, 100, 120, 140, RED, 2, 1, 3);
      strokeJitterLine(W - 80, 100, W - 120, 140, RED, 2, 1, 3);
      ctx.globalAlpha = 1;
    }

    if (state.bossTaunt > 0 && state.bossTauntText) {
      const a = Math.min(1, state.bossTaunt);
      ctx.globalAlpha = a * 0.95;
      drawTapeRect(W * 0.12, H - 78, W * 0.76, 36, RED);
      drawPencilText(state.bossTauntText, W / 2, H - 58, 13, BLACK, "center");
      ctx.globalAlpha = 1;
    }

    if (state.speedMul < 0.7 && state.chapter === 2) {
      ctx.globalAlpha = 0.55 + 0.25 * Math.sin(state.t * 10);
      drawPencilText("怒视减速…", W / 2, 100, 14, BLUE_HINT, "center");
      ctx.globalAlpha = 1;
    }
  }

  function drawTitle() {
    drawPaperBg();
    drawAmbientRain();
    for (const d of state.titleDots) {
      ctx.globalAlpha = 0.35 + d.layer * 0.5;
      fillJitterEllipse(d.x, d.y, d.r, d.r * 1.2, RED, 0.5);
    }
    ctx.globalAlpha = 1;

    // double scribble border
    strokeJitterPoly(
      [
        [36, 36],
        [W - 36, 36],
        [W - 36, H - 36],
        [36, H - 36],
        [36, 36],
      ],
      BLACK,
      2.8,
      2
    );
    ctx.globalAlpha = 0.4;
    strokeJitterPoly(
      [
        [44, 44],
        [W - 44, 44],
        [W - 44, H - 44],
        [44, H - 44],
        [44, 44],
      ],
      RED,
      1.4,
      1.5
    );
    ctx.globalAlpha = 1;

    // title tape banner
    drawTapeRect(W / 2 - 190, 118, 380, 72, BLACK);
    drawPencilText("最后一矛", W / 2, 142, 34, BLACK, "center");
    drawPencilText("The Last Spear", W / 2, 172, 15, BLACK, "center");
    drawPencilText("在红雨停下来之前", W / 2, 208, 15, RED, "center");

    // doodle dragon + rider (full silhouette)
    ctx.save();
    ctx.translate(W / 2, 268);
    const tb = Math.sin(state.t * 5) * 2;
    drawDragonBody(1.2, tb, null);
    // temporarily pretend not blocking/spearing for title pose
    const _ba = state.blocking, _sa = state.spearActive;
    state.blocking = false;
    state.spearActive = 0.01;
    drawRider(tb);
    state.blocking = _ba;
    state.spearActive = _sa;
    ctx.restore();

    drawTapeRect(W / 2 - 130, 318, 260, 22, RED);
    drawPencilText("纸原营地 · 选章出发", W / 2, 331, 13, BLACK, "center");

    // chapter select cards
    function chCard(x, y, w, h, title, sub, selected, locked) {
      ctx.globalAlpha = locked ? 0.35 : 1;
      drawTapeRect(x, y, w, h, selected ? RED : BLACK);
      if (selected && !locked) {
        strokeJitterPoly(
          [[x - 4, y - 4], [x + w + 4, y - 4], [x + w + 4, y + h + 4], [x - 4, y + h + 4], [x - 4, y - 4]],
          RED, 2, 1.2
        );
      }
      drawPencilText(title, x + w / 2, y + 22, 15, selected ? RED : BLACK, "center");
      drawPencilText(sub, x + w / 2, y + 44, 11, BLACK, "center");
      ctx.globalAlpha = 1;
    }
    chCard(W / 2 - 270, 350, 115, 58, "Ch.1 矛阵起夜", "拆塔卫", selectedChapter === 1, false);
    chCard(W / 2 - 140, 350, 115, 58, "Ch.2 笑墙合拢", unlockedCh2 ? "Boss 咧嘴" : "通关 Ch.1", selectedChapter === 2, !unlockedCh2);
    chCard(W / 2 - 10, 350, 115, 58, "Ch.3 哨兵一锤", unlockedCh3 ? "钉头收编" : "通关 Ch.2", selectedChapter === 3, !unlockedCh3);
    chCard(W / 2 + 120, 350, 115, 58, "Ch.4 蓝心开合", unlockedCh4 ? "终局分支" : "通关 Ch.3", selectedChapter === 4, !unlockedCh4);

    const blink = Math.sin(state.t * 4) > 0;
    if (blink) {
      drawPencilText("← → 或 1/2/3/4 选章 · Enter / 点击出发", W / 2, 430, 13, RED, "center");
    }

    ctx.fillStyle = "#555";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WASD 移动 · J 矛戳 · K 盾轮 · 空格 无限冲刺", W / 2, 455);
    let goal = "目标：戳掉两座红线塔卫底座的 + 与 × · 躲开红雨";
    if (selectedChapter === 2) goal = "目标：拆笑墙 → 空档打脸 · 躲开齿刃与怒视";
    if (selectedChapter === 3) goal = "目标：挡蓝心收编钉头，或击败它 · 钉砸安全区";
    if (selectedChapter === 4) goal = "目标：拆荚→攀关节→蓝心窗→结局 A 扎蓝心 / B 扎「还要」";
    ctx.fillText(goal, W / 2, 478);
    if (nailRecruited) {
      ctx.fillStyle = BLUE_HINT;
      ctx.fillText("已收编钉头 → Ch.4 钉头掩体加成 ON", W / 2, 500);
    } else if (selectedChapter === 4) {
      ctx.fillStyle = "#666";
      ctx.fillText("未收编钉头 · Ch.4 无掩体（可先打 Ch.3 收编）", W / 2, 500);
    }
  }

  function drawResult(win) {
    drawPaperBg();
    drawAmbientRain();
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / (p.maxLife || 1));
      fillJitterEllipse(p.x, p.y, p.r, p.r, p.color, 0.4);
      ctx.globalAlpha = 1;
    }
    drawInkBlots();

    const ch = state.chapter || 1;
    let title, sub;
    if (win) {
      if (ch === 4) {
        if (state.ch4Ending === "B") {
          title = "把「还要」还给纸原。";
          sub = "蓝心闭合，红雨变细。无限睡着，像一座小山。城魂：「……下次，画轻一点。」";
        } else {
          title = "蓝心被扎穿了。";
          sub = "红雨暂停。——无限吞掉烬矛的名字。下一任无名骑手，会再来。";
        }
      } else if (ch === 3) {
        if (state.ch3Outcome === "recruit") {
          title = "钉头点了点触手。";
          sub = "「蓝心再来——我砸给你安全区。」（Ch.4 钉头掩体已就绪）";
        } else {
          title = "哨兵安静了。";
          sub = "路上少了一座锤子。Ch.4 将没有钉头掩体。";
        }
      } else if (ch === 2) {
        title = "要塞塌了一角。";
        sub = "城魂咧嘴第一次不笑了：「……下次，画轻一点。」";
      } else {
        title = "红雨缝里——过了。";
        sub = "城魂远方笑了一声。下一章，才是咧嘴。";
      }
    } else {
      title = ch === 4 ? "被蓝心与红雨淹没。" : ch === 3 ? "被钉砸与蓝光淹没。" : ch === 2 ? "被笑墙夹碎了。" : "被夹进塔墙之间。";
      sub = "烬矛抹掉鼻血：「还要。」";
    }

    drawTapeRect(W / 2 - 200, 120, 400, 50, win ? BLACK : RED);
    drawPencilText(title, W / 2, 146, 28, win ? BLACK : RED, "center");
    drawPencilText(sub, W / 2, 200, 14, RED, "center");

    ctx.fillStyle = BLACK;
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Ch." + ch + " · 得分  " + state.score, W / 2, 250);
    ctx.fillText("冲刺  " + state.dashes + " 次 · 遗忘闪现  " + state.forgets + " 次", W / 2, 278);
    ctx.fillText("剩余纸胶带  " + state.hp + " / " + state.maxHp, W / 2, 306);
    if (win && ch === 3) {
      ctx.fillStyle = state.ch3Outcome === "recruit" ? BLUE_HINT : "#444";
      ctx.fillText(state.ch3Outcome === "recruit" ? "结局：收编钉头 · 掩体钩子 ON" : "结局：击败钉头 · 掩体钩子 OFF", W / 2, 332);
    }
    if (win && ch === 4) {
      ctx.fillStyle = state.ch4Ending === "B" ? BLACK : BLUE_HINT;
      ctx.fillText(state.ch4Ending === "B" ? "正史结局 B：扎「还要」· 雨变细 · 龙睡去" : "结局 A：扎蓝心 · 雨停 · 名字被吞", W / 2, 332);
    }

    if (Math.sin(state.t * 4) > 0) {
      let tip;
      if (win && ch === 1 && unlockedCh2) tip = "Enter / 点击 — 进 Ch.2 笑墙合拢  ·  T 回营地";
      else if (win && ch === 2 && unlockedCh3) tip = "Enter / 点击 — 进 Ch.3 哨兵一锤  ·  T 回营地";
      else if (win && ch === 3 && unlockedCh4) tip = "Enter / 点击 — 进 Ch.4 蓝心开合  ·  T 回营地";
      else if (win && ch === 4) tip = "终章完成 · Enter / 点击 — 回营地";
      else if (win) tip = "Enter / 点击 — 回营地选章";
      else tip = "Enter / R / 点击 — 再冲一次  ·  T 回营地";
      drawPencilText(tip, W / 2, 370, 14, RED, "center");
    }

    if (win && ch === 1 && unlockedCh2) {
      drawTapeRect(W / 2 - 120, 400, 240, 28, RED);
      drawPencilText("→ 继续：Ch.2 城魂·咧嘴", W / 2, 416, 14, BLACK, "center");
    }
    if (win && ch === 2 && unlockedCh3) {
      drawTapeRect(W / 2 - 120, 400, 240, 28, RED);
      drawPencilText("→ 继续：Ch.3 节触哨·钉头", W / 2, 416, 14, BLACK, "center");
    }
    if (win && ch === 3 && unlockedCh4) {
      drawTapeRect(W / 2 - 120, 400, 240, 28, RED);
      drawPencilText("→ 继续：Ch.4 天裂之主·蓝心", W / 2, 416, 14, BLACK, "center");
    }

    if (win && state.forgets > 0) {
      ctx.fillStyle = "#444";
      ctx.font = "13px sans-serif";
      ctx.fillText("无限歪头：……你刚才，叫过我的名字吗？", W / 2, 460);
    }
  }

  function drawBossHint() {
    ctx.globalAlpha = 0.18;
    strokeJitterEllipse(W / 2, 48, 48, 20, RED, 1.6, 2);
    fillJitterEllipse(W / 2, 48, 9, 9, BLUE_HINT, 0.5);
    strokeJitterEllipse(W / 2, 48, 9, 9, BLACK, 1, 0.4);
    // faint grin
    strokeJitterLine(W / 2 - 16, 62, W / 2, 68, BLACK, 1.2, 0.8, 3);
    strokeJitterLine(W / 2, 68, W / 2 + 16, 62, BLACK, 1.2, 0.8, 3);
    ctx.globalAlpha = 1;
  }

  function drawPlaying() {
    ctx.save();
    if (state.cameraShake > 0) {
      ctx.translate(rand(-4, 4), rand(-3, 3));
    }
    drawPaperBg();
    drawSkyline();
    drawAmbientRain();
    drawGround();
    if (state.chapter === 1) drawBossHint();
    if (state.chapter === 3) drawCh3Decor();
    if (state.chapter === 4) drawCh4Decor();
    drawInkBlots();

    if (state.chapter === 2) drawFortress();
    if (state.chapter !== 3 && state.chapter !== 4) {
      for (const tw of state.towers) drawTower(tw);
    }
    if (state.chapter === 2) drawGrinBoss();
    if (state.chapter === 3) {
      drawBlueEye();
      drawSafeZones();
      drawTentacles();
      drawNailhead();
    }
    if (state.chapter === 4) {
      drawPodsAndJoints();
      drawSkyLordBoss();
      drawSafeZones();
      drawNailAlly();
    }
    drawBullets();
    drawTears();
    drawDragonAndRider(state.px, state.py, state.facing);
    if (state.chapter === 4 && state.skyLord && state.skyLord.choiceReady) drawChoiceTargets();
    drawHitWrinkle();
    drawParticles();
    ctx.restore();
    drawHUD();
  }

  function draw() {
    if (state.mode === "title") drawTitle();
    else if (state.mode === "win") drawResult(true);
    else if (state.mode === "lose") drawResult(false);
    else drawPlaying();
  }

  // ——— Loop ———
  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  goTitle();
  requestAnimationFrame(frame);

  window.__INF_SPEAR__ = {
    startGame,
    goTitle,
    getState: () => state,
    canvas,
    setChapter: (n) => { selectedChapter = n; },
    unlockCh2: () => { unlockedCh2 = true; },
    unlockCh3: () => { unlockedCh3 = true; },
    unlockCh4: () => { unlockedCh4 = true; },
    getNailRecruited: () => nailRecruited,
    setNailRecruited: (v) => { nailRecruited = !!v; },
    forceCh4Ending: (e) => {
      if (state.chapter === 4 && state.skyLord) {
        state.ch4Ending = e === "A" ? "A" : "B";
        state.skyLord.dead = true;
        state.skyLord.choiceReady = true;
      }
    },
  };
})();
