const TOKEN_KEY = "token";

export const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
}

export const getToken = () : string | null => {
    return localStorage.getItem(TOKEN_KEY);
}

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
}

export const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

export const getCurrentUsername = () : string | null => {
    const token = getToken();
    if (!token) return null;

    const payload = parseJwt(token);
    return payload?.sub ?? null;
}

export const isExpired = (token: string) : boolean => {
    const payload = parseJwt(token);
    if (!payload?.exp) return true;
    return payload.exp * 1000 < Date.now();
}

export const isAuthenticated = () : boolean => {
    const token = getToken();
    if (!token) return false;
    return !isExpired(token);
}
