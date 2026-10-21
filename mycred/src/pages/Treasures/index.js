import { render } from '@wordpress/element';
import App from './App';

const root = document.getElementById('mycred-treasures-ui-root');
if (root) {
    render(<App />, root);
}
