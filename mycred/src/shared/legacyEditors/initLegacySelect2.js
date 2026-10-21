const getJQuery = () => {
    const $ = window.jQuery;
    if (!$?.fn?.select2) {
        return null;
    }
    return $;
};

const getSelect2Elements = (container, { includeHidden = true, multiplesOnly = false } = {}) => {
    if (!container) {
        return [];
    }

    return Array.from(
        container.querySelectorAll('select.mycred-select2, select.select2-hidden-accessible')
    ).filter((el) => {
        if (el.id === 'generalexcludelist') {
            return false;
        }
        if (!includeHidden && el.classList.contains('mycred-native-select-hidden')) {
            return false;
        }
        if (multiplesOnly && !el.multiple) {
            return false;
        }
        return true;
    });
};

const hasAjaxSelect2 = (el) => {
    const $ = getJQuery();
    if (!$ || !el) {
        return false;
    }
    const $el = $(el);
    const instance = $el.data('select2');
    if (!instance) {
        return false;
    }
    const options = instance.options?.options || instance.options || {};
    return Boolean(options.ajax);
};

const ensureSelect2DropdownStyles = () => {
    if (document.getElementById('mycred-legacy-select2-css')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'mycred-legacy-select2-css';
    style.textContent = `
        .select2-container { z-index: 100000; }
        .select2-dropdown {
            z-index: 100001 !important;
            box-sizing: border-box !important;
        }
        .select2-container--open .select2-results__option--highlighted[aria-selected] {
            background-color: var(--mycred-configure, #8559ff) !important;
            color: #fff !important;
        }
    `;
    document.head.appendChild(style);
};

export const removeLegacySelect2 = (container) => {
    const $ = getJQuery();
    if (!$ || !container) {
        return;
    }

    getSelect2Elements(container).forEach((el) => {
        if (hasAjaxSelect2(el)) {
            return;
        }
        const $el = $(el);
        $el.off('.mycredLegacySelect2');
        if ($el.data('select2') || $el.hasClass('select2-hidden-accessible')) {
            try {
                $el.select2('destroy');
            } catch (error) {
                // Widget may already be destroyed.
            }
        }
    });
};

export const initLegacySelect2 = (container) => {
    const $ = getJQuery();
    if (!$ || !container) {
        return;
    }

    ensureSelect2DropdownStyles();
    removeLegacySelect2(container);

    // Only init Select2 on multi-selects; single selects use LegacyMuiSelect.
    getSelect2Elements(container, { includeHidden: false, multiplesOnly: true }).forEach((el) => {
        if (hasAjaxSelect2(el)) {
            return;
        }
        const $el = $(el);
        $el.select2({
            width: '100%',
            dropdownParent: $(document.body),
            minimumResultsForSearch: Infinity,
        });
        const $wrap = $el.next('.select2-container');
        $wrap.css({
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
        });
        $el.on('select2:open.mycredLegacySelect2', () => {
            window.setTimeout(() => {
                const width = $wrap.outerWidth();
                $('.select2-container--open .select2-dropdown').css({
                    width,
                    minWidth: width,
                    maxWidth: width,
                });
            }, 0);
        });
    });
};

const stripNestedLabelFor = (input) => {
    const enclosingLabel = input.closest('label');
    if (enclosingLabel?.hasAttribute('for')) {
        enclosingLabel.removeAttribute('for');
    }
};

const retargetOrStripLabels = (input, originalId, unique) => {
    const wrapper = input.closest(
        '.mycred-checkbox-radio-wrapper, .radio, .checkbox, .form-group, label'
    ) || input.parentElement;

    if (!wrapper || !originalId) {
        return;
    }

    wrapper.querySelectorAll(`label[for="${CSS.escape(originalId)}"]`).forEach((label) => {
        if (label.contains(input)) {
            label.removeAttribute('for');
        } else {
            label.setAttribute('for', unique);
        }
    });
};

const uniquifyChoiceInputs = (container, selector, flag) => {
    const inputs = Array.from(container.querySelectorAll(selector));
    const byId = new Map();

    inputs.forEach((input) => {
        stripNestedLabelFor(input);
        if (!input.id) {
            return;
        }
        const list = byId.get(input.id) || [];
        list.push(input);
        byId.set(input.id, list);
    });

    byId.forEach((group, originalId) => {
        if (group.length < 2) {
            return;
        }

        group.forEach((input) => {
            if (input.dataset[flag] === '1') {
                return;
            }
            const unique = `${originalId}--${input.value || 'opt'}`;
            input.id = unique;
            input.dataset[flag] = '1';
            retargetOrStripLabels(input, originalId, unique);
        });
    });
};

const onLegacyRadioClick = (event) => {
    const fromInput = event.target.closest?.('input[type="radio"]');
    const label = event.target.closest?.('label');
    const input = fromInput || label?.querySelector('input[type="radio"]');
    if (!input || input.disabled) {
        return;
    }

    window.requestAnimationFrame(() => {
        if (input.checked) {
            return;
        }
        input.checked = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
};

export const uniquifyLegacyRadioIds = (container) => {
    if (!container) {
        return;
    }

    uniquifyChoiceInputs(container, 'input[type="radio"][id]', 'legacyRadioUniq');
    uniquifyChoiceInputs(container, 'input[type="checkbox"][id]', 'legacyCheckboxUniq');

    if (container.dataset.legacyChoiceBound === '1') {
        return;
    }

    container.dataset.legacyChoiceBound = '1';
    container.addEventListener('click', onLegacyRadioClick);
};
