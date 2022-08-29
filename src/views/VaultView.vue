<template>
    <v-card>
        <v-tabs v-model="tab" background-color="purple" text-center>
            <v-tab value="one">Item One</v-tab>
            <v-tab value="two">Item Two</v-tab>
            <v-tab value="three">Item Three</v-tab>
        </v-tabs>

        <v-card-text>
            <v-window v-model="tab">
                <v-window-item value="one"> One </v-window-item>

                <v-window-item value="two"> Two </v-window-item>

                <v-window-item value="three"> Three </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { userStore } from '@/stores/userStore';
import router from '@/router';

const tab = ref(null);

// FIXME: just for debugging
if(!userStore.state.firstName) {
    router.push("/login");
}

</script>
