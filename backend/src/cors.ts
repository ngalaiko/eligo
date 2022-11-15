import type { CorsOptions } from 'cors';

export default {
    methods: ['POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
    origin:
        process.env.NODE_ENV === 'production'
            ? [
                'https://eligo-six.vercel.app',
                /https:\/\/eligo(-.+)?-ngalaiko.vercel.app/,
                'https://eligo.galaiko.rocks',
                'https://eligo.rocks'
            ]
            : [
                'https://127.0.0.1:5173',
                'https://127.0.0.1:4173',
                'https://localhost:5173',
                'https://localhost:4173'
            ]
} as CorsOptions;
