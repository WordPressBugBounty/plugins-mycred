import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import { useLogsTheme } from './ThemeContext';

const DeleteModal = ({ open, count, onClose, onConfirm }) => {
    const { colors } = useLogsTheme();
    const isBulk = count > 1;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: colors.shadowModal,
                    p: 1,
                    bgcolor: colors.paper,
                }
            }}
        >
            <DialogTitle sx={{
                pt: 3,
                pb: 1,
                fontFamily: "'Vollkorn', serif",
                fontSize: '24px',
                fontWeight: 700,
                color: colors.textPrimary,
            }}>
                {isBulk ? `Delete ${count} Entries` : 'Delete Entry'}
            </DialogTitle>

            <DialogContent sx={{ pb: 1 }}>
                <Typography sx={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.6, fontFamily: "'Figtree', sans-serif" }}>
                    {isBulk
                        ? `Are you sure you want to delete ${count} entries? This action cannot be undone.`
                        : 'Are you sure you want to delete this log entry? This action cannot be undone.'
                    }
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'flex-end' }}>
                <Button
                    onClick={onClose}
                    sx={{
                        px: 4,
                        height: '46px',
                        color: colors.textPrimary,
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '15px',
                        fontFamily: "'Figtree', sans-serif",
                        border: `1.5px solid ${colors.border}`,
                        '&:hover': { background: colors.hover, borderColor: colors.borderInput },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        px: 4,
                        height: '46px',
                        background: colors.danger,
                        '&:hover': { background: colors.dangerHover },
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '15px',
                        fontFamily: "'Figtree', sans-serif",
                        boxShadow: 'none',
                    }}
                >
                    {isBulk ? 'Delete Entries' : 'Delete Entry'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteModal;
