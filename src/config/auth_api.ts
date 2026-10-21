import axios from 'axios';
import apiOrigin from '../constants/api_origin';

/** Better Auth (sign in, sign up, passwords, accounts on this browser). The session is an httpOnly cookie. */
const authApi = axios.create({ baseURL: `${apiOrigin}/api/auth`, withCredentials: true });

export default authApi;
