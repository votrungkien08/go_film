import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

type HeadLabel = {
  id: string;
  label: string;
};

type Props = {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  onSort: (id: string) => void;
  headLabel: HeadLabel[];
};

export function AddTableHead({ order, orderBy, onSort, headLabel }: Props) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
        
    </TableHead>
    

    
  );
}
