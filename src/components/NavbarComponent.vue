<template>
    <v-app-bar app floating elevation="1" height="60">
        <v-app-bar-nav-icon class="ml-5">
            <router-link to="/">
                <v-img src="/assets/logo.svg" height="45px" width="45px" />
            </router-link>
        </v-app-bar-nav-icon>

        <v-spacer />

        <template v-if="userStore.state.firstName">
            <span> {{ userStore.state.firstName || 'empty' }} </span>
            <v-spacer />
        </template>

        <v-toolbar-items>
            <v-divider vertical></v-divider>
            <v-btn size="x-large" @click="$emit('toggleDarkMode')">
                <v-icon
                    class="toggleDarkMode"
                    :class="{ rotate: !darkMode }"
                    :icon="darkMode ? mdiWeatherNight : mdiBrightness6"
                />
                <v-tooltip activator="parent" location="bottom" class="white-text">
                    Switch to
                    {{ darkMode ? 'light' : 'dark' }}
                    mode
                </v-tooltip>
            </v-btn>

            <v-divider vertical />
            <template v-if="userStore.state.firstName">
                <v-btn to="/vault" :elevation="$route.path === '/vault' ? '10' : '0'">
                    Vault
                </v-btn>
                <v-divider vertical />
                <v-btn @click="logout"> Logout </v-btn>
            </template>
            <template v-else>
                <v-btn to="/login" :elevation="$route.path === '/login' ? '10' : '0'">
                    Login
                </v-btn>
                <v-divider vertical />
                <v-btn to="/signup" :elevation="$route.path === '/signup' ? '10' : '0'">
                    Signup
                </v-btn>
            </template>
        </v-toolbar-items>
    </v-app-bar>
</template>

<style scoped>
.toggleDarkMode {
    transition: transform 0.3s ease-in-out !important;
}

.toggleDarkMode.rotate {
    transform: rotate(180deg);
}
</style>

<script setup lang="ts">
import { mdiBrightness6, mdiWeatherNight } from '@mdi/js';

import router from '@/router';
import { userStore } from '@/stores/userStore';

defineProps<{ darkMode: boolean }>();
defineEmits<{ (e: 'toggleDarkMode'): void }>();

function logout() {
    userStore.commit('logout');
    router.push('/login');
}
</script>
