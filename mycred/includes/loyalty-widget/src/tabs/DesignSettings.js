import { useState, useRef } from '@wordpress/element';
import {
    Box,
    Typography,
    Switch,
    TextField,
    Button,
    Grid,
    Paper,
    Divider,
    Slider,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { __ } from '@wordpress/i18n';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WidgetPreview from '../components/WidgetPreview';
import { saveSectionSettings } from '../services/api';
import { toast } from 'react-hot-toast';

// Styled MUI Toggle (32x16) matching dashboard
// Custom styled Switch for a cleaner look
const ToggleSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#5E2CED',
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: '#f5f5f5',
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E0E0E0',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

const ColorInput = ({ label, value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#1a1a1a' }}>{label}</Typography>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    border: isFocused ? '1px solid #5E2CED !important' : '1px solid #E6E0F8 !important',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    height: 44,
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: '#fff !important',
                    '&:hover': {
                        borderColor: isFocused ? '#5E2CED !important' : '#D9D0FF !important',
                    }
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: value,
                        flexShrink: 0,
                        position: 'relative',
                        cursor: 'pointer',
                        borderRight: '1px solid #E6E0F8',
                        '& input[type="color"]': {
                            position: 'absolute',
                            top: -10,
                            left: -10,
                            width: '200%',
                            height: '200%',
                            cursor: 'pointer',
                            opacity: 0,
                            border: 'none',
                            padding: 0
                        }
                    }}
                >
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    sx={{
                        height: '100%',
                        '& .MuiOutlinedInput-root': {
                            height: '100%',
                            borderRadius: 0,
                            '& fieldset': { border: 'none !important' },
                            '&:hover fieldset': { border: 'none !important' },
                            '&.Mui-focused fieldset': { border: 'none !important' },
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none !important' }
                        },
                        '& .MuiInputBase-input': {
                            fontSize: '14px',
                            height: '100%',
                            boxSizing: 'border-box',
                            py: 0,
                            boxShadow: 'none !important',
                            outline: 'none !important',
                            border: 'none !important',
                            backgroundColor: 'transparent !important',
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

const SectionHeader = ({ icon: Icon, title, desc }) => (
    <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Icon sx={{ color: '#5E2CED', fontSize: 20 }} />
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>{title}</Typography>
        </Box>
        <Typography sx={{ fontSize: '14px', color: '#666' }}>{desc}</Typography>
    </Box>
);

const DesignSettings = () => {
    const isPro = window.mycredLoyaltyWidgetData?.is_toolkit_pro_active || false;
    const initialSettings = window.mycredLoyaltyWidgetData?.settings?.design || {};

    const [settings, setSettings] = useState({
        showLogo: initialSettings.showLogo !== undefined ? initialSettings.showLogo : true,
        backgroundColor: initialSettings.backgroundColor || '#2D1572',
        textColor: initialSettings.textColor || '#5E2CED',
        buttonColor: initialSettings.buttonColor || '#5E2CED',
        buttonTextColor: initialSettings.buttonTextColor || '#FFFFFF',
        showBranding: isPro ? (initialSettings.showBranding !== undefined ? initialSettings.showBranding : true) : true,
        logoUrl: initialSettings.logoUrl || '',
        logoText: initialSettings.logoText || 'myCred rewards',
        launcherRadius: initialSettings.launcherRadius !== undefined ? initialSettings.launcherRadius : 45,
        launcherAnimation: initialSettings.launcherAnimation || 'fade'
    });

    const frameRef = useRef(null);

    const handleUploadLogo = () => {
        if (typeof wp === 'undefined' || !wp.media) {
            return;
        }

        if (frameRef.current) {
            frameRef.current.open();
            return;
        }

        frameRef.current = wp.media({
            title: __('Select Logo', 'mycred'),
            button: {
                text: __('Use this logo', 'mycred')
            },
            multiple: false
        });

        frameRef.current.on('select', () => {
            const attachment = frameRef.current.state().get('selection').first().toJSON();
            handleChange('logoUrl', attachment.url);
        });

        frameRef.current.open();
    };

    const handleRemoveLogo = () => {
        handleChange('logoUrl', '');
    };

    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleResetToDefaults = () => {
        setSettings({
            showLogo: true,
            backgroundColor: '#2D1572',
            textColor: '#5E2CED',
            buttonColor: '#5E2CED',
            buttonTextColor: '#FFFFFF',
            showBranding: true,
            logoUrl: '',
            logoText: 'myCred rewards',
            launcherRadius: 45,
            launcherAnimation: 'fade'
        });
        toast.success(__('Reset to defaults', 'mycred'));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await saveSectionSettings('design', settings);
            if (response.success) {
                toast.success(__('Settings saved successfully!', 'mycred'));
                // Update global data so other tabs can see the changes
                if (window.mycredLoyaltyWidgetData) {
                    if (!window.mycredLoyaltyWidgetData.settings) window.mycredLoyaltyWidgetData.settings = {};
                    window.mycredLoyaltyWidgetData.settings.design = settings;
                }
                console.log('Settings saved:', response.message);
            } else {
                toast.error(response.message || __('Failed to save settings', 'mycred'));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                {/* Left Column: Settings - 50% Width */}
                <Box sx={{ flex: '1', maxWidth: '500px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Logo Settings */}
                        <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                            <SectionHeader
                                icon={AutoAwesomeIcon}
                                title={__('Logo Settings', 'mycred')}
                                desc={__('Customize your widget logo', 'mycred')}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>{__('Show Logo', 'mycred')}</Typography>
                                    <Typography sx={{ fontSize: '13px', color: '#666' }}>{__('Display logo in the widget', 'mycred')}</Typography>
                                </Box>
                                <ToggleSwitch checked={settings.showLogo} onChange={(e) => handleChange('showLogo', e.target.checked)} />
                            </Box>
                            <Divider sx={{ my: 3 }} />
                            {settings.showLogo ? (
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 1.5 }}>{__('Upload Logo', 'mycred')}</Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            height: 44
                                        }}
                                    >
                                        <Button
                                            onClick={handleUploadLogo}
                                            size="small"
                                            sx={{
                                                textTransform: 'none',
                                                color: '#1a1a1a',
                                                fontWeight: 600,
                                                px: 2,
                                                height: '100%',
                                                bgcolor: '#f5f5f5',
                                                borderRadius: 0,
                                                borderRight: '1px solid #E0E0E0',
                                                flexShrink: 0,
                                                '&:hover': { bgcolor: '#ececec' }
                                            }}>
                                            {__('Choose file', 'mycred')}
                                        </Button>
                                        <TextField
                                            fullWidth
                                            placeholder={__('No file chosen', 'mycred')}
                                            disabled
                                            size="small"
                                            value={settings.logoUrl || ''}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: 44,
                                                    '& fieldset': { border: 'none' },
                                                    '&.Mui-disabled fieldset': { border: 'none' }
                                                },
                                                '& .MuiInputBase-input.Mui-disabled': {
                                                    WebkitTextFillColor: '#666',
                                                    fontSize: '14px'
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Button
                                        onClick={handleRemoveLogo}
                                        size="small"
                                        sx={{ mt: 2, textTransform: 'none', color: '#666', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
                                        {__('Restore Default', 'mycred')}
                                    </Button>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 1.5 }}>{__('Widget Name', 'mycred')}</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={settings.logoText}
                                        onChange={(e) => handleChange('logoText', e.target.value)}
                                        placeholder={__('Enter widget name...', 'mycred')}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '&.Mui-focused fieldset': { borderColor: '#5E2CED' }
                                            }
                                        }}
                                    />
                                    <Typography sx={{ fontSize: '13px', color: '#666', mt: 1 }}>
                                        {__('This name will appear in the widget header when logo is disabled.', 'mycred')}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* Appearance */}
                        <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                            <SectionHeader
                                icon={AutoAwesomeIcon}
                                title={__('Appearance', 'mycred')}
                                desc={__('Customize colors for your widget', 'mycred')}
                            />
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <Box>
                                    <ColorInput label={__('Background Color', 'mycred')} value={settings.backgroundColor} onChange={(v) => handleChange('backgroundColor', v)} />
                                </Box>
                                <Box>
                                    <ColorInput label={__('Text Color', 'mycred')} value={settings.textColor} onChange={(v) => handleChange('textColor', v)} />
                                </Box>
                                <Box>
                                    <ColorInput label={__('Button Color', 'mycred')} value={settings.buttonColor} onChange={(v) => handleChange('buttonColor', v)} />
                                </Box>
                                <Box>
                                    <ColorInput label={__('Button Text Color', 'mycred')} value={settings.buttonTextColor} onChange={(v) => handleChange('buttonTextColor', v)} />
                                </Box>
                            </Box>
                        </Paper>

                        {/* Branding */}
                        <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                            <SectionHeader
                                icon={BrandingWatermarkIcon}
                                title={__('Branding', 'mycred')}
                                desc={__('Pro version feature', 'mycred')}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>{__('Show "Powered by myCred"', 'mycred')}</Typography>
                                    <Typography sx={{ fontSize: '13px', color: '#666' }}>{__('Display branding footer (Pro version)', 'mycred')}</Typography>
                                </Box>
                                <ToggleSwitch
                                    checked={settings.showBranding}
                                    onChange={(e) => {
                                        if (!isPro) return;
                                        handleChange('showBranding', e.target.checked);
                                    }}
                                    sx={{
                                        opacity: isPro ? 1 : 0.9,
                                        cursor: isPro ? 'pointer' : 'not-allowed'
                                    }}
                                />
                            </Box>
                            {!isPro && (
                                <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ color: '#92400E', fontSize: '13px' }}>
                                        👑 {__('Upgrade to Pro version to hide branding footer.', 'mycred')}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* Save Buttons */}
                        <Box sx={{ mt: 1, pt: 3, borderTop: '1px solid #E0E0E0', display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{
                                    bgcolor: '#5E2CED',
                                    color: '#fff',
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.25,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    '&:hover': {
                                        bgcolor: '#4E1CDD',
                                    }
                                }}
                            >
                                {loading ? __('Saving...', 'mycred') : __('Save Settings', 'mycred')}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RestartAltIcon />}
                                onClick={handleResetToDefaults}
                                disabled={loading}
                                sx={{
                                    borderColor: '#E0E0E0',
                                    color: '#666',
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1.25,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    '&:hover': {
                                        borderColor: '#ccc',
                                        bgcolor: 'rgba(0,0,0,0.02)'
                                    }
                                }}
                            >
                                {__('Reset to Default', 'mycred')}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Right Column: Preview & Launcher Settings - 50% Width */}
                <Box sx={{ flex: '1', maxWidth: '500px' }}>
                    <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Live Widget Preview */}
                        <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                            <SectionHeader
                                icon={AutoAwesomeIcon}
                                title={__('Live Widget Preview', 'mycred')}
                                desc={__('See your design changes in real-time', 'mycred')}
                            />
                            <Box sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '652px', // Match widget height + some breathing room
                                pb: 10 // Space for launcher button preview
                            }}>
                                <WidgetPreview settings={settings} />
                            </Box>
                        </Paper>

                        {/* Launcher Button Settings (Below Preview) */}
                        <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                            <SectionHeader
                                icon={AutoAwesomeIcon}
                                title={__('Launcher Button Settings', 'mycred')}
                                desc={__('Customize the button that opens the widget', 'mycred')}
                            />

                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 2 }}>
                                    {__('Button Radius (px)', 'mycred')}
                                </Typography>
                                <Box sx={{ px: 1 }}>
                                    <Slider
                                        value={settings.launcherRadius}
                                        onChange={(e, newValue) => handleChange('launcherRadius', newValue)}
                                        min={0}
                                        max={50}
                                        step={1}
                                        valueLabelDisplay="auto"
                                        sx={{ color: '#5E2CED' }}
                                    />
                                </Box>
                            </Box>

                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 1 }}>
                                    {__('Opening Animation', 'mycred')}
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={settings.launcherAnimation}
                                        onChange={(e) => handleChange('launcherAnimation', e.target.value)}
                                        sx={{
                                            borderRadius: '8px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#5E2CED'
                                            }
                                        }}
                                    >
                                        <MenuItem value="none">{__('None', 'mycred')}</MenuItem>
                                        <MenuItem value="fade">{__('Fade', 'mycred')}</MenuItem>
                                        <MenuItem value="slide">{__('Slide Up', 'mycred')}</MenuItem>
                                        <MenuItem value="zoom">{__('Zoom', 'mycred')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default DesignSettings;
