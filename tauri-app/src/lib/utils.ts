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

export function makeThumbFromVideo(videoBlob: any) {
  return new Promise((resolve, reject) => {
    // Create a video element
    var video = document.createElement("video");

    // Set the source of the video to the blob
    video.src = URL.createObjectURL(videoBlob);

    // Create a canvas element
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = 96;
    var ctx = canvas.getContext("2d");

    // When the video metadata is loaded
    video.onloadedmetadata = function () {
      // Set video dimensions
      video.width = video.videoWidth;
      video.height = video.videoHeight;

      // Calculate the scale to fit the video frame into the canvas
      var scale = Math.min(
        canvas.width / video.width,
        canvas.height / video.height
      );

      // Set the canvas size based on the video frame and scale
      canvas.width = video.width * scale;
      canvas.height = video.height * scale;

      // When the video is ready to play
      video.onseeked = function () {
        // Draw the video frame onto the canvas
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(
          video,
          0,
          0,
          video.width,
          video.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Resolve the promise with the canvas
        resolve(canvas);

        // Revoke the blob URL to release memory
        URL.revokeObjectURL(video.src);
      };

      // Seek the video to the first frame or any specific frame
      video.currentTime = 1; // Change 0 to desired seconds, if needed
    };

    // Error handling
    video.onerror = function (e) {
      reject("Error loading video: " + e);
    };
  });
}

export function getFileType(
  encodingFormat: string
): "image" | "pdf" | "video" | "other" {
  if (encodingFormat === "application/pdf") return "pdf";
  else if (
    encodingFormat === "image/jpeg" ||
    encodingFormat === "image/png" ||
    encodingFormat === "image/gif" ||
    encodingFormat === "image/webp" ||
    encodingFormat === "image/svg+xml"
  )
    return "image";
  else if (encodingFormat.startsWith("video/")) return "video";
  else return "other";
}
