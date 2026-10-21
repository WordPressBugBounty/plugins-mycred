import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

export const AchievementTypeModal = ({
    open,
    onClose,
    onSave,
    editingItem = null,
    categories = [],
    loading = false
}) => {
    const { colors } = useAdminTheme();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [parent, setParent] = useState(0);

    useEffect(() => {
        if (editingItem) {
            setName(editingItem.name || '');
            setSlug(editingItem.slug || '');
            setDescription(editingItem.description || '');
            setParent(editingItem.parent || 0);
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setParent(0);
        }
    }, [editingItem, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({
            id: editingItem ? editingItem.id : null,
            name,
            slug,
            description,
            parent
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`,
                        boxShadow: '0 8px 32px rgba(45, 21, 114, 0.08)',
                        p: 1
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, pt: 1.5 }}>
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: '18px',
                        fontFamily: "'Figtree', sans-serif",
                        color: colors.textPrimary
                    }}
                >
                    {editingItem ? 'Edit Achievement Type' : 'Add New Achievement Type'}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '13px',
                        fontFamily: "'Figtree', sans-serif",
                        color: colors.textSecondary,
                        mt: 0.5
                    }}
                >
                    {editingItem ? 'Update the details for this achievement type.' : 'Create a new achievement type to organize your badges.'}
                </Typography>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1.5 }}>
                    {/* Name */}
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', fontFamily: "'Figtree', sans-serif", color: colors.textPrimary, mb: 0.5 }}>
                            Name *
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. Community Badges"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: "'Poppins', sans-serif"
                                }
                            }}
                        />
                    </Box>

                    {/* Slug */}
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', fontFamily: "'Figtree', sans-serif", color: colors.textPrimary, mb: 0.5 }}>
                            Slug
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. community-badges (auto-generated if empty)"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: "'Poppins', sans-serif"
                                }
                            }}
                        />
                    </Box>

                    {/* Parent */}
                    {categories.length > 0 && (
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '13px', fontFamily: "'Figtree', sans-serif", color: colors.textPrimary, mb: 0.5 }}>
                                Parent Category
                            </Typography>
                            <Select
                                fullWidth
                                size="small"
                                value={parent}
                                onChange={(e) => setParent(e.target.value)}
                                sx={{
                                    height: '38px',
                                    fontSize: '14px',
                                    fontFamily: "'Poppins', sans-serif",
                                    borderRadius: '6px',
                                }}
                            >
                                <MenuItem value={0} sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>None</MenuItem>
                                {categories.filter(c => !editingItem || c.id !== editingItem.id).map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    )}

                    {/* Description */}
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', fontFamily: "'Figtree', sans-serif", color: colors.textPrimary, mb: 0.5 }}>
                            Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter a brief description for this achievement type..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: "'Poppins', sans-serif"
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        sx={{
                            color: colors.textSecondary,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !name.trim()}
                        sx={{
                            bgcolor: `${colors.primary} !important`,
                            color: '#ffffff !important',
                            borderRadius: '6px',
                            px: 2.5,
                            py: 0.8,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            textTransform: 'none',
                            boxShadow: 'none'
                        }}
                    >
                        {loading ? 'Saving...' : editingItem ? 'Update Type' : 'Create Type'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default AchievementTypeModal;
