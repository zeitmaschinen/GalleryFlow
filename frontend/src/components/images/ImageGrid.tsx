import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { getImageUrl, revealInExplorer } from '../../services/api';
import ImageGridItem from './ImageGridItem';
import ImageModal from './ImageModal';
import WorkflowModal from '../workflow/WorkflowModal';
import type { Image } from './types';

// Define the Image interface directly to avoid import issues
// export interface Image {
//   id: string;
//   filename: string;
//   full_path: string;
//   created_at: string;
//   updated_at: string;
//   width: number;
//   height: number;
//   folder_id: string;
//   metadata_: Record<string, unknown>;
//   file_size: number;
//   file_type: string;
//   thumbnail_path?: string;
//   is_favorite?: boolean;
//   Workflow?: string;
//   Prompt?: string;
// }

interface ImageGridProps {
  images: Image[];
  thumbnailSize: number;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, thumbnailSize }) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const modalImageRef = useRef<HTMLImageElement>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [workflowModalOpen, setWorkflowModalOpen] = React.useState(false);
  const [workflowModalImage, setWorkflowModalImage] = React.useState<Image | null>(null);
  const [columnsCount, setColumnsCount] = useState(Math.floor(window.innerWidth / thumbnailSize));

  // Preload images
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
      };
      img.src = src;
    };

    images.forEach(image => {
      if (!loadedImages.has(getImageUrl(image.full_path))) {
        preloadImage(getImageUrl(image.full_path));
      }
    });
  }, [images, loadedImages]);

  // Update column count when window is resized or thumbnail size changes
  useEffect(() => {
    const calculateColumns = () => {
      // Calculate available width (excluding padding)
      const containerWidth = window.innerWidth - 16 * 2;
      // Calculate columns with gap consideration
      const columnWidth = thumbnailSize + 8; // thumbnail size + gap
      const columns = Math.floor(containerWidth / columnWidth);
      setColumnsCount(Math.max(1, columns));
    };
    
    calculateColumns();
    
    const handleResize = () => {
      calculateColumns();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [thumbnailSize]);

  // Função auxiliar para buscar campo ignorando case
  function getFieldInsensitive(obj: Record<string, unknown> | null, key: string) {
    if (!obj) return undefined;
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? obj[foundKey] : undefined;
  }

  const handleImageClick = (image: Image) => { 
    // Ensure metadata_ is never null to prevent issues with the modal
    const safeMetadata = image.metadata_ || {};
    
    setSelectedImage({
      ...image,
      metadata_: safeMetadata, // Ensure metadata is never null
      // O workflow é o próprio objeto metadata_
      Workflow: Object.keys(safeMetadata).length > 0 ? JSON.stringify(safeMetadata) : "{}",
      Prompt: getFieldInsensitive(safeMetadata, 'Prompt')
    } as Image & { Workflow?: string; Prompt?: string });
    
    setImageDimensions(null); 
    setIsModalOpen(true); 
  };
  
  const handleCloseModal = () => { 
    setIsModalOpen(false); 
    setImageDimensions(null); 
    setTimeout(() => setSelectedImage(null), 300); 
  };
  
  const handleCloseSnackbar = () => { 
    setSnackbarOpen(false); 
  };
  
  const handleCopyToClipboard = async (text: string, isNegative = false) => { 
    if (!navigator.clipboard) { 
      setSnackbarMessage('Clipboard API not available.'); 
      setSnackbarOpen(true); 
      return; 
    } 
    
    try { 
      await navigator.clipboard.writeText(text);
      let message;
      
      if (isNegative) {
        message = 'Negative prompt copied!';
      } else if (selectedImage && text === selectedImage.filename) {
        message = 'Image filename copied!';
      } else {
        message = 'Positive prompt copied!';
      }
      
      setSnackbarMessage(message); 
      setSnackbarOpen(true); 
    } catch (err) { 
      console.error('Failed to copy text: ', err); 
      setSnackbarMessage('Failed to copy text.'); 
      setSnackbarOpen(true); 
    }
  };
  
  const selectedImageData = selectedImage ? selectedImage.metadata_ : null;

  const handleModalImageLoad = () => { 
    if (modalImageRef.current) { 
      setImageDimensions({ 
        width: modalImageRef.current.naturalWidth, 
        height: modalImageRef.current.naturalHeight 
      }); 
    }
  };
  
  const handleRevealFile = async () => { 
    if (!selectedImage) return; 
    
    setIsRevealing(true); 
    setSnackbarMessage(''); 
    
    try { 
      const result = await revealInExplorer(selectedImage.full_path); 
      setSnackbarMessage(result.message || 'Reveal command sent.'); 
      setSnackbarOpen(true); 
    } catch (error: unknown) {
      console.error("Failed to reveal file:", error);
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to reveal file.';
      setSnackbarMessage(`Error: ${detail}`);
      setSnackbarOpen(true);
    } finally { 
      setIsRevealing(false); 
    } 
  };

  const handlePrevImage = () => {
    if (!selectedImage || images.length === 0) return;
    const idx = images.findIndex(img => img.id === selectedImage.id);
    if (idx > 0) setSelectedImage(images[idx - 1]);
  };

  const handleNextImage = () => {
    if (!selectedImage || images.length === 0) return;
    const idx = images.findIndex(img => img.id === selectedImage.id);
    if (idx < images.length - 1) setSelectedImage(images[idx + 1]);
  };

  // Add loading tracking for transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitioning = useRef(false);

  useEffect(() => {
    transitioning.current = true;
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      transitioning.current = false;
      setIsTransitioning(false);
    }, 1000); // Wait for images to start loading
    return () => clearTimeout(timer);
  }, [images]);

  const handleOpenWorkflowModal = (image: Image) => {
    setWorkflowModalImage(image);
    setWorkflowModalOpen(true);
  };
  
  const handleCloseWorkflowModal = () => {
    setWorkflowModalOpen(false);
  };

  // Calculate columns based on container width and thumbnail size
  // This approach allows us to eliminate the right-side gap by adjusting the column width
  const gridTemplateColumns = `repeat(${columnsCount}, 1fr)`;

  return (
    <>
      {isTransitioning && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          <CircularProgress />
        </Box>
      )}
      <Box sx={{ 
        width: '100%', 
        p: 1,
        overflowX: 'hidden' // Prevent horizontal scrollbar
      }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns,
            gap: '8px',
            width: '100%',
          }}
        >
          {images.map((image) => (
            <ImageGridItem
              key={image.id}
              image={image}
              thumbnailSize={thumbnailSize}
              loadedImages={loadedImages}
              handleImageClick={handleImageClick}
              handleOpenWorkflowModal={handleOpenWorkflowModal}
            />
          ))}
        </Box>
      </Box>

      {/* OUTSIDE THE DIALOG: Render navigation arrows absolutely on the viewport when modal is open */}
      {isModalOpen && selectedImage && (
        <>
          <Box sx={{
            position: 'fixed',
            top: '50%',
            left: 16,
            zIndex: 1400,
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
          }}>
            <Box
              aria-label="Previous image"
              onClick={handlePrevImage}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                m: 1,
                transition: 'background 0.2s',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
                '&:active': {
                  bgcolor: 'primary.dark',
                  color: 'primary.contrastText',
                }
              }}
            />
          </Box>
          <Box sx={{
            position: 'fixed',
            top: '50%',
            right: 16,
            zIndex: 1400,
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
          }}>
            <Box
              aria-label="Next image"
              onClick={handleNextImage}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                m: 1,
                transition: 'background 0.2s',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
                '&:active': {
                  bgcolor: 'primary.dark',
                  color: 'primary.contrastText',
                }
              }}
            />
          </Box>
        </>
      )}

      <ImageModal
        open={isModalOpen}
        selectedImage={selectedImage}
        selectedImageData={selectedImageData}
        imageDimensions={imageDimensions}
        modalImageRef={modalImageRef}
        isRevealing={isRevealing}
        onClose={handleCloseModal}
        onModalImageLoad={handleModalImageLoad}
        onRevealFile={handleRevealFile}
        onCopyToClipboard={handleCopyToClipboard}
        images={images}
        setSelectedImage={setSelectedImage}
        onOpenWorkflow={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            if (selectedImage) {
              setWorkflowModalImage(selectedImage);
              setWorkflowModalOpen(true);
            }
          }, 300);
        }}
      />

      <WorkflowModal
        open={workflowModalOpen}
        onClose={handleCloseWorkflowModal}
        workflowJson={workflowModalImage ? workflowModalImage.metadata_ : null}
        image={workflowModalImage}
        images={images}
        setSelectedImage={setWorkflowModalImage}
        onSeeMetadataPreview={() => {
          if (workflowModalImage) {
            setWorkflowModalOpen(false);
            setTimeout(() => {
              setSelectedImage(workflowModalImage);
              setIsModalOpen(true);
            }, 300);
          }
        }}
      />

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        message={snackbarMessage} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ImageGrid;