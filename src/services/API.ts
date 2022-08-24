import axios from "axios";


const API = axios.create({
    baseURL: "https://dev.lukaarma.dynu.net/api",
});

// FIXME: move header in vuex store
async function login(user: { email: string, password: string }) {
    return API.post("/user/login", user).then((res) => {
        API.defaults.headers.common.authorization = res.headers.authorization;

        return true;
    }).catch(() => {
        return false;
    });
}

async function signup(user: { email: string, password: string, firstName: string, lastName: string }) {
    return API.post("/user/signup", user);
}


export default {
    login, signup
};
