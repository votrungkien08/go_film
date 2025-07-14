// src/sections/interact/favorites/view-favorites.tsx

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { useAdminRatings } from '../../../hooks/useAdminRatings';
import { RatingTableRow } from './rating-table-row';
import { RatingTableHead } from './rating-table-head';

export default function RatingsView() {
  const table = useTable();
  const { ratings } = useAdminRatings();

  return (
    <DashboardContent>
      <Card sx={{ width: '100%', height: '100%' }}>
        <Scrollbar sx={{ width: '100%', height: 'auto', maxHeight: 'none' }}>
          <TableContainer sx={{ height: 'auto', overflow: 'visible' }}>
            <Table sx={{ minWidth: 1000 }}>
              <RatingTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={ratings.length}
                onSort={table.onSort}
                headLabel={[
                  { id: 'id', label: 'ID' },
                  { id: 'user_name', label: 'Tên người dùng' },
                  { id: 'film_title', label: 'Tên phim' },
                  { id: 'created_at', label: 'Ngày yêu thích' },
                ]}
              />
              <TableBody>
                {ratings
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((rating) => (
                    <RatingTableRow key={rating.id} rating={rating} />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={ratings.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('id');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
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
      setPage(0);
    },
    []
  );

  return {
    page,
    order,
    orderBy,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  };
}
