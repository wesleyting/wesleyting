document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const workVideos = [...document.querySelectorAll("[data-duuduu-work-video]")];

  workVideos.forEach((video) => {
    const videoToggle = video.closest(".duuduu-work-media")?.querySelector("[data-duuduu-video-toggle]");
    if (!videoToggle) return;

    const videoIcon = videoToggle.querySelector("[data-video-icon]");
    const videoLabel = videoToggle.querySelector("[data-video-label]");
    const videoName = videoToggle.dataset.videoName ?? "case study video";
    let isInView = false;
    let wasPausedByUser = reduceMotion;

    const updateVideoControl = () => {
      const isPlaying = !video.paused && !video.ended;
      const action = isPlaying ? "Pause" : "Play";

      videoToggle.setAttribute("aria-label", `${action} ${videoName}`);
      if (videoIcon) videoIcon.textContent = isPlaying ? "\u2016" : "\u25b6";
      if (videoLabel) videoLabel.textContent = action;
    };

    const syncVideoPlayback = () => {
      const shouldPlay = isInView && !wasPausedByUser && !document.hidden;

      if (shouldPlay) {
        video.play().catch(updateVideoControl);
      } else {
        video.pause();
      }
    };

    videoToggle.addEventListener("click", () => {
      if (video.paused || video.ended) {
        wasPausedByUser = false;
        video.play().catch(updateVideoControl);
      } else {
        wasPausedByUser = true;
        video.pause();
      }
    });

    video.addEventListener("play", updateVideoControl);
    video.addEventListener("pause", updateVideoControl);
    video.addEventListener("ended", updateVideoControl);
    document.addEventListener("visibilitychange", syncVideoPlayback);

    if (!reduceMotion && "IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        ([entry]) => {
          isInView = entry.isIntersecting;
          syncVideoPlayback();
        },
        { threshold: 0.4 },
      );

      videoObserver.observe(video);
    }

    updateVideoControl();
  });
});
