import React, { useState } from 'react';
import { Box, Button, TextField, ToggleButton, ToggleButtonGroup, Typography, IconButton, Chip } from '@mui/material';
import { Link as LinkIcon, Upload, X } from 'lucide-react';

export function isLikelyImageUrl(value) {
  const v = (value || '').trim();
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/');
}

/**
 * Single-image picker: Upload (Firebase Storage) or paste a URL / /images/ path.
 */
export default function ImageSourceField({
  label,
  helperText,
  value = '',
  onChange,
  onFileSelected,
  uploading = false,
  inputId,
  accept = 'image/*',
  previewSx = { maxHeight: 100, maxWidth: 300 }
}) {
  const [mode, setMode] = useState('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlWarning, setUrlWarning] = useState('');

  const applyUrl = () => {
    const next = urlDraft.trim();
    if (!next) {
      setUrlWarning('Enter an image URL or a path like /images/product.jpg');
      return;
    }
    setUrlWarning(isLikelyImageUrl(next) ? '' : 'Use https://… or a path starting with /');
    onChange(next);
    setUrlDraft('');
  };

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          {label}
        </Typography>
      )}
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {helperText}
        </Typography>
      )}

      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, next) => next && setMode(next)}
        sx={{ mb: 1.5 }}
      >
        <ToggleButton value="upload">
          <Upload size={14} style={{ marginRight: 6 }} />
          Upload
        </ToggleButton>
        <ToggleButton value="url">
          <LinkIcon size={14} style={{ marginRight: 6 }} />
          Image URL
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === 'upload' ? (
        <>
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileSelected) onFileSelected(file);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
            id={inputId}
            disabled={uploading}
          />
          <label htmlFor={inputId}>
            <Button
              component="span"
              variant="outlined"
              startIcon={<Upload size={18} />}
              disabled={uploading}
              sx={{ mb: 1 }}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="https://… or /images/logo.png"
            value={urlDraft}
            onChange={(e) => {
              setUrlDraft(e.target.value);
              setUrlWarning('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyUrl();
              }
            }}
            error={Boolean(urlWarning)}
            helperText={urlWarning}
          />
          <Button variant="outlined" onClick={applyUrl} sx={{ whiteSpace: 'nowrap', mt: 0.25 }}>
            Use URL
          </Button>
        </Box>
      )}

      {value && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={value}
            alt="Preview"
            sx={{
              objectFit: 'contain',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
              ...previewSx
            }}
            onError={(e) => {
              e.target.src = '/images/placeholder.png';
            }}
          />
          <Button
            size="small"
            variant="text"
            color="error"
            startIcon={<X size={16} />}
            onClick={() => onChange('')}
          >
            Remove
          </Button>
        </Box>
      )}
    </Box>
  );
}

/**
 * Multi-image picker for products: upload files and/or paste URLs.
 */
export function MultiImageSourceField({
  images = [],
  onImagesChange,
  pendingFiles = [],
  onFilesChange,
  onRemovePendingFile,
  uploading = false,
  inputId = 'product-image-upload'
}) {
  const [mode, setMode] = useState('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlWarning, setUrlWarning] = useState('');

  const addUrl = () => {
    const next = urlDraft.trim();
    if (!next) {
      setUrlWarning('Enter an image URL or a path like /images/product.jpg');
      return;
    }
    if (!isLikelyImageUrl(next)) {
      setUrlWarning('Use https://… or a path starting with /');
    } else {
      setUrlWarning('');
    }
    onImagesChange([...(images || []), next]);
    setUrlDraft('');
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
        Product Images *
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Upload files (auto-compressed) or paste image URLs / /images/ paths. First image is the main display.
      </Typography>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, next) => next && setMode(next)}
        sx={{ mb: 1.5 }}
      >
        <ToggleButton value="upload">
          <Upload size={14} style={{ marginRight: 6 }} />
          Upload
        </ToggleButton>
        <ToggleButton value="url">
          <LinkIcon size={14} style={{ marginRight: 6 }} />
          Image URL
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === 'upload' ? (
        <>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFilesChange}
            style={{ display: 'none' }}
            id={inputId}
            disabled={uploading}
          />
          <label htmlFor={inputId}>
            <Button component="span" variant="outlined" startIcon={<Upload size={18} />} disabled={uploading} sx={{ mb: 2 }}>
              Upload Images
            </Button>
          </label>
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="https://… or /images/product.jpg"
            value={urlDraft}
            onChange={(e) => {
              setUrlDraft(e.target.value);
              setUrlWarning('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            error={Boolean(urlWarning)}
            helperText={urlWarning}
          />
          <Button variant="outlined" onClick={addUrl} sx={{ whiteSpace: 'nowrap', mt: 0.25 }}>
            Add URL
          </Button>
        </Box>
      )}

      {images.length > 0 && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Current images:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {images.map((url, index) => (
              <Box key={`${url}-${index}`} sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={url}
                  alt={`Product image ${index + 1}`}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onError={(e) => {
                    e.target.src = '/images/placeholder.png';
                  }}
                />
                {index === 0 && (
                  <Chip
                    label="Main"
                    size="small"
                    color="primary"
                    sx={{ position: 'absolute', top: -8, left: -8, fontSize: '10px', height: '20px' }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'error.main',
                    color: 'white',
                    width: 24,
                    height: 24,
                    '&:hover': { backgroundColor: 'error.dark' }
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {pendingFiles.length > 0 && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            New files to upload:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {pendingFiles.map((file, index) => (
              <Box key={`${file.name}-${index}`} sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => onRemovePendingFile(index)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'error.main',
                    color: 'white',
                    width: 24,
                    height: 24,
                    '&:hover': { backgroundColor: 'error.dark' }
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
