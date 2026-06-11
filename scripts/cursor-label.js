import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const targets = document.querySelectorAll("[data-cursor], [data-cursor-label]");
  if (!targets.length) return;

  const label = document.createElement("div");
  label.className = "cursor-label";
  label.setAttribute("aria-hidden", "true");
  label.innerHTML = `
    <span class="cursor-label-inner">
      <span class="cursor-label-text"></span>
      <span class="cursor-label-arrow">&#10140;</span>
    </span>
  `;
  document.body.appendChild(label);

  const inner = label.querySelector(".cursor-label-inner");
  const text = label.querySelector(".cursor-label-text");
  let isVisible = false;
  let hasPointerPosition = false;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let previousPointerX = 0;
  let previousPointerY = 0;
  let movementX = 0;
  let movementY = 0;
  const offsetX = 24;
  const offsetY = 20;
  const followStrength = 0.085;

  const pageIsBusy = () =>
    document.body.classList.contains("intro-active") ||
    document.body.classList.contains("transition-active") ||
    document.documentElement.dataset.pageTransition === "pending";

  const show = (target, event) => {
    if (pageIsBusy()) return;
    text.textContent = target.dataset.cursor || target.dataset.cursorLabel;
    targetX = event.clientX + offsetX;
    targetY = event.clientY + offsetY;
    currentX = targetX;
    currentY = targetY;
    hasPointerPosition = true;
    isVisible = true;

    const rect = target.getBoundingClientRect();
    const edgeDistances = {
      left: Math.abs(event.clientX - rect.left),
      right: Math.abs(rect.right - event.clientX),
      top: Math.abs(event.clientY - rect.top),
      bottom: Math.abs(rect.bottom - event.clientY),
    };
    const entryEdge = Object.keys(edgeDistances).reduce((closest, edge) =>
      edgeDistances[edge] < edgeDistances[closest] ? edge : closest,
    );

    let entranceX = 0;
    let entranceY = 0;
    const entranceDistance = 26;

    if (Math.abs(movementX) > 2 || Math.abs(movementY) > 2) {
      if (Math.abs(movementX) >= Math.abs(movementY)) {
        entranceX = movementX >= 0 ? -entranceDistance : entranceDistance;
      } else {
        entranceY = movementY >= 0 ? -entranceDistance : entranceDistance;
      }
    } else {
      if (entryEdge === "left") entranceX = -entranceDistance;
      if (entryEdge === "right") entranceX = entranceDistance;
      if (entryEdge === "top") entranceY = -entranceDistance;
      if (entryEdge === "bottom") entranceY = entranceDistance;
    }

    gsap.killTweensOf(inner);
    gsap.fromTo(
      inner,
      { x: entranceX, y: entranceY },
      {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      },
    );
    gsap.to(label, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.38,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const hide = () => {
    isVisible = false;
    gsap.to(label, {
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.2,
      ease: "power2.out",
      overwrite: true,
    });
  };

  document.addEventListener("pointermove", (event) => {
    movementX = event.clientX - previousPointerX;
    movementY = event.clientY - previousPointerY;
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
    targetX = event.clientX + offsetX;
    targetY = event.clientY + offsetY;

    if (!hasPointerPosition) {
      currentX = targetX;
      currentY = targetY;
      hasPointerPosition = true;
    }

    if (isVisible && pageIsBusy()) hide();
  }, { capture: true });

  const followPointer = () => {
    if (hasPointerPosition) {
      currentX += (targetX - currentX) * followStrength;
      currentY += (targetY - currentY) * followStrength;
      gsap.set(label, { x: currentX, y: currentY });
    }

    requestAnimationFrame(followPointer);
  };

  followPointer();

  targets.forEach((target) => {
    target.addEventListener("pointerenter", (event) => show(target, event));
    target.addEventListener("pointerleave", hide);
    target.addEventListener("pointerdown", hide);
  });

  window.addEventListener("blur", hide);
});
