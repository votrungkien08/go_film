// src/sections/interact/favorites/favorite-table-row.tsx

import React from 'react';
import IconButton from '@mui/material/IconButton';
import BlockIcon from '@mui/icons-material/Block';

interface RatingTableRowProps {
  rating: {
    id: number;
    user_name: string;
    film_title: string;
    created_at: string;
  };
}

export function RatingTableRow({ rating }: RatingTableRowProps) {
  return (
    <tr>
      <td className="text-left p-2">{rating.id}</td>
      <td className="text-left p-2">{rating.user.name}</td>
      <td className="text-left p-2">{rating.film.title_film}</td>
      <td className="text-left p-2">{new Date(rating.created_at).toLocaleString()}</td>
    </tr>
  );
}
