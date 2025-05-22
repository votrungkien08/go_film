// src/utils/auth.ts
import { useState, useEffect } from 'react';

let setPanelOpen: (open: boolean) => void = () => { };
let setLoginForm: (isLogin: boolean) => void = () => { };

export const useAuthPanel = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isLoginForm, setIsLoginForm] = useState(true);

    useEffect(() => {
        setPanelOpen = setIsPanelOpen;
        setLoginForm = setIsLoginForm;
    }, []);

    return { isPanelOpen, setIsPanelOpen, isLoginForm, setIsLoginForm };
};

export const openAuthPanel = () => {
    setPanelOpen(true);
    setLoginForm(true);
};