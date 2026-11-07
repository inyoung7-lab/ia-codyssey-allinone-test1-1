"use strict";
(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const navLinks = Array.from(document.querySelectorAll("nav [data-slide]"));
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  const status = document.getElementById("copy-status");
  let current = 0;
  const fromHash = () => slides.findIndex(slide => `#${slide.id}` === window.location.hash);
  function show(index, {focus = false, updateHash = true} = {}) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    navLinks.forEach(link => {
      if (link.dataset.slide === slides[current].id) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.getElementById("position").textContent = `${String(current + 1).padStart(2, "0")} / ${slides.length}`;
    document.getElementById("progress-fill").style.width = `${((current + 1) / slides.length) * 100}%`;
    if (updateHash) history.replaceState(null, "", `#${slides[current].id}`);
    if (focus) {
      window.scrollTo({top: 0, behavior: "instant"});
      slides[current].querySelector("h2").focus({preventScroll: true});
      const active = navLinks.find(link => link.dataset.slide === slides[current].id);
      if (active && window.matchMedia("(max-width: 760px)").matches) active.scrollIntoView({block: "nearest", inline: "nearest"});
    }
  }
  document.querySelectorAll("[data-slide]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    const index = slides.findIndex(slide => slide.id === link.dataset.slide);
    if (index >= 0) show(index, {focus: true});
  }));
  previous.addEventListener("click", () => show(current - 1, {focus: true}));
  next.addEventListener("click", () => show(current + 1, {focus: true}));
  document.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest("input, textarea, select, [contenteditable='true'], pre")) return;
    const target = {ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: slides.length - 1}[event.key];
    if (target !== undefined) { event.preventDefault(); show(target, {focus: true}); }
  });
  window.addEventListener("hashchange", () => { const index = fromHash(); if (index >= 0) show(index, {focus: true, updateHash: false}); });
  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return; } catch (_) { /* local-file fallback below */ }
    }
    const field = document.createElement("textarea");
    field.value = text; field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.append(field); field.select();
    const succeeded = document.execCommand("copy"); field.remove();
    if (!succeeded) throw new Error("copy unavailable");
  }
  document.querySelectorAll(".copy-button").forEach(button => button.addEventListener("click", async () => {
    const text = button.closest(".code-block").querySelector("code").textContent;
    try {
      await copy(text); button.textContent = "복사됨"; status.textContent = "코드를 복사했습니다. 자동 실행하지 않습니다.";
    } catch (_) { button.textContent = "직접 선택"; status.textContent = "브라우저가 복사를 허용하지 않습니다. 코드 내용을 직접 선택해 복사해 주세요."; }
    button.focus({preventScroll: true});
    window.setTimeout(() => { button.textContent = "복사"; }, 1800);
  }));
  show(fromHash() >= 0 ? fromHash() : 0, {updateHash: false});
})();
