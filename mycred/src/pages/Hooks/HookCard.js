import { Box, Typography, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExtensionIcon from '@mui/icons-material/Extension';
import { FONTS } from '../../shared/adminTheme/tokens';

const CustomSwitch = ({ checked, onChange, colors }) => (
    <Box
        onClick={(e) => {
            e.stopPropagation();
            onChange();
        }}
        role="switch"
        aria-checked={checked}
        sx={{
            width: 32,
            height: 16,
            borderRadius: '9.333px',
            bgcolor: checked ? colors.primaryLight : colors.switchTrackOff,
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            flexShrink: 0,
        }}
    >
        <Box
            sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: checked ? colors.configure : colors.white,
                boxShadow:
                    '0px 0.722px 2.167px 0px rgba(22,16,40,0.1), 0px 0.72px 1.44px 0px rgba(22,16,40,0.06)',
                position: 'absolute',
                top: '2px',
                left: checked ? '18px' : '2px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {checked && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M2.75 4.34315L1.05355 2.6467L0.346447 3.35381L2.75 5.75736L7.6967 0.81066L6.98959 0.103553L2.75 4.34315Z"
                        fill="white"
                    />
                </svg>
            )}
        </Box>
    </Box>
);

const HookSummary = ({ summary, colors, maxItems = 4 }) => {
    if (!Array.isArray(summary) || summary.length === 0) return null;

    const visible = summary.slice(0, maxItems);
    const remaining = summary.length - visible.length;

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: 1.5 }}>
            {visible.map((item, index) => (
                <Box
                    key={`${item.label}-${index}`}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        px: '10px',
                        py: '4px',
                        borderRadius: '6px',
                        border: `1px solid ${colors.hookCardBorder}`,
                        bgcolor: colors.paper,
                        maxWidth: '100%',
                    }}
                >
                    <Typography
                        component="span"
                        sx={{
                            fontFamily: FONTS.sans,
                            fontSize: 12,
                            fontWeight: 500,
                            color: colors.textMuted,
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.label}
                    </Typography>
                    <Typography
                        component="span"
                        sx={{
                            fontFamily: FONTS.sans,
                            fontSize: 12,
                            fontWeight: 600,
                            color: colors.textPrimary,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.value}
                    </Typography>
                </Box>
            ))}
            {remaining > 0 && (
                <Typography
                    component="span"
                    sx={{
                        fontFamily: FONTS.sans,
                        fontSize: 12,
                        fontWeight: 500,
                        color: colors.textMuted,
                        alignSelf: 'center',
                    }}
                >
                    +{remaining} more
                </Typography>
            )}
        </Box>
    );
};

const StatusBadge = ({ active, colors }) => (
    <Box
        component="span"
        sx={{
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1,
            textTransform: 'uppercase',
            px: '6px',
            py: '4px',
            borderRadius: '4px',
            bgcolor: active ? colors.successBg : colors.paperMuted,
            color: active ? colors.success : colors.textMuted,
        }}
    >
        {active ? 'Active' : 'Inactive'}
    </Box>
);

