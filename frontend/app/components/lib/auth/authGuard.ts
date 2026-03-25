import { useRouter } from "next/router";
import { isAuthenticated } from "./auth"
import { useEffect } from "react";

export const authGuard = () => {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
        router.push("/login");
    }
    }, [])
}