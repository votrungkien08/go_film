import {
    useQuery,
    keepPreviousData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { type Rating } from "@/types";
import { postRating, fetchRatings, fetchUserRating } from "@/api/rating";
// interface RatingData {
//     rating: number | null;
//     setRating: (rating: number | null) => void;
//     showRating: Rating[];
//     averageRating: number;
//     handlePostRating: () => Promise<void>;
// }
export const useFetchRatings = (filmId: number) => {
    const { data } = useQuery<Rating>({
        queryKey: ["ratings", filmId],
        queryFn: () => fetchRatings(filmId),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
        enabled: !!filmId,
    });

    return data;
};
export const useFetchUserRating = (filmId: number) => {
    const { data } = useQuery<Rating>({
        queryKey: ["userRating", filmId],
        queryFn: () => fetchUserRating(filmId),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
        enabled: !!filmId,
    });
    return data;
};
export const useRatingMutation = () => {
    const queryCilent = useQueryClient();
    const addRating = useMutation({
        mutationFn: postRating,
        onSuccess: () => {
            queryCilent.invalidateQueries({ queryKey: ["ratings"] });
            queryCilent.invalidateQueries({ queryKey: ["userRating"] });
            toast.success("Đánh giá thành công");
        },

        onError: () => {
            toast.error("Đánh giá thất bại");
        },
    });
    return { addRating };
};
// export const useRating = (
//     filmId: number | undefined,
//     isLoggedIn: boolean
// ): RatingData => {
//     const [rating, setRating] = useState<number | null>(null);
//     const [showRating, setShowRating] = useState<Rating[]>([]);
//     const [averageRating, setAverageRating] = useState<number>(0);

//     const fetchRatings = useCallback(async () => {
//         if (!filmId) return;
//         try {
//             const response = await fetch(
//                 `http://localhost:8000/api/film/getRating/${filmId}`
//             );
//             const data = await response.json();
//             if (data.rating) {
//                 setShowRating(data.rating);
//                 const total = data.rating.reduce(
//                     (sum: number, r: Rating) => sum + r.rating,
//                     0
//                 );
//                 const avg = data.rating.length ? total / data.rating.length : 0;
//                 setAverageRating(avg);
//             }
//         } catch (err: any) {
//             console.error("Lỗi khi lấy danh sách đánh giá:", err.message);
//         }
//     }, [filmId]);

//     return { rating, setRating, showRating, averageRating, handlePostRating };
// };
