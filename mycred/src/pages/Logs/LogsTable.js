import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Typography,
    Box,
    IconButton,
    Button,
    Select,
    MenuItem,
    Menu,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    MoreHoriz as MoreIcon,
    ChevronLeft as LeftIcon,
    ChevronRight as RightIcon,
    KeyboardDoubleArrowLeft as DoubleLeftIcon,
    KeyboardDoubleArrowRight as DoubleRightIcon,
    Check as CheckIcon,
    ArrowDownward as ArrowDownIcon,
    ArrowUpward as ArrowUpIcon,
    UnfoldMore as SortIcon,
    PersonSearch as FilterIcon,
    EditOutlined as EditIcon,
    DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import BulkActionBar from './BulkActionBar';
import { useLogsTheme } from './ThemeContext';

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
                bgcolor: colors.configure,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        >
            <CheckIcon sx={{ color: colors.white, fontSize: '12px', strokeWidth: 3, pointerEvents: 'none' }} />
        </Box>
    ),
    indeterminate: (
        <Box
            sx={{
                width: 16,
                height: 16,
                bgcolor: colors.configure,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        >
            <CheckIcon sx={{ color: colors.white, fontSize: '12px', strokeWidth: 3, pointerEvents: 'none' }} />
        </Box>
    ),
});

