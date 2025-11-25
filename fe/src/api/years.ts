import axios from "axios";
const token = localStorage.getItem("token");
export async function fetchYears() {
    const { data } = await axios.get(`http://localhost:8000/api/years`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    // console.log('fetchYears data:', data);
    return data.years;
}