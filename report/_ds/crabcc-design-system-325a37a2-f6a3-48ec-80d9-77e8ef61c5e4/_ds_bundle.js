/* @ds-bundle: {"format":3,"namespace":"CrabccDesignSystem_325a37","components":[{"name":"Badge","sourcePath":"components/badges/Badge.jsx"},{"name":"LiveDot","sourcePath":"components/badges/LiveDot.jsx"},{"name":"ShaderBackground","sourcePath":"components/brand/ShaderBackground.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Tabs","sourcePath":"components/surfaces/Tabs.jsx"}],"sourceHashes":{"components/badges/Badge.jsx":"c4c1fdb39fe5","components/badges/LiveDot.jsx":"d71aec0b6776","components/brand/ShaderBackground.jsx":"e01a6d21a19f","components/buttons/Button.jsx":"ba03d551d183","components/buttons/IconButton.jsx":"80fb052d0889","components/feedback/Tooltip.jsx":"c21d23303d1d","components/forms/Input.jsx":"3a138d38a9f6","components/forms/Select.jsx":"3a112aa72e57","components/forms/Switch.jsx":"36861a31c037","components/surfaces/Card.jsx":"2047c30ebd87","components/surfaces/Tabs.jsx":"2d5cd2ccaf43"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CrabccDesignSystem_325a37 = window.CrabccDesignSystem_325a37 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/badges/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Badge — compact status / label token. Used for symbol kinds
 * (class, fn, method), counts, and status (live, ok, warn). Square by
 * default; `pill` for status. Reads design-system semantic colors.
 */

let _injected = false;
function useBadgeCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-badge-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-badge-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-badge {
  --_fg: var(--text-muted);
  --_bg: var(--surface-sunken);
  --_bd: var(--border-subtle);
  display: inline-flex; align-items: center; gap: var(--space-1);
  font-family: var(--font-mono);
  font-weight: var(--fw-medium);
  font-size: var(--text-2xs);
  line-height: 1;
  letter-spacing: 0.02em;
  padding: 3px 7px;
  border-radius: var(--radius-sm);
  border: var(--border-hair) solid var(--_bd);
  background: var(--_bg);
  color: var(--_fg);
  white-space: nowrap;
}
.cc-badge--pill { border-radius: var(--radius-pill); }
.cc-badge--solid { border-color: transparent; }
.cc-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }

.cc-badge--neutral { --_fg: var(--text-muted); --_bg: var(--surface-sunken); --_bd: var(--border-subtle); }
.cc-badge--accent  { --_fg: var(--accent); --_bg: var(--accent-wash); --_bd: color-mix(in oklch, var(--accent) 30%, transparent); }
.cc-badge--ok      { --_fg: var(--ok); --_bg: var(--ok-wash); --_bd: color-mix(in oklch, var(--ok) 30%, transparent); }
.cc-badge--warn    { --_fg: color-mix(in oklch, var(--warn) 78%, black); --_bg: var(--warn-wash); --_bd: color-mix(in oklch, var(--warn) 40%, transparent); }
.cc-badge--danger  { --_fg: var(--danger); --_bg: var(--danger-wash); --_bd: color-mix(in oklch, var(--danger) 30%, transparent); }
.cc-badge--info    { --_fg: var(--info); --_bg: var(--info-wash); --_bd: color-mix(in oklch, var(--info) 30%, transparent); }

