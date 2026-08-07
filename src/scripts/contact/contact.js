import gsap from "gsap";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function revealContactPage() {
  const titleLines = gsap.utils.toArray(".contact-title-line > span");
  const supportingContent = gsap.utils.toArray("[data-contact-reveal]");

  if (reduceMotion) {
    gsap.set([...titleLines, ...supportingContent], { clearProps: "all" });
    return;
  }

  gsap.set(titleLines, { yPercent: 112, rotate: 1.5 });
  gsap.set(supportingContent, { autoAlpha: 0, y: 18 });

  const delay = window.__arrivedViaTransition ? 0.28 : 0.12;

  gsap
    .timeline({ delay })
    .to(titleLines, {
      yPercent: 0,
      rotate: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.085,
    })
    .to(
      supportingContent,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger: 0.09,
      },
      "-=0.58",
    );
}

document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(revealContactPage);
});
