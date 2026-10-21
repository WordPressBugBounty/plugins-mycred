import { useState } from '@wordpress/element';
import {
    Box,
    Typography,
    TextField,
    Divider,
} from '@mui/material';
import { __ } from '@wordpress/i18n';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'react-hot-toast';
import { usePreviewSettings } from '../context/PreviewSettingsContext';
import { saveSectionSettings } from '../services/api';
import SectionHeader from '../components/admin/SectionHeader';
import SettingsCard from '../components/admin/SettingsCard';
import SaveResetBar from '../components/admin/SaveResetBar';
import ToggleSwitch from '../components/admin/ToggleSwitch';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import {
    getTabContentSx,
    getFieldLabelSx,
    getTextFieldSx,
    getSecondaryTextSx,
} from '../components/admin/formStyles';

const DEFAULT_SOCIAL = {
    facebook: true,
    twitter: true,
    whatsapp: true,
    telegram: true,
    email: true,
};

const SOCIAL_OPTIONS = [
    { key: 'facebook', label: __('Facebook', 'mycred'), hint: __('Share link on Facebook', 'mycred') },
    { key: 'twitter', label: __('X (Twitter)', 'mycred'), hint: __('Share link on X', 'mycred') },
    { key: 'whatsapp', label: __('WhatsApp', 'mycred'), hint: __('Share link via WhatsApp', 'mycred') },
    { key: 'telegram', label: __('Telegram', 'mycred'), hint: __('Share link via Telegram', 'mycred') },
    { key: 'email', label: __('Email', 'mycred'), hint: __('Share link by email', 'mycred') },
];

const ToggleRow = ({ colors, title, description, checked, onChange, showDivider = true }) => (
    <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box sx={{ pr: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors?.textPrimary }}>
                    {title}
                </Typography>
                {description ? (
                    <Typography sx={{ ...getSecondaryTextSx(colors), mt: 0.5 }}>
                        {description}
                    </Typography>
                ) : null}
            </Box>
            <ToggleSwitch checked={checked} onChange={onChange} />
        </Box>
        {showDivider && <Divider />}
    </>
);

export default function ReferralSettings() {
    const { colors } = useAdminTheme();
    const { referral, setReferral, updateReferral } = usePreviewSettings();
    const [loading, setLoading] = useState(false);

    const screenTitle = referral?.screenTitle || __('Refer & Earn', 'mycred');
    const introText = referral?.introText || '';
    const shareMessage = referral?.shareMessage || '';
    const showVisit = referral?.showVisit !== false;
    const showSignup = referral?.showSignup !== false;
    const showProduct = referral?.showProduct !== false;
    const social = { ...DEFAULT_SOCIAL, ...(referral?.social || {}) };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                screenTitle: screenTitle || __('Refer & Earn', 'mycred'),
                introText: (introText || '').trim(),
                shareMessage: (shareMessage || '').trim(),
                showVisit,
                showSignup,
                showProduct,
                social: {
                    facebook: !!social.facebook,
                    twitter: !!social.twitter,
                    whatsapp: !!social.whatsapp,
                    telegram: !!social.telegram,
                    email: !!social.email,
                },
            };
            const response = await saveSectionSettings('referral', payload);
            if (response.success) {
                setReferral(payload);
                if (window.mycredLoyaltyWidgetData) {
                    if (!window.mycredLoyaltyWidgetData.settings) window.mycredLoyaltyWidgetData.settings = {};
                    window.mycredLoyaltyWidgetData.settings.referral = payload;
                }
                toast.success(__('Settings saved successfully!', 'mycred'));
            } else {
                toast.error(response.message || __('Failed to save settings', 'mycred'));
            }
        } catch (error) {
            console.error('Failed to save referral settings:', error);
            toast.error(__('Failed to save settings', 'mycred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={getTabContentSx()}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <SettingsCard>
                    <SectionHeader
                        icon={ShareIcon}
                        title={__('Referral', 'mycred')}
                        desc={__('Copy, layout and social share options for the widget Refer tab.', 'mycred')}
                    />

                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                        {__('Screen title', 'mycred')}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={screenTitle}
                        onChange={(e) => updateReferral({ screenTitle: e.target.value })}
                        placeholder={__('Refer & Earn', 'mycred')}
                        sx={{ ...getTextFieldSx(colors, { borderRadius: '8px' }), mb: 3 }}
                    />

                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                        {__('Intro text', 'mycred')}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        value={introText}
                        onChange={(e) => updateReferral({ introText: e.target.value })}
                        placeholder={__('Invite friends with your link and earn points when they visit or sign up.', 'mycred')}
                        sx={{ ...getTextFieldSx(colors, { borderRadius: '8px' }), mb: 3 }}
                    />

                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                        {__('Share message', 'mycred')}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={shareMessage}
                        onChange={(e) => updateReferral({ shareMessage: e.target.value })}
                        placeholder={__('Join me and earn rewards!', 'mycred')}
                        sx={getTextFieldSx(colors, { borderRadius: '8px' })}
                    />
                    <Typography sx={{ ...getSecondaryTextSx(colors), mt: 1 }}>
                        {__('Used as the text for WhatsApp, X, Telegram and email shares. The referral link is appended automatically.', 'mycred')}
                    </Typography>
                </SettingsCard>

                <SettingsCard>
                    <SectionHeader
                        icon={ShareIcon}
                        title={__('Sections', 'mycred')}
                        desc={__('Choose which referral types appear in the widget.', 'mycred')}
                    />
                    <ToggleRow
                        colors={colors}
                        title={__('Visitor referral', 'mycred')}
                        description={__('Show visit rewards and visitor count', 'mycred')}
                        checked={showVisit}
                        onChange={(e) => updateReferral({ showVisit: e.target.checked })}
                    />
                    <ToggleRow
                        colors={colors}
                        title={__('Signup referral', 'mycred')}
                        description={__('Show signup rewards and signup count', 'mycred')}
                        checked={showSignup}
                        onChange={(e) => updateReferral({ showSignup: e.target.checked })}
                    />
                    <ToggleRow
                        colors={colors}
                        title={__('Product referral', 'mycred')}
                        description={__('Show WooCommerce product link generator (Pro)', 'mycred')}
                        checked={showProduct}
                        onChange={(e) => updateReferral({ showProduct: e.target.checked })}
                        showDivider={false}
                    />
                </SettingsCard>

                <SettingsCard>
                    <SectionHeader
                        icon={ShareIcon}
                        title={__('Social share links', 'mycred')}
                        desc={__('Enable quick-share buttons next to the referral link.', 'mycred')}
                    />
                    {SOCIAL_OPTIONS.map((opt, index) => (
                        <ToggleRow
                            key={opt.key}
                            colors={colors}
                            title={opt.label}
                            description={opt.hint}
                            checked={!!social[opt.key]}
                            onChange={(e) => updateReferral({
                                social: { ...social, [opt.key]: e.target.checked },
                            })}
                            showDivider={index < SOCIAL_OPTIONS.length - 1}
                        />
                    ))}
                </SettingsCard>

                <SaveResetBar
                    onSave={handleSave}
                    loading={loading}
                    saveLabel={loading ? __('Saving...', 'mycred') : __('Save Settings', 'mycred')}
                />
            </Box>
        </Box>
    );
}
