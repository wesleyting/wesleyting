import gsap from "gsap";

const overlay = document.querySelector(".transition-overlay");
const transitionKey = "routeTransition";
let isNavigating = false;

function coverPage() {
  return gsap.fromTo(
    overlay,
    { yPercent: 100 },
    { yPercent: 0, duration: 0.45, ease: "power2.inOut" }
  );
}

function revealPage() {
  return gsap.fromTo(
    overlay,
    { yPercent: 0 },
    {
      yPercent: 100,
      duration: 0.45,
      ease: "power2.inOut",
      onComplete: () => {
        document.documentElement.classList.remove("is-transitioning");
      },
    }
  );
}

function isSamePage(href) {
  if (!href || href === "#" || href === "") return true;
  return new URL(href, window.location.href).pathname === window.location.pathname;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!overlay) return;

  const arrivedViaTransition = sessionStorage.getItem(transitionKey) === "true";
  window.__arrivedViaTransition = arrivedViaTransition;

  if (arrivedViaTransition) {
    sessionStorage.removeItem(transitionKey);
    document.querySelector(".home-intro")?.remove();
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("preloader:complete"));
    });
    revealPage().then(() => gsap.set(overlay, { yPercent: 100 }));
  } else {
    gsap.set(overlay, { yPercent: 100 });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    const target = link.getAttribute("target");

    if (
      !href ||
      target === "_blank" ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    if (isSamePage(href)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (isNavigating) return;
    isNavigating = true;

    const destination = new URL(href, window.location.href);

    sessionStorage.setItem(transitionKey, "true");
    coverPage().then(() => {
      window.location.href = destination.href;
    });
  });
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted || !overlay) return;

  sessionStorage.removeItem(transitionKey);
  document.documentElement.classList.remove("is-transitioning");
  gsap.set(overlay, { yPercent: 100 });
  document.documentElement.style.overflow = "";
});