.cc-badge--solid.cc-badge--accent { --_bg: var(--accent); --_fg: var(--text-on-accent); }
.cc-badge--solid.cc-badge--ok     { --_bg: var(--ok); --_fg: #fff; }
.cc-badge--solid.cc-badge--danger { --_bg: var(--danger); --_fg: #fff; }
`;
function Badge({
  children,
  tone = "neutral",
  pill = false,
  solid = false,
  dot = false,
  className = "",
  ...rest
}) {
  useBadgeCss();
  const cls = ["cc-badge", `cc-badge--${tone}`, pill ? "cc-badge--pill" : "", solid ? "cc-badge--solid" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    className: "cc-badge__dot"
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/badges/Badge.jsx", error: String((e && e.message) || e) }); }

// components/badges/LiveDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc LiveDot — the signature "live" connection indicator from the
 * dashboard. A small dot that pulses an expanding ring while connected.
 * Honors prefers-reduced-motion (ring is suppressed).
 */

let _injected = false;
function useLiveDotCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-livedot-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-livedot-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-live {
  display: inline-flex; align-items: center; gap: var(--space-1_5);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--fw-bold);
  letter-spacing: 0.02em;
  color: var(--text-muted);
}
.cc-live__dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--text-faint);
  flex: none;
  transition: background var(--dur-fast) var(--ease-out);
}
.cc-live--on { color: var(--ok); }
.cc-live--on .cc-live__dot {
  background: var(--ok);
  animation: cc-live-pulse var(--dur-pulse) var(--ease-out) infinite;
}
@keyframes cc-live-pulse {
  0%   { box-shadow: 0 0 0 0 color-mix(in oklch, var(--ok) 55%, transparent); }
  70%  { box-shadow: 0 0 0 8px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .cc-live--on .cc-live__dot { animation: none; }
}
`;
function LiveDot({
  live = true,
  label = "live",
  className = "",
  ...rest
}) {
  useLiveDotCss();
  const cls = ["cc-live", live ? "cc-live--on" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    title: live ? "connected" : "disconnected"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "cc-live__dot"
  }), label ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { LiveDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/badges/LiveDot.jsx", error: String((e && e.message) || e) }); }

// components/brand/ShaderBackground.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc ShaderBackground — a slow, calm warm-aurora backdrop rendered on a
 * WebGL canvas. Theme-aware (dark charcoal / light cream), readability-safe
 * (low contrast so foreground text stays legible), and honors
 * prefers-reduced-motion (freezes to a still gradient). Self-contained:
 * React + WebGL only, no deps. This is the same effect as the Ghostty
 * `calm.glsl` backdrop, packaged for design files.
 *
 * Drop it as the first child of a positioned container and put your content
 * after it:
 *   <div style={{position:'relative'}}>
 *     <ShaderBackground theme="dark" />
 *     <YourContent/>
 *   </div>
 */

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_theme;      // 0 = dark, 1 = light
uniform float u_intensity;  // 0..1 calm -> lively

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 q  = uv; q.x *= u_res.x / u_res.y;
  float t = u_time * 0.025;
  float n = fbm(q*2.0 + vec2(t, t*0.6));
  n = fbm(q*2.0 + n*1.4 + vec2(-t*0.5, t*0.9));
  float amp = mix(0.18, 0.5, u_intensity);

  vec3 col;
  if (u_theme < 0.5) {
    // dark calm: charcoal -> ember -> faint amber
    vec3 base  = vec3(0.055,0.055,0.063);   // #0e0e10
    vec3 ember = vec3(0.36,0.15,0.07);
    vec3 amber = vec3(1.0,0.55,0.26);        // #ff8c42
    col = mix(base, ember, smoothstep(0.40,0.82,n)*amp*1.7);
    col = mix(col, amber, smoothstep(0.80,0.99,n)*amp*0.5);
  } else {
    // light calm: cream -> butter -> soft shell
    vec3 base   = vec3(0.992,0.965,0.863);   // #fdf6dc
    vec3 butter = vec3(0.980,0.918,0.745);
    vec3 shell  = vec3(0.960,0.835,0.722);   // crab-200
    col = mix(base, butter, smoothstep(0.35,0.80,n)*0.85);
    col = mix(col, shell, smoothstep(0.72,0.98,n)*amp*0.7);
  }
  // soft vignette
  float vig = smoothstep(1.30,0.30,length(uv-0.5));
  col *= mix(0.84,1.0,vig);
  gl_FragColor = vec4(col,1.0);
}
`;
const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;
function resolveTheme(theme) {
  if (theme === "dark" || theme === "light") return theme;
  // auto: explicit data-theme wins, else OS preference
  const attr = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}
function ShaderBackground({
  theme = "auto",
  intensity = 0.25,
  animate = true,
  className = "",
  style = {},
  ...rest
}) {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uTheme = gl.getUniformLocation(prog, "u_theme");
    const uInt = gl.getUniformLocation(prog, "u_intensity");
    const themeVal = () => resolveTheme(theme) === "dark" ? 0 : 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // fall back to the parent box (or a sane default) if the canvas
      // hasn't been laid out yet, so the very first paint is never 0-size
      const par = canvas.parentElement;
      const cw = canvas.clientWidth || par && par.clientWidth || 300;
      const ch = canvas.clientHeight || par && par.clientHeight || 150;
      const w = Math.max(1, Math.floor(cw * dpr));
      const h = Math.max(1, Math.floor(ch * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    let raf = 0;
    const start = performance.now();
    const paint = now => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, animate && !reduce ? (now - start) / 1000 : 8.0);
      gl.uniform1f(uTheme, themeVal());
      gl.uniform1f(uInt, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = now => {
      paint(now);
      raf = requestAnimationFrame(loop);
    };
    // immediate synchronous first paint — the canvas is never blank even
    // if requestAnimationFrame is delayed, throttled, or never fires
    paint(performance.now());
    if (animate && !reduce) raf = requestAnimationFrame(loop);

    // re-paint once on theme/OS change
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => paint(performance.now());
    if (mq && mq.addEventListener) mq.addEventListener("change", onChange);
    return () => {
      cancelAnimationFrame(raf);
      if (mq && mq.removeEventListener) mq.removeEventListener("change", onChange);
      gl.getExtension("WEBGL_lose_context") && gl.getExtension("WEBGL_lose_context").loseContext();
    };
  }, [theme, intensity, animate]);
  return /*#__PURE__*/React.createElement("canvas", _extends({
    ref: canvasRef,
    "aria-hidden": "true",
    className: className,
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      display: "block",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { ShaderBackground });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/ShaderBackground.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Button — the primary action control.
 * Self-contained: imports React only, styles via injected CSS that reads
 * design-system custom properties. Mechanical feel — color shifts on
 * hover/press, no scale animation.
 */

let _injected = false;
function useButtonCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-button-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-button-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-btn {
  --_bg: var(--accent);
  --_fg: var(--text-on-accent);
  --_bd: transparent;
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-weight: var(--fw-medium);
  font-size: var(--text-sm);
  line-height: 1;
  white-space: nowrap;
  border: var(--border-hair) solid var(--_bd);
  border-radius: var(--radius-md);
  background: var(--_bg);
  color: var(--_fg);
  height: var(--control-h-md);
  padding: 0 var(--space-4);
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition-control);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.cc-btn:hover { background: var(--_bgh, var(--_bg)); border-color: var(--_bdh, var(--_bd)); color: var(--_fgh, var(--_fg)); }
.cc-btn:active { background: var(--_bga, var(--_bgh, var(--_bg))); }
.cc-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.cc-btn[disabled], .cc-btn[aria-disabled="true"] { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
.cc-btn--full { width: 100%; }

/* sizes */
.cc-btn--sm { height: var(--control-h-sm); padding: 0 var(--space-3); font-size: var(--text-xs); gap: var(--space-1_5); }
.cc-btn--lg { height: var(--control-h-lg); padding: 0 var(--space-5); font-size: var(--text-base); }

/* variants */
.cc-btn--primary { --_bg: var(--accent); --_fg: var(--text-on-accent); --_bgh: var(--accent-hover); --_bga: var(--accent-press); }
.cc-btn--secondary {
  --_bg: var(--surface-card); --_fg: var(--text-body); --_bd: var(--border-strong);
  --_bgh: var(--surface-hover); --_bdh: var(--accent); --_fgh: var(--text-accent);
}
.cc-btn--ghost {
  --_bg: transparent; --_fg: var(--text-muted); --_bd: transparent;
  --_bgh: var(--surface-hover); --_fgh: var(--text-accent);
}
.cc-btn--danger { --_bg: var(--danger); --_fg: #fff; --_bgh: color-mix(in oklch, var(--danger) 85%, black); --_bga: color-mix(in oklch, var(--danger) 72%, black); }

.cc-btn__icon { display: inline-flex; width: 1em; height: 1em; flex: none; }
.cc-btn__icon svg { width: 100%; height: 100%; display: block; }
`;
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  as = "button",
  className = "",
  ...rest
}) {
  useButtonCss();
  const Tag = as;
  const cls = ["cc-btn", `cc-btn--${variant}`, size !== "md" ? `cc-btn--${size}` : "", fullWidth ? "cc-btn--full" : "", className].filter(Boolean).join(" ");
  const props = Tag === "button" ? {
    type,
    disabled
  } : {
    "aria-disabled": disabled || undefined
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, props, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "cc-btn__icon"
  }, iconLeft) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "cc-btn__icon"
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc IconButton — a square, icon-only control for dense toolbars
 * (the dashboard header: reload ↻, search, theme toggle). Always pass an
 * accessible `label`.
 */

