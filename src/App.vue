<template>
    <v-app :theme="configStore.state.darkMode ? 'dark' : 'light'">
        <v-main>
            <Navbar
                :darkMode="configStore.state.darkMode"
                @toggleDarkMode="configStore.commit('toggleDarkMode')"
            />
            <!-- NOTE: Suspense needed for async Single Page Components -->
            <Suspense>
                <router-view />
            </Suspense>
            <Footer />
        </v-main>
    </v-app>
</template>

<style lang="scss">
@use '@/styles.scss';
</style>

<script setup lang="ts">
import Navbar from '@/components/NavbarComponent.vue';
import Footer from '@/components/FooterComponent.vue';
import { useConfigStore } from '@/stores/configStore';

const configStore = useConfigStore();
</script>
