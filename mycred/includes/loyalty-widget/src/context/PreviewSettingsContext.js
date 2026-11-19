import { createContext, useContext, useState, useCallback, useMemo } from '@wordpress/element';
import { normalizeLayoutTemplate } from '../components/preview/templatePresets';

const PreviewSettingsContext = createContext(null);

const getInitialSettings = () => {
    const data = window.mycredLoyaltyWidgetData?.settings || {};
    const design = {
        showLogo: false,
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        buttonColor: '#000000',
        buttonTextColor: '#FFFFFF',
        showBranding: true,
        logoUrl: '',
        logoText: 'Reward Program',
        launcherRadius: 15,
        launcherAnimation: 'fade',
        layoutTemplate: 'modern',
        headerStyle: 'solid',
        headerImageUrl: '',
        headerOverlayOpacity: 0,
        showHeaderTitle: true,
        headerSubtitle: 'Welcome to',
        programTitle: 'Rewards hub',
        borderRadius: 8,
        navLayout: 'grid',
        heroImageUrl: '',
        ...(data.design || {}),
    };
    design.layoutTemplate = normalizeLayoutTemplate(design.layoutTemplate);
    return {
        design,
        content: data.content || {},
        tabs: data.tabs || {},
        general: data.general || {},
        eventtriggers: data.eventtriggers || {},
        faq: {
            screenTitle: 'FAQs',
            items: [],
            ...(data.faq || {}),
        },
    };
};

export function PreviewSettingsProvider({ children }) {
    const [settings, setSettings] = useState(getInitialSettings);
    const [previewGuest, setPreviewGuestState] = useState(true);

    const updateDesign = useCallback((patch) => {
        setSettings((prev) => ({
            ...prev,
            design: typeof patch === 'function' ? patch(prev.design) : { ...prev.design, ...patch },
        }));
    }, []);

    const setDesign = useCallback((design) => {
        setSettings((prev) => ({ ...prev, design }));
    }, []);

    const updateContent = useCallback((audience, patch) => {
        setSettings((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                [audience]: typeof patch === 'function'
                    ? patch(prev.content?.[audience] || {})
                    : { ...prev.content?.[audience], ...patch },
            },
        }));
    }, []);

    const setContentAudience = useCallback((audience, data) => {
        setSettings((prev) => ({
            ...prev,
            content: { ...prev.content, [audience]: data },
        }));
    }, []);

    const updateFaq = useCallback((patch) => {
        setSettings((prev) => ({
            ...prev,
            faq: typeof patch === 'function' ? patch(prev.faq) : { ...prev.faq, ...patch },
        }));
    }, []);

    const setFaq = useCallback((faq) => {
        setSettings((prev) => ({ ...prev, faq }));
    }, []);

    const syncFromSaved = useCallback((section, data) => {
        setSettings((prev) => ({ ...prev, [section]: data }));
    }, []);

    const setPreviewGuest = useCallback((value) => {
        setPreviewGuestState(Boolean(value));
    }, []);

    const value = useMemo(() => ({
        settings,
        design: settings.design,
        content: settings.content,
        tabs: settings.tabs,
        general: settings.general,
        eventtriggers: settings.eventtriggers,
        faq: settings.faq,
        previewGuest,
        updateDesign,
        setDesign,
        updateContent,
        setContentAudience,
        updateFaq,
        setFaq,
        syncFromSaved,
        setPreviewGuest,
    }), [settings, previewGuest, updateDesign, setDesign, updateContent, setContentAudience, updateFaq, setFaq, syncFromSaved, setPreviewGuest]);

    return (
        <PreviewSettingsContext.Provider value={value}>
            {children}
        </PreviewSettingsContext.Provider>
    );
}

export function usePreviewSettings() {
    const ctx = useContext(PreviewSettingsContext);
    if (!ctx) {
        throw new Error('usePreviewSettings must be used within PreviewSettingsProvider');
    }
    return ctx;
}

export default PreviewSettingsContext;
