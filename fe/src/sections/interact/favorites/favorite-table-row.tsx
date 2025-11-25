// src/sections/interact/favorites/favorite-table-row.tsx

import React from 'react';
import IconButton from '@mui/material/IconButton';
import BlockIcon from '@mui/icons-material/Block';

interface FavoriteTableRowProps {
  favorite: {
    id: number;
    user_name: string;
    film_title: string;
    created_at: string;
  };
}

export function FavoriteTableRow({ favorite }: FavoriteTableRowProps) {
  return (
    <tr>
      <td className="text-left px-4 py-2">{favorite.id}</td>
      <td className="text-left px-4 py-2">{favorite.user.name}</td>
      <td className="text-left px-4 py-2">{favorite.film.title_film}</td>
      <td className="text-left px-4 py-2">{new Date(favorite.created_at).toLocaleString()}</td>
    </tr>
  );
}
