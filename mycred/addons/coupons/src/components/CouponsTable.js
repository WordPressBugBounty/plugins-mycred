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
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';

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

export const CouponsTable = ({
    coupons,
    loading,
    selected,
    onSelectAll,
    onSelectOne,
    onDeleteCoupon,
    onRestoreCoupon,
    page,
    totalPages,
    totalItems,
    onPageChange,
    activeTab,
    visibleColumns = {},
    perPage = 10,
    onPerPageChange
}) => {
    const { colors } = useAdminTheme();

    const isAllSelected = coupons.length > 0 && selected.length === coupons.length;
    const isSomeSelected = selected.length > 0 && selected.length < coupons.length;

    const showValue = visibleColumns.value !== false;
    const showUsage = visibleColumns.usage !== false;
    const showLimits = visibleColumns.limits !== false;
    const showExpires = visibleColumns.expires !== false;
    const showPointType = visibleColumns.point_type !== false;

    // Count visible columns for colSpan on empty state
    const colCount = 2 + (showValue ? 1 : 0) + (showUsage ? 1 : 0) + (showLimits ? 1 : 0) + (showExpires ? 1 : 0) + (showPointType ? 1 : 0);

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
                <Table size="small" sx={{ minWidth: 650 }}>
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
                                Coupon Code
                            </TableCell>
                            {showValue && (
                                <TableCell sx={{ ...headerCellSx, width: 120 }}>
                                    Value
                                </TableCell>
                            )}
                            {showUsage && (
                                <TableCell sx={{ ...headerCellSx, width: 110 }}>
                                    Used
                                </TableCell>
                            )}
                            {showLimits && (
                                <TableCell sx={{ ...headerCellSx, width: 170 }}>
                                    Limits
                                </TableCell>
                            )}
                            {showExpires && (
                                <TableCell sx={{ ...headerCellSx, width: 160 }}>
                                    Expires
                                </TableCell>
                            )}
                            {showPointType && (
                                <TableCell sx={{ ...headerCellSx, width: 150 }}>
                                    Point Type
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
                                    {showValue && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: '4px' }} />
                                        </TableCell>
                                    )}
                                    {showUsage && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="text" width="50%" height={20} />
                                        </TableCell>
                                    )}
                                    {showLimits && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="text" width="80%" height={20} />
                                        </TableCell>
                                    )}
                                    {showExpires && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: '4px' }} />
                                        </TableCell>
                                    )}
                                    {showPointType && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={100} height={22} sx={{ borderRadius: '4px' }} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                                    <ConfirmationNumberIcon sx={{ fontSize: 40, color: colors.textMuted, opacity: 0.5, mb: 0.5 }} />
                                    <Typography sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                                        No Coupons Found
                                    </Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '13px', fontFamily: "'Figtree', sans-serif", mt: 0.25 }}>
                                        {activeTab === 'trash' ? 'Trash is empty.' : 'Create your first coupon code to reward users!'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => {
                                const isItemSelected = selected.includes(coupon.id);
                                return (
                                    <TableRow
                                        key={coupon.id}
                                        selected={isItemSelected}
                                        sx={{
                                            height: 64,
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
                                                    onSelectOne(coupon.id);
                                                }}
                                                colors={colors}
                                            />
                                        </TableCell>

                                        {/* Coupon Code & Action Links */}
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Link
                                                href={coupon.edit_url}
                                                underline="none"
                                                sx={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    fontFamily: "'Figtree', sans-serif",
                                                    color: colors.textPrimary,
                                                    '&:hover': { color: colors.primary }
                                                }}
                                            >
                                                {coupon.code}
                                            </Link>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                                                {activeTab !== 'trash' ? (
                                                    <>
                                                        <Link
                                                            href={coupon.edit_url}
                                                            underline="none"
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteCoupon(coupon.id);
                                                            }}
                                                            sx={{
                                                                fontSize: '12px',
                                                                fontWeight: 500,
                                                                fontFamily: "'Figtree', sans-serif",
                                                                color: colors.textSecondary,
                                                                '&:hover': { color: colors.danger }
                                                            }}
                                                        >
                                                            Trash
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link
                                                            component="button"
                                                            underline="none"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRestoreCoupon(coupon.id);
                                                            }}
                                                            sx={{
                                                                fontSize: '12px',
                                                                fontWeight: 500,
                                                                fontFamily: "'Figtree', sans-serif",
                                                                color: colors.primary,
                                                                '&:hover': { color: colors.primaryHover }
                                                            }}
                                                        >
                                                            Restore
                                                        </Link>
                                                        <Typography component="span" sx={{ fontSize: '10px', color: '#d1c4e9' }}>•</Typography>
                                                        <Link
                                                            component="button"
                                                            underline="none"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteCoupon(coupon.id, true);
                                                            }}
                                                            sx={{
                                                                fontSize: '12px',
                                                                fontWeight: 500,
                                                                fontFamily: "'Figtree', sans-serif",
                                                                color: colors.danger,
                                                                '&:hover': { color: colors.dangerHover }
                                                            }}
                                                        >
                                                            Delete Permanently
                                                        </Link>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* Formatted Value */}
                                        {showValue && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Chip
                                                    label={coupon.formatted_value || coupon.value}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#f3effe',
                                                        color: colors.primary,
                                                        border: '1px solid #e0d6fd',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        height: '24px',
                                                        borderRadius: '6px'
                                                    }}
                                                />
                                            </TableCell>
                                        )}

                                        {/* Used */}
                                        {showUsage && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                {coupon.used > 0 ? (
                                                    <Link
                                                        href={coupon.usage_url}
                                                        underline="none"
                                                        sx={{
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                            fontFamily: "'Figtree', sans-serif",
                                                            color: colors.primary,
                                                            '&:hover': { textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        {coupon.used} {coupon.used === 1 ? 'time' : 'times'}
                                                    </Link>
                                                ) : (
                                                    <Typography sx={{ fontSize: '14px', color: colors.textMuted, fontFamily: "'Figtree', sans-serif" }}>
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        )}

                                        {/* Limits */}
                                        {showLimits && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Typography sx={{ fontSize: '13px', fontFamily: "'Figtree', sans-serif", color: colors.textSecondary }}>
                                                    Total: <strong>{coupon.max_global || 0}</strong> • User: <strong>{coupon.max_user || 0}</strong>
                                                </Typography>
                                            </TableCell>
                                        )}

                                        {/* Expires */}
                                        {showExpires && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Chip
                                                        label={coupon.expires_label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: coupon.expires_status === 'expired' ? '#fee2e2' : coupon.expires_status === 'active' ? '#ecfdf5' : '#f4f4f6',
                                                            color: coupon.expires_status === 'expired' ? colors.danger : coupon.expires_status === 'active' ? '#059669' : colors.textMuted,
                                                            fontWeight: 600,
                                                            fontSize: '11.5px',
                                                            fontFamily: "'Figtree', sans-serif",
                                                            height: '20px',
                                                            borderRadius: '4px',
                                                            width: 'fit-content'
                                                        }}
                                                    />
                                                    {coupon.expires_date && (
                                                        <Typography sx={{ fontSize: '11px', color: colors.textMuted, fontFamily: "'Figtree', sans-serif", mt: 0.25 }}>
                                                            {coupon.expires_date}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}

                                        {/* Point Type */}
                                        {showPointType && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Chip
                                                    label={coupon.point_type_name || 'Standard'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: colors.paperMuted,
                                                        color: colors.textPrimary,
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        height: '22px',
                                                        borderRadius: '4px',
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

export default CouponsTable;
