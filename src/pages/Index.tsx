import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PosterPreview, type FrameType, type PosterType } from "@/components/PosterPreview";
import { CameraCapture } from "@/components/CameraCapture";
import { PhotoEditor } from "@/components/PhotoEditor";

import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { Download, Share2, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [userImage, setUserImage] = useState<string>("");
  const [frameType, setFrameType] = useState<FrameType>("circle");
  const [posterType, setPosterType] = useState<PosterType>("poster1");
  const [showCamera, setShowCamera] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [generatedPosterForDisplay, setGeneratedPosterForDisplay] = useState<string>("");

  const { downloadPoster, sharePoster, generatePoster } = usePosterGenerator();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCameraCapture = (imageData: string) => {
    setUserImage(imageData);
    toast({
      title: "Photo Captured!",
      description: "Your photo has been added to the poster.",
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setShowEditor(true);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
    }
  };

  const handleEditorConfirm = (editedImageData: string) => {
    setUserImage(editedImageData);
    setShowEditor(false);
    setSelectedFile(null);
    toast({
      title: "Photo Updated!",
      description: "Your edited photo has been added to the poster.",
    });
  };

  const handleEditorDiscard = () => {
    setShowEditor(false);
    setSelectedFile(null);
  };




  const handleDownload = async () => {
    if (!userImage) {
      toast({
        title: "No Photo",
        description: "Please add your photo first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await downloadPoster(userImage, frameType, "", posterType);
      toast({
        title: "Downloaded!",
        description: "Your poster has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your poster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSocialShare = async (platform: string) => {
    if (!userImage) {
      toast({
        title: "No Photo",
        description: "Please add your photo first.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      // Generate the poster and get the data URL
      const posterDataURL = await generatePoster(userImage, frameType, "", posterType);

      // Convert to blob for sharing
      const response = await fetch(posterDataURL);
      const blob = await response.blob();
      const file = new File([blob], "devfest-poster.png", { type: "image/png" });

      // Share text
      const shareText = "I'm attending DevFest Bhopal 2025! Join me at Central India's biggest developer festival! 🚀";
      const websiteUrl = "https://devfest.bhopal.dev";

      // Try Web Share API first - this is what apps like Paytm use for direct sharing
      if (navigator.share) {
        try {
          const shareData: any = {
            title: "DevFest Bhopal 2025",
            text: `${shareText} ${websiteUrl}`,
          };

          // Always try to include the file - modern browsers and mobile apps support this
          if (navigator.canShare) {
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } else {
            // For older browsers, still try to include files
            shareData.files = [file];
          }

          await navigator.share(shareData);
          toast({
            title: "Shared Successfully!",
            description: "Your poster has been shared directly to your chosen app!",
          });
          return;
        } catch (shareError: any) {
          // If user cancels share, don't show error
          if (shareError.name === 'AbortError') {
            return;
          }
          console.log("Web Share API not fully supported, using platform URLs");
        }
      }

      // For browsers without Web Share API or when it fails, use direct platform URLs
      // This is still better than downloading - it opens the platform directly
      const encodedText = encodeURIComponent(shareText);
      const encodedUrl = encodeURIComponent(websiteUrl);

      // Create a temporary URL for the image that can be accessed
      const imageUrl = URL.createObjectURL(blob);

      let shareUrl = "";
      let platformName = "";
      let useNativeApp = false;

      switch (platform) {
        case 'facebook':
          // Try Facebook app first (mobile), then web
          if (navigator.userAgent.includes('Mobile')) {
            shareUrl = `fb://share?text=${encodedText}&href=${encodedUrl}`;
            useNativeApp = true;
          } else {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          }
          platformName = "Facebook";
          break;
        case 'twitter':
          // Try Twitter app first (mobile), then web
          if (navigator.userAgent.includes('Mobile')) {
            shareUrl = `twitter://post?message=${encodedText}%20${encodedUrl}`;
            useNativeApp = true;
          } else {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          }
          platformName = "Twitter/X";
          break;
        case 'linkedin':
          // LinkedIn mobile app or web
          if (navigator.userAgent.includes('Mobile')) {
            shareUrl = `linkedin://share?text=${encodedText}%20${encodedUrl}`;
            useNativeApp = true;
          } else {
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
          }
          platformName = "LinkedIn";
          break;
        case 'whatsapp':
          // WhatsApp works best with direct app links
          if (navigator.userAgent.includes('Mobile')) {
            shareUrl = `whatsapp://send?text=${encodedText}%20${encodedUrl}`;
            useNativeApp = true;
          } else {
            shareUrl = `https://web.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
          }
          platformName = "WhatsApp";
          break;
        default:
          toast({
            title: "Platform Not Supported",
            description: "This sharing platform is not supported yet.",
            variant: "destructive",
          });
          return;
      }

      if (shareUrl) {
        // Try to open the native app first, fallback to web
        const openShare = () => {
          if (useNativeApp) {
            // Try native app first
            window.location.href = shareUrl;

            // Fallback to web version after a short delay if app doesn't open
            setTimeout(() => {
              const webShareUrl = shareUrl.replace(/^(fb|twitter|linkedin|whatsapp):\/\//, 'https://www.');
              if (webShareUrl !== shareUrl) {
                window.open(webShareUrl.replace('www.twitter', 'twitter').replace('www.whatsapp', 'web.whatsapp'), '_blank');
              }
            }, 1000);
          } else {
            // Open web version directly
            window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
          }
        };

        openShare();

        // Always show the poster for easy manual upload
        setGeneratedPosterForDisplay(posterDataURL);

        toast({
          title: `Opening ${platformName}`,
          description: useNativeApp
            ? "Opening the app for sharing. Your poster is ready below if you need to upload it manually."
            : "Opening the web platform for sharing. Your poster is ready below for manual upload.",
          duration: 5000,
        });
      }

    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share Failed",
        description: "There was an error sharing your poster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-accent/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-foreground">
                  DevFest Bhopal 2025 🎉 - Poster Creator
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create your awesome poster and show the world you're attending! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Left Column - Poster Preview */}
          <div className="space-y-4 lg:space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                {/* Upload Button Enhancement */}
                <div className="flex flex-col items-center mb-6">
                  <span className="text-base font-semibold text-primary mb-2">Upload Your Photo</span>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg border-2 border-blue-500 hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                    Upload Photo
                  </button>
                </div>
                {/* Existing PosterPreview component below */}
                <PosterPreview
                  userImage={userImage}
                  frameType={frameType}
                  posterType={posterType}
                  onFrameTypeChange={setFrameType}
                  onPosterTypeChange={setPosterType}
                  onCameraClick={() => setShowCamera(true)}
                  onUploadClick={handleUploadClick}
                />
              </CardContent>
            </Card>

            {/* Generate Poster Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold font-display mb-4">Generate Your Poster</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button
                      onClick={handleDownload}
                      className="flex items-center justify-center space-x-2 h-11"
                      disabled={!userImage || isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isGenerating ? "Generating..." : "Download Poster"}</span>
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSocialShare('facebook')}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-11 w-11"
                        title="Share on Facebook"
                        disabled={!userImage || isSharing}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </Button>
                      <Button
                        onClick={() => handleSocialShare('twitter')}
                        className="bg-black hover:bg-gray-800 text-white p-2 h-11 w-11"
                        title="Share on X (Twitter)"
                        disabled={!userImage || isSharing}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </Button>
                      <Button
                        onClick={() => handleSocialShare('linkedin')}
                        className="bg-blue-700 hover:bg-blue-800 text-white p-2 h-11 w-11"
                        title="Share on LinkedIn"
                        disabled={!userImage || isSharing}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </Button>
                      <Button
                        onClick={() => handleSocialShare('whatsapp')}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 h-11 w-11"
                        title="Share on WhatsApp"
                        disabled={!userImage || isSharing}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.863 3.488" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  {!userImage && (
                    <p className="text-sm text-muted-foreground text-center">
                      Add your photo to enable poster generation
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Message Editor */}
          <div className="space-y-4 lg:space-y-6">

            {/* Instructions */}
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold font-display text-white mb-3">
                  How to Create Your Poster
                </h3>
                <div className="space-y-2 text-sm text-slate-200">
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold flex-shrink-0">1.</span>
                    <span>Choose your frame shape (square or circle)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold flex-shrink-0">2.</span>
                    <span>Add your photo using camera or upload</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold flex-shrink-0">3.</span>
                    <span>Customize your message or use our suggestions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold flex-shrink-0">4.</span>
                    <span>Generate and share your poster!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Captions Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold font-display mb-4">Share with these captions:</h3>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">General/Instagram</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText("I'm attending DevFest Bhopal 2025! 🚀\n\nJoin me at Central India's biggest developer festival.\nLet's learn, network, and grow together!\n\n#DevFestBhopal #GDGBhopal #GoogleDevs #TechCommunity"); toast({
                            title: "Copied!",
                            description: "Caption copied to clipboard",
                          });
                        }}
                        className="flex items-center space-x-1"
                      >
                        <span>📋</span>
                        <span>Copy</span>
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      I'm attending DevFest Bhopal 2025! 🚀 Join me at Central India's biggest developer festival. Let's learn, network, and grow together! #DevFestBhopal #GDGBhopal #GoogleDevs
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">LinkedIn</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText("Excited to be part of DevFest Bhopal 2025! 🌟\n\nCan't wait for the amazing sessions and networking. See you there!\n\n#DevFest #Bhopal #TechCommunity #GDG");
                          toast({
                            title: "Copied!",
                            description: "LinkedIn caption copied to clipboard",
                          });
                        }}
                        className="flex items-center space-x-1"
                      >
                        <span>📋</span>
                        <span>Copy</span>
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Excited to be part of DevFest Bhopal 2025! 🌟 Can't wait for the amazing sessions and networking. See you there! #DevFest #Bhopal #TechCommunity
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">Twitter/X</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText("Ready for DevFest Bhopal 2025? I am! 💻🤖\n\nCreate your badge and join the hype!\n\n#DevFest2025 #GDG #DevFestBhopal");
                          toast({
                            title: "Copied!",
                            description: "Twitter caption copied to clipboard",
                          });
                        }}
                        className="flex items-center space-x-1"
                      >
                        <span>📋</span>
                        <span>Copy</span>
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Ready for DevFest Bhopal 2025? I am! 💻🤖 Create your badge and join the hype! #DevFest2025 #GDG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Poster for Manual Upload */}
            {generatedPosterForDisplay && (
              <Card className="bg-gradient-to-br from-blue-50 to-red-50 border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Your Poster is Ready!
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Right-click on the image below and select "Save image as..." to download it, then upload it to your social media post.
                    </p>
                    <div className="max-w-md mx-auto">
                      <img
                        src={generatedPosterForDisplay}
                        alt="Generated Poster for Sharing"
                        className="w-full rounded-lg shadow-lg border-2 border-blue-200"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="mt-4 flex gap-2 justify-center">
                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.download = `DevFest-Poster-${Date.now()}.png`;
                          link.href = generatedPosterForDisplay;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          toast({
                            title: "Downloaded!",
                            description: "Your poster has been downloaded successfully.",
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Poster
                      </Button>
                      <Button
                        onClick={() => setGeneratedPosterForDisplay("")}
                        variant="outline"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Photo Editor Modal */}
      {showEditor && selectedFile && (
        <PhotoEditor
          imageFile={selectedFile}
          onConfirm={handleEditorConfirm}
          onDiscard={handleEditorDiscard}
        />
      )}


    </div>
  );
};

export default Index;