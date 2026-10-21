import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { COMPONENTS, RADIUS, TYPOGRAPHY } from '../adminTheme/tokens';
import {
    ADMIN_SETTINGS_CARD_GAP,
    ADMIN_SETTINGS_CARD_PADDING,
    ADMIN_SETTINGS_FONT,
} from './layout';

export default function AdminNavCard({
    colors,
    iconHtml,
    fallbackIcon,
    title,
    description,
    onClick,
    index = 0,
    isUpsell = false,
    badge,
}) {
    return (
        <Box
            onClick={onClick}
            sx={{
                ...COMPONENTS.navCard,
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'stretch',
                justifyContent: 'space-between',
                width: '100%',
                boxSizing: 'border-box',
                border: `1px solid ${colors.hookCardBorder || colors.border}`,
                borderRadius: RADIUS.card,
                p: ADMIN_SETTINGS_CARD_PADDING,
                mb: ADMIN_SETTINGS_CARD_GAP,
                cursor: 'pointer',
                bgcolor: colors.paper,
                opacity: isUpsell ? 0.72 : 1,
                animation: 'staggerFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                animationDelay: `${index * 0.08}s`,
                '@keyframes staggerFadeIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                    sx={{
                        bgcolor: isUpsell ? 'transparent' : colors.filterActiveBg,
                        color: isUpsell ? colors.textMuted : colors.primary,
                        borderRadius: '8px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                    }}
                >
                    {iconHtml ? (
                        <Box
                            dangerouslySetInnerHTML={{ __html: iconHtml }}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& .dashicons': {
                                    fontSize: '24px',
                                    width: '24px',
                                    height: '24px',
                                    m: 0,
                                    color: isUpsell ? colors.textMuted : undefined,
                                },
                            }}
                        />
                    ) : fallbackIcon}
                </Box>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                ...TYPOGRAPHY.navTitle,
                                color: isUpsell ? colors.textMuted : colors.textPrimary,
                            }}
                        >
                            {title}
                        </Typography>
                        {badge && (
                            <Box
                                component="span"
                                sx={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: colors.white,
                                    bgcolor: colors.textMuted,
                                    px: '6px',
                                    py: '4px',
                                    borderRadius: '4px',
                                    lineHeight: 1,
                                }}
                            >
                                {badge}
                            </Box>
                        )}
                    </Box>
                    {!isUpsell && description && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: ADMIN_SETTINGS_FONT,
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: '20px',
                                color: 'text.secondary',
                            }}
                        >
                            {description}
                        </Typography>
                    )}
                </Box>
            </Box>
            {isUpsell ? (
                <OpenInNewIcon sx={{ color: colors.textMuted, fontSize: '20px' }} />
            ) : (
                <ChevronRightIcon sx={{ color: colors.primary }} />
            )}
        </Box>
    );
}
