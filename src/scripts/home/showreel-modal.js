import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const previews = document.querySelectorAll(".video-preview[data-cursor-label]");
  const heroVideos = document.querySelectorAll(".hero-video");

  if (!previews.length) return;

  const modal = document.createElement("div");
  modal.className = "showreel-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Project showreel");
  modal.innerHTML = `
    <div class="showreel-modal-dialog">
      <button class="showreel-modal-close" type="button" aria-label="Close showreel">&times;</button>
      <video class="showreel-modal-video" controls playsinline preload="metadata">
        <source src="/home/video.mp4" type="video/mp4" />
      </video>
    </div>
  `;
  document.body.appendChild(modal);

  const dialog = modal.querySelector(".showreel-modal-dialog");
  const video = modal.querySelector(".showreel-modal-video");
  const closeButton = modal.querySelector(".showreel-modal-close");
  let isOpen = false;

  const openModal = () => {
    if (isOpen) return;
    isOpen = true;
    document.body.classList.add("showreel-open");
    window.lenis?.stop();
    heroVideos.forEach((heroVideo) => heroVideo.pause());
    modal.classList.add("is-open");

    gsap.timeline()
      .to(modal, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out",
      })
      .fromTo(
        dialog,
        { scale: 0.97, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.42,
          ease: "power3.out",
        },
        0.05,
      );

    video.play().catch(() => {});
    closeButton.focus({ preventScroll: true });
  };

  const closeModal = () => {
    if (!isOpen) return;
    isOpen = false;
    video.pause();

    gsap.timeline({
      onComplete: () => {
        modal.classList.remove("is-open");
        document.body.classList.remove("showreel-open");
        window.lenis?.start();
        heroVideos.forEach((heroVideo) => heroVideo.play().catch(() => {}));
      },
    })
      .to(dialog, {
        scale: 0.98,
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
      })
      .to(modal, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.out",
      }, 0.05);
  };

  previews.forEach((preview) => {
    preview.setAttribute("role", "button");
    preview.setAttribute("tabindex", "0");
    preview.setAttribute("aria-label", "Watch project showreel");
    preview.addEventListener("click", openModal);
    preview.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal();
      }
    });
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
});
