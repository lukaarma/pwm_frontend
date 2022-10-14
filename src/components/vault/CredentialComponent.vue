<template>
    <v-card elevation="3" class="fixedHeightCard">
        <v-container>
            <v-row no-gutters class="flex-nowrap fixedHeightRow">
                <v-img
                    :src="`https://icon.horse/icon?uri=${credential.url}`"
                    min-width="64"
                    max-width="64"
                >
                    <template v-slot:placeholder>
                        <v-icon :icon="mdiWeb" size="64" />
                    </template>
                </v-img>

                <v-col :cols="$vuetify.display.mobile ? 8 : 7">
                    <v-card-title >
                        {{ credential.name }}
                    </v-card-title>
                    <v-card-subtitle> {{ credential.username }} </v-card-subtitle>
                </v-col>

                <!-- MOBILE -->
                <v-col cols="3" v-if="$vuetify.display.mobile">
                    <v-menu location="start">
                        <template v-slot:activator="{ props }">
                            <v-icon
                                v-bind="props"
                                :icon="mdiMenu"
                                size="x-large"
                                class="mobileOptionsMenu"
                            />
                        </template>

                        <v-list>
                            <v-list-item @click.stop="copyToClipBoard('Username')">
                                <template v-slot:prepend>
                                    <v-icon :icon="mdiAccountBox" />
                                </template>
                                <template v-slot:title> Copy Username </template>
                            </v-list-item>
                            <v-list-item @click.stop="copyToClipBoard('Password')">
                                <template v-slot:prepend>
                                    <v-icon :icon="mdiKeyVariant" />
                                </template>
                                <template v-slot:title> Copy Password </template>
                            </v-list-item>
                            <v-list-item @click.stop="win.open(credential.url, '_blank')">
                                <template v-slot:prepend>
                                    <v-icon :icon="mdiArrowTopRight" />
                                </template>
                                <template v-slot:title> Open website </template>
                            </v-list-item>
                            <v-list-item @click.stop="$emit('openEditDialog')">
                                <template v-slot:prepend>
                                    <v-icon :icon="mdiPencil" />
                                </template>
                                <template v-slot:title> Edit </template>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-col>

                <!-- DESKTOP -->

                <v-col v-else class="d-flex justify-end align-center">
                    <v-btn
                        @click.stop="copyToClipBoard('Username')"
                        icon
                        size="large"
                        color="secondary"
                        class="mr-2"
                    >
                        <v-icon :icon="mdiAccountBox" size="32" />
                        <v-tooltip
                            activator="parent"
                            text="Copy Username"
                            location="bottom"
                            class="text-center"
                        />
                    </v-btn>
                    <v-btn
                        @click.stop="copyToClipBoard('Password')"
                        icon
                        size="large"
                        color="secondary"
                        class="mr-2"
                    >
                        <v-icon :icon="mdiKeyVariant" size="32" />
                        <v-tooltip
                            activator="parent"
                            text="Copy Password"
                            location="bottom"
                            class="text-center"
                        />
                    </v-btn>
                    <v-btn
                        @click.stop="win.open(credential.url, '_blank')"
                        icon
                        size="large"
                        color="secondary"
                        class="mr-2"
                    >
                        <v-icon :icon="mdiArrowTopRight" size="32" />
                        <v-tooltip
                            activator="parent"
                            text="Open website"
                            location="bottom"
                            class="text-center"
                        />
                    </v-btn>
                    <v-btn
                        fab
                        @click.stop="$emit('openEditDialog')"
                        icon
                        size="large"
                        color="primary"
                    >
                        <v-icon :icon="mdiPencil" size="32" />
                        <v-tooltip
                            activator="parent"
                            text="Edit credential"
                            location="bottom"
                            class="text-center"
                        />
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<style scoped lang="scss">
.mobileOptionsMenu {
    width: 50%;
    height: 50%;
    position: relative;
    transform: translate(50%, 50%);
}

$row-height: 100px;
.fixedHeightCard {
    max-height: $row-height;
}
// NOTE: fix for bad CSS, row height not locked between 600px and 960px
.fixedHeightRow {
    // max-height of card - 32px of padding
    max-height: calc($row-height - 32px);
}
</style>

<script setup lang="ts">
import {
    mdiAccountBox,
    mdiKeyVariant,
    mdiArrowTopRight,
    mdiMenu,
    mdiWeb,
    mdiPencil,
} from '@mdi/js';
import { computed } from 'vue';

import { useVaultStore } from '@/stores/vaultStore';

const props = defineProps<{
    index: number;
}>();

const emit = defineEmits<{
    (e: 'openEditDialog'): void;
    (e: 'openSnackbar', msg: string): void;
}>();

// NOTE: Vue gives error with window
const win = window;

const vaultStore = useVaultStore();

const credential = computed(() => vaultStore.state.credentials[props.index]);

function copyToClipBoard(field: 'Username' | 'Password') {
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

    emit('openSnackbar', `${field} copied`);
}
</script>
