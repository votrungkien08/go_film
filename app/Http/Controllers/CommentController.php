<?php

namespace App\Http\Controllers;
use App\Models\Comment;
use App\Models\Film;
use App\Models\User;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $comments = Comment::with('user')->get();

            return response()->json([
                'status' => 'success',
                'comments' => $comments,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleBlockComments($idComment) {
        try {
            $comment = Comment::find($idComment);
            if (!$comment) {
                return response()->json([
                    'error' => 'comment not found',
                ], 404);
            }
            $comment->is_blocked = !$comment->is_blocked;
            $comment->save();
            return response()->json([
                'message' => 'fetch comments successfully',
                'comments' => $comment,
                'message' => $comment->is_blocked ? 'Comment blocked' : 'Comment unblocked',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getCommentByIdFilm($idFilm)
    {
        try {
            $film = Film::find($idFilm);
            if (!$film) {
                return response()->json([
                    'error' => 'Film not found',
                ], 404);
            }
            $comments = $film->comments()
                ->where('is_blocked', 0) // Nạp quan hệ user
                ->with('user')
                ->get();
            return response()->json([
                'comments' => $comments,
                'message' => 'fetch comments successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function getUserComment($idUser)
    {
        try {
            $user = User::findOrFail($idUser);
            $comments = $user->comments;

            return response()->json([
                'message' => 'fetch success',
                'user comment' => $comments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Eror fetch ',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function postComment(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthenticated',
                ], 401);
            }
            $request->validate([
                'film_id' => 'required|exists:film,id',
                'comment' => 'required|string|max:1000',
            ]);

            $comment = new Comment();
            $comment->user_id = $user->id;
            $comment->film_id = $request->film_id;
            $comment->comment = $request->comment;
            $comment->created_at = now(); // Sử dụng now() với múi giờ Asia/Ho_Chi_Minh
            $comment->save();

            return response()->json([
                'message' => true,
                'User' => $comment->user_id,
                'Comment' => $comment->comment,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'error post',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function checkComment(Request $request) {
        try{
            $comment = $request->input('comment');
            $badWords = [
                'fuck', 'shit', 'bitch', 'ass', 'dick', 'pussy', 'damn', 'hell',
                'nigger', 'nigga', 'chink', 'gook', 'towelhead', 'sandnigger', 'camel jockey',
                'kike', 'hebe', 'yid', 'fag', 'faggot', 'tranny', 'dyke', 'redskin',
                'spic', 'beaner', 'curry-muncher',
                'jesus freak', 'bible basher', 'raghead', 'christ killer', 'heathen',
                'tits', 'boobs', 'cunt', 'handjob', 'blowjob', 'cum', 'jizz', 'jizzum', 'porn', 'porno', 'hardcore', 'deepthroat', 'gangbang',
                'dm','đm', 'đéo', 'lồn', 'cặc', 'bú', 'lol', 'cc', 'cl','cc', 'vl', 'vcl', 'vãi', 'vãi lồn', 'vãi cặc', 'vãi đái', 'vãi lol','dmm','bắc kỳ', 'nam kỳ','trung kỳ','mẹ mày','má mày',
                
            ];
            $spamWords = [
                'http', 'https', 'www', '.com', '.net', '.org', '.info', '.vn', 
                'domain', 'link', 'click', 'visit', 'join', 'free', 'giveaway', 
                'money', 'earn money', 'get rich', 'payday', 'discount', 'coupon', 
                'promo', 'promotion', 'work from home', 'online job', 'easy cash', 
                'viagra', 'cialis', 'xanax', 'tramadol', 'weight loss', 'diet pill', 
                'fat burner', 'gain muscle', 'followers', 'likes', 'views', 
                'subscribers', 'traffic', 'SEO', 'backlinks', 'rank up', 'boost'
            ];
            if (preg_match('/(.)\1{4,}/', $comment)) {
                return response()->json([
                    'message' => 'Bình luận không được phép chứa từ ngữ không phù hợp!',
                    'status' => 'spam'
                ], 200);
            }

            // 4️⃣ Regex lặp từ (ví dụ: "spam spam spam spam")
            if (preg_match('/\b(\w+)\b(?:\s+\1\b){3,}/', $comment)) {
                return response()->json([
                    'message' => 'Bình luận không được phép chứa từ ngữ không phù hợp!',
                    'status' => 'spam'
                ], 200);
            }

            foreach($badWords as $word) {
                if(stripos($comment,$word) !== false) {
                    return response()->json([
                        'message' => 'Bình luận không được phép chứa từ ngữ không phù hợp!',
                        'status' => 'blocked'
                    ], 200);
                }
            }

            foreach($spamWords as $word) {
                if(stripos($comment,$word) !== false) {
                                        return response()->json([
                        'message' => 'Bình luận không được phép chứa từ ngữ không phù hợp!',
                        'status' => 'blocked'
                    ], 200);
                }
            }
            return response()->json([
                'message' => 'Comment hợp lệ!',
                'status' => 'ok'
            ], 200);


        }catch(\Exception $e) {
            return response()->json([
                'error' => 'error post',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}