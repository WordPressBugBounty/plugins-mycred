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
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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

export const BadgesTable = ({
    badges,
    loading,
    selected,
    onSelectAll,
    onSelectOne,
    onDeleteBadge,
    onRestoreBadge,
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

    const isAllSelected = badges.length > 0 && selected.length === badges.length;
    const isSomeSelected = selected.length > 0 && selected.length < badges.length;

    const showIcon = visibleColumns.icon !== false;
    const showRequirements = visibleColumns.requirements !== false;
    const showUsers = visibleColumns.users !== false;
    const showAchievementType = visibleColumns.achievement_type !== false;

    // Count visible columns for colSpan on empty state
    const colCount = 2 + (showIcon ? 1 : 0) + (showRequirements ? 1 : 0) + (showUsers ? 1 : 0) + (showAchievementType ? 1 : 0);

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
                                    onClick={(e) => onSelectAll({ target: { checked: !isAllSelected } })}
                                    colors={colors}
                                />
                            </TableCell>
                            <TableCell sx={{ ...headerCellSx }}>
                                Badge Name
                            </TableCell>
                            {showIcon && (
                                <TableCell sx={{ ...headerCellSx, width: 70 }}>
                                    Icon
                                </TableCell>
                            )}
                            {showRequirements && (
                                <TableCell sx={{ ...headerCellSx }}>
                                    Level Requirements
                                </TableCell>
                            )}
                            {showUsers && (
                                <TableCell sx={{ ...headerCellSx, width: 120 }}>
                                    Users Earned
                                </TableCell>
                            )}
                            {showAchievementType && (
                                <TableCell sx={{ ...headerCellSx, width: 170 }}>
                                    Achievement Type
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
                                    {showIcon && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '8px' }} />
                                        </TableCell>
                                    )}
                                    {showRequirements && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width="90%" height={32} sx={{ borderRadius: '6px' }} />
                                        </TableCell>
                                    )}
                                    {showUsers && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={75} height={22} sx={{ borderRadius: '12px' }} />
                                        </TableCell>
                                    )}
                                    {showAchievementType && (
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Skeleton variant="rectangular" width={110} height={22} sx={{ borderRadius: '4px' }} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : badges.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                                    <EmojiEventsIcon sx={{ fontSize: 40, color: colors.textMuted, opacity: 0.5, mb: 0.5 }} />
                                    <Typography sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                                        No Badges Found
                                    </Typography>
                                    <Typography sx={{ color: colors.textSecondary, fontSize: '13px', fontFamily: "'Figtree', sans-serif", mt: 0.25 }}>
                                        {activeTab === 'trash' ? 'Trash is empty.' : 'Create your first badge to reward users!'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            badges.map((badge) => {
                                const isItemSelected = selected.includes(badge.id);
                                return (
                                    <TableRow
                                        key={badge.id}
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
                                                    onSelectOne(badge.id);
                                                }}
                                                colors={colors}
                                            />
                                        </TableCell>

                                        {/* Badge Name & Action Links */}
                                        <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                            <Link
                                                href={badge.edit_url}
                                                underline="none"
                                                sx={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    fontFamily: "'Figtree', sans-serif",
                                                    color: colors.textPrimary,
                                                    '&:hover': { color: colors.primary }
                                                }}
                                            >
                                                {badge.title}
                                            </Link>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 0.25 }}>
                                                {activeTab !== 'trash' ? (
                                                    <>
                                                        <Link
                                                             href={badge.edit_url}
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
                                                                 onDeleteBadge(badge.id);
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
                                                         {badge.view_url && (
                                                             <>
                                                                 <Typography component="span" sx={{ fontSize: '10px', color: '#d1c4e9' }}>•</Typography>
                                                                 <Link
                                                                     href={badge.view_url}
                                                                     target="_blank"
                                                                     rel="noopener noreferrer"
                                                                     underline="none"
                                                                     sx={{
                                                                         fontSize: '12px',
                                                                         fontWeight: 500,
                                                                         fontFamily: "'Figtree', sans-serif",
                                                                         color: colors.textSecondary,
                                                                         '&:hover': { color: colors.primary }
                                                                     }}
                                                                 >
                                                                     View
                                                                 </Link>
                                                             </>
                                                         )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link
                                                            component="button"
                                                            underline="none"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRestoreBadge(badge.id);
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
                                                                onDeleteBadge(badge.id, true);
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

                                        {/* Badge Image Icon */}
                                        {showIcon && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Box
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, #f0eaff 0%, #e5dcff 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: `1px solid ${colors.border}`,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {badge.image_url ? (
                                                        <Box
                                                            component="img"
                                                            src={badge.image_url}
                                                            alt={badge.title}
                                                            sx={{ width: 26, height: 26, objectFit: 'contain' }}
                                                        />
                                                    ) : badge.image_html ? (
                                                        <Box
                                                            dangerouslySetInnerHTML={{ __html: badge.image_html }}
                                                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '& img': { width: 26, height: 26, objectFit: 'contain' } }}
                                                        />
                                                    ) : (
                                                        <EmojiEventsIcon sx={{ color: colors.primary, fontSize: 20 }} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}

                                        {/* Requirements */}
                                        {showRequirements && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: colors.bg,
                                                        borderRadius: '6px',
                                                        p: '5px 10px',
                                                        border: '1px solid #ebe5f7',
                                                        fontSize: '13px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        lineHeight: 1.4,
                                                        color: colors.textSecondary
                                                    }}
                                                >
                                                    {badge.requirements_html ? (
                                                        <Box
                                                            dangerouslySetInnerHTML={{ __html: badge.requirements_html }}
                                                            sx={{
                                                                '& ul': { m: 0, pl: 1.5 },
                                                                '& li': { listStyleType: 'disc', fontSize: '12px', fontFamily: "'Figtree', sans-serif" }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: colors.textMuted, fontSize: '12px', fontFamily: "'Figtree', sans-serif" }}>
                                                            {badge.manual_badge ? 'This badge is manually awarded.' : 'No requirement set.'}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}

                                        {/* Users Earned */}
                                        {showUsers && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Chip
                                                    icon={<PeopleOutlineIcon sx={{ fontSize: '14px !important', color: `${colors.textPrimary} !important` }} />}
                                                    label={`${badge.earnedby || 0} Users`}
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

                                        {/* Achievement Type */}
                                        {showAchievementType && (
                                            <TableCell sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.border}` }}>
                                                <Chip
                                                    label={badge.category_name || 'No Achievement Type'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: badge.category_name ? '#f3effe' : '#f4f4f6',
                                                        color: badge.category_name ? colors.primary : colors.textMuted,
                                                        border: `1px solid ${badge.category_name ? '#e0d6fd' : '#e5e5ea'}`,
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        fontFamily: "'Figtree', sans-serif",
                                                        height: '22px',
                                                        borderRadius: '4px'
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
