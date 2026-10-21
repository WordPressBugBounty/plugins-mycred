import { render } from '@wordpress/element';
import App from './App';

const root = document.getElementById('mycred-support-ui-root');
if (root) {
    render(<App />, root);
}
