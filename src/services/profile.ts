import API from './API';
import { userStore } from '@/stores/userStore';
import { WEB_CODES } from '@/types';
import type { Result, UpdateProfileBody } from '@/types';

export async function updateUserInfo(user: UpdateProfileBody): Promise<Result> {
    const res = await API.updateUserInfo(user);

    if (res.data) {
        userStore.commit('setUserInfo', res.data);

        return {
            ok: true,
            data: {
                code: WEB_CODES.USERINFO_SAVED_SUCCESS,
                message: 'Profile updated successfully',
            },
        };
    } else {
        return {
            ok: false,
            err: res.err ?? {
                code: WEB_CODES.MISSING_DATA_AND_ERROR,
                message: '[updateUserInfo] Missing data and error!',
            },
        };
    }
}
