import api from "@/app/components/lib/api";
import { PageResponse, ProjectCreateDTO, ProjectResponseDTO } from "../../types/types";

export const projectService = {
    getAllProjectsByUser: async (id: number) : Promise<ProjectResponseDTO[]> => {
        const res = await api.get(`/projects/user/${id}`);
        return res.data;
    },

    getById: async (id: number) : Promise<ProjectResponseDTO> => {
        const res = await api.get(`/projects/${id}`);
        return res.data;
    },

    createProject: async (project: ProjectCreateDTO) : Promise<ProjectResponseDTO> => {
        const res = await api.post("/projects", project);
        return res.data;
    },

    assignUserToProject: async (projectId: number, userId: number, role?: string) : Promise<string> => {
        const res = await api.post(`/projects/${projectId}/assign/${userId}`, null, {
            params: {
                role: role ?? "EDITOR"
            }
        }  );
        return res.data;
    },

    removeUserFromProject: async (projectId: number, userId: number) : Promise<string> => {
        const res = await api.delete(`/projects/${projectId}/remove/${userId}`);
        return res.data;
    },

    deleteProject: async (id: number) : Promise<string> => {
        const res = await api.delete(`/projects/${id}`);
        return res.data;
    },

    searchProjectNavbar: async (query: string, pageNum: number, pageSize: number) : Promise<PageResponse<ProjectResponseDTO>> => {
        const response = await api.get<PageResponse<ProjectResponseDTO>>("/projects/search", {
                    params: {
                        search: query,
                        pageNum: pageNum,
                        pageSize: pageSize,
                    },
                });
        return response.data;
    }
}