import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { BadgesHeader } from './components/BadgesHeader';
import { BadgesTable } from './components/BadgesTable';
import { BadgesSkeleton } from './components/BadgesSkeleton';

const DEFAULT_COLUMNS = {
    icon: true,
    requirements: true,
    users: true,
    achievement_type: true
};

export const App = () => {
    const { colors } = useAdminTheme();
    const config = window.mycredBadgesData || {};

    const [badges, setBadges] = useState(config.initialBadges || []);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(config.categories || []);
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(config.totalCount || (config.initialBadges ? config.initialBadges.length : 0));
    const [counts, setCounts] = useState(config.counts || { all: totalItems, publish: totalItems, trash: 0 });

    // Settings state
    const [perPage, setPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('mycred_badges_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_badges_columns', JSON.stringify(updated));
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

    // Fetch Badges from REST API
    const fetchBadges = useCallback(async () => {
        if (!config.restUrl) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: activeTab,
                search: searchQuery,
                category: selectedCategory,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${config.restUrl}badges?${params.toString()}`, {
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                const data = await res.json();
                setBadges(data.items || []);
                setTotalItems(data.total || 0);
                if (data.counts) setCounts(data.counts);
                if (data.categories) setCategories(data.categories);
            }
        } catch (err) {
            console.error('Error fetching badges:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery, selectedCategory, page, perPage, config.restUrl, config.nonce]);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    // Handle Select All
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(badges.map((b) => b.id));
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

    // Trash / Delete Badge
    const handleDeleteBadge = async (badgeId, permanent = false) => {
        const actionText = permanent ? 'permanently delete' : 'trash';
        if (!window.confirm(`Are you sure you want to ${actionText} this badge?`)) return;

        const loadingToast = toast.loading(`${permanent ? 'Deleting' : 'Trashing'} badge...`);
        try {
            const res = await fetch(`${config.restUrl}badges/${badgeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.nonce || ''
                },
                body: JSON.stringify({ permanent })
            });

            if (res.ok) {
                toast.success(`Badge ${permanent ? 'deleted' : 'moved to trash'}!`, { id: loadingToast });
                setSelected((prev) => prev.filter((id) => id !== badgeId));
                fetchBadges();
            } else {
                toast.error('Failed to update badge status.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Restore Badge
    const handleRestoreBadge = async (badgeId) => {
        const loadingToast = toast.loading('Restoring badge...');
        try {
            const res = await fetch(`${config.restUrl}badges/${badgeId}/restore`, {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                toast.success('Badge restored successfully!', { id: loadingToast });
                setSelected((prev) => prev.filter((id) => id !== badgeId));
                fetchBadges();
            } else {
                toast.error('Failed to restore badge.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Apply Bulk Action
    const handleApplyBulkAction = async () => {
        if (!bulkAction || selected.length === 0) return;

        const loadingToast = toast.loading('Applying bulk action...');
        try {
            const res = await fetch(`${config.restUrl}badges/bulk`, {
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
                toast.success('Bulk action completed!', { id: loadingToast });
                setSelected([]);
                setBulkAction('');
                fetchBadges();
            } else {
                toast.error('Failed to apply bulk action.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    const totalPages = Math.ceil(totalItems / perPage) || 1;

    if (loading && badges.length === 0) {
        return <BadgesSkeleton />;
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
                    <BadgesHeader
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
                        selectedCategory={selectedCategory}
                        onCategoryChange={(val) => {
                            setSelectedCategory(val);
                            setPage(1);
                        }}
                        categories={categories}
                        counts={counts}
                        bulkAction={bulkAction}
                        onBulkActionChange={setBulkAction}
                        onApplyBulkAction={handleApplyBulkAction}
                        addNewUrl={config.addNewUrl || 'post-new.php?post_type=mycred_badge'}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />

                    <BadgesTable
                        badges={badges}
                        loading={loading}
                        selected={selected}
                        onSelectAll={handleSelectAll}
                        onSelectOne={handleSelectOne}
                        onDeleteBadge={handleDeleteBadge}
                        onRestoreBadge={handleRestoreBadge}
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
