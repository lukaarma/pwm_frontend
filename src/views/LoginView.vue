<template>
    <v-form ref="form" @submit.prevent="login" class="w-35 mx-auto mt-5">
        <v-container>
            <v-img src="/assets/logoExtended.svg" class="mx-auto mb-8" />
            <ErrorAlert class="mb-5" :show="loginFailed" :msg="loginFailedMsg" />
            <v-text-field
                v-model="user.email"
                :rules="emailRules"
                :prepend-inner-icon="mdiAccountBox"
                label="Email"
                required
                @input="loginFailed = false"
            ></v-text-field>

            <v-text-field
                v-model="user.password"
                :rules="passwordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                :type="hidePassword ? 'password' : 'text'"
                label="Password"
                required
                @click:appendInner="hidePassword = !hidePassword"
                @input="loginFailed = false"
            ></v-text-field>
            <div class="text-right">
                <v-btn @click="resetForm" class="mr-4" size="large"> Clear </v-btn>
                <v-btn type="submit" :loading="loading" size="large" color="purple"> Login </v-btn>
            </div>
        </v-container>
    </v-form>
</template>

<style>
.w-35 {
    width: 35%;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import type vuetify from 'vuetify/components';
import { mdiAccountBox, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';

import ErrorAlert from '@/components/ErrorAlert.vue';
import router from '@/router';
import doLogin from '@/services/login';

const loading = ref(false);
const loginFailed = ref(false);
const loginFailedMsg = ref('');
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

    loginFailed.value = false;

    if ((await form.value?.validate())?.valid) {
        loading.value = true;
        const res = await doLogin(user.value.email, user.value.password);
        if (res.ok) {
            loading.value = false;
            router.push('/vault');

        } else {
            console.debug(`[LoginView] Login failed:  [${res.err.code}] ${res.err.message}`);
            loading.value = false;
            loginFailed.value = true;
            loginFailedMsg.value = res.err.message;
        }
    }
}

function resetForm() {
    form.value?.reset();
    loginFailed.value = false;
    loading.value = false;
}
</script>
