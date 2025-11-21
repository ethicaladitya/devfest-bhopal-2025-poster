import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <Card className="w-full max-w-2xl mt-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Camera</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4">
            {capturedImage ? (
              <>
                <Button variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={confirmCapture}>
                  Confirm
                </Button>
              </>
            ) : (
              <>
                {!isStreaming && (
                  <Button onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                )}
                {isStreaming && (
                  <Button onClick={capturePhoto}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};