import API from './API';
import utils, { encryptVault, decryptVault } from './cryptoUtils';
import { userStore } from '@/stores/userStore';
import { vaultStore, type VaultStore } from '@/stores/vaultStore';
import type { APIResponse, Result, VaultBody, VaultResponse } from '@/types';
import { WEB_CODES } from '@/types';

const encoder = new TextEncoder();

// TODO: if vault in local storage send to backend
export async function getVault(): Promise<Result> {
    // if vault in local storage is not like our Vault set null
    const localVault: VaultBody | null = JSON.parse(localStorage.getItem('vault') || 'null');
    if (
        localVault &&
        localVault.version &&
        typeof localVault.version === 'number' &&
        localVault.lastModified &&
        localVault.lastModified instanceof Date &&
        localVault.IV &&
        typeof localVault.IV === 'string' &&
        localVault.data &&
        typeof localVault.data === 'string'
    ) {
        console.debug('[getVault] found local vault, synchronizing with server');
        const res = await API.sendVault(localVault, false);

        // if cannot send vault, display error and retry button
        // TODO: if a more recent vault exists delete local
        if (!res.data) {
            return {
                ok: false,
                err: res.err ?? {
                    code: WEB_CODES.MISSING_DATA_AND_ERROR,
                    message: '[getVault] Missing data and error!',
                },
            };
        } else {
            console.debug('[getVault] Synchronized, deleting local vault');
            localStorage.removeItem('vault');
        }
    }

    console.debug('[getVault] Synchronizing most recent vault from server');
    const res = await API.getVault();

    if (!res.data) {
        if (res.err?.code === WEB_CODES.MISSING_VAULT) {
            console.debug('[getVault] No saved vault, creating new one');

            return initializeVault();
        } else {
            return {
                ok: false,
                err: res.err ?? {
                    code: WEB_CODES.MISSING_DATA_AND_ERROR,
                    message: '[getVault] Missing data and error!',
                },
            };
        }
    }

    console.debug('[getVault] Got vault from server, decrypting');
    if (await decryptVault(res.data)) {
        return {
            ok: true,
            data: {
                code: WEB_CODES.VAULT_DECRYPTED,
                message: '[getVault] Vault decrypted successfully',
            },
        };
    } else {
        return {
            ok: false,
            err: {
                code: WEB_CODES.FAIL_VAULT_DECRYPT,
                message: '[getVault] Error while decrypting Vault!',
            },
        };
    }
}

// try 3 times, then leave local copy saved
export async function sendVault(createNew: boolean = false): Promise<Result> {
    const maxTries = 3;
    const sleepTimer = 3000;

    for (let i = 1; i <= maxTries; i++) {
        const vault = await encryptVault();

        // save item before API call
        console.debug('[sendVault] Vault encrypted, saving in local storage');
        localStorage.setItem('vault', JSON.stringify(vault));

        console.debug('[sendVault] Vault saved, sending to database');
        if (vault) {
            const res = await API.sendVault(vault, createNew);
            console.debug('[sendVault] Vault sent to database');

            if (res.data) {
                localStorage.removeItem('vault');

                return {
                    ok: true,
                    data: res.data ?? {
                        code: WEB_CODES.MISSING_DATA,
                        message: '[sendVault] Missing data!',
                    },
                };
            } else if (i === maxTries) {
                return {
                    ok: false,
                    err: res.err ?? {
                        code: WEB_CODES.MISSING_DATA_AND_ERROR,
                        message: '[sendVault] Missing data and error!',
                    },
                };
            } else {
                console.debug(
                    `[sendVault] Error while sending Vault! Try ${i}/${maxTries}, waiting...`
                );
                await new Promise((r) => setTimeout(r, sleepTimer));
            }
        } else if (i === maxTries) {
            return {
                ok: false,
                err: {
                    code: WEB_CODES.FAIL_VAULT_ENCRYPT,
                    message: '[sendVault] Error while encrypting Vault!',
                },
            };
        } else {
            console.debug(`[sendVault] Error encrypting Vault! Try ${i}/${maxTries}, waiting...`);
            await new Promise((r) => setTimeout(r, sleepTimer));
        }
    }

    console.debug(`[sendVault] Error, max tries exceeded but no return`);

    return {
        ok: false,
        err: {
            code: WEB_CODES.MISSING_DATA_AND_ERROR,
            message: '[sendVault] Error, max tries exceeded but no return!',
        },
    };
}

async function initializeVault(): Promise<Result> {
    const vaultIV = window.crypto.getRandomValues(new Uint8Array(16));

    let initialVault: VaultStore = {
        version: 1,
        lastModified: new Date(),
        IV: vaultIV,
        data: [],
    };

    vaultStore.commit('setVault', initialVault);
    console.debug('[initializeVault] Initialized new vault');

    return sendVault(true);
}