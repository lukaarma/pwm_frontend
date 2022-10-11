<!-- FIXME: form input have too much opacity if focused when readonly, style is confusing -->
<template>
    <v-dialog
        :model-value="show"
        :persistent="persistent"
        @click:outside="close"
        id="credentialDialog"
    >
        <v-card>
            <v-card-title class="mt-4 text-center text-h5 font-weight-light">
                <v-img
                    v-show="!newMode"
                    :src="iconUrl"
                    :width="newMode ? 0 : 64"
                    max-width="64"
                    max-height="64"
                    class="d-inline-block centerIcon"
                >
                    <template v-slot:placeholder>
                        <v-icon :icon="mdiWeb" size="64" />
                    </template>
                </v-img>
                {{ title }}
            </v-card-title>

            <v-card-text class="pt-0">
                <div class="toastContainer">
                    <Toast
                        class="copyAlert"
                        :type="toastControls.type"
                        :show="toastControls.show"
                        :msg="toastControls.msg"
                        @close="toastControls.show = false"
                    />
                </div>
                <v-form ref="form" @submit.prevent="saveChanges(false)" class="mt-8">
                    <v-text-field
                        v-model="credential.name"
                        :rules="websiteNameRules"
                        :prepend-inner-icon="mdiWeb"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        label="Website Name"
                        placeholder="Example Website"
                        required
                    />

                    <v-text-field
                        v-model="credential.username"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        label="Username"
                        :prepend-inner-icon="mdiAccountBox"
                        :append-inner-icon="mdiContentCopy"
                        @click:appendInner.stop="copyToClipBoard('Username')"
                        required
                    />

                    <v-text-field
                        v-model="credential.password"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        :prepend-inner-icon="mdiKeyVariant"
                        :type="hidePassword ? 'password' : 'text'"
                        label="Password"
                    >
                        <template v-slot:append-inner>
                            <v-icon
                                class="mr-2"
                                :icon="hidePassword ? mdiEyeOff : mdiEye"
                                @click.stop="hidePassword = !hidePassword"
                            />
                            <v-icon
                                :icon="mdiContentCopy"
                                @click.stop="copyToClipBoard('Password')"
                            />
                        </template>
                    </v-text-field>

                    <v-text-field
                        v-model="credential.url"
                        :prepend-inner-icon="mdiLinkVariant"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        label="Website URL"
                        placeholder="https://exemple.com"
                        outlined
                        :append-inner-icon="mdiArrowTopRight"
                        @click:appendInner.stop="
                            credential.url ? win.open(credential.url, '_blank') : null
                        "
                    />
                    <v-btn type="submit" hidden />
                </v-form>
            </v-card-text>

            <!-- MOBILE -->
            <v-card-actions v-if="$vuetify.display.mobile" class="mb-2 mx-4">
                <div class="d-flex flex-column align-start">
                    <v-btn
                        outlined
                        :loading="loadingPasswordCheck"
                        color="primary"
                        @click="checkPassword"
                    >
                        Check password
                    </v-btn>
                    <v-btn
                        :disabled="newMode"
                        @click="showDeleteDialog = true"
                        outlined
                        color="red"
                        class="ma-0"
                    >
                        Delete
                    </v-btn>
                </div>

                <v-spacer />

                <div class="d-flex flex-column align-end">
                    <v-btn v-if="editMode" outlined color="primary" @click="cancelChanges">
                        Cancel
                    </v-btn>
                    <v-btn v-else outlined color="primary" @click="$emit('close')"> Close </v-btn>

                    <v-btn
                        v-if="editMode"
                        :loading="loading"
                        @click="saveChanges(false)"
                        outlined
                        color="primary"
                        class="ma-0"
                    >
                        Save
                    </v-btn>
                    <v-btn v-else @click="editMode = true" outlined color="primary" class="ma-0">
                        Edit
                    </v-btn>
                </div>
            </v-card-actions>

            <!-- DESKTOP -->
            <v-card-actions v-else class="mb-2 mx-4">
                <v-btn :disabled="newMode" @click="showDeleteDialog = true" outlined color="red">
                    Delete
                </v-btn>

                <v-btn
                    outlined
                    :loading="loadingPasswordCheck"
                    color="primary"
                    @click="checkPassword"
                >
                    <v-tooltip activator="parent" location="bottom" class="text-center">
                        <div>Check if password was leaked from other websites</div>
                        Check the "Tools" tab for more info
                    </v-tooltip>
                    Check password
                </v-btn>

                <v-spacer />

                <v-btn v-if="editMode" @click="cancelChanges" outlined color="primary">
                    Cancel
                </v-btn>
                <v-btn v-else @click="$emit('close')" outlined color="primary"> Close </v-btn>

                <v-btn
                    v-if="editMode"
                    :loading="loading"
                    @click="saveChanges(false)"
                    outlined
                    color="primary"
                >
                    Save
                </v-btn>
                <v-btn v-else @click="editMode = true" outlined color="primary"> Edit </v-btn>
            </v-card-actions>
        </v-card>

        <ConfirmationDialog
            :show="showDeleteDialog"
            :msg="'Are you sure you want to delete these credentials?\nThe operation cannot be undone'"
            title="Delete Credential"
            @no="showDeleteDialog = false"
            @yes="deleteCredential()"
        />

        <ConfirmationDialog
            :show="showOverrideDialog"
            :msg="`You have already used this password ${samePasswordCount} times.\nAre you sure you want to use it again?`"
            title="Duplicated password"
            @no="
                showOverrideDialog = false;
                loading = false;
            "
            @yes="saveChanges(true)"
        />
    </v-dialog>
