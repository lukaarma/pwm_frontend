<template>
    <v-container>
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

        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="credentialsFilter"
                    label="Search credentials"
                    :prepend-inner-icon="mdiMagnify"
                    single-line
                    hide-details
                    clearable
                />
            </v-col>
        </v-row>

        <v-row v-show="credentials.length === 0" class="mt-8">
            <v-col>
                <h2 class="text-center font-weight-light">
                    {{
                        credentialsFilter
                            ? 'No credential found that match the filter'
                            : 'Vault is empty'
                    }}
                </h2>
            </v-col>
        </v-row>

        <v-row v-for="index of credentials" :key="index">
            <v-col cols="12">
                <Credential :index="index" @openDialog="openDialog(index)" />
            </v-col>
        </v-row>
    </v-container>

    <CredentialDialog :show="showDialog" :index="showIndex" @close="closeDialog" />
</template>

<style lang="scss">
@use '@/styles.scss';
</style>

<script setup lang="ts">
import { mdiPlus, mdiMagnify } from '@mdi/js';
import { computed, ref } from 'vue';

import Credential from '@/components/CredentialComponent.vue';
import CredentialDialog from '@/components/CredentialDialog.vue';
import { useVaultStore } from '@/stores/vaultStore';

const vaultStore = useVaultStore();

const credentialsFilter = ref('');
const credentials = computed<Array<number>>(() =>
    vaultStore.getters.getCredentials(credentialsFilter.value)
);

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
