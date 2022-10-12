<template>
    <LogoExtended class="homeLogo" />

    <v-container class="homeSection">
        <v-row>
            <v-col class="text-center">
                <h1 class="text-center mb-4 font-weight-light">About this project</h1>

                <p class="mb-2">
                    PWM - PassWord Manager is an open source project developed by two students of
                    the IT Security course at the University of Milan.
                </p>
                <p>
                    Our years of study in the security field have allowed us to implement a solution
                    that allows our users to manage their credentials easily and in total security.
                </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="text-center">
                <h1 class="text-center mb-4 font-weight-light">How to get started?</h1>

                <p class="mb-2">
                    Once you have registered via the
                    <RouterLink to="/signup">registration form</RouterLink> you will have your own
                    safe in which to save your credentials. PWM allows you to add your credentials
                    one by one or to bulk import them from an existing PWM backup or from
                    <a href="https://bitwarden.com/" target="_blank"> Bitwarden </a>
                </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="text-center">
                <h1 class="text-center mb-4 font-weight-light">How does it works?</h1>

                <p class="mb-2">
                    When a new account is created, PWM uses a Password-Based Key Derivation Function
                    and a salt to derive the Master Key and the Master Password Hash, so your master
                    password is never sent in plaintext. This Master Password Hash is sent then to
                    our server over HTTPS, where it will be hashed and stored.
                </p>

                <p class="mb-2">
                    Then a Symmetric Key and an Initialization Vector (IV) are generated using a
                    Cryptographically Secure Pseudorandom Number Generator (CSPRNG). The Symmetric
                    key is encrypted with AES-256-CBC using the Master Key and the Initialization
                    Vector, resulting in the Protected Symmetric Key. The Protected Symmetric Key
                    the Initialization Vector are then sent to our server to be stored until a new
                    client syncs and retrieves them.
                </p>

                <p class="mb-2">
                    To encrypt the Credential Vault we use AES-256-CBC with the Symmetric key and
                    another Vault IV, generated using a CSPRNG. The resulting Encrypted Vault and
                    Vault IV are then sent back to our server for save storage until a new client
                    syncs and retrieves them.
                </p>

                <p class="mb-2">
                    Master Password, Master Key, Symmetric Key and the Credential Vault are
                    <strong>NEVER</strong>
                    transmitted to or stored on our server, they are only generated and used on the
                    client, so that no one, even us, can ever decrypt and access your credentials
                    except you.
                </p>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss">
.homeLogo {
    margin: 32px auto;
    max-width: 650px;
}

.homeSection {
    max-width: 1080px !important;
}

@media only screen and (max-width: 768px) {
    .homeLogo {
        margin: 32px;
        max-width: 100%;
    }
}
</style>

<script setup lang="ts">
import LogoExtended from '@/components/LogoExtended.vue';
</script>
