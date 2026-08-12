import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { scrambleIn, scrambleOut, scrambleVisible } from "./scramble-text.js";

gsap.registerPlugin(SplitText);

let isMenuOpen = false;
let isAnimating = false;
let scrambleInstances = [];
let lastFocusedElement = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initializeMenuToggleText() {
  const wrapper = document.querySelector(".menu-toggle-btn-wrapper");
  const primary = wrapper?.querySelector(":scope > span");

  if (!wrapper || !primary || wrapper.querySelector(".menu-toggle-text-secondary")) {
    return;
  }

  primary.classList.add("menu-toggle-text-primary");

  const secondary = primary.cloneNode(true);
  secondary.classList.remove("menu-toggle-text-primary");
  secondary.classList.add("menu-toggle-text-secondary");
  secondary.setAttribute("aria-hidden", "true");
  wrapper.appendChild(secondary);
}

// scramble configs
const scrambleConfigs = {
  nav: {
    duration: 0.2,
    charDelay: 50,
    stagger: 25,
    maxIterations: 10,
  },
  footer: {
    duration: 0.1,
    charDelay: 25,
    stagger: 15,
    maxIterations: 5,
  },
};

// utility functions
function cleanupScrambleInstances() {
  scrambleInstances.forEach((instance) => {
    if (instance && instance.wordSplit) {
      instance.wordSplit.revert();
    }
  });
  scrambleInstances = [];
}

function resetAllTextToOriginal() {
  const allLinks = document.querySelectorAll(".nav-item a");
  const footerLinks = document.querySelectorAll(".nav-footer-item a");
  const allLinksArray = [...allLinks, ...footerLinks];

  allLinksArray.forEach((link) => {
    link.style.color = link.dataset.originalColor || "";
    const chars = link.querySelectorAll(".char span");
    if (chars.length > 0) {
      const originalText = link.textContent;
      link.innerHTML = originalText;
    }
  });
}

function addHoverScrambleEffect(link, type = "nav") {
  if (link.closest(".nav-item.active")) return;

  let isAnimating = false;
  let currentSplit = null;
  const config = scrambleConfigs[type];

  link.addEventListener("mouseenter", () => {
    if (isAnimating) return;
    isAnimating = true;

    if (!link.dataset.originalColor) {
      link.dataset.originalColor = getComputedStyle(link).color;
    }

    link.style.color = "#a5a5a5";

    if (currentSplit) {
      currentSplit.wordSplit?.revert();
    }

    currentSplit = scrambleVisible(link, 0, config);

    setTimeout(() => {
      isAnimating = false;
    }, config.duration * 1000 + 50);
  });

  link.addEventListener("mouseleave", () => {
    link.style.color = link.dataset.originalColor || "";
  });
}

function addNavItemHoverEffects() {
  if (reduceMotion) return;

  const isMobile = window.innerWidth < 1000;
  if (isMobile) return;

  const navItems = document.querySelectorAll(".nav-item");
  const footerItems = document.querySelectorAll(".nav-footer-item");

  navItems.forEach((item) => {
    const link = item.querySelector("a");
    if (link) {
      addHoverScrambleEffect(link, "nav");
    }
  });

  footerItems.forEach((footerItem) => {
    const links = footerItem.querySelectorAll("a");
    links.forEach((link) => {
      addHoverScrambleEffect(link, "footer");
    });
  });
}

// menu functions
function openMenu({ focusFirstLink = false } = {}) {
  const navOverlay = document.querySelector(".nav-overlay");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const navItems = document.querySelectorAll(".nav-item");

  isAnimating = true;
  lastFocusedElement = document.activeElement;
  navOverlay.style.pointerEvents = "all";
  navOverlay.inert = false;
  navOverlay.setAttribute("aria-hidden", "false");
  menuToggleBtn.classList.add("menu-open");
  menuToggleBtn.setAttribute("aria-expanded", "true");
  menuToggleBtn.setAttribute("aria-label", "Close menu");
  document.body.classList.add("menu-is-open");

  // disable scrolling
  window.lenis?.stop();

  gsap.to(navOverlay, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    duration: reduceMotion ? 0 : 0.3,
    onComplete: () => {
      isAnimating = false;
      if (focusFirstLink) {
        navOverlay.querySelector(".nav-item a")?.focus({ preventScroll: true });
      }
    },
  });

  cleanupScrambleInstances();
  resetAllTextToOriginal();

  // animate nav items
  navItems.forEach((item, index) => {
    const link = item.querySelector("a");
    if (link) {
      gsap.set(item, { opacity: 1, transform: "translateY(0%)" });
      if (reduceMotion) return;

      const scrambleInstance = scrambleIn(link, index * 0.1, {
        duration: 0.15,
        charDelay: 50,
        stagger: 25,
        maxIterations: 5,
      });
      scrambleInstances.push(scrambleInstance);
    }
  });

  // animate footer items
  const footerItems = document.querySelectorAll(".nav-footer-item");
  let footerLinkIndex = 0;
  footerItems.forEach((footerItem) => {
    const links = footerItem.querySelectorAll("a");
    links.forEach((link) => {
      if (link && !reduceMotion) {
        const scrambleInstance = scrambleIn(
          link,
          navItems.length * 0.1 + footerLinkIndex * 0.1,
          {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          }
        );
        scrambleInstances.push(scrambleInstance);
        footerLinkIndex++;
      }
    });
  });

  addNavItemHoverEffects();
  isMenuOpen = true;
}

