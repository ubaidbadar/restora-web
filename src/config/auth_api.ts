import axios from 'axios';

/** Better Auth (sign in, sign up, passwords, accounts on this browser). The session is an httpOnly cookie. */
const authApi = axios.create({ baseURL: '/api/auth', withCredentials: true });

export default authApi;
