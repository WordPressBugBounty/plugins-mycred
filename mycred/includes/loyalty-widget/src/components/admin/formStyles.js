import {
    ADMIN_CONTENT_MAX_WIDTH,
    ADMIN_CONTENT_PADDING,
    ADMIN_CARD_GAP,
} from '../../../../../src/shared/adminShell/layout';

const getInputTextSx = (colors) => ({
    '& .MuiOutlinedInput-input, & .MuiInputBase-input': {
        padding: '10px 12px',
        fontSize: '14px',
        color: `${colors.textPrimary} !important`,
        WebkitTextFillColor: `${colors.textPrimary} !important`,
        boxShadow: 'none !important',
        outline: 'none !important',
        border: 'none !important',
        backgroundColor: 'transparent !important',
    },
});

export const getDisabledInputTextSx = (colors) => ({
    '& .MuiOutlinedInput-root.Mui-disabled': {
        backgroundColor: `${colors.paper} !important`,
    },
    '& .MuiInputBase-input.Mui-disabled': {
        color: `${colors.textSecondary} !important`,
        WebkitTextFillColor: `${colors.textSecondary} !important`,
    },
});

/** Returns sx helpers driven by admin theme colors. */
export const getColorInputSx = (colors, isFocused = false) => ({
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${isFocused ? colors.primary : colors.borderInput}`,
    borderRadius: '10px',
    overflow: 'hidden',
    height: 44,
    transition: 'all 0.2s ease-in-out',
    backgroundColor: colors.paper,
    '&:hover': {
        borderColor: isFocused ? colors.primary : colors.border,
    },
});

export const getTemplateCardSx = (colors, selected) => ({
    border: selected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s',
    '&:hover': {
        borderColor: selected ? colors.primary : colors.borderInput,
    },
});

export const getPreviewPanelSx = (colors) => ({
    position: 'sticky',
    top: 0,
    background: colors.paperMuted,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    p: 2,
    width: '100%',
});

export const getTabContentSx = () => ({
    p: { xs: '20px', sm: '24px', md: ADMIN_CONTENT_PADDING },
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
});

export const getFormStackSx = () => ({
    display: 'flex',
    flexDirection: 'column',
    gap: ADMIN_CARD_GAP,
    width: '100%',
});

export const getSplitLayoutSx = () => ({
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 430px' },
    gap: 3,
    alignItems: 'start',
    maxWidth: ADMIN_CONTENT_MAX_WIDTH,
    width: '100%',
});

export const getFieldLabelSx = (colors) => ({
    fontSize: '14px',
    fontWeight: 600,
    color: colors.textPrimary,
});

export const getSecondaryTextSx = (colors) => ({
    fontSize: '13px',
    color: colors.textSecondary,
});

export const getTextFieldSx = (colors, options = {}) => ({
    minWidth: options.minWidth || undefined,
    '& .MuiOutlinedInput-root': {
        height: options.height ?? 40,
        borderRadius: options.borderRadius ?? '10px',
        backgroundColor: `${colors.paper} !important`,
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
            borderColor: `${colors.borderInput} !important`,
            borderWidth: '1px !important',
        },
        '&:hover fieldset': {
            borderColor: `${colors.border} !important`,
        },
        '&.Mui-focused fieldset': {
            borderColor: `${colors.primary} !important`,
            borderWidth: '1px !important',
        },
        ...getInputTextSx(colors),
    },
});

export const getSelectSx = (colors, options = {}) => ({
    borderRadius: options.borderRadius ?? '10px',
    height: options.height ?? 40,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: `${colors.borderInput} !important`,
        borderWidth: '1px !important',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: `${colors.primary} !important`,
        borderWidth: '1px !important',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: `${colors.border} !important`,
    },
    '& .MuiSelect-select': {
        padding: '10px 12px',
        fontSize: '14px',
        color: `${colors.textPrimary} !important`,
        WebkitTextFillColor: `${colors.textPrimary} !important`,
        boxShadow: 'none !important',
        outline: 'none !important',
        backgroundColor: 'transparent !important',
    },
});

export const getTabsSx = (colors) => ({
    mb: 4,
    minHeight: 'auto',
    '& .MuiTabs-indicator': {
        backgroundColor: colors.primary,
    },
    '& .MuiTab-root': {
        minHeight: 'auto',
        py: 1.5,
        px: 3,
        textTransform: 'none',
        fontSize: '14px',
        fontWeight: 600,
        color: colors.textSecondary,
        '&.Mui-selected': {
            color: colors.primary,
        },
    },
});

export const getAccordionSx = (colors) => ({
    boxShadow: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px !important',
    mb: 0,
    bgcolor: colors.paper,
    '&:before': { display: 'none' },
    '&.Mui-expanded': {
        margin: '0 !important',
    },
});

export const getAccordionSummarySx = (colors) => ({
    bgcolor: colors.paperMuted,
    borderRadius: '8px',
    '& .MuiTypography-root': {
        fontSize: '15px',
        fontWeight: 600,
        color: colors.textPrimary,
    },
});

export const getProBadgeSx = (colors) => ({
    bgcolor: colors.primaryLight,
    color: colors.primary,
    fontSize: '10px',
    fontWeight: 700,
    px: 1,
    py: 0.25,
    borderRadius: '4px',
    textTransform: 'uppercase',
    border: `1px solid ${colors.borderInput}`,
});

export const getWarningBannerSx = (colors) => ({
    p: 2,
    bgcolor: colors.warningBg,
    borderRadius: '8px',
    border: `1px solid ${colors.warningBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
});

export const getFileUploadRowSx = (colors) => ({
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
    height: 44,
    bgcolor: colors.paper,
});

export const getFileUploadButtonSx = (colors) => ({
    textTransform: 'none',
    color: colors.textPrimary,
    fontWeight: 600,
    px: 2,
    height: '100%',
    bgcolor: colors.paperMuted,
    borderRadius: 0,
    borderRight: `1px solid ${colors.border}`,
    flexShrink: 0,
    '&:hover': { bgcolor: colors.hover },
});

export const getImagePreviewBoxSx = (colors) => ({
    mt: 2,
    p: 2,
    bgcolor: colors.paperMuted,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
});

export const getEmptyStateSx = (colors) => ({
    p: 3,
    borderRadius: '12px',
    bgcolor: colors.paperMuted,
    border: `1px dashed ${colors.borderInput}`,
    textAlign: 'center',
});

export const getFaqCardSx = (colors) => ({
    p: 2.5,
    borderRadius: '12px',
    boxShadow: 'none',
    border: `1px solid ${colors.border}`,
    bgcolor: colors.paper,
});

export const getAddButtonSx = (colors) => ({
    mt: 2,
    textTransform: 'none',
    fontWeight: 600,
    color: colors.primary,
    borderRadius: '8px',
    border: `1px dashed ${colors.borderInput}`,
    px: 2,
    py: 1,
    width: '100%',
    '&:hover': {
        bgcolor: colors.primaryLight,
        borderColor: colors.primary,
    },
});

export const getPreviewFrameSx = (colors, scale = 1) => ({
    bgcolor: colors.paperMuted,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    minHeight: 820 * scale,
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `linear-gradient(180deg, ${colors.paperMuted} 0%, ${colors.contentBg} 100%)`,
});

export const getPreviewTitleBarSx = (colors) => ({
    height: 28,
    bgcolor: colors.hover,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    px: 1.5,
    gap: 0.75,
});
