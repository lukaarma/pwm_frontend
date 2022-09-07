<template>
    <v-app :theme="darkMode ? 'dark' : 'light'">
        <v-main>
            <Navbar :darkMode="darkMode" @toggleDarkMode="darkMode = !darkMode" />
            <!-- NOTE: Suspense needed for async Single Page Components -->
            <Suspense>
                <router-view class="mb-4" />
            </Suspense>
            <Footer />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import Navbar from './components/NavbarComponent.vue';
import Footer from './components/FooterComponent.vue';

const darkModeKey = 'darkMode';
const darkMode = ref(true);

const config = JSON.parse(localStorage.getItem(darkModeKey) || 'null');
console.debug(`[CONFIG] Value read from localStorage: ${config}`);

if (config !== null && typeof config === 'boolean') {
    darkMode.value = config;
    console.debug(`[CONFIG] Loaded config: ${config}`);
} else {
    localStorage.setItem(darkModeKey, JSON.stringify(darkMode.value));
    console.debug(`[CONFIG] Default config: ${darkMode.value}`);
}

watch(darkMode, (newConfig) => {
    localStorage.setItem(darkModeKey, JSON.stringify(newConfig));
    console.debug(`[CONFIG] Saved config: ${newConfig}`);
});
</script>
