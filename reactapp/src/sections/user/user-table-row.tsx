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
import Dialog from '@mui/material/Dialog';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useUser } from 'src/hooks/useUser';  
import { DialogTitle,DialogContent, TextField, DialogActions } from '@mui/material';

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

export function UserTableRow({ row, selected, onSelectRow,onDelete, onEdit}: UserTableRowProps) {

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editUser, setEditUser] = useState<UserProps>(row);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };
  const handleDelete = () => {
    setOpenDeleteDialog(false);
    onDelete(row.id);
  };

  const handleEditClick = () => {
    setEditUser(row);
    setOpenEditDialog(true);
  }

  const handleSave = () => {
    onEdit(editUser);
    setOpenEditDialog(false);
  };
  

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
          <Button variant="text" color="primary" onClick={() => handleEditClick()}>
            Sửa
          </Button>
          <Button variant="text" color="error" onClick={() => handleDeleteClick()}>
            Xoá
          </Button>
        </TableCell>


      </TableRow>


      {/* Form edit */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}
              maxWidth="sm"
              fullWidth

      >
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              sx= {{mt: 2}}
              label="Tên"
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            />
            <TextField
              label="Email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            />
            <TextField
              label="Vai trò"
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            />
            <TextField
              label="Điểm"
              type="number"
              value={editUser.points}
              onChange={(e) => setEditUser({ ...editUser, points: Number(e.target.value) })}
            />
          </DialogContent>

          <DialogActions>
            <Button color='inherit' variant='contained' onClick={() => setOpenEditDialog(false)}>Hủy</Button>
            {/* variant bg, color primary */}
            <Button variant='contained' color='primary' onClick={() => handleSave()}>Lưu</Button>
          </DialogActions>
      </Dialog>

      {/* Form delete */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
        
      >
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xoá người dùng <strong>{row.name}-{row.role}</strong>?
        </DialogContent>
        <DialogActions>
          <Button color='inherit' variant='contained' onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant='contained' color='error' onClick={() => handleDelete()}>Xoá</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
