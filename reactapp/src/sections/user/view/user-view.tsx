import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

// import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import { useUser } from 'src/hooks/useUser';
import type { Users } from 'src/types';
import type { UserProps } from '../user-table-row';
import { AlignCenter } from 'lucide-react';
import { Dialog,DialogTitle,DialogContent, TextField, DialogActions, MenuItem } from '@mui/material';
import { all } from 'axios';


// ----------------------------------------------------------------------

export function UserView() {
  const [filterName, setFilterName] = useState('');
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [newUser, setNewUser] = useState<Users>({
    name: '',
    email: '',
    password: '',
    role: '',
    points: 0,
    avatarUrl: '',
  });
  const table = useTable();
  const { allUsers, handleDeleteUser, handleUpdateUser, handleAddUser } = useUser();

  const dataFiltered: UserProps[] = applyFilter({
    inputData: allUsers,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Người dùng
        </Typography>
        <Button
          onClick={() => setOpenNewUserDialog(true)}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Thêm người dùng mới
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={allUsers.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    allUsers.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Tên' },
                  { id: 'email', label: 'Email' },
                  { id: 'role', label: 'Vai trò' },
                  { id: 'point', label: 'Điểm' },
                  { id: 'action', label: 'Hành động', align: 'center'},

                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDelete={handleDeleteUser}
                      onEdit={handleUpdateUser}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, allUsers.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={allUsers.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <Dialog open={openNewUserDialog} onClose={() => setOpenNewUserDialog(false)}
              maxWidth="sm"
              fullWidth  
      >
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            sx={{ mt: 2 }}
            label="Tên"
            required
            value={newUser.name}
            onChange={(e) => {setNewUser({ ...newUser, name: e.target.value })}}
          />
          <TextField
            label="Email"
            type='email'
            required
            value={newUser.email}
            onChange={(e) => {setNewUser({ ...newUser, email: e.target.value })}}
          />
          <TextField
            label="Mật khẩu"
            type='password'
            required
            value={newUser.password}
            onChange={(e) => {setNewUser({ ...newUser, password: e.target.value })}}
          />
          <TextField
            label="Nhập lại mật khẩu"
            type='password'
            required
            value={newUser.password_confirmation}
            onChange={(e) => {setNewUser({ ...newUser, password_confirmation: e.target.value })}}
          />
          <TextField
            select
            label="Vai trò"
            required
            value={newUser.role}
            onChange={(e) => {setNewUser({ ...newUser, role: e.target.value })}}
            
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            label="Điểm"
            required
            type='number'
            value={newUser.points || 0}
            onChange={(e) => {setNewUser({ ...newUser, points: parseInt(e.target.value) || 0 })}}
          />
        </DialogContent>
        <DialogActions>
          <Button color='inherit' variant='contained' onClick={() => setOpenNewUserDialog(false)}>Hủy</Button>
          <Button variant='contained' color='primary' onClick={() => {
            handleAddUser(newUser);
            setOpenNewUserDialog(false);
            setNewUser({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: '',
                points: 0
            });
          }}>Thêm</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
