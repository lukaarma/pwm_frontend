<template>
    <v-form ref="form" @submit.prevent="signup" class="centerForm mt-8 px-8">
        <LogoExtended class="formLogo mb-8" />

        <div class="formErrorContainer">
            <Toast
                class="formError"
                type="error"
                :show="showToast"
                :msg="toastMsg"
                @close="showToast = false"
            />
        </div>

        <h1 class="text-center mb-4 font-weight-light">SIGNUP</h1>

        <v-text-field
            v-model="user.email"
            label="Email"
            :rules="emailRules"
            :prepend-inner-icon="mdiEmail"
            required
        />

        <v-text-field
            transition="scale-transition"
            v-model="user.password"
            label="Password"
            :type="hidePassword ? 'password' : 'text'"
            :rules="passwordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword = !hidePassword"
            required
        />

        <v-text-field
            v-model="user.repeatPassword"
            label="Repeat Password"
            :type="hidePassword ? 'password' : 'text'"
            :rules="repeatPasswordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword = !hidePassword"
            required
        />

        <v-text-field
            v-model="user.firstName"
            label="First Name"
            type="text"
            :rules="firstNameRules"
            :prepend-inner-icon="mdiAccountBox"
            required
        />

        <v-text-field
            v-model="user.lastName"
            label="Last Name"
            type="text"
            :rules="lastNameRules"
            :prepend-inner-icon="mdiAccountBox"
            required
        />

        <div class="text-right mb-4">
            <v-btn @click="resetForm" class="mr-4" size="large"> Clear </v-btn>
            <v-btn type="submit" :loading="loading" size="large" color="purple"> Signup </v-btn>
        </div>

        <div class="text-center mb-4">
            <v-btn @click="goVerification()" size="small" text>
                Verification email not received? Click here!
            </v-btn>
        </div>
    </v-form>
</template>

<style lang="scss">
@import '@/styles.scss';
</style>

<script setup lang="ts">
import { mdiEmail, mdiLock, mdiEye, mdiEyeOff, mdiAccountBox } from '@mdi/js';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type vuetify from 'vuetify/components';

import Toast from '@/components/ToastComponent.vue';
import LogoExtended from '@/components/LogoExtended.vue';
import doSignup from '@/services/signup';

const user = ref({
    email: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
});

const loading = ref(false);
const hidePassword = ref(true);
const showToast = ref(false);
const toastMsg = ref('');

const router = useRouter();
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);
const nameRegex = /^[\p{L}][ \p{L}'-]*[\p{L}]$/u;

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email.trim()) || 'E-mail must be valid',
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

const firstNameRules = [
    (firstName: string) => !!firstName || 'First name is required',
    (firstName: string) =>
        !!nameRegex.test(firstName.trim()) || 'First name contain an invalid character!',
];

const lastNameRules = [
    (lastName: string) => !!lastName || 'Name is required',
    (lastName: string) =>
        !!nameRegex.test(lastName.trim()) || 'Last name contain an invalid character!',
];

async function resetForm() {
    form.value?.reset();
}

async function signup(): Promise<void> {
    showToast.value = false;
    loading.value = true;
    console.debug('[SignupView] Signup start');

    if ((await form.value?.validate())?.valid) {
        const res = await doSignup(user.value);

        if (res.ok) {
            console.debug('[SignupView] Signup done, redirecting...');
            goVerification(true);
        } else {
            console.debug(`[SignupView] Signup failed:  [${res.err.code}] ${res.err.message}`);
            showToast.value = true;
            toastMsg.value = res.err.message;
            loading.value = false;
        }
    }

    loading.value = false;
}

function goVerification(sent = false) {
    console.log(sent);
    if (user.value.email) {
        router.push({
            name: 'SendVerification',
            query: { email: user.value.email, emailSent: sent ? '1' : undefined },
        });
    } else {
        router.push({ name: 'SendVerification' });
    }
}
</script>
