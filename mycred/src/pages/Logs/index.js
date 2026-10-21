import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LogsThemeProvider } from './ThemeContext';

const container = document.getElementById('mycred-logs-ui-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <LogsThemeProvider>
                <App />
            </LogsThemeProvider>
        </React.StrictMode>
    );
}
