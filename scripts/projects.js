import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const cards = gsap.utils.toArray(".sticky-cards .project-card");

  if (!cards.length) return;

  const totalCards = cards.length;
  const segmentSize = 1 / totalCards;
  const cardYOffset = 5;
  const cardScaleStep = 0.075;

  cards.forEach((card, index) => {
    gsap.set(card, {
      xPercent: -50,
      yPercent: -50 + index * cardYOffset,
      scale: 1 - index * cardScaleStep,
    });
  });

  ScrollTrigger.create({
    trigger: ".sticky-cards",
    start: "top top",
    end: () => `+=${window.innerHeight * 8}`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      const activeIndex = Math.min(
        Math.floor(progress / segmentSize),
        totalCards - 1,
      );
      const segmentProgress =
        (progress - activeIndex * segmentSize) / segmentSize;

      cards.forEach((card, index) => {
        if (index < activeIndex) {
          gsap.set(card, {
            yPercent: -250,
            rotationX: 35,
          });
        } else if (index === activeIndex) {
          gsap.set(card, {
            yPercent: gsap.utils.interpolate(-50, -200, segmentProgress),
            rotationX: gsap.utils.interpolate(0, 35, segmentProgress),
            scale: 1,
          });
        } else {
          const behindIndex = index - activeIndex;
          const offset = (behindIndex - segmentProgress) * cardYOffset;
          const scale = 1 - (behindIndex - segmentProgress) * cardScaleStep;

          gsap.set(card, {
            yPercent: -50 + offset,
            rotationX: 0,
            scale,
          });
        }
      });
    },
  });
});
