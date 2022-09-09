<template>
    <v-card>
        <v-tabs v-model="tab" background-color="primary" text-center>
            <v-tab value="Vault"> Vault </v-tab>
            <v-tab value="Tools"> Tools </v-tab>
            <v-tab value="Export"> Export </v-tab>
            <v-tab value="Import"> Import </v-tab>
        </v-tabs>

        <v-card-text>
            <v-window v-model="tab">
                <v-window-item value="Vault">
                    <Vault />
                </v-window-item>

                <v-window-item value="Tools"> </v-window-item>

                <v-window-item value="Export"> </v-window-item>

                <v-window-item value="Import"> </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Vault from '@/components/VaultComponent.vue';
import { getVault } from '@/services/vault';

const tab = ref('');

getVault().catch((err) => {
    console.error(err);
});
</script>
