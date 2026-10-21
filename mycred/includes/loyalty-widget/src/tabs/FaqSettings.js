import { useState } from '@wordpress/element';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
} from '@mui/material';
import { __ } from '@wordpress/i18n';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { toast } from 'react-hot-toast';
import { usePreviewSettings } from '../context/PreviewSettingsContext';
import { saveSectionSettings } from '../services/api';
import SectionHeader from '../components/admin/SectionHeader';
import SettingsCard from '../components/admin/SettingsCard';
import { useRegisterSaveActions } from '../context/SaveActionsContext';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import {
    getTabContentSx,
    getFieldLabelSx,
    getTextFieldSx,
    getEmptyStateSx,
    getFaqCardSx,
    getAddButtonSx,
    getSecondaryTextSx,
} from '../components/admin/formStyles';

const createFaqId = () => `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function FaqSettings() {
    const { colors } = useAdminTheme();
    const { faq, setFaq, updateFaq } = usePreviewSettings();
    const [loading, setLoading] = useState(false);

    const items = Array.isArray(faq?.items) ? faq.items : [];
    const screenTitle = faq?.screenTitle || __('FAQs', 'mycred');

    const handleTitleChange = (value) => {
        updateFaq({ screenTitle: value });
    };

    const handleItemChange = (id, field, value) => {
        updateFaq({
            items: items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
        });
    };

    const handleAdd = () => {
        if (items.length >= 20) {
            toast.error(__('You can add up to 20 FAQs.', 'mycred'));
            return;
        }
        updateFaq({
            items: [
                ...items,
                { id: createFaqId(), title: '', answer: '' },
            ],
        });
    };

    const handleRemove = (id) => {
        updateFaq({
            items: items.filter((item) => item.id !== id),
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                screenTitle: screenTitle || __('FAQs', 'mycred'),
                items: items
                    .map((item) => ({
                        id: item.id || createFaqId(),
                        title: (item.title || '').trim(),
                        answer: (item.answer || '').trim(),
                    }))
                    .filter((item) => item.title || item.answer),
            };
            const response = await saveSectionSettings('faq', payload);
            if (response.success) {
                setFaq(payload);
                if (window.mycredLoyaltyWidgetData) {
                    if (!window.mycredLoyaltyWidgetData.settings) window.mycredLoyaltyWidgetData.settings = {};
                    window.mycredLoyaltyWidgetData.settings.faq = payload;
                }
                toast.success(__('Settings saved successfully!', 'mycred'));
            } else {
                toast.error(response.message || __('Failed to save settings', 'mycred'));
            }
        } catch (error) {
            console.error('Failed to save FAQ settings:', error);
            toast.error(__('Failed to save settings', 'mycred'));
        } finally {
            setLoading(false);
        }
    };

    useRegisterSaveActions({
        onSave: handleSave,
        loading,
        label: __('Update Settings', 'mycred'),
    });

    return (
        <Box sx={getTabContentSx()}>
            <SettingsCard sx={{ mb: 3 }}>
                <SectionHeader
                    icon={HelpOutlineIcon}
                    title={__('FAQs', 'mycred')}
                    desc={__('Shown on the Modern template as a header pill. Visitors open a dedicated FAQ screen.', 'mycred')}
                />

                <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                    {__('Screen title', 'mycred')}
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    value={screenTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={__('FAQs', 'mycred')}
                    sx={{ ...getTextFieldSx(colors, { borderRadius: '8px' }), mb: 3 }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.length === 0 && (
                        <Box sx={getEmptyStateSx(colors)}>
                            <Typography sx={getSecondaryTextSx(colors)}>
                                {__('No FAQs yet. Add your first question below.', 'mycred')}
                            </Typography>
                        </Box>
                    )}

                    {items.map((item, index) => (
                        <Paper key={item.id || index} sx={getFaqCardSx(colors)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.primary }}>
                                    {__('FAQ', 'mycred')} #{index + 1}
                                </Typography>
                                <IconButton size="small" onClick={() => handleRemove(item.id)} aria-label={__('Remove FAQ', 'mycred')}>
                                    <DeleteOutlineIcon sx={{ fontSize: 20, color: colors.textMuted }} />
                                </IconButton>
                            </Box>
                            <Typography sx={{ ...getFieldLabelSx(colors), fontSize: 13, mb: 0.75 }}>
                                {__('Question', 'mycred')}
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={item.title || ''}
                                onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                placeholder={__('How do I earn points?', 'mycred')}
                                sx={{ ...getTextFieldSx(colors, { borderRadius: '8px' }), mb: 2 }}
                            />
                            <Typography sx={{ ...getFieldLabelSx(colors), fontSize: 13, mb: 0.75 }}>
                                {__('Answer', 'mycred')}
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                value={item.answer || ''}
                                onChange={(e) => handleItemChange(item.id, 'answer', e.target.value)}
                                placeholder={__('Complete actions listed under Earn to collect points.', 'mycred')}
                                sx={getTextFieldSx(colors, { borderRadius: '8px', height: 'auto' })}
                            />
                        </Paper>
                    ))}
                </Box>

                <Button
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={getAddButtonSx(colors)}
                >
                    {__('Add FAQ', 'mycred')}
                </Button>
            </SettingsCard>

        </Box>
    );
}
