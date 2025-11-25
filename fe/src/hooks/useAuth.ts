import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/api/users.ts";

export const useAuth = () => {
    const token = localStorage.getItem("token");
    const { data: user } = useQuery({
        queryKey: ["checkLogin"],
        queryFn: () => fetchProfile(token ?? ""),
        enabled: !!token,
    });

    const isLogin = !!user && !!token;
    const logout = () => {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("logoutSuccess"));
    };

    return { isLogin, user, logout };
};
