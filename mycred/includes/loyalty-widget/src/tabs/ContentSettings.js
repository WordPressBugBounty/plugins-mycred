import { useState, useEffect } from '@wordpress/element';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    FormControl,
    TextField,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { __ } from '@wordpress/i18n';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import { usePreviewSettings } from '../context/PreviewSettingsContext';
import { saveSectionSettings } from '../services/api';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '../components/admin/ToggleSwitch';
import SectionHeader from '../components/admin/SectionHeader';
import SettingsCard from '../components/admin/SettingsCard';
import { useRegisterSaveActions } from '../context/SaveActionsContext';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import { getTabContentSx, getFieldLabelSx, getTextFieldSx, getTabsSx, getAccordionSx, getAccordionSummarySx } from '../components/admin/formStyles';

const contentFieldsGridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 2.5,
    '& > *': { mb: 0 },
};

const MessageField = ({ colors, label, value, onChange, disabled = false }) => (
    <Box sx={{ mb: 3.5, '&:last-child': { mb: 0 }, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
            <Typography sx={getFieldLabelSx(colors)}>{label}</Typography>
        </Box>
        <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            sx={getTextFieldSx(colors, { minWidth: { xs: 220, sm: 240 } })}
        />
    </Box>
);

export default function ContentSettings() {
    const { colors } = useAdminTheme();
    const hasWoo = Boolean(window.mycredLoyaltyWidgetData?.has_woocommerce);
    const { content, updateContent, setPreviewGuest } = usePreviewSettings();
    const guestSettings = content.guest || {};
    const memberSettings = content.member || {};

    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        setPreviewGuest(activeTab === 0);
    }, [activeTab, setPreviewGuest]);
    const [previewTab, setPreviewTab] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleGuestChange = (field, value) => {
        updateContent('guest', { [field]: value });
    };

    const handleMemberChange = (field, value) => {
        updateContent('member', { [field]: value });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handlePreviewTabChange = (event, newValue) => {
        setPreviewTab(newValue);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const dataToSave = { guest: guestSettings, member: memberSettings };
            const response = await saveSectionSettings('content', dataToSave);
            if (response.success) {
                toast.success(__('Settings saved successfully!', 'mycred'));
                if (window.mycredLoyaltyWidgetData) {
                    if (!window.mycredLoyaltyWidgetData.settings) window.mycredLoyaltyWidgetData.settings = {};
                    window.mycredLoyaltyWidgetData.settings.content = dataToSave;
                }
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
            <SettingsCard>
                        <SectionHeader
                            icon={DescriptionIcon}
                            title={__('Content Settings', 'mycred')}
                            desc={__('Customize messages for guest users and members', 'mycred')}
                        />

                        {/* Tabs for Guest User / Member */}
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={getTabsSx(colors)}
                        >
                            <Tab label={__('Guest User', 'mycred')} />
                            <Tab label={__('Member', 'mycred')} />
                        </Tabs>

                        {/* Guest User Settings */}
                        {activeTab === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* General Messages Accordion */}
                                <Accordion defaultExpanded sx={getAccordionSx(colors)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={getAccordionSummarySx(colors)}>
                                        <Typography>{__('General Messages', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={contentFieldsGridSx}>
                                            <MessageField
                                                colors={colors}
                                                label={__('Join Card Title', 'mycred')}
                                                value={guestSettings.joinCardTitle || ''}
                                                onChange={(v) => handleGuestChange('joinCardTitle', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Join Card Description', 'mycred')}
                                                value={guestSettings.joinCardDescription || ''}
                                                onChange={(v) => handleGuestChange('joinCardDescription', v)}
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Navigation Labels Accordion */}
                                <Accordion sx={getAccordionSx(colors)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={getAccordionSummarySx(colors)}>
                                        <Typography>{__('Navigation Labels', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={contentFieldsGridSx}>
                                            <MessageField
                                                colors={colors}
                                                label={__('Earn Label', 'mycred')}
                                                value={guestSettings.earnLabel}
                                                onChange={(v) => handleGuestChange('earnLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Redeem Label', 'mycred')}
                                                value={guestSettings.redeemLabel}
                                                onChange={(v) => handleGuestChange('redeemLabel', v)}
                                                disabled={!hasWoo}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Board Label', 'mycred')}
                                                value={guestSettings.boardLabel}
                                                onChange={(v) => handleGuestChange('boardLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Ranks Label', 'mycred')}
                                                value={guestSettings.ranksLabel}
                                                onChange={(v) => handleGuestChange('ranksLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Badges Label', 'mycred')}
                                                value={guestSettings.badgesLabel}
                                                onChange={(v) => handleGuestChange('badgesLabel', v)}
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Tab Content Headings Accordion */}
                                <Accordion sx={getAccordionSx(colors)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={getAccordionSummarySx(colors)}>
                                        <Typography>{__('Tab Content Headings', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={contentFieldsGridSx}>
                                            <MessageField
                                                colors={colors}
                                                label={__('Earn Heading', 'mycred')}
                                                value={guestSettings.earnMessage}
                                                onChange={(v) => handleGuestChange('earnMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Redeem Heading', 'mycred')}
                                                value={guestSettings.redeemMessage}
                                                onChange={(v) => handleGuestChange('redeemMessage', v)}
                                                disabled={!hasWoo}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Board Heading', 'mycred')}
                                                value={guestSettings.boardMessage}
                                                onChange={(v) => handleGuestChange('boardMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Ranks Heading', 'mycred')}
                                                value={guestSettings.ranksMessage}
                                                onChange={(v) => handleGuestChange('ranksMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Badges Heading', 'mycred')}
                                                value={guestSettings.badgesMessage}
                                                onChange={(v) => handleGuestChange('badgesMessage', v)}
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Buttons & Redirects Accordion */}
                                <Accordion sx={getAccordionSx(colors)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={getAccordionSummarySx(colors)}>
                                        <Typography>{__('Buttons & Redirects', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={{ ...contentFieldsGridSx, mb: 2.5 }}>
                                            <Box>
                                                <Typography sx={{ ...getFieldLabelSx(colors), mb: 1.25 }}>
                                                    {__('Join Now Redirect Page', 'mycred')}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={guestSettings.joinRedirect}
                                                    onChange={(e) => handleGuestChange('joinRedirect', e.target.value)}
                                                    sx={getTextFieldSx(colors, { minWidth: { xs: 220, sm: 240 } })}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography sx={{ ...getFieldLabelSx(colors), mb: 1.25 }}>
                                                    {__('Login Redirect Page', 'mycred')}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={guestSettings.loginRedirect}
                                                    onChange={(e) => handleGuestChange('loginRedirect', e.target.value)}
                                                    sx={getTextFieldSx(colors, { minWidth: { xs: 220, sm: 240 } })}
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={contentFieldsGridSx}>
                                            <MessageField
                                                colors={colors}
                                                label={__('Join Now Button Text', 'mycred')}
                                                value={guestSettings.joinButtonText}
                                                onChange={(v) => handleGuestChange('joinButtonText', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Sign In Link Text', 'mycred')}
                                                value={guestSettings.loginButtonText}
                                                onChange={(v) => handleGuestChange('loginButtonText', v)}
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* Member Settings */}
                        {activeTab === 1 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>


                                {/* Navigation Labels Accordion */}
                                <Accordion sx={getAccordionSx(colors)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={getAccordionSummarySx(colors)}>
                                        <Typography>{__('Navigation Labels', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={contentFieldsGridSx}>
                                            <MessageField
                                                colors={colors}
                                                label={__('Earn Label', 'mycred')}
                                                value={memberSettings.earnLabel}
                                                onChange={(v) => handleMemberChange('earnLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Redeem Label', 'mycred')}
                                                value={memberSettings.redeemLabel}
                                                onChange={(v) => handleMemberChange('redeemLabel', v)}
                                                disabled={!hasWoo}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Board Label', 'mycred')}
                                                value={memberSettings.boardLabel}
                                                onChange={(v) => handleMemberChange('boardLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('History Label', 'mycred')}
                                                value={memberSettings.logsLabel}
                                                onChange={(v) => handleMemberChange('logsLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Profile Label', 'mycred')}
                                                value={memberSettings.profileLabel}
                                                onChange={(v) => handleMemberChange('profileLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Ranks Label', 'mycred')}
                                                value={memberSettings.ranksLabel}
                                                onChange={(v) => handleMemberChange('ranksLabel', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Badges Label', 'mycred')}
                                                value={memberSettings.badgesLabel}
                                                onChange={(v) => handleMemberChange('badgesLabel', v)}
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Tab Headings Accordion */}
                                <Accordion sx={getAccordionSx(colors)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={getAccordionSummarySx(colors)}>
                                        <Typography>{__('Tab Headings', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={contentFieldsGridSx}>
                                            <MessageField
                                                colors={colors}
                                                label={__('Earn Heading', 'mycred')}
                                                value={memberSettings.earnMessage}
                                                onChange={(v) => handleMemberChange('earnMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Redeem Heading', 'mycred')}
                                                value={memberSettings.redeemMessage}
                                                onChange={(v) => handleMemberChange('redeemMessage', v)}
                                                disabled={!hasWoo}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Board Heading', 'mycred')}
                                                value={memberSettings.boardMessage}
                                                onChange={(v) => handleMemberChange('boardMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Logs Heading', 'mycred')}
                                                value={memberSettings.logsMessage}
                                                onChange={(v) => handleMemberChange('logsMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Profile Heading', 'mycred')}
                                                value={memberSettings.profileMessage}
                                                onChange={(v) => handleMemberChange('profileMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Ranks Heading', 'mycred')}
                                                value={memberSettings.ranksMessage}
                                                onChange={(v) => handleMemberChange('ranksMessage', v)}
                                            />
                                            <MessageField
                                                colors={colors}
                                                label={__('Badges Heading', 'mycred')}
                                                value={memberSettings.badgesMessage}
                                                onChange={(v) => handleMemberChange('badgesMessage', v)}
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>


                            </Box>
                        )}

            </SettingsCard>
        </Box>
    );
}
