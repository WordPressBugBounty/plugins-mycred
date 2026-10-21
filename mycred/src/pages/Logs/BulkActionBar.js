import React, { useState, useLayoutEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    Fade,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Delete as TrashIcon,
    Close as CloseIcon,
    ArticleOutlined as FileAltIcon,
} from '@mui/icons-material';
import { useLogsTheme } from './ThemeContext';

const BulkActionBar = ({
    anchorRef,
    selected,
    onDelete,
    onClearSelection,
    exportEnabled,
    exportFormat = 'both',
    onExport,
}) => {
    const { colors } = useLogsTheme();
    const show = selected.length > 0;
    const [centerX, setCenterX] = useState(null);
    const [exportAnchor, setExportAnchor] = useState(null);

    const showRaw = exportFormat === 'both' || exportFormat === 'raw';
    const showFormatted = exportFormat === 'both' || exportFormat === 'formatted';
    const hasBothFormats = showRaw && showFormatted;

    useLayoutEffect(() => {
        if (!show) return undefined;

        const updatePosition = () => {
            const anchor = anchorRef?.current;
            if (!anchor) return;
            const rect = anchor.getBoundingClientRect();
            setCenterX(rect.left + rect.width / 2);
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [anchorRef, show, selected.length]);

    const handleExportClick = (event) => {
        if (hasBothFormats) {
            setExportAnchor(event.currentTarget);
            return;
        }
        onExport(showRaw ? 'raw' : 'formatted');
    };

    const handleExportSelect = (format) => {
        setExportAnchor(null);
        onExport(format);
    };

    return (
        <Fade in={show} unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    left: centerX ?? '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1300,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: show ? 'auto' : 'none',
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        height: '40px',
                        width: 'auto',
                        minWidth: '280px',
                        borderRadius: '20px',
                        background: colors.bulkBarBg,
                        color: colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: '12px',
                        boxShadow: colors.shadowBulk,
                        border: 'none',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={onClearSelection}
                            sx={{
                                color: colors.white,
                                p: 0.5,
                                '&:hover': { background: 'rgba(255,255,255,0.1)' },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: colors.white,
                                fontSize: '14px',
                                fontFamily: "'Figtree', sans-serif",
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {selected.length} items selected
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: '1px',
                                height: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                mx: 0.5,
                            }}
                        />

                        {exportEnabled && (
                            <>
                                <IconButton
                                    onClick={handleExportClick}
                                    title="Export selected"
                                    sx={{
                                        background: colors.bulkBarSecondary,
                                        width: '32px',
                                        height: '24px',
                                        borderRadius: '12px',
                                        color: colors.white,
                                        p: 0,
                                        '&:hover': { background: colors.bulkBarSecondaryHover },
                                    }}
                                >
                                    <FileAltIcon sx={{ fontSize: '14px' }} />
                                </IconButton>
                                <Menu
                                    anchorEl={exportAnchor}
                                    open={Boolean(exportAnchor)}
                                    onClose={() => setExportAnchor(null)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                minWidth: 140,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            },
                                        },
                                    }}
                                    MenuListProps={{
                                        dense: true,
                                        sx: { py: 0.5 },
                                    }}
                                >
                                    {showFormatted && (
                                        <MenuItem
                                            onClick={() => handleExportSelect('formatted')}
                                            sx={{ fontSize: '13px', minHeight: 32, py: 0.5, px: 1.5 }}
                                        >
                                            Export Formatted
                                        </MenuItem>
                                    )}
                                    {showRaw && (
                                        <MenuItem
                                            onClick={() => handleExportSelect('raw')}
                                            sx={{ fontSize: '13px', minHeight: 32, py: 0.5, px: 1.5 }}
                                        >
                                            Export Raw
                                        </MenuItem>
                                    )}
                                </Menu>
                            </>
                        )}

                        <IconButton
                            onClick={onDelete}
                            sx={{
                                background: colors.danger,
                                width: '32px',
                                height: '24px',
                                borderRadius: '12px',
                                color: colors.white,
                                p: 0,
                                '&:hover': { background: colors.dangerHover },
                            }}
                        >
                            <TrashIcon sx={{ fontSize: '14px' }} />
                        </IconButton>
                    </Box>
                </Paper>
            </Box>
        </Fade>
    );
};

export default BulkActionBar;
