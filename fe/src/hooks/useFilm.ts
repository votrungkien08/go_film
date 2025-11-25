import { type Film } from "../types";
import {
    useQuery,
    keepPreviousData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    fetchFilmBySlug,
    addFilm,
    updateFilm,
    deleteFilm,
    fetchFilms,
    fetchNominateFilms,
    fetchUpdateFilms,
    fetchRankFilms,
    fetchfilterAdvanceFilm,
    fetchTheaterFilms,
} from "../api/films";
import { toast } from "sonner";
export const useFilmBySlug = (slug: string) => {
    const { data: film } = useQuery<Film>({
        queryKey: ["film", slug],
        queryFn: () => fetchFilmBySlug(slug),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
        enabled: !!slug,
    });

    return { film };
};
// fetch all film
export const useFilm = () => {
    const { data: films = [] } = useQuery<Film[]>({
        queryKey: ["films"],
        queryFn: fetchFilms,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return films;
};
// fetch list film nominate
export const useFilmNominate = () => {
    const { data: nominateFilms = [], isLoading: isLoadingNominate } = useQuery<
        Film[]
    >({
        queryKey: ["nominateFilms"],
        queryFn: fetchNominateFilms,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return { nominateFilms, isLoadingNominate };
};
// fetch list film new update
export const useFilmUpdate = () => {
    const { data: updateFilm = [], isLoading } = useQuery<Film[]>({
        queryKey: ["updateFilm"],
        queryFn: fetchUpdateFilms,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return { updateFilm, isLoading };
};
// fetch list film top rank
export const useFilmRank = () => {
    const { data: rankFilm = [], isLoading } = useQuery<Film[]>({
        queryKey: ["rankFilms"],
        queryFn: fetchRankFilms,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return { rankFilm, isLoading };
};
// fetch list film theater
export const useFilmTheater = () => {
    const { data: theaterFilm = [], isLoading } = useQuery<Film[]>({
        queryKey: ["theaterFilm"],
        queryFn: fetchTheaterFilms,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return { theaterFilm, isLoading };
};
// filter film
export const useFilterAdvanceFilm = (params: Record<string, string>) => {
    const { data: filterAdvanceFilm = [], isLoading } = useQuery<Film[]>({
        queryKey: ["filterAdvanceFilm", params],
        queryFn: () => fetchfilterAdvanceFilm(params),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return { filterAdvanceFilm, isLoading };
};

// CRUD
export const useFilmMutation = () => {
    const queryClient = useQueryClient();
    const addFilmMutation = useMutation({
        mutationFn: addFilm,
        onSuccess: () => {
            toast.success("Thêm phim thành công!");
            queryClient.invalidateQueries({ queryKey: ["films"] });
        },
        onError: () => {
            toast.error("Lỗi khi thêm phim");
        },
    });
    const updateFilmMutation = useMutation({
        mutationFn: updateFilm,
        onSuccess: () => {
            toast.success("Cập nhật phim thành công!");
            queryClient.invalidateQueries({ queryKey: ["films"] });
        },
        onError: () => {
            toast.error("Lỗi khi cập nhật phim");
        },
    });
    const deleteFilmMutation = useMutation({
        mutationFn: deleteFilm,
        onSuccess: () => {
            toast.success("Xoá phim thành công");
            queryClient.invalidateQueries({ queryKey: ["films"] });
        },
        onError: () => {
            toast.error("Lôi khi xoá phim");
        },
    });

    return { addFilmMutation, updateFilmMutation, deleteFilmMutation };
};
