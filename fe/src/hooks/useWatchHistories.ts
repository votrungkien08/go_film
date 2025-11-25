import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { type WatchHistories } from "../types";
import { toast } from "sonner";
import { fetchHistories, storeHistory } from "../api/histories";
export const useWatchHistories = (
    episodeId: number | undefined,
    videoRef: React.RefObject<HTMLVideoElement>,
    setCurrentTime?: (time: number) => void,
    isRestoringProgressRef?: React.MutableRefObject<boolean>,
    shouldRestoreTimeRef?: React.MutableRefObject<boolean>
) => {
    const token = localStorage.getItem("token");
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { data: watchHistories = [], isLoading: isLoadingHistories } =
        useQuery({
            queryKey: ["fetchHistories"],
            queryFn: fetchHistories,
            enabled: !!token,
            placeholderData: keepPreviousData,
            staleTime: 0,
        });
    const addHistory = useMutation({
        mutationFn: ({
            episodeId,
            progress_time,
        }: {
            episodeId: number;
            progress_time: number;
        }) => storeHistory(episodeId, progress_time),
        onSuccess: () => {
            toast.success("Lưu lịch sử phim thành công");
        },
        onError: () => {
            toast.error("Lưu lịch sử phim thất bại");
        },
    });
    const handleTimeUpdate = async () => {
        try {
            if (!videoRef.current || !episodeId) return;

            const currentTime = Math.floor(videoRef.current.currentTime);
            if (currentTime <= 0) return;

            // Luôn cập nhật thanh tiến trình (dù có đăng nhập hay không)
            if (setCurrentTime) setCurrentTime(currentTime);

            // Chỉ lưu vào database khi có token
            if (!token) return;

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(async () => {
                addHistory.mutate({
                    episodeId: episodeId,
                    progress_time: currentTime,
                });
            }, 1000);
        } catch (err: any) {
            console.error("Error in handleTimeUpdate:", err);
            if (token) {
                toast.error(
                    err.response?.data?.message ||
                        "Có lỗi xảy ra khi lưu lịch sử xem phim"
                );
            }
        }
    };

    // useEffect(() => {
    //     const fetchWatchHistories = async () => {
    //         if (!token) return;
    //         try {
    //             const response = await axios.get(
    //                 "http://localhost:8000/api/watch-histories",
    //                 {
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );
    //             console.log("Watch histories:", response.data);
    //         } catch (err: any) {
    //             console.error(
    //                 "Error fetching watch histories:",
    //                 err.response?.data || err.message
    //             );
    //             toast.error("Có lỗi xảy ra khi lấy danh sách xem phim");
    //         }
    //     };

    //     fetchWatchHistories();
    // }, [token, selectedEpisode?.id]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && episodeId) {
            video.pause();

            const setProgress = () => {
                if (!token) {
                    // Nếu không có token, đặt về 0
                    video.currentTime = 0;
                    if (setCurrentTime) setCurrentTime(0);
                    return;
                }

                const currentHistory = watchHistories.find(
                    (item) => item.episodes_id === episodeId
                );

                if (currentHistory && currentHistory.progress_time > 0) {
                    if (isRestoringProgressRef)
                        isRestoringProgressRef.current = true;

                    console.log(
                        "Khôi phục thời gian từ lịch sử:",
                        currentHistory.progress_time
                    );
                    video.currentTime = currentHistory.progress_time;
                    if (setCurrentTime)
                        setCurrentTime(currentHistory.progress_time);

                    video.addEventListener(
                        "seeked",
                        () => {
                            console.log("Seeked to", video.currentTime);
                            if (isRestoringProgressRef)
                                isRestoringProgressRef.current = false;
                        },
                        { once: true }
                    );
                } else {
                    // Nếu không có lịch sử xem cho tập hiện tại, đặt về 0
                    console.log("Không tìm thấy lịch sử, đặt thời gian về 0");
                    video.currentTime = 0;
                    if (setCurrentTime) setCurrentTime(0);
                    if (isRestoringProgressRef)
                        isRestoringProgressRef.current = false;
                }

                setTimeout(() => {
                    if (isRestoringProgressRef)
                        isRestoringProgressRef.current = false;
                }, 1000);
            };

            if (video.readyState >= 3) {
                setProgress();
            } else {
                video.addEventListener("loadedmetadata", setProgress, {
                    once: true,
                });
            }

            video.addEventListener("timeupdate", handleTimeUpdate);
            return () => {
                video.removeEventListener("timeupdate", handleTimeUpdate);
                video.removeEventListener("loadedmetadata", setProgress);
            };
        }
    }, [episodeId, videoRef, setCurrentTime, isRestoringProgressRef, token]);

    return { watchHistories, handleTimeUpdate };
};
