const config = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            inherit: 'inherit',

            'background-hard': 'var(--background-hard)',
            background: 'var(--background)',
            'background-soft': 'var(--background-soft)',
            'background-1': 'var(--background-1)',
            'background-2': 'var(--background-2)',
            'background-3': 'var(--background-3)',
            'background-4': 'var(--background-4)',

            foreground: 'var(--foreground)',
            'foreground-1': 'var(--foreground-1)',
            'foreground-2': 'var(--foreground-2)',
            'foreground-3': 'var(--foreground-3)',
            'foreground-4': 'var(--foreground-4)',

            red: 'var(--red)',
            green: 'var(--green)',
            yellow: 'var(--yellow)',
            blue: 'var(--blue)',
            purple: 'var(--purple)',
            aqua: 'var(--aqua)',
            orange: 'var(--orange)',
            gray: 'var(--gray)',

            'red-dim': 'var(--red-dim)',
            'green-dim': 'var(--green-dim)',
            'yellow-dim': 'var(--yallow-dim)',
            'blue-dim': 'var(--blue-dim)',
            'purple-dim': 'var(--purple-dim)',
            'aqua-dim': 'var(--aqua-dim)',
            'orange-dim': 'var(--orange-dim)',
            'gray-dim': 'var(--gray-dim)'
        }
    }
};

module.exports = config;
