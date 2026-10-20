import React from 'react';
import {
  Dialog,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Box,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import { palette, typography } from '../../theme/themeConstants';
import { getImageUrl } from '../../services/api';
import type { Image } from './types';
import { useImageMetadata } from '../../hooks/useImageMetadata';
import { useImageModalNavigationHelpers } from '../../hooks/useImageModalNavigationHelpers';
import { formatFileSize, getFileExtension } from '../../utils/fileUtils';
import ModalNavArrow from '../../theme/ModalNavArrow';
import ModalSlideTransition from '../common/ModalSlideTransition';

interface ImageModalProps {
  open: boolean;
  selectedImage: Image | null;
  selectedImageData: Record<string, unknown> | null;
  imageDimensions: { width: number; height: number } | null;
  modalImageRef: React.RefObject<HTMLImageElement>;
  isRevealing: boolean;
  onClose: () => void;
  onModalImageLoad: () => void;
  onRevealFile: () => void;
  onCopyToClipboard: (text: string, isNegative?: boolean) => void;
  onOpenWorkflow: () => void;
  onOpenPreview?: () => void;
  images?: Image[];
  setSelectedImage?: (img: Image) => void;
}

const hasValue = (v: unknown) => v !== undefined && v !== null && v !== '' && v !== 'N/A';

// ----- Small building blocks for the details panel -----

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="overline" component="h3" sx={{ display: 'block', fontSize: 10.5, color: 'text.disabled', mb: 1 }}>
    {children}
  </Typography>
);

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box component="section" sx={{ py: 2.25, borderTop: 1, borderColor: 'divider', '&:first-of-type': { borderTop: 0, pt: 0.5 } }}>
    <SectionLabel>{label}</SectionLabel>
    {children}
  </Box>
);

const PromptBlock: React.FC<{ text: string; muted?: boolean; label: string; onCopy: () => void }> = ({ text, muted, label, onCopy }) => (
  <Box
    sx={(theme) => ({
      position: 'relative',
      p: 1.5,
      pr: 5,
      borderRadius: '10px',
      bgcolor: palette[theme.palette.mode].elevated,
      '& .copy-prompt': { opacity: 0, transition: 'opacity 160ms' },
      '&:hover .copy-prompt, & .copy-prompt:focus-visible': { opacity: 1 },
      '@media (hover: none)': { '& .copy-prompt': { opacity: 1 } },
    })}
  >
    <Typography
      variant="body2"
      sx={{
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: muted ? 'text.secondary' : 'text.primary',
        maxHeight: 220,
        overflowY: 'auto',
      }}
    >
      {text.trim()}
    </Typography>
    <Tooltip title={`Copy ${label}`}>
      <IconButton className="copy-prompt" size="small" aria-label={`Copy ${label}`} onClick={onCopy} sx={{ position: 'absolute', top: 6, right: 6, p: 0.75 }}>
        <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  </Box>
);

