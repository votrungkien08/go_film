import { Stack, TextField } from '@mui/material';

interface FilmTableToolbarProps {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FilmTableToolbar({ filterName, onFilterName }: FilmTableToolbarProps) {
  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, px: 2 }}>
      <TextField
        value={filterName}
        onChange={onFilterName}
        placeholder="Tìm kiếm phim..."
        variant="outlined"
        size="small"
        sx={{ width: 300 }}
      />
    </Stack>
  );
}