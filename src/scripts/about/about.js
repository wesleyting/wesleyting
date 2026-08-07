import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(Observer, ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const albumArtwork = import.meta.glob(
  "../../assets/about/albums/*.{avif,jpeg,jpg,png,webp}",
  { eager: true, import: "default" },
);
function formatAlbumSlug(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/^Ok\b/, "OK");
}

function getAlbumArtwork() {
  return Object.entries(albumArtwork)
    .map(([path, source]) => {
      const filename = path.split(/[\\/]/).pop() || "";
      const match = filename.match(/^album-(\d+)-(cover|mockup|padded)-(.+)\.[^.]+$/i);

      if (!match) return null;

      const [, order, type, slug] = match;

      return {
        filename,
        order: Number.parseInt(order, 10),
        type: type.toLowerCase(),
        source,
        title: formatAlbumSlug(slug),
      };
    })
    .filter(Boolean)
    .sort((first, second) => first.order - second.order || first.filename.localeCompare(second.filename));
}

function renderAlbumArtwork(albumSet) {
  const fragment = document.createDocumentFragment();

  getAlbumArtwork().forEach(({ type, source, title }) => {
    const card = document.createElement("figure");
    const image = document.createElement("img");

    card.className = `listening-card listening-card--${type}`;
    image.src = source;
    image.alt = `${title} album artwork`;
    image.loading = "lazy";
    image.decoding = "async";
    card.append(image);
    fragment.append(card);
  });

  albumSet.replaceChildren(fragment);
}

function revealPage() {
  const titleLines = gsap.utils.toArray(".about-title-line > span");
  const heroDetails = gsap.utils.toArray("[data-hero-reveal]");

  if (reduceMotion) {
    gsap.set([...titleLines, ...heroDetails], { clearProps: "all" });
    return;
  }

  gsap.set(titleLines, { yPercent: 112, rotate: 1.5 });
  gsap.set(heroDetails, { autoAlpha: 0, y: 18 });

  const delay = window.__arrivedViaTransition ? 0.28 : 0.12;
  const timeline = gsap.timeline({ delay });

  timeline
    .to(titleLines, {
      yPercent: 0,
      rotate: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.085,
    })
    .to(
      heroDetails,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger: 0.1,
      },
      "-=0.58",
    );
}

function createScrollReveals() {
  if (reduceMotion) return;

  gsap.utils.toArray("[data-reveal]").forEach((item) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 28,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
        once: true,
      },
    });
  });
}

function createAlbumScroller() {
  const section = document.querySelector(".about-listening");
  const viewport = document.querySelector("[data-listening-viewport]");
  const track = document.querySelector("[data-listening-track]");
  const originalSet = document.querySelector("[data-listening-set]");

  if (!section || !viewport || !track || !originalSet) return;

  renderAlbumArtwork(originalSet);
  if (!originalSet.children.length) return;

  if (reduceMotion) {
    viewport.classList.add("is-static");
    return;
  }

  const duplicateSet = originalSet.cloneNode(true);
  duplicateSet.classList.add("listening-set--duplicate");
  duplicateSet.removeAttribute("data-listening-set");
  duplicateSet.setAttribute("aria-hidden", "true");
  duplicateSet.querySelectorAll("img").forEach((image) => {
    image.alt = "";
  });
  track.append(duplicateSet);

  const originalCards = [...originalSet.querySelectorAll(".listening-card")];
  const cards = [...track.querySelectorAll(".listening-card")];
  const tiltValues = originalCards.map(() => (Math.random() - 0.5) * 20);

  let total = 0;
  let isInView = false;
  let wrapPosition = gsap.utils.wrap(-1, 0);

  const wrapValue = (value) => wrapPosition(Number.parseFloat(value));
  const moveTrack = gsap.quickTo(track, "x", {
    duration: 0.5,
    ease: "power3",
    modifiers: {
      x: gsap.utils.unitize(wrapValue),
    },
  });

  const measureLoop = () => {
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const cycleWidth = originalSet.getBoundingClientRect().width + gap;

    if (cycleWidth <= 0) return;

    wrapPosition = gsap.utils.wrap(-cycleWidth, 0);
    total = wrapPosition(total);
    gsap.set(track, { x: total });
  };

  const pressTimeline = gsap.timeline({ paused: true });
  pressTimeline.to(cards, {
    rotate: (index) => tiltValues[index % tiltValues.length],
    xPercent: (index) => tiltValues[index % tiltValues.length],
    yPercent: (index) => tiltValues[index % tiltValues.length],
    scale: 0.95,
    duration: 0.5,
    ease: "back.inOut(3)",
  });

  const finishInteraction = () => {
    viewport.classList.remove("is-dragging");
    pressTimeline.reverse();
  };

  const observer = Observer.create({
    target: track,
    type: "pointer,touch",
    onPress: () => {
      viewport.classList.add("is-dragging");
      pressTimeline.play();
    },
    onDrag: (self) => {
      total += self.deltaX;
      moveTrack(total);
    },
    onRelease: finishInteraction,
    onStop: finishInteraction,
  });

  const visibilityTrigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      isInView = self.isActive;
    },
  });

  const tick = (_time, deltaTime) => {
    const canMove = isInView && !document.hidden;

    if (!canMove) return;

    total -= deltaTime / 10;
    moveTrack(total);
  };

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(measureLoop)
    : null;

  if (resizeObserver) {
    resizeObserver.observe(originalSet);
    resizeObserver.observe(viewport);
  } else {
    window.addEventListener("resize", measureLoop);
  }

  gsap.ticker.add(tick);
  requestAnimationFrame(measureLoop);

  window.addEventListener("pagehide", () => {
    gsap.ticker.remove(tick);
    observer.kill();
    visibilityTrigger.kill();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", measureLoop);
  }, { once: true });
}

document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    revealPage();
    createScrollReveals();
    createAlbumScroller();
    requestAnimationFrame(() => ScrollTrigger.refresh(true));
  });
});
