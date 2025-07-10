import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
// import Checkbox from '@mui/material/Checkbox';
// import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useUser } from 'src/hooks/useUser';  
// import { GripVertical } from 'lucide-react';
// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  points: number;
  avatarUrl: string;
  // isVerified: boolean;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (user: UserProps) => void;
  onDelete: (id: string) => void;
};

export function UserTableRow({ row, selected, onSelectRow, onEdit ,onDelete }: UserTableRowProps) {
  const {allUsers} = useUser();

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar alt={row.name.charAt(0)}  />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>{row.role}</TableCell>
        <TableCell>{row.points}</TableCell>
        {/* <TableCell><GripVertical className='cursor-pointer' /></TableCell> */}
        <TableCell align='center' >
          <Button variant="text" color="primary" onClick={() => onEdit(row)}>
            Sửa
          </Button>
          <Button variant="text" color="error" onClick={() => onDelete(row.id)}>
            Xoá
          </Button>
        </TableCell>

      </TableRow>


    </>
  );
}
