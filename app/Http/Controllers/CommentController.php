<?php

namespace App\Http\Controllers;
use App\Models\Comment;
use App\Models\Film;
use App\Models\User;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index($idFilm) {
        try{
            $comments = Comment::all() ;
        } catch(\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ],500);
        }
    }

    public function getCommentByIdFilm($idFilm) {
        try{
            $film = Film::find($idFilm);
            $comments = $film->comments;
            return response()->json([
                'comments' => $comments,
                'message' => 'fetch comments successfully',
            ],200);
            
        } catch(\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ],500);
        }
    }
    public function getUserComment($idUser) {
        try {
            $user = User::findOrFail($idUser);
            $comments = $user->comments;

            return response()->json([
                'message'=>'fetch success',
                'user comment'=>$comments
            ],200);
        }catch(\Exception $e) {
            return response()->json([
                'error'=> 'Eror fetch ',
                'message' => $e->getMessage()
            ],500);
        }
    }
    public function postComment(Request $request) { 
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
            $comment->user_id = $user->id; // hoặc $userId
            $comment->film_id = $request->film_id;
            $comment->comment = $request->comment;
            $comment->created_at = now();
            $comment->save();


            return response()->json([
                'message'=>true,
                'User'=>$comment->user_id,
                'Comment'=> $comment->comment,


            ],200);
        }
        catch(\Exception $e) {
            return response()->json([
                'error'=> 'error post',
                'message'=> $e->getMessage()

            ],500);
        }

    }
}
