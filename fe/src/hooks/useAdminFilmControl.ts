import { useState, useCallback } from "react";
import axios from "axios";
import { type FilmData, type Film } from "@/types";
import { toast } from "sonner";
import { useFilmMutation } from "../hooks/useFilm";

const useFilmControl = () => {
    const { addFilmMutation, updateFilmMutation, deleteFilmMutation } =
        useFilmMutation();
    // States
    const [isAddFilm, setIsAddFilm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [trailerFile, setTrailerFile] = useState<File>();
    const [filmData, setFilmData] = useState<FilmData>({
        id: 0,
        slug: "",
        title_film: "",
        thumb: "",
        trailer: "",
        film_type: 0,
        year_id: "",
        country_id: "",
        actor: "",
        director: "",
        content: "",
        view: 0,
        genre: [],
        film_episodes: [],
    });
    const prepareFormData = useCallback(() => {
        const formDataToSend = new FormData();
        if (isEditing) {
            formDataToSend.append("id", filmData.id?.toString() || "");
        }
        formDataToSend.append("title_film", filmData.title_film.trim());
        formDataToSend.append("thumb", filmData.thumb.trim());
        if (trailerFile) {
            formDataToSend.append("trailer", trailerFile);
        } else if (filmData.trailer) {
            formDataToSend.append("trailer_url", filmData.trailer);
        }
        formDataToSend.append("film_type", filmData.film_type.toString());
        formDataToSend.append("year_id", filmData.year_id.toString());
        formDataToSend.append("country_id", filmData.country_id.toString());
        formDataToSend.append("actor", filmData.actor.trim());
        formDataToSend.append("director", filmData.director.trim());
        formDataToSend.append("content", filmData.content.trim());
        formDataToSend.append("view", filmData.view.toString());
        filmData.genre.forEach((id) =>
            formDataToSend.append("genre[]", id.toString())
        );
        if (filmData.film_type === 0 && filmData.film_episodes.length > 0) {
            const episode = filmData.film_episodes[0];
            if (isEditing) {
                formDataToSend.append(
                    "film_episodes[0][id]",
                    episode.id?.toString() ?? ""
                );
            }
            formDataToSend.append(
                "film_episodes[0][episode_number]",
                episode.episode_number.toString()
            );
            formDataToSend.append(
                "film_episodes[0][episode_title]",
                episode.episode_title.toString()
            );
            formDataToSend.append(
                "film_episodes[0][duration]",
                episode.duration.toString()
            );
            formDataToSend.append(
                "film_episodes[0][episode_url]",
                episode.episode_url.toString()
            );
        }
        if (filmData.film_type === 1 && filmData.film_episodes.length > 0) {
            filmData.film_episodes.forEach((item, index) => {
                if (isEditing) {
                    formDataToSend.append(
                        `film_episodes[${index}][id]`,
                        item.id?.toString() ?? ""
                    );
                }
                formDataToSend.append(
                    `film_episodes[${index}][episode_number]`,
                    item.episode_number.toString()
                );
                formDataToSend.append(
                    `film_episodes[${index}][episode_title]`,
                    item.episode_title.toString()
                );
                formDataToSend.append(
                    `film_episodes[${index}][duration]`,
                    item.duration.toString()
                );
                formDataToSend.append(
                    `film_episodes[${index}][episode_url]`,
                    item.episode_url.toString()
                );
            });
        }
        //   if (filmData.film_episodes.length > 0) {
        //   formDataToSend.append('film_episodes', JSON.stringify(filmData.film_episodes));
        // }

        return formDataToSend;
    }, [filmData, trailerFile]);
    // Handlers
    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >
        ) => {
            const { name, value } = e.target;
            setFilmData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const toggleGenre = useCallback((genreId: number) => {
        setFilmData((prev) => ({
            ...prev,
            genre: prev.genre.includes(genreId)
                ? prev.genre.filter((id) => id !== genreId)
                : [...prev.genre, genreId],
        }));
    }, []);

    const handleEpisodeChange = useCallback(
        (
            index: number,
            filed: keyof (typeof filmData.film_episodes)[0],
            value: string
        ) => {
            setFilmData((prev) => {
                const newFilm_episode = [...prev.film_episodes];
                newFilm_episode[index] = {
                    ...newFilm_episode[index],
                    [filed]: value,
                };

                return {
                    ...prev,
                    film_episodes: newFilm_episode,
                };
            });
        },
        []
    );

    const addEpisode = useCallback(() => {
        setFilmData((prev) => {
            return {
                ...prev,
                film_episodes: [
                    ...prev.film_episodes,
                    {
                        episode_number: "",
                        episode_title: "",
                        episode_url: "",
                        duration: "",
                    },
                ],
            };
        });
    }, []);

    const removeEpisode = useCallback(
        (index: number) => {
            setFilmData((prev) => {
                const newEpisodes = prev.film_episodes.filter(
                    (_, i) => i !== index
                );
                if (filmData.film_type === 0 && newEpisodes.length === 0) {
                    return {
                        ...prev,
                        film_episodes: [
                            {
                                episode_number: "",
                                episode_title: "",
                                episode_url: "",
                                duration: "",
                            },
                        ],
                    };
                }
                return {
                    ...prev,
                    film_episodes: newEpisodes,
                };
            });
        },
        [filmData.film_type]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            console.log("Film data before submit:", filmData);
            // Validation
            if (!filmData.title_film || filmData.title_film.trim() === "") {
                toast.error("Vui lòng nhập tiêu đề phim.");
                setIsSubmitting(false);
                return;
            }
            if (!filmData.thumb || filmData.thumb.trim() === "") {
                toast.error("Vui lòng nhập hình ảnh phim.");
                setIsSubmitting(false);
                return;
            }
            if (!filmData.year_id || isNaN(Number(filmData.year_id))) {
                toast.error("Vui lòng chọn năm phát hành hợp lệ.");
                setIsSubmitting(false);
                return;
            }
            // Kiểm tra trailer
            if (!trailerFile && !filmData.trailer) {
                toast.error(
                    "Vui lòng chọn file trailer hoặc nhập URL trailer."
                );
                setIsSubmitting(false);
                return;
            }
            if (!filmData.country_id || isNaN(Number(filmData.country_id))) {
                toast.error("Vui lòng chọn quốc gia hợp lệ.");
                setIsSubmitting(false);
                return;
            }
            if (filmData.genre.length === 0) {
                toast.error("Vui lòng chọn ít nhất một thể loại.");
                setIsSubmitting(false);
                return;
            }
            if (
                filmData.film_type === 1 &&
                filmData.film_episodes.length === 0
            ) {
                toast.error("Phim bộ cần ít nhất một tập.");
                setIsSubmitting(false);
                return;
            }

            if (filmData.film_episodes.length > 0) {
                const invalid = filmData.film_episodes.some(
                    (item) =>
                        !item.episode_number ||
                        !item.episode_title ||
                        !item.episode_url ||
                        !item.duration
                );

                if (invalid) {
                    setIsSubmitting(false);
                    return;
                }
            }

            const formDataToSend = prepareFormData();

            if (isEditing) {
                setIsSubmitting(true);
                updateFilmMutation.mutate(formDataToSend);
                setIsSubmitting(false);
            } else {
                setIsSubmitting(true);
                addFilmMutation.mutate(formDataToSend);
                setIsSubmitting(false);
            }
            for (const [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }
        },
        [
            filmData,
            // episodes,
            trailerFile,
            isEditing,
        ]
    );

    const handleDeleteFilm = useCallback(
        async (filmId: number) => {
            if (!window.confirm("Bạn có chắc muốn xóa phim này?")) {
                return;
            }
            deleteFilmMutation.mutate(filmId);
        },
        [deleteFilmMutation]
    );
    const handleAddFilm = useCallback(() => {
        setIsAddFilm(true);
        setIsEditing(false);
        resetForm();
    }, []);
    const handleEditFilm = useCallback((film: Film) => {
        setFilmData({
            id: film.id,
            slug: film.slug,
            title_film: film.title_film,
            thumb: film.thumb,
            trailer: film.trailer,
            film_type: film.film_type,
            year_id: film.year?.id.toString() || "",
            country_id: film.country?.id.toString() || "",
            actor: film.actor,
            director: film.director,
            content: film.content,
            view: film.view,
            genre: film.genres.map((genre) => genre.id),
            film_episodes: film.film_episodes.map((episode) => ({
                id: episode.id,
                episode_number: episode.episode_number,
                episode_title: episode.episode_title,
                episode_url: episode.episode_url,
                duration: episode.duration,
            })),
        });

        setIsEditing(true);
        setIsAddFilm(false);
    }, []);

    const resetForm = useCallback(() => {
        setFilmData({
            slug: "",
            title_film: "",
            thumb: "",
            trailer: "",
            film_type: 0,
            year_id: "",
            country_id: "",
            actor: "",
            director: "",
            content: "",
            view: 0,
            genre: [],
            film_episodes: [],
        });
        // setEpisodes([{ episode_number: '', episode_title: '', episode_url: '', duration: '' }]);
        // setTrailerFile(null);
    }, []);

    return {
        isAddFilm,
        isEditing,
        isSubmitting,
        filmData,
        // episodes,
        trailerFile,
        setTrailerFile,
        setIsAddFilm,
        setIsEditing,
        setFilmData,
        // setEpisodes,
        handleInputChange,
        toggleGenre,
        handleEpisodeChange,
        addEpisode,
        removeEpisode,
        handleSubmit,
        handleDeleteFilm,
        handleEditFilm,
        handleAddFilm,
        resetForm,
    };
};

export default useFilmControl;
