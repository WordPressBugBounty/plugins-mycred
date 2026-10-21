import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Typography,
    Chip,
    Button,
    IconButton,
    Tooltip,
    Avatar,
    Badge
} from '@mui/material';
import {
    DeleteOutline as DeleteIcon,
    RestoreFromTrash as RestoreIcon,
    CheckCircleOutline as CreditIcon,
    EditOutlined as EditIcon,
    ChatBubbleOutline as CommentIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

export const PendingPaymentsTable = ({
    items,
    selected,
    onSelectAll,
    onSelectOne,
    onCredit,
    onDelete,
    onRestore,
    visibleColumns,
    activeTab
}) => {
    const { colors } = useAdminTheme();
    const isAllSelected = items.length > 0 && selected.length === items.length;
    const isIndeterminate = selected.length > 0 && selected.length < items.length;

    if (items.length === 0) {
        return (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography sx={{ color: colors.textSecondary, fontSize: '15px', fontWeight: 500 }}>
                    {activeTab === 'trash' ? 'No pending payments found in Trash.' : 'No pending payments found.'}
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            sx={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto !important',
                display: 'block',
                '&::-webkit-scrollbar': {
                    height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: colors.primary || '#7c3aed',
                    borderRadius: '4px',
                },
            }}
        >
            <Table sx={{ minWidth: 1050, width: '100%', '& th, & td': { whiteSpace: 'nowrap !important' } }}>
                <TableHead sx={{ bgcolor: colors.paperMuted }}>
                    <TableRow>
                        <TableCell padding="checkbox" sx={{ pl: 2, borderColor: colors.border }}>
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={isIndeterminate}
                                onChange={onSelectAll}
                                icon={<UncheckedIcon sx={{ fontSize: 20, color: colors.borderInput }} />}
                                checkedIcon={<CheckCircleIcon sx={{ fontSize: 20, color: colors.primary }} />}
                                size="small"
                                sx={{ p: 0.5 }}
                            />
                        </TableCell>
                        <TableCell sx={{ width: 40, px: 1, borderColor: colors.border }}>
                            <Tooltip title="Comments / Notes">
                                <CommentIcon sx={{ fontSize: 16, color: colors.tableHeaderText }} />
                            </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                            Transaction ID
                        </TableCell>

                        {visibleColumns.buyer && (
                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                                User
                            </TableCell>
                        )}
                        {visibleColumns.amount && (
                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                                Amount
                            </TableCell>
                        )}
                        {visibleColumns.cost && (
                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                                Cost
                            </TableCell>
                        )}
                        {visibleColumns.gateway && (
                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                                Gateway
                            </TableCell>
                        )}
                        {visibleColumns.ctype && (
                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                                Point Type
                            </TableCell>
                        )}
                        {visibleColumns.date && (
                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border }}>
                                Date
                            </TableCell>
                        )}

                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px', color: colors.tableHeaderText, borderColor: colors.border, pr: 3 }}>
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => {
                        const isSelected = selected.includes(item.id);
                        const commentsCount = parseInt(item.comments_count || 0, 10);

                        return (
                            <TableRow
                                key={item.id}
                                hover
                                selected={isSelected}
                                sx={{
                                    transition: 'background-color 0.15s ease',
                                    '&:hover': { bgcolor: colors.rowHover },
                                    '&.Mui-selected': { bgcolor: colors.sidebarActive }
                                }}
                            >
                                <TableCell padding="checkbox" sx={{ pl: 2, borderColor: colors.border }}>
                                    <Checkbox
                                        checked={isSelected}
                                        onChange={() => onSelectOne(item.id)}
                                        icon={<UncheckedIcon sx={{ fontSize: 20, color: colors.borderInput }} />}
                                        checkedIcon={<CheckCircleIcon sx={{ fontSize: 20, color: colors.primary }} />}
                                        size="small"
                                        sx={{ p: 0.5 }}
                                    />
                                </TableCell>

                                 {/* Comment count icon */}
                                 <TableCell sx={{ width: 40, px: 1, borderColor: colors.border }}>
                                     <IconButton
                                         component="a"
                                         href={item.edit_url}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         sx={{
                                             p: 0.5,
                                             color: commentsCount > 0 ? colors.primary : colors.borderInput,
                                             '&:hover': {
                                                 bgcolor: colors.primaryLight,
                                                 color: colors.primary
                                             }
                                         }}
                                     >
                                         {commentsCount > 0 ? (
                                             <Tooltip title={`${commentsCount} comment(s) (Click to view/add)`}>
                                                 <Badge badgeContent={commentsCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: 16, minWidth: 16, px: 0.5 } }}>
                                                     <CommentIcon sx={{ fontSize: 16 }} />
                                                 </Badge>
                                             </Tooltip>
                                         ) : (
                                             <Tooltip title="No comments (Click to view/add)">
                                                 <CommentIcon sx={{ fontSize: 16 }} />
                                             </Tooltip>
                                         )}
                                     </IconButton>
                                 </TableCell>

                                {/* Transaction ID */}
                                <TableCell sx={{ borderColor: colors.border }}>
                                    <Typography
                                        component="a"
                                        href={item.edit_url}
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            color: colors.primary,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                                color: colors.primaryHover,
                                            }
                                        }}
                                    >
                                        {item.title || `#${item.id}`}
                                    </Typography>
                                </TableCell>

                                {/* Buyer */}
                                {visibleColumns.buyer && (
                                    <TableCell sx={{ borderColor: colors.border }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                            <Avatar
                                                src={item.buyer_avatar}
                                                alt={item.buyer_name}
                                                sx={{ width: 28, height: 28, fontSize: '12px', bgcolor: colors.primaryLight, color: colors.primary }}
                                            >
                                                {item.buyer_name ? item.buyer_name.charAt(0).toUpperCase() : 'U'}
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 600, fontSize: '13.5px', color: colors.textPrimary }}>
                                                {item.buyer_name || 'Guest'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                )}

                                {/* Amount */}
                                {visibleColumns.amount && (
                                    <TableCell sx={{ borderColor: colors.border }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '14px', color: colors.primary }}>
                                            {item.formatted_amount || item.amount}
                                        </Typography>
                                    </TableCell>
                                )}

                                {/* Cost */}
                                {visibleColumns.cost && (
                                    <TableCell sx={{ borderColor: colors.border }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '13.5px', color: colors.textPrimary }}>
                                            {item.cost ? `${item.cost} ${item.currency || ''}` : '—'}
                                        </Typography>
                                    </TableCell>
                                )}

                                {/* Gateway */}
                                {visibleColumns.gateway && (
                                    <TableCell sx={{ borderColor: colors.border }}>
                                        <Chip
                                            label={item.gateway_title || item.gateway || 'Manual'}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(124,58,237,0.08)',
                                                color: colors.primary,
                                                fontWeight: 600,
                                                fontSize: '12px',
                                                borderRadius: '6px',
                                                height: '22px'
                                            }}
                                        />
                                    </TableCell>
                                )}

                                {/* Point Type */}
                                {visibleColumns.ctype && (
                                    <TableCell sx={{ borderColor: colors.border }}>
                                        <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>
                                            {item.point_type_label || item.point_type}
                                        </Typography>
                                    </TableCell>
                                )}

                                {/* Date */}
                                {visibleColumns.date && (
                                    <TableCell sx={{ borderColor: colors.border }}>
                                        <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>
                                            {item.date || '—'}
                                        </Typography>
                                    </TableCell>
                                )}

                                {/* Actions: Edit | Pay Out | Trash */}
                                <TableCell align="right" sx={{ borderColor: colors.border, pr: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                        {activeTab !== 'trash' ? (
                                            <>
                                                {/* Edit Link Button */}
                                                <Tooltip title="Edit Payment">
                                                    <IconButton
                                                        component="a"
                                                        href={item.edit_url}
                                                        size="small"
                                                        sx={{ color: colors.textSecondary, '&:hover': { color: colors.primary, bgcolor: colors.primaryLight } }}
                                                    >
                                                        <EditIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Pay Out / Credit button */}
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<CreditIcon sx={{ fontSize: 16 }} />}
                                                    onClick={() => onCredit(item.id)}
                                                    sx={{
                                                        bgcolor: colors.primary,
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        textTransform: 'none',
                                                        borderRadius: '6px',
                                                        px: 1.5,
                                                        py: 0.5,
                                                        boxShadow: 'none',
                                                        '&:hover': {
                                                            bgcolor: colors.primaryHover,
                                                            boxShadow: 'none'
                                                        }
                                                    }}
                                                >
                                                    Pay Out
                                                </Button>

                                                {/* Trash Icon Button */}
                                                <Tooltip title="Move to Trash">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(item.id)}
                                                        sx={{ color: colors.textMuted, '&:hover': { color: colors.danger, bgcolor: colors.dangerBg } }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        ) : (
                                            <>
                                                <Tooltip title="Restore">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onRestore(item.id)}
                                                        sx={{ color: colors.primary, '&:hover': { bgcolor: colors.primaryLight } }}
                                                    >
                                                        <RestoreIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Permanently">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(item.id, true)}
                                                        sx={{ color: colors.danger, '&:hover': { bgcolor: colors.dangerBg } }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
