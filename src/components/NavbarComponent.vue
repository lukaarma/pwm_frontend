<template>
    <v-app-bar app floating elevation="1" height="60">
        <v-toolbar-items>
            <v-btn to="/">
                <!-- TODO: is there a way to auto width respecting aspect ratio? -->
                <v-img src="/assets/logo.svg" class="fillHeight" width="80" />
            </v-btn>
        </v-toolbar-items>

        <v-spacer />

        <v-toolbar-items>
            <v-divider vertical></v-divider>
            <v-btn @click="$emit('toggleDarkMode')" class="navbarIcon">
                <v-icon
                    class="toggleDarkMode"
                    :class="{ rotate: !darkMode }"
                    :icon="darkMode ? mdiWeatherNight : mdiBrightness6"
                    size="x-large"
                />
                <v-tooltip
                    v-if="$vuetify.display.mdAndUp"
                    activator="parent"
                    location="bottom"
                    class="white-text"
                >
                    Switch to
                    {{ darkMode ? 'light' : 'dark' }}
                    mode
                </v-tooltip>
            </v-btn>

            <v-divider vertical />

            <template v-if="userStore.state.authHeader">
                <v-btn class="navbarButton" to="/vault"> Vault </v-btn>
                <v-divider vertical />
                <ProfileMenu />
            </template>

            <v-btn-toggle
                v-else
                v-model="selectedButton"
                divided
                rounded="0"
                class="forceFullHeight"
            >
                <v-btn
                    class="navbarButton"
                    to="/login"
                    :elevation="$route.path === '/login' ? '10' : '0'"
                >
                    Login
                </v-btn>
                <v-divider vertical />
                <v-btn
                    class="navbarButton"
                    to="/signup"
                    :elevation="$route.path === '/signup' ? '10' : '0'"
                >
                    Signup
                </v-btn>
            </v-btn-toggle>
        </v-toolbar-items>
    </v-app-bar>
</template>

<style scoped lang="scss">
@use '@/styles.scss';
.toggleDarkMode {
    transition: transform 0.3s ease-in-out !important;
}

.toggleDarkMode.rotate {
    transform: rotate(180deg);
}

.fillHeight {
    height: 100%;
}
</style>

<script setup lang="ts">
import { mdiBrightness6, mdiWeatherNight } from '@mdi/js';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import ProfileMenu from '@/components/ProfileMenuComponent.vue';
import { userStore } from '@/stores/userStore';

defineProps<{ darkMode: boolean }>();
defineEmits<{ (e: 'toggleDarkMode'): void }>();

const route = useRoute();

const selectedButton = computed(() => {
    switch (route.path) {
        case '/login':
            return 0;
        case '/signup':
            return 1;
        default:
            return null;
    }
});
</script>
