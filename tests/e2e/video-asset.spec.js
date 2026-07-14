import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const videoPath = resolve("public/home/video.mp4");

function readTopLevelBoxes(file) {
  const boxes = [];
  let offset = 0;

  while (offset + 8 <= file.length) {
    let size = file.readUInt32BE(offset);
    const type = file.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
      size = Number(file.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = file.length - offset;
    }

    boxes.push({ type, offset, size });
    if (size < headerSize) break;
    offset += size;
  }

  return boxes;
}

test("the hero video stays lightweight and progressive-streaming ready", () => {
  const file = readFileSync(videoPath);
  const boxes = readTopLevelBoxes(file);
  const moov = boxes.find((box) => box.type === "moov");
  const mdat = boxes.find((box) => box.type === "mdat");

  expect(statSync(videoPath).size).toBeLessThan(8 * 1024 * 1024);
  expect(moov).toBeTruthy();
  expect(mdat).toBeTruthy();
  expect(moov.offset).toBeLessThan(mdat.offset);
});
