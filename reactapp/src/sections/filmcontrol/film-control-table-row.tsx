import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import { Film } from './types'; // Giả sử bạn có file types.ts chứa interface Film

interface FilmTableRowProps {
  film: Film;
  onEdit: () => void;
  onDelete: () => void;
}

export function FilmTableRow({ film, onEdit, onDelete }: FilmTableRowProps) {
  return (
    <TableRow>
      <TableCell>{film.id}</TableCell>
      <TableCell>{film.title_film}</TableCell>
      <TableCell>{film.genres.map((genre) => genre.genre_name).join(', ')}</TableCell>
      <TableCell>{film.year?.release_year || 'N/A'}</TableCell>
      <TableCell>{film.country?.country_name || 'N/A'}</TableCell>
      <TableCell>{film.film_type ? 'Phim Lẻ' : 'Phim Bộ'}</TableCell>
      <TableCell>{film.director}</TableCell>
      <TableCell>{film.actor}</TableCell>
      <TableCell>{film.view}</TableCell>
      <TableCell>{film.is_premium ? 'Có' : 'Không'}</TableCell>
      <TableCell>{film.is_premium ? film.point_required || '0' : 'N/A'}</TableCell>
      <TableCell>
        <Button variant="contained" color="primary" onClick={onEdit} sx={{ mr: 1 }}>
          Sửa
        </Button>
        <Button variant="contained" color="error" onClick={onDelete}>
          Xóa
        </Button>
      </TableCell>
    </TableRow>
  );
}