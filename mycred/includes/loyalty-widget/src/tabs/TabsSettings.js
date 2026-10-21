import { useState } from '@wordpress/element';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Divider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Button,
} from '@mui/material';
import { __ } from '@wordpress/i18n';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TabIcon from '@mui/icons-material/Tab';
import SaveIcon from '@mui/icons-material/Save';
import { saveSectionSettings } from '../services/api';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '../components/admin/ToggleSwitch';
import SectionHeader from '../components/admin/SectionHeader';
import SettingsCard from '../components/admin/SettingsCard';
import { useRegisterSaveActions } from '../context/SaveActionsContext';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import { getTabContentSx, getFieldLabelSx, getSecondaryTextSx, getTextFieldSx, getSelectSx, getTabsSx, getProBadgeSx } from '../components/admin/formStyles';

const ToggleOption = ({ colors: propColors, title, description, checked, onChange, showDivider = true, disabled = false }) => {
    const { colors: themeColors } = useAdminTheme();
    const colors = propColors || themeColors;

    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto'
            }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colors?.textPrimary }}>
                            {title}
                        </Typography>
                        {disabled && (
                            <Box sx={getProBadgeSx(colors)}>
                                {__('Pro', 'mycred')}
                            </Box>
                        )}
                    </Box>
                    <Typography sx={{ ...getSecondaryTextSx(colors), mt: 0.5 }}>
                        {description}
                    </Typography>
                </Box>
                <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
            </Box>
            {showDivider && <Divider />}
        </>
    );
};
export default function TabsSettings() {
    const { colors } = useAdminTheme();
    const initialTabs = window.mycredLoyaltyWidgetData?.settings?.tabs || {};

    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const isPro = window.mycredLoyaltyWidgetData?.is_toolkit_pro_active || false;

    const [tabControls, setTabControls] = useState({
        earn: initialTabs.tabControls?.earn !== undefined ? initialTabs.tabControls.earn : true,
        redeem: isPro ? (initialTabs.tabControls?.redeem !== undefined ? initialTabs.tabControls.redeem : true) : false,
        profile: initialTabs.tabControls?.profile !== undefined ? initialTabs.tabControls.profile : true,
        board: initialTabs.tabControls?.board !== undefined ? initialTabs.tabControls.board : true,
        logs: initialTabs.tabControls?.logs !== undefined ? initialTabs.tabControls.logs : true,
        badges: initialTabs.tabControls?.badges !== undefined ? initialTabs.tabControls.badges : true,
        ranks: initialTabs.tabControls?.ranks !== undefined ? initialTabs.tabControls.ranks : true,
        faq: initialTabs.tabControls?.faq !== undefined ? initialTabs.tabControls.faq : true,
    });

    const [leaderboardSettings, setLeaderboardSettings] = useState({
        numberOfUsers: initialTabs.boardSettings?.leaderboard?.numberOfUsers || 10,
        rankingOrder: initialTabs.boardSettings?.leaderboard?.rankingOrder || 'highest_first',
        positionOffset: initialTabs.boardSettings?.leaderboard?.positionOffset || 0,
        timeframeFilter: initialTabs.boardSettings?.leaderboard?.timeframeFilter || 'all_time',
        emptyMessage: initialTabs.boardSettings?.leaderboard?.emptyMessage || __('No users to display', 'mycred')
    });

    const [displayOptions, setDisplayOptions] = useState({
        showUserAvatar: initialTabs.boardSettings?.displayOptions?.showUserAvatar !== undefined ? initialTabs.boardSettings.displayOptions.showUserAvatar : true,
        showUserRank: initialTabs.boardSettings?.displayOptions?.showUserRank !== undefined ? initialTabs.boardSettings.displayOptions.showUserRank : true,
        showPointsBalance: initialTabs.boardSettings?.displayOptions?.showPointsBalance !== undefined ? initialTabs.boardSettings.displayOptions.showPointsBalance : true,
        highlightCurrentUser: initialTabs.boardSettings?.displayOptions?.highlightCurrentUser !== undefined ? initialTabs.boardSettings.displayOptions.highlightCurrentUser : true,
        filterByPointType: initialTabs.boardSettings?.displayOptions?.filterByPointType !== undefined ? initialTabs.boardSettings.displayOptions.filterByPointType : false
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleTabControlChange = (field) => (event) => {
        setTabControls(prev => ({
            ...prev,
            [field]: event.target.checked
        }));
    };

    const handleDisplayOptionChange = (field) => (event) => {
        setDisplayOptions(prev => ({
            ...prev,
            [field]: event.target.checked
        }));
    };

    const handleLeaderboardChange = (field, value) => {
        setLeaderboardSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const dataToSave = {
                tabControls: tabControls,
                boardSettings: {
                    leaderboard: leaderboardSettings,
                    displayOptions: displayOptions
                }
            };
            const response = await saveSectionSettings('tabs', dataToSave);
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

    useRegisterSaveActions({
        onSave: handleSave,
        loading,
        label: __('Update Settings', 'mycred'),
    });

    return (
        <Box sx={getTabContentSx()}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Tab Controls */}
                <SettingsCard>
                    <SectionHeader
                        icon={TabIcon}
                        title={__('Tab Controls', 'mycred')}
                        desc={__('Enable or disable specific tabs in the widget', 'mycred')}
                    />

                    <Box sx={{ mt: 2 }}>
                        <ToggleOption
                            colors={colors}
                            title={__('Earn Tab', 'mycred')}
                            description={__('Show the rewards and campaigns tab', 'mycred')}
                            checked={tabControls.earn}
                            onChange={handleTabControlChange('earn')}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('Redeem Tab', 'mycred')}
                            description={isPro ? __('Show the rewards redemption tab', 'mycred') : __('Reward redemptions are available in Pro version', 'mycred')}
                            checked={tabControls.redeem}
                            onChange={handleTabControlChange('redeem')}
                            disabled={!isPro}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('Board Tab', 'mycred')}
                            description={__('Show the leaderboard rankings', 'mycred')}
                            checked={tabControls.board}
                            onChange={handleTabControlChange('board')}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('Logs Tab', 'mycred')}
                            description={__('Show the user activity and point logs', 'mycred')}
                            checked={tabControls.logs}
                            onChange={handleTabControlChange('logs')}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('FAQ (only on card based template)', 'mycred')}
                            description={__('Show the FAQ pill on the Modern home header', 'mycred')}
                            checked={tabControls.faq}
                            onChange={handleTabControlChange('faq')}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('Badges Tab', 'mycred')}
                            description={__('Show the badges and achievements tab', 'mycred')}
                            checked={tabControls.badges}
                            onChange={handleTabControlChange('badges')}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('Profile Tab', 'mycred')}
                            description={__('Show the user profile and stats tab', 'mycred')}
                            checked={tabControls.profile}
                            onChange={handleTabControlChange('profile')}
                        />
                        <ToggleOption
                            colors={colors}
                            title={__('Rank Tab', 'mycred')}
                            description={__('Show the user rank tab', 'mycred')}
                            checked={tabControls.ranks}
                            onChange={handleTabControlChange('ranks')}
                            showDivider={false}
                        />
                    </Box>
                </SettingsCard>

                {/* Board Settings */}
                <SettingsCard>
                    <SectionHeader
                        icon={EmojiEventsIcon}
                        title={__('Board Settings', 'mycred')}
                    />

                    {/* Tabs for Leaderboard / Display Options */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={getTabsSx(colors)}
                    >
                        <Tab label={__('Leaderboard', 'mycred')} />
                        <Tab label={__('Display Options', 'mycred')} />
                    </Tabs>

                    {/* Leaderboard Tab */}
                    {activeTab === 0 && (
                        <Box>
                            <SectionHeader
                                icon={EmojiEventsIcon}
                                title={__('Leaderboard Settings', 'mycred')}
                                desc={__('Configure how the leaderboard displays rankings and activity logs', 'mycred')}
                            />

                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Number of Users */}
                                <Box>
                                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                                        {__('Number of Users', 'mycred')}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={leaderboardSettings.numberOfUsers}
                                        onChange={(e) => handleLeaderboardChange('numberOfUsers', e.target.value)}
                                        inputProps={{ min: 1, max: 100 }}
                                        sx={getTextFieldSx(colors, { borderRadius: '8px' })}
                                    />
                                    <Typography sx={{ ...getSecondaryTextSx(colors), fontSize: '12px', mt: 1 }}>
                                        {__('Number of users to display in the leaderboard (1-100)', 'mycred')}
                                    </Typography>
                                </Box>

                                {/* Ranking Order */}
                                <Box>
                                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                                        {__('Ranking Order', 'mycred')}
                                    </Typography>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={leaderboardSettings.rankingOrder}
                                        onChange={(e) => handleLeaderboardChange('rankingOrder', e.target.value)}
                                        sx={getSelectSx(colors, { borderRadius: '8px' })}
                                    >
                                        <MenuItem value="highest_first">{__('Descending (Highest First)', 'mycred')}</MenuItem>
                                        <MenuItem value="lowest_first">{__('Ascending (Lowest First)', 'mycred')}</MenuItem>
                                    </Select>
                                </Box>

                                {/* Position Offset */}
                                <Box>
                                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                                        {__('Position Offset', 'mycred')}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={leaderboardSettings.positionOffset}
                                        onChange={(e) => handleLeaderboardChange('positionOffset', e.target.value)}
                                        inputProps={{ min: 0 }}
                                        sx={getTextFieldSx(colors, { borderRadius: '8px' })}
                                    />
                                    <Typography sx={{ ...getSecondaryTextSx(colors), fontSize: '12px', mt: 1 }}>
                                        {__('Skip first N positions (useful for showing different sections)', 'mycred')}
                                    </Typography>
                                </Box>

                                {/* Timeframe Filter */}
                                <Box>
                                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                                        {__('Timeframe Filter', 'mycred')}
                                    </Typography>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={leaderboardSettings.timeframeFilter}
                                        onChange={(e) => handleLeaderboardChange('timeframeFilter', e.target.value)}
                                        sx={getSelectSx(colors, { borderRadius: '8px' })}
                                    >
                                        <MenuItem value="all_time">{__('All Time', 'mycred')}</MenuItem>
                                        <MenuItem value="today">{__('Today', 'mycred')}</MenuItem>
                                        <MenuItem value="this_week">{__('This Week', 'mycred')}</MenuItem>
                                        <MenuItem value="this_month">{__('This Month', 'mycred')}</MenuItem>
                                        <MenuItem value="this_year">{__('This Year', 'mycred')}</MenuItem>
                                    </Select>
                                    <Typography sx={{ ...getSecondaryTextSx(colors), fontSize: '12px', mt: 1 }}>
                                        {__('Filter rankings by time period', 'mycred')}
                                    </Typography>
                                </Box>

                                {/* Empty Message */}
                                <Box>
                                    <Typography sx={{ ...getFieldLabelSx(colors), mb: 1 }}>
                                        {__('Empty Message', 'mycred')}
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={leaderboardSettings.emptyMessage}
                                        onChange={(e) => handleLeaderboardChange('emptyMessage', e.target.value)}
                                        sx={getTextFieldSx(colors, { borderRadius: '8px' })}
                                    />
                                    <Typography sx={{ ...getSecondaryTextSx(colors), fontSize: '12px', mt: 1 }}>
                                        {__('Message shown when no users are in the leaderboard', 'mycred')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Display Options Tab */}
                    {activeTab === 1 && (
                        <Box>
                            <SectionHeader
                                icon={EmojiEventsIcon}
                                title={__('Display Options', 'mycred')}
                                desc={__('Control what information is shown on the leaderboard', 'mycred')}
                            />

                            <Box sx={{ mt: 2 }}>
                                <ToggleOption
                                    colors={colors}
                                    title={__('Show User Avatar', 'mycred')}
                                    description={__('Show user avatar in the leaderboard', 'mycred')}
                                    checked={displayOptions.showUserAvatar}
                                    onChange={handleDisplayOptionChange('showUserAvatar')}
                                />
                                <ToggleOption
                                    colors={colors}
                                    title={__('Show User Rank', 'mycred')}
                                    description={__('Display user rank/level', 'mycred')}
                                    checked={displayOptions.showUserRank}
                                    onChange={handleDisplayOptionChange('showUserRank')}
                                />
                                <ToggleOption
                                    colors={colors}
                                    title={__('Show Points Balance', 'mycred')}
                                    description={__('Display the current points balance of the user', 'mycred')}
                                    checked={displayOptions.showPointsBalance}
                                    onChange={handleDisplayOptionChange('showPointsBalance')}
                                />
                                <ToggleOption
                                    colors={colors}
                                    title={__('Highlight Current User', 'mycred')}
                                    description={__('Visually highlight the current user in the leaderboard', 'mycred')}
                                    checked={displayOptions.highlightCurrentUser}
                                    onChange={handleDisplayOptionChange('highlightCurrentUser')}
                                />
                                <ToggleOption
                                    colors={colors}
                                    title={__('Filter by Point Type', 'mycred')}
                                    description={__('Allow users to switch between different point types', 'mycred')}
                                    checked={displayOptions.filterByPointType}
                                    onChange={handleDisplayOptionChange('filterByPointType')}
                                    showDivider={false}
                                />
                            </Box>
                        </Box>
                    )}
                </SettingsCard>

            </Box>
        </Box>
    );
}