const LogRoundCheckbox = ({ checked, indeterminate, onClick, colors }) => {
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

const formatLoyaltyValue = (column, value, colors) => {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (column.key === 'bill_amount') {
        const amount = Number(value);
        return Number.isFinite(amount) && amount > 0 ? `$${amount.toFixed(2)}` : '—';
    }

    if (column.key === 'channel') {
        return String(value).replace(/-/g, ' ');
    }

    if (column.key === 'status') {
        const label = String(value);
        return (
            <Chip
                label={label}
                size="small"
                sx={{
                    bgcolor: label === 'successful' ? 'rgba(34, 197, 94, 0.12)' : colors.paperMuted,
                    color: label === 'successful' ? '#16a34a' : colors.textSecondary,
                    fontWeight: 600,
                    fontSize: '12px',
                    height: 24,
                }}
            />
        );
    }

    return String(value);
};

const formatLogAmount = (log) => {
    if (log.formatted_amount) {
        return log.formatted_amount;
    }

    const formatted = String(log.amount);
    if (Number(log.amount) > 0 && !formatted.startsWith('+')) {
        return `+${formatted}`;
    }
    return formatted;
};

const renderColumnCell = (column, log, colors) => {
    if (column.group === 'loyalty') {
        const value = log.loyalty?.[column.key];
        const formatted = formatLoyaltyValue(column, value, colors);

        return (
            <Typography sx={{ color: colors.textPrimary, fontWeight: 500, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                {formatted}
            </Typography>
        );
    }

    switch (column.key) {
        case 'id':
            return (
                <Typography sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                    #{log.id}
                </Typography>
            );
        case 'user_id':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 28,
                            height: 28,
                            fontSize: '12px',
                            fontWeight: 600,
                            background: colors.paperMuted,
                            color: colors.textPrimary,
                            fontFamily: "'Figtree', sans-serif",
                        }}
                    >
                        {log.username.split(' ').map((name) => name[0]).join('').toUpperCase().substring(0, 2)}
                    </Avatar>
                    <Typography sx={{ color: colors.textPrimary, fontWeight: 500, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                        {log.username}
                    </Typography>
                </Box>
            );
        case 'ref':
            return (
                <Typography sx={{ color: colors.textPrimary, fontWeight: 500, fontSize: '14px', fontFamily: "'Figtree', sans-serif" }}>
                    {log.reference}
                </Typography>
            );
        case 'creds':
            return (
                <Typography sx={{
                    color: colors.textPrimary,
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: "'Figtree', sans-serif",
                }}>
                    {formatLogAmount(log)}
                </Typography>
            );
        case 'entry':
            return (
                <Typography
                    component="div"
                    sx={{
                        color: colors.textPrimary,
                        fontWeight: 500,
                        fontSize: '14px',
                        fontFamily: "'Figtree', sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        '& a': {
                            color: colors.configure,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        },
                    }}
                    dangerouslySetInnerHTML={{ __html: log.entry || '' }}
                />
            );
        case 'time':
            return (
                <Typography sx={{ color: colors.textSecondary, fontSize: '14px', fontFamily: "'Figtree', sans-serif", fontWeight: 400 }}>
                    {log.date}
                </Typography>
            );
        default:
            return null;
    }
};

const LogsTable = ({
    logs,
    refreshing = false,
    selected,
    onSelect,
    pagination,
    onPaginationChange,
    onDelete,
    exportEnabled,
    exportFormat,
    onExport,
    onFilterByUser,
    onEdit,
    sort,
    onSortChange,
    showExpiry = false,
    allColumns = [],
    visibleColumns = [],
}) => {
    const { colors } = useLogsTheme();
    const cardRef = useRef(null);
    const tableScrollRef = useRef(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const activeColumns = allColumns.filter((column) => visibleColumns.includes(column.key));
    const tableColSpan = activeColumns.length + 2 + (showExpiry ? 1 : 0);

    // Keep actions column width fixed so overflow detection never feeds back into layout
    // (page-1 long entries used to flip hasOverflow → tableLayout/width → shake).
    const ACTIONS_COL_WIDTH = 96;

    const syncTableScroll = useCallback(() => {
        const el = tableScrollRef.current;
        if (!el) return;

        const max = el.scrollWidth - el.clientWidth;
        const left = el.scrollLeft;

        // Hysteresis: only flip overflow when clearly over/under the edge.
        setHasOverflow((prev) => {
            if (!prev && max > 8) return true;
            if (prev && max <= 2) return false;
            return prev;
        });
        setCanScrollLeft((prev) => {
            const next = max > 8 && left > 2;
            return prev === next ? prev : next;
        });
        setCanScrollRight((prev) => {
            const next = max > 8 && left < max - 2;
            return prev === next ? prev : next;
        });
    }, []);

    const scrollTableBy = useCallback((delta) => {
        const el = tableScrollRef.current;
        if (!el) return;
        el.scrollBy({ left: delta, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const el = tableScrollRef.current;
        if (!el) return undefined;

        syncTableScroll();
        el.addEventListener('scroll', syncTableScroll, { passive: true });
        window.addEventListener('resize', syncTableScroll);

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(syncTableScroll);
            resizeObserver.observe(el);
            if (el.firstElementChild) {
                resizeObserver.observe(el.firstElementChild);
            }
        }

        return () => {
            el.removeEventListener('scroll', syncTableScroll);
            window.removeEventListener('resize', syncTableScroll);
            resizeObserver?.disconnect();
        };
    }, [syncTableScroll, activeColumns.length, showExpiry, logs.length, visibleColumns]);

    const handleSelectOne = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        onSelect(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [activeRow, setActiveRow] = React.useState(null);
    const openMenu = Boolean(anchorEl);

    const handleActionClick = (event, log) => {
        setAnchorEl(event.currentTarget);
        setActiveRow(log);
    };

    const handleActionClose = () => {
        setAnchorEl(null);
        setActiveRow(null);
    };

    const handleFilterByUser = () => {
        onFilterByUser(activeRow.user_id, activeRow.username);
        handleActionClose();
    };

    const handleEditCall = () => {
        onEdit(activeRow);
        handleActionClose();
    };

    const handleDeleteCall = () => {
        onDelete([activeRow.id]);
        handleActionClose();
    };

    const handleSelectAllClick = () => {
        if (logs.length > 0 && selected.length === logs.length) {
            onSelect([]);
            return;
        }
        onSelect(logs.map((entry) => entry.id));
    };

    const renderSortIcon = (field) => {
        if (!sort || sort.orderby !== field) {
            return <SortIcon sx={{ fontSize: '14px', color: colors.textMuted }} />;
        }
        return sort.order === 'ASC' ? (
            <ArrowUpIcon sx={{ fontSize: '14px', color: colors.tableHeaderText }} />
        ) : (
            <ArrowDownIcon sx={{ fontSize: '14px', color: colors.tableHeaderText }} />
        );
    };

    const headCellSx = {
        borderBottom: `1px solid ${colors.hookCardBorder}`,
        color: colors.tableHeaderText,
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: "'Figtree', sans-serif",
        textTransform: 'uppercase',
        py: 1.5,
        letterSpacing: '0.05em',
        px: 2,
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: 4,
        backgroundColor: colors.paper,
    };

    const visibleRowLimit = 10;
    const rowHeight = 68;
    const headHeight = 44;
    const limitTableHeight = logs.length > visibleRowLimit;
    const tableMaxHeight = headHeight + visibleRowLimit * rowHeight + 2;

    const scrollArrowBtnSx = {
        width: 28,
        height: 28,
        borderRadius: '8px',
        border: `1px solid ${colors.hookCardBorder}`,
        bgcolor: colors.paper,
        color: colors.textPrimary,
        p: 0,
        '&:hover': {
            bgcolor: colors.primaryLight,
            borderColor: colors.borderInput,
        },
        '&.Mui-disabled': {
            opacity: 0.35,
            bgcolor: colors.paper,
            color: colors.textPrimary,
        },
    };

    const getColumnMinWidth = (column) => {
        switch (column.key) {
            case 'id':
                return 88;
            case 'user_id':
                return 150;
            case 'ref':
                return 140;
            case 'creds':
                return 110;
            case 'entry':
                return 200;
            case 'time':
                return 170;
            default:
                return 120;
        }
    };

    const contentMinWidth = 48
        + ACTIONS_COL_WIDTH
        + activeColumns.reduce((sum, col) => sum + getColumnMinWidth(col), 0)
        + (showExpiry ? 120 : 0);

    const stickyEdgeFade = {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -20,
        width: 20,
        pointerEvents: 'none',
        zIndex: 1,
        background: 'linear-gradient(to left, rgba(22, 16, 40, 0.12) 0%, rgba(22, 16, 40, 0.05) 40%, transparent 100%)',
    };

    const stickyCheckboxSx = (isHead = false) => ({
        position: 'sticky',
        left: 0,
        zIndex: isHead ? 5 : 3,
        backgroundColor: colors.paper,
        ...(isHead ? { top: 0 } : {}),
    });

    const stickyActionsSx = (isHead = false) => ({
        position: 'sticky',
        right: 0,
        zIndex: isHead ? 5 : 3,
        backgroundColor: colors.paper,
        ...(isHead ? { top: 0 } : {}),
        minWidth: ACTIONS_COL_WIDTH,
        width: ACTIONS_COL_WIDTH,
        // Always reserve the border so toggling overflow chrome never shifts columns.
        borderLeft: `1px solid ${hasOverflow ? colors.hookCardBorder : 'transparent'}`,
        boxShadow: hasOverflow ? '-12px 0 18px -2px rgba(22, 16, 40, 0.14)' : 'none',
        ...(hasOverflow
            ? {
                '&::before': stickyEdgeFade,
            }
            : {}),
    });

    return (
        <Box sx={{ background: 'transparent' }}>
            <Box
                ref={cardRef}
                sx={{
                    position: 'relative',
                    background: 'transparent',
                    overflow: 'hidden',
                }}
            >
                {refreshing && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: colors.paper,
                            opacity: 0.72,
                            pointerEvents: 'none',
                        }}
                    >
                        <CircularProgress size={28} color="primary" />
                    </Box>
                )}

                <TableContainer
                    ref={tableScrollRef}
                    sx={{
                        ...(limitTableHeight ? { maxHeight: tableMaxHeight } : {}),
                        overflowX: 'auto',
                        overflowY: limitTableHeight ? 'auto' : 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${colors.textMuted} transparent`,
                        '&::-webkit-scrollbar': {
                            height: 6,
                            width: 6,
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                            marginLeft: '8px',
                            marginRight: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(151, 138, 188, 0.55)',
                            borderRadius: 999,
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: 'rgba(151, 138, 188, 0.85)',
                        },
                        '&::-webkit-scrollbar-button': {
                            display: 'none',
                            width: 0,
                            height: 0,
                        },
                    }}
                >
                    <Table
                        sx={{
                            width: '100%',
                            minWidth: contentMinWidth,
                            // Always fixed — auto layout + long page-1 cell text caused width thrash.
                            tableLayout: 'fixed',
                        }}
                    >
                        <TableHead
                            sx={{
                                background: colors.paper,
                                height: '44px',
                                '& .MuiTableCell-root': {
                                    backgroundColor: colors.paper,
                                },
                            }}
                        >
                            <TableRow>
                                <TableCell
                                    padding="checkbox"
                                    sx={{
                                        ...headCellSx,
                                        ...stickyCheckboxSx(true),
                                        pl: 2.5,
                                        pr: 1,
                                        width: 48,
                                        minWidth: 48,
                                    }}
                                >
                                    <LogRoundCheckbox
                                        colors={colors}
                                        indeterminate={selected.length > 0 && selected.length < logs.length}
                                        checked={logs.length > 0 && selected.length === logs.length}
                                        onClick={handleSelectAllClick}
                                    />
                                </TableCell>
                                {activeColumns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        sx={{
                                            ...headCellSx,
                                            minWidth: getColumnMinWidth(column),
                                            width: getColumnMinWidth(column),
                                        }}
                                    >
                                        {column.sortable ? (
                                            <Box
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => onSortChange(column.field)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault();
                                                        onSortChange(column.field);
                                                    }
                                                }}
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                    color: sort?.orderby === column.field ? colors.tableHeaderText : 'inherit',
                                                    '&:hover': { color: colors.tableHeaderText },
                                                }}
                                            >
                                                {column.label}
                                                {renderSortIcon(column.field)}
                                            </Box>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}
                                {showExpiry && (
                                    <TableCell sx={{ ...headCellSx, minWidth: 120, width: 120 }}>EXPIRY</TableCell>
                                )}
                                <TableCell
                                    sx={{
                                        ...headCellSx,
                                        ...stickyActionsSx(true),
                                        pr: 2,
                                        pl: 1.5,
                                    }}
                                >
                                    {hasOverflow ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                            <IconButton
                                                size="small"
                                                aria-label="Scroll columns left"
                                                disabled={!canScrollLeft}
                                                onClick={() => scrollTableBy(-240)}
                                                sx={scrollArrowBtnSx}
                                            >
                                                <LeftIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                aria-label="Scroll columns right"
                                                disabled={!canScrollRight}
                                                onClick={() => scrollTableBy(240)}
                                                sx={scrollArrowBtnSx}
                                            >
                                                <RightIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        'ACTIONS'
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => {
                                const isItemSelected = isSelected(log.id);
                                return (
                                    <TableRow
                                        key={log.id}
                                        selected={isItemSelected}
                                        sx={{
                                            height: 68,
                                            '&.Mui-selected': { backgroundColor: colors.rowHover },
                                            '&.Mui-selected td': { backgroundColor: colors.rowHover },
                                            '& td': { borderBottom: `1px solid ${colors.hookCardBorder}` },
                                        }}
                                    >
                                        <TableCell
                                            padding="checkbox"
                                            sx={{
                                                pl: 2.5,
                                                pr: 1,
                                                width: 48,
                                                minWidth: 48,
                                                verticalAlign: 'middle',
                                                ...stickyCheckboxSx(false),
                                                backgroundColor: isItemSelected ? colors.rowHover : colors.paper,
                                            }}
                                        >
                                            <LogRoundCheckbox
                                                colors={colors}
                                                checked={isItemSelected}
                                                onClick={() => handleSelectOne(log.id)}
                                            />
                                        </TableCell>
                                        {activeColumns.map((column) => (
                                            <TableCell
                                                key={`${log.id}-${column.key}`}
                                                sx={{
                                                    px: 2,
                                                    minWidth: getColumnMinWidth(column),
                                                    width: getColumnMinWidth(column),
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {renderColumnCell(column, log, colors)}
                                            </TableCell>
                                        ))}
                                        {showExpiry && (
                                            <TableCell sx={{ px: 2, minWidth: 120, width: 120 }}>
                                                <Typography sx={{ color: colors.textSecondary, fontSize: '14px', fontFamily: "'Figtree', sans-serif", fontWeight: 400 }}>
                                                    {log.expiry || '—'}
                                                </Typography>
                                            </TableCell>
                                        )}
                                        <TableCell
                                            sx={{
                                                px: 1.5,
                                                pr: 2,
                                                ...stickyActionsSx(false),
                                                backgroundColor: isItemSelected ? colors.rowHover : colors.paper,
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={(event) => handleActionClick(event, log)}
                                                sx={{
                                                    bgcolor: 'transparent',
                                                    color: colors.textSecondary,
                                                    width: '24px',
                                                    height: '24px',
                                                    p: 0,
                                                    '&:hover': {
                                                        bgcolor: 'transparent',
                                                        color: colors.textSecondary,
                                                    },
                                                }}
                                            >
                                                <MoreIcon sx={{ fontSize: '24px' }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={tableColSpan} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: colors.textMuted }}>No log entries found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <BulkActionBar
                    anchorRef={cardRef}
                    selected={selected}
                    onDelete={() => onDelete(selected)}
                    onClearSelection={() => onSelect([])}
                    exportEnabled={exportEnabled}
                    exportFormat={exportFormat}
                    onExport={onExport}
                />
            </Box>

            <Box sx={{
                px: 3,
                pt: 3,
                pb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                borderTop: `1px solid ${colors.hookCardBorder}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{
                        color: colors.textSecondary,
                        fontSize: '14px',
                        fontFamily: "'Figtree', sans-serif",
                    }}>
                        Rows per page
                    </Typography>
                    <Select
                        value={pagination.number}
                        onChange={(event) => onPaginationChange(1, parseInt(event.target.value, 10))}
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
                        {[10, 25, 50, 100].map((val) => <MenuItem key={val} value={val}>{val}</MenuItem>)}
                    </Select>
                </Box>

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
                    <IconButton
                        disabled={pagination.paged === 1}
                        onClick={() => onPaginationChange(1)}
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
                    <IconButton
                        disabled={pagination.paged === 1}
                        onClick={() => onPaginationChange(pagination.paged - 1)}
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

                    {[...Array(Number(pagination.totalPages) || 0)].map((_, index) => {
                        const page = index + 1;
                        if (pagination.totalPages > 5 && (page > 3 && page < pagination.totalPages - 1 && Math.abs(page - pagination.paged) > 1)) {
                            if (page === 4) return <Typography key={page} sx={{ px: 0.5, color: colors.textMuted }}>...</Typography>;
                            return null;
                        }
                        const isActive = pagination.paged === page;
                        return (
                            <Button
                                key={page}
                                onClick={() => onPaginationChange(page)}
                                sx={{
                                    minWidth: 36,
                                    height: 32,
                                    p: 0,
                                    borderRadius: '4px',
                                    color: isActive ? colors.primary : colors.textSecondary,
                                    background: isActive ? colors.filterActiveBg : 'transparent',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        background: isActive ? colors.filterActiveBg : 'transparent',
                                        color: isActive ? colors.primary : colors.textSecondary,
                                        boxShadow: 'none',
                                    },
                                    fontSize: '14px',
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: isActive ? 500 : 400,
                                }}
                            >
                                {page}
                            </Button>
                        );
                    })}

                    <IconButton
                        disabled={pagination.paged === pagination.totalPages}
                        onClick={() => onPaginationChange(pagination.paged + 1)}
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
                    <IconButton
                        disabled={pagination.paged === pagination.totalPages}
                        onClick={() => onPaginationChange(pagination.totalPages)}
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

                <Typography sx={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    fontFamily: "'Figtree', sans-serif",
                }}>
                    {((pagination.paged - 1) * pagination.number) + 1}-{Math.min(pagination.paged * pagination.number, pagination.totalEntries)} of {pagination.totalEntries} entries
                </Typography>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleActionClose}
                elevation={0}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            borderRadius: '12px',
                            border: `1px solid ${colors.borderPopover}`,
                            boxShadow: colors.shadowMenu,
                            minWidth: '180px',
                            backgroundColor: colors.paper,
                            backgroundImage: 'none',
                            opacity: 1,
                            '& .MuiMenuItem-root': {
                                py: 1,
                                px: 2,
                                fontSize: '14px',
                                fontFamily: "'Figtree', sans-serif",
                                fontWeight: 500,
                                display: 'flex',
                                gap: 1.5,
                                color: colors.textSecondary,
                                '&:hover': { bgcolor: colors.rowHover },
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleFilterByUser}>
                    <FilterIcon sx={{ fontSize: '18px' }} />
                    Filter by user
                </MenuItem>
                <MenuItem onClick={handleEditCall}>
                    <EditIcon sx={{ fontSize: '18px' }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteCall} sx={{ color: `${colors.danger} !important` }}>
                    <DeleteIcon sx={{ fontSize: '18px' }} />
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default LogsTable;
