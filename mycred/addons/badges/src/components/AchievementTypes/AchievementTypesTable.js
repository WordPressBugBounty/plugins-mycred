import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Link,
    Skeleton,
    Select,
    MenuItem,
    IconButton,
    Button
} from '@mui/material';
import {
    ChevronLeft as LeftIcon,
    ChevronRight as RightIcon,
    KeyboardDoubleArrowLeft as DoubleLeftIcon,
    KeyboardDoubleArrowRight as DoubleRightIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import CategoryIcon from '@mui/icons-material/Category';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

// ─── Round Checkbox (matching Logs page) ───
const getCheckboxIcons = (colors) => ({
    unchecked: (
        <Box
            sx={{
                width: 16,
                height: 16,
                border: `1.5px solid ${colors.borderInput}`,
                borderRadius: '8px',
                background: colors.paper,
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        />
    ),
    checked: (
        <Box
            sx={{
                width: 16,
                height: 16,
                bgcolor: colors.configure || colors.primary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        >
            <CheckIcon sx={{ color: '#ffffff', fontSize: '12px', strokeWidth: 3, pointerEvents: 'none' }} />
        </Box>
    ),
    indeterminate: (
        <Box
            sx={{
                width: 16,
                height: 16,
                bgcolor: colors.configure || colors.primary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        >
            <Box sx={{ width: 8, height: 2, bgcolor: '#ffffff', borderRadius: '1px', pointerEvents: 'none' }} />
        </Box>
    ),
});

const RoundCheckbox = ({ checked, indeterminate, onClick, colors }) => {
    const icons = getCheckboxIcons(colors);

    return (
        <Box
            component="button"
            type="button"
            role="checkbox"
            aria-checked={indeterminate ? 'mixed' : checked}
            onClick={onClick}
            sx={{
                p: 0,
                m: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                flexShrink: 0,
                verticalAlign: 'middle',
                outline: 'none',
                '&:focus-visible': {
                    outline: `2px solid ${colors.primary}`,
                    outlineOffset: 2,
                    borderRadius: '8px',
                },
            }}
        >
            {indeterminate ? icons.indeterminate : checked ? icons.checked : icons.unchecked}
        </Box>
    );
};

export const AchievementTypesTable = ({
    items,
    loading,
    selected,
    onSelectAll,
    onSelectOne,
    onEditItem,
    onDeleteItem,
    page,
    totalPages,
    totalItems,
    onPageChange,
    visibleColumns = {},
    perPage = 10,
    onPerPageChange
}) => {
    const { colors } = useAdminTheme();

    const isAllSelected = items.length > 0 && selected.length === items.length;
    const isSomeSelected = selected.length > 0 && selected.length < items.length;

    const showSlug = visibleColumns.slug !== false;
    const showDescription = visibleColumns.description !== false;
    const showCount = visibleColumns.count !== false;

    // Count visible columns for colSpan on empty state
    const colCount = 2 + (showSlug ? 1 : 0) + (showDescription ? 1 : 0) + (showCount ? 1 : 0);

    const headerCellSx = {
        color: colors.tableHeaderText,
        fontWeight: 600,
        fontSize: '12px',
        fontFamily: "'Figtree', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `1px solid ${colors.border}`,
        py: 1.5,
        px: 2,
    };

    // Pagination helpers
    const startEntry = totalItems === 0 ? 0 : ((page - 1) * perPage) + 1;
    const endEntry = Math.min(page * perPage, totalItems);

    const renderPaginationButtons = () => {
        const pages = [];
        const tp = totalPages;

        if (tp <= 7) {
            for (let i = 1; i <= tp; i++) pages.push(i);
        } else {
            pages.push(1, 2, 3);
            if (page > 4) pages.push('...');
            for (let i = Math.max(4, page - 1); i <= Math.min(tp - 2, page + 1); i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (page < tp - 3) pages.push('…');
            if (!pages.includes(tp - 1)) pages.push(tp - 1);
            if (!pages.includes(tp)) pages.push(tp);
        }

        return pages.map((p, idx) => {
            if (p === '...' || p === '…') {
                return <Typography key={`dots-${idx}`} sx={{ px: 0.5, color: colors.textMuted, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>…</Typography>;
            }
            const isActive = page === p;
            return (
                <Button
                    key={p}
                    onClick={() => onPageChange(null, p)}
                    sx={{
                        minWidth: 36,
                        height: 32,
                        p: 0,
                        borderRadius: '4px',
                        color: isActive ? colors.primary : colors.textSecondary,
                        background: isActive ? (colors.filterActiveBg || colors.primaryLight) : 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            background: isActive ? (colors.filterActiveBg || colors.primaryLight) : 'transparent',
                            color: isActive ? colors.primary : colors.textSecondary,
                            boxShadow: 'none',
                        },
                        fontSize: '14px',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: isActive ? 500 : 400,
                    }}
                >
                    {p}
                </Button>
            );
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <TableContainer>
                <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead sx={{ bgcolor: '#fcfbfe' }}>
                        <TableRow sx={{ height: '44px' }}>
                            <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${colors.border}`, pl: 2.5, pr: 1, width: 48, py: 1.5 }}>
                                <RoundCheckbox
                                    checked={isAllSelected}
                                    indeterminate={isSomeSelected}
                                    onClick={() => onSelectAll({ target: { checked: !isAllSelected } })}
                                    colors={colors}
                                />
                            </TableCell>
                            <TableCell sx={{ ...headerCellSx }}>
                                Name
                            </TableCell>
                            {showSlug && (
                                <TableCell sx={{ ...headerCellSx, width: 160 }}>
                                    Slug
                                </TableCell>
                            )}
                            {showDescription && (
                                <TableCell sx={{ ...headerCellSx }}>
                                    Description
                                </TableCell>
                            )}
                            {showCount && (
                                <TableCell sx={{ ...headerCellSx, width: 140 }}>
                                    Assigned Badges
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            // Skeleton Row Loading State
                            [1, 2, 3, 4, 5].map((index) => (
                                <TableRow key={index}>
                                    <TableCell padding="checkbox" sx={{ pl: 2.5, pr: 1, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                                        <Skeleton variant="circular" width={16} height={16} />
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                        <Skeleton variant="text" width="60%" height={20} />
                                        <Skeleton variant="text" width="30%" height={14} />
                                    </TableCell>
                                    {showSlug && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={90} height={22} sx={{ borderRadius: '4px' }} />
                                        </TableCell>
                                    )}
                                    {showDescription && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="text" width="90%" height={20} />
                                        </TableCell>
                                    )}
                                    {showCount && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={75} height={22} sx={{ borderRadius: '12px' }} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                                    <CategoryIcon sx={{ fontSize: 40, color: colors.textMuted, opacity: 0.5, mb: 0.5 }} />
                                    <Typography sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                                        No Achievement Types Found
                                    </Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '13px', fontFamily: "'Figtree', sans-serif", mt: 0.25 }}>
                                        Create your first achievement type to categorize badges!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => {
                                const isItemSelected = selected.includes(item.id);
                                return (
                                    <TableRow
                                        key={item.id}
                                        selected={isItemSelected}
                                        sx={{
                                            height: 60,
                                            '&:hover': {
                                                bgcolor: '#faf9fe !important'
                                            },
                                            '&.Mui-selected': {
                                                bgcolor: `${colors.primaryLight}30 !important`
                                            }
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <TableCell padding="checkbox" sx={{ pl: 2.5, pr: 1, py: 1.5, borderBottom: `1px solid ${colors.border}`, verticalAlign: 'middle' }}>
                                            <RoundCheckbox
                                                checked={isItemSelected}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectOne(item.id);
                                                }}
                                                colors={colors}
                                            />
                                        </TableCell>

                                        {/* Name & Actions */}
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Typography
                                                onClick={() => onEditItem(item)}
                                                sx={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    fontFamily: "'Figtree', sans-serif",
                                                    color: colors.textPrimary,
                                                    cursor: 'pointer',
                                                    '&:hover': { color: colors.primary }
                                                }}
                                            >
                                                {item.name}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                                                <Link
                                                    component="button"
                                                    underline="none"
                                                    onClick={() => onEditItem(item)}
                                                    sx={{
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        fontFamily: "'Figtree', sans-serif",
                                                        color: colors.textSecondary,
                                                        '&:hover': { color: colors.primary }
                                                    }}
                                                >
                                                    Edit
                                                </Link>
                                                <Typography component="span" sx={{ fontSize: '10px', color: '#d1c4e9' }}>•</Typography>
                                                <Link
                                                    component="button"
                                                    underline="none"
                                                    onClick={() => onDeleteItem(item.id)}
                                                    sx={{
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        fontFamily: "'Figtree', sans-serif",
                                                        color: colors.textSecondary,
                                                        '&:hover': { color: colors.danger }
                                                    }}
                                                >
                                                    Delete
                                                </Link>
                                            </Box>
                                        </TableCell>

                                        {/* Slug */}
                                        {showSlug && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Chip
                                                    label={item.slug}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#f3effe',
                                                        color: colors.primary,
                                                        border: '1px solid #e0d6fd',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        height: '22px',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </TableCell>
                                        )}

                                        {/* Description */}
                                        {showDescription && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: '13px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        color: item.description ? colors.textSecondary : colors.textMuted,
                                                        fontStyle: item.description ? 'normal' : 'italic'
                                                    }}
                                                >
                                                    {item.description || 'No description'}
                                                </Typography>
                                            </TableCell>
                                        )}

                                        {/* Assigned Badges Count */}
                                        {showCount && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Chip
                                                    icon={<EmojiEventsIcon sx={{ fontSize: '14px !important', color: `${colors.primary} !important` }} />}
                                                    label={`${item.count || 0} Badges`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: colors.paperMuted,
                                                        color: colors.textPrimary,
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        height: '22px',
                                                        borderRadius: '12px',
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer — Matching Logs Page Style */}
            <Box
                sx={{
                    pt: 3,
                    pb: 2,
                    px: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {/* Rows per page */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{
                        color: colors.textSecondary,
                        fontSize: '14px',
                        fontFamily: "'Figtree', sans-serif",
                    }}>
                        Rows per page
                    </Typography>
                    <Select
                        value={perPage}
                        onChange={(e) => onPerPageChange(parseInt(e.target.value, 10))}
                        size="small"
                        sx={{
                            height: '40px',
                            minWidth: '70px',
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '14px',
                            background: colors.paper,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderInput },
                        }}
                    >
                        {[10, 25, 50, 100].map(val => <MenuItem key={val} value={val} sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}>{val}</MenuItem>)}
                    </Select>
                </Box>

                {/* Pagination Buttons */}
                {totalPages > 1 && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0,
                        border: `1px solid ${colors.borderInput}`,
                        borderRadius: '8px',
                        p: '4px',
                        background: colors.paper,
                        height: '40px',
                        boxSizing: 'border-box',
                        minWidth: 220,
                        justifyContent: 'center',
                    }}>
                        {/* First Page */}
                        <IconButton
                            disabled={page === 1}
                            onClick={() => onPageChange(null, 1)}
                            sx={{
                                p: 0.5,
                                borderRadius: '4px',
                                color: colors.textSecondary,
                                width: 36,
                                height: 32,
                                '&:hover': { bgcolor: 'transparent', color: colors.textSecondary },
                            }}
                        >
                            <DoubleLeftIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                        {/* Prev Page */}
                        <IconButton
                            disabled={page === 1}
                            onClick={() => onPageChange(null, page - 1)}
                            sx={{
                                p: 0.5,
                                borderRadius: '4px',
                                color: colors.textSecondary,
                                width: 36,
                                height: 32,
                                '&:hover': { bgcolor: 'transparent', color: colors.textSecondary },
                            }}
                        >
                            <LeftIcon sx={{ fontSize: '18px' }} />
                        </IconButton>

                        {renderPaginationButtons()}

                        {/* Next Page */}
                        <IconButton
                            disabled={page === totalPages}
                            onClick={() => onPageChange(null, page + 1)}
                            sx={{
                                p: 0.5,
                                borderRadius: '4px',
                                color: colors.textSecondary,
                                width: 36,
                                height: 32,
                                '&:hover': { bgcolor: 'transparent', color: colors.textSecondary },
                            }}
                        >
                            <RightIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                        {/* Last Page */}
                        <IconButton
                            disabled={page === totalPages}
                            onClick={() => onPageChange(null, totalPages)}
                            sx={{
                                p: 0.5,
                                borderRadius: '4px',
                                color: colors.textSecondary,
                                width: 36,
                                height: 32,
                                '&:hover': { bgcolor: 'transparent', color: colors.textSecondary },
                            }}
                        >
                            <DoubleRightIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                    </Box>
                )}

                {/* Entries Count */}
                <Typography sx={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    fontFamily: "'Figtree', sans-serif",
                }}>
                    {startEntry}-{endEntry} of {totalItems} entries
                </Typography>
            </Box>
        </Box>
    );
};

export default AchievementTypesTable;
