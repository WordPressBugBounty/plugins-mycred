import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Grid
} from '@mui/material';
import {
    Close as CloseIcon,
    DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useLogsTheme } from './ThemeContext';

const LogEditModal = ({ open, log, onClose, onSave, onDelete, references }) => {
    const { colors } = useLogsTheme();
    const [formData, setFormData] = useState({
        amount: '',
        ref: '',
        entry: ''
    });

    useEffect(() => {
        if (log && open) {
            setFormData({
                amount: log.amount || '',
                ref: log.ref || 'all',
                entry: log.entry || ''
            });
        }
    }, [log, open]);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = () => {
        onSave(log.id, formData);
    };

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: colors.paper,
            color: colors.textPrimary,
            '& fieldset': { borderColor: colors.border },
            '&:hover fieldset': { borderColor: colors.primary },
        },
    };

    if (!log) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: colors.shadowModal,
                    bgcolor: colors.paper,
                }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: "'Vollkorn', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: colors.textPrimary,
            }}>
                Edit Log Entry
                <IconButton onClick={onClose} size="small" sx={{ color: colors.textSecondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                            User
                        </Typography>
                        <Typography sx={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 500 }}>
                            {log.username}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                            Date
                        </Typography>
                        <Typography sx={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 500 }}>
                            {log.date}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography sx={{ color: colors.textSecondary, fontSize: '12px', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                            Original Entry
                        </Typography>
                        <Typography sx={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 500 }}>
                            {log.entry || 'N/A'}
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 600, mb: 1 }}>
                            Points
                        </Typography>
                        <TextField
                            fullWidth
                            value={formData.amount}
                            onChange={handleChange('amount')}
                            variant="outlined"
                            size="small"
                            sx={inputSx}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 600, mb: 1 }}>
                            Reference
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={formData.ref}
                            onChange={handleChange('ref')}
                            variant="outlined"
                            size="small"
                            sx={inputSx}
                        >
                            {Object.entries(references || {}).map(([key, label]) => (
                                <MenuItem key={key} value={key}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Typography sx={{ color: colors.textPrimary, fontSize: '14px', fontWeight: 600, mb: 1 }}>
                    Log Entry
                </Typography>
                <TextField
                    fullWidth
                    value={formData.entry}
                    onChange={handleChange('entry')}
                    variant="outlined"
                    size="small"
                    sx={inputSx}
                />
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 1, justifyContent: 'space-between' }}>
                <Button
                    onClick={() => onDelete(log)}
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    sx={{
                        height: '44px',
                        background: colors.dangerBg,
                        color: colors.danger,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '8px',
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': { background: colors.dangerBgHover, boxShadow: 'none' },
                    }}
                >
                    Delete Entry
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        height: '44px',
                        px: 4,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: colors.primary,
                        '&:hover': { backgroundColor: colors.primaryHover },
                    }}
                >
                    Update Entry
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LogEditModal;
