document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("[data-story-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-story-slide]")];
  const previousButton = carousel.querySelector("[data-story-previous]");
  const nextButton = carousel.querySelector("[data-story-next]");
  const status = carousel.querySelector("[data-story-status]");

  if (!slides.length || !previousButton || !nextButton || !status) return;

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

  const pauseInactiveVideos = () => {
    slides.forEach((slide, index) => {
      slide.querySelectorAll("video").forEach((video) => {
        if (index !== activeIndex) video.pause();
      });
    });

    const activeVideo = slides[activeIndex].querySelector("video[autoplay]");
    activeVideo?.play().catch(() => {});
  };

  const render = () => {
    slides.forEach((slide, index) => {
      const position = getRelativePosition(index);
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
        slide.tabIndex = 0;
      } else if (position === -1) {
        slide.classList.add("is-before");
        slide.removeAttribute("aria-current");
        slide.removeAttribute("aria-hidden");
        slide.tabIndex = 0;
      } else if (position === 1) {
        slide.classList.add("is-after");
        slide.removeAttribute("aria-current");
        slide.removeAttribute("aria-hidden");
        slide.tabIndex = 0;
      } else {
        slide.classList.add(position < 0 ? "is-far-before" : "is-far-after");
        slide.removeAttribute("aria-current");
        slide.setAttribute("aria-hidden", "true");
        slide.tabIndex = -1;
      }
    });

    status.textContent = `${formatPosition(activeIndex + 1)} / ${formatPosition(slides.length)}`;
    pauseInactiveVideos();
  };

  const showStory = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    render();
  };

  slides.forEach((slide, index) => {
    slide.addEventListener("click", () => showStory(index));
  });

  previousButton.addEventListener("click", () => showStory(activeIndex - 1));
  nextButton.addEventListener("click", () => showStory(activeIndex + 1));

  carousel.addEventListener("keydown", (event) => {
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

  render();
});
