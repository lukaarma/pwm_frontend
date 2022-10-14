import API from './API';
import { encryptVault, decryptVault } from './cryptoUtils';
import { JSONDateParser } from '@/services/utils';
import { VAULT_M, vaultStore, type VaultStore } from '@/stores/vaultStore';
import { isEncryptedVault, WEB_CODES } from '@/types';
import type { Result, VaultBody } from '@/types';

export const localStorageVaultKey = 'vault';

export async function getVault(): Promise<Result> {
    // if vault in local storage is not like our Vault set null
    const localVault: VaultBody | null = JSON.parse(
        localStorage.getItem(localStorageVaultKey) || 'null',
        JSONDateParser
    );
    let localOk = false;

    if (isEncryptedVault(localVault)) {
        console.debug('[getVault] found local vault, synchronizing with server');
        try {
            await decryptVault(localVault);
            localOk = true;
        } catch (err) {
            console.error(err);
        }

        if (localOk) {
            const res = await API.sendVault(localVault, false);

            // if cannot send vault, display error and retry button

            if (!res.data) {
                if (
                    res.err?.code !== WEB_CODES.VAULT_LOWER_VERSION &&
                    res.err?.code !== WEB_CODES.VAULT_OLDER_DATE
                ) {
                    return {
                        ok: false,
                        err: res.err ?? {
                            code: WEB_CODES.MISSING_DATA_AND_ERROR,
                            message: '[getVault] Missing data and error!',
                        },
                    };
                }
            } else {
                console.debug('[getVault] Synchronized local vault, deleting local storage');
                localStorage.removeItem(localStorageVaultKey);

                return {
                    ok: true,
                    data: {
                        code: WEB_CODES.VAULT_DECRYPTED,
                        message: '[getVault] Vault decrypted successfully',
                    },
                };
            }
            console.debug('[getVault] Deleting old local copy');
            localStorage.removeItem(localStorageVaultKey);
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
export async function sendVault(createNew = false): Promise<Result> {
    const maxTries = 3;
    const sleepTimer = 3000;

    for (let i = 1; i <= maxTries; i++) {
        const vault = await encryptVault();

        // save item before API call
        console.debug('[sendVault] Vault encrypted, saving in local storage');
        localStorage.setItem(localStorageVaultKey, JSON.stringify(vault));

        console.debug('[sendVault] Vault saved, sending to database');
        if (vault) {
            const res = await API.sendVault(vault, createNew);

            if (res.data) {
                console.debug('[sendVault] Vault sent to database');
                localStorage.removeItem(localStorageVaultKey);

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

export async function initializeVault(): Promise<Result> {
    const vaultIV = window.crypto.getRandomValues(new Uint8Array(16));

    const initialVault: VaultStore = {
        version: 1,
        lastModified: new Date(),
        IV: vaultIV,
        credentials: [],
    };

    vaultStore.commit(VAULT_M.SET_VAULT, initialVault);
    console.debug('[initializeVault] Initialized new vault');

    return sendVault(true);
}
