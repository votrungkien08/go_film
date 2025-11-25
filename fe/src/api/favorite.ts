import axios from "axios";

//delete favorite
export async function removeFavorite(filmId: number) {
    const { data } = await axios.delete(
        `http://localhost:8000/api/favorites/${filmId}`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return data;
}
// add favorite
export async function addFavorite(filmId: number) {
    const { data } = await axios.post(
        "http://localhost:8000/api/addFavorite",
        { film_id: filmId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return data;
}
// check favorite added
export async function fetchCheckFavorites(filmId: number) {
    const { data } = await axios.get(
        `http://localhost:8000/api/film/${filmId}/favorite`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    console.log("fetchFavorites data:", data);
    return data;
}
// get quatity favorite
// export async function fetchCountFavorites(filmId: number) {
//     const { data } = await axios.get(
//         `http://localhost:8000/api/favorite-film/${filmId}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//         }
//     );
//     console.log("fetchCountFavorites data:", data);
//     return data;
// }
// fetch list favorite
export async function fetchFavoriteList() {
    const { data } = await axios.get("http://localhost:8000/api/favorites", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return data.favorites;
}
