<template>
    <v-form ref="form" @submit.prevent="doSubmit" class="centerForm my-8">
        <h1 class="text-center mb-4 font-weight-light">User Info</h1>

        <div class="toastContainer">
            <Toast
                class="formMessage"
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
            <v-btn @click="editMode = true" :loading="loading.save" size="large" color="primary">
                Edit
            </v-btn>
        </div>
    </v-form>

    <div class="centerForm mt-16 d-flex justify-space-between">
        <v-btn
            @click="
                deleteSelection = DELETE_SELECTION.VAULT;
                showConfirmChoice = true;
                loading.deleteVault = true;
            "
            :loading="loading.deleteVault"
            size="large"
            color="error"
            class="fixedButtons mr-4"
        >
            Delete Vault
        </v-btn>

        <v-btn
            @click="
                deleteSelection = DELETE_SELECTION.ACCOUNT;
                showConfirmChoice = true;
                loading.deleteAccount = true;
            "
            :loading="loading.deleteAccount"
            size="large"
            color="error"
            class="fixedButtons mr-4"
        >
            Delete Account
        </v-btn>

        <v-btn @click="logout" size="large" color="error" class="fixedButtons"> Logout </v-btn>
    </div>

    <ConfirmationDialog
        :show="showConfirmChoice"
        :msg="`Are you sure you want to delete your ${deleteSelection}? The operation cannot be undone`"
        :title="`Delete ${deleteSelection}`"
        @no="
            showConfirmChoice = false;
            loading.deleteAccount = false;
            loading.deleteVault = false;
        "
        @yes="showConfirmPassword = true"
    />
    <ConfirmDeletion
        :show="showConfirmPassword"
        :deleteSelection="deleteSelection"
        @no="reset(false)"
        @success="reset(true)"
    />
</template>

<style lang="scss">
@use '@/styles.scss';

.formMessage {
    position: absolute;
    width: 100%;
    transform: translate(0, -120%);
}

.fixedButtons {
    width: 11rem;
}
</style>

<script setup lang="ts">
import { mdiAccountBox } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import ConfirmDeletion from '../components/ConfirmDeletionDialog.vue';
import Toast, { type ToastControls } from '@/components/ToastComponent.vue';
import { updateUserInfo } from '@/services/profile';
import { logout } from '@/services/utils';
import { useUserStore } from '@/stores/userStore';
import { DELETE_SELECTION } from '@/types';
import type { UpdateProfileBody } from '@/types';

const userStore = useUserStore();

// DOM
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);
const editMode = ref(false);
const loading = ref({
    save: false,
    deleteVault: false,
    deleteAccount: false,
});

const showConfirmChoice = ref(false);
const deleteSelection = ref<DELETE_SELECTION>(DELETE_SELECTION.VAULT);
const showConfirmPassword = ref(false);

const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
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

// timeout
const timeoutLength = 2000;
let timeout: number;

async function doSubmit() {
    clearTimeout(timeout);
    loading.value.save = true;

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
            timeout = setTimeout(() => (toastControls.value.show = false), timeoutLength);
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
    loading.value.save = false;
}

function cancelChanges() {
    userInfo.value.firstName = userStore.state.firstName;
    userInfo.value.lastName = userStore.state.lastName;
    editMode.value = false;
    toastControls.value.show = false;
}

function reset(success: boolean) {
    showConfirmChoice.value = false;
    showConfirmPassword.value = false;
    loading.value.deleteVault = false;
    loading.value.deleteAccount = false;

    if (success) {
        switch (deleteSelection.value) {
            case DELETE_SELECTION.VAULT:
                clearTimeout(timeout);
                toastControls.value.show = true;
                toastControls.value.msg = 'Vault deleted!';
                toastControls.value.type = 'success';
                timeout = setTimeout(() => (toastControls.value.show = false), timeoutLength);
                break;

            case DELETE_SELECTION.ACCOUNT:
                logout();
                break;

            default:
                console.error(`Invalid delete selection ${deleteSelection.value}`);
                break;
        }
    }
}
</script>
