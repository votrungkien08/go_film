import { createContext, useState, useEffect, useContext } from "react";
import {useAuth} from '@/hooks/useAuth';

interface AuthContextType {
    isPanelOpen: boolean;
    isLoginForm: boolean;
  setIsPanelOpen: (value: boolean) => void;
  setIsLoginForm: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: {children: React.ReactNode}) => {
    const {isLogin} = useAuth();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isLoginForm, setIsLoginForm] = useState(false);
    useEffect(() => {
        setIsLoginForm(!isLogin);
    }, [isLogin]);

    return (
        <AuthContext.Provider value={{isPanelOpen,isLoginForm,setIsPanelOpen,setIsLoginForm}}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuthContext(): AuthContextType  {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}