<template>
        <v-dialog :model-value="show" persistent>
            <v-card>
                <v-card-title class="text-center">
                    <span class="text-h5">{{title}}</span>
                </v-card-title>
                <v-card-text class="text-center breakNewline">
                   {{msg}}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="error" text @click="$emit('no')"> No </v-btn>
                    <v-btn type="submit" color="success" text @click="$emit('yes')"> Yes </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
</template>

<script setup lang="ts">
// Vue internals
defineProps<{
    show: boolean;
    title: string;
    msg: string;
}>();
defineEmits<{
    (e: 'no'): void;
    (e: 'yes'): void;
}>();
</script>
