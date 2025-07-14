// src/components/interact/favorites/favorite-table-head.tsx

import React from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

interface HeadCell {
  id: string;
  label: string;
}

interface FavoriteTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: string;
  onSort: (id: string) => void;
  headLabel: HeadCell[];
  rowCount: number;
}

export function FavoriteTableHead({
  order,
  orderBy,
  onSort,
  headLabel,
}: FavoriteTableHeadProps) {
  const createSortHandler = (id: string) => () => {
    onSort(id);
  };

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
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
