import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import type { Image } from '../services/api';
import { revealInExplorer } from '../services/api';
import { getImageUrl } from '../services/api';
import { parseMetadata } from '../utils/metadataParser';
import ImageModal from './ImageModal';
import WorkflowModal from './WorkflowModal';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/InfoOutlined';

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
    setSelectedImage({
      ...image,
      // O workflow é o próprio objeto metadata_
      Workflow: JSON.stringify(image.metadata_),
      Prompt: getFieldInsensitive(image.metadata_, 'Prompt')
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

  const handleOpenWorkflowModal = (image: Image) => {
    setWorkflowModalImage(image);
    setWorkflowModalOpen(true);
  };
  const handleCloseWorkflowModal = () => {
    setWorkflowModalOpen(false);
    setWorkflowModalImage(null);
  };

  // --- SQUARE GRID LAYOUT LOGIC ---
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
            <Box
              key={image.id}
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                width: '100%',
                height: '0',
                paddingBottom: '100%', // This creates a square box
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 1,
                bgcolor: 'background.paper',
                cursor: 'pointer',
                display: 'block', // Changed to block for padding-bottom to work
                transition: 'box-shadow 0.2s, transform 0.18s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-6px)',
                },
                '&:hover .image-action-icons': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
              onClick={() => handleImageClick(image)}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={getImageUrl(image.full_path)}
                  alt={image.filename}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: loadedImages.has(getImageUrl(image.full_path)) ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    borderRadius: 'inherit',
                    display: 'block',
                  }}
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(getImageUrl(image.full_path)))}
                />
                {!loadedImages.has(getImageUrl(image.full_path)) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}
                <Box
                  className="image-action-icons"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    zIndex: 2,
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                  }}
                >
                  <Tooltip title="Workflow preview" arrow>
                    <IconButton size="medium" sx={{ bgcolor: '#23272E', color: '#fff', '&:hover': { bgcolor: '#444' }, p: 1 }} onClick={e => { e.stopPropagation(); handleOpenWorkflowModal(image); }}>
                      <WorkflowIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Metadata preview" arrow>
                    <IconButton size="medium" sx={{ bgcolor: '#23272E', color: '#fff', '&:hover': { bgcolor: '#444' }, p: 1 }} onClick={e => { e.stopPropagation(); handleImageClick(image); }}>
                      <InfoIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
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
        selectedImageData={selectedImageData as unknown as Record<string, unknown> | null}
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
        workflowJson={workflowModalImage ? JSON.parse(JSON.stringify(workflowModalImage.metadata_)) : null}
        image={workflowModalImage}
        onSeeMetadataPreview={() => {
          if (workflowModalImage) {
            setSelectedImage(workflowModalImage);
            setIsModalOpen(true);
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