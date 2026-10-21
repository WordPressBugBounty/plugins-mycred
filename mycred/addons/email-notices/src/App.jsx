import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { EmailNoticesHeader } from './components/EmailNoticesHeader';
import { EmailNoticesTable } from './components/EmailNoticesTable';

const DEFAULT_COLUMNS = {
    status: true,
    setup: true,
    point_type: true
};

export const App = () => {
    const { colors } = useAdminTheme();
    const config = window.mycredEmailNoticesData || {};

    const [notices, setNotices] = useState(config.initialData?.items || []);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(config.initialData?.total || 0);
    const [counts, setCounts] = useState(config.initialData?.counts || { all: 0, publish: 0, trash: 0 });
    
    // Config data
    const pointTypesMap = config.initialData?.point_types || {};
    const instancesMap = config.initialData?.instances_map || {};
    const referencesMap = config.initialData?.references_map || {};

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('mycred_email_notices_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_email_notices_columns', JSON.stringify(updated));
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

    // Fetch Email Notices from REST API
    const fetchNotices = useCallback(async () => {
        if (!config.apiUrl) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: activeTab,
                search: searchQuery,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${config.apiUrl}?${params.toString()}`, {
                headers: {
                    'X-WP-Nonce': config.apiNonce || ''
                }
            });

            if (res.ok) {
                const data = await res.json();
                setNotices(data.items || []);
                setTotalItems(data.total || 0);
                if (data.counts) setCounts(data.counts);
            }
        } catch (err) {
            console.error('Error fetching email notices:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery, page, perPage, config.apiUrl, config.apiNonce]);

    useEffect(() => {
        // Initial load is from localized data, so only fetch if activeTab, etc. changes from initial state
        fetchNotices();
    }, [fetchNotices]);

    // Select All
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(notices.map((r) => r.id));
        } else {
            setSelected([]);
        }
    };

    // Select One
    const handleSelectOne = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Delete / Trash Notice
    const handleDeleteNotice = async (id, permanent = false) => {
        const confirmMsg = permanent
            ? 'Are you sure you want to delete this notification permanently?'
            : 'Are you sure you want to move this notification to trash?';
        if (!window.confirm(confirmMsg)) return;

        const loadingToast = toast.loading(permanent ? 'Deleting notification...' : 'Trashing notification...');
        try {
            // Using standard WP REST endpoint for deleting
            const url = `${config.apiUrl}/${id}${permanent ? '?force=true' : ''}`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': config.apiNonce || ''
                }
            });

            if (res.ok) {
                toast.success(permanent ? 'Notification deleted permanently!' : 'Notification moved to trash!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchNotices();
            } else {
                toast.error('Failed to perform action.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Restore Notice
    const handleRestoreNotice = async (id) => {
        const loadingToast = toast.loading('Restoring notification...');
        try {
            const url = `${config.apiUrl}/${id}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.apiNonce || ''
                },
                body: JSON.stringify({ status: 'publish' })
            });

            if (res.ok) {
                toast.success('Notification restored!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchNotices();
            } else {
                toast.error('Failed to restore notification.', { id: loadingToast });
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
        if (!window.confirm(`Are you sure you want to ${actionText} ${selected.length} notifications?`)) return;

        const loadingToast = toast.loading('Applying bulk action...');
        try {
            const res = await fetch(`${config.apiUrl}/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.apiNonce || ''
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
                fetchNotices();
            } else {
                toast.error('Failed to apply bulk action.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const addNewUrl = 'post-new.php?post_type=mycred_email_notice';

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
                    <EmailNoticesHeader
                        totalCount={counts.all || 0}
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
                        counts={counts}
                        bulkAction={bulkAction}
                        onBulkActionChange={setBulkAction}
                        onApplyBulkAction={handleApplyBulkAction}
                        addNewUrl={addNewUrl}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                        pointTypesMap={pointTypesMap}
                    />

                    <EmailNoticesTable
                        notices={notices}
                        loading={loading}
                        selected={selected}
                        onSelectAll={handleSelectAll}
                        onSelectOne={handleSelectOne}
                        onDeleteNotice={handleDeleteNotice}
                        onRestoreNotice={handleRestoreNotice}
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        activeTab={activeTab}
                        visibleColumns={visibleColumns}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        pointTypesMap={pointTypesMap}
                        instancesMap={instancesMap}
                        referencesMap={referencesMap}
                    />
                </Paper>
            </Container>
        </Box>
    );
};

export default App;
