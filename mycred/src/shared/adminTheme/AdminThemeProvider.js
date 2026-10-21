import React, { createContext, useContext, useMemo } from 'react';
import {
    COLORS,
    FONTS,
    TYPOGRAPHY,
    SPACING,
    RADIUS,
    SHADOWS,
    LAYOUT,
    COMPONENTS,
    CSS_VARIABLES,
    tokens,
} from './tokens';

const AdminThemeContext = createContext(null);

export const AdminThemeProvider = ({ children }) => {
    const value = useMemo(
        () => ({
            // Backward-compatible
            colors: COLORS,
            // Full token set
            fonts: FONTS,
            typography: TYPOGRAPHY,
            spacing: SPACING,
            radius: RADIUS,
            shadows: SHADOWS,
            layout: LAYOUT,
            components: COMPONENTS,
            cssVariables: CSS_VARIABLES,
            tokens,
        }),
        []
    );

    return (
        <AdminThemeContext.Provider value={value}>
            {children}
        </AdminThemeContext.Provider>
    );
};

export const useAdminTheme = () => {
    const context = useContext(AdminThemeContext);
    if (!context) {
        throw new Error('useAdminTheme must be used within AdminThemeProvider');
    }
    return context;
};

export {
    COLORS,
    FONTS,
    TYPOGRAPHY,
    SPACING,
    RADIUS,
    SHADOWS,
    LAYOUT,
    COMPONENTS,
    CSS_VARIABLES,
    tokens,
};
