import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { CouponsHeader } from './components/CouponsHeader';
import { CouponsTable } from './components/CouponsTable';
import { CouponsSkeleton } from './components/CouponsSkeleton';

const DEFAULT_COLUMNS = {
    value: true,
    usage: true,
    limits: true,
    expires: true,
    point_type: true
};

export const App = () => {
    const { colors } = useAdminTheme();
    const config = window.mycredCouponsData || {};

    const [coupons, setCoupons] = useState(config.initialCoupons || []);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPointType, setSelectedPointType] = useState('all');
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(config.totalCount || 0);
    const [counts, setCounts] = useState(config.counts || { all: 0, publish: 0, trash: 0 });
    const [pointTypes, setPointTypes] = useState(config.pointTypes || []);

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('mycred_coupons_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_coupons_columns', JSON.stringify(updated));
            return updated;
        });
    };

    const handlePerPageChange = (value) => {
        const num = parseInt(value, 10);
        if (num > 0 && num <= 100) {
            setPerPage(num);
            setPage(1);
        }
    };

    // Fetch Coupons from REST API
    const fetchCoupons = useCallback(async () => {
        if (!config.restUrl) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: activeTab,
                search: searchQuery,
                point_type: selectedPointType,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${config.restUrl}coupons?${params.toString()}`, {
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                const data = await res.json();
                setCoupons(data.items || []);
                setTotalItems(data.total || 0);
                if (data.counts) setCounts(data.counts);
                if (data.point_types) setPointTypes(data.point_types);
            }
        } catch (err) {
            console.error('Error fetching coupons:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery, selectedPointType, page, perPage, config.restUrl, config.nonce]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // Handle Select All
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(coupons.map((c) => c.id));
        } else {
            setSelected([]);
        }
    };

    // Handle Select One
    const handleSelectOne = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Delete / Trash Coupon
    const handleDeleteCoupon = async (id, permanent = false) => {
        const confirmMsg = permanent
            ? 'Are you sure you want to delete this coupon permanently?'
            : 'Are you sure you want to move this coupon to trash?';
        if (!window.confirm(confirmMsg)) return;

        const loadingToast = toast.loading(permanent ? 'Deleting coupon...' : 'Trashing coupon...');
        try {
            const url = `${config.restUrl}coupons/${id}${permanent ? '?permanent=1' : ''}`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                toast.success(permanent ? 'Coupon deleted permanently!' : 'Coupon moved to trash!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchCoupons();
            } else {
                toast.error('Failed to perform action on coupon.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Restore Coupon
    const handleRestoreCoupon = async (id) => {
        const loadingToast = toast.loading('Restoring coupon...');
        try {
            const res = await fetch(`${config.restUrl}coupons/${id}/restore`, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                toast.success('Coupon restored!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchCoupons();
            } else {
                toast.error('Failed to restore coupon.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Bulk Action
    const handleApplyBulkAction = async () => {
        if (!bulkAction || selected.length === 0) return;

        const actionText = bulkAction === 'delete' ? 'delete permanently' : bulkAction === 'restore' ? 'restore' : 'move to trash';
        if (!window.confirm(`Are you sure you want to ${actionText} ${selected.length} coupons?`)) return;

        const loadingToast = toast.loading('Applying bulk action...');
        try {
            const res = await fetch(`${config.restUrl}coupons/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.nonce || ''
                },
                body: JSON.stringify({
                    action: bulkAction,
                    ids: selected
                })
            });

            if (res.ok) {
                toast.success('Bulk action applied successfully!', { id: loadingToast });
                setSelected([]);
                setBulkAction('');
                fetchCoupons();
            } else {
                toast.error('Failed to apply bulk action.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    const totalPages = Math.ceil(totalItems / perPage) || 1;

    if (loading && coupons.length === 0) {
        return <CouponsSkeleton />;
    }

    return (
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
            <Toaster position="bottom-right" />
            <Container maxWidth="xl" disableGutters>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: colors.paper,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 12px rgba(45, 21, 114, 0.03)'
                    }}
                >
                    <CouponsHeader
                        totalCount={totalItems}
                        activeTab={activeTab}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setPage(1);
                            setSelected([]);
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={(val) => {
                            setSearchQuery(val);
                            setPage(1);
                        }}
                        selectedPointType={selectedPointType}
                        onPointTypeChange={(val) => {
                            setSelectedPointType(val);
                            setPage(1);
                        }}
                        pointTypes={pointTypes}
                        counts={counts}
                        bulkAction={bulkAction}
                        onBulkActionChange={setBulkAction}
                        onApplyBulkAction={handleApplyBulkAction}
                        addNewUrl={config.addNewUrl || 'post-new.php?post_type=mycred_coupon'}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                    />

                    <CouponsTable
                        coupons={coupons}
                        loading={loading}
                        selected={selected}
                        onSelectAll={handleSelectAll}
                        onSelectOne={handleSelectOne}
                        onDeleteCoupon={handleDeleteCoupon}
                        onRestoreCoupon={handleRestoreCoupon}
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        activeTab={activeTab}
                        visibleColumns={visibleColumns}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                </Paper>
            </Container>
        </Box>
    );
};

export default App;
