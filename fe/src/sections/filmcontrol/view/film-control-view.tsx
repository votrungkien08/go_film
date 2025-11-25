import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { DashboardContent } from "src/layouts/dashboard";
import { Scrollbar } from "src/components/scrollbar";
import useFilmControl from "../../../hooks/useAdminFilmControl"; // Import custom hook
import { FilmTableRow } from "../film-control-table-row";
import { FilmTableHead } from "../film-control-table-head";
import { FilmTableToolbar } from "../film-control-table-toolbar";
import { useFilm } from "../../../hooks/useFilm";
import { useGenre } from "../../../hooks/useGenre";
import { useYear } from "../../../hooks/useYear";
import { useCountry } from "../../../hooks/useCountry";

import { toast } from "sonner";

function useTable() {
    const [page, setPage] = useState(0); // Trang hiện tại, bắt đầu từ 0
    const [orderBy, setOrderBy] = useState("id"); // sắp xếp, mặc định là 'id'
    const [rowsPerPage, setRowsPerPage] = useState(5); // Số hàng mỗi trang, mặc định 5
    const [order, setOrder] = useState<"asc" | "desc">("asc"); // Thứ tự sắp xếp, mặc định là 'asc'
    const [filterName, setFilterName] = useState(""); // Từ khóa tìm kiếm, mặc định rỗng
    const onSort = useCallback(
        (id: string) => {
            const isAsc = orderBy === id && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(id);
        },
        [order, orderBy]
    );

    const onChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const onChangeRowsPerPage = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0); // Reset về trang đầu
        },
        []
    );

    return {
        page,
        order,
        orderBy,
        rowsPerPage,
        filterName,
        setFilterName,
        onSort,
        onChangePage,
        onChangeRowsPerPage,
    };
}

