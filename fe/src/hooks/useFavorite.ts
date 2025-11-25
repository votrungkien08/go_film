import {
    useQuery,
    keepPreviousData,
    useQueryClient,
    useMutation,
    type UseMutationResult,
} from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
    fetchCheckFavorites,
    // fetchCountFavorites,
    removeFavorite,
    addFavorite,
    fetchFavoriteList,
} from "../api/favorite";
import { type Film } from "@/types";
interface FavoriteData {
    isFavorite: boolean;
    handleToggleFavorite: () => Promise<void>;
    likeCount: number;
    removeFavoriteMutation: UseMutationResult<boolean, Error, number>;
    favoriteList: Film[];
    isLoadingFavoriteList: boolean;
}
export const useFavorite = (
    filmId: number,
    isLoggedIn: boolean
): FavoriteData => {
    const [likeCount, setLikeCount] = useState(0);
    const queryClient = useQueryClient();
    // fetch favorite list
    const { data: favoriteList, isLoading: isLoadingFavoriteList } = useQuery({
        queryKey: ["favoriteList"],
        queryFn: fetchFavoriteList,
        staleTime: 6 * 1000 * 5,
        placeholderData: keepPreviousData,
    });
    // check favorite
    const { data: checkFavoriteData } = useQuery({
        queryKey: ["checkFavorite", filmId],
        queryFn: () => fetchCheckFavorites(filmId),
        refetchOnMount: true,
        enabled: !!filmId && isLoggedIn,
        staleTime: 0,
        placeholderData: keepPreviousData,
    });
    const isFavorite = checkFavoriteData?.favorite ?? false;

    // const { data: countFavorite = 0 } = useQuery({
    //     queryKey: ["countFavorite", filmId],
    //     queryFn: () => fetchCountFavorites(filmId!),
    //     enabled: !!filmId,
    //     staleTime: 1000 * 60 * 5,
    //     placeholderData: keepPreviousData,
    // });

    const addFavoriteMutation = useMutation({
        mutationFn: addFavorite,
        onSuccess: () => {
            queryClient.setQueryData(["checkFavorite", filmId], true);
            queryClient.invalidateQueries({
                queryKey: ["checkFavorite", filmId],
            });
            queryClient.invalidateQueries({
                queryKey: ["favoriteList"],
            });
            toast.success("Đã thêm vào danh sách yêu thích!");
        },
        onError: () => {
            toast.error("Thêm yêu thích thất bại!");
        },
    });
    const removeFavoriteMutation = useMutation({
        mutationFn: removeFavorite,
        onSuccess: () => {
            queryClient.setQueryData(["checkFavorite", filmId], false);
            queryClient.invalidateQueries({
                queryKey: ["checkFavorite", filmId],
            });
            queryClient.invalidateQueries({
                queryKey: ["favoriteList"],
            });
            toast.success("Đã xóa khỏi danh sách yêu thích!");
        },
        onError: () => {
            toast.error("Xoá yêu thích thất bại");
        },
    });

    const handleToggleFavorite = useCallback(async () => {
        if (!isLoggedIn) {
            toast.error("Vui lòng đăng nhập để thêm yêu thích.");
            return;
        }

        try {
            if (isFavorite) {
                removeFavoriteMutation.mutate(filmId);
            } else {
                addFavoriteMutation.mutate(filmId);
            }
            console.log("isFavorite", isFavorite);
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    "Có lỗi xảy ra khi cập nhật danh sách yêu thích."
            );
        }
    }, [isFavorite, filmId, isLoggedIn]);

    return {
        isFavorite,
        likeCount,
        handleToggleFavorite,
        removeFavoriteMutation,
        favoriteList,
        isLoadingFavoriteList,
    };
};
