// hero.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 900) return;

  const videoContainer = document.querySelector(".video-container-desktop");
  const videoTitleElements = document.querySelectorAll(".video-title p");

  if (!videoContainer) return;

  // ✅ DO NOT wire Lenis here:
  // lenis.on("scroll", ScrollTrigger.update);
  // gsap.ticker.add((time) => lenis.raf(time * 1000));
  // gsap.ticker.lagSmoothing(0);

  const breakpoints = [
    { maxWidth: 1000, translateY: -135, movMultiplier: 450 },
    { maxWidth: 1100, translateY: -130, movMultiplier: 500 },
    { maxWidth: 1200, translateY: -125, movMultiplier: 550 },
    { maxWidth: 1300, translateY: -120, movMultiplier: 600 },
  ];

  const getInitialValues = () => {
    const width = window.innerWidth;

    for (const bp of breakpoints) {
      if (width <= bp.maxWidth) {
        return {
          translateY: bp.translateY,
          movementMultiplier: bp.movMultiplier,
        };
      }
    }

    return {
      translateY: -98,
      movementMultiplier: 650,
    };
  };

  const initialValues = getInitialValues();

  const animationState = {
    scrollProgress: 0,
    initialTranslateY: initialValues.translateY,
    currentTranslateY: initialValues.translateY,
    movementMultiplier: initialValues.movementMultiplier,
    scale: 0.25,
    fontSize: 80,
    gap: 2,
    targetMouseX: 0,
    currentMouseX: 0,
  };

  window.addEventListener("resize", () => {
    const newValues = getInitialValues();
    animationState.initialTranslateY = newValues.translateY;
    animationState.movementMultiplier = newValues.movementMultiplier;

    if (animationState.scrollProgress === 0) {
      animationState.currentTranslateY = newValues.translateY;
    }

    ScrollTrigger.refresh();
  });

  let refreshedAfterIntro = false;

  ScrollTrigger.create({
    trigger: ".intro",
    start: "top bottom",
    end: "top 10%",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      animationState.scrollProgress = self.progress;

      animationState.currentTranslateY = gsap.utils.interpolate(
        animationState.initialTranslateY,
        0,
        animationState.scrollProgress
      );

      animationState.scale = gsap.utils.interpolate(
        0.25,
        1,
        animationState.scrollProgress
      );

      animationState.gap = gsap.utils.interpolate(
        2,
        1,
        animationState.scrollProgress
      );

      if (animationState.scrollProgress <= 0.4) {
        const firstPartProgress = animationState.scrollProgress / 0.4;
        animationState.fontSize = gsap.utils.interpolate(
          80,
          40,
          firstPartProgress
        );
      } else {
        const secondPartProgress = (animationState.scrollProgress - 0.4) / 0.6;
        animationState.fontSize = gsap.utils.interpolate(
          40,
          20,
          secondPartProgress
        );
      }

      // ✅ refresh once when intro finishes so pins below measure correctly
      if (!refreshedAfterIntro && self.progress >= 0.999) {
        refreshedAfterIntro = true;
        requestAnimationFrame(() => ScrollTrigger.refresh(true));
      }

      if (refreshedAfterIntro && self.progress < 0.98) {
        refreshedAfterIntro = false;
      }
    },
  });

  document.addEventListener("mousemove", (e) => {
    animationState.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  });

  const animate = () => {
    if (window.innerWidth < 900) return;

    const {
      scale,
      targetMouseX,
      currentMouseX,
      currentTranslateY,
      fontSize,
      gap,
      movementMultiplier,
    } = animationState;

    const scaledMovementMultiplier = (1 - scale) * movementMultiplier;

    const maxHorizontalMovement =
      scale < 0.95 ? targetMouseX * scaledMovementMultiplier : 0;

    animationState.currentMouseX = gsap.utils.interpolate(
      currentMouseX,
      maxHorizontalMovement,
      0.05
    );

    videoContainer.style.transform = `translateY(${currentTranslateY}%) translateX(${animationState.currentMouseX}px) scale(${scale})`;
    videoContainer.style.gap = `${gap}em`;

    videoTitleElements.forEach((el) => {
      el.style.fontSize = `${fontSize}px`;
    });

    requestAnimationFrame(animate);
  };

  animate();
});
