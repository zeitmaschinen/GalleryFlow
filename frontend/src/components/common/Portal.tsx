import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export const Portal: React.FC<PortalProps> = ({ 
  children, 
  containerId = 'portal-root' 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let container = document.getElementById(containerId);
    let shouldRemoveContainer = false;

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
      shouldRemoveContainer = true;
    }

    containerRef.current = container as HTMLDivElement;

    return () => {
      if (shouldRemoveContainer && container?.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [containerId]);

  if (!containerRef.current) return null;

  return createPortal(children, containerRef.current);
};