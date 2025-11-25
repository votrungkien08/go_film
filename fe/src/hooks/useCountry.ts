import {type Country} from '../types';
import {fetchCountries} from '../api/countries'
import { useQuery, keepPreviousData} from "@tanstack/react-query";


export const useCountry = () => {
        const { data: countries = [] } = useQuery<Country[]>({
            queryKey: ["countries"],
            queryFn: fetchCountries,
            staleTime: 1000 * 60 * 5,
            placeholderData: keepPreviousData,
        });
    return countries
}