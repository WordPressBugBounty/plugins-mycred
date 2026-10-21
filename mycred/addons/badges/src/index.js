import React from 'react';
import { render } from '@wordpress/element';
import App from './App';
import AchievementTypesApp from './components/AchievementTypes/AchievementTypesApp';
import { AdminThemeProvider } from '../../../src/shared/adminTheme/AdminThemeProvider';

const init = () => {
    const badgesRootElement = document.getElementById('mycred-badges-list-root');
    if (badgesRootElement) {
        render(
            <AdminThemeProvider>
                <App />
            </AdminThemeProvider>,
            badgesRootElement
        );
    }

    const typesRootElement = document.getElementById('mycred-achievement-types-root');
    if (typesRootElement) {
        render(
            <AdminThemeProvider>
                <AchievementTypesApp />
            </AdminThemeProvider>,
            typesRootElement
        );
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
