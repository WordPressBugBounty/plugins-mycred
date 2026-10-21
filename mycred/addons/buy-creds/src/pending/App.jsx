import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    TablePagination,
    Skeleton,
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import { PendingPaymentsHeader } from './components/PendingPaymentsHeader';
import { PendingPaymentsTable } from './components/PendingPaymentsTable';

const DEFAULT_COLUMNS = {
    buyer: true,
    amount: true,
    cost: true,
    gateway: true,
    ctype: true,
    date: true
};

export const App = () => {
    const { colors, isDark } = useAdminTheme();
    const config = window.mycredPendingPaymentsData || {};

    const [items, setItems] = useState(config.initialData?.items || []);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(config.initialData?.total || 0);
    const [counts, setCounts] = useState(config.initialData?.counts || { all: 0, trash: 0 });

    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('mycred_buycred_pending_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_buycred_pending_columns', JSON.stringify(updated));
            return updated;
        });
    };

    const restUrl = config.restUrl || '/wp-json/mycred/v1/buycred-payments';
    const nonce = config.nonce || (window.mycredBuycredGateways && window.mycredBuycredGateways.apiNonce) || '';

    // Fetch Pending Payments from REST API
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: activeTab,
                search: searchQuery,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${restUrl}?${params.toString()}`, {
                headers: {
                    'X-WP-Nonce': nonce
                }
            });

            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotalItems(data.total || 0);
                if (data.counts) setCounts(data.counts);
            }
        } catch (err) {
            console.error('Error fetching pending payments:', err);
            toast.error('Failed to load pending payments.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery, page, perPage, config.restUrl, config.nonce]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Handle ?credited= param from classic metabox Pay Out button
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const credited = params.get('credited');
        if (credited === '1') {
            toast.success('Pending payment successfully credited to account!');
            // Clean URL
            params.delete('credited');
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, '', newUrl);
            fetchPayments();
        } else if (credited === '0') {
            toast.error('Failed to credit the pending payment to account.');
            params.delete('credited');
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

    // Handle Select All
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(items.map((i) => i.id));
        } else {
            setSelected([]);
        }
    };

    // Handle Select One
    const handleSelectOne = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Credit / Pay Out single payment
    const handleCredit = async (id) => {
        const toastId = toast.loading('Processing pay out...');
        try {
            const res = await fetch(`${restUrl}/${id}/credit`, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': nonce
                }
            });

            if (res.ok) {
                toast.success('Pending payment successfully credited!', { id: toastId });
                fetchPayments();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to credit payment.', { id: toastId });
            }
        } catch (err) {
            toast.error('Network error during pay out.', { id: toastId });
        }
    };

    // Trash / Delete single payment
    const handleDelete = async (id, permanent = false) => {
        const toastId = toast.loading(permanent ? 'Deleting payment...' : 'Trashing payment...');
        try {
            const url = `${restUrl}/${id}${permanent ? '?force=true' : ''}`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': nonce
                }
            });

            if (res.ok) {
                toast.success(permanent ? 'Payment deleted permanently!' : 'Payment moved to Trash.', { id: toastId });
                setSelected(prev => prev.filter(i => i !== id));
                fetchPayments();
            } else {
                toast.error('Failed to delete payment.', { id: toastId });
            }
        } catch (err) {
            toast.error('Error contacting server.', { id: toastId });
        }
    };

    // Restore single payment
    const handleRestore = async (id) => {
        const toastId = toast.loading('Restoring payment...');
        try {
            const res = await fetch(`${restUrl}/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce
                },
                body: JSON.stringify({ action: 'restore' })
            });

            if (res.ok) {
                toast.success('Payment restored!', { id: toastId });
                setSelected(prev => prev.filter(i => i !== id));
                fetchPayments();
            } else {
                toast.error('Failed to restore payment.', { id: toastId });
            }
        } catch (err) {
            toast.error('Error contacting server.', { id: toastId });
        }
    };

    // Bulk actions
    const handleApplyBulkAction = async () => {
        if (!bulkAction || selected.length === 0) return;

        const toastId = toast.loading(`Applying ${bulkAction} on selected items...`);
        try {
            const res = await fetch(`${restUrl}/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce
                },
                body: JSON.stringify({
                    ids: selected,
                    bulk_action: bulkAction
                })
            });

            if (res.ok) {
                toast.success('Bulk action applied successfully!', { id: toastId });
                setSelected([]);
                setBulkAction('');
                fetchPayments();
            } else {
                toast.error('Failed to apply bulk action.', { id: toastId });
            }
        } catch (err) {
            toast.error('Error applying bulk action.', { id: toastId });
        }
    };

    return (
        <Box sx={{ p: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <Toaster position="bottom-right" />
            <Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: colors.paper,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: 'none',
                        width: '100%',
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <PendingPaymentsHeader
                        totalCount={totalItems}
                        activeTab={activeTab}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setPage(1);
                            setSelected([]);
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={(q) => {
                            setSearchQuery(q);
                            setPage(1);
                        }}
                        counts={counts}
                        bulkAction={bulkAction}
                        onBulkActionChange={setBulkAction}
                        onApplyBulkAction={handleApplyBulkAction}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                    />

                    {loading ? (
                        <Box sx={{ p: 3 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="rectangular"
                                    height={50}
                                    sx={{ borderRadius: '8px', mb: 1.5, bgcolor: colors.paperMuted }}
                                />
                            ))}
                        </Box>
                    ) : (
                        <PendingPaymentsTable
                            items={items}
                            selected={selected}
                            onSelectAll={handleSelectAll}
                            onSelectOne={handleSelectOne}
                            onCredit={handleCredit}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            visibleColumns={visibleColumns}
                            activeTab={activeTab}
                        />
                    )}

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={totalItems}
                        page={page - 1}
                        onPageChange={(_, newPage) => setPage(newPage + 1)}
                        rowsPerPage={perPage}
                        onRowsPerPageChange={(e) => {
                            setPerPage(parseInt(e.target.value, 10));
                            setPage(1);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        sx={{
                            borderTop: `1px solid ${colors.border}`,
                            color: colors.textSecondary,
                            '& .MuiTablePagination-select': {
                                borderRadius: '6px'
                            }
                        }}
                    />
                </Paper>
            </Container>
        </Box>
    );
};
