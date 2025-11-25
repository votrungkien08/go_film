import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

type Props = {
  comment: {
    id: number;
    user_id: number;
    film_id: number;
    comment: string;
    is_blocked: boolean;
    created_at: string;
    toggleBlockComment: (id: number) => void;
  };
};

export function CommentTableRow({ comment, toggleBlockComment }: Props) {
  return (
    <TableRow hover>
      <TableCell>{comment.id}</TableCell>
      <TableCell>{comment.user.name}</TableCell>
      <TableCell>{comment.film.title_film}</TableCell>
      <TableCell className='line-clamp-2'>{comment.comment.length > 100 ? `${comment.comment.slice(0, 100)}...` : comment.comment}</TableCell>
      <TableCell>
        <button onClick={() => toggleBlockComment(comment.id)}
        className={`cursor-pointer text-center  text-white px-2 py-1  rounded-lg text-sm font-medium transition-colors ${
          comment.is_blocked
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
            >
            {comment.is_blocked ? 'Bỏ chặn' : 'Chặn'}</button>
        
      </TableCell>
      <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
    </TableRow>
  );
}
