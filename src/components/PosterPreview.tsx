import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Square, Circle, Hexagon, Diamond, Octagon } from "lucide-react";

export type FrameType = "circle" | "squircle" | "hexagon" | "badge" | "diamond";
export type PosterType = "poster1" | "poster2" | "poster3" | "poster4";

interface PosterPreviewProps {
  userImage?: string;
  frameType: FrameType;
  posterType: PosterType;
  onFrameTypeChange: (type: FrameType) => void;
  onPosterTypeChange: (type: PosterType) => void;
  onCameraClick: () => void;
  onUploadClick: () => void;
}

export const PosterPreview = ({
  userImage,
  frameType,
  posterType,
  onFrameTypeChange,
  onPosterTypeChange,
  onCameraClick,
  onUploadClick,
}: PosterPreviewProps) => {
  const posterImages = {
    poster1: "/uploads/devfest-poster1.png",
    poster2: "/uploads/devfest-poster2.png",
    poster3: "/uploads/devfest-poster3.png",
    poster4: "/uploads/devfest-poster4.png"
  };
  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      {/* Poster Selection */}
      <div className="flex flex-col items-center space-y-3">
        <span className="text-sm font-medium text-muted-foreground">Choose Poster Template:</span>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`relative cursor-pointer transition-all duration-200 ${posterType === "poster1" ? "ring-2 ring-primary scale-105" : "hover:scale-102"
              }`}
            onClick={() => onPosterTypeChange("poster1")}
          >
            <img
              src={posterImages.poster1}
              alt="Poster Option 1"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-muted"
            />
          </div>
          <div
            className={`relative cursor-pointer transition-all duration-200 ${posterType === "poster2" ? "ring-2 ring-primary scale-105" : "hover:scale-102"
              }`}
            onClick={() => onPosterTypeChange("poster2")}
          >
            <img
              src={posterImages.poster2}
              alt="Poster Option 2"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-muted"
            />
          </div>
          <div
            className={`relative cursor-pointer transition-all duration-200 ${posterType === "poster3" ? "ring-2 ring-primary scale-105" : "hover:scale-102"
              }`}
            onClick={() => onPosterTypeChange("poster3")}
          >
            <img
              src={posterImages.poster3}
              alt="Poster Option 3"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-muted"
            />
          </div>
          <div
            className={`relative cursor-pointer transition-all duration-200 ${posterType === "poster4" ? "ring-2 ring-primary scale-105" : "hover:scale-102"
              }`}
            onClick={() => onPosterTypeChange("poster4")}
          >
            <img
              src={posterImages.poster4}
              alt="Poster Option 4"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-muted"
            />
          </div>
        </div>
      </div>

      {/* Poster Preview */}
      <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-smooth">
        <div className="relative w-72 h-128 sm:w-80 sm:h-144 bg-gradient-to-br from-primary-light to-accent" style={{ aspectRatio: '9/16' }}>
          {/* Background Poster Template */}
          <img
            src={posterImages[posterType]}
            alt="Poster Template"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* User Image Frame - positioned in the middle center of the poster */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className={`relative w-40 h-40 sm:w-48 sm:h-48 border-2 sm:border-4 border-white shadow-lg overflow-hidden poster-frame-${frameType}`}
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto bg-muted-foreground/10 rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Your Photo</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-sm">
        <Button
          onClick={onCameraClick}
          variant="outline"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Take Photo</span>
        </Button>
        <Button
          onClick={onUploadClick}
          variant="outline"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Photo</span>
        </Button>
      </div>
    </div>
  );
};