import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

interface HeadLabel {
  id: string;
  label: string;
}

interface FilmTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  onSort: (id: string) => void;
  headLabel: HeadLabel[];
}

export function FilmTableHead({ order, orderBy, onSort, headLabel }: FilmTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((head) => (
          <TableCell key={head.id} className={head.width}>

            <TableSortLabel
              active={orderBy === head.id}
              direction={orderBy === head.id ? order : 'asc'}
              onClick={() => onSort(head.id)}
            >
              {head.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}