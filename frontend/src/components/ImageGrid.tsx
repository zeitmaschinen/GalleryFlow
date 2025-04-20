import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import type { Image } from '../services/api';
import { revealInExplorer } from '../services/api';
import { getImageUrl } from '../services/api';
import { parseMetadata } from '../utils/metadataParser';
import ImageGridItem from './ImageGridItem';
import ImageModal from './ImageModal';

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

  const handleImageClick = (image: Image) => { 
    setSelectedImage(image); 
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
      const message = isNegative ? 'Negative prompt copied!' : 
                     text.includes('.') ? 'Image filename copied!' : 'Positive prompt copied!';
      setSnackbarMessage(message); 
      setSnackbarOpen(true); 
    } catch (err) { 
      console.error('Failed to copy text: ', err); 
      setSnackbarMessage('Failed to copy prompt.'); 
      setSnackbarOpen(true); 
    }
  };
  
  const selectedImageData = selectedImage ? parseMetadata(selectedImage.metadata_) : null;

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
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))`,
        gap: 2,
        '& > *': {
          aspectRatio: '1',
        },
        scrollBehavior: 'smooth',
        overscrollBehavior: 'none',
        opacity: isTransitioning ? 0.5 : 1,
        transition: 'opacity 0.3s ease-in-out',
        position: 'relative'
      }}>
        {images.map((image) => (
          <ImageGridItem
            key={image.id}
            image={image}
            loaded={loadedImages.has(getImageUrl(image.full_path))}
            onClick={handleImageClick}
            onLoad={() => setLoadedImages(prev => new Set(prev).add(getImageUrl(image.full_path)))}
          />
        ))}
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
        selectedImageData={selectedImageData as unknown as Record<string, unknown> | null}
        imageDimensions={imageDimensions}
        modalImageRef={modalImageRef}
        isRevealing={isRevealing}
        onClose={handleCloseModal}
        onModalImageLoad={handleModalImageLoad}
        onRevealFile={handleRevealFile}
        onCopyToClipboard={handleCopyToClipboard}
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