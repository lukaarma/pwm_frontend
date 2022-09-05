<template>
    <v-menu bottom class="mx-4">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="navbarIcon">
                <!-- <v-avatar size="small" :icon="mdiAccountCircle" /> -->
                <v-avatar color="primary">
                    <span class="white--text text-h6"> {{ userStore.state.userInitials }} </span>
                </v-avatar>
            </v-btn>
        </template>
        <v-card>
            <v-card-text class="mx-auto text-center">
                <v-avatar color="primary">
                    <span class="white--text text-h6"> {{ userStore.state.userInitials }} </span>
                </v-avatar>
                <h2 class="mt-2">{{ userStore.state.firstName }} {{ userStore.state.lastName }}</h2>
                <p class="text-caption mt-2">{{ userStore.state.email }}</p>
                <v-btn to="/profile" variant="text" block class="mt-2 py-2"> Edit profile </v-btn>
                <v-btn @click="logout" variant="outlined" block color="error" class="mt-2 py-2">
                    Logout
                </v-btn>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

function logout() {
    userStore.commit('logout');
    router.push('/login');
}
</script>
