<template>
    <v-form ref="form" @submit.prevent="doSubmit" class="centerForm my-8">
        <h1 class="text-center mb-4 font-weight-light">User Info</h1>

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

        <div v-if="editMode" class="text-right mb-4">
            <v-btn @click="cancelChanges" class="mr-4" size="large"> Cancel </v-btn>
            <v-btn type="submit" size="large" color="primary"> Save </v-btn>
        </div>
        <div v-else class="text-right mb-4">
            <v-btn @click="editMode = true" :loading="loading" size="large" color="primary">
                Edit
            </v-btn>
        </div>
    </v-form>
</template>

<script setup lang="ts">
import { mdiAccountBox } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import Toast, { type ToastControls } from '@/components/overlays/ToastComponent.vue';
import { updateUserInfo } from '@/services/profile';
import { useUserStore } from '@/stores/userStore';
import type { UpdateProfileBody } from '@/types';

const userStore = useUserStore();

// DOM
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);
const editMode = ref(false);
const loading = ref(false);

const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

const userInfo = ref({
    firstName: userStore.state.firstName,
    lastName: userStore.state.lastName,
});

// rules
const nameRegex = /^[\p{L}][ \p{L}'-]*[\p{L}]$/u;
const firstNameRules = [
    (firstName: string) => !!firstName || 'First name is required',
    (firstName: string) =>
        !!nameRegex.test(firstName.trim()) || 'First name contain an invalid character!',
];
const lastNameRules = [
    (lastName: string) => !!lastName || 'last Name is required',
    (lastName: string) =>
        !!nameRegex.test(lastName.trim()) || 'Last name contain an invalid character!',
];

async function doSubmit() {
    clearTimeout(toastControls.value.timeout);
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
            toastControls.value.msg = res.data.message;
            toastControls.value.type = 'success';
            toastControls.value.timeout = setTimeout(
                () => (toastControls.value.show = false),
                toastControls.value.timeoutLength
            );
        } else {
            console.error(`[PROFILE VIEW] Api error: [${res.err.code}] '${res.err.message}'`);
            toastControls.value.msg = res.err.message;
            toastControls.value.type = 'error';
        }
        editMode.value = false;
    } else {
        console.debug(`[PROFILE VIEW] Validation error: ${validation?.errors[0].errorMessages[0]}`);
        // Print validation error on Error Toast
        toastControls.value.msg = validation?.errors[0].errorMessages[0] ?? 'Error';
        toastControls.value.type = 'error';
    }

    toastControls.value.show = true;
    loading.value = false;
}

function cancelChanges() {
    userInfo.value.firstName = userStore.state.firstName;
    userInfo.value.lastName = userStore.state.lastName;
    editMode.value = false;
    toastControls.value.show = false;
}
</script>
