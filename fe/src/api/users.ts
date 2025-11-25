import axios from "axios";
import { type Users } from "../types/index";
export async function fetchProfile(token: string) {
    const { data } = await axios.get(`http://localhost:8000/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log("fetchUsers data:", data);
    return data;
}

export async function fetchAllUsers() {
    const { data } = await axios.get(`http://localhost:8000/api/get-all-users`);
    // console.log("fetchAllUsers data 1:", data.user);
    return data.user;
}

export async function deleteUsers(userId: number) {
    const { data } = await axios.delete(
        `http://localhost:8000/api/delete-user/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    // console.log("fetchAllUsers data:", data);
    return data.user;
}

export async function updateUsers(updatedUser: Users) {
    const { data } = await axios.put(
        `http://localhost:8000/api/update-user/${updatedUser.id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    // console.log("fetchAllUsers data:", data);
    return data.user;
}

export async function addUsers(newUser: Users) {
    const { data } = await axios.post(
        `http://localhost:8000/api/api/add-user`,
        newUser,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    // console.log("fetchAllUsers data:", data);
    return data.user;
}
