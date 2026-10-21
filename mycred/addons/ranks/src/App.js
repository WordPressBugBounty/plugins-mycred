import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { RanksHeader } from './components/RanksHeader';
import { RanksTable } from './components/RanksTable';
import { RanksSkeleton } from './components/RanksSkeleton';

const DEFAULT_COLUMNS = {
    logo: true,
    requirements: true,
    users_count: true,
    point_type: true
};

export const App = () => {
    const { colors } = useAdminTheme();
    const config = window.mycredRanksData || {};

    const [ranks, setRanks] = useState(config.initialRanks || []);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPointType, setSelectedPointType] = useState(config.currentCtype || 'all');
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
            const saved = localStorage.getItem('mycred_ranks_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_ranks_columns', JSON.stringify(updated));
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

    // Fetch Ranks from REST API
    const fetchRanks = useCallback(async () => {
        if (!config.restUrl) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ctype: selectedPointType,
                status: activeTab,
                search: searchQuery,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${config.restUrl}ranks?${params.toString()}`, {
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                const data = await res.json();
                setRanks(data.items || []);
                setTotalItems(data.total || 0);
                if (data.counts) setCounts(data.counts);
                if (data.point_types) setPointTypes(data.point_types);
            }
        } catch (err) {
            console.error('Error fetching ranks:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedPointType, activeTab, searchQuery, page, perPage, config.restUrl, config.nonce]);

    useEffect(() => {
        fetchRanks();
    }, [fetchRanks]);

    // Select All
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(ranks.map((r) => r.id));
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

    // Delete / Trash Rank
    const handleDeleteRank = async (id, permanent = false) => {
        const confirmMsg = permanent
            ? 'Are you sure you want to delete this rank permanently?'
            : 'Are you sure you want to move this rank to trash?';
        if (!window.confirm(confirmMsg)) return;

        const loadingToast = toast.loading(permanent ? 'Deleting rank...' : 'Trashing rank...');
        try {
            const url = `${config.restUrl}ranks/${id}${permanent ? '?permanent=1' : ''}`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                toast.success(permanent ? 'Rank deleted permanently!' : 'Rank moved to trash!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchRanks();
            } else {
                toast.error('Failed to perform action on rank.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Restore Rank
    const handleRestoreRank = async (id) => {
        const loadingToast = toast.loading('Restoring rank...');
        try {
            const res = await fetch(`${config.restUrl}ranks/${id}/restore`, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                toast.success('Rank restored!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchRanks();
            } else {
                toast.error('Failed to restore rank.', { id: loadingToast });
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
        if (!window.confirm(`Are you sure you want to ${actionText} ${selected.length} ranks?`)) return;

        const loadingToast = toast.loading('Applying bulk action...');
        try {
            const res = await fetch(`${config.restUrl}ranks/bulk`, {
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
                fetchRanks();
            } else {
                toast.error('Failed to apply bulk action.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    const totalPages = Math.ceil(totalItems / perPage) || 1;

    const addNewUrl = selectedPointType !== 'all' 
        ? `post-new.php?post_type=mycred_rank&ctype=${selectedPointType}`
        : config.addNewUrl || 'post-new.php?post_type=mycred_rank';

    if (loading && ranks.length === 0) {
        return <RanksSkeleton />;
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
                    <RanksHeader
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
                        addNewUrl={addNewUrl}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                    />

                    <RanksTable
                        ranks={ranks}
                        loading={loading}
                        selected={selected}
                        onSelectAll={handleSelectAll}
                        onSelectOne={handleSelectOne}
                        onDeleteRank={handleDeleteRank}
                        onRestoreRank={handleRestoreRank}
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
