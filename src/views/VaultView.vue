<template>
    <v-card elevation="0">
        <v-tabs v-model="tab" background-color="primary" centered>
            <v-tab value="Vault"> Vault </v-tab>
            <v-tab value="Tools"> Tools </v-tab>
            <v-tab value="Export"> Export </v-tab>
            <v-tab value="Import"> Import </v-tab>
        </v-tabs>

        <v-card-text class="tabs">
            <v-window v-model="tab" disabled>
                <v-window-item value="Vault">
                    <Vault />
                </v-window-item>

                <v-window-item class="windows" value="Tools">
                    <PasswordChecker class="mt-1 mb-4 mx-1" />
                </v-window-item>

                <v-window-item class="windows" value="Export"> </v-window-item>

                <v-window-item value="Import"> </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<style lang="scss">
.tabs {
    background-color: rgb(var(--v-theme-background));
}

.windows {
    background-color: inherit;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import Vault from '@/components/VaultComponent.vue';
import PasswordChecker from '@/components/PasswordCheckerComponent.vue';
import { getVault } from '@/services/vault';

const tab = ref('');

getVault().catch((err) => {
    console.error(err);
});
</script>
