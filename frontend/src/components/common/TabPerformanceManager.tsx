import React, { useEffect, useRef } from 'react';
import { useWindowEvents } from '../../hooks/useWindowEvents';

interface TabPerformanceManagerProps {
  children: React.ReactNode;
}

/**
 * TabPerformanceManager applies performance optimizations when switching between browser tabs
 * It adds CSS classes to the body element based on tab visibility and activity state
 * and proactively applies optimizations to prevent unresponsive periods
 */
const TabPerformanceManager: React.FC<TabPerformanceManagerProps> = ({ children }) => {
  const { isVisible, isTabActive } = useWindowEvents();
  const recoveryTimerRef = useRef<number | null>(null);
  const blurAppliedRef = useRef(false);

  // Direct visibility change handler for immediate response
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Immediately apply blur when tab becomes hidden
        document.body.classList.add('tab-hidden');
        document.body.classList.add('tab-blur-preemptive');
        blurAppliedRef.current = true;
      } else {
        // When tab becomes visible again, keep blur temporarily
        document.body.classList.remove('tab-hidden');
        
        // Start a gradual recovery process
        document.body.classList.add('tab-recovering');
        
        // Clear any existing recovery timer
        if (recoveryTimerRef.current) {
          window.clearTimeout(recoveryTimerRef.current);
        }
        
        // Set a timer to remove recovery class after a delay
        recoveryTimerRef.current = window.setTimeout(() => {
          document.body.classList.remove('tab-recovering');
          document.body.classList.remove('tab-blur-preemptive');
          blurAppliedRef.current = false;
          recoveryTimerRef.current = null;
        }, 1000); // 1 second recovery period
      }
    };
    
    // Add direct event listener for immediate response
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (recoveryTimerRef.current) {
        window.clearTimeout(recoveryTimerRef.current);
      }
    };
  }, []);

  // Sync with useWindowEvents state
  useEffect(() => {
    // Add/remove classes based on tab visibility and activity
    if (!isVisible && !blurAppliedRef.current) {
      document.body.classList.add('tab-hidden');
      document.body.classList.add('tab-blur-preemptive');
      blurAppliedRef.current = true;
    }
    
    if (!isTabActive && !document.body.classList.contains('tab-recovering')) {
      document.body.classList.add('tab-recovering');
    } else if (isTabActive) {
      document.body.classList.remove('tab-recovering');
      document.body.classList.remove('tab-blur-preemptive');
      blurAppliedRef.current = false;
    }
  }, [isVisible, isTabActive]);

  // Add CSS rules for performance optimizations
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'tab-performance-styles';
    styleEl.textContent = `
      /* Apply immediate blur when leaving tab (preemptive) - only to content images */
      .tab-blur-preemptive .MuiImageListItem-root img,
      .tab-blur-preemptive .MuiCardMedia-root img,
      .tab-blur-preemptive .image-container img,
      .tab-blur-preemptive .MuiModal-root img {
        filter: blur(2px) !important;
        will-change: filter !important;
        transition: none !important;
      }
      
      /* Explicitly exclude logos and UI icons from blur */
      .tab-blur-preemptive .MuiAppBar-root img,
      .tab-blur-preemptive .MuiToolbar-root img,
      .tab-blur-preemptive header img,
      .tab-blur-preemptive .MuiSvgIcon-root,
      .tab-blur-preemptive button img {
        filter: none !important;
      }
      
      /* When tab is hidden, optimize rendering */
      .tab-hidden .MuiPaper-root {
        content-visibility: auto;
        contain: strict;
        will-change: transform;
      }
      
      /* When tab is recovering, apply a subtle blur effect to content images only */
      .tab-recovering .MuiImageListItem-root img,
      .tab-recovering .MuiCardMedia-root img,
      .tab-recovering .image-container img,
      .tab-recovering .MuiModal-root img {
        filter: blur(1.5px);
        transition: filter 0.5s ease-out !important;
      }
      
      /* Explicitly exclude logos and UI icons from blur during recovery */
      .tab-recovering .MuiAppBar-root img,
      .tab-recovering .MuiToolbar-root img,
      .tab-recovering header img,
      .tab-recovering .MuiSvgIcon-root,
      .tab-recovering button img {
        filter: none !important;
      }
      
      /* Reduce animation complexity during tab recovery */
      .tab-recovering * {
        animation-duration: 0.001s !important;
        transition-duration: 0.5s !important;
      }
      
      /* Prioritize UI responsiveness over visual fidelity */
      .tab-recovering {
        content-visibility: auto;
      }
    `;

    // Only add the style element if it doesn't exist
    if (!document.getElementById('tab-performance-styles')) {
      document.head.appendChild(styleEl);
    }

    return () => {
      // Clean up classes when component unmounts
      document.body.classList.remove('tab-hidden');
      document.body.classList.remove('tab-recovering');
      document.body.classList.remove('tab-blur-preemptive');
      
      // Remove style element
      const existingStyle = document.getElementById('tab-performance-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Clear any timers
      if (recoveryTimerRef.current) {
        window.clearTimeout(recoveryTimerRef.current);
      }
    };
  }, [isVisible, isTabActive]);

  return <>{children}</>;
};

export default TabPerformanceManager;