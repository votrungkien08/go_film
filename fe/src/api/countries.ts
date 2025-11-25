import axios from "axios";
const token = localStorage.getItem('token');
export async function fetchCountries() {
    const { data } = await axios.get(`http://localhost:8000/api/countries`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return data.country;
}