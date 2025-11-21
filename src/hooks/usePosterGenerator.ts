import { useRef } from "react";
import type { FrameType, PosterType } from "@/components/PosterPreview";

export const usePosterGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const posterImages = {
    poster1: "/uploads/devfest-poster1.png",
    poster2: "/uploads/devfest-poster2.png"
  };

  const generatePoster = async (
    userImage: string,
    frameType: FrameType,
    customMessage: string,
    posterType: PosterType = "poster1"
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const posterWidth = 1080;
      const posterHeight = 1920;
      canvas.width = posterWidth;
      canvas.height = posterHeight;

      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";

      templateImg.onload = () => {
        ctx.drawImage(templateImg, 0, 0, posterWidth, posterHeight);

        const userImg = new Image();
        userImg.crossOrigin = "anonymous";

        userImg.onload = () => {
          const frameSize = 620;
          const frameX = (posterWidth - frameSize) / 2;
          const frameY = (posterHeight - frameSize) / 2;

          ctx.save();

          if (frameType === "circle") {
            ctx.beginPath();
            ctx.arc(
              frameX + frameSize / 2,
              frameY + frameSize / 2,
              frameSize / 2,
              0,
              Math.PI * 2
            );
            ctx.clip();
          } else {
            ctx.beginPath();
            ctx.rect(frameX, frameY, frameSize, frameSize);
            ctx.clip();
          }

          ctx.drawImage(userImg, frameX, frameY, frameSize, frameSize);
          ctx.restore();

          const dataURL = canvas.toDataURL("image/png", 1.0);
          resolve(dataURL);
        };

        userImg.onerror = () => reject(new Error("Failed to load user image"));
        userImg.src = userImage;
      };

      templateImg.onerror = () => reject(new Error("Failed to load poster template"));
      templateImg.src = posterImages[posterType];
    });
  };

  const downloadPoster = async (
    userImage: string,
    frameType: FrameType,
    customMessage: string,
    posterType: PosterType = "poster1"
  ) => {
    try {
      const posterDataURL = await generatePoster(userImage, frameType, customMessage, posterType);

      const link = document.createElement("a");
      link.download = `DevFest-Poster-${Date.now()}.png`;
      link.href = posterDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Error generating poster:", error);
      throw error;
    }
  };

  const sharePoster = async (
    userImage: string,
    frameType: FrameType,
    customMessage: string,
    posterType: PosterType = "poster1"
  ) => {
    try {
      const posterDataURL = await generatePoster(userImage, frameType, customMessage, posterType);
      const response = await fetch(posterDataURL);
      const blob = await response.blob();
      const file = new File([blob], "DevFest-Poster.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My DevFest Bhopal Poster",
          text: "Check out my custom DevFest poster!",
          files: [file]
        });
        return true;
      } else if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        return "clipboard";
      } else {
        await downloadPoster(userImage, frameType, customMessage, posterType);
        return "download";
      }
    } catch (error) {
      console.error("Error sharing poster:", error);
      throw error;
    }
  };

  return {
    generatePoster,
    downloadPoster,
    sharePoster
  };
};