import { useEffect,useState,useCallback } from "react";
import axios from "axios"; 
import { toast } from "react-toastify";
import {Users} from '../types/index';


export const useUser = () => {
    // const [users,setUsers] = useState<Users[]>([]);
    const [allUsers,setAllUsers] = useState<Users[]>([]);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/get-all-users')
                console.log('user ne', response.data.user);
                setAllUsers(response.data.user)
            } catch (err: any) {
                console.error("Lỗi khi lấy danh sách user:", err);
                toast.error("Lỗi khi lấy danh sách user");
            }
        }

        fetchUsers();
        
    },[])



    return {allUsers};
}