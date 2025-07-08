import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';

import {useAdminComments} from '../../../hooks/useAdminComments'
import { CommentTableRow } from '../comment-table-row';
import { CommentTableHead } from '../comment-table-head';

export function CommentView() {
  const table = useTable();
    const {comments, toggleBlockComment} = useAdminComments();
    console.log('lady and gentement',comments);
  return (
    <DashboardContent>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4">Bình luận</Typography>
      </Box>

      <Card sx={{ width: '100%', height: '100%' }}>
        <Scrollbar sx={{ width: '100%', height: 'auto', maxHeight: 'none' }}>
          <TableContainer sx={{ height: 'auto', overflow: 'visible' }}>
            <Table sx={{ minWidth: 1200 }}>
              <CommentTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={comments.length}
                onSort={table.onSort}
                headLabel={[
                  { id: 'id', label: 'ID' },
                  { id: 'user_id', label: 'User_Id' },
                  { id: 'film_id', label: 'Film_Id' },
                  { id: 'comment', label: 'Comment' },
                  { id: 'is_block', label: 'Block' },
                  { id: 'created_at', label: 'Created' },
                ]}
              />
              <TableBody>
                {comments
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((comment) => (
                    <CommentTableRow key={comment.id} comment={comment} toggleBlockComment={toggleBlockComment} />
                  ))}
              </TableBody>
            </Table>

          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={comments.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// useTable giống như ở user
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
