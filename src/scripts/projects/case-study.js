import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = gsap.utils.toArray("[data-reveal]");
  const revealGroups = gsap.utils.toArray("[data-reveal-group]");

  revealItems.forEach((item) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 26,
      duration: 0.75,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
        once: true,
      },
    });
  });

  revealGroups.forEach((group) => {
    const children = gsap.utils.toArray(group.children);
    if (!children.length) return;

    gsap.from(children, {
      autoAlpha: 0,
      y: 24,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: group,
        start: "top 86%",
        once: true,
      },
    });
  });

  const kpiGrid = document.querySelector(".vegas-kpis");
  const kpiCounters = gsap.utils.toArray(".vegas-kpi-count");

  if (kpiGrid && kpiCounters.length) {
    const renderCounter = (counter, value) => {
      const decimals = Number.parseInt(counter.dataset.countDecimals ?? "0", 10);
      const prefix = counter.dataset.countPrefix ?? "";
      const suffix = counter.dataset.countSuffix ?? "";
      const fixedValue = value.toFixed(decimals);
      const formattedValue = counter.dataset.countTrimZero === "true"
        ? fixedValue.replace(/\.0+$/, "")
        : fixedValue;
      counter.textContent = `${prefix}${formattedValue}${suffix}`;
    };

    if (reduceMotion) {
      kpiCounters.forEach((counter) => {
        renderCounter(counter, Number.parseFloat(counter.dataset.countTo));
      });
    } else {
      const countTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: kpiGrid,
          start: "top 78%",
          once: true,
        },
      });

      kpiCounters.forEach((counter, index) => {
        const target = Number.parseFloat(counter.dataset.countTo);
        const count = { value: 0 };

        renderCounter(counter, 0);
        countTimeline.to(
          count,
          {
            value: target,
            duration: 1.15,
            ease: "power2.out",
            onUpdate: () => renderCounter(counter, count.value),
            onComplete: () => renderCounter(counter, target),
          },
          index * 0.08,
        );
      });
    }
  }

  const contextBreakdown = document.querySelector(".vegas-context-breakdown");
  const contextItems = contextBreakdown
    ? gsap.utils.toArray("article", contextBreakdown)
    : [];

  if (contextBreakdown && contextItems.length) {
    const contextMedia = gsap.matchMedia();

    contextMedia.add("(min-width: 1100.01px)", () => {
      const setActiveItem = (activeItem) => {
        contextItems.forEach((item) => {
          item.classList.toggle("is-active", item === activeItem);
        });
      };

      contextBreakdown.classList.add("has-scroll-focus");
      setActiveItem(contextItems[0]);

      const contextTriggers = contextItems.map((item) =>
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => setActiveItem(item),
          onEnterBack: () => setActiveItem(item),
        }),
      );

      return () => {
        contextTriggers.forEach((trigger) => trigger.kill());
        contextBreakdown.classList.remove("has-scroll-focus");
        contextItems.forEach((item) => item.classList.remove("is-active"));
      };
    });
  }

  const lightboxImages = [
    ...document.querySelectorAll(".case-image-asset img, .commerce-card-media img"),
  ];

  if (lightboxImages.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "project-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <button class="project-lightbox-close" type="button" aria-label="Close image viewer"><span aria-hidden="true">×</span></button>
      <figure class="project-lightbox-frame">
        <img class="project-lightbox-image" alt="" />
        <figcaption class="project-lightbox-caption"></figcaption>
      </figure>
      <div class="project-lightbox-controls" aria-label="Image navigation">
        <button class="project-lightbox-nav project-lightbox-prev" type="button" aria-label="View previous image"><span aria-hidden="true">&larr;</span></button>
        <span class="project-lightbox-count" aria-live="polite"></span>
        <button class="project-lightbox-nav project-lightbox-next" type="button" aria-label="View next image"><span aria-hidden="true">&rarr;</span></button>
      </div>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector(".project-lightbox-image");
    const caption = lightbox.querySelector(".project-lightbox-caption");
    const closeButton = lightbox.querySelector(".project-lightbox-close");
    const previousButton = lightbox.querySelector(".project-lightbox-prev");
    const nextButton = lightbox.querySelector(".project-lightbox-next");
    const imageCount = lightbox.querySelector(".project-lightbox-count");
    let currentIndex = 0;
    let triggerElement = null;

    const renderImage = () => {
      const image = lightboxImages[currentIndex];
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      caption.textContent = image.alt;
      imageCount.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(lightboxImages.length).padStart(2, "0")}`;
    };

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("project-lightbox-open");
      triggerElement?.focus();
    };

    const showImage = (index) => {
      currentIndex = (index + lightboxImages.length) % lightboxImages.length;
      renderImage();
    };

    const openLightbox = (index, trigger) => {
      currentIndex = index;
      triggerElement = trigger;
      renderImage();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("project-lightbox-open");
      closeButton.focus();
    };

    lightboxImages.forEach((image, index) => {
      const trigger = image.closest(".commerce-card") ?? image.closest("figure");
      if (!trigger) return;

      trigger.classList.add("is-lightbox-trigger");
      trigger.tabIndex = 0;
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-label", `Expand image: ${image.alt}`);
      trigger.addEventListener("click", () => openLightbox(index, trigger));
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index, trigger);
        }
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    previousButton.addEventListener("click", () => showImage(currentIndex - 1));
    nextButton.addEventListener("click", () => showImage(currentIndex + 1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.key === "Tab") {
        const controls = [closeButton, previousButton, nextButton];
        const currentControl = controls.indexOf(document.activeElement);
        const nextControl = event.shiftKey
          ? (currentControl - 1 + controls.length) % controls.length
          : (currentControl + 1) % controls.length;

        event.preventDefault();
        controls[nextControl].focus();
      }

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showImage(currentIndex - 1);
      if (event.key === "ArrowRight") showImage(currentIndex + 1);
    });
  }

});
