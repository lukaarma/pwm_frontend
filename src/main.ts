import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';

import { userStore, userStoreKey } from './stores/userStore';
import { vaultKey, vaultStore } from './stores/vaultStore';

loadFonts();

createApp(App)
    .use(router)
    .use(vuetify)
    .use(userStore, userStoreKey)
    .use(vaultStore, vaultKey)
    .mount('#app');
