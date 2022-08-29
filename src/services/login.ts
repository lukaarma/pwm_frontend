import API from './API';
import utils, { deriveMKeMPH, decryptPSK } from './cryptoUtils';
import { userStore } from '@/stores/userStore';
import type { Result } from '@/types';

export default async function (email: string, password: string): Promise<Result> {
    console.debug('[LOGIN] Start login sequence');

    return await deriveMKeMPH(email, password)
        .then(async ({ MK, MPH }) => {
            // wait MPH then login
            return await MPH.then(async (masterPwdHash): Promise<Result> => {
                console.debug('[LOGIN] Got MPH, retrieving PSK and IV');

                const res = await API.login({
                    email,
                    masterPwdHash: utils.toHex(masterPwdHash),
                });

                if (!res.data) {
                    return {
                        ok: false,
                        err: res.err ?? {
                            code: 999,
                            message: 'Missing data and error!',
                        },
                    };
                }

                console.debug('[LOGIN] API call success, got name, PSK and IV. Now decrypting...');

                userStore.commit('setFirstName', res.data.firstName);

                userStore.commit('setSecretKey', await decryptPSK(res.data.IV, MK, res.data.PSK));
                console.debug('[LOGIN] Decrypted PSK, saved SecretKey in userStore');

                return {
                    ok: true,
                };
            });
        })
        .catch((err: Error) => {
            console.debug('[LOGIN] Caught error:');
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
