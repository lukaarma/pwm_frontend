<template>
    <v-toolbar>
        <v-btn to="/">
            <v-img src="/assets/logo.svg" />
        </v-btn>

        <v-spacer />

        <v-toolbar-items class="hidden-sm-and-down">
            <v-btn size="x-large" @click="$emit('toggleDarkMode')">
                <v-icon
                    class="toggleDarkMode"
                    :class="{ rotate: !darkMode }"
                    :icon="darkMode ? mdiWeatherNight : mdiBrightness6"
                />
                <v-tooltip
                    activator="parent"
                    location="bottom"
                    class="white-text"
                >
                    Switch to
                    {{ darkMode ? 'ligth' : 'dark' }}
                    mode
                </v-tooltip>
            </v-btn>

            <v-divider></v-divider>
            <v-btn to="/login"> Login </v-btn>

            <v-divider></v-divider>
            <v-btn to="/signup"> Signup </v-btn>
        </v-toolbar-items>
    </v-toolbar>
</template>

<script setup lang="ts">
import { mdiBrightness6, mdiWeatherNight } from '@mdi/js';

defineProps<{ darkMode: boolean }>();
defineEmits<{ (e: 'toggleDarkMode'): void }>();
</script>

<style scoped>
.toggleDarkMode {
    transition: transform 0.3s ease-in-out !important;
}

.toggleDarkMode.rotate {
    transform: rotate(180deg);
}
</style>
