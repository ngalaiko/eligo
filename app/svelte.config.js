import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        preprocess({
            postcss: true,
            typescript: true
        })
    ],
    kit: {
        adapter: adapter(),
        serviceWorker: {
            register: false
        }
    }
};

export default config;