</template>

<style lang="scss">
@use '@/styles.scss';

/* BUG: there is a bug report (https://github.com/vuetifyjs/vuetify/issues/15403) open
in the Vuetify repo because dialog max-width is not working correctly.
Solution: we hijack the default overlay css only on this form (thanks to the ID)*/
#credentialDialog > .v-overlay__content {
    // default css
    max-height: calc(100% - 48px);
    margin: 24px;
    display: flex;
    flex-direction: column;
    // our addition
    max-width: 650px;
    width: 100%;
}

.copyAlert {
    position: absolute;
    width: 100%;
    transform: translate(0, -70%);
}

.centerIcon {
    vertical-align: middle;
}
</style>

<script setup lang="ts">
import {
    mdiKeyVariant,
    mdiEye,
    mdiEyeOff,
    mdiAccountBox,
    mdiArrowTopRight,
    mdiLinkVariant,
    mdiWeb,
    mdiContentCopy,
} from '@mdi/js';
import { computed, ref, watch } from 'vue';
import type vuetify from 'vuetify/components';

import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import { checkPWNEDPassword } from '@/services/API';
import { sendVault } from '@/services/vault';
import Toast, { type ToastControls } from '@/components/ToastComponent.vue';
import { hasProtocolRegex } from '@/services/utils';
import { VAULT_A, VAULT_M, useVaultStore } from '@/stores/vaultStore';

// NOTE: Vue gives error with window
const win = window;

// Vue internals
const props = defineProps<{
    show: boolean;
    edit: boolean;
    index: number;
}>();
const emit = defineEmits<{
    (e: 'close'): void;
}>();

// internal logic
const vaultStore = useVaultStore();
const index = ref(props.index);
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const samePasswordCount = ref(0);
const samePasswordMax = 2;

// DOM controls
const hidePassword = ref(true);
const newMode = ref(props.index === -1);
const editMode = ref(props.index === -1);
const loading = ref(false);
const loadingPasswordCheck = ref(false);
const persistent = computed(() => {
    return (
        editMode.value &&
        !(
            newMode.value &&
            credential.value.name === '' &&
            credential.value.url === '' &&
            credential.value.username === '' &&
            credential.value.password === ''
        )
    );
});

const showDeleteDialog = ref(false);
const showOverrideDialog = ref(false);

const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

// form logic
const websiteNameRules = [(name: string) => !!name || 'Website name is required'];

// page data bindings
// NOTE: don't reference data[index] directly! It WILL change the store
const credential = ref({
    name: '',
    url: '',
    username: '',
    password: '',
});

const iconUrl = ref('');
const title = computed(() => {
    if (newMode.value) {
        return 'Create new Credential';
    } else if (editMode.value) {
        return `Edit "${credential.value.name}"`;
    } else {
        return `View "${credential.value.name}"`;
    }
});

// trigger on load to set correct values of DOM logic and data bindings
watch(props, (newProps) => {
    resetErrors();
    index.value = newProps.index;

    if (newProps.show) {
        editMode.value = newProps.edit || index.value === -1;
        newMode.value = index.value === -1;

        // NOTE: don't reference data[index] directly! It WILL change the store
        credential.value = {
            name: newMode.value ? '' : vaultStore.state.credentials[index.value].name,
            url: newMode.value ? '' : vaultStore.state.credentials[index.value].url,
            username: newMode.value ? '' : vaultStore.state.credentials[index.value].username,
            password: newMode.value ? '' : vaultStore.state.credentials[index.value].password,
        };

        if (!newMode.value) {
            iconUrl.value = `https://icon.horse/icon?uri=${credential.value.url}`;
        }
    }
});

