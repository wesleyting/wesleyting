import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector(".site-footer");
  const revealer = document.querySelector(".footer-revealer");
  const nav = document.querySelector(".nav");
  const imageWrappers = [...document.querySelectorAll(".footer-image")];

  if (!footer || !revealer) return;

  const splitHeadingChars = () => {
    const headings = document.querySelectorAll(".footer-header .footer-name");
    const chars = [];

    headings.forEach((heading) => {
      const split = new SplitText(heading, {
        type: "chars",
        charsClass: "char",
      });
      chars.push(...split.chars);
    });

    gsap.set(chars, { position: "relative", yPercent: 125 });
    return chars;
  };

  const splitContentLines = () => {
    const elements = footer.querySelectorAll(
      ".footer-links a, .footer-text p, .footer-email",
    );

    return new SplitText(elements, {
      type: "lines",
      mask: "lines",
      linesClass: "line",
      autoSplit: true,
      onSplit: (split) => {
        gsap.set(split.lines, {
          yPercent: document.body.classList.contains("footer-active") ? 0 : 100,
        });
      },
    });
  };

  const headingChars = splitHeadingChars();
  const contentSplit = splitContentLines();
  const getContentLines = () => contentSplit.lines;
  const charStagger = { each: 0.04, from: "center" };

  const reveal = { y: 28, scale: 0.88, opacity: 0 };

  const animateIn = () => {
    document.body.classList.add("footer-active");

    gsap.to(reveal, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      overwrite: true,
    });
    gsap.to(headingChars, {
      yPercent: 0,
      duration: 1,
      ease: "power3.out",
      stagger: charStagger,
      overwrite: true,
    });
    gsap.to(getContentLines(), {
      yPercent: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.08,
      overwrite: true,
    });
  };

  const animateOut = () => {
    document.body.classList.remove("footer-active");

    gsap.to(reveal, {
      y: 28,
      scale: 0.88,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      overwrite: true,
    });
    gsap.to(headingChars, {
      yPercent: 125,
      duration: 0.4,
      ease: "power2.in",
      stagger: { each: 0.01, from: "center" },
      overwrite: true,
    });
    gsap.to(getContentLines(), {
      yPercent: 100,
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.02,
      overwrite: true,
    });
  };

  const ASCII_CHARS = "........:::=+xX#0369";
  const FONT_SIZE = 18;
  const CELL_SIZE = 20;
  const ASCII_COLUMNS = 80;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const CHAR_COLOR = "rgba(245, 245, 245, 0.58)";
  const HOVER_COLOR = "#7134ff";
  const HOVER_CHAR_COLOR = "#0f0f0f";
  const HOVER_RADIUS = 8;
  const CLUSTER_SIZE = 10;
  const HIGHLIGHT_LIFETIME = 300;
  const backgroundCharIndex = ASCII_CHARS.lastIndexOf(".");
  const LOGO_BACKGROUND_THRESHOLD = 0.035;

  const sampleImagePixels = (image, gridRows) => {
    const canvas = document.createElement("canvas");
    canvas.width = ASCII_COLUMNS;
    canvas.height = gridRows;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, ASCII_COLUMNS, gridRows);
    return ctx.getImageData(0, 0, ASCII_COLUMNS, gridRows).data;
  };

  const pixelToCharIndex = (pixels, pixelOffset) => {
    const brightness =
      (pixels[pixelOffset] * 0.299 +
        pixels[pixelOffset + 1] * 0.587 +
        pixels[pixelOffset + 2] * 0.114) /
      255;

    return Math.min(
      ASCII_CHARS.length - 1,
      Math.floor((1 - brightness) * ASCII_CHARS.length),
    );
  };

  const pixelBrightness = (pixels, pixelOffset) =>
    (pixels[pixelOffset] * 0.299 +
      pixels[pixelOffset + 1] * 0.587 +
      pixels[pixelOffset + 2] * 0.114) /
    255;

  const buildCells = (image) => {
    const rows = Math.round(
      ASCII_COLUMNS / (image.naturalWidth / image.naturalHeight),
    );
    const pixels = sampleImagePixels(image, rows);
    const cells = new Map();

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < ASCII_COLUMNS; col += 1) {
        const charIndex = pixelToCharIndex(
          pixels,
          (row * ASCII_COLUMNS + col) * 4,
        );
        const brightness = pixelBrightness(pixels, (row * ASCII_COLUMNS + col) * 4);
        if (brightness <= LOGO_BACKGROUND_THRESHOLD || charIndex <= backgroundCharIndex) {
          continue;
        }

        cells.set(`${col},${row}`, {
          col,
          row,
          char: ASCII_CHARS[charIndex],
          highlightEndTime: 0,
        });
      }
    }

    return { rows, cells };
  };

  const setupAsciiImage = (image) => {
    const { rows, cells } = buildCells(image);
    const cellList = [...cells.values()];
    const wrapper = image.closest(".footer-image");
    const canvas = document.createElement("canvas");
    wrapper.appendChild(canvas);

    canvas.width = ASCII_COLUMNS * CELL_SIZE * DPR;
    canvas.height = rows * CELL_SIZE * DPR;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const metrics = ctx.measureText("X");
    const glyphHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const baselineOffset =
      CELL_SIZE / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

    const canvasWidth = ASCII_COLUMNS * CELL_SIZE;
    const canvasHeight = rows * CELL_SIZE;

    const render = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (const cell of cellList) {
        const x = cell.col * CELL_SIZE;
        const y = cell.row * CELL_SIZE;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.fillStyle = HOVER_COLOR;
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        ctx.fillStyle = isHighlighted ? HOVER_CHAR_COLOR : CHAR_COLOR;
        ctx.fillText(cell.char, x + CELL_SIZE / 2, y + baselineOffset);
      }

      requestAnimationFrame(render);
    };

    render();
    return { canvas, cells, cellList, rows };
  };

  const hands = [];
  document.querySelectorAll(".ascii-footer-image").forEach((image) => {
    const start = () => hands.push(setupAsciiImage(image));
    if (image.complete && image.naturalWidth) start();
    else image.addEventListener("load", start, { once: true });
  });

  const highlightCluster = (cells, startCell) => {
    const now = Date.now();
    startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

    const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
    const litCells = [startCell];
    let current = startCell;

    for (let step = 0; step < steps; step += 1) {
      const neighbours = [];
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const neighbour = cells.get(`${current.col + dx},${current.row + dy}`);
          if (neighbour && !litCells.includes(neighbour)) {
            neighbours.push(neighbour);
          }
        }
      }
      if (!neighbours.length) break;

      const next = neighbours[Math.floor(Math.random() * neighbours.length)];
      next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 10;
      litCells.push(next);
      current = next;
    }
  };

  const hoverAsciiImage = (hand, clientX, clientY) => {
    const rect = hand.canvas.getBoundingClientRect();
    const mouseCol = ((clientX - rect.left) / rect.width) * ASCII_COLUMNS;
    const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

    let closest = null;
    let closestDist = Infinity;

    for (const cell of hand.cellList) {
      const dx = mouseCol - cell.col;
      const dy = mouseRow - cell.row;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = cell;
      }
    }

    if (closest && closestDist <= HOVER_RADIUS) {
      highlightCluster(hand.cells, closest);
    }
  };

  const PARALLAX_STRENGTH = 20;
  const PARALLAX_EASE = 0.05;
  const parallaxScale = 1 + (PARALLAX_STRENGTH * 2) / 200;
  const pointer = { x: 0, y: 0 };
  const drift = { x: 0, y: 0 };

  const setPointerTarget = (clientX, clientY) => {
    const rect = footer.getBoundingClientRect();
    pointer.x =
      ((clientX - rect.left) / rect.width - 0.5) * PARALLAX_STRENGTH * 2;
    pointer.y =
      ((clientY - rect.top) / rect.height - 0.5) * PARALLAX_STRENGTH * 2;
  };

  const renderParallax = () => {
    drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
    drift.y += (pointer.y - drift.y) * PARALLAX_EASE;

    imageWrappers.forEach((wrapper) => {
      const x = drift.x * 0.55;
      const y = -drift.y * 0.55 + reveal.y;
      const scale = parallaxScale * reveal.scale;
      wrapper.style.opacity = reveal.opacity;
      wrapper.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
    });

    requestAnimationFrame(renderParallax);
  };

  renderParallax();

  window.addEventListener("mousemove", (event) => {
    setPointerTarget(event.clientX, event.clientY);
    hands.forEach((hand) => hoverAsciiImage(hand, event.clientX, event.clientY));
  });

  ScrollTrigger.create({
    trigger: revealer,
    start: "top 50%",
    onEnter: animateIn,
  });

  ScrollTrigger.create({
    trigger: revealer,
    start: "top 85%",
    onLeaveBack: animateOut,
  });

  if (nav) {
    ScrollTrigger.create({
      trigger: revealer,
      start: "top 80%",
      onEnter: () => {
        gsap.to(nav, {
          autoAlpha: 0,
          y: -18,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => {
            nav.style.pointerEvents = "none";
          },
        });
      },
      onLeaveBack: () => {
        nav.style.pointerEvents = "";
        gsap.to(nav, {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      },
    });
  }

  window.addEventListener("preloader:complete", () => {
    requestAnimationFrame(() => ScrollTrigger.refresh(true));
  });
});
