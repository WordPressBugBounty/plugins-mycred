import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';
import { AchievementTypesHeader } from './AchievementTypesHeader';
import { AchievementTypesTable } from './AchievementTypesTable';
import { AchievementTypeModal } from './AchievementTypeModal';
import { AchievementTypesSkeleton } from './AchievementTypesSkeleton';

const DEFAULT_COLUMNS = {
    slug: true,
    description: true,
    count: true
};

export const AchievementTypesApp = () => {
    const { colors } = useAdminTheme();
    const config = window.mycredAchievementTypesData || {};

    const [items, setItems] = useState(config.initialItems || []);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(config.totalCount || (config.initialItems ? config.initialItems.length : 0));

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('mycred_achievement_types_columns');
            return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
        } catch { return DEFAULT_COLUMNS; }
    });

    const handleToggleColumn = (column) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [column]: !prev[column] };
            localStorage.setItem('mycred_achievement_types_columns', JSON.stringify(updated));
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

    // Fetch Achievement Types from REST API
    const fetchItems = useCallback(async () => {
        if (!config.restUrl) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: searchQuery,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const res = await fetch(`${config.restUrl}achievement-types?${params.toString()}`, {
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotalItems(data.total || 0);
            }
        } catch (err) {
            console.error('Error fetching achievement types:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, page, perPage, config.restUrl, config.nonce]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

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
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    // Create / Update Item via REST API
    const handleSaveItem = async (formData) => {
        setActionLoading(true);
        const isEditing = Boolean(formData.id);
        const loadingToast = toast.loading(isEditing ? 'Updating achievement type...' : 'Creating achievement type...');

        try {
            const url = isEditing
                ? `${config.restUrl}achievement-types/${formData.id}`
                : `${config.restUrl}achievement-types`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.nonce || ''
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(isEditing ? 'Achievement type updated!' : 'Achievement type created!', { id: loadingToast });
                setModalOpen(false);
                setEditingItem(null);
                fetchItems();
            } else {
                toast.error(data.message || 'Failed to save achievement type.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Item
    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this achievement type?')) return;

        const loadingToast = toast.loading('Deleting achievement type...');
        try {
            const res = await fetch(`${config.restUrl}achievement-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': config.nonce || ''
                }
            });

            if (res.ok) {
                toast.success('Achievement type deleted!', { id: loadingToast });
                setSelected((prev) => prev.filter((itemId) => itemId !== id));
                fetchItems();
            } else {
                toast.error('Failed to delete achievement type.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    // Apply Bulk Delete
    const handleApplyBulkAction = async () => {
        if (!bulkAction || selected.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selected.length} achievement types?`)) return;

        const loadingToast = toast.loading('Deleting selected items...');
        try {
            const res = await fetch(`${config.restUrl}achievement-types/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': config.nonce || ''
                },
                body: JSON.stringify({
                    ids: selected
                })
            });

            if (res.ok) {
                toast.success('Selected achievement types deleted!', { id: loadingToast });
                setSelected([]);
                setBulkAction('');
                fetchItems();
            } else {
                toast.error('Failed to apply bulk action.', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred.', { id: loadingToast });
        }
    };

    const totalPages = Math.ceil(totalItems / perPage) || 1;

    if (loading && items.length === 0) {
        return <AchievementTypesSkeleton />;
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
                    <AchievementTypesHeader
                        totalCount={totalItems}
                        searchQuery={searchQuery}
                        onSearchChange={(val) => {
                            setSearchQuery(val);
                            setPage(1);
                        }}
                        bulkAction={bulkAction}
                        onBulkActionChange={setBulkAction}
                        onApplyBulkAction={handleApplyBulkAction}
                        onOpenAddModal={handleOpenAddModal}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                    />

                    <AchievementTypesTable
                        items={items}
                        loading={loading}
                        selected={selected}
                        onSelectAll={handleSelectAll}
                        onSelectOne={handleSelectOne}
                        onEditItem={handleOpenEditModal}
                        onDeleteItem={handleDeleteItem}
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        visibleColumns={visibleColumns}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                </Paper>
            </Container>

            {/* Modal for Add / Edit */}
            <AchievementTypeModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveItem}
                editingItem={editingItem}
                categories={items}
                loading={actionLoading}
            />
        </Box>
    );
};

export default AchievementTypesApp;
