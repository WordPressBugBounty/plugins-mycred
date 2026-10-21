import { useLayoutEffect, useMemo, useState, createPortal } from '@wordpress/element';
import { FormControl, MenuItem, Select } from '@mui/material';
import { COLORS, FONTS, SHADOWS } from '../../../shared/adminTheme/tokens';
import { removeLegacySelect2 } from '../../../shared/legacyEditors/initLegacySelect2';

export const LEGACY_SELECT_MENU_PROPS = {
    PaperProps: {
        sx: {
            mt: 0.5,
            borderRadius: '8px',
            boxShadow: SHADOWS.menu,
            border: `1px solid ${COLORS.border}`,
            overflow: 'hidden',
            '& .MuiMenuItem-root': {
                fontFamily: FONTS.sans,
                fontSize: '14px',
                fontWeight: 400,
                color: COLORS.textPrimary,
                minHeight: 40,
            },
            '& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root.Mui-selected:hover': {
                backgroundColor: `${COLORS.sidebarActive} !important`,
            },
        },
    },
};

/** Single-select chrome matching General Settings / Loyalty. */
export const LEGACY_SELECT_SX = {
    height: 40,
    borderRadius: '8px',
    bgcolor: COLORS.inputBg,
    fontFamily: FONTS.sans,
    fontSize: '14px',
    color: COLORS.textPrimary,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.borderInput,
        borderWidth: '1px !important',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.borderInput,
        borderWidth: '1px !important',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.primary,
        borderWidth: '1px !important',
    },
    '& .MuiSelect-select': {
        minHeight: 'unset !important',
        py: '10px',
        display: 'flex',
        alignItems: 'center',
    },
    '& .MuiSelect-icon': {
        color: COLORS.textSecondary,
    },
    '& .MuiSelect-select:focus, & .MuiOutlinedInput-input': {
        border: 'none !important',
        boxShadow: 'none !important',
        outline: 'none !important',
        backgroundColor: 'transparent !important',
    },
};

/** Multi-select: same chrome, auto height for chips. */
export const LEGACY_MULTI_SELECT_SX = {
    ...LEGACY_SELECT_SX,
    height: 'auto',
    minHeight: 40,
    '& .MuiSelect-select': {
        ...LEGACY_SELECT_SX['& .MuiSelect-select'],
        py: '8px',
        gap: '4px',
        flexWrap: 'wrap',
    },
};

function MuiSelectControl({ selectEl }) {
    const options = useMemo(
        () => Array.from(selectEl.options || []).map((opt) => ({
            value: opt.value,
            label: (opt.textContent || '').trim(),
        })),
        [selectEl]
    );
    const [value, setValue] = useState(selectEl.value || '');

    const onChange = (event) => {
        const next = event.target.value;
        setValue(next);
        selectEl.value = next;
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    };

    return (
        <FormControl fullWidth size="small">
            <Select
                value={value}
                onChange={onChange}
                displayEmpty
                MenuProps={LEGACY_SELECT_MENU_PROPS}
                sx={LEGACY_SELECT_SX}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value || opt.label} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

/**
 * Hide a legacy <select> and render a Loyalty-style MUI Select in its place.
 * The native field stays in the form so PHP still receives the posted value.
 */
export default function LegacyMuiSelect({ selectEl }) {
    const [host, setHost] = useState(null);

    useLayoutEffect(() => {
        if (!selectEl) {
            setHost(null);
            return undefined;
        }

        removeLegacySelect2(selectEl.parentElement || document);

        const el = document.createElement('div');
        el.className = 'mycred-legacy-mui-select';
        selectEl.insertAdjacentElement('afterend', el);
        selectEl.classList.add('mycred-native-select-hidden');
        selectEl.setAttribute('aria-hidden', 'true');
        selectEl.tabIndex = -1;
        setHost(el);

        return () => {
            el.remove();
            selectEl.classList.remove('mycred-native-select-hidden');
            selectEl.removeAttribute('aria-hidden');
            selectEl.tabIndex = 0;
            setHost(null);
        };
    }, [selectEl]);

    if (!selectEl || !host) {
        return null;
    }

    return createPortal(<MuiSelectControl selectEl={selectEl} />, host);
}
