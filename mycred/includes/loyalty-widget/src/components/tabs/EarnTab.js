import { Box, Typography, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LoginIcon from '@mui/icons-material/Login';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TollIcon from '@mui/icons-material/Toll';
import { __ } from '@wordpress/i18n';
import { widgetTabRootSx, widgetTabScrollBodySx } from '../preview/utils';
import { resolveHookLabel, resolveHookDescription } from '../../hookDisplayDefaults';
import { filterActiveHooksForWidget } from '../../pointTypeVisibility';

const getHookIcon = (hook) => {
    const id = String(hook?.id || '').toLowerCase();
    const category = String(hook?.category || '').toLowerCase();

    if (id.includes('regist') || id.includes('signup') || id.includes('sign_up')) {
        return PersonAddAlt1Icon;
    }
    if (id.includes('login') || id.includes('visit') || id.includes('logging')) {
        return LoginIcon;
    }
    if (id.includes('referr') || id.includes('affiliate')) {
        return ShareIcon;
    }
    if (id.includes('comment')) {
        return ChatBubbleOutlineIcon;
    }
    if (id.includes('publish') || id.includes('content')) {
        return ArticleOutlinedIcon;
    }
    if (id.includes('order') || id.includes('purchase') || id.includes('woo') || category === 'woocommerce') {
        return ShoppingBagOutlinedIcon;
    }
    return TollIcon;
};

export default function EarnTab({ settings, currentContent, user, activeHooks, onBack, onClose }) {
    currentContent = currentContent || {};
    const eventtriggers = settings.eventtriggers || {};
    const design = settings.design || {};
    const btnColor = design.buttonColor || '#5E2CED';
    const bgColor = design.backgroundColor || '#2D1572';
    const headerText = design.textColor || '#FFFFFF';

    const isHookEnabled = (hook) => {
        const categories = ['wordpressHooks', 'woocommerceHooks', 'buddypressHooks', 'forumHooks'];
        for (const cat of categories) {
            if (eventtriggers[cat] && Array.isArray(eventtriggers[cat])) {
                const match = eventtriggers[cat].find(h => String(h.id) === String(hook.id) && String(h.point_type) === String(hook.point_type));
                if (match) {
                    return match.enabled !== false;
                }
            }
        }
        return true;
    };

    const typeVisibleHooks = filterActiveHooksForWidget(activeHooks || [], settings);
    const filteredHooks = typeVisibleHooks.filter(hook => isHookEnabled(hook));

    if (eventtriggers.enableHooks === false) {
        return (
            <Box sx={widgetTabRootSx({ bgcolor: bgColor })}>
                <Box sx={{ p: '20px 24px', color: headerText, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <IconButton size="small" onClick={onBack} sx={{ color: headerText, p: 0.5 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: headerText, fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1.3 }}>
                            {currentContent.earnMessage || __('Earn', 'mycred')}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: headerText, flexShrink: 0 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={widgetTabScrollBodySx({
                    bgcolor: '#F8F9FB',
                    borderRadius: '24px 24px 0 0',
                    p: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                })}>
                    <Typography sx={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
                        {__('No earning opportunities available at the moment.', 'mycred')}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={widgetTabRootSx({ bgcolor: bgColor })}>
            <Box sx={{ p: '20px 24px', color: headerText, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <IconButton size="small" onClick={onBack} sx={{ color: headerText, p: 0.5 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: headerText, fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1.3 }}>
                        {currentContent.earnMessage || __('Earn', 'mycred')}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: headerText, flexShrink: 0 }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box sx={widgetTabScrollBodySx({
                bgcolor: '#F8F9FB', borderRadius: '24px 24px 0 0', p: '20px',
            })}>
                <Box sx={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    '& > *': {
                        animation: 'slideKeyframe 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                    },
                    ...Array.from({ length: 15 }).reduce((acc, _, i) => ({
                        ...acc,
                        [`& > *:nth-of-type(${i + 1})`]: { animationDelay: `${i * 0.05}s` }
                    }), {})
                }}>
                    {filteredHooks.map((hook, index) => {
                        const HookIcon = getHookIcon(hook);
                        const hookLabel = resolveHookLabel(hook, eventtriggers);
                        const hookDescription = resolveHookDescription(hook, eventtriggers);
                        return (
                        <Paper
                            key={`${hook.id}-${hook.point_type}-${index}`}
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                border: '1px solid #E8E8E8',
                                bgcolor: '#fff'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: hookDescription ? 'flex-start' : 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: `${btnColor}22`,
                                    color: btnColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    mt: hookDescription ? 0.25 : 0,
                                }}>
                                    <HookIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.35 }}>
                                        {hookLabel}
                                    </Typography>
                                    {hookDescription ? (
                                        <Typography
                                            sx={{
                                                fontSize: '12px',
                                                fontWeight: 400,
                                                color: '#666',
                                                lineHeight: 1.45,
                                                mt: 0.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {hookDescription}
                                        </Typography>
                                    ) : null}
                                </Box>
                                <Typography sx={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: String(hook.formatted_amount || hook.amount || '0').startsWith('-') ? '#EF4444' : '#38A169',
                                    whiteSpace: 'nowrap',
                                    bgcolor: String(hook.formatted_amount || hook.amount || '0').startsWith('-') ? '#FEE2E2' : 'transparent',
                                    px: String(hook.formatted_amount || hook.amount || '0').startsWith('-') ? '8px' : 0,
                                    py: String(hook.formatted_amount || hook.amount || '0').startsWith('-') ? '2px' : 0,
                                    borderRadius: '100px'
                                }}>
                                    {(String(hook.formatted_amount || hook.amount || '0').startsWith('-') || String(hook.formatted_amount || hook.amount || '0').startsWith('+')) ? '' : '+'}{hook.formatted_amount || hook.amount || '0'} {user?.all_balances?.find(b => b.type === hook.point_type)?.label || user?.point_label || ''}
                                </Typography>
                            </Box>
                        </Paper>
                        );
                    })}

                    {filteredHooks.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography sx={{ color: '#666', fontSize: '14px' }}>
                                {__('No earning opportunities available at the moment.', 'mycred')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
