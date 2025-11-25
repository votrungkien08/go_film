// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Toaster } from "sonner";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
// import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { DashboardLayout } from "./layouts/dashboard/layout";
import DashboardPage from "./pages/dashboard";
import SignInPage from "./pages/sign-in";
import UserPage from "./pages/user";
import ProductsPage from "./pages/products";
import InteractionPage from "./pages/interact";
import FilmPage from "./pages/film-control";
import AddPage from "./pages/add";
import RevenuePage from "./pages/revenue";
import AdvertisePage from "./pages/advertise";
import { MUIThemeProvider } from "src/theme/theme-provider";
import ForgetPasswordResetForm from "./pages/forget-password";
import ResetPasswordResetForm from "./pages/reset-password";
import { lazy, Suspense } from "react";
import AuthGoogle from "@/components/layout/Header/UserPanel/Login/AuthGoogle";
// import { ModeToggle } from './components/mode-toggle';
// import { useEffect } from 'react';
const LazyFilmDetail = lazy(() => import("./pages/DetailFilm"));
const LazyInfomationFilm = lazy(() => import("./pages/InfomationFilm"));
const LazyFilmsList = lazy(() => import("./pages/FilmList"));
const LazyTheaterFilm = lazy(() => import("./pages/Theater"));
const LazyFavorites = lazy(() => import("./pages/FavoriteFilmList"));
// import { GoogleLogin } from '@react-oauth/google';

function App() {
    return (
        <>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <Router>
                    <Routes>
                        {/* Các route sử dụng MainLayout */}
                        <Route
                            path="forget-password"
                            element={<ForgetPasswordResetForm />}
                        />
                        <Route
                            path="reset-password"
                            element={<ResetPasswordResetForm />}
                        />
                        {/* login google */}
                        <Route
                            path="auth/google"
                            element={<AuthGoogle />}
                        />
                        <Route path="/" element={<MainLayout />}>
                            <Route
                                path="film/:slug"
                                element={
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <LazyInfomationFilm />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="watch-film/:slug"
                                element={
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <LazyFilmDetail />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="filter"
                                element={
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <LazyFilmsList />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="favorites"
                                element={
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <LazyFavorites />
                                    </Suspense>
                                }
                            />

                        </Route>

                        <Route element={<ProtectedAdminRoute />}>
                            <Route
                                path="/dashboard"
                                element={
                                    <MUIThemeProvider>
                                        <DashboardLayout />
                                    </MUIThemeProvider>
                                }
                            >
                                <Route index element={<DashboardPage />} />
                                <Route path="user" element={<UserPage />} />
                                <Route
                                    path="products"
                                    element={<ProductsPage />}
                                />
                                <Route
                                    path="sign-in"
                                    element={<SignInPage />}
                                />
                                <Route path="404" element={<DashboardPage />} />
                                <Route
                                    path="interaction"
                                    element={<InteractionPage />}
                                />
                                <Route path="films" element={<FilmPage />} />
                                <Route path="add" element={<AddPage />} />
                                <Route
                                    path="revenue"
                                    element={<RevenuePage />}
                                />
                                <Route
                                    path="advertise"
                                    element={<AdvertisePage />}
                                />
                            </Route>
                        </Route>
                    </Routes>
                </Router>
                <Toaster
                    position="top-right"
                    theme="dark" // Phù hợp với nền tối
                    richColors={false} // Tắt để custom màu
                    closeButton
                    duration={4000}
                    toastOptions={{
                        style: {
                            background: "#1a1a1a",
                            color: "#ffffff",
                            border: "1px solid #FF6B35",
                        },
                        success: {
                            style: {
                                background: "#1a1a1a",
                                color: "#10B981",
                                border: "1px solid #10B981",
                            },
                        },
                        error: {
                            style: {
                                background: "#1a1a1a",
                                color: "#EF4444",
                                border: "1px solid #EF4444",
                            },
                        },
                    }}
                />
            </ThemeProvider>
        </>
    );
}

export default App;
