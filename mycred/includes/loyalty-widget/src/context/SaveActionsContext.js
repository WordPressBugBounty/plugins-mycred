import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
} from '@wordpress/element';

const SaveActionsContext = createContext({
    registerSaveActions: () => {},
    clearSaveActions: () => {},
    saveActions: null,
});

export function SaveActionsProvider({ children }) {
    const [saveActions, setSaveActions] = useState(null);

    const registerSaveActions = useCallback((actions) => {
        setSaveActions(actions);
    }, []);

    const clearSaveActions = useCallback(() => {
        setSaveActions(null);
    }, []);

    const value = useMemo(() => ({
        registerSaveActions,
        clearSaveActions,
        saveActions,
    }), [registerSaveActions, clearSaveActions, saveActions]);

    return (
        <SaveActionsContext.Provider value={value}>
            {children}
        </SaveActionsContext.Provider>
    );
}

export function useSaveActions() {
    return useContext(SaveActionsContext);
}

export function useRegisterSaveActions({
    onSave,
    onReset,
    loading = false,
    label,
    resetLabel,
}) {
    const { registerSaveActions, clearSaveActions } = useSaveActions();

    useEffect(() => {
        registerSaveActions({
            onSave,
            onReset,
            loading,
            label: label || 'Update Settings',
            resetLabel,
        });
        return () => clearSaveActions();
    }, [onSave, onReset, loading, label, resetLabel, registerSaveActions, clearSaveActions]);
}
