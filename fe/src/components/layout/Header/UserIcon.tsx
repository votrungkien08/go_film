import {  UserCircleIcon } from "@heroicons/react/24/solid";
import { useTheme } from "@/components/theme-provider";
import { useAuthContext} from '@/context/AuthContext'

export default function UserIcon() {
    const { theme } = useTheme();
    const { setIsPanelOpen } = useAuthContext();
    return (
        <div
            className="col-span-1 flex items-center justify-end cursor-pointer"
            onClick={() => {
                setIsPanelOpen(true)
            }}
        >
            <UserCircleIcon
                className={`h-10 w-10 border rounded-full ${
                    theme === "dark" ? "border-white" : ""
                } ${theme === "light" ? "border-black" : ""}`}
            />
        </div>
    )
}