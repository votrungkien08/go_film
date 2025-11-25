import axios from "axios";

// api top film update
export async function fetchUpdateFilms() {
    const { data } = await axios.get(
        "http://localhost:8000/api/films/update-top",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    // console.log("dataupdate", data);
    return data;
}
// api top film rank
export async function fetchRankFilms() {
    const { data } = await axios.get(
        "http://localhost:8000/api/films/rank-top",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    // console.log("fetchRankFilms data:", data);
    return data;
}
// fetch film nominate
export async function fetchNominateFilms() {
    const { data } = await axios.get("http://localhost:8000/api/favorite");
    // console.log("fetchNominateFilms data:", data.film);
    return data.film;
}
// fetch film theater
export async function fetchTheaterFilms() {
    const { data } = await axios.get("http://localhost:8000/api/films/theater");
    console.log("fetchTheaterFilms data:", data.film);
    return data;
}

export async function fetchFilmBySlug(slug: string) {
    const { data } = await axios.get(`http://localhost:8000/api/film/${slug}`);
    // console.log('fetchFilmBySlug data:', data);
    return data;
}

// api list film
export async function fetchFilms() {
    const { data } = await axios.get("http://localhost:8000/api/films");
    // console.log('fetchFilms data:', data);
    return data;
}
// CRUD
export async function updateFilm(formData: FormData) {
    const idFilm = formData.get("id");
    console.log("update film id:", idFilm);

    const { data } = await axios.post(
        `http://localhost:8000/api/updateFilm/${idFilm}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );
    console.log("update film data:", data);
    return data;
}
// CRUD
export async function addFilm(dataFilm: FormData) {
    const { data } = await axios.post(
        "http://localhost:8000/api/addFilm",
        dataFilm,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );
    console.log("add film data:", data);

    return data;
}
// CRUD
export async function deleteFilm(filmId: number) {
    const { data } = await axios.delete(
        `http://localhost:8000/api/delFilm/${filmId}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );

    return data;
}

// filter film advance
export async function fetchfilterAdvanceFilm(params: Record<string, string>) {
    const { data } = await axios.get("http://localhost:8000/api/filter", {
        params,
    });
    return data;
}
