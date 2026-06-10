import { useState } from '@wordpress/element';
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';
import WidgetPreview from '../components/WidgetPreview';
import { saveSectionSettings } from '../services/api';
import { toast } from 'react-hot-toast';

const SectionHeader = ({ icon: Icon, title, desc }) => (
    <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Icon sx={{ color: '#5E2CED', fontSize: 20 }} />
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>{title}</Typography>
        </Box>
        <Typography sx={{ fontSize: '14px', color: '#666' }}>{desc}</Typography>
    </Box>
);

const MessageField = ({ label, value, onChange, disabled = false }) => (
    <Box sx={{ mb: 3, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{label}</Typography>
            {disabled && (
                <Box sx={{
                    bgcolor: '#F5F3FF',
                    color: '#5E2CED',
                    fontSize: '10px',
                    fontWeight: 700,
                    px: 1,
                    py: 0.25,
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    border: '1px solid #DDD6FE'
                }}>
                    {__('Pro', 'mycred')}
                </Box>
            )}
        </Box>
        <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            sx={{
                minWidth: { xs: 220, sm: 240 },
                // Reset defaults
                '& .MuiOutlinedInput-root': {
                    height: 40,
                    borderRadius: '10px',
                    backgroundColor: '#fff !important',
                    transition: 'all 0.2s ease-in-out',
                    // Ensure single border via fieldset
                    '& fieldset': {
                        borderColor: '#E6E0F8 !important',
                        borderWidth: '1px !important',
                    },
                    '&:hover fieldset': {
                        borderColor: '#D9D0FF !important',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#5E2CED !important',
                        borderWidth: '1px !important', // Keep it 1px to avoid "thick" double look if that's the issue, or standard 2px is fine if single.
                        // User complained about double borders, often due to box-shadow or unexpected outline.
                        // We'll trust standard MUI fieldset behavior but ensure colors.
                    },
                    // Fix for potential WP-Admin global style leaks on input
                    '& .MuiOutlinedInput-input': {
                        padding: '10px 12px',
                        fontSize: '14px',
                        boxShadow: 'none !important', // creating potential double border look
                        outline: 'none !important',
                        border: 'none !important',
                        backgroundColor: 'transparent !important',
                    }
                }
            }}
        />
    </Box>
);

export default function ContentSettings() {
    const isPro = window.mycredLoyaltyWidgetData?.is_toolkit_pro_active || false;
    const initialContent = window.mycredLoyaltyWidgetData?.settings?.content || {};

    const [activeTab, setActiveTab] = useState(0);
    const [previewTab, setPreviewTab] = useState(0);
    const [loading, setLoading] = useState(false);

    const [guestSettings, setGuestSettings] = useState({
        welcomeMessage: initialContent.guest?.welcomeMessage || __('Welcome! Sign up to start earning rewards', 'mycred'),
        earnLabel: initialContent.guest?.earnLabel || __('Earn', 'mycred'),
        redeemLabel: initialContent.guest?.redeemLabel || __('Redeem', 'mycred'),
        boardLabel: initialContent.guest?.boardLabel || __('Board', 'mycred'),
        logsLabel: initialContent.guest?.logsLabel || __('History', 'mycred'),
        profileLabel: initialContent.guest?.profileLabel || __('Profile', 'mycred'),
        ranksLabel: initialContent.guest?.ranksLabel || __('Ranks', 'mycred'),
        badgesLabel: initialContent.guest?.badgesLabel || __('Badges', 'mycred'),
        earnMessage: initialContent.guest?.earnMessage || __('Complete actions to earn points', 'mycred'),
        redeemMessage: initialContent.guest?.redeemMessage || __('Login to redeem rewards', 'mycred'),
        joinRedirect: initialContent.guest?.joinRedirect || '',
        loginRedirect: initialContent.guest?.loginRedirect || '',
        joinButtonText: initialContent.guest?.joinButtonText || __('Join Now', 'mycred'),
        loginButtonText: initialContent.guest?.loginButtonText || __('Sign in', 'mycred'),
        boardMessage: initialContent.guest?.boardMessage || __('Leaderboard', 'mycred'),
        logsMessage: initialContent.guest?.logsMessage || __('Point History', 'mycred'),
        profileMessage: initialContent.guest?.profileMessage || __('My Profile', 'mycred'),
        ranksMessage: initialContent.guest?.ranksMessage || __('My Rank', 'mycred'),
        badgesMessage: initialContent.guest?.badgesMessage || __('My Badges', 'mycred')
    });

    const [memberSettings, setMemberSettings] = useState({
        welcomeMessage: initialContent.member?.welcomeMessage || __('Welcome back! Keep earning rewards', 'mycred'),
        earnLabel: initialContent.member?.earnLabel || __('Earn', 'mycred'),
        redeemLabel: initialContent.member?.redeemLabel || __('Redeem', 'mycred'),
        boardLabel: initialContent.member?.boardLabel || __('Board', 'mycred'),
        logsLabel: initialContent.member?.logsLabel || __('History', 'mycred'),
        profileLabel: initialContent.member?.profileLabel || __('Profile', 'mycred'),
        ranksLabel: initialContent.member?.ranksLabel || __('Ranks', 'mycred'),
        badgesLabel: initialContent.member?.badgesLabel || __('Badges', 'mycred'),
        earnMessage: initialContent.member?.earnMessage || __('Check out new ways to earn points', 'mycred'),
        redeemMessage: initialContent.member?.redeemMessage || __('Redeem your points for exclusive rewards', 'mycred'),
        dashboardButtonText: initialContent.member?.dashboardButtonText || __('Dashboard', 'mycred'),
        boardMessage: initialContent.member?.boardMessage || __('Leaderboard', 'mycred'),
        logsMessage: initialContent.member?.logsMessage || __('Point History', 'mycred'),
        profileMessage: initialContent.member?.profileMessage || __('My Profile', 'mycred'),
        ranksMessage: initialContent.member?.ranksMessage || __('My Rank', 'mycred'),
        badgesMessage: initialContent.member?.badgesMessage || __('My Badges', 'mycred'),
        dashboardRedirect: initialContent.member?.dashboardRedirect || ''
    });

    const handleGuestChange = (field, value) => {
        setGuestSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleMemberChange = (field, value) => {
        setMemberSettings(prev => ({ ...prev, [field]: value }));
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
            const dataToSave = {
                guest: guestSettings,
                member: memberSettings
            };
            const response = await saveSectionSettings('content', dataToSave);
            if (response.success) {
                toast.success(__('Settings saved successfully!', 'mycred'));
                console.log('Settings saved:', response.message);
            } else {
                toast.error(response.message || __('Failed to save settings', 'mycred'));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                {/* Left Column: Content Settings - 55% Width */}
                <Box sx={{ flex: '0 0 50%', maxWidth: '55%' }}>
                    <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                        <SectionHeader
                            icon={DescriptionIcon}
                            title={__('Content Settings', 'mycred')}
                            desc={__('Customize messages for guest users and members', 'mycred')}
                        />

                        {/* Tabs for Guest User / Member */}
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                mb: 3,
                                minHeight: 'auto',
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#5E2CED',
                                },
                                '& .MuiTab-root': {
                                    minHeight: 'auto',
                                    py: 1.5,
                                    px: 3,
                                    textTransform: 'none',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#666',
                                    '&.Mui-selected': {
                                        color: '#5E2CED',
                                    }
                                }
                            }}
                        >
                            <Tab label={__('Guest User', 'mycred')} />
                            <Tab label={__('Member', 'mycred')} />
                        </Tabs>

                        {/* Guest User Settings */}
                        {activeTab === 0 && (
                            <Box>
                                {/* General Messages Accordion */}
                                <Accordion defaultExpanded sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('General Messages', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <MessageField
                                            label={__('Welcome Message', 'mycred')}
                                            value={guestSettings.welcomeMessage}
                                            onChange={(v) => handleGuestChange('welcomeMessage', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                {/* Navigation Labels Accordion */}
                                <Accordion sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('Navigation Labels', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <MessageField
                                            label={__('Earn Label', 'mycred')}
                                            value={guestSettings.earnLabel}
                                            onChange={(v) => handleGuestChange('earnLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Redeem Label', 'mycred')}
                                            value={guestSettings.redeemLabel}
                                            onChange={(v) => handleGuestChange('redeemLabel', v)}
                                            disabled={!isPro}
                                        />
                                        <MessageField
                                            label={__('Board Label', 'mycred')}
                                            value={guestSettings.boardLabel}
                                            onChange={(v) => handleGuestChange('boardLabel', v)}
                                        />
                                        <MessageField
                                            label={__('History Label', 'mycred')}
                                            value={guestSettings.logsLabel}
                                            onChange={(v) => handleGuestChange('logsLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Profile Label', 'mycred')}
                                            value={guestSettings.profileLabel}
                                            onChange={(v) => handleGuestChange('profileLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Ranks Label', 'mycred')}
                                            value={guestSettings.ranksLabel}
                                            onChange={(v) => handleGuestChange('ranksLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Badges Label', 'mycred')}
                                            value={guestSettings.badgesLabel}
                                            onChange={(v) => handleGuestChange('badgesLabel', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                {/* Tab Content Headings Accordion */}
                                <Accordion sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('Tab Content Headings', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <MessageField
                                            label={__('Earn Heading', 'mycred')}
                                            value={guestSettings.earnMessage}
                                            onChange={(v) => handleGuestChange('earnMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Redeem Heading', 'mycred')}
                                            value={guestSettings.redeemMessage}
                                            onChange={(v) => handleGuestChange('redeemMessage', v)}
                                            disabled={!isPro}
                                        />
                                        <MessageField
                                            label={__('Board Heading', 'mycred')}
                                            value={guestSettings.boardMessage}
                                            onChange={(v) => handleGuestChange('boardMessage', v)}
                                        />
                                        <MessageField
                                            label={__('History Heading', 'mycred')}
                                            value={guestSettings.logsMessage}
                                            onChange={(v) => handleGuestChange('logsMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Profile Heading', 'mycred')}
                                            value={guestSettings.profileMessage}
                                            onChange={(v) => handleGuestChange('profileMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Ranks Heading', 'mycred')}
                                            value={guestSettings.ranksMessage}
                                            onChange={(v) => handleGuestChange('ranksMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Badges Heading', 'mycred')}
                                            value={guestSettings.badgesMessage}
                                            onChange={(v) => handleGuestChange('badgesMessage', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                {/* Buttons & Redirects Accordion */}
                                <Accordion sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('Buttons & Redirects', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                                                {__('Join Now Redirect Page', 'mycred')}
                                            </Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={guestSettings.joinRedirect}
                                                onChange={(e) => handleGuestChange('joinRedirect', e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#E0E0E0' },
                                                        '&:hover fieldset': { borderColor: '#E0E0E0' },
                                                        '&.Mui-focused fieldset': { borderColor: '#5E2CED', borderWidth: '1px' },
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>{__('Select page...', 'mycred')}</em>
                                                </MenuItem>
                                                {window.mycredLoyaltyWidgetData?.available_pages?.map((page) => (
                                                    <MenuItem key={page.url} value={page.url}>
                                                        {page.title}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                                                {__('Login Redirect Page', 'mycred')}
                                            </Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={guestSettings.loginRedirect}
                                                onChange={(e) => handleGuestChange('loginRedirect', e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#E0E0E0' },
                                                        '&:hover fieldset': { borderColor: '#E0E0E0' },
                                                        '&.Mui-focused fieldset': { borderColor: '#5E2CED', borderWidth: '1px' },
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>{__('Select page...', 'mycred')}</em>
                                                </MenuItem>
                                                {window.mycredLoyaltyWidgetData?.available_pages?.map((page) => (
                                                    <MenuItem key={page.url} value={page.url}>
                                                        {page.title}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>

                                        <Box sx={{ mt: 2 }}>
                                            <MessageField
                                                label={__('Join Now Button Text', 'mycred')}
                                                value={guestSettings.joinButtonText}
                                                onChange={(v) => handleGuestChange('joinButtonText', v)}
                                            />
                                            <MessageField
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
                            <Box>
                                {/* General Messages Accordion */}
                                <Accordion defaultExpanded sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('General Messages', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <MessageField
                                            label={__('Welcome Message', 'mycred')}
                                            value={memberSettings.welcomeMessage}
                                            onChange={(v) => handleMemberChange('welcomeMessage', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                {/* Navigation Labels Accordion */}
                                <Accordion sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('Navigation Labels', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <MessageField
                                            label={__('Earn Label', 'mycred')}
                                            value={memberSettings.earnLabel}
                                            onChange={(v) => handleMemberChange('earnLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Redeem Label', 'mycred')}
                                            value={memberSettings.redeemLabel}
                                            onChange={(v) => handleMemberChange('redeemLabel', v)}
                                            disabled={!isPro}
                                        />
                                        <MessageField
                                            label={__('Board Label', 'mycred')}
                                            value={memberSettings.boardLabel}
                                            onChange={(v) => handleMemberChange('boardLabel', v)}
                                        />
                                        <MessageField
                                            label={__('History Label', 'mycred')}
                                            value={memberSettings.logsLabel}
                                            onChange={(v) => handleMemberChange('logsLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Profile Label', 'mycred')}
                                            value={memberSettings.profileLabel}
                                            onChange={(v) => handleMemberChange('profileLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Ranks Label', 'mycred')}
                                            value={memberSettings.ranksLabel}
                                            onChange={(v) => handleMemberChange('ranksLabel', v)}
                                        />
                                        <MessageField
                                            label={__('Badges Label', 'mycred')}
                                            value={memberSettings.badgesLabel}
                                            onChange={(v) => handleMemberChange('badgesLabel', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                {/* Tab Headings Accordion */}
                                <Accordion sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('Tab Headings', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <MessageField
                                            label={__('Earn Heading', 'mycred')}
                                            value={memberSettings.earnMessage}
                                            onChange={(v) => handleMemberChange('earnMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Redeem Heading', 'mycred')}
                                            value={memberSettings.redeemMessage}
                                            onChange={(v) => handleMemberChange('redeemMessage', v)}
                                            disabled={!isPro}
                                        />
                                        <MessageField
                                            label={__('Board Heading', 'mycred')}
                                            value={memberSettings.boardMessage}
                                            onChange={(v) => handleMemberChange('boardMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Logs Heading', 'mycred')}
                                            value={memberSettings.logsMessage}
                                            onChange={(v) => handleMemberChange('logsMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Profile Heading', 'mycred')}
                                            value={memberSettings.profileMessage}
                                            onChange={(v) => handleMemberChange('profileMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Ranks Heading', 'mycred')}
                                            value={memberSettings.ranksMessage}
                                            onChange={(v) => handleMemberChange('ranksMessage', v)}
                                        />
                                        <MessageField
                                            label={__('Badges Heading', 'mycred')}
                                            value={memberSettings.badgesMessage}
                                            onChange={(v) => handleMemberChange('badgesMessage', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                {/* Buttons & Redirects Accordion */}
                                <Accordion sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#FAFAFA', borderRadius: '8px' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{__('Buttons & Redirects', 'mycred')}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                                                {__('Dashboard Redirect Page', 'mycred')}
                                            </Typography>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={memberSettings.dashboardRedirect}
                                                onChange={(e) => handleMemberChange('dashboardRedirect', e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#E0E0E0' },
                                                        '&:hover fieldset': { borderColor: '#E0E0E0' },
                                                        '&.Mui-focused fieldset': { borderColor: '#5E2CED', borderWidth: '1px' },
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>{__('Select page...', 'mycred')}</em>
                                                </MenuItem>
                                                {window.mycredLoyaltyWidgetData?.available_pages?.map((page) => (
                                                    <MenuItem key={page.url} value={page.url}>
                                                        {page.title}
                                                     </MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>
                                        <MessageField
                                            label={__('Dashboard Button Text', 'mycred')}
                                            value={memberSettings.dashboardButtonText}
                                            onChange={(v) => handleMemberChange('dashboardButtonText', v)}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}

                        {/* Save Button */}
                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E0E0E0' }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{
                                    bgcolor: '#5E2CED',
                                    color: '#fff',
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.25,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    '&:hover': {
                                        bgcolor: '#4E1CDD',
                                    }
                                }}
                            >
                                {loading ? __('Saving...', 'mycred') : __('Save Settings', 'mycred')}
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* Right Column: Live Preview - 45% Width */}
                <Box sx={{ flex: '0 0 50%', maxWidth: '45%' }}>
                    <Box sx={{ position: 'sticky', top: 24 }}>
                        <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0', minHeight: 600 }}>
                            <SectionHeader
                                icon={AutoAwesomeIcon}
                                title={__('Live Preview', 'mycred')}
                                desc={__('This preview uses dummy records', 'mycred')}
                            />

                            {/* Preview Tabs */}
                            <Tabs
                                value={previewTab}
                                onChange={handlePreviewTabChange}
                                sx={{
                                    mb: 3,
                                    minHeight: 'auto',
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#5E2CED',
                                    },
                                    '& .MuiTab-root': {
                                        minHeight: 'auto',
                                        py: 1.5,
                                        px: 3,
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#666',
                                        '&.Mui-selected': {
                                            color: '#5E2CED',
                                        }
                                    }
                                }}
                            >
                                <Tab label={__('Guest', 'mycred')} />
                                <Tab label={__('Member', 'mycred')} />
                            </Tabs>

                            {/* Preview Content */}
                            <Box sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <WidgetPreview
                                    settings={window.mycredLoyaltyWidgetData?.settings?.design || {}}
                                    activePreviewTab={previewTab === 0 ? 2 : 0}
                                    content={{ guest: guestSettings, member: memberSettings }}
                                />
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
