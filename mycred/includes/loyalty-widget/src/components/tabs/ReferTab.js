import { useState, useEffect, useMemo } from '@wordpress/element';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    Skeleton,
    Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { __ } from '@wordpress/i18n';
import { getReferral, generateProductReferral } from '../../services/frontend-api';

const copyText = async (text) => {
    if (!text) return false;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        return true;
    } catch (e) {
        return false;
    }
};

const openShare = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer,width=640,height=640');
};

const buildShareUrls = (link, message) => {
    const encodedUrl = encodeURIComponent(link || '');
    const text = encodeURIComponent((message || __('Join me and earn rewards!', 'mycred')) + ' ' + (link || ''));
    return {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(message || __('Join me and earn rewards!', 'mycred'))}`,
        whatsapp: `https://wa.me/?text=${text}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(message || '')}`,
        email: `mailto:?subject=${encodeURIComponent(__('Join me!', 'mycred'))}&body=${text}`,
    };
};

export default function ReferTab({
    settings,
    currentContent,
    user,
    onBack,
    onClose,
    previewMode = false,
    previewData,
}) {
    currentContent = currentContent || {};
    const design = settings.design || {};
    const referralSettings = settings.referral || {};
    const btnColor = design.buttonColor || '#5E2CED';
    const bgColor = design.backgroundColor || '#2D1572';

    const [data, setData] = useState(previewData || null);
    const [loading, setLoading] = useState(!previewMode);
    const [copied, setCopied] = useState(false);
    const [productId, setProductId] = useState('');
    const [productLink, setProductLink] = useState('');
    const [productLoading, setProductLoading] = useState(false);
    const [productCopied, setProductCopied] = useState(false);

    const showVisit = referralSettings.showVisit !== false;
    const showSignup = referralSettings.showSignup !== false;
    const showProduct = referralSettings.showProduct !== false;
    const social = referralSettings.social || {};
    const shareMessage = referralSettings.shareMessage
        || currentContent.referralMessage
        || __('Join me and earn rewards!', 'mycred');

    useEffect(() => {
        if (previewMode) {
            setData(previewData || null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const localized = window.mycredLoyaltyWidget?.referral;
                if (localized?.enabled && localized?.link) {
                    setData((prev) => ({ ...(prev || {}), ...localized }));
                }
                const response = await getReferral();
                if (!cancelled && response?.success && response.data) {
                    setData(response.data);
                }
            } catch (e) {
                console.error('Failed to load referral data:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [previewMode, previewData]);

    const handleCopy = async (text, setFlag) => {
        const ok = await copyText(text);
        if (ok) {
            setFlag(true);
            setTimeout(() => setFlag(false), 1800);
        }
    };

    const handleGenerateProduct = async () => {
        if (!productId) return;
        setProductLoading(true);
        setProductLink('');
        try {
            if (previewMode) {
                setProductLink(`https://example.com/product/?productref=demo&tracking=demo`);
                return;
            }
            const response = await generateProductReferral(productId);
            if (response?.success && response.data?.referral_url) {
                setProductLink(response.data.referral_url);
            }
        } catch (e) {
            console.error('Failed to generate product referral:', e);
        } finally {
            setProductLoading(false);
        }
    };

    const isGuest = !user?.is_logged_in;
    const rewards = data?.rewards || {};
    const stats = data?.stats || {};
    const woo = data?.woo || {};
    const products = woo.products || [];
    const shareUrls = useMemo(
        () => buildShareUrls(data?.link, shareMessage),
        [data?.link, shareMessage]
    );

    const socialButtons = [
        { key: 'facebook', icon: <FacebookIcon sx={{ fontSize: 18 }} />, label: __('Facebook', 'mycred'), color: '#1877F2' },
        { key: 'twitter', icon: <XIcon sx={{ fontSize: 16 }} />, label: __('X', 'mycred'), color: '#111' },
        { key: 'whatsapp', icon: <WhatsAppIcon sx={{ fontSize: 18 }} />, label: __('WhatsApp', 'mycred'), color: '#25D366' },
        { key: 'telegram', icon: <TelegramIcon sx={{ fontSize: 18 }} />, label: __('Telegram', 'mycred'), color: '#229ED9' },
        { key: 'email', icon: <EmailOutlinedIcon sx={{ fontSize: 18 }} />, label: __('Email', 'mycred'), color: '#6B7280' },
    ].filter((item) => social[item.key] !== false);

    const screenTitle = referralSettings.screenTitle
        || currentContent.referMessage
        || currentContent.referralMessage
        || __('Refer & Earn', 'mycred');

    const introText = referralSettings.introText
        || currentContent.referralMessage
        || __('Invite friends with your link and earn points when they visit or sign up.', 'mycred');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: bgColor }}>
            <Box sx={{ px: '20px', pt: '18px', pb: '14px', color: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, pr: 1 }}>
                    <IconButton size="small" onClick={onBack} sx={{ color: '#fff', p: 0.5, mt: 0.25 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '18px', fontWeight: 700, fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1.25 }}>
                            {screenTitle}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', opacity: 0.85, mt: 0.5, fontFamily: "'Instrument Sans', sans-serif" }}>
                            {__('Share · Earn · Grow', 'mycred')}
                        </Typography>
                    </Box>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box sx={{
                flex: 1,
                bgcolor: '#F7F5FF',
                borderRadius: '24px 24px 0 0',
                p: '18px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}>
                {isGuest && (
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: '18px', textAlign: 'center',
                        border: `1.5px solid ${btnColor}22`,
                        background: `linear-gradient(180deg, ${btnColor}10 0%, #fff 55%)`,
                    }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 700, mb: 1, color: '#1A1040', fontFamily: "'Instrument Sans', sans-serif" }}>
                            {introText}
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#7A7A9A', mb: 2.5, fontFamily: "'Instrument Sans', sans-serif" }}>
                            {__('Sign in to unlock your personal referral link and track rewards.', 'mycred')}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (currentContent.loginRedirect) window.location.href = currentContent.loginRedirect;
                            }}
                            sx={{
                                bgcolor: btnColor, textTransform: 'none', borderRadius: '12px',
                                px: 3, py: 1.2, fontWeight: 700, boxShadow: `0 8px 20px ${btnColor}40`,
                                '&:hover': { bgcolor: btnColor },
                            }}
                        >
                            {currentContent.loginButtonText || __('Sign In', 'mycred')}
                        </Button>
                    </Paper>
                )}

                {!isGuest && loading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Skeleton variant="rounded" height={120} sx={{ borderRadius: '18px' }} />
                        <Skeleton variant="rounded" height={96} sx={{ borderRadius: '18px' }} />
                        <Skeleton variant="rounded" height={96} sx={{ borderRadius: '18px' }} />
                    </Box>
                )}

                {!isGuest && !loading && !data?.enabled && (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '18px', textAlign: 'center', border: '1px solid #E8E8E8' }}>
                        <Typography sx={{ fontSize: '14px', color: '#666', fontFamily: "'Instrument Sans', sans-serif" }}>
                            {__('Referral program is not active yet. Ask an admin to enable the Referrals hook.', 'mycred')}
                        </Typography>
                    </Paper>
                )}

                {!isGuest && !loading && data?.enabled && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <Paper elevation={0} sx={{
                            p: '16px',
                            borderRadius: '18px',
                            border: `1.5px solid ${btnColor}20`,
                            background: `radial-gradient(ellipse 90% 120% at 0% 0%, ${btnColor}18, transparent 55%), #fff`,
                            boxShadow: '0 2px 12px rgba(45,21,114,0.05)',
                        }}>
                            <Typography sx={{ fontSize: '13px', color: '#5B5675', mb: 1.5, lineHeight: 1.5, fontFamily: "'Instrument Sans', sans-serif" }}>
                                {introText}
                            </Typography>

                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#8B83A8', mb: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                {__('Your referral link', 'mycred')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: socialButtons.length ? 1.5 : 0 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={data.link || ''}
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            bgcolor: '#F8F7FC',
                                            fontFamily: "'Instrument Sans', sans-serif",
                                        },
                                    }}
                                />
                                <Button
                                    onClick={() => handleCopy(data.link, setCopied)}
                                    variant="contained"
                                    sx={{
                                        minWidth: 44,
                                        height: 40,
                                        borderRadius: '12px',
                                        bgcolor: btnColor,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: btnColor, boxShadow: 'none' },
                                    }}
                                >
                                    {copied ? <CheckIcon sx={{ fontSize: 18 }} /> : <ContentCopyIcon sx={{ fontSize: 18 }} />}
                                </Button>
                            </Box>

                            {data.ref_id ? (
                                <Chip
                                    size="small"
                                    label={`${__('ID', 'mycred')}: ${data.ref_id}`}
                                    sx={{
                                        mb: socialButtons.length ? 1.5 : 0,
                                        height: 24,
                                        bgcolor: `${btnColor}12`,
                                        color: btnColor,
                                        fontWeight: 600,
                                        fontSize: '11px',
                                    }}
                                />
                            ) : null}

                            {socialButtons.length > 0 && data.link ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {socialButtons.map((item) => (
                                        <IconButton
                                            key={item.key}
                                            title={item.label}
                                            onClick={() => openShare(shareUrls[item.key])}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '10px',
                                                bgcolor: `${item.color}12`,
                                                color: item.color,
                                                border: `1px solid ${item.color}22`,
                                                '&:hover': { bgcolor: `${item.color}20` },
                                            }}
                                        >
                                            {item.icon}
                                        </IconButton>
                                    ))}
                                </Box>
                            ) : null}
                        </Paper>

                        {(showVisit || showSignup) && (
                            <Box>
                                <Typography sx={{
                                    fontSize: '11px', fontWeight: 700, color: '#8B83A8', mb: 1,
                                    letterSpacing: '0.04em', textTransform: 'uppercase',
                                    fontFamily: "'Instrument Sans', sans-serif",
                                }}>
                                    {__('Site referrals', 'mycred')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                    {showVisit && (
                                        <RewardCard
                                            icon={<VisibilityOutlinedIcon sx={{ fontSize: 20, color: btnColor }} />}
                                            accent={btnColor}
                                            title={__('Visitor referral', 'mycred')}
                                            subtitle={__('Earn when someone visits via your link', 'mycred')}
                                            amount={rewards.visit?.formatted_amount}
                                            pointLabel={rewards.visit?.point_label}
                                            count={stats.visitors || 0}
                                            countLabel={__('Visitors', 'mycred')}
                                            inactive={!rewards.visit}
                                        />
                                    )}
                                    {showSignup && (
                                        <RewardCard
                                            icon={<PersonAddAltIcon sx={{ fontSize: 20, color: '#0F9F6E' }} />}
                                            accent="#0F9F6E"
                                            title={__('Signup referral', 'mycred')}
                                            subtitle={__('Earn when a referred visitor creates an account', 'mycred')}
                                            amount={rewards.signup?.formatted_amount}
                                            pointLabel={rewards.signup?.point_label}
                                            count={stats.signups || 0}
                                            countLabel={__('Signups', 'mycred')}
                                            inactive={!rewards.signup}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}

                        {showProduct && (
                            <Box>
                                <Typography sx={{
                                    fontSize: '11px', fontWeight: 700, color: '#8B83A8', mb: 1,
                                    letterSpacing: '0.04em', textTransform: 'uppercase',
                                    fontFamily: "'Instrument Sans', sans-serif",
                                }}>
                                    {__('Product referral', 'mycred')}
                                </Typography>

                                {!woo.enabled ? (
                                    <Paper elevation={0} sx={{
                                        p: 2, borderRadius: '16px', border: '1px dashed #D9D4EC', bgcolor: '#fff',
                                    }}>
                                        <Typography sx={{ fontSize: '13px', color: '#7A7A9A', fontFamily: "'Instrument Sans', sans-serif" }}>
                                            {__('WooCommerce Product Referral is not available. Enable Toolkit Pro and the Product Referral hook to use this section.', 'mycred')}
                                        </Typography>
                                    </Paper>
                                ) : (
                                    <Paper elevation={0} sx={{
                                        borderRadius: '18px',
                                        border: '1.5px solid #F59E0B25',
                                        bgcolor: '#fff',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                    }}>
                                        <Box sx={{
                                            px: '16px', py: '12px',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            bgcolor: '#F59E0B0D',
                                            borderBottom: '1px solid #F59E0B18',
                                        }}>
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: '10px',
                                                bgcolor: '#F59E0B18',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <ShoppingBagOutlinedIcon sx={{ fontSize: 20, color: '#D97706' }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1040', fontFamily: "'Instrument Sans', sans-serif" }}>
                                                    {__('Product referral', 'mycred')}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#8B83A8', fontFamily: "'Instrument Sans', sans-serif" }}>
                                                    {__('Share a product link and earn on purchase', 'mycred')}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                size="small"
                                                label={`${stats.products || 0} ${__('sales', 'mycred')}`}
                                                sx={{ height: 24, fontWeight: 700, fontSize: '11px', bgcolor: '#FEF3C7', color: '#92400E' }}
                                            />
                                        </Box>

                                        <Box sx={{ p: '16px' }}>
                                            {(rewards.product_referrer || rewards.product_referee) && (
                                                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                                    {rewards.product_referrer ? (
                                                        <Chip
                                                            size="small"
                                                            label={`${__('You earn', 'mycred')} +${rewards.product_referrer.formatted_amount} ${rewards.product_referrer.point_label || ''}`}
                                                            sx={{ fontWeight: 600, bgcolor: '#ECFDF5', color: '#047857' }}
                                                        />
                                                    ) : null}
                                                    {rewards.product_referee ? (
                                                        <Chip
                                                            size="small"
                                                            label={`${__('Friend earns', 'mycred')} +${rewards.product_referee.formatted_amount} ${rewards.product_referee.point_label || ''}`}
                                                            sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                                                        />
                                                    ) : null}
                                                </Box>
                                            )}

                                            <FormControl fullWidth size="small" sx={{ mb: 1.25 }}>
                                                <Select
                                                    displayEmpty
                                                    value={productId}
                                                    onChange={(e) => {
                                                        setProductId(e.target.value);
                                                        setProductLink('');
                                                    }}
                                                    sx={{ borderRadius: '12px', fontSize: '13px', bgcolor: '#F8F7FC' }}
                                                >
                                                    <MenuItem value="">
                                                        <em>{__('Select a product', 'mycred')}</em>
                                                    </MenuItem>
                                                    {products.map((p) => (
                                                        <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                disabled={!productId || productLoading}
                                                onClick={handleGenerateProduct}
                                                sx={{
                                                    bgcolor: '#D97706',
                                                    textTransform: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: 'none',
                                                    fontWeight: 700,
                                                    mb: productLink ? 1.25 : 0,
                                                    '&:hover': { bgcolor: '#B45309', boxShadow: 'none' },
                                                }}
                                            >
                                                {productLoading ? __('Generating...', 'mycred') : __('Generate product link', 'mycred')}
                                            </Button>

                                            {productLink ? (
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={productLink}
                                                        InputProps={{ readOnly: true }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                bgcolor: '#FFFBEB',
                                                            },
                                                        }}
                                                    />
                                                    <IconButton
                                                        onClick={() => handleCopy(productLink, setProductCopied)}
                                                        sx={{ bgcolor: '#FEF3C7', color: '#D97706', borderRadius: '12px' }}
                                                    >
                                                        {productCopied ? <CheckIcon /> : <ContentCopyIcon />}
                                                    </IconButton>
                                                </Box>
                                            ) : null}
                                        </Box>
                                    </Paper>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function RewardCard({ icon, accent, title, subtitle, amount, pointLabel, count, countLabel, inactive }) {
    return (
        <Paper elevation={0} sx={{
            p: '14px',
            borderRadius: '16px',
            border: `1.5px solid ${accent}22`,
            bgcolor: '#fff',
            opacity: inactive ? 0.7 : 1,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{
                    width: 40, height: 40, borderRadius: '12px',
                    bgcolor: `${accent}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    {icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1040', fontFamily: "'Instrument Sans', sans-serif" }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#8B83A8', mt: 0.25, fontFamily: "'Instrument Sans', sans-serif" }}>
                        {subtitle}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.25 }}>
                        <Typography sx={{ fontSize: '15px', fontWeight: 800, color: inactive ? '#9CA3AF' : '#059669', fontFamily: "'Instrument Sans', sans-serif" }}>
                            {inactive ? __('Disabled', 'mycred') : `+${amount || '0'} ${pointLabel || ''}`}
                        </Typography>
                        <Chip
                            size="small"
                            label={`${count} ${countLabel}`}
                            sx={{
                                height: 24,
                                fontWeight: 700,
                                fontSize: '11px',
                                bgcolor: `${accent}12`,
                                color: accent,
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}
