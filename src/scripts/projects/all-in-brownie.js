document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const carousel = document.querySelector("[data-story-carousel]");
  const demoVideos = [...document.querySelectorAll("[data-demo-video]")];
  const pageVideos = [...document.querySelectorAll("video")];
  const visibleDemoVideos = new Set();

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
          const video = slide.querySelector("video");
          const selectButton = slide.querySelector("[data-story-select]");

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
            const isActive = index === activeIndex;
            video.controls = isActive;
            video.tabIndex = isActive ? 0 : -1;
            if (!isActive) video.pause();
          }

          if (selectButton) {
            selectButton.tabIndex = index === activeIndex ? -1 : 0;
          }
        });

        status.textContent = `${formatPosition(activeIndex + 1)} / ${formatPosition(slides.length)}`;
      };

      const showStory = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        render();
      };

      slides.forEach((slide, index) => {
        slide.querySelector("[data-story-select]")?.addEventListener("click", () => {
          showStory(index);
        });
      });

      previousButton.addEventListener("click", () => showStory(activeIndex - 1));
      nextButton.addEventListener("click", () => showStory(activeIndex + 1));

      carousel.addEventListener("keydown", (event) => {
        if (event.target.closest("video")) return;

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

  if (demoVideos.length && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            visibleDemoVideos.add(video);
            if (!document.hidden) video.play().catch(() => {});
          } else {
            visibleDemoVideos.delete(video);
            video.pause();
          }
        });
      },
      { threshold: [0, 0.4, 0.75] },
    );

    demoVideos.forEach((video) => observer.observe(video));
  }

  const pausePageVideos = () => {
    pageVideos.forEach((video) => video.pause());
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pausePageVideos();
      return;
    }

    if (!reduceMotion) {
      visibleDemoVideos.forEach((video) => video.play().catch(() => {}));
    }
  });

  window.addEventListener("pagehide", pausePageVideos);
});
