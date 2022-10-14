<template>
    <v-form ref="form" @submit.prevent="doSubmit" class="centerForm my-8">
        <h1 class="text-center mb-4 font-weight-light">Change password</h1>

        <div class="toastContainer">
            <Toast
                class="formToast"
                :type="toastControls.type"
                :show="toastControls.show"
                :msg="toastControls.msg"
                @close="toastControls.show = false"
            />
        </div>

        <v-text-field
            v-model="password.old"
            label="Old Password"
            color="primary"
            :type="hidePassword.old ? 'password' : 'text'"
            :rules="passwordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword.old ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword.old = !hidePassword.old"
            required
        />

        <v-text-field
            v-model="password.new"
            label="New Password"
            color="primary"
            :type="hidePassword.new ? 'password' : 'text'"
            :rules="passwordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword.new ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword.new = !hidePassword.new"
            required
        />

        <v-text-field
            v-model="password.repeatNew"
            label="Repeat New Password"
            color="primary"
            :type="hidePassword.new ? 'password' : 'text'"
            :rules="repeatPasswordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword.new ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword.new = !hidePassword.new"
            required
        />

        <div class="text-right mb-4">
            <v-btn @click="clear" size="large" color="secondary"> Cancel </v-btn>

            <v-btn type="submit" :loading="loading" size="large" color="primary" class="ml-4">
                Save
            </v-btn>
        </div>
    </v-form>
</template>

<script setup lang="ts">
import { mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import Toast, { type ToastControls } from '@/components/overlays/ToastComponent.vue';
import changePassword from '@/services/changePassword';

// DOM
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);
const loading = ref(false);
const hidePassword = ref({
    old: true,
    new: true,
});
const password = ref({
    old: '',
    new: '',
    repeatNew: '',
});
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

// rules
const passwordRules = [
    (psw: string) => !!psw || 'Password is required',
    (psw: string) =>
        (psw.length >= 8 && psw.length <= 32) || 'Password must be between 8 and 32 characters',
    (psw: string) => /([A-Z])/.test(psw) || 'Password must contain an uppercase letter!',
    (psw: string) => /([a-z])/.test(psw) || 'Password must contain an lowercase letter!',
    (psw: string) => /([0-9])/.test(psw) || 'Password must contain a number!',
    (psw: string) => /([@$!%*?&])/.test(psw) || 'Password must contain a special character!',
];

const repeatPasswordRules = [
    (psw: string) => !!psw || 'Repeat Password is required',
    (psw: string) => psw === password.value.new || "The passwords don't match!",
];

async function doSubmit() {
    loading.value = true;
    clearTimeout(toastControls.value.timeout);

    if ((await form.value?.validate())?.valid) {
        const res = await changePassword(password.value.old, password.value.new);

        if (res.ok) {
            console.debug('[ChangePassword] success!');
            toastControls.value.type = 'success';
            toastControls.value.msg = 'Password Changed';
            toastControls.value.show = true;
            form.value?.reset();

            toastControls.value.timeout = setTimeout(() => {
                toastControls.value.show = false;
            }, toastControls.value.timeoutLength);
        } else {
            console.debug(`[ChangePassword] failed: [${res.err.code}] ${res.err.message}`);
            toastControls.value.type = 'error';
            toastControls.value.msg = res.err.message;
            toastControls.value.show = true;
        }
    }

    loading.value = false;
}

async function clear() {
    toastControls.value.show = false;
    form.value?.reset();
}
</script>
