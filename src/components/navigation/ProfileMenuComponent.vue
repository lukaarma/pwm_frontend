<template>
    <v-menu bottom class="mx-4">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="navbarIcon">
                <v-avatar color="primary">
                    <span class="white--text text-h6"> {{ userStore.state.userInitials }} </span>
                </v-avatar>
            </v-btn>
        </template>
        <v-card>
            <v-card-text class="profileMenu">
                <v-avatar color="primary">
                    <span class="white--text text-h6"> {{ userStore.state.userInitials }} </span>
                </v-avatar>
                <v-card-title>
                    <h3 ref="firstNameEl" class="text-truncate">
                        {{ userStore.state.firstName }}
                        {{ firstNameOverflow ? '' : userStore.state.lastName }}
                    </h3>
                    <h3 v-if="firstNameOverflow" class="text-truncate">
                        {{ userStore.state.lastName }}
                    </h3>
                </v-card-title>

                <p class="text-caption">{{ userStore.state.email }}</p>

                <v-btn to="/profile" variant="outlined" block class="mt-4 py-2"> Settings </v-btn>
                <v-btn @click="logout" block color="error" class="mt-2 py-2"> Logout </v-btn>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<style lang="scss">
.profileMenu {
    margin: 0 auto;
    text-align: center;
    max-width: 400px;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useUserStore } from '@/stores/userStore';
import { logout } from '@/services/utils';

const userStore = useUserStore();

const firstNameEl = ref<HTMLHeadingElement | null>(null);
const firstNameOverflow = computed(
    () => (firstNameEl.value?.scrollWidth ?? 0) > (firstNameEl.value?.clientWidth ?? 0)
);
</script>
