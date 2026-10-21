import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Collapse,
    Divider,
    Button,
    Tooltip,
} from '@mui/material';
import {
    ChevronRight as ChevronRightIcon,
    ExpandMore as ExpandMoreIcon,
    Lock as LockIcon,
    OpenInNew as OpenInNewIcon,
    CheckCircle as CheckCircleIcon,
    BugReport as BugReportIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';

export default function GatewayAccordion({ gateway, isUpsell = false }) {
    const { colors, isDark } = useAdminTheme();
    const [open, setOpen] = useState(false);

    const isActive = !isUpsell && gateway.is_active;
    const isSandbox = !isUpsell && gateway.sandbox_mode;

    const handleClick = () => {
        if (isUpsell && gateway.url) {
            window.open(gateway.url, '_blank');
            return;
        }
        setOpen(prev => !prev);
    };

    const statusColor = isActive
        ? (isSandbox ? '#f59e0b' : '#7c3aed')
        : colors.textSecondary;

    const iconBg = isActive
        ? (isSandbox ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)')
        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(109,40,217,0.06)');

    return (
        <>
            {/* Row */}
            <Box
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 3,
                    py: 2,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    '&:hover': {
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(109,40,217,0.03)',
                    },
                }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isUpsell
                            ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(109,40,217,0.06)')
                            : iconBg,
                        flexShrink: 0,
                    }}
                >
                    {isUpsell ? (
                        <LockIcon sx={{ fontSize: 17, color: '#7c3aed' }} />
                    ) : isActive ? (
                        isSandbox
                            ? <BugReportIcon sx={{ fontSize: 17, color: '#f59e0b' }} />
                            : <CheckCircleIcon sx={{ fontSize: 17, color: '#7c3aed' }} />
                    ) : (
                        <SettingsIcon sx={{ fontSize: 17, color: colors.textSecondary }} />
                    )}
                </Box>

                {/* Title + description */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: isUpsell ? colors.textSecondary : colors.text,
                            lineHeight: 1.3,
                        }}
                    >
                        {gateway.title || gateway.text}
                    </Typography>
                    {isActive && !isUpsell && (
                        <Typography sx={{ fontSize: '0.75rem', color: statusColor, mt: 0.2, fontWeight: 500 }}>
                            {isSandbox ? 'Sandbox mode enabled' : 'Gateway is active'}
                        </Typography>
                    )}
                </Box>

                {/* Badges + arrow */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    {isUpsell && (
                        <Chip
                            label={gateway.additional_text || 'Paid'}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                background: 'rgba(109,40,217,0.1)',
                                color: '#7c3aed',
                                border: 'none',
                            }}
                        />
                    )}
                    {!isUpsell && isActive && (
                        <Chip
                            label={isSandbox ? 'Sandbox' : 'Active'}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                background: isSandbox ? 'rgba(245,158,11,0.1)' : 'rgba(109,40,217,0.1)',
                                color: isSandbox ? '#f59e0b' : '#7c3aed',
                                border: 'none',
                            }}
                        />
                    )}
                    {isUpsell
                        ? <OpenInNewIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                        : open
                            ? <ExpandMoreIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                            : <ChevronRightIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                    }
                </Box>
            </Box>

            {/* Expanded body */}
            {!isUpsell && (
                <Collapse in={open} timeout={200}>
                    <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                        {/* Enable / Sandbox / Docs controls */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 3,
                                mb: 2.5,
                                pb: 2,
                                borderBottom: `1px solid ${colors.border}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    type="checkbox"
                                    id={`buycred-gateway-${gateway.id}`}
                                    name="mycred_pref_buycreds[active][]"
                                    value={gateway.id}
                                    defaultChecked={gateway.is_active}
                                    style={{ accentColor: '#7c3aed', width: 15, height: 15, cursor: 'pointer' }}
                                />
                                <label
                                    htmlFor={`buycred-gateway-${gateway.id}`}
                                    style={{ color: colors.text, fontSize: '0.85rem', cursor: 'pointer', margin: 0, fontWeight: 500 }}
                                >
                                    Enable Gateway
                                </label>
                            </Box>

                            {gateway.has_sandbox && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <input
                                        type="checkbox"
                                        id={`buycred-gateway-${gateway.id}-sandbox`}
                                        name={`mycred_pref_buycreds[gateway_prefs][${gateway.id}][sandbox]`}
                                        value={gateway.id}
                                        defaultChecked={gateway.sandbox_mode}
                                        style={{ accentColor: '#f59e0b', width: 15, height: 15, cursor: 'pointer' }}
                                    />
                                    <label
                                        htmlFor={`buycred-gateway-${gateway.id}-sandbox`}
                                        style={{ color: colors.text, fontSize: '0.85rem', cursor: 'pointer', margin: 0, fontWeight: 500 }}
                                    >
                                        Sandbox / Test Mode
                                    </label>
                                </Box>
                            )}

                            {gateway.documentation_url && (
                                <Button
                                    href={gateway.documentation_url}
                                    target="_blank"
                                    size="small"
                                    endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                                    sx={{
                                        ml: 'auto',
                                        color: '#7c3aed',
                                        textTransform: 'none',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        px: 1.5,
                                        '&:hover': { background: 'rgba(109,40,217,0.08)' }
                                    }}
                                >
                                    Documentation
                                </Button>
                            )}
                        </Box>

                        {/* Gateway PHP-rendered preferences */}
                        {gateway.preferences_html && (
                            <Box
                                sx={{
                                    '& .form-group': { mb: 2 },
                                    '& label': {
                                        display: 'block',
                                        mb: '4px',
                                        color: colors.textSecondary,
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                    },
                                    '& .form-control, & input[type="text"], & input[type="email"], & input[type="number"]': {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: `1px solid ${colors.borderInput}`,
                                        borderRadius: '8px',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                        color: colors.text,
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'border-color 0.15s',
                                        fontFamily: 'inherit',
                                    },
                                    '& select': {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: `1px solid ${colors.borderInput}`,
                                        borderRadius: '8px',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                                        color: colors.text,
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                    },
                                    '& h3': {
                                        color: colors.text,
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        mb: 1.5,
                                        mt: 0,
                                    },
                                    '& .row': { display: 'flex', flexWrap: 'wrap', gap: '0 32px' },
                                    '& [class*="col-"]': { flex: '1 1 240px', minWidth: 0 },
                                    '& input[type="hidden"]': { display: 'none' },
                                }}
                                dangerouslySetInnerHTML={{ __html: gateway.preferences_html }}
                            />
                        )}
                    </Box>
                </Collapse>
            )}
        </>
    );
}
