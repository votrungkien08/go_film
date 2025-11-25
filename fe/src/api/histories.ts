import axios from "axios";

export async function storeHistory(episodes_id: number, progress_time: number) {
    const { data } = await axios.post(
        "http://localhost:8000/api/store-histories",
        {
            episodes_id,
            progress_time,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );

    return data;
}
export async function fetchHistories() {
    const { data } = await axios.get(
        "http://localhost:8000/api/watch-histories",
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );

    return data;
}
export async function deleteHistory(historyId: number) {
    const { data } = await axios.delete(
        `http://localhost:8000/api/watch-histories/${historyId}`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return data;
}
