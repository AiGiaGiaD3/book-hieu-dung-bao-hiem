/* =====================================================================
   Hiểu đúng bảo hiểm — xử lý giao diện & tương tác
   Lật trang: StPageFlip (page-flip 2.0.7, MIT) — vendor/page-flip.browser.js
   Nội dung:  content/book-content.js (window.BOOK_CONTENT)
   ===================================================================== */
(function () {
  "use strict";

  const BOOK = window.BOOK_CONTENT;
  const PageFlip = window.St && window.St.PageFlip;
  const Sound = window.PageSound;
  if (!BOOK || !PageFlip) { console.error("Thiếu nội dung sách hoặc thư viện lật trang."); return; }

  const PAGE_W = 420, PAGE_H = 594;            // tỉ lệ khổ A
  const RATIO = PAGE_W / PAGE_H;
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  const flipTime = () => (reduceMQ.matches ? 320 : 850);

  const $ = (id) => document.getElementById(id);
  const app = $("app"), stage = $("stage");
  let bookEl = $("book");
  const bookTemplate = bookEl.cloneNode(false);   // để dựng lại khi đổi chế độ 1/2 trang
  const edgeL = $("edgeLeft"), edgeR = $("edgeRight"), shadow = $("bookShadow");
  const hint = $("hint"), pager = $("pager"), pageLabel = $("pageLabel"), live = $("live");
  const btnPrev = $("btnPrev"), btnNext = $("btnNext"), btnClose = $("btnClose"), btnSound = $("btnSound");
  const zoom = $("zoom"), zoomVp = $("zoomViewport"), zoomPage = $("zoomPage"), zoomLevel = $("zoomLevel");

  /* ---------------------------------------------------------------
     1. Dựng danh sách trang từ nội dung
     --------------------------------------------------------------- */
  const specs = (function build() {
    const list = [];
    list.push(Object.assign({}, BOOK.cover, { role: "cover", hard: true, label: "Bìa trước" }));
    list.push(Object.assign({}, BOOK.insideFrontCover, { role: "endpaper", hard: true, label: "Bìa trong" }));
    const pages = (BOOK.pages || []).slice();
    if (pages.length % 2) {
      pages.push({ type: "html", html: '<p class="kicker">Ghi chú</p><div class="lines" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>' });
    }
    pages.forEach((p, i) => list.push(Object.assign({}, p, { role: "content", num: i + 1, label: String(i + 1) })));
    list.push(Object.assign({}, BOOK.insideBackCover, { role: "endpaper", hard: true, label: "Bìa trong" }));
    list.push(Object.assign({}, BOOK.backCover, { role: "cover", hard: true, label: "Bìa sau" }));
    return list;
  })();
  const LAST = specs.length - 1;
  const CONTENT_COUNT = specs.filter((s) => s.role === "content").length;

  function renderPg(spec) {
    const pg = document.createElement("div");
    pg.className = "pg pg--" + spec.role + (spec.type === "image" ? " pg--image" : "");
    if (spec.type === "image") {
      const img = new Image();
      img.src = spec.src; img.alt = spec.alt || ""; img.draggable = false; img.decoding = "async";
      pg.appendChild(img);
    } else if (spec.role === "content") {
      const body = document.createElement("div");
      body.className = "pg-body";
      body.innerHTML = spec.html;
      pg.appendChild(body);
    } else {
      pg.innerHTML = spec.html;
    }
    if (spec.role === "content" && spec.type !== "image") {
      const foot = document.createElement("div");
      foot.className = "pg-foot";
      foot.innerHTML = '<span class="pg-stamp">' + (BOOK.meta.disclaimer || "") + '</span><span class="pg-num">' + spec.num + "</span>";
      pg.appendChild(foot);
    }
    return pg;
  }

  function buildPageElements() {
    return specs.map((s, i) => {
      const el = document.createElement("div");
      el.className = "page" + (s.role === "cover" ? " is-cover" : "");
      el.dataset.index = i;
      // Bìa luôn cứng. Mặt trong bìa cứng ở chế độ 2 trang (là mặt sau tấm bìa);
      // ở chế độ 1 trang, nó lật như một tờ giấy lót để thao tác tự nhiên hơn.
      const hard = s.role === "cover" || (s.hard && layout.mode === "landscape");
      el.dataset.density = hard ? "hard" : "soft";
      el.appendChild(renderPg(s));
      const sh = document.createElement("div");
      sh.className = "pg-shade";
      el.appendChild(sh);
      return el;
    });
  }

  /* ---------------------------------------------------------------
     2. Bố cục: 2 trang (máy tính) hoặc 1 trang (điện thoại)
     --------------------------------------------------------------- */
  function computeLayout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const small = vw < 560;
    const padX = small ? 14 : 48, padTop = small ? 62 : 70, padBot = small ? 70 : 82;
    const availW = vw - padX * 2, availH = vh - padTop - padBot;
    const landW = Math.min(availW / 2 - 8, availH * RATIO, 620);
    const portW = Math.min(availW - 14, availH * RATIO, 620);
    const mode = availW >= 560 && landW >= portW * 0.62 ? "landscape" : "portrait";
    const pw = Math.max(120, Math.floor(mode === "landscape" ? landW : portW));
    return { mode, pw, ph: Math.round(pw / RATIO), offsetY: Math.round((padTop - padBot) / 2) };
  }

  let layout = computeLayout();
  let pf = null;
  let idx = 0;
  let state = "read";
  let shiftX = 0;

  function sizeElements() {
    const w = layout.mode === "landscape" ? layout.pw * 2 : layout.pw;
    bookEl.style.width = w + "px";
    stage.style.width = w + "px";
    stage.style.height = layout.ph + "px";
    app.classList.toggle("is-portrait", layout.mode === "portrait");
  }

  function createFlip(startPage) {
    if (pf) {
      // destroy() của thư viện xóa luôn phần tử gốc → dựng lại trên một phần tử mới
      const hadFocus = bookEl.contains(document.activeElement);
      try { pf.getRender().render = function () {}; } catch (e) {}   // dừng vòng vẽ cũ
      try { pf.destroy(); } catch (e) {}
      if (bookEl.parentNode) bookEl.remove();
      bookEl = bookTemplate.cloneNode(false);
      stage.appendChild(bookEl);
      attachBookListeners(bookEl);
      if (hadFocus) bookEl.focus({ preventScroll: true });
    }
    sizeElements();
    pf = new PageFlip(bookEl, {
      width: PAGE_W, height: PAGE_H,
      size: "stretch",
      // Hướng hiển thị do ứng dụng quyết định (computeLayout); thư viện chỉ thực hiện:
      // thư viện chuyển sang 1 trang khi bề rộng khung < 2 × minWidth.
      minWidth: layout.mode === "landscape" ? 1 : Math.ceil(layout.pw / 2) + 1,
      maxWidth: 5000, minHeight: 1, maxHeight: 5000,
      showCover: true,
      usePortrait: true,
      autoSize: true,
      drawShadow: true,
      maxShadowOpacity: 0.55,
      flippingTime: flipTime(),
      startPage: startPage || 0,
      mobileScrollSupport: false,
      showPageCorners: true,
      disableFlipByClick: true,   // bấm giữa trang = phóng lớn; bấm góc = lật
      swipeDistance: 30,
      clickEventForward: true,
      useMouseEvents: true
    });
    pf.loadFromHTML(buildPageElements());
    tuneFlipController();
    pf.on("flip", (e) => { idx = e.data; onPageChanged(); });
    pf.on("changeState", (e) => onState(e.data));
    idx = pf.getCurrentPageIndex();
    state = "read";
    applyShift(shiftFor(idx), false);
    updateEdges(idx);
    updateUI();
  }

  /* Hai điều chỉnh nhỏ cho bộ điều khiển lật của StPageFlip 2.0.7:
     (1) fold: điểm bắt đầu kéo luôn là chỗ người dùng chạm xuống (thư viện gốc lấy vị trí
         hiện tại khi cảm ứng giữ > 250ms, có thể đoán sai hướng / sai góc trên-dưới).
     (2) stopMove: ngưỡng hoàn tất hợp lý hơn. Thư viện gốc đòi góc trang vượt qua gáy —
         ở chế độ 1 trang nghĩa là phải kéo gần hết bề rộng trang. */
  function tuneFlipController() {
    const fc = pf.getFlipController && pf.getFlipController();
    if (!fc || typeof fc.start !== "function" || typeof fc.animateFlippingTo !== "function") return;
    fc.fold = function (globalPos) {
      this.setState("user_fold");
      if (this.calc === null) this.start(pf.mousePosition || globalPos);
      if (this.calc !== null) this.do(this.render.convertToPage(globalPos));
    };
    fc.stopMove = function () {
      if (this.calc === null) return;
      const pos = this.calc.getPosition();
      const rect = this.getBoundsRect();
      const y = this.calc.getCorner() === "bottom" ? rect.height : 0;
      // pos.x: vị trí góc trang tính từ gáy (pageWidth = mép ngoài, âm = đã sang trang kia)
      const threshold = rect.pageWidth * (layout.mode === "portrait" ? 0.5 : 0.35);
      if (pos.x <= threshold) this.animateFlippingTo(pos, { x: -rect.pageWidth, y }, true);
      else this.animateFlippingTo(pos, { x: rect.pageWidth, y }, false);
    };
  }

  /* Khi sách đóng (bìa trước/bìa sau) ở chế độ 2 trang, dịch cả cuốn để bìa nằm giữa màn hình */
  function shiftFor(i) {
    if (layout.mode !== "landscape") return 0;
    if (i === 0) return -layout.pw / 2;
    if (i === LAST) return layout.pw / 2;
    return 0;
  }
  function applyShift(x, animate = true) {
    shiftX = x;
    if (!animate) stage.style.transition = "none";
    stage.style.transform = "translate(" + x + "px," + layout.offsetY + "px)";
    if (!animate) { void stage.offsetWidth; stage.style.transition = ""; }
  }

  /* Mép giấy: độ dày hai bên thay đổi theo tiến độ đọc */
  function updateEdges(i) {
    const pw = layout.pw, ph = layout.ph;
    let visL = 0, visR = pw;
    if (layout.mode === "landscape") {
      if (i === 0) { visL = pw; visR = pw * 2; }
      else if (i === LAST) { visL = 0; visR = pw; }
      else { visL = 0; visR = pw * 2; }
    }
    const T = Math.max(3, Math.min(14, pw * 0.03));
    const p = i / LAST;
    const lt = i === 0 ? 0 : Math.max(1.5, T * p);
    const rt = i === LAST ? 0 : Math.max(1.5, T * (1 - p));
    Object.assign(edgeR.style, { left: visR - 1 + "px", top: "2px", width: rt + "px", height: ph - 3 + "px", opacity: rt ? 1 : 0 });
    Object.assign(edgeL.style, { left: visL - lt + 1 + "px", top: "2px", width: lt + "px", height: ph - 3 + "px", opacity: lt ? 1 : 0 });
    Object.assign(shadow.style, { left: visL - lt + "px", top: "0px", width: visR - visL + lt + rt + "px", height: ph + "px" });
  }

  /* ---------------------------------------------------------------
     3. Trạng thái lật & âm thanh
     --------------------------------------------------------------- */
  let gesture = null;

  function isHardFlip() { return idx <= 1 || idx >= LAST - 1; }

  function onState(s) {
    const before = state;
    state = s;
    app.classList.toggle("is-flipping", s === "flipping");
    if (gesture && (s === "user_fold" || s === "flipping")) gesture.folded = true;
    if (s === "user_fold" && before !== "user_fold") Sound.play("lift");
    if (s === "flipping") Sound.play(isHardFlip() ? "hard" : "flip");
    if (s === "read") {
      // Sau khi trang trở về (kéo chưa đủ) hoặc lật xong: đồng bộ vị trí
      applyShift(shiftFor(idx));
      updateEdges(idx);
      updateUI();
    }
  }

  function onPageChanged() {
    applyShift(shiftFor(idx));
    updateEdges(idx);
    updateUI();
    live.textContent = labelFor(idx);
  }

  const busy = () => !pf || state === "flipping" || state === "user_fold";

  function visibleIndexes(i) {
    if (layout.mode === "portrait" || i === 0 || i === LAST) return [i];
    return [i, i + 1];
  }
  function labelFor(i) {
    const vis = visibleIndexes(i);
    const nums = vis.map((k) => specs[k]).filter((s) => s.role === "content").map((s) => s.num);
    if (nums.length === 2) return "Trang " + nums[0] + "–" + nums[1] + " / " + CONTENT_COUNT;
    if (nums.length === 1) return "Trang " + nums[0] + " / " + CONTENT_COUNT;
    return specs[vis[0]].label;
  }

  let introShown = false, hintTimer = 0;
  function updateUI() {
    const closed = idx === 0, end = idx === LAST;
    app.dataset.state = closed ? "closed" : end ? "end" : "open";
    pager.hidden = closed;
    btnClose.hidden = closed;
    btnPrev.disabled = closed;
    btnNext.disabled = end;
    pageLabel.textContent = labelFor(idx);
    clearTimeout(hintTimer);
    if (closed) {
      hint.textContent = "Chạm vào bìa để mở sách";
      hint.classList.remove("is-faded");
    } else if (!introShown) {
      introShown = true;
      hint.textContent = "Kéo góc trang để lật · Bấm vào trang để phóng lớn";
      hint.classList.remove("is-faded");
      hint.style.bottom = "72px";
      hintTimer = setTimeout(() => hint.classList.add("is-faded"), 3800);
    } else {
      hint.classList.add("is-faded");
    }
    if (closed) hint.style.bottom = "";
  }

  /* ---------------------------------------------------------------
     4. Điều hướng
     --------------------------------------------------------------- */
  function targetNext(i) {
    if (layout.mode === "portrait") return Math.min(LAST, i + 1);
    if (i === 0) return 1;
    return Math.min(LAST, i + 2);
  }
  function targetPrev(i) {
    if (layout.mode === "portrait") return Math.max(0, i - 1);
    if (i === LAST) return LAST - 2;
    return Math.max(0, i - 2);
  }

  function navNext() {
    if (busy() || idx >= LAST) return;
    applyShift(shiftFor(targetNext(idx)));
    pf.flipNext("bottom");
  }
  function navPrev() {
    if (busy() || idx <= 0) return;
    applyShift(shiftFor(targetPrev(idx)));
    pf.flipPrev("bottom");
  }
  function openBook() { if (idx === 0) navNext(); }
  function closeBook() {
    if (busy() || idx === 0) return;
    applyShift(shiftFor(0));
    if (idx === 1 || (layout.mode === "portrait" && idx <= 1)) pf.flipPrev("top");
    else pf.flip(0, "top");
  }

  btnNext.addEventListener("click", navNext);
  btnPrev.addEventListener("click", navPrev);
  btnClose.addEventListener("click", closeBook);

  /* ---------------------------------------------------------------
     5. Phân biệt BẤM (phóng lớn / mở bìa) với KÉO (lật trang)
     --------------------------------------------------------------- */
  function attachBookListeners(el) {
    el.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      Sound.unlock();
      gesture = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, idx, folded: false, type: e.pointerType };
    }, true);
  }
  attachBookListeners(bookEl);

  window.addEventListener("pointercancel", () => { gesture = null; }, true);
  window.addEventListener("pointerup", (e) => {
    const g = gesture;
    if (!g || e.pointerId !== g.id) return;
    gesture = null;
    const dist = Math.hypot(e.clientX - g.x, e.clientY - g.y);
    const dt = performance.now() - g.t;
    if (g.folded || dist > 8 || dt > 650) return;          // đó là thao tác kéo, không phải bấm
    const x = e.clientX, y = e.clientY;
    // Chờ thư viện xử lý xong cú bấm vào góc (nếu có), rồi mới quyết định
    setTimeout(() => {
      if (state === "flipping" || state === "user_fold" || idx !== g.idx || zoomOpen) return;
      handleTap(x, y);
    }, 40);
  }, true);

  function hitTest(x, y) {
    const el = document.elementFromPoint(x, y);
    const pageEl = el && el.closest ? el.closest(".page") : null;
    if (!pageEl || !bookEl.contains(pageEl)) return null;
    const r = pageEl.getBoundingClientRect();
    const od = Math.hypot(r.width, r.height) / 5;           // cùng bán kính "góc" với thư viện
    const nearY = y - r.top < od || r.bottom - y < od;
    let side;
    if (layout.mode === "portrait") side = x < r.left + r.width / 2 ? "left" : "right";
    else side = pageEl.classList.contains("--left") ? "left" : "right";
    const nearX = side === "left" ? x - r.left < od : r.right - x < od;
    return { index: +pageEl.dataset.index, side, corner: nearX && nearY };
  }

  function handleTap(x, y) {
    const hit = hitTest(x, y);
    if (!hit) return;
    if (idx === 0) { openBook(); return; }                 // bấm bìa → mở sách
    if (idx === LAST) { navPrev(); return; }               // bấm bìa sau → mở lại trang cuối
    if (hit.corner) { hit.side === "right" ? navNext() : navPrev(); return; }
    openZoom(hit.index);
  }

  /* ---------------------------------------------------------------
     6. Phóng lớn
     --------------------------------------------------------------- */
  let zoomOpen = false;
  const Z = { scale: 1, x: 0, y: 0, bw: 0, bh: 0 };
  const ZMIN = 1, ZMAX = 4;
  let lastFocus = null;

  function openZoom(i) {
    zoomPage.innerHTML = "";
    zoomPage.appendChild(renderPg(specs[i]));
    zoom.hidden = false;
    zoomOpen = true;
    lastFocus = document.activeElement;
    fitZoom();
    $("zoomClose").focus({ preventScroll: true });
    live.textContent = "Đang phóng lớn " + (specs[i].role === "content" ? "trang " + specs[i].num : specs[i].label.toLowerCase());
  }
  function closeZoom() {
    if (!zoomOpen) return;
    zoom.hidden = true;
    zoomOpen = false;
    zoomPage.innerHTML = "";
    pointers.clear();
    (lastFocus && document.contains(lastFocus) ? lastFocus : bookEl).focus({ preventScroll: true });
  }
  function zoomArea() { return { w: window.innerWidth, h: window.innerHeight - 76 }; }
  function fitZoom() {
    const a = zoomArea();
    Z.bw = Math.min(a.w - 32, (a.h - 24) * RATIO, 900);
    Z.bh = Z.bw / RATIO;
    Z.scale = 1;
    Z.x = (a.w - Z.bw) / 2; Z.y = (a.h - Z.bh) / 2 + 4;
    layoutZoom();
  }
  function clampZoom() {
    const a = zoomArea();
    const w = Z.bw * Z.scale, h = Z.bh * Z.scale, m = 16;
    Z.x = w <= a.w - 2 * m ? (a.w - w) / 2 : Math.min(m, Math.max(a.w - w - m, Z.x));
    Z.y = h <= a.h - 2 * m ? (a.h - h) / 2 + 4 : Math.min(m, Math.max(a.h - h - m, Z.y));
  }
  function layoutZoom() {
    clampZoom();
    // Đổi kích thước thật (không scale ảnh) để chữ được vẽ lại sắc nét
    zoomPage.style.width = Z.bw * Z.scale + "px";
    zoomPage.style.height = Z.bh * Z.scale + "px";
    zoomPage.style.transform = "translate(" + Z.x + "px," + Z.y + "px)";
    zoomLevel.textContent = Math.round(Z.scale * 100) + "%";
    $("zoomOut").disabled = Z.scale <= ZMIN + 0.001;
    $("zoomIn").disabled = Z.scale >= ZMAX - 0.001;
  }
  function zoomTo(s, cx, cy) {
    const a = zoomArea();
    if (cx == null) { cx = a.w / 2; cy = a.h / 2; }
    s = Math.max(ZMIN, Math.min(ZMAX, s));
    const k = s / Z.scale;
    Z.x = cx - (cx - Z.x) * k;
    Z.y = cy - (cy - Z.y) * k;
    Z.scale = s;
    layoutZoom();
  }

  $("zoomIn").addEventListener("click", () => zoomTo(Z.scale * 1.4));
  $("zoomOut").addEventListener("click", () => zoomTo(Z.scale / 1.4));
  zoomLevel.addEventListener("click", fitZoom);
  $("zoomClose").addEventListener("click", closeZoom);

  zoomVp.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomTo(Z.scale * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX, e.clientY);
  }, { passive: false });

  // Kéo để di chuyển, chụm hai ngón để phóng, chạm đúp để phóng nhanh
  const pointers = new Map();
  let pan = null, pinch = null, lastTap = 0;
  zoomVp.addEventListener("pointerdown", (e) => {
    zoomVp.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      pan = { x: e.clientX, y: e.clientY, ox: Z.x, oy: Z.y, moved: false, onPage: zoomPage.contains(e.target) };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: Z.scale };
      pan = null;
    }
  });
  zoomVp.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTo(pinch.s * (d / pinch.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (pan) {
      const dx = e.clientX - pan.x, dy = e.clientY - pan.y;
      if (Math.hypot(dx, dy) > 4) { pan.moved = true; zoomVp.classList.add("is-panning"); }
      Z.x = pan.ox + dx; Z.y = pan.oy + dy;
      layoutZoom();
    }
  });
  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    zoomVp.classList.remove("is-panning");
    if (pinch && pointers.size < 2) { pinch = null; pan = null; return; }
    if (pan && !pan.moved && e.type === "pointerup") {
      const now = performance.now();
      if (pan.onPage) {
        if (now - lastTap < 320) { zoomTo(Z.scale > 1.05 ? 1 : 2.2, e.clientX, e.clientY); lastTap = 0; }
        else lastTap = now;
      } else {
        closeZoom();                                         // bấm ra ngoài trang để đóng
      }
    }
    pan = null;
  }
  zoomVp.addEventListener("pointerup", endPointer);
  zoomVp.addEventListener("pointercancel", endPointer);

  /* ---------------------------------------------------------------
     7. Bàn phím
     --------------------------------------------------------------- */
  document.addEventListener("keydown", (e) => {
    Sound.unlock();
    if (zoomOpen) {
      const a = zoomArea();
      switch (e.key) {
        case "Escape": closeZoom(); break;
        case "+": case "=": zoomTo(Z.scale * 1.4); break;
        case "-": case "_": zoomTo(Z.scale / 1.4); break;
        case "0": fitZoom(); break;
        case "ArrowLeft": Z.x += 60; layoutZoom(); break;
        case "ArrowRight": Z.x -= 60; layoutZoom(); break;
        case "ArrowUp": Z.y += 60; layoutZoom(); break;
        case "ArrowDown": Z.y -= 60; layoutZoom(); break;
        case "Tab": { // giữ tiêu điểm trong hộp thoại
          const f = [...zoom.querySelectorAll("button:not([disabled])")];
          const i = f.indexOf(document.activeElement);
          const n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length;
          f[n].focus(); break;
        }
        default: return;
      }
      void a;
      e.preventDefault();
      return;
    }
    const onButton = document.activeElement && document.activeElement.tagName === "BUTTON";
    switch (e.key) {
      case "ArrowRight": case "PageDown": navNext(); break;
      case "ArrowLeft": case "PageUp": navPrev(); break;
      case "Home": closeBook(); break;
      case "Escape": closeBook(); break;
      case "Enter": case " ":
        if (onButton) return;
        if (idx === 0) openBook();
        else if (idx === LAST) navPrev();
        else openZoom(visibleIndexes(idx)[layout.mode === "landscape" ? 1 : 0]);
        break;
      default: return;
    }
    e.preventDefault();
  });

  /* ---------------------------------------------------------------
     8. Âm thanh: nút bật/tắt (lưu trên thiết bị)
     --------------------------------------------------------------- */
  function syncSoundBtn() {
    const on = Sound.isEnabled();
    btnSound.setAttribute("aria-pressed", String(on));
    btnSound.setAttribute("aria-label", on ? "Tắt âm thanh lật trang" : "Bật âm thanh lật trang");
  }
  btnSound.addEventListener("click", () => {
    Sound.unlock();
    Sound.setEnabled(!Sound.isEnabled());
    syncSoundBtn();
    if (Sound.isEnabled()) Sound.play("lift");
  });
  syncSoundBtn();
  window.addEventListener("pointerdown", () => Sound.unlock(), { once: true, capture: true });

  /* ---------------------------------------------------------------
     9. Thay đổi kích thước màn hình & thiết lập chuyển động
     --------------------------------------------------------------- */
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (zoomOpen) fitZoom();
      const next = computeLayout();
      const modeChanged = next.mode !== layout.mode;
      const sizeChanged = next.pw !== layout.pw || next.offsetY !== layout.offsetY;
      if (!modeChanged && !sizeChanged) return;
      if (busy()) { resizeTimer = setTimeout(() => window.dispatchEvent(new Event("resize")), 400); return; }
      layout = next;
      if (modeChanged || layout.mode === "portrait") createFlip(idx);
      else { sizeElements(); pf.update(); applyShift(shiftFor(idx), false); updateEdges(idx); }
    }, 160);
  });
  reduceMQ.addEventListener && reduceMQ.addEventListener("change", () => { if (pf) pf.getSettings().flippingTime = flipTime(); });

  /* Khởi động */
  createFlip(0);
  document.fonts && document.fonts.ready.then(() => { if (pf) pf.update(); });

  // Cho phép kiểm thử tự động
  window.__book = { get index() { return idx; }, get state() { return state; }, get mode() { return layout.mode; }, get zoomOpen() { return zoomOpen; }, navNext, navPrev, openBook, closeBook, LAST };
})();
