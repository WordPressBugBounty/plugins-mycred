const getEditorIds = (container) => {
    if (!container) {
        return [];
    }

    return Array.from(container.querySelectorAll('textarea.wp-editor-area'))
        .map((textarea) => textarea.id)
        .filter(Boolean);
};

export const removeLegacyEditors = (container) => {
    if (!container || !window.wp?.editor?.remove) {
        return;
    }

    getEditorIds(container).forEach((id) => {
        try {
            window.wp.editor.remove(id);
        } catch (error) {
            // Editor may already be removed or never initialized.
        }
    });
};

export const initLegacyEditors = (container) => {
    if (!container || !window.wp?.editor?.initialize) {
        return;
    }

    const textareas = container.querySelectorAll('textarea.wp-editor-area');
    if (!textareas.length) {
        return;
    }

    textareas.forEach((textarea) => {
        const id = textarea.id;
        if (!id) {
            return;
        }

        if (window.wp.editor.remove) {
            try {
                window.wp.editor.remove(id);
            } catch (error) {
                // Editor may already be removed or never initialized.
            }
        }

        const mceInit = window.tinyMCEPreInit?.mceInit?.[id];
        const qtInit = window.tinyMCEPreInit?.qtInit?.[id];

        window.wp.editor.initialize(id, {
            tinymce: mceInit || true,
            quicktags: qtInit || true,
            mediaButtons: true,
        });
    });

    requestAnimationFrame(() => {
        if (!window.tinymce?.editors) {
            return;
        }

        window.tinymce.editors.forEach((editor) => {
            editor.theme?.resize?.();
        });
    });
};
