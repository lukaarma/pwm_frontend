// Styles
import 'vuetify/styles';

// Vuetify
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

const vuetify = createVuetify({
    display: {
        mobileBreakpoint: 'sm',
        thresholds: {
            sm: 768
        }
    },
    theme: {
        defaultTheme: 'dark',
        themes: {
            light: {
                colors: {
                    primary: '#9c27b0',
                    secondary: '#FFFFFF',
                },
            },
            dark: {
                dark: true,
                colors: {
                    primary: '#9c27b0',
                    secondary: '#333333',
                },
            },
        },
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
});

export default vuetify;
