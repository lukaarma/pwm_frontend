<template>
    <v-container class="pt-4 vault" :class="{ 'pa-1': $vuetify.display.mobile }">
        <v-row>
            <v-col
                :cols="$vuetify.display.mobile ? 12 : 6"
                :offset="$vuetify.display.mobile ? 0 : 3"
                class="pt-0"
            >
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
            </v-col>
        </v-row>

        <v-row>
            <v-col>
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
            <v-col>
                <Credential
                    :index="index"
                    :rowHeight="rowHeight"
                    @click="openDialog(index)"
                    @openEditDialog="openDialog(index, true)"
                    @openSnackbar="openSnackbar"
                />
            </v-col>
        </v-row>
    </v-container>

    <CredentialDialog
        :show="showDialog"
        :edit="editDialog"
        :index="showIndex"
        @close="closeDialog"
    />

    <v-snackbar v-model="snackbar.show" color="primary" elevation="24">
        {{ snackbar.msg }}
    </v-snackbar>
</template>

<style scoped lang="scss">
.vault {
    max-width: 900px;
}
</style>

<script setup lang="ts">
import { mdiPlus, mdiMagnify } from '@mdi/js';
import { computed, ref } from 'vue';

import Credential from '@/components/CredentialComponent.vue';
import CredentialDialog from '@/components/CredentialDialog.vue';
import { useVaultStore } from '@/stores/vaultStore';

const vaultStore = useVaultStore();
const rowHeight = 124;

const credentialsFilter = ref('');
const credentials = computed<Array<number>>(() =>
    vaultStore.getters.getCredentials(credentialsFilter.value)
);

const showDialog = ref(false);
const editDialog = ref(false);
const showIndex = ref(-1);

const snackbar = ref<{
    show: boolean;
    msg: string;
    timeout: undefined | number;
    timeoutLength: number;
}>({
    show: false,
    msg: '',
    timeout: undefined,
    timeoutLength: 2000,
});

function openDialog(i: number, edit = false) {
    console.debug(`[VAULT] Opening dialog with index ${i}`);
    showIndex.value = i;
    editDialog.value = edit;
    showDialog.value = true;
}

function openSnackbar(msg: string) {
    clearTimeout(snackbar.value.timeout);

    snackbar.value.msg = msg;
    snackbar.value.show = true;

    snackbar.value.timeout = setTimeout(
        () => (snackbar.value.show = false),
        snackbar.value.timeoutLength
    );
}

function closeDialog() {
    showDialog.value = false;
}
</script>
