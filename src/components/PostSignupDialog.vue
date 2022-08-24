<template>
    <v-dialog :model-value="show" persistent>
        <v-card class="ma-5">
            <v-card-title class="text-h5">
                Registration successfully completed
            </v-card-title>
            <v-card-text>{{ msg }}</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="purple" @click="$emit('close')"> Close </v-btn>
                <v-btn color="purple" @click="$emit('resendEmail')">
                    Resend Email
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
    msg: string;
    show: boolean;
}>();

defineEmits<{
    (e: 'close'): void;
    (e: 'resendEmail'): void;
}>();
</script>
