import { createRoot } from '@wordpress/element';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import { AdminThemeProvider } from '../../../src/shared/adminTheme/AdminThemeProvider';
import App from './App';
import './index.scss';

const container = document.getElementById('mycred-loyalty-widget');

if (container) {
    const root = createRoot(container);
    root.render(
        <AdminThemeProvider>
            <App />
        </AdminThemeProvider>
    );
}
