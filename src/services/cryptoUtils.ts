import base64 from 'base64-js';

import { VAULT_M, vaultStore } from '@/stores/vaultStore';
import { userStore } from '@/stores/userStore';
import type { VaultBody } from '@/types';

// TODO: better error handling

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function deriveMKeMPH(email: string, password: string) {
    // transform string to Uint8Array
    const emailArray = encoder.encode(email);
    const passwordArray = encoder.encode(password);
    /* length in bit of MPH,  since we do Bcrypt in the backend and the maximum
    input size 72 Bytes (576 bit) */
    const MPHLength = 576;
    const MKConfig: Pbkdf2Params = {
        name: 'PBKDF2',
        hash: 'SHA-512',
        salt: emailArray,
        iterations: 120000,
    };
    const MKFormat: AesDerivedKeyParams = {
        name: 'AES-CBC',
        length: 256,
    };
    const MPHConfig: Pbkdf2Params = {
        name: 'PBKDF2',
        hash: 'SHA-512',
        salt: passwordArray,
        iterations: 1,
    };

    const masterKey = await window.crypto.subtle.deriveKey(
        MKConfig,
        await window.crypto.subtle.importKey('raw', passwordArray, 'PBKDF2', false, [
            'deriveBits',
            'deriveKey',
        ]),
        MKFormat,
        // needed to export/import to generate MPH
        true,
        // wrapKey/unwrapKey => to protect the SymmetricKey
        // derivekey => derive Master Password Hash
        ['wrapKey', 'unwrapKey']
    );

    const masterPwdHash = window.crypto.subtle.deriveBits(
        MPHConfig,
        await window.crypto.subtle.importKey(
            'raw',
            await window.crypto.subtle.exportKey('raw', masterKey),
            'PBKDF2',
            false,
            ['deriveBits']
        ),
        MPHLength
    );

    return {
        MK: masterKey,
        MPH: masterPwdHash,
    };
}

export async function decryptPSK(IVhex: string, masterKey: CryptoKey, PSKhex: string) {
    const IV = fromHex(IVhex);
    const PSK = fromHex(PSKhex);

    return window.crypto.subtle.unwrapKey(
        'raw',
        PSK,
        masterKey,
        {
            name: 'AES-CBC',
            iv: IV,
        },
        {
            name: 'AES-CBC',
        },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptSK(IV: Uint8Array, masterKey: CryptoKey, SKArray: Uint8Array) {
    return window.crypto.subtle.wrapKey(
        'raw',
        await window.crypto.subtle.importKey('raw', SKArray, 'AES-CBC', true, []),
        masterKey,
        {
            name: 'AES-CBC',
            iv: IV,
        }
    );
}

export async function decryptVault(encryptedVault: VaultBody): Promise<boolean> {
    vaultStore.commit(VAULT_M.SET_VAULT, {
        version: encryptedVault.version,
        lastModified: encryptedVault.lastModified,
        IV: fromHex(encryptedVault.IV),
    });

    if (userStore.state.secretKey) {
        const decryptedData: ArrayBuffer = await window.crypto.subtle
            .decrypt(
                {
                    name: 'AES-CBC',
                    iv: vaultStore.state.IV,
                },
                userStore.state.secretKey,
                base64.toByteArray(encryptedVault.data)
            )
            .catch((err) => {
                console.error(err);

                return new Uint8Array(0);
            });

        try {
            vaultStore.commit(VAULT_M.SET_VAULT, {
                credentials: JSON.parse(decoder.decode(decryptedData)),
            });

            return true;
        } catch (error) {
            console.debug('[DECRYPT_VAULT] Error while decrypting JSON data!');

            return false;
        }
    } else {
        console.debug('[DECRYPT_VAULT] No Symmetric Key present!');

        return false;
    }
}

export async function encryptVault(): Promise<VaultBody | null> {
    if (userStore.state.secretKey) {
        const encrypted: ArrayBuffer = await window.crypto.subtle
            .encrypt(
                {
                    name: 'AES-CBC',
                    iv: vaultStore.state.IV,
                },
                userStore.state.secretKey,
                encoder.encode(JSON.stringify(vaultStore.state.credentials))
            )
            .catch((err) => {
                console.error(err);

                return new Uint8Array(0);
            });

        return {
            version: vaultStore.state.version,
            lastModified: vaultStore.state.lastModified,
            IV: toHex(vaultStore.state.IV),
            data: base64.fromByteArray(new Uint8Array(encrypted)),
        };
    } else {
        console.debug('[ENCRYPT_VAULT] No Symmetric Key present!');

        return null;
    }
}

export async function hashCredential(credential: string): Promise<string> {
    return toHex(await crypto.subtle.digest('SHA-1', encoder.encode(credential)));
}

export async function exportVault(
    password: string,
    date: string
): Promise<{ IV: string; data: string }> {
    const key = await deriveExportKey(password, date);
    const IV = window.crypto.getRandomValues(new Uint8Array(16));

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: IV,
        },
        key,
        encoder.encode(JSON.stringify(vaultStore.state.credentials))
    );

    return {
        IV: toHex(IV),
        data: base64.fromByteArray(new Uint8Array(encrypted)),
    };
}

async function deriveExportKey(password: string, date: string): Promise<CryptoKey> {
    const keyConfig: Pbkdf2Params = {
        name: 'PBKDF2',
        hash: 'SHA-512',
        salt: encoder.encode(date),
        iterations: 120000,
    };
    const keyFormat: AesDerivedKeyParams = {
        name: 'AES-CBC',
        length: 256,
    };

    return window.crypto.subtle.deriveKey(
        keyConfig,
        await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
            'deriveBits',
            'deriveKey',
        ]),
        keyFormat,
        false,
        ['encrypt', 'decrypt']
    );
}

function fromHex(hexString: string) {
    const match = hexString.match(/.{1,2}/g);

    if (match) {
        return Uint8Array.from(match.map((byte) => parseInt(byte, 16)));
    }

    throw new TypeError('[fromHex] hexString must be a valid string encoded in base 16');
}

function toHex(buffer: ArrayBuffer | Uint8Array) {
    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }

    // ugly trick to calm Typescript
    if (buffer instanceof Uint8Array) {
        let result = '';
        // it's always Uint8Array disregard error
        for (const byte of buffer) {
            result += byte.toString(16).padStart(2, '0');
        }

        return result;
    }

    throw new TypeError('[toHex] buffer was not a valid iterable');
}

export default { fromHex, toHex };
