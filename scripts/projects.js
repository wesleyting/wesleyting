import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const cards = gsap.utils.toArray(".sticky-cards .project-card");

  if (!cards.length) return;

  const totalCards = cards.length;
  const transitionCount = Math.max(1, totalCards - 1);
  const segmentSize = 1 / transitionCount;
  const cardYOffset = 5;
  const cardScaleStep = 0.075;

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
          yPercent: -250,
          rotationX: 35,
          scale: 1,
        });
      } else if (index === activeIndex) {
        gsap.set(card, {
          xPercent: -50,
          yPercent: gsap.utils.interpolate(-50, -200, segmentProgress),
          rotationX: gsap.utils.interpolate(0, 35, segmentProgress),
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
    scrub: true,
    invalidateOnRefresh: true,
    onRefresh: (self) => renderCards(self.progress),
    onUpdate: ({ progress }) => renderCards(progress),
  });
});
