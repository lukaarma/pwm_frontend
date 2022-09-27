<template>
    <v-form ref="form" @submit.prevent="login" class="centerForm mt-8 px-8">
        <LogoExtended class="formLogo mb-8" />

        <div class="toastContainer">
            <Toast
                class="formError"
                type="error"
                :show="showToast"
                :msg="toastMsg"
                @close="showToast = false"
            />
        </div>

        <h1 class="text-center mb-4 font-weight-light">LOGIN</h1>

        <v-text-field
            v-model="user.email"
            :rules="emailRules"
            :prepend-inner-icon="mdiAccountBox"
            label="Email"
            color="primary"
            required
        />

        <v-text-field
            v-model="user.password"
            :rules="passwordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
            :type="hidePassword ? 'password' : 'text'"
            label="Password"
            color="primary"
            required
            @click:appendInner="hidePassword = !hidePassword"
        />

        <div class="text-right mb-4">
            <v-btn @click="resetForm" class="mr-4" size="large" color="secondary"> Clear </v-btn>
            <v-btn type="submit" :loading="loading" size="large" color="primary"> Login </v-btn>
        </div>
    </v-form>
</template>

<style lang="scss">
@import '@/styles.scss';
</style>

<script setup lang="ts">
import { mdiAccountBox, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import LogoExtended from '@/components/LogoExtended.vue';
import Toast from '@/components/ToastComponent.vue';
import router from '@/router';
import doLogin from '@/services/login';

const loading = ref(false);
const showToast = ref(false);
const toastMsg = ref('');
const hidePassword = ref(true);
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];
const passwordRules = [(psw: string) => !!psw || 'Password is required'];

// INPUTS VALUE REF
const user = ref({
    email: '',
    password: '',
});

async function login() {
    loading.value = true;

    if ((await form.value?.validate())?.valid) {
        const res = await doLogin(user.value.email, user.value.password);
        if (res.ok) {
            showToast.value = false;

            router.push('/vault');
        } else {
            console.debug(`[LoginView] Login failed:  [${res.err.code}] ${res.err.message}`);

            toastMsg.value = res.err.message;
            showToast.value = true;
        }
    }

    loading.value = false;
}

function resetForm() {
    form.value?.reset();
    showToast.value = false;
    loading.value = false;
}
</script>