const HookCard = ({ hook, onToggle, onConfigure, viewMode, index, colors }) => {
    const isGrid = viewMode === 'grid';
    const isActive = !!hook.active;
    const cardBg = colors.paper;

    const rowAnimation = {
        animation: 'hooksStaggerIn 0.4s both',
        animationDelay: `${index * 0.04}s`,
        '@keyframes hooksStaggerIn': {
            '0%': { opacity: 0, transform: 'translateY(4px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
        },
    };

    const configureBtnSx = {
        height: 36,
        px: 1.5,
        borderRadius: '8px',
        textTransform: 'none',
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: 13,
        color: colors.textPrimary,
        borderColor: colors.borderInput,
        bgcolor: colors.paper,
        boxShadow: 'none',
        '&:hover': {
            borderColor: colors.primary,
            color: colors.primary,
            bgcolor: colors.hover,
            boxShadow: 'none',
        },
    };

    if (isGrid) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${colors.hookCardBorder}`,
                    borderRadius: '12px',
                    bgcolor: cardBg,
                    boxSizing: 'border-box',
                    p: 2,
                    ...rowAnimation,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: colors.primaryLight,
                            color: colors.primary,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <ExtensionIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                            <Typography
                                component="button"
                                type="button"
                                onClick={onConfigure}
                                sx={{
                                    appearance: 'none',
                                    border: 'none',
                                    background: 'none',
                                    p: 0,
                                    m: 0,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: colors.textPrimary,
                                    fontWeight: 600,
                                    fontFamily: FONTS.sans,
                                    fontSize: 14,
                                    lineHeight: '20px',
                                    '&:hover': { color: colors.primary, textDecoration: 'underline' },
                                }}
                            >
                                {hook.title}
                            </Typography>
                            <StatusBadge active={isActive} colors={colors} />
                        </Box>

                        <Typography
                            sx={{
                                mt: 1.5,
                                color: colors.textSecondary,
                                fontFamily: FONTS.sans,
                                fontSize: 12,
                                fontWeight: 400,
                                lineHeight: '18px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                '& a': { color: colors.configure, textDecoration: 'none' },
                            }}
                            dangerouslySetInnerHTML={{ __html: hook.description || '' }}
                        />

                        {isActive && <HookSummary summary={hook.summary} colors={colors} maxItems={3} />}
                    </Box>
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${colors.hookCardBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <CustomSwitch checked={isActive} onChange={onToggle} colors={colors} />
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: colors.textSecondary,
                                fontFamily: FONTS.sans,
                            }}
                        >
                            {isActive ? 'Published' : 'Draft'}
                        </Typography>
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {hook.documentation ? (
                            <Button
                                href={hook.documentation}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Documentation"
                                sx={{
                                    minWidth: 36,
                                    width: 36,
                                    height: 36,
                                    p: 0,
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.borderInput}`,
                                    color: colors.textSecondary,
                                    bgcolor: colors.paper,
                                    '&:hover': {
                                        borderColor: colors.primary,
                                        color: colors.primary,
                                        bgcolor: colors.hover,
                                    },
                                }}
                            >
                                <OpenInNewIcon sx={{ fontSize: 16 }} />
                            </Button>
                        ) : null}
                        <Button
                            variant="outlined"
                            onClick={onConfigure}
                            startIcon={<SettingsIcon sx={{ fontSize: '16px !important' }} />}
                            sx={configureBtnSx}
                        >
                            Configure
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: '20px',
                py: '16px',
                minHeight: 86,
                boxSizing: 'border-box',
                border: `1px solid ${colors.hookCardBorder}`,
                borderRadius: '12px',
                bgcolor: cardBg,
                ...rowAnimation,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: colors.primaryLight,
                        color: colors.primary,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: '2px',
                    }}
                >
                    <ExtensionIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: '2px' }}>
                        <Typography
                            sx={{
                                color: colors.textPrimary,
                                fontWeight: 600,
                                fontFamily: FONTS.sans,
                                fontSize: 16,
                                lineHeight: '24px',
                            }}
                        >
                            {hook.title}
                        </Typography>
                        <StatusBadge active={isActive} colors={colors} />
                    </Box>
                    <Typography
                        sx={{
                            color: colors.textSecondary,
                            fontFamily: FONTS.sans,
                            fontSize: 14,
                            lineHeight: '20px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            '& a': { color: colors.configure, textDecoration: 'none' },
                        }}
                        dangerouslySetInnerHTML={{ __html: hook.description || '' }}
                    />
                    {isActive && <HookSummary summary={hook.summary} colors={colors} maxItems={4} />}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <CustomSwitch checked={isActive} onChange={onToggle} colors={colors} />
                    <Typography
                        sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: colors.textSecondary,
                            fontFamily: FONTS.sans,
                            display: { xs: 'none', md: 'block' },
                        }}
                    >
                        {isActive ? 'Published' : 'Draft'}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={onConfigure}
                    startIcon={<SettingsIcon sx={{ fontSize: '16px !important' }} />}
                    sx={{ ...configureBtnSx, minWidth: 110, px: 2 }}
                >
                    Configure
                </Button>
            </Box>
        </Box>
    );
};

export default HookCard;
