// hero.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const heroVideos = document.querySelectorAll(".hero-video");
  const revealTargets = {
    nav: document.querySelector(".nav"),
    word: document.querySelector(".hero-word"),
    statement: document.querySelector(".hero h2"),
    meta: document.querySelector(".hero-copy"),
    videos: document.querySelectorAll(".video-preview"),
    titles: document.querySelectorAll(".video-title"),
  };

  const playHeroVideos = () => {
    heroVideos.forEach((video) => {
      video.play().catch(() => {});
    });
  };

  gsap.set(document.body, {
    "--grain-opacity": 0,
    "--grid-opacity": 0,
  });
  gsap.set(revealTargets.nav, { autoAlpha: 0, y: -14 });
  gsap.set(revealTargets.word, { autoAlpha: 0, y: 28, scale: 0.985 });
  gsap.set(revealTargets.statement, { autoAlpha: 0, y: 24 });
  gsap.set(revealTargets.meta, { autoAlpha: 0, y: 16 });
  gsap.set(revealTargets.videos, { autoAlpha: 0, scale: 0.985 });
  gsap.set(revealTargets.titles, { autoAlpha: 0, y: 12 });

  let hasRevealed = false;

  const revealHomepage = () => {
    if (hasRevealed) return;
    hasRevealed = true;

    gsap.timeline({
      defaults: { ease: "power3.out" },
    })
      .call(playHeroVideos, null, 0.15)
      .to(document.body, {
        "--grain-opacity": 0.055,
        "--grid-opacity": 0.65,
        duration: 1.1,
        ease: "power2.out",
      }, 0)
      .to(revealTargets.nav, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
      }, 0.08)
      .to(revealTargets.word, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1,
      }, 0.18)
      .to(revealTargets.statement, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
      }, 0.42)
      .to(revealTargets.meta, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
      }, 0.58)
      .to(revealTargets.videos, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.9,
      }, 0.5)
      .to(revealTargets.titles, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
      }, 0.72);
  };

  if (window.__homepageReady || !document.querySelector(".home-intro")) {
    revealHomepage();
  } else {
    window.addEventListener("preloader:complete", revealHomepage, { once: true });
  }

  if (window.innerWidth < 900) return;

  const videoContainer = document.querySelector(".video-container-desktop");
  const videoTitleElements = document.querySelectorAll(".video-title p");

  if (!videoContainer) return;

  // ✅ DO NOT wire Lenis here:
  // lenis.on("scroll", ScrollTrigger.update);
  // gsap.ticker.add((time) => lenis.raf(time * 1000));
  // gsap.ticker.lagSmoothing(0);

  const getInitialValues = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const widthProgress = gsap.utils.clamp(0, 1, (width - 900) / 540);
    const widthTranslateY = gsap.utils.interpolate(-132, -98, widthProgress);

    // Short viewports need the video lower; tall viewports can carry it higher.
    const heightCorrection = gsap.utils.clamp(-9, 16, (850 - height) * 0.055);

    return {
      translateY: gsap.utils.clamp(-140, -88, widthTranslateY + heightCorrection),
      movementMultiplier: gsap.utils.interpolate(450, 650, widthProgress),
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
