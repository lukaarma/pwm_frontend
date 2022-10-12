import API from '@/services/API';
import utils, { deriveMKeMPH, encryptSK } from '@/services/cryptoUtils';
import { sendVault } from '@/services/vault';
import { userStore } from '@/stores/userStore';
import type { Result } from '@/types';

export default async function (oldPSW: string, newPSW: string): Promise<Result> {
    const oldMasterPwdHash = await deriveMKeMPH(userStore.state.email, oldPSW).then(
        async ({ MPH }) => utils.toHex(await MPH)
    );
    const IV = window.crypto.getRandomValues(new Uint8Array(16));
    const SK = window.crypto.getRandomValues(new Uint8Array(32));

    return await deriveMKeMPH(userStore.state.email, newPSW)
        .then(async ({ MK, MPH }): Promise<Result> => {
            const res = await API.changePassword({
                oldMasterPwdHash,
                newMasterPwdHash: utils.toHex(await MPH),
                IV: utils.toHex(IV),
                PSK: utils.toHex(await encryptSK(IV, MK, SK)),
            });

            if (!res.data) {
                console.debug('[CHANGE PASSWORD] API call failed!');

                return {
                    ok: false,
                    err: res.err ?? {
                        code: 999,
                        message: 'Missing data and error!',
                    },
                };
            }

            userStore.commit(
                'setSecretKey',
                await window.crypto.subtle.importKey('raw', SK, 'AES-CBC', false, [
                    'encrypt',
                    'decrypt',
                ])
            );

            await sendVault();

            return {
                ok: true,
                data: res.data,
            };
        })
        .catch((err: Error) => {
            console.debug('[CHANGE PASSWORD] Caught error:');
            console.dir(err);

            return {
                ok: false,
                err: {
                    code: 999,
                    message: err.message,
                },
            };
        });
}
