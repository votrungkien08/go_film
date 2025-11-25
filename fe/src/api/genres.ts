import axios from "axios";

const token = localStorage.getItem("token");
export async function fetchGenres() {
    const { data } = await axios.get(`http://localhost:8000/api/genres`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    // console.log('fetchGenres data:', data);
    return data.genres;
}