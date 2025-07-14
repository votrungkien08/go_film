import { useEffect,useState,useCallback } from "react";
import axios from "axios"; 
import { toast } from "react-toastify";
import {Users} from '../types/index';


export const useUser = () => {
    // const [users,setUsers] = useState<Users[]>([]);
    const [allUsers,setAllUsers] = useState<Users[]>([]);
    const fetchUsers = useCallback(async () => {
        try {
        const response = await axios.get('http://localhost:8000/api/get-all-users');
        setAllUsers(response.data.user);
        } catch (err) {
        console.error("Lỗi khi lấy danh sách user:", err);
        toast.error("Lỗi khi lấy danh sách user");
        }
    }, []);
    useEffect(() => {
        console.log("useUser hook mounted");
        fetchUsers();
    },[fetchUsers])
    const handleDeleteUser = useCallback(async (userId: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/delete-user/${userId}`,{
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Xóa người dùng thành công");
            // setAllUsers(prev => prev.filter(user => user.id !== userId));
            await fetchUsers(); // Cập nhật lại danh sách người dùng sau khi xóa
        } catch (err: any) {
            console.error("Lỗi khi xóa người dùng:", err);
            toast.error("Lỗi khi xóa người dùng");
        }
    }, [fetchUsers]);


    const handleUpdateUser = useCallback(async (updatedUser: Users) => {
        try {
        await axios.put(
            `http://localhost:8000/api/update-user/${updatedUser.id}`,
            updatedUser,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success("Cập nhật người dùng thành công");
        await fetchUsers(); // ✅ GỌI LẠI
        } catch (err) {
        toast.error("Lỗi khi cập nhật người dùng");
        }
    }, [fetchUsers]);

    const handleAddUser = useCallback(async (newUser: Users) => {
        try {
            await axios.post(
                `http://localhost:8000/api/add-user`,
                newUser,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success("Thêm người dùng thành công");
            await fetchUsers(); // ✅ GỌI LẠI
        } catch (err) {
            toast.error("Lỗi khi thêm người dùng");
        }
    }, [fetchUsers]);

    return {allUsers,handleDeleteUser,handleUpdateUser,handleAddUser};
}