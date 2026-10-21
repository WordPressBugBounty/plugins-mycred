import { Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Launcher({ isOpen, onClick, settings }) {
    const design = settings.design || {};
    const general = settings.general || {};
    const assetsUrl = window.mycredLoyaltyWidget?.assets_url || '';

    const bgColor = design.backgroundColor || '#2D1572';
    const textColor = design.textColor || '#5E2CED';
    const radius = design.launcherRadius || 45;
    const animationType = design.launcherAnimation || 'none';

    const getAnimation = () => {
        if (animationType === 'none') return 'none';
        return `${animationType}Keyframe 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    };

    const position = general.widgetPosition || 'bottom-right';
    const isLeft = position.includes('left');

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexDirection: isLeft ? 'row' : 'row-reverse',
                '@keyframes fadeKeyframe': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 }
                },
                '@keyframes slideKeyframe': {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 }
                },
                '@keyframes zoomKeyframe': {
                    '0%': { transform: 'scale(0.5)', opacity: 0 },
                    '100%': { transform: 'scale(1)', opacity: 1 }
                },
                animation: getAnimation()
            }}
        >
            {/* When widget is open, show only the circular Close toggle button */}
            {isOpen ? (
                <Box
                    onClick={onClick}
                    sx={{
                        width: '48px',
                        height: '48px',
                        minWidth: '48px',
                        maxWidth: '48px',
                        minHeight: '48px',
                        maxHeight: '48px',
                        bgcolor: bgColor,
                        color: textColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 24, color: textColor }} />
                </Box>
            ) : (
                /* Launcher Pill (shown when widget is closed) */
                <Box
                    onClick={onClick}
                    sx={{
                        height: '48px',
                        px: '20px',
                        bgcolor: bgColor,
                        color: textColor,
                        borderRadius: `${radius}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        '@keyframes shakeKeyframe': {
                            '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
                            '15%': { transform: 'translateX(-4px) rotate(-2deg)' },
                            '30%': { transform: 'translateX(4px) rotate(2deg)' },
                            '45%': { transform: 'translateX(-3px) rotate(-1.5deg)' },
                            '60%': { transform: 'translateX(3px) rotate(1.5deg)' },
                            '75%': { transform: 'translateX(-2px) rotate(-1deg)' },
                            '90%': { transform: 'translateX(2px) rotate(1deg)' },
                        },
                        '&:hover': {
                            animation: 'shakeKeyframe 0.45s ease-in-out',
                        },
                    }}
                >
                    {design.showLogo && (
                        <Box
                            component="img"
                            src={design.logoUrl || (assetsUrl + 'widget-logo.png')}
                            alt="Logo"
                            sx={{
                                height: '24px !important',
                                maxHeight: '24px !important',
                                width: 'auto !important',
                                maxWidth: '100px !important',
                                objectFit: 'contain',
                                display: 'inline-block',
                                verticalAlign: 'middle',
                                flexShrink: 0,
                            }}
                        />
                    )}
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', m: '0 !important', color: 'inherit' }}>
                        {design.logoText || 'Rewards Hub'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
