import {
    useQuery,
    keepPreviousData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { type Users } from "../types/index";
import {
    fetchAllUsers,
    deleteUsers,
    updateUsers,
    addUsers,
    fetchProfile,
} from "../api/users";

export const useUser = () => {
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();
    const { data: users } = useQuery<Users[]>({
        queryKey: ["users"],
        queryFn: fetchAllUsers,
        staleTime: 6 * 1000 * 5,
        placeholderData: keepPreviousData,
    });

    const { data: user } = useQuery<Users>({
        queryKey: ["user"],
        queryFn: () => fetchProfile(token ?? ""),
        staleTime: 6 * 1000 * 5,
        placeholderData: keepPreviousData,
    });

    const addUserMutation = useMutation({
        mutationFn: addUsers,
        onSuccess: () => {
            toast.success("Thêm người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => {
            toast.error("Lỗi khi thêm người dùng");
        },
    });
    const updateUserMutaion = useMutation({
        mutationFn: updateUsers,
        onSuccess: () => {
            toast.success("Cập nhật người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => {
            toast.error("Lỗi khi cập nhật người dùng");
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: deleteUsers,
        onSuccess: () => {
            toast.success("Xoá người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: () => {
            toast.success("Lỗi khi Xoá người dùng ");
        },
    });

    return {
        user,
        users,
        deleteUserMutation,
        updateUserMutaion,
        addUserMutation,
    };
};
