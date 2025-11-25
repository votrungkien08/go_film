import { ModeToggle } from "../../mode-toggle";
import { useTheme } from "../../theme-provider";
import Logo from './Logo';
import { NavMenu } from './NavMenu'
import Search from './Search'
import UserPanel from "./UserPanel/UserPanel";
import UserIcon from "./UserIcon";
import {AuthProvider} from '@/context//AuthContext'
export default function Header  ()  {
    const { theme } = useTheme();
    return (
        <AuthProvider>
            <div
                className={`h-[60px] w-full fixed top-0 left-0 z-50 px-4 backdrop-blur-lg bg-white/30 ${
                    theme === "light" ? "shadow shadow-white/80" : ""
                } ${theme === "dark" ? "shadow shadow-white/80" : ""} ${
                    theme === "system" ? "shadow shadow-orange-500/20" : ""
                }`}
            >
                <div className="grid grid-cols-12 gap-2 h-full items-center">
                    {/* logo */}
                    <Logo/>
                    {/* nav */}
                    <NavMenu/>
                    {/* search */}
                    <Search/>
                    {/* darkmode */}
                    <div className="col-span-1 flex justify-end focus:outline-none focus:ring-0">
                        <ModeToggle />
                    </div>
                    <UserIcon/>
                </div>

                <UserPanel/>                
            </div>
        </AuthProvider>
    );
};

