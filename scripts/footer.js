import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector(".site-footer");
  const duplicate = footer?.querySelector(".footer-duplicate");

  if (!footer || !duplicate) return;

  const xTo = gsap.quickTo(duplicate, "--xpercent", {
    duration: 0.4,
    ease: "back.out(1.4)",
  });
  const yTo = gsap.quickTo(duplicate, "--ypercent", {
    duration: 0.4,
    ease: "back.out(1.4)",
  });

  footer.addEventListener("pointermove", (event) => {
    const bounds = footer.getBoundingClientRect();
    const x = gsap.utils.mapRange(bounds.left, bounds.right, 0, 100, event.clientX);
    const y = gsap.utils.mapRange(bounds.top, bounds.bottom, 0, 100, event.clientY);

    xTo(x);
    yTo(y);
  });
});
