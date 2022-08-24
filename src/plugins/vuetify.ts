// Styles
// import '@mdi/font/css/materialdesignicons.css'
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

const vuetify = createVuetify({
    theme: {
        defaultTheme: "dark",
    },
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
            mdi,
        },
    },
});

export default vuetify;
