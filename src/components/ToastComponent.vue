<template>
    <v-slide-y-reverse-transition v-show="show" duration="300">
        <v-alert :type="type" closable>
            <template v-slot:close>
                <v-btn @click="emit('close')" :icon="mdiClose"></v-btn>
            </template>
            {{ msg }}
        </v-alert>
    </v-slide-y-reverse-transition>
</template>

<script setup lang="ts">
import { mdiClose } from '@mdi/js';

defineProps<{
    type: 'error' | 'success' | 'warning' | 'info';
    msg: string;
    show: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();
</script>
