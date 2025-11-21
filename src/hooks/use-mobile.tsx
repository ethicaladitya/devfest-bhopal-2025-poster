import { useState, useEffect } from "react";

// Define the pixel width below which the device is considered mobile
const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the current viewport is a mobile screen.
 * @returns {boolean} True if the screen width is less than MOBILE_BREAKPOINT.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    handleResize();

    // Add event listener on mount
    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
