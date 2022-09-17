<template>
    <v-container class="centerForm">
        <v-row>
            <v-col
                :cols="$vuetify.display.mobile ? 12 : 6"
                :offset="$vuetify.display.mobile ? 0 : 3"
                class="pt-0"
            >
                <v-card>
                    <v-btn
                        color="primary"
                        :prependIcon="mdiPlus"
                        size="x-large"
                        block
                        @click="openDialog(-1)"
                    >
                        Add credential
                        <v-tooltip
                            v-if="$vuetify.display.mdAndUp"
                            activator="parent"
                            location="left"
                            class="white-text"
                        >
                            Insert a new credential
                        </v-tooltip>
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-for="(_, key) of vaultStore.state.credentials" :key="key">
            <v-col cols="12">
                <Credential :index="key" @openDialog="openDialog(key)" />
            </v-col>
        </v-row>
    </v-container>

    <CredentialDialog :show="showDialog" :index="showIndex" @close="closeDialog" />
</template>

<style lang="scss">
@use '@/styles.scss';
</style>

<script setup lang="ts">
import { useVaultStore } from '@/stores/vaultStore';
import { ref } from 'vue';
import { mdiPlus } from '@mdi/js';

import Credential from '@/components/CredentialComponent.vue';
import CredentialDialog from '@/components/CredentialDialog.vue';

const vaultStore = useVaultStore();
const showDialog = ref(false);
const showIndex = ref(-1);

function openDialog(i: number) {
    console.debug(`[VAULT] Opening dialog with index ${showIndex.value}`);
    showIndex.value = i;
    showDialog.value = true;
}

function closeDialog() {
    showDialog.value = false;
}
</script>
