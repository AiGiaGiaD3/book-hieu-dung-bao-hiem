/* =====================================================================
   Âm thanh lật giấy — tổng hợp bằng Web Audio (không cần file âm thanh)
   • Chỉ khởi tạo sau thao tác đầu tiên của người dùng (chính sách trình duyệt).
   • Giới hạn tần suất + tắt dần âm trước để không phát chồng khi lật nhanh.
   • Lựa chọn bật/tắt được lưu trên thiết bị (localStorage).
   ===================================================================== */
window.PageSound = (function () {
  const KEY = "hdbh.sound";
  let ctx = null, noise = null, master = null;
  let current = null, lastAt = 0;
  let enabled = true;

  try { const v = localStorage.getItem(KEY); if (v !== null) enabled = v === "1"; } catch (e) {}

  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      // 0,6 s nhiễu "hồng" nhẹ — chất liệu cho tiếng sột soạt của giấy
      const len = Math.floor(ctx.sampleRate * 0.6);
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noise.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.96300 * b1 + w * 0.2965164; b2 = 0.57000 * b2 + w * 1.0526913;
        // thêm vài "tiếng lạo xạo" ngắn để giống thớ giấy
        const crackle = Math.random() < 0.004 ? (Math.random() * 2 - 1) * 2.2 : 0;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18 + crackle;
      }
    } catch (e) { ctx = null; return false; }
    return true;
  }

  function stopCurrent(t) {
    if (!current) return;
    try {
      current.gain.gain.cancelScheduledValues(t);
      current.gain.gain.setTargetAtTime(0, t, 0.015);
      current.src.stop(t + 0.08);
    } catch (e) {}
    current = null;
  }

  /**
   * kind: "flip" (lật giấy), "lift" (nhấc góc trang), "hard" (bìa cứng)
   */
  function play(kind = "flip") {
    if (!enabled || !ensure() || ctx.state !== "running") return;
    const now = performance.now();
    if (now - lastAt < 90) return;             // chống phát dồn khi lật nhanh
    lastAt = now;

    const t = ctx.currentTime;
    stopCurrent(t);

    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.25;

    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 380;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t);

    let dur;
    if (kind === "lift") {
      dur = 0.16;
      bp.frequency.setValueAtTime(3200, t); bp.Q.value = 0.8;
      g.gain.linearRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    } else if (kind === "hard") {
      dur = 0.42;
      bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(2200, t + 0.25); bp.Q.value = 0.6;
      g.gain.linearRampToValueAtTime(0.45, t + 0.03);
      g.gain.setTargetAtTime(0.25, t + 0.06, 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      // tiếng "bộp" trầm khi bìa chạm
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(140, t + 0.30); o.frequency.exponentialRampToValueAtTime(60, t + 0.42);
      og.gain.setValueAtTime(0, t); og.gain.setValueAtTime(0.0001, t + 0.30);
      og.gain.exponentialRampToValueAtTime(0.35, t + 0.31); og.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.5);
    } else {
      dur = 0.34 + Math.random() * 0.06;
      const f0 = 1800 + Math.random() * 700;
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.exponentialRampToValueAtTime(f0 * 1.8, t + dur * 0.55);
      bp.frequency.exponentialRampToValueAtTime(f0 * 0.9, t + dur);
      bp.Q.value = 0.7;
      g.gain.linearRampToValueAtTime(0.32, t + 0.035);
      g.gain.linearRampToValueAtTime(0.18, t + 0.10);
      g.gain.linearRampToValueAtTime(0.36, t + dur * 0.6);   // "phạch" khi trang rơi xuống
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    }

    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.15);
    src.stop(t + dur + 0.05);
    current = { src, gain: g };
    src.onended = () => { if (current && current.src === src) current = null; };
  }

  function setEnabled(v) {
    enabled = !!v;
    try { localStorage.setItem(KEY, enabled ? "1" : "0"); } catch (e) {}
    if (!enabled && ctx) stopCurrent(ctx.currentTime);
  }

  return {
    unlock: ensure,                 // gọi trong sự kiện người dùng đầu tiên
    play,
    isEnabled: () => enabled,
    setEnabled
  };
})();
