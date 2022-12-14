<template>
    <v-card elevation="4">
        <v-card-title class="text-center text-h4 mt-2 mb-4 font-weight-light">
            Import Vault
        </v-card-title>
        <v-card-text class="text-center">
            <p>Use this tool to import your credential from other services</p>
        </v-card-text>

        <v-form ref="importForm" @submit.prevent="importFile" fluid class="centerForm mb-4">
            <div class="toastContainer">
                <Toast
                    class="formToast"
                    :type="toastControls.type"
                    :show="toastControls.show"
                    :msg="toastControls.msg"
                    @close="toastControls.show = false"
                />
            </div>

            <v-select
                :items="availableProviders"
                v-model="selectedProvider"
                label="Select a provider"
            />

            <v-file-input
                v-model="inputFiles"
                :rules="inputFilesRules"
                show-size
                :accept="acceptedMIME"
                :label="`Upload file (JSON)`"
                placeholder="Select a file"
            />

            <v-text-field
                v-if="encrypted"
                v-model="password"
                :rules="passwordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                :type="hidePassword ? 'password' : 'text'"
                label="Password"
                color="primary"
                required
                @click:appendInner="hidePassword = !hidePassword"
            />

            <div class="text-right">
                <v-btn @click="clear" class="mr-4" size="large"> Clear </v-btn>
                <v-btn type="submit" :loading="loading" size="large" color="primary">
                    Import
                </v-btn>
            </div>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';
import { computed, ref, watch } from 'vue';
import type vuetify from 'vuetify/components';

import Toast, { type ToastControls } from '@/components/overlays/ToastComponent.vue';
import { importVault } from '@/services/importVault';
import { PROVIDERS } from '@/types';

// internal logic
const importForm = ref<InstanceType<typeof vuetify.VForm> | null>(null);

// DOM content
const availableProviders = [PROVIDERS.PWM_ENCRYPTED, PROVIDERS.PWM, PROVIDERS.BITWARDEN];
const selectedProvider = ref(PROVIDERS.PWM_ENCRYPTED);
const inputFiles = ref<File[]>([]);
const acceptedMIME = 'application/json';

const encrypted = computed(() => selectedProvider.value === PROVIDERS.PWM_ENCRYPTED);
const password = ref('');
const passwordRules = [(psw: string) => !!psw || 'Password is required'];
const hidePassword = ref(true);

// toast controls
const loading = ref(false);
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

// rules
const inputFilesRules = [
    (inputFiles: File[]) => !!inputFiles[0] || 'Please select a file',
    (inputFiles: File[]) =>
        inputFiles[0].name.toLowerCase().endsWith('.json') || 'File must be JSON formatted',
];

watch(selectedProvider, () => {
    password.value = '';
});

async function importFile() {
    loading.value = true;
    toastControls.value.show = false;
    clearTimeout(toastControls.value.timeout);

    if ((await importForm.value?.validate())?.valid) {
        console.debug('[IMPORT] Starting import sequence...');

        const res = await importVault(selectedProvider.value, inputFiles.value[0], password.value);

        if (res.ok) {
            console.debug('[IMPORT] Save successful');
            toastControls.value.type = 'success';
            toastControls.value.msg =
                'Import successful, please check the vault tab to find your new credentials';
            toastControls.value.show = true;

            toastControls.value.timeout = setTimeout(
                () => (toastControls.value.show = false),
                toastControls.value.timeoutLength
            );
        } else {
            console.debug(`[CREDENTIAL] Save failed: [${res.err.code}] ${res.err.message}`);
            toastControls.value.type = 'error';
            toastControls.value.msg = res.err.message;
            toastControls.value.show = true;
        }
    }

    loading.value = false;
}

// FIXME: on clear remove file but don't clear validation errors
function clear() {
    inputFiles.value = [];
    selectedProvider.value = PROVIDERS.PWM;
    importForm.value?.resetValidation();
}
</script>
