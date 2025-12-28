const KANJIVG_BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const HANZI_WRITER_BASE = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/";

const $ = (sel) => document.querySelector(sel);

function resolveSelectionRoot() {
  // 통합 페이지에서 선택 범위를 제한하고 싶을 때 사용:
  // e.g. <script>window.KANJI_VIEWER_ROOT_SELECTOR="#printer"</script>
  try {
    const sel = window.KANJI_VIEWER_ROOT_SELECTOR;
    if (typeof sel === "string" && sel.trim()) {
      const el = document.querySelector(sel.trim());
      if (el) return el;
    }
  } catch {
    // ignore
  }
  return null;
}

function isNodeWithinRoot(node, rootEl) {
  if (!rootEl) return true;
  if (!node) return false;
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return false;
  return rootEl.contains(el);
}

/**
 * Reader mode:
 * - "jp": KanjiVG SVG (한자/가나 포함)
 * - "cn": hanzi-writer-data JSON (중국어)
 *
 * UI는 없고, 코드/콘솔에서만 바꿀 수 있게 합니다.
 */
const MODE_DEFAULT = "jp";

function codePointHex5(ch) {
  const cp = ch.codePointAt(0);
  return cp.toString(16).padStart(5, "0");
}

function createSvgEl(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function computeStrokeWidthFromViewBox(viewBox) {
  const vb = String(viewBox || "")
    .split(/\s+/)
    .map(Number);
  const w = vb.length === 4 && vb.every((n) => Number.isFinite(n)) ? vb[2] : 109;
  return Math.max(2.4, w / 36.33);
}

async function fetchKanjiVGSvgText(ch) {
  const hex = codePointHex5(ch);
  const url = `${KANJIVG_BASE}${hex}.svg`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    // 데이터가 없는 건 정상 케이스로 취급(가벼운 로그만)
    if (res.status === 404) return null;
    const err = new Error(`가져오기 실패 (${res.status})`);
    err.status = res.status;
    err.url = url;
    throw err;
  }
  return await res.text();
}

async function fetchHanziWriterCharData(ch) {
  // hanzi-writer-data는 문자 자체를 파일명으로 씁니다 (URL-encode 필요)
  const url = `${HANZI_WRITER_BASE}${encodeURIComponent(ch)}.json`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = new Error(`가져오기 실패 (${res.status})`);
    err.status = res.status;
    err.url = url;
    throw err;
  }
  const data = await res.json();
  // 구조가 이상한 경우도 "없음"으로 처리(패널은 조용히 닫힘)
  if (!data) return null;
  if (!Array.isArray(data?.strokes) || data.strokes.length === 0) return null;
  return data;
}

function parseStrokePathsFromSvg(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("SVG 파싱 실패");

  const viewBox = svg.getAttribute("viewBox") || "0 0 109 109";
  let strokeGroup = svg.querySelector('g[id^="kvg:StrokePaths_"]');
  if (!strokeGroup) strokeGroup = svg.querySelector("g");
  const paths = strokeGroup ? Array.from(strokeGroup.querySelectorAll("path")) : [];
  const ds = paths.map((p) => p.getAttribute("d")).filter(Boolean);
  if (!ds.length) throw new Error("획 path를 찾지 못했습니다.");
  return { viewBox, ds };
}

