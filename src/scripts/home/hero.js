import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videoContainer = document.querySelector(".video-container");
  const heroVideo = videoContainer?.querySelector(".hero-video");
  const revealTargets = {
    navItems: document.querySelectorAll(".nav .logo, .nav .menu-toggle-btn"),
    word: document.querySelector(".hero-word"),
    statement: document.querySelector(".hero h2"),
    metaItems: document.querySelectorAll(".hero-copy > p"),
    video: videoContainer?.querySelector(".video-preview"),
    titleItems: videoContainer?.querySelectorAll(".video-title > p") ?? [],
  };

  let hasRevealed = false;
  let videoMayPlay = false;
  let entranceTimeline = null;
  let playbackRecoveryFrame = 0;
  let resizeRecoveryTimer = 0;

  heroVideo?.pause();

  const syncHeroPlayback = ({ restart = false } = {}) => {
    if (!heroVideo) return;

    const shouldPlay =
      videoMayPlay &&
      !reduceMotion &&
      !document.hidden &&
      !document.body.classList.contains("showreel-open");

    cancelAnimationFrame(playbackRecoveryFrame);

    if (!shouldPlay) {
      heroVideo.pause();
      return;
    }

    if (!restart) {
      heroVideo.play().catch(() => {});
      return;
    }

    const resumeTime = heroVideo.currentTime;
    heroVideo.pause();

    playbackRecoveryFrame = requestAnimationFrame(() => {
      const stillShouldPlay =
        videoMayPlay &&
        !document.hidden &&
        !document.body.classList.contains("showreel-open");

      if (!stillShouldPlay) return;

      if (
        Number.isFinite(resumeTime) &&
        heroVideo.readyState >= HTMLMediaElement.HAVE_METADATA
      ) {
        heroVideo.currentTime = resumeTime;
      }

      heroVideo.play().catch(() => {});
    });
  };

  const refreshPageGeometry = () => {
    window.lenis?.resize?.();
    ScrollTrigger.refresh(true);
  };

  const finishEntrance = () => {
    gsap.set(revealTargets.navItems, { autoAlpha: 1, y: 0 });
    gsap.set(revealTargets.word, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      clipPath: "inset(0% 0 0% 0)",
    });
    gsap.set(revealTargets.statement, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
    });
    gsap.set(revealTargets.metaItems, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(revealTargets.video, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      clipPath: "inset(0% 0 0% 0 round 1.5rem)",
    });
    gsap.set(revealTargets.titleItems, { autoAlpha: 1, y: 0 });

    document.body.classList.remove("intro-active");
    const scrollIsLocked =
      document.body.classList.contains("showreel-open") ||
      document.body.classList.contains("menu-is-open");

    if (!scrollIsLocked) {
      window.lenis?.start?.();
    }
    syncHeroPlayback();

    requestAnimationFrame(() => {
      refreshPageGeometry();
      window.dispatchEvent(new Event("homepage:revealed"));
    });
  };

  gsap.set(document.body, {
    "--grain-opacity": 0,
    "--grid-opacity": 0,
  });

  if (!reduceMotion) {
    gsap.set(revealTargets.navItems, { autoAlpha: 0, y: -26 });
    gsap.set(revealTargets.word, {
      autoAlpha: 0,
      y: 24,
      scale: 0.99,
      clipPath: "inset(100% 0 0% 0)",
    });
    gsap.set(revealTargets.statement, {
      autoAlpha: 0,
      y: 26,
      filter: "blur(8px)",
    });
    gsap.set(revealTargets.metaItems, {
      autoAlpha: 0,
      y: 12,
      x: (index) => (index === 0 ? -18 : 18),
    });
    gsap.set(revealTargets.video, {
      autoAlpha: 0,
      y: 28,
      scale: 0.97,
      clipPath: "inset(8% 0 8% 0 round 1.5rem)",
    });
    gsap.set(revealTargets.titleItems, { autoAlpha: 0, y: 12 });
  }

  const revealHomepage = () => {
    if (hasRevealed) return;
    hasRevealed = true;

    if (reduceMotion) {
      gsap.set(document.body, {
        "--grain-opacity": 0.055,
        "--grid-opacity": 0.65,
      });
      finishEntrance();
      return;
    }

    entranceTimeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: finishEntrance,
    });

    entranceTimeline
      .to(
        document.body,
        {
          "--grain-opacity": 0.055,
          "--grid-opacity": 0.65,
          duration: 1,
          ease: "power2.out",
        },
        0,
      )
      .to(
        revealTargets.navItems,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.08,
        },
        0.02,
      )
      .to(
        revealTargets.word,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0 0% 0)",
          duration: 0.9,
          ease: "power4.out",
        },
        0.1,
      )
      .to(
        revealTargets.statement,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.74,
        },
        0.34,
      )
      .to(
        revealTargets.metaItems,
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.58,
          stagger: 0.08,
          ease: "power2.out",
        },
        0.54,
      )
      .call(() => {
        videoMayPlay = true;
        syncHeroPlayback();
      }, null, 0.7)
      .to(
        revealTargets.video,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0 0% 0 round 1.5rem)",
          duration: 0.78,
        },
        0.78,
      )
      .to(
        revealTargets.titleItems,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        },
        0.96,
      );
  };

  const requestHomepageReveal = () => requestAnimationFrame(revealHomepage);

  if (window.__homepageReady || !document.querySelector(".home-intro")) {
    requestHomepageReveal();
  } else {
    window.addEventListener("preloader:complete", requestHomepageReveal, {
      once: true,
    });

    const intro = document.querySelector(".home-intro");
    const introObserver = new MutationObserver(() => {
      if (intro && !document.body.contains(intro)) {
        introObserver.disconnect();
        requestHomepageReveal();
      }
    });

    introObserver.observe(document.body, { childList: true });
  }

  const queueResizeRecovery = () => {
    window.clearTimeout(resizeRecoveryTimer);
    resizeRecoveryTimer = window.setTimeout(() => {
      refreshPageGeometry();
      syncHeroPlayback({ restart: true });
    }, 180);
  };

  window.addEventListener("resize", queueResizeRecovery);
  document.addEventListener("visibilitychange", () => {
    syncHeroPlayback({ restart: !document.hidden });
  });
  window.addEventListener("pageshow", () => {
    syncHeroPlayback({ restart: true });
  });
  window.addEventListener("pagehide", () => {
    window.clearTimeout(resizeRecoveryTimer);
    cancelAnimationFrame(playbackRecoveryFrame);
    heroVideo?.pause();
  });
  window.addEventListener("showreel:statechange", (event) => {
    syncHeroPlayback({ restart: event.detail?.open === false });
  });

  const desktopMotion = gsap.matchMedia();

  desktopMotion.add("(min-width: 900.01px)", () => {
    if (!videoContainer) return undefined;

    const titleElements = videoContainer.querySelectorAll(".video-title p");
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const getResponsiveValues = () => {
      const widthProgress = gsap.utils.clamp(
        0,
        1,
        (window.innerWidth - 900) / 540,
      );
      const widthTranslateY = gsap.utils.interpolate(-132, -98, widthProgress);
      const heightCorrection = gsap.utils.clamp(
        -9,
        16,
        (850 - window.innerHeight) * 0.055,
      );

      return {
        translateY: gsap.utils.clamp(
          -140,
          -88,
          widthTranslateY + heightCorrection,
        ),
        movementMultiplier: gsap.utils.interpolate(450, 650, widthProgress),
      };
    };

    const responsiveValues = getResponsiveValues();
    const state = {
      progress: 0,
      initialTranslateY: responsiveValues.translateY,
      currentTranslateY: responsiveValues.translateY,
      movementMultiplier: responsiveValues.movementMultiplier,
      scale: 0.25,
      fontSize: 80,
      gap: 2,
      pointerX: 0,
      currentX: 0,
    };

    const updateResponsiveValues = () => {
      const nextValues = getResponsiveValues();
      state.initialTranslateY = nextValues.translateY;
      state.movementMultiplier = nextValues.movementMultiplier;
    };

    const updateScrollState = (progress) => {
      state.progress = progress;
      state.currentTranslateY = gsap.utils.interpolate(
        state.initialTranslateY,
        0,
        progress,
      );
      state.scale = gsap.utils.interpolate(0.25, 1, progress);
      state.gap = gsap.utils.interpolate(2, 1, progress);

      if (progress <= 0.4) {
        state.fontSize = gsap.utils.interpolate(80, 40, progress / 0.4);
      } else {
        state.fontSize = gsap.utils.interpolate(
          40,
          20,
          (progress - 0.4) / 0.6,
        );
      }
    };

    const scrollTrigger = ScrollTrigger.create({
      trigger: ".intro",
      start: "top bottom",
      end: "top 10%",
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: updateResponsiveValues,
      onRefresh: (self) => updateScrollState(self.progress),
      onUpdate: (self) => updateScrollState(self.progress),
    });

    updateScrollState(scrollTrigger.progress);

    const handlePointerMove = (event) => {
      state.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    };

    if (precisePointer) {
      document.addEventListener("pointermove", handlePointerMove);
    }

    const renderDesktopMotion = () => {
      const scaledMovement = (1 - state.scale) * state.movementMultiplier;
      const targetX = state.scale < 0.95 ? state.pointerX * scaledMovement : 0;

      state.currentX = gsap.utils.interpolate(state.currentX, targetX, 0.05);

      videoContainer.style.transform =
        `translate3d(${state.currentX}px, ${state.currentTranslateY}%, 0) ` +
        `scale(${state.scale})`;
      videoContainer.style.gap = `${state.gap}em`;
      titleElements.forEach((element) => {
        element.style.fontSize = `${state.fontSize}px`;
      });
    };

    gsap.ticker.add(renderDesktopMotion);

    return () => {
      scrollTrigger.kill();
      gsap.ticker.remove(renderDesktopMotion);
      document.removeEventListener("pointermove", handlePointerMove);
      gsap.set(videoContainer, { clearProps: "transform,gap" });
      gsap.set(titleElements, { clearProps: "fontSize" });
    };
  });
});
