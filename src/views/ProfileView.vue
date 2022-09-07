<template>
    <v-form ref="form" @submit.prevent="doSubmit" class="centerForm mt-8 px-8">
        <h1 class="text-center mb-8">User info</h1>
        <!-- TODO: add modify email feature -->

        <v-text-field
            v-model="userInfo.email"
            label="Email"
            readonly
            :color="editMode ? 'primary' : 'default'"
            :rules="emailRules"
            :disabled="editMode"
            :prepend-inner-icon="mdiEmail"
        />

        <!-- TODO: add modify password feature -->

        <v-text-field
            v-model="userInfo.password"
            label="Password"
            placeholder="**************"
            type="password"
            readonly
            :color="editMode ? 'primary' : 'default'"
            :disabled="editMode"
            :prepend-inner-icon="mdiEmail"
        >
        </v-text-field>

        <v-text-field
            v-model="userInfo.firstName"
            label="First Name"
            :color="editMode ? 'primary' : 'default'"
            :readonly="!editMode"
            :rules="firstNameRules"
            :prepend-inner-icon="mdiAccountBox"
        />

        <v-text-field
            v-model="userInfo.lastName"
            label="Last Name"
            :color="editMode ? 'primary' : 'default'"
            :rules="lastNameRules"
            :readonly="!editMode"
            :prepend-inner-icon="mdiAccountBox"
        />

        <div v-if="editMode" class="text-right">
            <v-btn @click="cancelChanges" class="mr-4" size="large"> Cancel </v-btn>
            <v-btn type="submit" :loading="loading" size="large" color="purple"> Save </v-btn>
        </div>
        <div v-else class="text-right">
            <v-btn @click="editMode = true" :loading="loading" size="large" color="purple">
                Edit
            </v-btn>
        </div>
        <Toast
            class="mt-4"
            :type="toastType"
            :show="showToast"
            :msg="toastMsg"
            @close="showToast = false"
        />
    </v-form>
</template>

<script setup lang="ts">
import { mdiEmail, mdiAccountBox } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import { useUserStore } from '@/stores/userStore';
import type { UpdateProfileBody } from '@/types';
import { updateUserInfo } from '@/services/profile';
import Toast from '@/components/ToastComponent.vue';

const userStore = useUserStore();

const userInfo = ref({
    firstName: userStore.state.firstName,
    lastName: userStore.state.lastName,
    email: userStore.state.email,
    password: '************',
});

const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);
const editMode = ref(false);
const loading = ref(false);
const showToast = ref(false);
const toastMsg = ref('');
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('success');

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];

const nameRegex = /^[\p{L}][ \p{L}'-]*[\p{L}]$/u;

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

async function doSubmit() {
    loading.value = true;

    const validation = await form.value?.validate();

    if (validation?.valid) {
        const updateProfileBody: UpdateProfileBody = {
            firstName:
                userInfo.value.firstName != userStore.state.firstName
                    ? userInfo.value.firstName
                    : undefined,
            lastName:
                userInfo.value.lastName != userStore.state.lastName
                    ? userInfo.value.lastName
                    : undefined,
        };

        console.debug(updateProfileBody);
        const res = await updateUserInfo(updateProfileBody);

        if (res.ok) {
            toastMsg.value = res.data.message;
            toastType.value = 'success';
        } else {
            console.error(`[PROFILE VIEW] Api error: [${res.err.code}] '${res.err.message}'`);
            toastMsg.value = res.err.message;
            toastType.value = 'error';
        }
        editMode.value = false;
    } else {
        console.debug(`[PROFILE VIEW] Validation error: ${validation?.errors[0].errorMessages[0]}`);
        // Print validation error on Error Toast
        toastMsg.value = validation?.errors[0].errorMessages[0] ?? 'Error';
        toastType.value = 'error';
    }

    loading.value = false;
    showToast.value = true;
}

function cancelChanges() {
    userInfo.value.firstName = userStore.state.firstName;
    userInfo.value.lastName = userStore.state.lastName;
    userInfo.value.email = userStore.state.email;
    editMode.value = false;
    showToast.value = false;
}
</script>

<style>
.hasBorder {
    border: 1px solid red;
}
</style>
