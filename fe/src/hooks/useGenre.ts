import {fetchGenres} from '../api/genres'

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {type Genre} from "@/types";

export const useGenre = () => {
    const { data: genres = [] } = useQuery<Genre[]>({
        queryKey: ["genres"],
        queryFn: fetchGenres,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
    return genres;
}