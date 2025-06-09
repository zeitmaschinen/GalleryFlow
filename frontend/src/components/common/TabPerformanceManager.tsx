import React, { useEffect } from 'react';
import { useWindowEvents } from '../../hooks/useWindowEvents';

interface TabPerformanceManagerProps {
  children: React.ReactNode;
}

/**
 * TabPerformanceManager applies performance optimizations when switching between browser tabs
 * It adds CSS classes to the body element based on tab visibility and activity state
 */
const TabPerformanceManager: React.FC<TabPerformanceManagerProps> = ({ children }) => {
  const { isVisible, isTabActive } = useWindowEvents();

  useEffect(() => {
    // Add/remove classes based on tab visibility and activity
    if (!isVisible) {
      document.body.classList.add('tab-hidden');
    } else {
      document.body.classList.remove('tab-hidden');
    }

    if (!isTabActive) {
      document.body.classList.add('tab-recovering');
    } else {
      document.body.classList.remove('tab-recovering');
    }

    // Add CSS rules for performance optimizations
    const styleEl = document.createElement('style');
    styleEl.id = 'tab-performance-styles';
    styleEl.textContent = `
      /* When tab is hidden or recovering, optimize rendering */
      .tab-hidden .MuiPaper-root,
      .tab-recovering .MuiPaper-root {
        transition: filter 0.5s ease-out !important;
      }
      
      /* When tab is recovering, apply a subtle blur effect to all images */
      .tab-recovering img {
        filter: blur(1.5px);
        transition: filter 0.5s ease-out !important;
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
      
      // Remove style element
      const existingStyle = document.getElementById('tab-performance-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isVisible, isTabActive]);

  return <>{children}</>;
};

export default TabPerformanceManager;