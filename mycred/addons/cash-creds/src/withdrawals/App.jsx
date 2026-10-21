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
import { WithdrawalsHeader } from './components/WithdrawalsHeader';
import { WithdrawalsTable } from './components/WithdrawalsTable';

const DEFAULT_COLUMNS = {
    buyer: true,
    amount: true,
    cost: true,
    gateway: true,
    ctype: true,
    date: true
};

export const App = () => {
    const { colors } = useAdminTheme();
    const config = window.mycredCashcredWithdrawalsData || {};
    const restUrl = config.restUrl || '/wp-json/mycred/v1/cashcred-withdrawals';
    const nonce = config.nonce || (window.mycredCashcredGateways && window.mycredCashcredGateways.nonce) || '';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [mycredStatus, setMycredStatus] = useState('all');
    const [gatewayFilter, setGatewayFilter] = useState('all');
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [counts, setCounts] = useState({ all: 0, publish: 0, trash: 0 });

    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('mycred_cashcred_withdrawals_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_cashcred_withdrawals_columns', JSON.stringify(updated));
            return updated;
        });
    };

    const fetchWithdrawals = useCallback(async () => {
        if (!restUrl) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: activeTab,
                mycred_status: mycredStatus,
                gateway: gatewayFilter,
                search: searchQuery,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${restUrl}?${params.toString()}`, {
                headers: { 'X-WP-Nonce': nonce }
            });

            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotalItems(data.total || 0);
                if (data.counts) setCounts(data.counts);
            }
        } catch (err) {
            console.error('Error fetching cashCred withdrawals:', err);
            toast.error('Failed to load withdrawal requests.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, mycredStatus, gatewayFilter, searchQuery, page, perPage, restUrl, nonce]);

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(items.map((i) => i.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCredit = async (id) => {
        const toastId = toast.loading('Processing pay out...');
        try {
            const res = await fetch(`${restUrl}/${id}/pay`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': nonce }
            });

            if (res.ok) {
                toast.success('Withdrawal request successfully credited & paid out!', { id: toastId });
                fetchWithdrawals();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Pay out failed.', { id: toastId });
            }
        } catch (err) {
            console.error('Error processing payout:', err);
            toast.error('Failed to process pay out.', { id: toastId });
        }
    };

    const handleDelete = async (id, force = false) => {
        const toastId = toast.loading(force ? 'Deleting permanently...' : 'Moving to Trash...');
        try {
            const res = await fetch(`${restUrl}/${id}/trash?force=${force}`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': nonce }
            });

            if (res.ok) {
                toast.success(force ? 'Deleted permanently!' : 'Moved to Trash!', { id: toastId });
                fetchWithdrawals();
            } else {
                toast.error('Failed to delete item.', { id: toastId });
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            toast.error('Error occurred while deleting.', { id: toastId });
        }
    };

    const handleRestore = async (id) => {
        const toastId = toast.loading('Restoring item...');
        try {
            const res = await fetch(`${restUrl}/${id}/restore`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': nonce }
            });

            if (res.ok) {
                toast.success('Restored successfully!', { id: toastId });
                fetchWithdrawals();
            } else {
                toast.error('Failed to restore item.', { id: toastId });
            }
        } catch (err) {
            console.error('Error restoring item:', err);
            toast.error('Error occurred while restoring.', { id: toastId });
        }
    };

    const handleApplyBulkAction = async () => {
        if (!bulkAction || selected.length === 0) return;
        const toastId = toast.loading(`Applying bulk action: ${bulkAction}...`);
        try {
            const res = await fetch(`${restUrl}/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce
                },
                body: JSON.stringify({ action: bulkAction, ids: selected })
            });

            if (res.ok) {
                toast.success('Bulk action applied successfully!', { id: toastId });
                setSelected([]);
                setBulkAction('');
                fetchWithdrawals();
            } else {
                toast.error('Failed to apply bulk action.', { id: toastId });
            }
        } catch (err) {
            console.error('Bulk action error:', err);
            toast.error('Error applying bulk action.', { id: toastId });
        }
    };

    return (
        <Box sx={{ p: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <Toaster position="bottom-right" />
            <Paper
                elevation={0}
                sx={{
                    bgcolor: colors.paper,
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    boxShadow: 'none',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <WithdrawalsHeader
                    totalCount={totalItems}
                    activeTab={activeTab}
                    onTabChange={(tab) => { setActiveTab(tab); setPage(1); }}
                    searchQuery={searchQuery}
                    onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
                    mycredStatus={mycredStatus}
                    onMycredStatusChange={(s) => { setMycredStatus(s); setPage(1); }}
                    gatewayFilter={gatewayFilter}
                    onGatewayFilterChange={(g) => { setGatewayFilter(g); setPage(1); }}
                    counts={counts}
                    bulkAction={bulkAction}
                    onBulkActionChange={setBulkAction}
                    onApplyBulkAction={handleApplyBulkAction}
                    visibleColumns={visibleColumns}
                    onToggleColumn={handleToggleColumn}
                />

                {loading ? (
                    <Box sx={{ p: 3 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: '8px', mb: 1.5 }} />
                        ))}
                    </Box>
                ) : (
                    <WithdrawalsTable
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

                <TablePagination
                    component="div"
                    count={totalItems}
                    page={page - 1}
                    onPageChange={(e, newPage) => setPage(newPage + 1)}
                    rowsPerPage={perPage}
                    onRowsPerPageChange={(e) => { setPerPage(parseInt(e.target.value, 10)); setPage(1); }}
                    rowsPerPageOptions={[10, 25, 50]}
                    sx={{
                        borderTop: `1px solid ${colors.border}`,
                        color: colors.textSecondary,
                        '& .MuiTablePagination-select': { color: colors.textPrimary }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default App;