const Field: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.25 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: typography.fontWeights.medium,
        fontVariantNumeric: 'tabular-nums',
        fontFamily: mono ? typography.monoFamily : undefined,
        fontSize: mono ? 12.5 : undefined,
        wordBreak: 'break-all',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const ImageModalContent: React.FC<ImageModalProps> = ({
  open,
  selectedImage,
  selectedImageData,
  imageDimensions,
  modalImageRef,
  isRevealing,
  onClose,
  onModalImageLoad,
  onRevealFile,
  onCopyToClipboard,
  onOpenWorkflow,
  onOpenPreview,
  images,
  setSelectedImage
}) => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));
  const p = palette[theme.palette.mode];

  const {
    model,
    seed,
    steps,
    cfg,
    sampler,
    scheduler,
    denoise,
    hiresUpscale,
    hiresUpscaler,
    positivePrompt,
    negativePrompt,
    loras,
  } = useImageMetadata(selectedImageData || {});

  const validLoras = Array.isArray(loras)
    ? loras.filter(lora => lora && typeof lora.name === 'string' && typeof lora.weight === 'number')
    : [];

  const { hasPrev, hasNext, goPrev, goNext } = useImageModalNavigationHelpers(open, images, selectedImage, setSelectedImage);

  const hasMetadata = !!selectedImageData && Object.keys(selectedImageData).length > 0;

  const width = imageDimensions?.width ?? selectedImage?.width;
  const height = imageDimensions?.height ?? selectedImage?.height;
  const facts = [
    width && height ? `${width} × ${height}` : null,
    selectedImage ? getFileExtension(selectedImage.filename).slice(1).toUpperCase() : null,
    selectedImage?.file_size ? formatFileSize(selectedImage.file_size) : null,
  ].filter(Boolean).join('  ·  ');

  const settings = [
    { label: 'Seed', value: seed, mono: true },
    { label: 'Steps', value: steps },
    { label: 'CFG scale', value: cfg },
    { label: 'Sampler', value: sampler },
    { label: 'Scheduler', value: scheduler },
    { label: 'Denoise', value: denoise },
  ].filter(s => hasValue(s.value));

  // Opens the full-size image in a new browser tab
  const handleImageClick = () => {
    if (selectedImage?.full_path) {
      window.open(getImageUrl(selectedImage.full_path), '_blank');
    } else if (onOpenPreview) {
      onOpenPreview();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isNarrow}
      TransitionComponent={ModalSlideTransition}
      aria-labelledby="image-details-title"
      PaperProps={{
        sx: {
          width: isNarrow ? '100%' : 'min(1180px, calc(100vw - 160px))',
          height: isNarrow ? '100%' : 'min(820px, calc(100vh - 64px))',
          m: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : 'minmax(0, 1fr) 380px',
          gridTemplateRows: isNarrow ? 'auto minmax(0, 1fr)' : '1fr',
          borderRadius: isNarrow ? 0 : undefined,
        },
      }}
    >
      {/* On phones the arrows sit beside the image instead of mid-screen */}
      {open && hasPrev && <ModalNavArrow direction="left" aria-label="Previous image" onClick={goPrev} sx={{ top: isNarrow ? '21vh' : '50%' }} />}
      {open && hasNext && <ModalNavArrow direction="right" aria-label="Next image" onClick={goNext} sx={{ top: isNarrow ? '21vh' : '50%' }} />}

      {/* Left: the image on a quiet backdrop */}
      <Box
        sx={{
          bgcolor: p.sunken,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 4 },
          minHeight: 0,
          height: isNarrow ? '42vh' : '100%',
        }}
      >
        <Tooltip title="Open full size in a new tab" placement="bottom" enterDelay={800} disableTouchListener disableFocusListener>
          <Box
            component="img"
            key={selectedImage?.id}
            ref={modalImageRef}
            onLoad={onModalImageLoad}
            onClick={handleImageClick}
            src={getImageUrl(selectedImage?.full_path || '')}
            alt={selectedImage?.filename || ''}
            data-high-priority="true"
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '6px',
              cursor: 'zoom-in',
              boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(29,28,26,0.14)',
              animation: 'gf-fade-in 300ms ease',
              '@keyframes gf-fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
            }}
          />
        </Tooltip>
      </Box>

      {/* Right: details */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderLeft: isNarrow ? 0 : 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 3, pt: 2.5, pb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                id="image-details-title"
                component="h2"
                noWrap
                title={selectedImage?.filename}
                sx={{ fontWeight: typography.fontWeights.semibold, fontSize: 15, minWidth: 0 }}
              >
                {selectedImage?.filename || 'Untitled'}
              </Typography>
              <Tooltip title="Copy filename">
                <IconButton size="small" aria-label="Copy filename" onClick={() => onCopyToClipboard(selectedImage?.filename || '', false)} sx={{ p: 0.5, flexShrink: 0 }}>
                  <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
            {facts && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'pre' }}>
                {facts}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="Close details" sx={{ mt: -0.5, mr: -1 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 3, pb: 2, overscrollBehavior: 'contain' }}>
          {hasMetadata ? (
            <>
              {hasValue(positivePrompt) && (
                <Section label="Prompt">
                  <PromptBlock text={positivePrompt} label="prompt" onCopy={() => onCopyToClipboard(positivePrompt, false)} />
                  {hasValue(negativePrompt) && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.75 }}>
                        Negative
                      </Typography>
                      <PromptBlock text={negativePrompt} muted label="negative prompt" onCopy={() => onCopyToClipboard(negativePrompt, true)} />
                    </Box>
                  )}
                </Section>
              )}

              {hasValue(model) && (
                <Section label="Model">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: p.accentSoft, color: p.accentText, flexShrink: 0 }}>
                      <ViewInArRoundedIcon sx={{ fontSize: 17 }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: typography.fontWeights.medium, wordBreak: 'break-all' }}>
                      {model}
                    </Typography>
                  </Box>
                </Section>
              )}

              {settings.length > 0 && (
                <Section label="Settings">
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 2, rowGap: 1.75 }}>
                    {settings.map(s => <Field key={s.label} label={s.label} value={s.value} mono={s.mono} />)}
                  </Box>
                </Section>
              )}

              {hasValue(hiresUpscale) && hasValue(hiresUpscaler) && (
                <Section label="Hires fix">
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 2 }}>
                    <Field label="Scale" value={hiresUpscale} />
                    <Field label="Upscaler" value={hiresUpscaler} />
                  </Box>
                </Section>
              )}

              {validLoras.length > 0 && (
                <Section label={validLoras.length === 1 ? 'LoRA' : `LoRAs · ${validLoras.length}`}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {validLoras.map((lora, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-all' }}>
                          {lora.name}
                        </Typography>
                        <Box sx={{ px: 1, py: 0.25, borderRadius: '6px', bgcolor: p.elevated, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                          {lora.weight.toFixed(2)}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Section>
              )}

              <Typography variant="caption" component="p" sx={{ color: 'text.disabled', lineHeight: 1.5, pt: 1 }}>
                Complex workflows or custom nodes can leave some fields empty. The workflow view always shows everything.
              </Typography>
            </>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: typography.fontWeights.semibold, mb: 0.5 }}>
                No generation data
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                This image has no ComfyUI settings saved in it. Only PNGs saved by ComfyUI carry a prompt and workflow.
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={onRevealFile}
            startIcon={isRevealing ? <CircularProgress size={16} color="inherit" /> : <FolderOpenRoundedIcon />}
            disabled={isRevealing || !selectedImage}
            variant="outlined"
            sx={{ flex: hasMetadata ? '0 0 auto' : 1 }}
          >
            Show in folder
          </Button>
          {hasMetadata && (
            <Button onClick={onOpenWorkflow} variant="contained" startIcon={<AccountTreeOutlinedIcon />} sx={{ flex: 1 }}>
              View workflow
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

// Main component that handles conditional rendering
const ImageModal: React.FC<ImageModalProps> = (props) => {
  if (!props.selectedImage) {
    return null;
  }

  return <ImageModalContent {...props} />;
};

export default ImageModal;
