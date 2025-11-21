import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";

interface PhotoEditorProps {
  imageFile: File;
  onConfirm: (editedImageData: string) => void;
  onDiscard: () => void;
}

export const PhotoEditor = ({ imageFile, onConfirm, onDiscard }: PhotoEditorProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageUrl, setImageUrl] = useState<string>("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasSize = 300; // Fixed canvas size
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Calculate image dimensions
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let drawWidth = canvasSize * scale;
    let drawHeight = canvasSize * scale;
    
    if (imageAspect > 1) {
      drawHeight = drawWidth / imageAspect;
    } else {
      drawWidth = drawHeight * imageAspect;
    }
    
    // Calculate position with bounds
    const maxX = (drawWidth - canvasSize) / 2;
    const maxY = (drawHeight - canvasSize) / 2;
    
    const boundedX = Math.max(-maxX, Math.min(maxX, position.x));
    const boundedY = Math.max(-maxY, Math.min(maxY, position.y));
    
    const drawX = (canvasSize - drawWidth) / 2 + boundedX;
    const drawY = (canvasSize - drawHeight) / 2 + boundedY;
    
    // Draw image
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }, [scale, position]);

  useEffect(() => {
    if (imageRef.current?.complete) {
      drawImage();
    }
  }, [drawImage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    onConfirm(imageData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Edit Photo</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border rounded-lg cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Preview"
                className="hidden"
                onLoad={drawImage}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <ZoomIn className="w-4 h-4" />
                  <span>Zoom</span>
                </label>
                <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Move className="w-4 h-4" />
              <span>Drag the image to reposition</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-4">
            <Button variant="outline" onClick={resetTransform}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onDiscard}>
                Discard
              </Button>
              <Button onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};