export function FilmControlView() {
    const table = useTable();

    const films = useFilm();
    const genres = useGenre();
    const years = useYear();
    const countries = useCountry();
    // Sử dụng useFilmControl
    const {
        isAddFilm,
        isEditing,
        isSubmitting,
        filmData,
        trailerFile,
        setTrailerFile,
        setIsAddFilm,
        setIsEditing,
        setFilmData,
        handleInputChange,
        toggleGenre,
        handleEpisodeChange,
        addEpisode,
        removeEpisode,
        handleSubmit,
        handleDeleteFilm,
        handleEditFilm,
        resetForm,
        handleAddFilm,
    } = useFilmControl(); // Khởi tạo với films rỗng, sẽ cập nhật sau
    // Sắp xếp phim theo orderBy và order
    const sortedFilms = films.slice().sort((a, b) => {
        const isAsc = table.order === "asc" ? 1 : -1;
        if (table.orderBy === "id") {
            return isAsc * (a.id - b.id);
        }
        return 0; // Thêm các trường sắp xếp khác nếu cần
    });
    // console.log("Original Films:", table.originalFilms);
    // const dataFiltered = table.filterName
    //     ? table.originalFilms
    //           .filter(
    //               (film) =>
    //                   film.title_film
    //                       .toLowerCase()
    //                       .includes(table.filterName.toLowerCase()) ||
    //                   (film.year?.release_year?.toString() || "").includes(
    //                       table.filterName
    //                   ) ||
    //                   (film.country?.country_name || "")
    //                       .toLowerCase()
    //                       .includes(table.filterName.toLowerCase()) ||
    //                   film.genres.some((genre) =>
    //                       (genre.genre_name || "")
    //                           .toLowerCase()
    //                           .includes(table.filterName.toLowerCase())
    //                   ) ||
    //                   film.actor
    //                       .toLowerCase()
    //                       .includes(table.filterName.toLowerCase()) ||
    //                   film.director
    //                       .toLowerCase()
    //                       .includes(table.filterName.toLowerCase())
    //           )
    //           .sort((a, b) => {
    //               const isAsc = table.order === "asc";
    //               if (table.orderBy === "id")
    //                   return isAsc ? a.id - b.id : b.id - a.id;
    //               if (table.orderBy === "title_film")
    //                   return isAsc
    //                       ? a.title_film.localeCompare(b.title_film)
    //                       : b.title_film.localeCompare(a.title_film);
    //               return 0;
    //           })
    //     : table.originalFilms.sort((a, b) => {
    //           const isAsc = table.order === "asc";
    //           if (table.orderBy === "id")
    //               return isAsc ? a.id - b.id : b.id - a.id;
    //           if (table.orderBy === "title_film")
    //               return isAsc
    //                   ? a.title_film.localeCompare(b.title_film)
    //                   : b.title_film.localeCompare(a.title_film);
    //           return 0;
    //       });

    // const notFound = !dataFiltered.length && !!table.filterName;

    // Form thêm/sửa phim
    const renderFilmForm = () => (
        <Box sx={{ p: 3, mb: 3, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                {isEditing ? "Chỉnh sửa phim" : "Thêm phim mới"}
            </Typography>

            <form onSubmit={handleSubmit}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Tiêu đề phim"
                        name="title_film"
                        value={filmData.title_film}
                        onChange={handleInputChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Thumbnail URL"
                        name="thumb"
                        value={filmData.thumb}
                        onChange={handleInputChange}
                        required
                        fullWidth
                    />
                    <Box>
                        <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ color: "black" }}
                        >
                            File Trailer
                        </Typography>
                        {filmData.trailer && (
                            <Typography
                                variant="body2"
                                gutterBottom
                                sx={{ color: "black" }}
                            >
                                Trailer hiện tại:
                                <a
                                    className="border border-black line-clamp-1"
                                    href={filmData.trailer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {filmData.trailer}
                                </a>
                            </Typography>
                        )}
                        <input
                            type="file"
                            accept="video/mp4,video/mov,video/avi"
                            style={{
                                border: "1px solid black",
                                padding: "6px",
                                borderRadius: "4px",
                            }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const allowedTypes = [
                                        "video/mp4",
                                        "video/mov",
                                        "video/avi",
                                    ];
                                    if (!allowedTypes.includes(file.type)) {
                                        toast.error(
                                            "Vui lòng chọn file video định dạng MP4, MOV hoặc AVI."
                                        );
                                        return;
                                    }
                                    setTrailerFile(file);console.log("Selected file:", file.name);
                                }
                            }}
                        />
                        {trailerFile && (
                            <Typography
                                variant="caption"
                                sx={{ mt: 1, display: "block", color: "green" }}
                            >
                                Đã chọn file: {trailerFile.name}
                            </Typography>
                        )}
                        {filmData.trailer && (
                            <Typography className="mb-2">
                                <a
                                    href={filmData.trailer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Xem trailer hiện tại
                                </a>
                            </Typography>
                        )}
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel>Loại phim</InputLabel>
                        <Select
                            name="film_type"
                            value={filmData.film_type}
                            onChange={(e) =>
                                setFilmData((prev) => ({
                                    ...prev,
                                    film_type: Number(e.target.value),
                                }))
                            }
                            required
                        >
                            <MenuItem value={0}>Phim Lẻ</MenuItem>
                            <MenuItem value={1}>Phim Bộ</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Năm phát hành</InputLabel>
                        <Select
                            name="year_id"
                            value={filmData.year_id}
                            onChange={handleInputChange}
                            required
                        >
                            <MenuItem value="">Chọn năm</MenuItem>
                            {years.map((year) => (
                                <MenuItem key={year.id} value={year.id}>
                                    {year.release_year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Quốc gia</InputLabel>
                        <Select
                            name="country_id"
                            value={filmData.country_id}
                            onChange={handleInputChange}
                            required
                        >
                            <MenuItem value="">Chọn quốc gia</MenuItem>
                            {countries.map((country) => (
                                <MenuItem key={country.id} value={country.id}>
                                    {country.country_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Diễn viên"
                        name="actor"
                        value={filmData.actor}
                        onChange={handleInputChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Đạo diễn"
                        name="director"
                        value={filmData.director}
                        onChange={handleInputChange}
                        required
                        fullWidth
                    />
                    <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
                        <Typography variant="body2" gutterBottom>
                            Thể loại
                        </Typography>
                        <Box
                            sx={{
                                maxHeight: 150,
                                overflowY: "auto",
                                bgcolor: "grey.800",
                                p: 1,
                                borderRadius: 1,
                            }}
                        >
                            {genres.length === 0 ? (
                                <Typography color="text.secondary">
                                    Không có thể loại
                                </Typography>
                            ) : (
                                genres.map((genre) => (
                                    <Button
                                        key={genre.id}
                                        variant={
                                            filmData.genre.includes(genre.id)
                                                ? "contained"
                                                : "outlined"
                                        }
                                        onClick={() => toggleGenre(genre.id)}
                                        sx={{ m: 0.5 }}
                                    >
                                        {genre.genre_name}
                                    </Button>
                                ))
                            )}
                        </Box>
                    </Box>
                    <TextField
                        label="Nội dung"
                        name="content"
                        value={filmData.content}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        required
                        fullWidth
                        sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}
                    />
                    <TextField
                        label="Số lượt xem"
                        name="view"
                        type="number"
                        value={filmData.view}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        inputProps={{ min: 0 }}
                    />
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Tập phim
                    </Typography>

                    {filmData.film_episodes.map((episode, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "1fr 1fr 1fr 1fr",
                                },
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            <TextField
                                label="Số tập"
                                value={episode.episode_number}
                                onChange={(e) =>
                                    handleEpisodeChange(
                                        index,
                                        "episode_number",
                                        e.target.value
                                    )
                                }
                                required
                            />
                            <TextField
                                label="Tiêu đề tập"
                                value={episode.episode_title}
                                onChange={(e) =>
                                    handleEpisodeChange(
                                        index,
                                        "episode_title",
                                        e.target.value
                                    )
                                }
                            />
                            <TextField
                                label="Link tập"
                                value={episode.episode_url}
                                onChange={(e) =>
                                    handleEpisodeChange(
                                        index,
                                        "episode_url",
                                        e.target.value
                                    )
                                }
                            />
                            <TextField
                                label="Thời lượng"
                                value={episode.duration}
                                onChange={(e) =>
                                    handleEpisodeChange(
                                        index,
                                        "duration",
                                        e.target.value
                                    )
                                }
                            />
                            {filmData.film_episodes.length > 1 && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => removeEpisode(index)}
                                >
                                    Xóa
                                </Button>
                            )}
                        </Box>
                    ))}
                    <Button
                        variant="contained"
                        onClick={addEpisode}
                        disabled={
                            filmData.film_type === 0 &&
                            filmData.film_episodes.length >= 1
                        }
                        sx={{ mt: 1 }}
                    >
                        Thêm tập
                    </Button>
                </Box>

                <Box
                    sx={{
                        mt: 3,
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => {
                            resetForm();
                            setIsAddFilm(false);
                            setIsEditing(false);
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Đang xử lý..."
                            : isEditing
                            ? "Cập nhật phim"
                            : "Thêm phim"}
                    </Button>
                </Box>
            </form>
        </Box>
    );

    return (
        <DashboardContent>
            <Box
                sx={{
                    mb: 5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h4">Quản lý phim</Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        setIsEditing(false);
                        setIsAddFilm(true);
                        handleAddFilm();
                    }}
                >
                    Thêm phim mới
                </Button>
            </Box>

            {isAddFilm && renderFilmForm()}
            {isEditing && renderFilmForm()}

            <Card sx={{ width: "100%", height: "100%" }}>
                <FilmTableToolbar
                    filterName={table.filterName}
                    onFilterName={(
                        event: React.ChangeEvent<HTMLInputElement>
                    ) => {
                        const value = event.target.value;
                        table.setFilterName(value);
                        // setFilms(
                        //     value
                        //         ? table.originalFilms
                        //               .filter(
                        //                   (film) =>
                        //                       film.title_film
                        //                           .toLowerCase()
                        //                           .includes(
                        //                               value.toLowerCase()
                        //                           ) ||
                        //                       (
                        //                           film.year?.release_year?.toString() ||
                        //                           ""
                        //                       ).includes(value) ||
                        //                       (film.country?.country_name || "")
                        //                           .toLowerCase()
                        //                           .includes(
                        //                               value.toLowerCase()
                        //                           ) ||
                        //                       film.genres.some((genre) =>
                        //                           (genre.genre_name || "")
                        //                               .toLowerCase()
                        //                               .includes(
                        //                                   value.toLowerCase()
                        //                               )
                        //                       ) ||
                        //                       film.actor
                        //                           .toLowerCase()
                        //                           .includes(
                        //                               value.toLowerCase()
                        //                           ) ||
                        //                       film.director
                        //                           .toLowerCase()
                        //                           .includes(value.toLowerCase())
                        //               )
                        //               .sort((a, b) => {
                        //                   const isAsc = table.order === "asc";
                        //                   if (table.orderBy === "id")
                        //                       return isAsc
                        //                           ? a.id - b.id
                        //                           : b.id - a.id;
                        //                   if (table.orderBy === "title_film")
                        //                       return isAsc
                        //                           ? a.title_film.localeCompare(
                        //                                 b.title_film
                        //                             )
                        //                           : b.title_film.localeCompare(
                        //                                 a.title_film
                        //                             );
                        //                   return 0;
                        //               })
                        //         : table.originalFilms.sort((a, b) => {
                        //               const isAsc = table.order === "asc";
                        //               if (table.orderBy === "id")
                        //                   return isAsc
                        //                       ? a.id - b.id
                        //                       : b.id - a.id;
                        //               if (table.orderBy === "title_film")
                        //                   return isAsc
                        //                       ? a.title_film.localeCompare(
                        //                             b.title_film
                        //                         )
                        //                       : b.title_film.localeCompare(
                        //                             a.title_film
                        //                         );
                        //               return 0;
                        //           })
                        // );
                    }}
                />
                <Scrollbar
                    sx={{ width: "100%", height: "auto", maxHeight: "none" }}
                >
                    <TableContainer
                        sx={{ height: "auto", overflow: "visible" }}
                    >
                        <Table sx={{ minWidth: 1200, tableLayout: "fixed" }}>
                            <FilmTableHead
                                order={table.order}
                                orderBy={table.orderBy}
                                rowCount={films.length}
                                onSort={table.onSort}
                                headLabel={[
                                    { id: "id", label: "ID", width: "w-10" },
                                    {
                                        id: "title_film",
                                        label: "Tiêu đề",
                                        width: "w-20",
                                    },
                                    {
                                        id: "genres",
                                        label: "Thể loại",
                                        width: "w-20",
                                    },
                                    {
                                        id: "year",
                                        label: "Năm phát hành",
                                        width: "w-20",
                                    },
                                    {
                                        id: "country",
                                        label: "Quốc gia",
                                        width: "w-20",
                                    },
                                    {
                                        id: "film_type",
                                        label: "Loại phim",
                                        width: "w-20",
                                    },
                                    {
                                        id: "director",
                                        label: "Đạo diễn",
                                        width: "w-20",
                                    },
                                    {
                                        id: "actor",
                                        label: "Diễn viên",
                                        width: "w-20",
                                    },
                                    {
                                        id: "content",
                                        label: "Nội dung",
                                        width: "w-20",
                                    },
                                    {
                                        id: "view",
                                        label: "Lượt xem",
                                        width: "w-20",
                                    },
                                    {
                                        id: "",
                                        label: "Hành động",
                                        width: "w-20",
                                    },
                                ]}
                            />
                            <TableBody>
                                {sortedFilms
                                    .slice(
                                        table.page * table.rowsPerPage,
                                        table.page * table.rowsPerPage +
                                            table.rowsPerPage
                                    )
                                    .map((film) => (
                                        <FilmTableRow
                                            key={film.id}
                                            film={film}
                                            onEdit={() => handleEditFilm(film)}
                                            onDelete={() =>
                                                handleDeleteFilm(film.id)
                                            }
                                        />
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    component="div"
                    page={table.page}
                    count={films.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>
        </DashboardContent>
    );
}
