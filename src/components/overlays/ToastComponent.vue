<template>
    <v-slide-y-reverse-transition v-show="show" duration="300">
        <v-alert :type="type" closable density="compact" class="breakNewline">
            <template v-slot:close>
                <v-btn @click="$emit('close')" :icon="mdiClose"></v-btn>
            </template>
            {{ msg }}
        </v-alert>
    </v-slide-y-reverse-transition>
</template>

<style>
.v-alert__close {
    margin-left: 8px;
}
</style>

<script setup lang="ts">
import { mdiClose } from '@mdi/js';

export type ToastControls = {
    show: boolean;
    msg: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timeout: undefined | number;
    timeoutLength: number;
};

defineProps<{
    type: 'error' | 'success' | 'warning' | 'info';
    msg: string;
    show: boolean;
}>();
defineEmits<{
    (e: 'close'): void;
}>();
</script>
