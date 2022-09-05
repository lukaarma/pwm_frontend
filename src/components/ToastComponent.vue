<template>
    <v-slide-y-reverse-transition v-show="show" duration="300">
        <v-alert :type="type">{{ msg }}</v-alert>
    </v-slide-y-reverse-transition>
</template>

<script setup lang="ts">
defineProps<{
    type: "error" | "success" | "warning" | "info";
    msg: string;
    show: boolean;
}>();
</script>
