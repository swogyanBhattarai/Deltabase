import api from "../api";
import { UserLoginDTO } from "../../types/types";
import { setToken } from "../auth/auth";

export const authService = {

    login: async(credentials: UserLoginDTO) : Promise<string> => {
        const res = await api.post("/auth/login", credentials);
        setToken(res.data);
        return res.data;
    }

}