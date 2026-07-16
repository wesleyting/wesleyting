import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.querySelector(".projects-intro");
  const cards = gsap.utils.toArray(".sticky-cards .project-card");

  if (!cards.length) return;

  cards.forEach((card, index) => {
    const media = card.querySelector(".project-card-media");
    const shots = media
      ? Array.from(media.children).filter((child) =>
          child.classList.contains("project-card-shot"),
        )
      : [];

    if (
      !media ||
      shots.length < 2 ||
      media.dataset.marqueeReady === "true"
    ) {
      return;
    }

    const track = document.createElement("div");
    const group = document.createElement("div");

    track.className = "project-card-marquee";
    group.className = "project-card-marquee-group";

    shots.forEach((shot) => group.append(shot));

    const duplicateGroup = group.cloneNode(true);
    duplicateGroup.classList.add("project-card-marquee-group--duplicate");
    duplicateGroup.setAttribute("aria-hidden", "true");
    duplicateGroup.querySelectorAll("img").forEach((image) => {
      image.alt = "";
    });

    track.style.setProperty(
      "--project-gallery-delay",
      `${index * -5}s`,
    );
    track.append(group, duplicateGroup);
    media.append(track);
    media.dataset.marqueeReady = "true";
  });

  if (intro) {
    gsap.fromTo(
      intro,
      { autoAlpha: 0, y: 36 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: intro,
          start: "top 82%",
          toggleActions: "restart reverse restart reverse",
        },
      },
    );
  }

  const totalCards = cards.length;
  const transitionCount = Math.max(1, totalCards - 1);
  const segmentSize = 1 / transitionCount;
  const isMobile = window.matchMedia("(max-width: 1000px)").matches;
  const cardYOffset = isMobile ? 3.5 : 5;
  const cardScaleStep = isMobile ? 0.055 : 0.075;
  const exitYPercent = isMobile ? -170 : -200;
  const pastYPercent = isMobile ? -215 : -250;
  const exitRotation = isMobile ? 24 : 35;

  const renderCards = (progress) => {
    const activeIndex = Math.min(
      Math.floor(progress / segmentSize),
      totalCards - 1,
    );

    const segmentProgress =
      activeIndex === totalCards - 1
        ? 0
        : (progress - activeIndex * segmentSize) / segmentSize;

    cards.forEach((card, index) => {
      if (index < activeIndex) {
        gsap.set(card, {
          xPercent: -50,
          yPercent: pastYPercent,
          rotationX: exitRotation,
          scale: 1,
        });
      } else if (index === activeIndex) {
        gsap.set(card, {
          xPercent: -50,
          yPercent: gsap.utils.interpolate(-50, exitYPercent, segmentProgress),
          rotationX: gsap.utils.interpolate(0, exitRotation, segmentProgress),
          scale: 1,
        });
      } else {
        const behindIndex = index - activeIndex;
        const offset = (behindIndex - segmentProgress) * cardYOffset;
        const scale = 1 - (behindIndex - segmentProgress) * cardScaleStep;

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50 + offset,
          rotationX: 0,
          scale,
        });
      }
    });
  };

  renderCards(0);

  ScrollTrigger.create({
    trigger: ".sticky-cards",
    start: "top top",
    end: "bottom bottom",
    scrub: isMobile ? 0.35 : true,
    invalidateOnRefresh: true,
    onRefresh: (self) => renderCards(self.progress),
    onUpdate: ({ progress }) => renderCards(progress),
  });
});
