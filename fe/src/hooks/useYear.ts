import {type Year} from '../types';
import { useQuery, keepPreviousData} from "@tanstack/react-query";
import {fetchYears} from '../api/years'


export const useYear = () => {
        const { data: years = [] } = useQuery<Year[]>({
            queryKey: ["years"],
            queryFn: fetchYears,
            staleTime: 1000 * 60 * 5,
            placeholderData: keepPreviousData,
        });
    return years;
}