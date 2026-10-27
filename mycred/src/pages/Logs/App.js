import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    ThemeProvider,
    Box,
    Typography,
    CircularProgress,
    Button,
    Chip
} from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';
import LogsTable from './LogsTable';
import LogsToolbar from './LogsToolbar';
import ColumnPicker from './ColumnPicker';
import LogExport, { runLogsExport } from './LogExport';
import LogEditModal from './LogEditModal';
import DeleteModal from './DeleteModal';
import { useLogsTheme } from './ThemeContext';
import { getLogsTheme } from './theme';
import {
    buildAllColumns,
    loadVisibleColumns,
    saveVisibleColumns,
} from './logColumns';

const App = () => {
    const { colors } = useLogsTheme();
    const theme = useMemo(() => getLogsTheme(), []);

    const initialData = window.mycredLogsData || {
        pointType: 'mycred_default',
        pointTypes: {},
        nonce: '',
        updateNonce: '',
        deleteNonce: '',
        bulkDeleteNonce: '',
        ajaxurl: '',
        exportEnabled: false,
        exportFormat: 'both',
        extraColumns: [],
        initialUser: '',
        initialUserName: '',
        labels: { singular: 'Point', plural: 'Points' }
    };

    const allColumns = useMemo(
        () => buildAllColumns(initialData.extraColumns || []),
        [initialData.extraColumns]
    );

    const [visibleColumns, setVisibleColumns] = useState(() => (
        loadVisibleColumns(allColumns, initialData.pointType)
    ));

    const [logs, setLogs] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const hasLoadedOnce = useRef(false);
    const [selected, setSelected] = useState([]);
    const [showExport, setShowExport] = useState(false);
    const [references, setReferences] = useState({});
    const [showExpiry, setShowExpiry] = useState(false);
    const [editLog, setEditLog] = useState(null);
    const [deleteIds, setDeleteIds] = useState([]);

    const [filters, setFilters] = useState({
        search: '',
        user: initialData.initialUser ? String(initialData.initialUser) : '',
        ref: 'all',
        time: 'all',
        from: null,
        to: null,
        ctype: initialData.pointType
    });
    const [userLabel, setUserLabel] = useState(initialData.initialUserName || '');

    const [pagination, setPagination] = useState({
        paged: 1,
        number: 10,
        totalEntries: 0,
        totalPages: 1
    });

    const [sort, setSort] = useState({
        orderby: 'time',
        order: 'DESC',
    });

    useEffect(() => {
        setVisibleColumns(loadVisibleColumns(allColumns, initialData.pointType));
    }, [allColumns, initialData.pointType]);

    const handleVisibleColumnsChange = (nextColumns) => {
        setVisibleColumns(nextColumns);
        saveVisibleColumns(initialData.pointType, nextColumns);
    };

    const fetchLogs = useCallback(async () => {
        if (!hasLoadedOnce.current) {
            setInitialLoading(true);
        } else {
            setRefreshing(true);
        }
        const params = new URLSearchParams();
        params.append('action', 'mycred_get_logs_json');
        params.append('token', initialData.nonce);
        params.append('ctype', filters.ctype);
        params.append('paged', pagination.paged);
        params.append('number', pagination.number);
        params.append('s', filters.search);
        if (filters.user) params.append('user', filters.user);
        params.append('ref', filters.ref);
        params.append('time', filters.time);
        if (filters.from) params.append('from', filters.from);
        if (filters.to) params.append('to', filters.to);
        params.append('orderby', sort.orderby);
        params.append('order', sort.order);

        try {
            const response = await fetch(initialData.ajaxurl, {
                method: 'POST',
                body: params,
            });
            const result = await response.json();

            if (result.success) {
                setLogs(result.data.entries);
                setReferences(result.data.references);
                setShowExpiry(!!result.data.show_expiry);
                setPagination(prev => ({
                    ...prev,
                    totalEntries: result.data.total_entries,
                    totalPages: result.data.total_pages
                }));
            } else {
                toast.error(result.data || 'Failed to fetch logs');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            hasLoadedOnce.current = true;
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, [filters, pagination.paged, pagination.number, sort.orderby, sort.order]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSortChange = (field) => {
        setSort((prev) => {
            if (prev.orderby === field) {
                return { orderby: field, order: prev.order === 'DESC' ? 'ASC' : 'DESC' };
            }
            return { orderby: field, order: 'DESC' };
        });
        setPagination((prev) => ({ ...prev, paged: 1 }));
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, paged: 1 }));
    };

    const handlePaginationChange = (newPage, newNumber) => {
        setPagination(prev => ({
            ...prev,
            paged: newPage,
            number: newNumber || prev.number
        }));
    };

    const handleFilterByUser = (userId, displayName) => {
        setUserLabel(displayName || '');
        handleFilterChange({ user: String(userId), search: '' });
        toast.success(`Filtering by user: ${displayName}`);
    };

    const handleClearUserFilter = () => {
        setUserLabel('');
        handleFilterChange({ user: '' });
    };

    const handleFilterByDate = (dateString) => {
        const dayStr = dateString.split(' ')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dayStr)) {
            handleFilterChange({ from: dayStr, to: dayStr, time: 'Custom range' });
            toast.success(`Filtering by date: ${dayStr}`);
        }
    };

    const handleDelete = (ids) => {
        setDeleteIds(ids);
    };

    const confirmDelete = async () => {
        if (deleteIds.length === 0) return;

        const isBulk = deleteIds.length > 1;
        const params = new URLSearchParams();

        if (isBulk) {
            params.append('action', 'mycred-bulk-delete-log-entries');
            params.append('token', initialData.bulkDeleteNonce);
            deleteIds.forEach(id => params.append('ids[]', id));
        } else {
            params.append('action', 'mycred-delete-log-entry');
            params.append('token', initialData.deleteNonce);
            params.append('row', deleteIds[0]);
        }

        params.append('ctype', filters.ctype);

        const loadingToast = toast.loading(isBulk ? `Deleting ${deleteIds.length} entries...` : 'Deleting entry...');

        try {
            const response = await fetch(initialData.ajaxurl, {
                method: 'POST',
                body: params,
            });
            const result = await response.json();

            toast.dismiss(loadingToast);
            if (result.success) {
                toast.success(typeof result.data === 'string' ? result.data : (result.data.message || 'Deleted successfully'));
                setSelected([]);
                setDeleteIds([]);
                fetchLogs();
            } else {
                toast.error(result.data.message || result.data || 'Delete failed');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Network error during deletion');
        }
    };

    const handleSaveEdit = async (id, data) => {
        const loadingToast = toast.loading('Saving changes...');

        const params = new URLSearchParams();
        params.append('action', 'mycred-update-log-entry');
        params.append('token', initialData.updateNonce);
        params.append('ctype', filters.ctype);
        params.append('rowid', id);

        const formData = `mycred_manage_log[creds]=${data.amount}&mycred_manage_log[ref]=${data.ref}&mycred_manage_log[entry]=${data.entry}`;
        params.append('form', formData);

        try {
            const response = await fetch(initialData.ajaxurl, {
                method: 'POST',
                body: params,
            });
            const result = await response.json();

            toast.dismiss(loadingToast);
            if (result.success) {
                toast.success('Log entry updated successfully');
                setEditLog(null);
                fetchLogs();
            } else {
                toast.error(result.data.message || 'Failed to update log entry');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Network error during update');
        }
    };

    const handleSelectedExport = async (format) => {
        if (!selected.length) {
            toast.error('Select log entries to export');
            return;
        }

        const loadingToast = toast.loading(`Exporting ${selected.length} entries...`);
        try {
            const count = await runLogsExport({
                initialData,
                filters,
                ids: selected,
                format,
            });
            toast.dismiss(loadingToast);
            toast.success(`Exported ${count} log entries`);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Export failed');
        }
    };

    const toastOptions = useMemo(() => ({
        style: {
            background: colors.paper,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
        },
    }), [colors]);

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    minHeight: 'calc(100vh - 60px)',
                    pt: 2,
                    pb: 10,
                    px: { xs: 0, sm: 0 },
                    bgcolor: 'transparent',
                    borderRadius: 0,
                }}
            >
                <Toaster position="bottom-right" toastOptions={toastOptions} />

                <Box
                    sx={{
                        bgcolor: colors.paper,
                        border: `1px solid ${colors.hookCardBorder}`,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        width: '100%',
                        boxShadow: '0 2px 12px rgba(45, 21, 114, 0.03)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 3,
                            pt: 3,
                            pb: 2,
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    m: 0,
                                    color: colors.textPrimary,
                                    fontWeight: 600,
                                    fontSize: '20px',
                                    fontFamily: "'Vollkorn', serif"
                                }}
                            >
                                Logs
                            </Typography>
                            {filters.user ? (
                                <Chip
                                    label={userLabel || `User #${filters.user}`}
                                    size="small"
                                    onDelete={handleClearUserFilter}
                                    sx={{
                                        bgcolor: colors.paperMuted,
                                        color: colors.textPrimary,
                                        fontWeight: 500,
                                        fontSize: '13px',
                                        fontFamily: "'Poppins', sans-serif",
                                        height: 28,
                                        '& .MuiChip-deleteIcon': {
                                            color: colors.textSecondary,
                                        },
                                    }}
                                />
                            ) : null}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <LogsToolbar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                references={references}
                            />
                            <ColumnPicker
                                allColumns={allColumns}
                                visibleColumns={visibleColumns}
                                onChange={handleVisibleColumnsChange}
                            />
                            {initialData.exportEnabled && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setShowExport(!showExport)}
                                    sx={{
                                        height: '40px',
                                        borderColor: colors.borderInput,
                                        color: colors.primary,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        borderRadius: '8px',
                                        px: 3,
                                        bgcolor: colors.paper,
                                        '&:hover': {
                                            borderColor: colors.primary,
                                            background: colors.paperMuted,
                                        },
                                    }}
                                >
                                    Export
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <LogExport
                        show={showExport}
                        onClose={() => setShowExport(false)}
                        filters={filters}
                        initialData={initialData}
                        exportFormat={initialData.exportFormat || 'both'}
                    />

                    {initialLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 520, p: 8 }}>
                            <CircularProgress color="primary" />
                        </Box>
                    ) : (
                        <LogsTable
                            logs={logs}
                            refreshing={refreshing}
                            pagination={pagination}
                            onPaginationChange={handlePaginationChange}
                            onDelete={handleDelete}
                            selected={selected}
                            onSelect={setSelected}
                            sort={sort}
                            onSortChange={handleSortChange}
                            exportEnabled={initialData.exportEnabled}
                            exportFormat={initialData.exportFormat || 'both'}
                            onExport={handleSelectedExport}
                            onFilterByUser={handleFilterByUser}
                            onFilterByDate={handleFilterByDate}
                            onEdit={setEditLog}
                            showExpiry={showExpiry}
                            allColumns={allColumns}
                            visibleColumns={visibleColumns}
                        />
                    )}
                </Box>

                <LogEditModal
                    open={!!editLog}
                    log={editLog}
                    onClose={() => setEditLog(null)}
                    onSave={handleSaveEdit}
                    onDelete={(log) => {
                        setEditLog(null);
                        handleDelete([log.id]);
                    }}
                    references={references}
                />

                <DeleteModal
                    open={deleteIds.length > 0}
                    count={deleteIds.length}
                    onClose={() => setDeleteIds([])}
                    onConfirm={confirmDelete}
                />
            </Box>
        </ThemeProvider>
    );
};

export default App;
