import { useState } from '@wordpress/element';
import {
    Box,
    Typography,
    Paper,
    Button,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { __ } from '@wordpress/i18n';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { saveSectionSettings } from '../services/api';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '../components/admin/ToggleSwitch';
import SectionHeader from '../components/admin/SectionHeader';
import SettingsCard from '../components/admin/SettingsCard';
import { useRegisterSaveActions } from '../context/SaveActionsContext';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import { getTabContentSx, getFormStackSx } from '../components/admin/formStyles';
import { mergeHookAdminState, getDefaultDisplayDescription } from '../hookDisplayDefaults';
import { usePreviewSettings } from '../context/PreviewSettingsContext';

const HookItem = ({
    title,
    description,
    checked,
    onChange,
    displayLabel,
    onLabelChange,
    displayDescription,
    onDescriptionChange,
    descriptionPlaceholder,
    pointTypeLabel,
}) => {
    const { colors } = useAdminTheme();

    return (
        <Box sx={{
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            p: 2,
            mb: 2,
            bgcolor: checked ? colors.sidebarActive : colors.paper,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.textPrimary }}>
                            {title}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '12px',
                                color: colors.primary,
                                bgcolor: colors.primaryLight,
                                px: 1,
                                py: 0.25,
                                borderRadius: '4px',
                                fontWeight: 600
                            }}
                        >
                            {pointTypeLabel || __('Points', 'mycred')}
                        </Typography>
                    </Box>
                    {description ? (
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75 }}>
                                {__('Hook documentation (admin)', 'mycred')}
                            </Typography>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: '13px',
                                    color: colors.textSecondary,
                                    overflowWrap: 'anywhere',
                                    wordBreak: 'break-word',
                                    '& a': { color: colors.primary },
                                }}
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        </Box>
                    ) : null}

                    {checked && (
                        <Box sx={{ mt: 2, pl: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                                    {__('Display Label in Widget', 'mycred')}
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: colors.paper,
                                    border: `1px solid ${colors.borderInput}`,
                                    borderRadius: '8px',
                                    px: 2,
                                    py: 1,
                                }}>
                                    <Box
                                        component="input"
                                        value={displayLabel || ''}
                                        onChange={(e) => onLabelChange(e.target.value)}
                                        placeholder={__('Enter custom label...', 'mycred')}
                                        sx={{
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '14px',
                                            width: '100%',
                                            px: 2,
                                            py: 1.2,
                                            fontFamily: 'inherit',
                                            bgcolor: 'transparent',
                                            '&::placeholder': { color: colors.textMuted }
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                                    {__('Short Description in Widget', 'mycred')}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: colors.textSecondary, mb: 1 }}>
                                    {__('Shown under the title on the Earn tab.', 'mycred')}
                                </Typography>
                                <Box sx={{
                                    bgcolor: colors.paper,
                                    border: `1px solid ${colors.borderInput}`,
                                    borderRadius: '8px',
                                    px: 2,
                                    py: 1,
                                }}>
                                    <Box
                                        component="textarea"
                                        value={displayDescription || ''}
                                        onChange={(e) => onDescriptionChange(e.target.value)}
                                        placeholder={descriptionPlaceholder || __('Short description for members...', 'mycred')}
                                        rows={2}
                                        sx={{
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '14px',
                                            width: '100%',
                                            resize: 'vertical',
                                            minHeight: 52,
                                            maxHeight: 120,
                                            px: 1,
                                            py: 0.75,
                                            fontFamily: 'inherit',
                                            bgcolor: 'transparent',
                                            lineHeight: 1.45,
                                            '&::placeholder': { color: colors.textMuted }
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                    <ToggleSwitch checked={checked} onChange={onChange} />
                </Box>
            </Box>
        </Box>
    );
};


const mapHooksWithSaved = (activeHooksData, category, savedList) => (
    activeHooksData
        .filter((h) => h.category === category)
        .map((hook) => {
            const savedHook = (savedList || []).find(
                (s) => String(s.id) === String(hook.id) && String(s.point_type) === String(hook.point_type)
            );
            return mergeHookAdminState(hook, savedHook);
        })
);

export default function EventTriggersSettings() {
    const { colors } = useAdminTheme();
    const { syncFromSaved } = usePreviewSettings();
    const initialTriggers = window.mycredLoyaltyWidgetData?.settings?.eventtriggers || {};
    const activeHooksData = window.mycredLoyaltyWidgetData?.active_hooks || [];

    // Extract unique point types
    const availablePointTypes = [
        { id: 'all', label: __('All Type', 'mycred') },
        ...Array.from(new Set(activeHooksData.map(h => JSON.stringify({ id: h.point_type, label: h.type_label }))))
            .map(s => JSON.parse(s))
    ];

    const [selectedPointType, setSelectedPointType] = useState('all');
    const [enableHooks, setEnableHooks] = useState(initialTriggers.enableHooks !== undefined ? initialTriggers.enableHooks : true);
    const [loading, setLoading] = useState(false);

    // Filtered hooks based on dynamic data
    const [wordpressHooks, setWordpressHooks] = useState(() => mapHooksWithSaved(activeHooksData, 'wordpress', initialTriggers.wordpressHooks));
    const [woocommerceHooks, setWoocommerceHooks] = useState(() => mapHooksWithSaved(activeHooksData, 'woocommerce', initialTriggers.woocommerceHooks));
    const [buddypressHooks, setBuddypressHooks] = useState(() => mapHooksWithSaved(activeHooksData, 'buddypress', initialTriggers.buddypressHooks));
    const [forumHooks, setForumHooks] = useState(() => mapHooksWithSaved(activeHooksData, 'forum', initialTriggers.forumHooks));

    const handleHookChange = (category, hookId, pointType, enabled) => {
        const setters = {
            wordpress: setWordpressHooks,
            woocommerce: setWoocommerceHooks,
            buddypress: setBuddypressHooks,
            forum: setForumHooks
        };

        setters[category](prev => prev.map(hook =>
            (hook.id === hookId && hook.point_type === pointType) ? { ...hook, enabled } : hook
        ));
    };

    const handleLabelChange = (category, hookId, pointType, displayLabel) => {
        const setters = {
            wordpress: setWordpressHooks,
            woocommerce: setWoocommerceHooks,
            buddypress: setBuddypressHooks,
            forum: setForumHooks
        };

        setters[category](prev => prev.map(hook =>
            (hook.id === hookId && hook.point_type === pointType) ? { ...hook, displayLabel } : hook
        ));
    };

    const handleDescriptionChange = (category, hookId, pointType, displayDescription) => {
        const setters = {
            wordpress: setWordpressHooks,
            woocommerce: setWoocommerceHooks,
            buddypress: setBuddypressHooks,
            forum: setForumHooks
        };

        setters[category](prev => prev.map(hook =>
            (hook.id === hookId && hook.point_type === pointType) ? { ...hook, displayDescription } : hook
        ));
    };

    const serializeHooksForSave = (hooks) => hooks.map(({ id, point_type, enabled, displayLabel, displayDescription }) => ({
        id,
        point_type,
        enabled,
        displayLabel: displayLabel || '',
        displayDescription: displayDescription || '',
    }));

    const handleSave = async () => {
        setLoading(true);
        try {
            const dataToSave = {
                enableHooks,
                wordpressHooks: serializeHooksForSave(wordpressHooks),
                woocommerceHooks: serializeHooksForSave(woocommerceHooks),
                buddypressHooks: serializeHooksForSave(buddypressHooks),
                forumHooks: serializeHooksForSave(forumHooks),
            };
            const response = await saveSectionSettings('eventtriggers', dataToSave);
            if (response.success) {
                toast.success(__('Settings saved successfully!', 'mycred'));
                if (window.mycredLoyaltyWidgetData) {
                    if (!window.mycredLoyaltyWidgetData.settings) {
                        window.mycredLoyaltyWidgetData.settings = {};
                    }
                    window.mycredLoyaltyWidgetData.settings.eventtriggers = dataToSave;
                }
                syncFromSaved('eventtriggers', dataToSave);
            } else {
                toast.error(response.message || __('Failed to save settings', 'mycred'));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
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
            <Box sx={getFormStackSx()}>
                {/* myCred Hooks */}
                <Accordion
                    defaultExpanded
                    sx={{
                        width: '100%',
                        borderRadius: '8px !important',
                        boxShadow: 'none',
                        border: `1px solid ${colors.border}`,
                        bgcolor: colors.paper,
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': { margin: 0 },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            px: '24px',
                            py: 2,
                            minHeight: 72,
                            '& .MuiAccordionSummary-content': { my: 1.5 },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <FlashOnIcon sx={{ color: colors.primary, fontSize: 20 }} />
                            <Box>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>
                                    {__('myCred Hooks', 'mycred')}
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>
                                    {__('Enable automatic point rewards based on user actions.', 'mycred')}
                                </Typography>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 2.5 }}>
                        <Box sx={{ mb: 3, pb: 3, borderBottom: `1px solid ${colors.border}` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors.textPrimary }}>
                                        {__('Show Triggers in widget', 'mycred')}
                                    </Typography>
                                    <Typography sx={{ fontSize: '13px', color: colors.textSecondary, mt: 1 }}>
                                        {__('Select which myCred Hooks to display in the loyalty widget', 'mycred')}
                                    </Typography>
                                </Box>
                                <ToggleSwitch
                                    checked={enableHooks}
                                    onChange={(e) => setEnableHooks(e.target.checked)}
                                />
                            </Box>
                        </Box>

                        {enableHooks && (
                            <Box>
                                {availablePointTypes.length > 2 && (
                                    <Tabs
                                        value={selectedPointType}
                                        onChange={(e, val) => setSelectedPointType(val)}
                                        sx={{
                                            mb: 3,
                                            borderBottom: `1px solid ${colors.border}`,
                                            '& .MuiTabs-indicator': { backgroundColor: colors.primary },
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                color: colors.textSecondary,
                                                minWidth: 'auto',
                                                px: 3,
                                                '&.Mui-selected': { color: colors.primary }
                                            }
                                        }}
                                    >
                                        {availablePointTypes.map(type => (
                                            <Tab key={type.id} label={type.label} value={type.id} />
                                        ))}
                                    </Tabs>
                                )}

                                {[['wordpress', wordpressHooks, __('myCred Hooks', 'mycred')], 
                                  ['woocommerce', woocommerceHooks, __('WooCommerce Hooks', 'mycred')], 
                                  ['buddypress', buddypressHooks, __('BuddyPress Hooks', 'mycred')], 
                                  ['forum', forumHooks, __('Forum Hooks', 'mycred')]]
                                    .filter(([cat, hooks]) => hooks.filter(h => selectedPointType === 'all' || h.point_type === selectedPointType).length > 0)
                                    .map(([cat, hooks, catLabel]) => (
                                        <Box key={cat} sx={{ mb: 4 }}>
                                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: colors.primary, mb: 2 }}>
                                                {catLabel}
                                            </Typography>
                                            {hooks
                                                .filter(h => selectedPointType === 'all' || h.point_type === selectedPointType)
                                                .map((hook) => (
                                                    <HookItem
                                                        key={`${hook.id}-${hook.point_type}`}
                                                        title={hook.title}
                                                        description={hook.description}
                                                        checked={hook.enabled}
                                                        onChange={(e) => handleHookChange(cat, hook.id, hook.point_type, e.target.checked)}
                                                        displayLabel={hook.displayLabel}
                                                        onLabelChange={(val) => handleLabelChange(cat, hook.id, hook.point_type, val)}
                                                        displayDescription={hook.displayDescription}
                                                        onDescriptionChange={(val) => handleDescriptionChange(cat, hook.id, hook.point_type, val)}
                                                        descriptionPlaceholder={getDefaultDisplayDescription(hook)}
                                                        pointTypeLabel={hook.type_label}
                                                    />
                                                ))}
                                        </Box>
                                    ))}
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>

            </Box>
        </Box>
    );
}
