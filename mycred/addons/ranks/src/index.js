import React from 'react';
import { render } from '@wordpress/element';
import App from './App';
import { AdminThemeProvider } from '../../../src/shared/adminTheme/AdminThemeProvider';

const init = () => {
    const rootElement = document.getElementById('mycred-ranks-list-root');
    if (rootElement) {
        render(
            <AdminThemeProvider>
                <App />
            </AdminThemeProvider>,
            rootElement
        );
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
