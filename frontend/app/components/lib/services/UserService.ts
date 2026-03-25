import api from "@/app/components/lib/api";
import { PageResponse, UserCreateDTO, UserResponseDTO, UserUpdateDTO } from "../../types/types";

export const userService = {

    getAll: async () : Promise<UserResponseDTO[]> => {
        const res = await api.get("/users");
        return res.data;
    },

    getById: async (id: number) : Promise<UserResponseDTO> => {
        const res = await api.get(`/users/${id}`);
        return res.data;
    },

    register: async (user: UserCreateDTO) : Promise<UserResponseDTO> => {
        const res = await api.post("/users/register", user);
        return res.data;
    },

    updateUser: async (id: number, user: UserUpdateDTO) : Promise<UserResponseDTO> => {
        const res = await api.put(`/users/${id}`, user);
        return res.data;
    },

    deleteUser: async (id: number) : Promise<string> => {
       const res = await api.delete(`/users/${id}`);
       return res.data;
    },

    searchUserNavbar: async (query: string, pageNum: number, pageSize: number) : Promise<PageResponse<UserResponseDTO>> => {
        const response = await api.get<PageResponse<UserResponseDTO>>("/users/search", {
                    params: {
                        search: query,
                        pageNum: pageNum,
                        pageSize: pageSize,
                    },
                });
        return response.data;
    }

}