import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.querySelector(".home-intro");
  if (!intro) return;

  if (window.__arrivedViaTransition) {
    intro.remove();
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("preloader:complete"));
    });
    return;
  }

  document.body.classList.add("intro-active");

  const logo = intro.querySelector(".home-intro-logo");
  const paths = logo.querySelectorAll("path");

  paths.forEach((path) => {
    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: `${length} ${length}`,
      strokeDashoffset: length + 1,
      strokeLinecap: "butt",
      fill: "transparent",
      opacity: 0,
    });
  });

  gsap.timeline({
    onComplete: () => {
      intro.remove();
      document.body.classList.remove("intro-active");
      window.__homepageReady = true;
      window.dispatchEvent(new Event("preloader:complete"));
    },
  })
    .set(paths, { opacity: 1 }, 0.45)
    .to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "power2.inOut",
      stagger: 0.08,
      delay: 0.45,
    }, 0)
    .set(paths, { strokeLinecap: "round" })
    .to(paths, {
      fill: "#FEFFF8",
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.05,
    })
    .to(intro, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.35,
    });
});
