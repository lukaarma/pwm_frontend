<template>
    <v-footer class="pa-0" app absolute>
        <v-card-text class="text-center" width="100%">
            <span v-if="userStore.state.authHeader" class="mb-2">
                Logged as {{ userStore.state.firstName }} | Vault Version
                {{ vaultStore.state.version }} - Last Modified
                {{ new Date(vaultStore.state.lastModified).toLocaleString() }}
            </span><br><!--  FIXME: remove <br> from here -->
            <span>© {{ new Date().getFullYear() }} — <strong>PassWordManager</strong></span>
        </v-card-text>
    </v-footer>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useVaultStore } from '@/stores/vaultStore';

const vaultStore = useVaultStore();
const userStore = useUserStore();
</script>
