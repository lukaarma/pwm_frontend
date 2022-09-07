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
                    <VaultComponent />
                </v-window-item>

                <v-window-item value="Tools">

                </v-window-item>

                <v-window-item value="Export">
                </v-window-item>

                <v-window-item value="Import">
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VaultComponent from '@/components/VaultComponent.vue';

const tab = ref("Vault");
</script>