// handlers
async function deleteCredential() {
    showDeleteDialog.value = false;
    vaultStore.commit(VAULT_M.DELETE_CREDENTIAL, index.value);

    // then send to backend
    const res = await sendVault();

    if (res.ok) {
        // if cloud save ok, and new mode close prompt
        console.debug('[CREDENTIAL_DELETE] Deletion success');
        emit('close');
    } else {
        console.debug(`[CREDENTIAL_DELETE] Deletion failed: [${res.err.code}] ${res.err.message}`);
        toastControls.value.type = 'error';
        toastControls.value.show = true;
        toastControls.value.msg = res.err.message;
    }
}

async function checkPassword() {
    clearTimeout(toastControls.value.timeout);
    loadingPasswordCheck.value = true;

    if (credential.value.password !== '') {
        await checkPWNEDPassword(credential.value.password)
            .then((res) => {
                toastControls.value.type = res ? 'error' : 'success';
                toastControls.value.msg = `This password has been seen ${res} times before.`;
            })
            .catch((err: Error) => {
                toastControls.value.type = 'error';
                toastControls.value.msg = err.message;
            });
    } else {
        toastControls.value.type = 'warning';
        toastControls.value.msg = 'Please provide a password to check';
    }

    toastControls.value.show = true;

    toastControls.value.timeout = setTimeout(() => {
        toastControls.value.show = false;
    }, toastControls.value.timeoutLength);
    // separate timeout, we don't want this loading to be resettable
    setTimeout(() => {
        loadingPasswordCheck.value = false;
    }, toastControls.value.timeoutLength);
}

function cancelChanges() {
    resetErrors();

    if (newMode.value || props.edit) {
        emit('close');
    } else {
        editMode.value = false;

        credential.value = {
            name: vaultStore.state.credentials[index.value].name,
            url: vaultStore.state.credentials[index.value].url,
            username: vaultStore.state.credentials[index.value].username,
            password: vaultStore.state.credentials[index.value].password,
        };
    }
}

async function saveChanges(samePasswordOverride = false) {
    if (editMode.value) {
        loading.value = true;
        showOverrideDialog.value = false;

        const validation = await form.value?.validate();

        if (validation?.valid) {
            // same password check
            if (!samePasswordOverride) {
                samePasswordCount.value = vaultStore.state.credentials.filter(
                    (cred) => cred.password === credential.value.password
                ).length;

                // plus 1 to account the one we are creating
                if (samePasswordCount.value + 1 > samePasswordMax) {
                    showOverrideDialog.value = true;

                    return;
                }
            }

            // check for url protocol
            if (credential.value.url && !hasProtocolRegex.test(credential.value.url)) {
                credential.value.url = `http://${credential.value.url}`;
            }

            // if valid save in store
            index.value = await vaultStore.dispatch(VAULT_A.SET_CREDENTIAL, {
                index: index.value,
                credential: credential.value,
            });

            console.log(
                `[CREDENTIAL] ${newMode.value ? 'Added new' : 'Updated'} credential at ${
                    index.value
                }`
            );

            // then send to backend
            const res = await sendVault();

            if (res.ok) {
                console.debug('[CREDENTIAL] Save successful');

                emit('close');
            } else {
                console.debug(`[CREDENTIAL] Save failed: [${res.err.code}] ${res.err.message}`);
                toastControls.value.type = 'error';
                toastControls.value.show = true;
                toastControls.value.msg = res.err.message;
            }
        } else {
            console.debug(
                `[saveChanges] Validation error: ${validation?.errors[0].errorMessages[0]}`
            );
            // Print validation error on Error Toast
            toastControls.value.msg = validation?.errors[0].errorMessages[0] ?? 'Error';
            toastControls.value.type = 'warning';
            toastControls.value.show = true;
        }

        loading.value = false;
    }
}

function resetErrors() {
    form.value?.resetValidation();
    toastControls.value.show = false;
}

function close() {
    if (!persistent.value) {
        emit('close');
    }
}

function copyToClipBoard(field: 'Username' | 'Password') {
    clearTimeout(toastControls.value.timeout);

    if (editMode.value) {
        return;
    }

    switch (field) {
        case 'Username':
            navigator.clipboard.writeText(credential.value.username);
            break;

        case 'Password':
            navigator.clipboard.writeText(credential.value.password);
            break;

        default:
            console.debug('[copyToClipBoard] Invalid filed!');
            break;
    }

    toastControls.value.type = 'info';
    toastControls.value.msg = field + ' copied';
    toastControls.value.show = true;

    toastControls.value.timeout = setTimeout(() => {
        toastControls.value.show = false;
    }, toastControls.value.timeoutLength);
}
</script>
