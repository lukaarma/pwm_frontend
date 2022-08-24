<template>
    <v-form ref="form" v-model="valid" class="w-35 mx-auto mt-8">
        <v-container>
            <v-img src="/assets/logoExtended.svg" class="mx-auto mb-8" />
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
                <v-btn @click="resetForm" class="mr-4" size="large">
                    Clear
                </v-btn>
                <v-btn @click="doSignUp" size="large" color="purple">
                    Signup
                </v-btn>
                <v-btn
                    size="large"
                    class="ml-4"
                    color="purple"
                    @click="showPostSignupDialog = true"
                >
                    Open Dialog
                </v-btn>
            </div>
        </v-container>
    </v-form>

    <PostSignupDialog
        :msg="postSignupMessage"
        :show="showPostSignupDialog"
        @close="showPostSignupDialog = false"
        @resendEmail="resendConfirmationEmail"
    />
    <ErrorDialog
        msg="Error on Signup"
        :show="showSignupErrorDialog"
        @close="showSignupErrorDialog = false"
    />
</template>

<style scoped>
.w-35 {
    width: 35%;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import API from '@/services/API';
import PostSignupDialog from '@/components/PostSignupDialog.vue';
import ErrorDialog from '@/components/ErrorDialog.vue';

import { mdiAccountBox, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';

// INPUTS VALUE REF
const user = ref({
    email: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
});

const valid = ref(false);
const hidePassword = ref(true);
const showPostSignupDialog = ref(false);
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];

const passwordRules = [
    (psw: string) => !!psw || 'Password is required',
    (psw: string) =>
        (psw.length >= 8 && psw.length <= 32) ||
        'Password must be between 8 and 32 characters',
    (psw: string) =>
        /([A-Z])/.test(psw) || 'Password must contain an uppercase letter!',
    (psw: string) =>
        /([a-z])/.test(psw) || 'Password must contain an lowercase letter!',
    (psw: string) => /([0-9])/.test(psw) || 'Password must cointain a number!',
    (psw: string) =>
        /([@$!%*?&])/.test(psw) ||
        'Password must cointain a special character!',
];

const repeatPasswordRules = [
    (psw: string) => !!psw || 'Repeat Password is required',
    (psw: string) =>
        psw === user.value.password || "The passwords don't match!",
];

const nameRules = [(name: string) => !!name || 'Name is required'];

// DOM CONTROLL
const signupDone = ref(false);
const showSignupErrorDialog = ref(false);
const postSignupMessage = ref('Test message');

async function resetForm() {
    form.value?.reset();
}

async function doSignUp(): Promise<void> {
    if ((await form.value?.validate())?.valid) {
        await API.signup(user.value).then((res) => {
            postSignupMessage.value = res.data.message ?? 'test';
            signupDone.value = true;
        });
    } else {
        showSignupErrorDialog.value = true;
    }
}

function resendConfirmationEmail() {
    alert('TODO :)');
}
</script>
