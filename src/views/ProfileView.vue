<template>
    <ChangeUserInfo />
    <ChangePassword />

    <div class="centerForm mt-16 d-flex flex-column align-center">
        <div class="deleteButton toastContainer">
            <Toast
                class="formToast"
                :type="toastControls.type"
                :show="toastControls.show"
                :msg="toastControls.msg"
                @close="toastControls.show = false"
            />
        </div>

        <v-btn
            @click="
                deleteSelection = DELETE_SELECTION.VAULT;
                showConfirmChoice = true;
                loading.deleteVault = true;
            "
            :loading="loading.deleteVault"
            size="large"
            color="error"
            class="mb-8 deleteButton"
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
            class="mb-8 deleteButton"
        >
            Delete Account
        </v-btn>
    </div>

    <ConfirmationDialog
        :show="showConfirmChoice"
        :msg="`Are you sure you want to delete your ${deleteSelection}?\nThe operation cannot be undone`"
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
.deleteButton {
    max-width: 70%;
    width: 100%;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';

import ChangePassword from '@/components//profile/ChangePasswordComponent.vue';
import ChangeUserInfo from '@/components/profile/ChangeUserInfoComponent.vue';
import ConfirmDeletion from '@/components//profile/ConfirmDeletionDialog.vue';
import ConfirmationDialog from '@/components/overlays/ConfirmationDialog.vue';
import Toast, { type ToastControls } from '@/components/overlays/ToastComponent.vue';
import { logout } from '@/services/utils';
import { DELETE_SELECTION } from '@/types';

// DOM
const loading = ref({
    deleteVault: false,
    deleteAccount: false,
});
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

const showConfirmChoice = ref(false);
const deleteSelection = ref<DELETE_SELECTION>(DELETE_SELECTION.VAULT);
const showConfirmPassword = ref(false);

function reset(success: boolean) {
    showConfirmChoice.value = false;
    showConfirmPassword.value = false;
    loading.value.deleteVault = false;
    loading.value.deleteAccount = false;

    if (success) {
        switch (deleteSelection.value) {
            case DELETE_SELECTION.VAULT:
                clearTimeout(toastControls.value.timeout);
                toastControls.value.show = true;
                toastControls.value.msg = 'Vault deleted!';
                toastControls.value.type = 'success';
                toastControls.value.timeout = setTimeout(
                    () => (toastControls.value.show = false),
                    toastControls.value.timeoutLength
                );
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
