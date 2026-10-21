import { render } from '@wordpress/element';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('mycred-about-ui-root');
    if (rootElement) {
        render(<App />, rootElement);
    }
});
