import api from "../api";
import { DiffLineDTO, DiffResponseDTO, FileResponseDTO } from "../../types/types";

export const fileService = {
    getAllFilesByProject: async (projectId: number) : Promise<FileResponseDTO[]> => {
        const res = await api.get(`/projects/${projectId}/files`);
        return res.data;
    },

    getFileById: async (projectId: number, fileId: number) : Promise<FileResponseDTO> => {
        const res = await api.get(`/projects/${projectId}/files/${fileId}`);
        return res.data;
    },

    uploadFile: async (projectId: number, file: File) : Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post(`/projects/${projectId}/files/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },

    generateFileDiff: async (projectId: number, fileId: number) : Promise<DiffResponseDTO> => {
        const res = await api.get(`/projects/${projectId}/files/${fileId}/diff`);
        return res.data;
    },

    deleteFile: async (projectId: number, fileId: number) : Promise<string> => {
        const res = await api.delete(`/projects/${projectId}/files/${fileId}/delete`);
        return res.data;
    },


    downloadFile: async (projectId: number, fileId: number) : Promise<Blob> => {
        const res = await api.get(`/projects/${projectId}/files/${fileId}/download`, {
            responseType: "blob",
        });
        return res.data;
    }

}
