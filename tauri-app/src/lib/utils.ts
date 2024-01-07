import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeThumb(page: any) {
  // Create a 96x96 canvas
  var canvas = document.createElement("canvas");
  canvas.width = canvas.height = 96;
  var ctx = canvas.getContext("2d");

  // Get page viewport at a regular scale
  var vp = page.getViewport({ scale: 1 });

  // Calculate the scale to fit the page into the canvas
  var scale = Math.min(canvas.width / vp.width, canvas.height / vp.height);

  // Update viewport with the new scale
  var scaledViewport = page.getViewport({ scale: scale });

  // Calculate the position to center the page in the canvas
  var offsetX = (canvas.width - scaledViewport.width) / 2;
  var offsetY = (canvas.height - scaledViewport.height) / 2;

  // Clear the canvas and draw the page
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  return page
    .render({
      canvasContext: ctx,
      viewport: scaledViewport,
      transform: [1, 0, 0, 1, offsetX, offsetY], // Apply the calculated offset
    })
    .promise.then(function () {
      return canvas;
    });
}
