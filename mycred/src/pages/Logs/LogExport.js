import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Collapse,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    Download as DownloadIcon,
    Info as InfoIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useLogsTheme } from './ThemeContext';

const escapeCsvValue = (value) => {
    const str = String(value ?? '');
    return `"${str.replace(/"/g, '""')}"`;
};

const downloadCsv = (rows, filename = 'mycred-logs.csv') => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return false;
    }

    const headers = Object.keys(rows[0]);
    const lines = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ];

    const blob = new Blob([`\uFEFF${lines.join('\n')}`], {
        type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
};

export const runLogsExport = async ({ initialData, filters, ids = [], format = 'formatted' }) => {
    const params = new URLSearchParams();
    params.append('action', 'mycred_export_logs_json');
    params.append('token', initialData.nonce);
    params.append('ctype', filters.ctype);
    params.append('s', filters.search || '');
    params.append('ref', filters.ref);
    params.append('time', filters.time);
    params.append('format', format);
    if (filters.user) params.append('user', filters.user);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    (ids || []).forEach((id) => params.append('ids[]', id));

    const response = await fetch(initialData.ajaxurl, {
        method: 'POST',
        body: params,
    });
    const result = await response.json();

    if (!result.success) {
        throw new Error(result.data || 'Export failed');
    }

    const rows = result.data?.rows || [];
    const filename = result.data?.filename || 'mycred-logs.csv';
    const downloaded = downloadCsv(rows, filename);

    if (!downloaded) {
        throw new Error('No log entries found to export');
    }

    return rows.length;
};

const LogExport = ({ show, onClose, filters, initialData, exportFormat = 'both' }) => {
    const { colors } = useLogsTheme();
    const [exporting, setExporting] = useState(false);

    const showRaw = exportFormat === 'both' || exportFormat === 'raw';
    const showFormatted = exportFormat === 'both' || exportFormat === 'formatted';

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const count = await runLogsExport({ initialData, filters, format });
            toast.success(`Exported ${count} log entries`);
            onClose?.();
        } catch (error) {
            toast.error(error.message || 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Collapse in={show}>
            <Box
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    background: colors.paper,
                    position: 'relative',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ color: colors.textPrimary, fontWeight: 700, fontSize: '18px' }}
                    >
                        Log Export
                    </Typography>
                    <InfoIcon fontSize="small" sx={{ color: colors.primary }} />
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ ml: 'auto', p: 0.5, color: colors.textMuted }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3, maxWidth: '600px', fontWeight: 400 }}>
                    Log entries are exported to a CSV file and depending on the number of entries selected, the process may take a few seconds.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {showFormatted && (
                        <Button
                            variant="contained"
                            disableElevation
                            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
                            onClick={() => handleExport('formatted')}
                            disabled={exporting}
                            sx={{
                                background: colors.primary,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 500,
                                '&:hover': { background: colors.primaryHover },
                            }}
                        >
                            {exporting ? 'Processing...' : 'All Log Entries (Formatted)'}
                        </Button>
                    )}
                    {showRaw && (
                        <Button
                            variant="outlined"
                            disableElevation
                            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
                            onClick={() => handleExport('raw')}
                            disabled={exporting}
                            sx={{
                                borderColor: colors.primary,
                                color: colors.primary,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 500,
                                bgcolor: colors.paper,
                                '&:hover': { borderColor: colors.primaryHover, background: colors.paperMuted },
                            }}
                        >
                            {exporting ? 'Processing...' : 'All Log Entries (Raw)'}
                        </Button>
                    )}
                </Box>
            </Box>
        </Collapse>
    );
};

export default LogExport;
