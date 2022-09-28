<template>
    <v-card elevation="4" class="cardBackground">
        <v-card-title class="text-center text-h4 mt-2 mb-4 font-weight-light">
            Export Vault
        </v-card-title>

        <v-card-text class="text-center">
            <p>Use this tool to backup your credential or export to other services</p>
        </v-card-text>

        <v-form ref="exportForm" @submit.prevent="exportVault(false)" fluid class="centerForm mb-4">
            <div class="toastContainer">
                <Toast
                    class="formToast"
                    type="info"
                    :show="toastControls.show"
                    :msg="toastControls.msg"
                    @close="toastControls.show = false"
                />
            </div>

            <v-select :items="formats" v-model="selectedFormat" label="Select a format"></v-select>

            <v-text-field
                v-if="encrypted"
                v-model="password"
                label="Password"
                color="primary"
                :type="hidePassword ? 'password' : 'text'"
                :rules="passwordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                @click:appendInner="hidePassword = !hidePassword"
                required
            />

            <v-text-field
                v-if="encrypted"
                v-model="repeatPassword"
                label="Repeat Password"
                color="primary"
                :type="hidePassword ? 'password' : 'text'"
                :rules="repeatPasswordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                @click:appendInner="hidePassword = !hidePassword"
                required
            />

            <div class="text-right mb-4">
                <v-btn @click="clear" class="mr-4" size="large"> Clear </v-btn>
                <v-btn @click="exportVault(false)" :loading="loading" size="large" color="primary">
                    Export
                </v-btn>
            </div>

            <a ref="download" class="d-none"></a>

            <ConfirmationDialog
                :show="showConfirmationDialog"
                msg="Are you sure you want to export your credential unencrypted?This operation is unsafe, especially for backup purposes"
                title="Export unencrypted vault"
                @no="abortExport()"
                @yes="exportVault(true)"
            />
        </v-form>
    </v-card>
</template>

<style lang="scss">
@use '@/styles.scss';
</style>

<script setup lang="ts">
import { mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';
import { ref, computed } from 'vue';
import type vuetify from 'vuetify/components';

import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import Toast, { type ToastControls } from '@/components/ToastComponent.vue';
import { exportJSON } from '@/services/exportVault';

// DOM content
const formats = ['JSON (Encrypted)', 'JSON'];
const selectedFormat = ref(formats[0]);
const showConfirmationDialog = ref(false);
const password = ref('');
const repeatPassword = ref('');
const hidePassword = ref(true);
const encrypted = computed(() => selectedFormat.value === formats[0]);

const download = ref<HTMLAnchorElement | null>(null);
const exportForm = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const passwordRules = [
    (password: string) => !!password || 'Password is required',
    (password: string) =>
        (password.length >= 8 && password.length <= 32) ||
        'Password must be between 8 and 32 characters',
    (password: string) => /([A-Z])/.test(password) || 'Password must contain an uppercase letter!',
    (password: string) => /([a-z])/.test(password) || 'Password must contain an lowercase letter!',
    (password: string) => /([0-9])/.test(password) || 'Password must contain a number!',
    (password: string) =>
        /([@$!%*?&])/.test(password) || 'Password must contain a special character!',
];

const repeatPasswordRules = [
    (repeatPassword: string) => !!repeatPassword || 'Repeat Password is required',
    (repeatPassword: string) => repeatPassword === password.value || "The passwords don't match!",
];

// toast controls
const loading = ref(false);
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
});

const timeoutLength = 2000;
let timeout: number;

async function exportVault(override = false) {
    loading.value = true;

    if (!download.value) {
        console.error("Missing link reference! Can't download files!");

        return;
    }

    if (!encrypted.value && !override) {
        showConfirmationDialog.value = true;
        loading.value = false;

        return;
    }

    showConfirmationDialog.value = false;
    clearTimeout(timeout);

    if (override || (await exportForm.value?.validate())?.valid) {
        console.debug(`[EXPORT] exporting ${encrypted.value ? 'encrypted' : ''} vault`);
        const data = JSON.stringify(await exportJSON(encrypted.value, password.value));

        // NOTE: edit values manually because ref are slow and when we "click" the link it isn't
        download.value.download = encrypted.value ? 'PWM_Encrypted_Vault.json' : 'PWM_Vault.json';
        download.value.href = `data:application/json;charset=utf-8,${data}`;
        download.value.click();

        toastControls.value.msg = 'File created! Download should start any moment...';
        toastControls.value.show = true;

        timeout = setTimeout(() => {
            toastControls.value.show = false;
            if (download.value) {
                download.value.href = '';
            }
        }, timeoutLength);
    }

    loading.value = false;
}

function abortExport() {
    showConfirmationDialog.value = false;
    loading.value = false;
}

// FIXME: on clear remove file but don't clear validation errors
function clear() {
    selectedFormat.value = formats[0];
}
</script>
