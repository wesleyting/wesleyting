document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const carousel = document.querySelector("[data-story-carousel]");
  const autoplayVideos = [...document.querySelectorAll("[data-autoplay-video]")];
  const pageVideos = [...document.querySelectorAll("video")];
  const scrollRegions = [...document.querySelectorAll("[data-scroll-region]")];
  const usesCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  const visibleVideos = new Set();

  const scrollControllers = scrollRegions
    .map((region) => {
      const preview = region.querySelector(".all-in-scroll-preview");
      const toggle = region.querySelector("[data-scroll-preview-toggle]");
      if (!preview || !toggle) return null;

      let activePointerId = null;
      let startY = 0;
      let startScrollTop = 0;
      let touchIsArmed = false;

      const setTouchArmed = (active) => {
        touchIsArmed = active;
        region.classList.toggle("is-touch-armed", active);
        preview.classList.toggle("is-touch-armed", active);
        toggle.setAttribute("aria-pressed", String(active));

        if (active) {
          preview.setAttribute("data-lenis-prevent-touch", "");
        } else {
          preview.removeAttribute("data-lenis-prevent-touch");
        }
      };

      const endDrag = (event) => {
        if (activePointerId === null) return;
        if (event?.pointerId !== undefined && event.pointerId !== activePointerId) return;

        if (preview.hasPointerCapture?.(activePointerId)) {
          preview.releasePointerCapture(activePointerId);
        }

        activePointerId = null;
        preview.classList.remove("is-dragging");
      };

      return {
        region,
        preview,
        toggle,
        get touchIsArmed() {
          return touchIsArmed;
        },
        setTouchArmed,
        beginDrag(event) {
          const isTouch = event.pointerType === "touch";
          if (!event.isPrimary || (isTouch && !touchIsArmed)) return;
          if (!isTouch && event.button !== 0) return;

          activePointerId = event.pointerId;
          startY = event.clientY;
          startScrollTop = preview.scrollTop;
          preview.classList.add("is-dragging");
          preview.focus({ preventScroll: true });
          preview.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        },
        drag(event) {
          if (event.pointerId !== activePointerId) return;
          preview.scrollTop = startScrollTop + startY - event.clientY;
          event.preventDefault();
        },
        endDrag,
      };
    })
    .filter(Boolean);

  scrollControllers.forEach((controller) => {
    const { preview, toggle } = controller;

    toggle.addEventListener("click", () => {
      if (usesCoarsePointer.matches) {
        const nextActive = !controller.touchIsArmed;
        scrollControllers.forEach((otherController) => {
          if (otherController !== controller) otherController.setTouchArmed(false);
        });
        controller.setTouchArmed(nextActive);
      }

      preview.focus({ preventScroll: true });
    });

    preview.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        controller.endDrag();
        controller.setTouchArmed(false);
        toggle.focus({ preventScroll: true });
        return;
      }

      const maxScroll = Math.max(0, preview.scrollHeight - preview.clientHeight);
      let nextScrollTop = preview.scrollTop;

      if (event.key === "ArrowUp") nextScrollTop -= 64;
      if (event.key === "ArrowDown") nextScrollTop += 64;
      if (event.key === "PageUp") nextScrollTop -= preview.clientHeight * 0.85;
      if (event.key === "PageDown") nextScrollTop += preview.clientHeight * 0.85;
      if (event.key === " " && event.shiftKey) nextScrollTop -= preview.clientHeight * 0.85;
      if (event.key === " " && !event.shiftKey) nextScrollTop += preview.clientHeight * 0.85;
      if (event.key === "Home") nextScrollTop = 0;
      if (event.key === "End") nextScrollTop = maxScroll;

      const clampedScrollTop = Math.min(maxScroll, Math.max(0, nextScrollTop));
      if (clampedScrollTop === preview.scrollTop) return;

      event.preventDefault();
      preview.scrollTop = clampedScrollTop;
    });

    preview.addEventListener("pointerdown", controller.beginDrag);
    preview.addEventListener("pointermove", controller.drag);
    preview.addEventListener("pointerup", controller.endDrag);
    preview.addEventListener("pointercancel", controller.endDrag);
    preview.addEventListener("lostpointercapture", controller.endDrag);
    preview.addEventListener("dragstart", (event) => event.preventDefault());
  });

  document.addEventListener("pointerdown", (event) => {
    scrollControllers.forEach(({ region, setTouchArmed }) => {
      if (!region.contains(event.target)) setTouchArmed(false);
    });
  });

  window.addEventListener("blur", () => {
    scrollControllers.forEach((controller) => controller.endDrag());
  });

  const updateSoundControl = (video) => {
    const shell = video.closest("[data-video-shell]");
    const button = shell?.querySelector("[data-video-mute]");
    if (!button) return;

    const soundIsOn = !video.muted && video.volume > 0;
    button.textContent = soundIsOn ? "Mute" : "Sound on";
    button.setAttribute("aria-label", soundIsOn ? "Turn sound off" : "Turn sound on");
    button.setAttribute("aria-pressed", String(soundIsOn));
  };

  const muteVideo = (video) => {
    video.muted = true;
    updateSoundControl(video);
  };

  const muteOtherVideos = (activeVideo) => {
    pageVideos.forEach((video) => {
      if (video !== activeVideo) muteVideo(video);
    });
  };

  const videoCanAutoplay = (video) => {
    if (document.hidden || reduceMotion || !visibleVideos.has(video)) return false;
    const slide = video.closest("[data-story-slide]");
    return !slide || slide.classList.contains("is-active");
  };

  const playEligibleVideo = (video) => {
    if (!videoCanAutoplay(video)) return;
    video.play().catch(() => {});
  };

  autoplayVideos.forEach((video) => {
    video.defaultMuted = true;
    video.muted = true;
    video.controls = false;
    video.tabIndex = 0;
    updateSoundControl(video);

    video.addEventListener("volumechange", () => updateSoundControl(video));
    video.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    const shell = video.closest("[data-video-shell]");
    const muteButton = shell?.querySelector("[data-video-mute]");
    const fullscreenButton = shell?.querySelector("[data-video-fullscreen]");

    muteButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      const turnSoundOn = video.muted || video.volume === 0;

      if (turnSoundOn) {
        muteOtherVideos(video);
        video.muted = false;
        if (video.volume === 0) video.volume = 1;
        video.play().catch(() => {});
      } else {
        video.muted = true;
      }

      updateSoundControl(video);
    });

    fullscreenButton?.addEventListener("click", async (event) => {
      event.stopPropagation();

      try {
        if (document.fullscreenElement === shell) {
          await document.exitFullscreen();
        } else if (shell?.requestFullscreen) {
          await shell.requestFullscreen();
        } else if (typeof video.webkitEnterFullscreen === "function") {
          video.webkitEnterFullscreen();
        }
      } catch {
        // Fullscreen availability varies across browsers and embedded previews.
      }
    });
  });

  if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-story-slide]")];
    const previousButton = carousel.querySelector("[data-story-previous]");
    const nextButton = carousel.querySelector("[data-story-next]");
    const status = carousel.querySelector("[data-story-status]");
    const stage = carousel.querySelector(".all-in-story-stage");

    if (slides.length && previousButton && nextButton && status) {
      let activeIndex = Math.max(
        0,
        slides.findIndex((slide) => slide.getAttribute("aria-current") === "true"),
      );

      const formatPosition = (value) => String(value).padStart(2, "0");

      const getRelativePosition = (index) => {
        let difference = index - activeIndex;
        const halfway = slides.length / 2;

        if (difference > halfway) difference -= slides.length;
        if (difference < -halfway) difference += slides.length;

        return difference;
      };

      const render = () => {
        slides.forEach((slide, index) => {
          const position = getRelativePosition(index);
          const isActive = index === activeIndex;
          const video = slide.querySelector("video");
          const selectButton = slide.querySelector("[data-story-select]");
          const videoButtons = [...slide.querySelectorAll("[data-video-mute], [data-video-fullscreen]")];

          slide.classList.remove(
            "is-far-before",
            "is-before",
            "is-active",
            "is-after",
            "is-far-after",
          );

          if (position === 0) {
            slide.classList.add("is-active");
            slide.setAttribute("aria-current", "true");
            slide.removeAttribute("aria-hidden");
          } else if (position === -1) {
            slide.classList.add("is-before");
            slide.removeAttribute("aria-current");
            slide.removeAttribute("aria-hidden");
          } else if (position === 1) {
            slide.classList.add("is-after");
            slide.removeAttribute("aria-current");
            slide.removeAttribute("aria-hidden");
          } else {
            slide.classList.add(position < 0 ? "is-far-before" : "is-far-after");
            slide.removeAttribute("aria-current");
            slide.setAttribute("aria-hidden", "true");
          }

          if (video) {
            video.tabIndex = isActive ? 0 : -1;
            if (isActive) {
              playEligibleVideo(video);
            } else {
              video.pause();
              muteVideo(video);
            }
          }

          if (selectButton) selectButton.tabIndex = isActive ? -1 : 0;
          videoButtons.forEach((button) => {
            button.tabIndex = isActive ? 0 : -1;
          });
        });

        status.textContent = `${formatPosition(activeIndex + 1)} / ${formatPosition(slides.length)}`;
      };

      const showStory = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        render();
      };

      slides.forEach((slide, index) => {
        const video = slide.querySelector("video");

        slide.querySelector("[data-story-select]")?.addEventListener("click", () => {
          showStory(index);
        });

        slide.addEventListener("mouseenter", () => {
          if (!supportsHover.matches || reduceMotion || slide.classList.contains("is-active") || !video) return;
          muteVideo(video);
          video.play().catch(() => {});
        });

        slide.addEventListener("mouseleave", () => {
          if (!slide.classList.contains("is-active")) video?.pause();
        });
      });

      previousButton.addEventListener("click", () => showStory(activeIndex - 1));
      nextButton.addEventListener("click", () => showStory(activeIndex + 1));

      carousel.addEventListener("keydown", (event) => {
        if (event.target.closest("video, [data-video-mute], [data-video-fullscreen]")) return;

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showStory(activeIndex - 1);
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          showStory(activeIndex + 1);
        }

        if (event.key === "Home") {
          event.preventDefault();
          showStory(0);
        }

        if (event.key === "End") {
          event.preventDefault();
          showStory(slides.length - 1);
        }
      });

      if (stage) {
        let touchStartX = null;
        let touchStartY = null;

        stage.addEventListener(
          "touchstart",
          (event) => {
            if (event.touches.length !== 1) return;
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
          },
          { passive: true },
        );

        stage.addEventListener(
          "touchend",
          (event) => {
            if (touchStartX === null || touchStartY === null || !event.changedTouches.length) return;

            const deltaX = event.changedTouches[0].clientX - touchStartX;
            const deltaY = event.changedTouches[0].clientY - touchStartY;
            touchStartX = null;
            touchStartY = null;

            if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;
            showStory(activeIndex + (deltaX < 0 ? 1 : -1));
          },
          { passive: true },
        );
      }

      render();
    }
  }

  if (autoplayVideos.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            visibleVideos.add(video);
            playEligibleVideo(video);
          } else {
            visibleVideos.delete(video);
            video.pause();
            muteVideo(video);
          }
        });
      },
      { threshold: [0, 0.4, 0.75] },
    );

    autoplayVideos.forEach((video) => observer.observe(video));
  }

  const updateFullscreenControls = () => {
    document.querySelectorAll("[data-video-shell]").forEach((shell) => {
      const button = shell.querySelector("[data-video-fullscreen]");
      if (!button) return;
      const isFullscreen = document.fullscreenElement === shell;
      button.textContent = isFullscreen ? "Exit" : "Expand";
      button.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
    });
  };

  document.addEventListener("fullscreenchange", updateFullscreenControls);

  const pauseAndMutePageVideos = () => {
    pageVideos.forEach((video) => {
      video.pause();
      muteVideo(video);
    });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAndMutePageVideos();
      return;
    }

    visibleVideos.forEach((video) => playEligibleVideo(video));
  });

  window.addEventListener("pagehide", pauseAndMutePageVideos);
});