let _injected = false;
function useIconButtonCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-iconbutton-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-iconbutton-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-iconbtn {
  display: inline-flex; align-items: center; justify-content: center;
  width: var(--control-h-md); height: var(--control-h-md);
  border: var(--border-hair) solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-control);
  -webkit-tap-highlight-color: transparent;
}
.cc-iconbtn:hover { color: var(--text-accent); border-color: var(--accent); background: var(--surface-hover); }
.cc-iconbtn:active { background: var(--accent-wash); }
.cc-iconbtn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.cc-iconbtn[disabled] { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
.cc-iconbtn--sm { width: var(--control-h-sm); height: var(--control-h-sm); }
.cc-iconbtn--lg { width: var(--control-h-lg); height: var(--control-h-lg); }
.cc-iconbtn--ghost { border-color: transparent; background: transparent; }
.cc-iconbtn__icon { width: 16px; height: 16px; display: inline-flex; }
.cc-iconbtn__icon svg { width: 100%; height: 100%; display: block; }
`;
function IconButton({
  icon,
  label,
  size = "md",
  variant = "outline",
  disabled = false,
  className = "",
  ...rest
}) {
  useIconButtonCss();
  const cls = ["cc-iconbtn", size !== "md" ? `cc-iconbtn--${size}` : "", variant === "ghost" ? "cc-iconbtn--ghost" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-label": label,
    title: label,
    disabled: disabled
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "cc-iconbtn__icon"
  }, icon));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Tooltip — hover/focus tooltip (the graph node hover label). Wraps
 * a single child; positions a small accent-bordered bubble. Lightweight,
 * CSS-positioned (top/bottom/left/right), no portal.
 */

let _injected = false;
function useTooltipCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-tooltip-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-tooltip-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-tt { position: relative; display: inline-flex; }
.cc-tt__bubble {
  position: absolute; z-index: 40;
  pointer-events: none;
  font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.4;
  color: var(--text-body);
  background: var(--surface-card);
  border: var(--border-hair) solid var(--accent);
  border-radius: var(--radius-md);
  padding: var(--space-1_5) var(--space-2_5);
  box-shadow: var(--shadow-md);
  white-space: nowrap; max-width: 320px;
  opacity: 0; transform: translateY(2px) scale(0.98);
  transition: opacity var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.cc-tt:hover .cc-tt__bubble, .cc-tt:focus-within .cc-tt__bubble { opacity: 1; transform: translateY(0) scale(1); }
.cc-tt__bubble--top    { bottom: 100%; left: 50%; transform: translate(-50%, 2px) scale(0.98); margin-bottom: 7px; }
.cc-tt:hover .cc-tt__bubble--top, .cc-tt:focus-within .cc-tt__bubble--top { transform: translate(-50%, 0) scale(1); }
.cc-tt__bubble--bottom { top: 100%; left: 50%; transform: translate(-50%, -2px) scale(0.98); margin-top: 7px; }
.cc-tt:hover .cc-tt__bubble--bottom, .cc-tt:focus-within .cc-tt__bubble--bottom { transform: translate(-50%, 0) scale(1); }
.cc-tt__bubble--right  { left: 100%; top: 50%; transform: translate(-2px, -50%) scale(0.98); margin-left: 7px; }
.cc-tt:hover .cc-tt__bubble--right, .cc-tt:focus-within .cc-tt__bubble--right { transform: translate(0, -50%) scale(1); }
.cc-tt__bubble--left   { right: 100%; top: 50%; transform: translate(2px, -50%) scale(0.98); margin-right: 7px; }
.cc-tt:hover .cc-tt__bubble--left, .cc-tt:focus-within .cc-tt__bubble--left { transform: translate(0, -50%) scale(1); }
`;
function Tooltip({
  children,
  content,
  side = "top",
  className = "",
  ...rest
}) {
  useTooltipCss();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ["cc-tt", className].filter(Boolean).join(" ")
  }, rest), children, /*#__PURE__*/React.createElement("span", {
    className: `cc-tt__bubble cc-tt__bubble--${side}`,
    role: "tooltip"
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Input — single-line text field, monospace. Supports an optional
 * leading glyph/prefix (e.g. the prompt "$" or a search icon) and a
 * compact size for toolbars (the dashboard's `root` / `depth` inputs).
 */

let _injected = false;
function useInputCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-input-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-input-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-field { display: inline-flex; flex-direction: column; gap: var(--space-1); }
.cc-field--full { display: flex; width: 100%; }
.cc-field__label {
  font-family: var(--font-mono); font-size: var(--text-2xs);
  text-transform: uppercase; letter-spacing: var(--tracking-caps);
  color: var(--text-muted);
}
.cc-input {
  display: flex; align-items: center; gap: var(--space-2);
  background: var(--surface-card);
  border: var(--border-hair) solid var(--border-strong);
  border-radius: var(--radius-md);
  height: var(--control-h-md);
  padding: 0 var(--space-3);
  transition: var(--transition-control);
}
.cc-input:focus-within { border-color: var(--accent); box-shadow: var(--shadow-focus); }
.cc-input--sm { height: var(--control-h-sm); padding: 0 var(--space-2); }
.cc-input--invalid { border-color: var(--danger); }
.cc-input--disabled { opacity: 0.5; pointer-events: none; }
.cc-input__prefix, .cc-input__suffix { display: inline-flex; align-items: center; color: var(--text-faint); font-family: var(--font-mono); font-size: var(--text-sm); flex: none; }
.cc-input__prefix svg, .cc-input__suffix svg { width: 14px; height: 14px; }
.cc-input input {
  flex: 1; min-width: 0;
  border: 0; outline: none; background: transparent;
  font-family: var(--font-mono); font-size: var(--text-sm);
  color: var(--text-body);
}
.cc-input input::placeholder { color: var(--text-faint); }
.cc-field__hint { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); }
.cc-field__hint--err { color: var(--danger); }
`;
function Input({
  label,
  prefix = null,
  suffix = null,
  size = "md",
  invalid = false,
  disabled = false,
  hint = "",
  fullWidth = false,
  className = "",
  id,
  ...rest
}) {
  useInputCss();
  const autoId = React.useId();
  const fieldId = id || autoId;
  const boxCls = ["cc-input", size === "sm" ? "cc-input--sm" : "", invalid ? "cc-input--invalid" : "", disabled ? "cc-input--disabled" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", {
    className: ["cc-field", fullWidth ? "cc-field--full" : "", className].filter(Boolean).join(" ")
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "cc-field__label",
    htmlFor: fieldId
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    className: boxCls
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    className: "cc-input__prefix"
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    disabled: disabled,
    "aria-invalid": invalid || undefined
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    className: "cc-input__suffix"
  }, suffix) : null), hint ? /*#__PURE__*/React.createElement("span", {
    className: "cc-field__hint" + (invalid ? " cc-field__hint--err" : "")
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Select — a styled native <select> (the dashboard's `dir`
 * callers/callees picker). Keeps the native menu for accessibility; we
 * only restyle the box + chevron.
 */

let _injected = false;
function useSelectCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-select-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-select-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-select {
  position: relative; display: inline-flex; align-items: center;
}
.cc-select--full { display: flex; width: 100%; }
.cc-select select {
  appearance: none; -webkit-appearance: none;
  font-family: var(--font-mono); font-size: var(--text-sm);
  color: var(--text-body);
  background: var(--surface-card);
  border: var(--border-hair) solid var(--border-strong);
  border-radius: var(--radius-md);
  height: var(--control-h-md);
  padding: 0 var(--space-7) 0 var(--space-3);
  width: 100%;
  cursor: pointer;
  transition: var(--transition-control);
}
.cc-select--sm select { height: var(--control-h-sm); font-size: var(--text-xs); padding-right: var(--space-6); }
.cc-select select:hover { border-color: var(--accent); }
.cc-select select:focus-visible { outline: none; border-color: var(--accent); box-shadow: var(--shadow-focus); }
.cc-select select:disabled { opacity: 0.5; cursor: not-allowed; }
.cc-select__chevron {
  position: absolute; right: var(--space-2); top: 50%; transform: translateY(-50%);
  pointer-events: none; color: var(--text-muted);
  width: 14px; height: 14px;
}
.cc-select__chevron svg { width: 100%; height: 100%; display: block; }
`;
const Chevron = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 9l6 6 6-6"
}));
function Select({
  value,
  onChange,
  options = [],
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) {
  useSelectCss();
  const cls = ["cc-select", size === "sm" ? "cc-select--sm" : "", fullWidth ? "cc-select--full" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", {
    className: cls
  }, /*#__PURE__*/React.createElement("select", _extends({
    value: value,
    onChange: onChange,
    disabled: disabled
  }, rest), children ? children : options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("span", {
    className: "cc-select__chevron"
  }, Chevron));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Switch — a compact toggle (e.g. the dashboard theme toggle,
 * "auto-memory" on/off). Track turns crab-accent when on.
 */

let _injected = false;
function useSwitchCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-switch-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-switch-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-switch {
  display: inline-flex; align-items: center; gap: var(--space-2);
  font-family: var(--font-mono); font-size: var(--text-sm);
  color: var(--text-body); cursor: pointer; user-select: none;
}
.cc-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.cc-switch__track {
  position: relative; width: 34px; height: 20px; flex: none;
  background: var(--border-strong);
  border-radius: var(--radius-pill);
  transition: background var(--dur-fast) var(--ease-out);
}
.cc-switch__thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  transition: transform var(--dur-fast) var(--ease-out);
}
.cc-switch input:checked + .cc-switch__track { background: var(--accent); }
.cc-switch input:checked + .cc-switch__track .cc-switch__thumb { transform: translateX(14px); }
.cc-switch input:focus-visible + .cc-switch__track { box-shadow: var(--shadow-focus); }
.cc-switch--disabled { opacity: 0.5; cursor: not-allowed; }
`;
function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
  ...rest
}) {
  useSwitchCss();
  const cls = ["cc-switch", disabled ? "cc-switch--disabled" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("label", {
    className: cls
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "cc-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cc-switch__thumb"
  })), label ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Card — a panel surface. Hairline border, small radius, subtle
 * shadow. Optional header (title + meta + action) and an `interactive`
 * mode that adds hover lift + accent edge (used for symbol-result rows /
 * memory drawers).
 */

let _injected = false;
function useCardCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-card-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-card-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-card {
  background: var(--surface-card);
  border: var(--border-hair) solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: clip;
}
.cc-card--flat { box-shadow: none; }
.cc-card--interactive {
  cursor: pointer;
  border-left: var(--border-thick) solid transparent;
  transition: var(--transition-control), transform var(--dur-fast) var(--ease-out);
}
.cc-card--interactive:hover {
  border-color: var(--border-strong);
  border-left-color: var(--accent);
  background: var(--surface-hover);
  box-shadow: var(--shadow-md);
}
.cc-card__head {
  display: flex; align-items: baseline; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-hair) solid var(--border-subtle);
}
.cc-card__title {
  font-family: var(--font-mono); font-weight: var(--fw-bold);
  font-size: var(--text-sm); color: var(--text-strong);
  margin: 0;
}
.cc-card__meta { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); }
.cc-card__action { margin-left: auto; }
.cc-card__body { padding: var(--space-4); }
.cc-card__body--tight { padding: var(--space-3); }
`;
function Card({
  children,
  title,
  meta,
  action,
  interactive = false,
  flat = false,
  tight = false,
  className = "",
  bodyClassName = "",
  ...rest
}) {
  useCardCss();
  const cls = ["cc-card", interactive ? "cc-card--interactive" : "", flat ? "cc-card--flat" : "", className].filter(Boolean).join(" ");
  const hasHead = title || meta || action;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), hasHead ? /*#__PURE__*/React.createElement("div", {
    className: "cc-card__head"
  }, title ? /*#__PURE__*/React.createElement("h3", {
    className: "cc-card__title"
  }, title) : null, meta ? /*#__PURE__*/React.createElement("span", {
    className: "cc-card__meta"
  }, meta) : null, action ? /*#__PURE__*/React.createElement("span", {
    className: "cc-card__action"
  }, action) : null) : null, /*#__PURE__*/React.createElement("div", {
    className: ["cc-card__body", tight ? "cc-card__body--tight" : "", bodyClassName].filter(Boolean).join(" ")
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * crabcc Tabs — underline tab bar (the dashboard's panel switcher:
 * activity / agents / memory). Controlled or uncontrolled. The active tab
 * gets a crab-accent underline that animates.
 */

let _injected = false;
function useTabsCss() {
  React.useEffect(() => {
    if (_injected || document.getElementById("cc-tabs-css")) {
      _injected = true;
      return;
    }
    const s = document.createElement("style");
    s.id = "cc-tabs-css";
    s.textContent = CSS;
    document.head.appendChild(s);
    _injected = true;
  }, []);
}
const CSS = `
.cc-tabs { display: flex; align-items: stretch; gap: var(--space-1); border-bottom: var(--border-hair) solid var(--border-subtle); }
.cc-tab {
  position: relative;
  font-family: var(--font-mono); font-size: var(--text-xs);
  font-weight: var(--fw-medium);
  text-transform: uppercase; letter-spacing: var(--tracking-wide);
  color: var(--text-muted);
  background: none; border: 0;
  padding: var(--space-2_5) var(--space-3);
  cursor: pointer;
  display: inline-flex; align-items: center; gap: var(--space-1_5);
  transition: color var(--dur-fast) var(--ease-out);
}
.cc-tab:hover { color: var(--text-body); }
.cc-tab::after {
  content: ""; position: absolute; left: var(--space-2); right: var(--space-2); bottom: -1px;
  height: var(--border-thick); border-radius: var(--radius-pill);
  background: var(--accent); transform: scaleX(0);
  transition: transform var(--dur-fast) var(--ease-out);
}
.cc-tab--active { color: var(--text-accent); }
.cc-tab--active::after { transform: scaleX(1); }
.cc-tab:focus-visible { outline: none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }
.cc-tab__count {
  font-size: var(--text-2xs); color: var(--text-faint);
  background: var(--surface-sunken); border-radius: var(--radius-sm);
  padding: 1px 5px;
}
`;
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  className = "",
  ...rest
}) {
  useTabsCss();
  const [internal, setInternal] = React.useState(defaultValue ?? (tabs[0] && tabs[0].id));
  const active = value !== undefined ? value : internal;
  const select = id => {
    if (value === undefined) setInternal(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["cc-tabs", className].filter(Boolean).join(" "),
    role: "tablist"
  }, rest), tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    role: "tab",
    "aria-selected": active === t.id,
    className: "cc-tab" + (active === t.id ? " cc-tab--active" : ""),
    onClick: () => select(t.id)
  }, t.label, t.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "cc-tab__count"
  }, t.count) : null)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Tabs.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.LiveDot = __ds_scope.LiveDot;

__ds_ns.ShaderBackground = __ds_scope.ShaderBackground;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