function buildStrokeSvg({ viewBox, ds }) {
  const svg = createSvgEl("svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("aria-hidden", "true");

  const bgRect = createSvgEl("rect");
  bgRect.setAttribute("x", "0");
  bgRect.setAttribute("y", "0");
  const vb = String(viewBox || "")
    .split(/\s+/)
    .map(Number);
  if (vb.length === 4 && vb.every((n) => Number.isFinite(n))) {
    bgRect.setAttribute("x", String(vb[0]));
    bgRect.setAttribute("y", String(vb[1]));
    bgRect.setAttribute("width", String(vb[2]));
    bgRect.setAttribute("height", String(vb[3]));
  } else {
    bgRect.setAttribute("width", "109");
    bgRect.setAttribute("height", "109");
  }
  bgRect.setAttribute("fill", "#ffffff");

  const strokeWidth = computeStrokeWidthFromViewBox(viewBox);

  const bg = createSvgEl("g");
  bg.setAttribute("fill", "none");
  bg.setAttribute("stroke", "rgba(0,0,0,0.18)");
  bg.setAttribute("stroke-width", String(strokeWidth));
  bg.setAttribute("stroke-linecap", "round");
  bg.setAttribute("stroke-linejoin", "round");

  const fg = createSvgEl("g");
  fg.setAttribute("fill", "none");
  fg.setAttribute("stroke", "rgba(0,0,0,0.92)");
  fg.setAttribute("stroke-width", String(strokeWidth));
  fg.setAttribute("stroke-linecap", "round");
  fg.setAttribute("stroke-linejoin", "round");

  /** @type {SVGPathElement[]} */
  const strokePaths = [];
  for (const d of ds) {
    const pBg = createSvgEl("path");
    pBg.setAttribute("d", d);
    bg.appendChild(pBg);

    const p = createSvgEl("path");
    p.setAttribute("d", d);
    fg.appendChild(p);
    strokePaths.push(p);
  }

  svg.appendChild(bgRect);
  svg.appendChild(bg);
  svg.appendChild(fg);
  return { svg, strokePaths };
}

function mediansToDs(medians) {
  /** @type {string[]} */
  const out = [];
  for (const stroke of medians || []) {
    if (!Array.isArray(stroke) || stroke.length < 2) continue;
    const parts = [];
    for (let i = 0; i < stroke.length; i += 1) {
      const pt = stroke[i];
      if (!Array.isArray(pt) || pt.length < 2) continue;
      const x = Number(pt[0]);
      const y = Number(pt[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      parts.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
    }
    if (parts.length >= 2) out.push(parts.join(" "));
  }
  return out;
}

function computeMaskStrokeWidthFromViewBox(viewBox) {
  const vb = String(viewBox || "")
    .split(/\s+/)
    .map(Number);
  const w = vb.length === 4 && vb.every((n) => Number.isFinite(n)) ? vb[2] : 1024;
  return Math.max(40, w / 7);
}

let __cnSvgIdSeq = 0;

function buildHanziMaskedSvg({ strokes, medians, idPrefix }) {
  // app.js에서 쓰던 CN 렌더링 방식을 그대로 가져옴(좌표계 flip 포함)
  const yNudgeUp = 200;
  const viewBox = "-64 -140 1152 1152";
  const cnTransform = `translate(0 ${1024 - yNudgeUp}) scale(1 -1)`;

  const svg = createSvgEl("svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("aria-hidden", "true");
  svg.dataset.mode = "cn";

  const bgRect = createSvgEl("rect");
  bgRect.setAttribute("x", "-512");
  bgRect.setAttribute("y", "-512");
  bgRect.setAttribute("width", "2048");
  bgRect.setAttribute("height", "2048");
  bgRect.setAttribute("fill", "#ffffff");

  const defs = createSvgEl("defs");

  const bg = createSvgEl("g");
  bg.setAttribute("fill", "rgba(0,0,0,0.18)");
  bg.setAttribute("transform", cnTransform);

  const fg = createSvgEl("g");
  fg.setAttribute("fill", "rgba(0,0,0,0.92)");
  fg.setAttribute("transform", cnTransform);

  const medianDs = Array.isArray(medians) ? mediansToDs(medians) : [];
  const maskStrokeWidth = computeMaskStrokeWidthFromViewBox(viewBox);

  /** @type {SVGPathElement[]} */
  const animTargets = [];

  const prefix = `${idPrefix || "cn"}-${__cnSvgIdSeq++}`;

  for (let i = 0; i < strokes.length; i += 1) {
    const outlineD = strokes[i];

    const outlineBg = createSvgEl("path");
    outlineBg.setAttribute("d", outlineD);
    bg.appendChild(outlineBg);

    const mask = createSvgEl("mask");
    const maskId = `${prefix}-mask-${i}`;
    mask.setAttribute("id", maskId);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("maskContentUnits", "userSpaceOnUse");
    mask.setAttribute("x", "-512");
    mask.setAttribute("y", "-512");
    mask.setAttribute("width", "2048");
    mask.setAttribute("height", "2048");

    const hideRect = createSvgEl("rect");
    hideRect.setAttribute("x", "-512");
    hideRect.setAttribute("y", "-512");
    hideRect.setAttribute("width", "2048");
    hideRect.setAttribute("height", "2048");
    hideRect.setAttribute("fill", "black");
    mask.appendChild(hideRect);

    const reveal = createSvgEl("path");
    reveal.setAttribute("d", medianDs[i] || "M 0 0 L 1024 1024");
    reveal.setAttribute("fill", "none");
    reveal.setAttribute("stroke", "white");
    reveal.setAttribute("stroke-width", String(maskStrokeWidth));
    // CN 모드 두께 애니메이션을 위해 목표 두께 저장(app.js와 동일한 방식)
    reveal.dataset.width = String(maskStrokeWidth);
    reveal.setAttribute("stroke-linecap", "round");
    reveal.setAttribute("stroke-linejoin", "round");
    mask.appendChild(reveal);
    defs.appendChild(mask);

    const outlineFg = createSvgEl("path");
    outlineFg.setAttribute("d", outlineD);
    outlineFg.setAttribute("mask", `url(#${maskId})`);
    fg.appendChild(outlineFg);

    animTargets.push(reveal);
  }

  svg.appendChild(defs);
  svg.appendChild(bgRect);
  svg.appendChild(bg);
  svg.appendChild(fg);
  return { svg, strokePaths: animTargets };
}

function waitMs(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const EASING_FUNCTIONS = {
  linear: (t) => t,
  cubicOut: (t) => 1 - Math.pow(1 - t, 3),
};

function easingKeyToCssEasing(easingKey) {
  if (easingKey === "cubicOut") return "cubic-bezier(0.215, 0.61, 0.355, 1)";
  return "linear";
}

function animateStrokeDashoffset(pathEl, len, durationMs, abortRef, easingKey = "linear") {
  const svg = pathEl.closest("svg") || pathEl.ownerSVGElement;
  const isCn = svg?.dataset.mode === "cn";
  const targetWidth = parseFloat(pathEl.dataset.width || pathEl.getAttribute("stroke-width")) || 0;
  const easingFn = EASING_FUNCTIONS[easingKey] || EASING_FUNCTIONS.linear;

  // JP 모드: 가능한 경우 Web Animations API 사용(프레임 드랍 체감 완화)
  // CN 모드는 strokeWidth 확장(붓 퍼짐) 로직 때문에 rAF 유지
  if (!isCn && typeof pathEl.animate === "function") {
    return new Promise((resolve) => {
      if (abortRef.aborted) return resolve();
      if (!abortRef.animations) abortRef.animations = [];
      // reset()에서 지정한 초기값(len)이 확실히 적용된 상태에서 시작
      pathEl.style.strokeDashoffset = `${len}`;
      const anim = pathEl.animate(
        [{ strokeDashoffset: `${len}` }, { strokeDashoffset: "0" }],
        // fill:forwards를 쓰면 다음 루프의 reset 스타일을 덮어버릴 수 있어 none으로 두고,
        // 종료 시점에 최종값(0)을 style로 고정한다.
        { duration: durationMs, easing: easingKeyToCssEasing(easingKey), fill: "none" },
      );
      abortRef.animations.push(anim);
      anim.onfinish = () => {
        pathEl.style.strokeDashoffset = "0";
        resolve();
      };
      anim.oncancel = () => resolve();
      // abort 발생 시 즉시 취소
      const checkAbort = () => {
        if (abortRef.aborted) {
          try { anim.cancel(); } catch {}
          return;
        }
        requestAnimationFrame(checkAbort);
      };
      requestAnimationFrame(checkAbort);
    });
  }

  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now) => {
      if (abortRef.aborted) return resolve();
      const rawT = Math.min(1, (now - start) / durationMs);
      const t = easingFn(rawT);
      pathEl.style.strokeDashoffset = `${len * (1 - t)}`;
      // 중국어 모드: 붓 촉이 닿아 퍼지는 효과 (시작 25% 구간 동안 두께 확장) - app.js와 동일
      if (isCn && targetWidth > 0) {
        const widthT = Math.min(1, rawT / 0.25);
        const widthFactor = 1 - Math.pow(1 - widthT, 1);
        pathEl.style.strokeWidth = String(targetWidth * widthFactor);
      }
      if (rawT >= 1) {
        pathEl.style.strokeDashoffset = "0";
        if (isCn && targetWidth > 0) pathEl.style.strokeWidth = String(targetWidth);
        return resolve();
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

class StrokeAnimator {
  constructor(strokePaths, { speed = 1, gapMs = 10, easing = "linear", loop = true } = {}) {
    this.paths = strokePaths;
    this.speed = speed;
    this.gapMs = gapMs;
    this.easing = easing;
    this.loop = loop;
    this._abort = null;
  }

  stop() {
    if (!this._abort) return;
    this._abort.aborted = true;
    // WAAPI 애니메이션이 있으면 취소
    if (Array.isArray(this._abort.animations)) {
      for (const a of this._abort.animations) {
        try { a.cancel(); } catch {}
      }
    }
  }

  reset() {
    for (const p of this.paths) {
      // WAAPI가 남아있으면(style보다 우선) 다음 루프 reset을 방해할 수 있으므로 항상 취소
      if (typeof p.getAnimations === "function") {
        try {
          for (const a of p.getAnimations()) a.cancel();
        } catch {
          // ignore
        }
      }
      if (typeof p._cachedLen === "undefined") p._cachedLen = p.getTotalLength();
      const len = p._cachedLen;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = `${len}`;
      p.style.opacity = "1";
      // CN 모드: 리셋 시 두께를 0부터 시작 (app.js와 동일)
      const svg = p.closest("svg") || p.ownerSVGElement;
      const isCn = svg?.dataset.mode === "cn";
      const targetWidth = p.dataset.width;
      if (isCn && targetWidth) p.style.strokeWidth = "0";
    }
  }

  async play() {
    this.stop();
    this._abort = { aborted: false };
    const abortRef = this._abort;
    while (!abortRef.aborted) {
      this.reset();
      for (const p of this.paths) {
        if (abortRef.aborted) return;
        if (typeof p._cachedLen === "undefined") p._cachedLen = p.getTotalLength();
        const len = p._cachedLen;
        // CN은 app.js처럼 더 짧게(진하게) 재생
        const svg = p.closest("svg") || p.ownerSVGElement;
        const isCn = svg?.dataset.mode === "cn";
        const baseMs = isCn ? 120 : 180;
        const scale = isCn ? 0.8 : 7;
        const duration = Math.round((baseMs + Math.min(1000, len * scale)) / Math.max(0.1, this.speed));
        p.style.strokeDasharray = `${len} ${len}`;
        p.style.strokeDashoffset = `${len}`;
        // eslint-disable-next-line no-await-in-loop
        await animateStrokeDashoffset(p, len, duration, abortRef, this.easing);
        if (this.gapMs > 0) {
          // eslint-disable-next-line no-await-in-loop
          await waitMs(this.gapMs);
        }
      }
      if (!this.loop) break;
      // eslint-disable-next-line no-await-in-loop
      await waitMs(450);
    }
  }
}

function extractFirstHan(str) {
  const s = String(str || "");
  // 최신 브라우저: Unicode property escapes
  try {
    // 한자 + 히라가나 + 가타카나를 “표시 대상”으로 취급
    const m = s.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u);
    if (m) return m[0];
  } catch {
    // fallback below
  }
  // fallback:
  // - Han: CJK Unified Ideographs + Extension A 일부
  // - Hiragana/Katakana: 기본 블록 + 반각 가타카나 포함(일부)
  const m2 = s.match(/[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF65-\uFF9F]/);
  return m2 ? m2[0] : null;
}

function getSelectionText(rootEl) {
  const sel = window.getSelection?.();
  if (!sel) return "";
  if (sel.rangeCount > 0 && rootEl) {
    try {
      const range = sel.getRangeAt(0);
      const common = range.commonAncestorContainer;
      if (!isNodeWithinRoot(common, rootEl)) return "";
    } catch {
      // ignore
    }
  }
  return String(sel.toString() || "");
}

async function main() {
  const rfPanel = $("#rfPanel");
  const rfClose = $("#rfClose");
  const rfChar = $("#rfChar");
  const rfSvgWrap = $("#rfSvgWrap");

  const selectionRoot = resolveSelectionRoot();

  /** @type {Map<string, string>} */
  const jpSvgCache = new Map();
  /** @type {Map<string, any>} */
  const cnDataCache = new Map();

  /** @type {{ ch: string|null, animator: StrokeAnimator|null, svgEl: SVGElement|null }} */
  const state = { ch: null, animator: null, svgEl: null };

  // 코드/URL로 모드 변경 가능하게
  let mode = MODE_DEFAULT;

  // 통합 페이지에서 초기 모드를 주입할 수 있게:
  // e.g. window.KANJI_VIEWER_DEFAULT_MODE = "cn" | "jp"
  try {
    const injected = String(window.KANJI_VIEWER_DEFAULT_MODE || "").toLowerCase();
    if (injected === "jp" || injected === "cn") mode = injected;
  } catch {
    // ignore
  }

  try {
    const qp = new URLSearchParams(location.search);
    const m = String(qp.get("mode") || "").toLowerCase();
    if (m === "jp" || m === "cn") mode = m;
  } catch {
    // ignore
  }

  let lastSel = "";
  let seq = 0;

  function logNoData(ch, modeKey) {
    // 스택 없이 한 줄만 (요청사항)
    console.info(`[kanji-viewer] stroke data missing (${modeKey}): ${ch}`);
  }

  function showPanel() {
    rfPanel?.classList.remove("isHidden");
  }

  function hidePanel() {
    if (state.animator) state.animator.stop();
    lastSel = "";
    state.ch = null;
    rfChar.textContent = "—";
    clearSvg();
    rfPanel?.classList.add("isHidden");
  }

  function clearSvg() {
    rfSvgWrap.innerHTML = "";
    state.svgEl = null;
    state.animator = null;
  }

  async function buildAndMountChar(ch, mySeq) {
    if (mode === "cn") {
      let data = cnDataCache.get(ch);
      if (!data) {
        data = await fetchHanziWriterCharData(ch);
        // null도 캐시해서 같은 글자 재시도 폭주 방지
        cnDataCache.set(ch, data);
      }
      if (mySeq !== seq) return null;
      if (!data) return { missing: true };
      const built = buildHanziMaskedSvg({ strokes: data.strokes, medians: data.medians, idPrefix: `cn-${ch.codePointAt(0).toString(16)}` });
      rfSvgWrap.appendChild(built.svg);
      return { built };
    }

    let svgText = jpSvgCache.get(ch);
    if (!svgText) {
      svgText = await fetchKanjiVGSvgText(ch);
      // null도 캐시해서 같은 글자 재시도 폭주 방지
      jpSvgCache.set(ch, svgText);
    }
    if (mySeq !== seq) return null;
    if (!svgText) return { missing: true };
    try {
      const parsed = parseStrokePathsFromSvg(svgText);
      const built = buildStrokeSvg(parsed);
      rfSvgWrap.appendChild(built.svg);
      return { built };
    } catch {
      return { missing: true };
    }
  }

  async function showChar(ch) {
    const mySeq = (seq += 1);
    // NOTE: 로딩/파싱이 끝나기 전에는 패널을 열지 않는다.
    // (빈 패널이 먼저 보이는 UX 방지)
    if (state.animator) state.animator.stop();
    clearSvg();

    try {
      const out = await buildAndMountChar(ch, mySeq);
      if (!out) return;
      if (out.missing) {
        logNoData(ch, mode);
        hidePanel();
        return;
      }
      const { built } = out;

      state.ch = ch;
      rfChar.textContent = ch;
      const animator = new StrokeAnimator(built.strokePaths, { speed: 1.0, gapMs: 10, easing: "linear", loop: true });
      state.animator = animator;
      state.svgEl = built.svg;

      // IMPORTANT:
      // play()가 시작되기 전(딜레이 구간)에도 "초기 상태(회색 윤곽만)"로 보이도록
      // 먼저 reset을 적용해서 검정 플래시를 방지한다. (특히 CN 마스크 reveal)
      animator.reset();

      showPanel();

      // 패널이 열린 뒤 약간의 여유를 두고 애니메이션 시작
      // (중간에 다른 selection이 들어오면 현재 요청은 무시)
      await waitMs(200);
      if (mySeq !== seq) return;

      animator.play();
    } catch (e) {
      if (mySeq !== seq) return;
      // 표시할 수 없는 경우(데이터 없음/오류 등) 패널은 닫음
      console.warn(`[kanji-viewer] render failed (${mode}): ${ch} (${e?.message || e})`);
      hidePanel();
    }
  }

  async function handleSelection() {
    const text = getSelectionText(selectionRoot);
    const trimmed = text.trim();
    if (!trimmed) {
      hidePanel();
      return;
    }
    // 너무 잦은 업데이트 방지 + 같은 선택은 무시
    if (trimmed === lastSel) return;
    lastSel = trimmed;

    const ch = extractFirstHan(trimmed);
    if (!ch) {
      // 표시할 게 없으면 패널 닫기
      hidePanel();
      return;
    }
    if (ch === state.ch) return;
    await showChar(ch);
  }

  // 드래그 선택(마우스) + 키보드 선택 모두 대응
  let selTimer = null;
  const scheduleHandleSelection = () => {
    if (selTimer) clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      selTimer = null;
      handleSelection();
    }, 80);
  };

  document.addEventListener("mouseup", () => handleSelection());
  document.addEventListener("keyup", (e) => {
    if (e.key === "Shift" || e.key.startsWith("Arrow")) scheduleHandleSelection();
  });
  document.addEventListener("selectionchange", () => scheduleHandleSelection());

  rfClose?.addEventListener("click", () => hidePanel());

  // 콘솔/코드에서 모드 변경: window.setReaderMode("cn") / window.setReaderMode("jp")
  window.setReaderMode = (next) => {
    const m = String(next || "").toLowerCase();
    mode = m === "cn" ? "cn" : "jp";
    // 현재 표시 중이면 즉시 다시 로드(데이터 소스가 달라짐)
    if (state.ch) showChar(state.ch);
  };

  hidePanel();
}

main().catch((e) => {
  console.warn(`[kanji-viewer] fatal: ${e?.message || e}`);
});


