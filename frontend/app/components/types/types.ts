export interface ProjectCreateDTO {
    projectName: string;
    projectDesc: string;
}

export interface ProjectResponseDTO {
    projectId: number;
    projectName: string;
    projectDesc: string;
    users: ProjectUserResponseDTO[];
    files: FileResponseDTO[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectUserResponseDTO {
    userId: number;
    username: string;
    userRole: string;
}

export interface FileResponseDTO {
    fileId: number;
    fileName: string;
    parentProject: FileProjectResponseDTO;
    fileVersions: FileVersionResponseDTO[];
    createdAt: string;
    updatedAt: string;
}

export interface FileProjectResponseDTO {
    projectId: number;
    projectName: string;
    projectDesc: string;
    createdAt: string;
    updatedAt: string;
}

export interface FileVersionResponseDTO {
    versionId: number;
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserResponseDTO {
    userId: number;
    username: string;
    roles: string[];
    projects: UserProjectResponseDTO[];
    createdAt: string;
    updatedAt: string;
}

export interface UserProjectResponseDTO {
    projectId: number;
    projectName: string;
    userRole: string;
}

export interface UserUpdateDTO {
    username?: string;
    roles?: string[];
}

export interface UserCreateDTO {
    username: string;
    password: string;
    roles: string[];
}

export interface UserLoginDTO {
    username: string;
    password: string;
}

export interface DiffLineDTO {
    type: string,
    sourcePos: number,
    targetPost: number,
    source: string[],
    target: string[]
}

export interface DiffResponseDTO {
    original: string[];
    updated: string[];
    diff: DiffLineDTO[];
}

export interface PageResponse<T> {
    content: T[];
    pageNum: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}