<template>
    <v-app :theme="configStore.state.darkMode ? 'dark' : 'light'">
        <v-main>
            <AppNavbar
                :darkMode="configStore.state.darkMode"
                @toggleDarkMode="configStore.commit('toggleDarkMode')"
            />
            <!-- NOTE: Suspense needed for async Single Page Components -->
            <Suspense>
                <router-view />
            </Suspense>
            <AppFooter />
        </v-main>
    </v-app>
</template>

<style lang="scss">
@use '@/styles.scss';
</style>

<script setup lang="ts">
import AppNavbar from '@/components/navigation/NavbarComponent.vue';
import AppFooter from '@/components/navigation/FooterComponent.vue';
import { useConfigStore } from '@/stores/configStore';

const configStore = useConfigStore();
</script>
