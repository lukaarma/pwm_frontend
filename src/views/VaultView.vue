<template>
    <v-card elevation="0">
        <v-tabs v-model="tab" centered background-color="primary">
            <v-tab value="Vault"> Vault </v-tab>
            <v-tab value="Tools"> Tools </v-tab>
            <v-tab value="Import"> Import </v-tab>
            <v-tab value="Export"> Export </v-tab>
        </v-tabs>

        <v-card-text class="tabs">
            <v-window v-model="tab" disabled>
                <v-window-item class="windows" value="Vault">
                    <Vault />
                </v-window-item>

                <v-window-item class="windows" value="Tools">
                    <PasswordChecker class="mt-1 mb-4 mx-1" />
                    <PasswordGenerator class="mb-1 mx-1"/>
                </v-window-item>

                <v-window-item class="windows" value="Import">
                    <ImportComponent class="mb-4 mx-1" />
                </v-window-item>

                <v-window-item class="windows" value="Export">
                    <ExportComponent class="mb-4 mx-1" />
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<style scoped lang="scss">
.tabs {
    background-color: rgb(var(--v-theme-background));
}

.windows {
    background-color: inherit;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';

import ExportComponent from '@/components/ExportComponent.vue';
import ImportComponent from '@/components/ImportComponent.vue';
import PasswordChecker from '@/components/PasswordCheckerComponent.vue';
import PasswordGenerator from '@/components/PasswordGeneratorComponent.vue';
import Vault from '@/components/VaultComponent.vue';
import { getVault } from '@/services/vault';

const tab = ref('');

getVault().catch((err) => {
    console.error(err);
});
</script>
