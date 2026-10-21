import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import App from './App.jsx';
import { AdminThemeProvider } from '../../../src/shared/adminTheme/AdminThemeProvider';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mycred-woocommerce-settings-root');
    if (container) {
        const root = createRoot(container);
        root.render(
            <AdminThemeProvider>
                <App />
            </AdminThemeProvider>
        );
    }
});
