import { LAYOUT, RADIUS } from '../../shared/adminTheme/tokens';

const CONTROL_HEIGHT = LAYOUT.controlHeight;
const CONTROL_RADIUS = `${RADIUS.control}px`;

/** Shared outlined control chrome (TextField / Select / Autocomplete). */
export const getOutlinedControlRootSx = (colors, options = {}) => {
    const height = options.height ?? CONTROL_HEIGHT;
    const grow = Boolean(options.grow);

    return {
        ...(grow
            ? { minHeight: height, height: 'auto' }
            : { height, minHeight: height }),
        boxSizing: 'border-box',
        borderRadius: options.borderRadius ?? CONTROL_RADIUS,
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
    };
};

export const getInputTextSx = (colors) => ({
    '& .MuiOutlinedInput-input, & .MuiInputBase-input': {
        padding: '0 14px !important',
        height: '100% !important',
        boxSizing: 'border-box',
        fontSize: '14px',
        lineHeight: 1.4,
        color: `${colors.textPrimary} !important`,
        WebkitTextFillColor: `${colors.textPrimary} !important`,
        boxShadow: 'none !important',
        outline: 'none !important',
        border: 'none !important',
        backgroundColor: 'transparent !important',
    },
});

export const getAutocompleteTextFieldSx = (colors) => ({
    width: '100%',
    '& .MuiOutlinedInput-root': {
        ...getOutlinedControlRootSx(colors, { grow: true }),
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '8px',
        paddingRight: '8px',
    },
    '& .MuiOutlinedInput-input, & .MuiAutocomplete-input': {
        padding: '4px 6px !important',
        minHeight: '20px',
        fontSize: '14px',
        lineHeight: '20px',
        color: `${colors.textPrimary} !important`,
        WebkitTextFillColor: `${colors.textPrimary} !important`,
        boxShadow: 'none !important',
        outline: 'none !important',
        border: 'none !important',
        backgroundColor: 'transparent !important',
    },
});

export const getTextFieldSx = (colors, options = {}) => ({
    width: '100%',
    minWidth: options.minWidth || undefined,
    '& .MuiOutlinedInput-root': {
        ...getOutlinedControlRootSx(colors, options),
        ...getInputTextSx(colors),
    },
});

/** Apply on Select (or FormControl wrapping Select). */
export const getSelectSx = (colors, options = {}) => ({
    width: '100%',
    ...getOutlinedControlRootSx(colors, options),
    '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        height: '100% !important',
        minHeight: 'unset !important',
        boxSizing: 'border-box',
        paddingTop: '0 !important',
        paddingBottom: '0 !important',
        paddingLeft: '14px !important',
        paddingRight: '32px !important',
        fontSize: '14px',
        lineHeight: 1.4,
        color: `${colors.textPrimary} !important`,
        WebkitTextFillColor: `${colors.textPrimary} !important`,
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: `${colors.borderInput} !important`,
        borderWidth: '1px !important',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: `${colors.border} !important`,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: `${colors.primary} !important`,
        borderWidth: '1px !important',
    },
});

/** Equal half-width columns in Tools form rows. */
export const fieldColumnSx = {
    flex: '1 1 0',
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
};
