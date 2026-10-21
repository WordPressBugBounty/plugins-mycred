import { FONTS } from '../../shared/adminTheme/tokens';

export const getHookSettingsCss = (colors) => `
    .hook-settings-rendered h3 {
        font-size: 15px; font-weight: 600; color: ${colors.textPrimary};
        font-family: ${FONTS.sans}; margin: 0 0 16px 0; padding: 0;
    }
    .hook-settings-rendered .hook-instance {
        margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid ${colors.border};
    }
    .hook-settings-rendered .hook-instance:last-of-type {
        margin-bottom: 0; padding-bottom: 0; border-bottom: none;
    }
    .hook-settings-rendered label {
        display: block; font-weight: 600; margin-bottom: 8px;
        color: ${colors.textPrimary}; font-size: 14px; font-family: ${FONTS.sans};
        overflow-wrap: anywhere; word-break: break-word;
    }
    .hook-settings-rendered input[type="text"],
    .hook-settings-rendered input[type="number"],
    .hook-settings-rendered textarea {
        width: 100%; padding: 8px 12px; border: 1px solid ${colors.borderInput};
        background-color: ${colors.paper}; border-radius: 8px;
        font-family: ${FONTS.sans}; font-size: 14px; color: ${colors.textPrimary};
        box-sizing: border-box; transition: border-color 0.2s;
        outline: none !important; box-shadow: none !important;
    }
    .hook-settings-rendered select {
        width: 100%; padding: 0 12px; border: 1px solid ${colors.borderInput};
        background-color: ${colors.paper}; border-radius: 8px;
        font-family: ${FONTS.sans}; font-size: 14px; color: ${colors.textPrimary};
        box-sizing: border-box; transition: border-color 0.2s;
        outline: none !important; box-shadow: none !important;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b57a1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 32px;
    }
    .hook-settings-rendered select[multiple] {
        background-image: none;
        height: auto;
        min-height: 80px;
        padding-right: 12px;
    }
    .hook-settings-rendered .h2 { display: flex; gap: 8px; align-items: flex-start; }
    .hook-settings-rendered .h2 > .select2-container { flex: 1; width: auto !important; margin-top: 0; }
    .hook-settings-rendered .h2 input[type="text"],
    .hook-settings-rendered .h2 input[type="number"] { width: 80px; flex-shrink: 0; min-height: 40px; margin-top: 0; }
    .hook-settings-rendered .h2 input.long,
    .hook-settings-rendered input.long {
        width: 100% !important;
        max-width: 100%;
        flex: 1 1 100%;
        min-height: 40px;
    }
    .hook-settings-rendered .h2 select { flex: 1; min-height: 40px; margin-top: 0; }
    .hook-settings-rendered ol {
        list-style: none !important;
        margin: 0 0 24px 0;
        padding: 0;
    }
    .hook-settings-rendered ol li {
        list-style: none !important;
        margin: 0 0 16px 0;
        padding: 0;
    }
    .hook-settings-rendered ol li::marker,
    .hook-settings-rendered ol li::before {
        content: none !important;
        display: none !important;
    }
    .hook-settings-rendered ol li.empty {
        display: none !important;
    }
    .hook-settings-rendered label.subheader {
        display: block;
        font-size: 15px;
        font-weight: 600;
        margin: 8px 0 12px 0;
        color: ${colors.textPrimary};
    }
    .hook-settings-rendered input::placeholder,
    .hook-settings-rendered textarea::placeholder { color: ${colors.textMuted}; }
    .hook-settings-rendered input:focus,
    .hook-settings-rendered input:focus-visible,
    .hook-settings-rendered textarea:focus,
    .hook-settings-rendered textarea:focus-visible,
    .hook-settings-rendered select:focus,
    .hook-settings-rendered select:focus-visible {
        outline: none !important;
        box-shadow: none !important;
        border: 1px solid ${colors.configure} !important;
        background-color: ${colors.paper} !important;
    }
    .hook-settings-rendered input[type="checkbox"] {
        width: 16px; height: 16px; padding: 0; margin: 0 8px 0 0;
        border: 1px solid ${colors.borderInput}; border-radius: 4px;
        accent-color: ${colors.configure}; cursor: pointer; flex-shrink: 0; vertical-align: middle;
    }
    .hook-settings-rendered input[type="radio"] {
        width: 16px; height: 16px; padding: 0; margin: 0 8px 0 0;
        accent-color: ${colors.configure}; cursor: pointer; flex-shrink: 0; vertical-align: middle;
    }
    .hook-settings-rendered .form-group { margin-bottom: 20px; display: flex; flex-direction: column; justify-content: flex-end; }
    .hook-settings-rendered .row { display: flex; flex-wrap: wrap; margin: 0 -10px; align-items: flex-start; }
    .hook-settings-rendered [class*="col-"] { padding: 0 10px; box-sizing: border-box; }
    .hook-settings-rendered .col-lg-2 { flex: 0 0 16.666%; max-width: 16.666%; padding-bottom: 20px; }
    .hook-settings-rendered .col-lg-3 { flex: 0 0 25%; max-width: 25%; padding-bottom: 20px; }
    .hook-settings-rendered .col-lg-4 { flex: 0 0 33.333%; max-width: 33.333%; padding-bottom: 20px; }
    .hook-settings-rendered .col-lg-6 { flex: 0 0 50%; max-width: 50%; padding-bottom: 20px; }
    .hook-settings-rendered .col-lg-8 { flex: 0 0 66.666%; max-width: 66.666%; padding-bottom: 20px; }
    .hook-settings-rendered .col-lg-9 { flex: 0 0 75%; max-width: 75%; padding-bottom: 20px; }
    .hook-settings-rendered .col-lg-12 { flex: 0 0 100%; max-width: 100%; padding-bottom: 20px; }
    .hook-settings-rendered .hook-instance > .row > .col-lg-2 {
        flex: 1 1 180px; max-width: 280px; min-width: 0;
    }
    .hook-settings-rendered .hook-instance > .row > .col-lg-4 {
        flex: 1.2 1 180px; max-width: none; min-width: 0;
    }
    .hook-settings-rendered .hook-instance > .row > .col-lg-6 {
        flex: 2 1 220px; max-width: none; min-width: 0;
    }
    @media (max-width: 768px) {
        .hook-settings-rendered [class*="col-"] { flex: 0 0 100%; max-width: 100%; }
        .hook-settings-rendered .hook-instance > .row > [class*="col-"] { flex: 0 0 100%; max-width: 100%; }
    }
    .hook-settings-rendered .form-group { margin-bottom: 0; display: flex; flex-direction: column; justify-content: flex-start; height: 100%; min-height: 56px; }
    .hook-settings-rendered .description {
        display: block; font-size: 12px; color: ${colors.textSecondary};
        margin-top: 6px; font-family: ${FONTS.sans};
    }
    .hook-settings-rendered .description a { color: ${colors.configure}; text-decoration: none; }
    .hook-settings-rendered .add_button,
    .hook-settings-rendered .mycred-add-specific-hook,
    .hook-settings-rendered .mycred-add-specific-view-content-hook,
    .hook-settings-rendered .mycred-add-specific-view-content-hook-author,
    .hook-settings-rendered .mycred-woo-add-specific-hook,
    .hook-settings-rendered .mycred-add-bday-pro-hook,
    .hook-settings-rendered .mycred-frm-add-hook,
    .hook-settings-rendered .mycred-frm-quiz-add-hook,
    .hook-settings-rendered .mycred-frm-poll-add-hook {
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        background-color: ${colors.configure} !important; border: 1px solid ${colors.configure} !important;
        color: ${colors.white} !important; border-radius: 8px !important;
        padding: 0 24px !important; height: 36px !important; font-weight: 600 !important;
        font-size: 14px !important; cursor: pointer; text-decoration: none !important; margin: 0; min-height: 36px !important; line-height: 1 !important;
    }
    .hook-settings-rendered .add_button:hover,
    .hook-settings-rendered .mycred-add-specific-hook:hover,
    .hook-settings-rendered .mycred-add-specific-view-content-hook:hover,
    .hook-settings-rendered .mycred-add-specific-view-content-hook-author:hover,
    .hook-settings-rendered .mycred-woo-add-specific-hook:hover,
    .hook-settings-rendered .mycred-add-bday-pro-hook:hover,
    .hook-settings-rendered .mycred-frm-add-hook:hover,
    .hook-settings-rendered .mycred-frm-quiz-add-hook:hover,
    .hook-settings-rendered .mycred-frm-poll-add-hook:hover {
        background-color: ${colors.configureHover} !important; border-color: ${colors.configureHover} !important;
    }
    .hook-settings-rendered .mycred-remove-specific-hook,
    .hook-settings-rendered .mycred-remove-specific-view-content-hook,
    .hook-settings-rendered .mycred-remove-specific-view-content-hook-author,
    .hook-settings-rendered .mycred-woo-remove-specific-hook,
    .hook-settings-rendered .mycred-remove-bday-pro-hook,
    .hook-settings-rendered .mycred-remove-hook,
    .hook-settings-rendered .mycred-frm-remove-hook,
    .hook-settings-rendered .mycred-frm-quiz-remove-hook,
    .hook-settings-rendered .mycred-frm-poll-remove-hook {
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        background-color: transparent !important; border: 1px solid ${colors.borderInput} !important;
        color: ${colors.textPrimary} !important; border-radius: 8px !important;
        padding: 0 24px !important; height: 36px !important; font-weight: 600 !important;
        font-size: 14px !important; cursor: pointer; margin-left: 12px; margin-bottom: 0; min-height: 36px !important; line-height: 1 !important;
    }
    .hook-settings-rendered .mycred-remove-specific-hook:hover,
    .hook-settings-rendered .mycred-remove-specific-view-content-hook:hover,
    .hook-settings-rendered .mycred-remove-specific-view-content-hook-author:hover,
    .hook-settings-rendered .mycred-woo-remove-specific-hook:hover,
    .hook-settings-rendered .mycred-remove-bday-pro-hook:hover,
    .hook-settings-rendered .mycred-remove-hook:hover,
    .hook-settings-rendered .mycred-frm-remove-hook:hover,
    .hook-settings-rendered .mycred-frm-quiz-remove-hook:hover,
    .hook-settings-rendered .mycred-frm-poll-remove-hook:hover {
        border-color: ${colors.textPrimary} !important; background-color: ${colors.hover} !important;
    }
    .hook-settings-rendered .mycred-remove-bday-pro-hook.mycred-bday-pro-remove-hidden {
        display: none !important;
    }
    .hook-settings-rendered {
        overflow-x: hidden;
        max-width: 100%;
    }
    .hook-settings-rendered .row {
        max-width: 100%;
        box-sizing: border-box;
    }
    .hook-settings-rendered .select2-container {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 40px !important;
        box-sizing: border-box !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--single .select2-selection__arrow {
        height: 100% !important;
        right: 8px !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--single,
    .hook-settings-rendered .select2-container--default .select2-selection--multiple {
        border: 1px solid ${colors.borderInput} !important;
        background-color: ${colors.paper} !important;
        border-radius: 8px !important; min-height: 40px !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--single {
        display: flex;
        align-items: center;
        overflow: hidden !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--multiple {
        display: block;
        height: auto !important;
        min-height: 40px !important;
        padding: 4px 8px !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--multiple .select2-selection__rendered {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--multiple .select2-search--inline {
        float: none !important;
        margin: 0 !important;
        flex: 1 1 auto;
        min-width: 2ch;
        max-width: 100%;
    }
    /* Select2 sets a huge inline width on this field — that creates the page scrollbar */
    .hook-settings-rendered .select2-container--default .select2-selection--multiple .select2-search--inline .select2-search__field {
        margin: 0 !important;
        width: auto !important;
        max-width: 100% !important;
        min-width: 2ch !important;
        min-height: 28px !important;
        height: 28px !important;
        padding: 0 4px !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        background: transparent !important;
        box-sizing: border-box !important;
    }
    /* Global clamp when dropdown is attached to body */
    .select2-container--open .select2-search--inline .select2-search__field {
        max-width: 100% !important;
        min-width: 0 !important;
    }
    body.mycred-hooks-select2-open {
        overflow-x: hidden !important;
    }
    .hook-settings-rendered select.post-options-author.select2-hidden-accessible,
    .hook-settings-rendered select.post-options-member.select2-hidden-accessible {
        display: none !important;
    }
    .hook-settings-rendered .select2-container--default.select2-container--focus .select2-selection--single,
    .hook-settings-rendered .select2-container--default.select2-container--focus .select2-selection--multiple {
        border: 1px solid ${colors.configure} !important;
        background-color: ${colors.paper} !important;
        box-shadow: none !important;
        outline: none !important;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--single .select2-selection__rendered {
        color: ${colors.textPrimary} !important; line-height: normal !important;
        padding-left: 12px !important; font-size: 14px !important; width: 100%;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--multiple .select2-selection__choice {
        background-color: ${colors.primaryLight} !important; border: none !important;
        color: ${colors.textPrimary} !important; border-radius: 6px !important;
        margin: 2px !important;
        padding: 2px 6px !important;
        line-height: 1.3 !important;
        max-width: 100%;
        box-sizing: border-box;
    }
    .hook-settings-rendered .select2-container--default .select2-selection--multiple .select2-selection__choice__remove {
        color: ${colors.configure} !important;
    }
    .hook-settings-rendered .select2-dropdown,
    .select2-dropdown.mycred-hook-select2-dropdown {
        border: 1px solid ${colors.border} !important; border-radius: 12px !important;
        box-shadow: ${colors.shadowMenu} !important; background-color: ${colors.paper} !important;
        box-sizing: border-box !important;
        max-width: min(100vw - 24px, 480px) !important;
        overflow-x: hidden !important;
        z-index: 100000 !important;
    }
    .hook-settings-rendered .select2-results__option,
    .select2-dropdown.mycred-hook-select2-dropdown .select2-results__option {
        color: ${colors.textPrimary} !important;
    }
    .hook-settings-rendered .select2-results__option--highlighted[aria-selected],
    .select2-dropdown.mycred-hook-select2-dropdown .select2-results__option--highlighted[aria-selected] {
        background-color: ${colors.configure} !important; color: ${colors.white} !important;
    }
    .hook-settings-rendered input:-webkit-autofill,
    .hook-settings-rendered input:-webkit-autofill:hover,
    .hook-settings-rendered input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${colors.paper} inset !important;
        -webkit-text-fill-color: ${colors.textPrimary} !important;
        border: 1px solid ${colors.borderInput} !important;
    }
    .hook-settings-rendered input:-webkit-autofill:focus {
        border: 1px solid ${colors.configure} !important;
    }
    .hook-settings-rendered .form-group.specific-hook-actions { flex-direction: row; justify-content: flex-start; align-items: flex-start; height: auto; margin-top: 12px; }
    .hook-settings-rendered .form-group.specific-hook-actions.textright { justify-content: flex-end; }
    .hook-settings-rendered .form-group.mycred-frm-specific-hook-actions {
        flex-direction: row; justify-content: flex-end; align-items: center; height: auto; margin-top: 12px; gap: 12px;
    }
    .hook-settings-rendered .form-group.specific-hook-actions .mycred-remove-specific-hook,
    .hook-settings-rendered .form-group.specific-hook-actions .mycred-remove-specific-view-content-hook,
    .hook-settings-rendered .form-group.specific-hook-actions .mycred-remove-specific-view-content-hook-author,
    .hook-settings-rendered .form-group.specific-hook-actions .mycred-woo-remove-specific-hook,
    .hook-settings-rendered .form-group.specific-hook-actions .mycred-remove-bday-pro-hook { margin-left: 12px; margin-bottom: 0; }
    .hook-settings-rendered .textright { text-align: right; }
    .hook-settings-rendered .mb-4 { margin-bottom: 32px; }
`;
