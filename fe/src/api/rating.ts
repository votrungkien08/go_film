import axios from "axios";

export async function postRating({
    film_id,
    rating,
}: {
    film_id: number;
    rating: number;
}) {
    const { data } = await axios.post(
        `http://localhost:8000/api/film/postRating`,
        { film_id, rating },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return data;
}

export async function fetchUserRating(film_id: number) {
    const { data } = await axios.get(
        `http://localhost:8000/api/film/rating/${film_id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return data;
}
export async function fetchRatings(film_id: number) {
    const { data } = await axios.get(
        `http://localhost:8000/api/film/getRating/${film_id}`
    );
    return data;
}
