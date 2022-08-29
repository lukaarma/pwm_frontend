// Email, Master Password => crypto.subtle.deriveKey => Master Key
// Master Password, Master Key => crypto.subtle.deriveBits => Master Password Hash

const encoder = new TextEncoder();

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