function closeMenu({ restoreFocus = true } = {}) {
  const navOverlay = document.querySelector(".nav-overlay");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const navItems = document.querySelectorAll(".nav-item");

  isAnimating = true;
  navOverlay.style.pointerEvents = "none";
  menuToggleBtn.classList.remove("menu-open");
  menuToggleBtn.setAttribute("aria-expanded", "false");
  menuToggleBtn.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-is-open");

  // enable scrolling
  window.lenis?.start();

  // animate nav items out
  navItems.forEach((item, index) => {
    const link = item.querySelector("a");
    if (link && !reduceMotion) {
      scrambleOut(link, index * 0.1);
    }
  });

  // animate footer items out
  const footerItems = document.querySelectorAll(".nav-footer-item");
  let footerLinkIndex = 0;
  footerItems.forEach((footerItem) => {
    const links = footerItem.querySelectorAll("a");
    links.forEach((link) => {
      if (link && !reduceMotion) {
        scrambleOut(link, navItems.length * 0.1 + footerLinkIndex * 0.1);
        footerLinkIndex++;
      }
    });
  });

  gsap.to(navOverlay, {
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    duration: reduceMotion ? 0 : 0.3,
    onComplete: () => {
      gsap.set(navItems, { opacity: 0, transform: "translateY(100%)" });
      navOverlay.setAttribute("aria-hidden", "true");
      navOverlay.inert = true;
      isAnimating = false;
      if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
      }
    },
  });

  isMenuOpen = false;
}

function resetMenuAfterHistoryRestore(event) {
  if (!event.persisted) return;

  const navOverlay = document.querySelector(".nav-overlay");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const navItems = document.querySelectorAll(".nav-item");

  if (!navOverlay || !menuToggleBtn) return;

  gsap.killTweensOf([navOverlay, navItems]);
  cleanupScrambleInstances();
  resetAllTextToOriginal();

  document.body.classList.remove("menu-is-open");
  navOverlay.style.pointerEvents = "none";
  navOverlay.setAttribute("aria-hidden", "true");
  navOverlay.inert = true;
  menuToggleBtn.classList.remove("menu-open");
  menuToggleBtn.setAttribute("aria-expanded", "false");
  menuToggleBtn.setAttribute("aria-label", "Open menu");

  gsap.set(navOverlay, {
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  });
  gsap.set(navItems, { opacity: 0, transform: "translateY(100%)" });

  isMenuOpen = false;
  isAnimating = false;
  lastFocusedElement = null;
  window.lenis?.resize?.();
  window.lenis?.start?.();
}

window.addEventListener("pageshow", resetMenuAfterHistoryRestore);

// main execution - wait for fonts to load
document.fonts.ready.then(() => {
  initializeMenuToggleText();

  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const navOverlay = document.querySelector(".nav-overlay");
  const navItems = document.querySelectorAll(".nav-item");

  if (!menuToggleBtn || !navOverlay) return;

  navOverlay.inert = true;

  menuToggleBtn.addEventListener("click", (event) => {
    if (isAnimating) {
      gsap.killTweensOf([navOverlay, navItems]);
      cleanupScrambleInstances();
      resetAllTextToOriginal();
      isAnimating = false;
    }

    if (!isMenuOpen) {
      openMenu({ focusFirstLink: event.detail === 0 });
    } else {
      closeMenu();
    }
  });

  navOverlay.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    const href = link?.getAttribute("href") || "";

    if (!isMenuOpen || !link) return;

    if (href.startsWith("#") || href.startsWith("mailto:")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!isMenuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [
      menuToggleBtn,
      ...navOverlay.querySelectorAll("a[href]"),
    ].filter((element) => !element.hasAttribute("disabled"));

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
});
