<!-- TODO: Hide y overflow -->
<template>
    <v-card elevation="10">
        <v-container>
            <v-row no-gutters>
                <v-col>
                    <v-card-title>
                        {{ credential.name }} {{ credential.url ? `(${credential.url})` : '' }}
                    </v-card-title>
                    <v-card-subtitle> {{ credential.username }} </v-card-subtitle>
                </v-col>
                <v-col>
                    <v-btn
                        @click="copyToClipBoard('Username')"
                        color="secondary"
                        :prepend-icon="mdiAccountBox"
                        class="mb-2"
                    >
                        Copy username
                    </v-btn>
                    <v-btn
                        @click="copyToClipBoard('Password')"
                        :prepend-icon="mdiKey"
                        color="secondary"
                    >
                        Copy password
                    </v-btn>
                </v-col>
                <v-col>
                    <v-btn
                        :prepend-icon="mdiArrowTopRight"
                        class="mb-2"
                        color="secondary"
                        @click="win.open(credential.url, '_blank')"
                    >
                        Open website
                    </v-btn>
                    <v-btn @click="$emit('openDialog', index)" color="primary">
                        View details
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script setup lang="ts">
import { mdiAccountBox, mdiKey, mdiArrowTopRight } from '@mdi/js';
import { computed, ref } from 'vue';

import { useVaultStore } from '@/stores/vaultStore';
import type { ToastControls } from './ToastComponent.vue';

const props = defineProps<{
    index: number;
}>();

defineEmits<{
    (e: 'openDialog', index: number): void;
}>();

// NOTE: Vue gives error with window
const win = window;

const vaultStore = useVaultStore();

const credential = computed(() => vaultStore.state.credentials[props.index]);
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
});

let timeout: number;
function copyToClipBoard(field: 'Username' | 'Password') {
    clearTimeout(timeout);

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

    timeout = setTimeout(() => {
        toastControls.value.show = false;
    }, 1500);
}
</script>
