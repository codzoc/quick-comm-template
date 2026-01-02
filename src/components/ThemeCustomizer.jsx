import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Divider,
    Alert
} from '@mui/material';
import { Save, RotateCcw } from 'lucide-react';
import { getTheme, updateThemeTemplate } from '../services/theme';
import { getThemeTemplate } from '../config/themeTemplates';

const ThemeCustomizer = ({ onSave, baseTemplate = null }) => {
    const [customTheme, setCustomTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [baseTemplateKey, setBaseTemplateKey] = useState(baseTemplate);

    useEffect(() => {
        loadCurrentTheme();
    }, [baseTemplate]);

    const loadCurrentTheme = async () => {
        try {
            // If baseTemplate is provided, use it to prefill
            if (baseTemplate) {
                const base = getThemeTemplate(baseTemplate);
                setCustomTheme({ ...base });
                setBaseTemplateKey(baseTemplate);
                setLoading(false);
                return;
            }

            // Otherwise, load current theme
            const theme = await getTheme();
            if (theme.templateKey === 'custom') {
                setCustomTheme(theme);
                setBaseTemplateKey(null);
            } else {
                // Start with current template as base for customization
                setCustomTheme(theme);
                setBaseTemplateKey(theme.templateKey || 'custom');
            }
        } catch (err) {
            console.error('Error loading theme:', err);
            const baseCustom = getThemeTemplate('custom');
            setCustomTheme(baseCustom);
            setBaseTemplateKey('custom');
        } finally {
            setLoading(false);
        }
    };

    const handleColorChange = (key, value) => {
        setCustomTheme({
            ...customTheme,
            colors: {
                ...customTheme.colors,
                [key]: value
            }
        });
    };

    const handleFontChange = (value) => {
        setCustomTheme({
            ...customTheme,
            fontFamily: value
        });
    };

    const handleBorderRadiusChange = (key, value) => {
        setCustomTheme({
            ...customTheme,
            borderRadius: {
                ...customTheme.borderRadius,
                [key]: value
            }
        });
    };

    const handleSave = async () => {
        try {
            // Save as custom template with the customized values
            await updateThemeTemplate('custom', customTheme);
            if (onSave) onSave();
        } catch (err) {
            alert('Failed to save custom theme: ' + err.message);
        }
    };

    const handleReset = () => {
        // Reset to the base template if available, otherwise use custom default
        if (baseTemplateKey) {
            const base = getThemeTemplate(baseTemplateKey);
            setCustomTheme({ ...base });
        } else {
            const baseCustom = getThemeTemplate('custom');
            setCustomTheme(baseCustom);
        }
    };

    if (loading || !customTheme) {
        return <Typography>Loading theme customizer...</Typography>;
    }

    const colorGroups = {
        'Primary Colors': ['primary', 'primaryHover', 'secondary'],
        'Background Colors': ['background', 'surface'],
        'Text Colors': ['text', 'textLight', 'border'],
        'Status Colors': ['success', 'warning', 'error', 'info']
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Custom Theme Editor</strong><br />
                    {baseTemplateKey && baseTemplateKey !== 'custom' ? (
                        <>Customize the <strong>{getThemeTemplate(baseTemplateKey)?.name}</strong> template. All fields are prefilled with the template values. Modify colors, fonts, and border radius as needed.</>
                    ) : (
                        <>Customize all colors, fonts, and border radius for your store. Changes will be applied after saving and refreshing the page.</>
                    )}
                </Typography>
            </Alert>

            {/* Font Family */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Typography
                </Typography>
                <TextField
                    fullWidth
                    label="Font Family"
                    value={customTheme.fontFamily}
                    onChange={(e) => handleFontChange(e.target.value)}
                    helperText="Enter a Google Font name (e.g., Inter, Poppins, Roboto, Montserrat)"
                    placeholder="Inter"
                />
            </Paper>

            {/* Colors */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Colors
                </Typography>

                {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
                    <Box key={groupName} sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                            {groupName}
                        </Typography>
                        <Grid container spacing={2}>
                            {colorKeys.map((colorKey) => (
                                <Grid item xs={12} sm={6} md={4} key={colorKey}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <input
                                            type="color"
                                            value={customTheme.colors[colorKey]}
                                            onChange={(e) => handleColorChange(colorKey, e.target.value)}
                                            style={{
                                                width: '50px',
                                                height: '40px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label={colorKey.replace(/([A-Z])/g, ' $1').trim()}
                                            value={customTheme.colors[colorKey]}
                                            onChange={(e) => handleColorChange(colorKey, e.target.value)}
                                            size="small"
                                            inputProps={{
                                                style: { fontFamily: 'monospace', fontSize: '14px' }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        {groupName !== 'Status Colors' && <Divider sx={{ mt: 2 }} />}
                    </Box>
                ))}
            </Paper>

            {/* Border Radius */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Border Radius
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Control the roundness of corners for buttons, cards, and other elements.
                </Typography>
                <Grid container spacing={2}>
                    {Object.entries(customTheme.borderRadius || {}).map(([key, value]) => (
                        <Grid item xs={12} sm={6} md={3} key={key}>
                            <TextField
                                fullWidth
                                label={key === 'full' ? 'Full (Circle)' : key.toUpperCase()}
                                value={value}
                                onChange={(e) => handleBorderRadiusChange(key, e.target.value)}
                                size="small"
                                helperText={key === 'full' ? 'For circular elements' : `Small: ${key === 'sm' ? 'buttons' : key === 'md' ? 'cards' : 'large cards'}`}
                                inputProps={{
                                    style: { fontFamily: 'monospace', fontSize: '14px' }
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Preview */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: customTheme.colors.background }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Preview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: customTheme.colors.surface,
                            border: `1px solid ${customTheme.colors.border}`,
                            borderRadius: customTheme.borderRadius?.md || '12px'
                        }}
                    >
                        <Typography
                            sx={{
                                color: customTheme.colors.text,
                                fontFamily: customTheme.fontFamily,
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            Sample Heading
                        </Typography>
                        <Typography
                            sx={{
                                color: customTheme.colors.textLight,
                                fontFamily: customTheme.fontFamily,
                                fontSize: '14px'
                            }}
                        >
                            This is how your text will look with the selected colors and font.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: customTheme.colors.primary,
                                '&:hover': { backgroundColor: customTheme.colors.primaryHover },
                                fontFamily: customTheme.fontFamily,
                                borderRadius: customTheme.borderRadius?.md || '12px'
                            }}
                        >
                            Primary Button
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: customTheme.colors.border,
                                color: customTheme.colors.text,
                                fontFamily: customTheme.fontFamily,
                                borderRadius: customTheme.borderRadius?.md || '12px'
                            }}
                        >
                            Secondary Button
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<Save size={18} />}
                    onClick={handleSave}
                    sx={{ flex: 1 }}
                >
                    Save Custom Theme
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<RotateCcw size={18} />}
                    onClick={handleReset}
                >
                    {baseTemplateKey && baseTemplateKey !== 'custom' ? 'Reset to Template' : 'Reset to Default'}
                </Button>
            </Box>

            <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                    After saving, the page will refresh to apply your custom theme.
                </Typography>
            </Alert>
        </Box>
    );
};

export default ThemeCustomizer;
