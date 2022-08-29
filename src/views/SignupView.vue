<template>
    <v-form ref="form" @submit.prevent="signup" class="w-35 mx-auto mt-8">
        <v-container>
            <v-img src="/assets/logoExtended.svg" class="mx-auto mb-8" />

            <ErrorAlert class="mb-5" :show="signupFailed" :msg="signupFailedMsg" />
            <v-text-field
                v-model="user.email"
                label="Email"
                :rules="emailRules"
                :prepend-inner-icon="mdiAccountBox"
                required
            ></v-text-field>

            <v-text-field
                v-model="user.password"
                label="Password"
                :type="hidePassword ? 'password' : 'text'"
                :rules="passwordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                @click:appendInner="hidePassword = !hidePassword"
                required
            ></v-text-field>

            <v-text-field
                v-model="user.repeatPassword"
                label="Repeat Password"
                :type="hidePassword ? 'password' : 'text'"
                :rules="repeatPasswordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                @click:appendInner="hidePassword = !hidePassword"
                required
            ></v-text-field>

            <v-text-field
                v-model="user.firstName"
                label="First Name"
                type="text"
                :rules="nameRules"
                :prepend-inner-icon="mdiAccountBox"
                required
            ></v-text-field>

            <v-text-field
                v-model="user.lastName"
                label="Last Name"
                type="text"
                :rules="nameRules"
                :prepend-inner-icon="mdiAccountBox"
                required
            ></v-text-field>
            <div class="text-right">
                <v-btn @click="resetForm" class="mr-4" size="large"> Clear </v-btn>
                <v-btn type="submit" :loading="loading" size="large" color="purple"> Signup </v-btn>
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
import { mdiAccountBox, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import ErrorAlert from '@/components/ErrorAlert.vue';
import doSignup from '@/services/signup';

// INPUTS VALUE REF
const user = ref({
    email: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
});

const loading = ref(false);
const hidePassword = ref(true);
const signupFailed = ref(false);
const signupFailedMsg = ref('');
const signupDone = ref(false);
const postSignupMessage = ref('');

const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];

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
    (psw: string) => psw === user.value.password || "The passwords don't match!",
];

const nameRules = [(name: string) => !!name || 'Name is required'];

async function resetForm() {
    form.value?.reset();
}

async function signup(): Promise<void> {
    signupFailed.value = false;
    loading.value = true;
    console.log('Inizio signup');

    if ((await form.value?.validate())?.valid) {
        const res = await doSignup(user.value);

        if (res.ok) {
            signupDone.value = true;
            // NOTE: api always returns message on success
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            postSignupMessage.value = res.data!.message;
        } else {
            console.debug(`[SignupView] Signup failed:  [${res.err.code}] ${res.err.message}`);
            signupFailed.value = true;
            signupFailedMsg.value = res.err.message;
            loading.value = false;
        }
    }

    loading.value = false;
}
</script>
