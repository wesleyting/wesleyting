import gsap from "gsap";

const TRANSITION_KEY = "page-transition-pending";
const overlay = document.querySelector(".transition-overlay");
let isNavigating = false;

function resetOverlay() {
  gsap.killTweensOf(overlay);
  gsap.set(overlay, { yPercent: 100 });
}

function coverCurrentPage() {
  const departureCover = document.createElement("div");

  Object.assign(departureCover.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    backgroundColor: "#7134ff",
    pointerEvents: "none",
    willChange: "transform",
  });

  document.body.appendChild(departureCover);
  gsap.set(departureCover, { yPercent: 100, force3D: true });

  return gsap.to(departureCover, {
    yPercent: 0,
    duration: 0.65,
    ease: "power3.inOut",
    force3D: true,
  });
}

function revealDestination() {
  gsap.killTweensOf(overlay);
  gsap.set(overlay, { yPercent: 0 });
  delete document.documentElement.dataset.pageTransition;

  return gsap.to(overlay, {
    yPercent: 100,
    duration: 0.65,
    ease: "power3.inOut",
    onComplete: resetOverlay,
  });
}

function isInternalLink(link) {
  const href = link.getAttribute("href");
  const target = link.getAttribute("target");

  return Boolean(
    href &&
      target !== "_blank" &&
      !href.startsWith("#") &&
      !href.startsWith("http") &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:")
  );
}

function isSamePage(href) {
  return new URL(href, window.location.href).pathname === window.location.pathname;
}

if (overlay) {
  const transition = overlay.closest(".transition");
  document.body.appendChild(transition);

  const arrivedViaTransition =
    sessionStorage.getItem(TRANSITION_KEY) === "true";

  window.__arrivedViaTransition = arrivedViaTransition;

  if (arrivedViaTransition) {
    sessionStorage.removeItem(TRANSITION_KEY);
    document.querySelector(".home-intro")?.remove();
    window.__homepageReady = true;
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("preloader:complete"));
    });
    revealDestination();
  } else {
    resetOverlay();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !isInternalLink(link)) return;

    const href = link.getAttribute("href");

    if (isSamePage(href)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (isNavigating) return;
    isNavigating = true;

    sessionStorage.setItem(TRANSITION_KEY, "true");
    const destination = new URL(href, window.location.href);

    coverCurrentPage().eventCallback("onComplete", () => {
      window.location.href = destination.href;
    });
  });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    isNavigating = false;
    sessionStorage.removeItem(TRANSITION_KEY);
    delete document.documentElement.dataset.pageTransition;
    resetOverlay();
  });
}
