import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import CommentView from '../comments/view-comment';
import FavoriteView from '../favorites/view-favorite';
import RatingView from '../ratings/view-rating';
export function InteractionView() {

  const [error, setError] = useState(null);
  const [tab, setTab] = useState<'comments' | 'favorites' | 'ratings'>('comments');
  
  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }


return (
<div className="min-h-screen w-full bg-gray-400 p-6">
  <h1 className="text-3xl font-bold mb-6">Quản Lý Tương Tác</h1>

  <div className=" flex ">
    <div>
      <button
        onClick={() => setTab('comments')}
        className={`cursor-pointer rounded-md px-4 py-2 mr-2 ${
          tab === 'comments'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Bình luận
      </button>
      <button
        onClick={() => setTab('favorites')}
        className={`cursor-pointer rounded-md px-4 py-2 mr-2 ${
          tab === 'favorites'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Yêu thích
      </button>
      <button
        onClick={() => setTab('ratings')}
        className={`cursor-pointer rounded-md px-4 py-2 ${
          tab === 'ratings'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Đánh giá
      </button>
    </div>
  </div>
  
  {tab === 'comments' && <CommentView />}
  {tab === 'favorites' && <FavoriteView />}
  {tab === 'ratings' && <RatingView />}


</div>

);

}