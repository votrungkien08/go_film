import { useComments } from "@/hooks/useComment";
import { useParams } from "react-router-dom";
import { MessageCircle, Send, UserCircleIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFilmBySlug } from "@/hooks/useFilm";

export default function CommentsSection() {
    const { slug } = useParams<{ slug: string }>();
    const { isLogin, user } = useAuth();
    const { film } = useFilmBySlug(slug!);
    const { comments, comment, setComment, handlePostComment } = useComments(
        film?.id,
        isLogin
    );
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl">
                {/* Comment Form */}
                <div className="bg-gray-800  p-4 mb-6">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2">
                            <UserCircleIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        {user ? (
                            <div>
                                <p className="text-gray-400 text-sm">
                                    Bình luận với tên
                                </p>
                                <p className="text-white text-left font-medium">
                                    {user?.name}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">
                                Bình luận với tên
                            </p>
                        )}
                    </div>

                    {/* Comment Input */}
                    <div className="relative mb-4">
                        <textarea
                            value={comment}
                            placeholder="Viết bình luận"
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-gray-700 text-white placeholder-gray-400 border-none rounded-lg p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                            maxLength={1000}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                            {comment.length} / 1000
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePostComment}
                            disabled={!comment.trim()}
                            className="flex items-center gap-2 bg-[#ff4c00] cursor-pointer text-black font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Gửi</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-screen overflow-y-auto">
                    {comments.map((c) => (
                        <div key={c.id} className="bg-gray-800 rounded-lg p-4">
                            {/* Comment Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2">
                                    <UserCircleIcon className="h-10 w-10 text-gray-300" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-medium">
                                            {c.user?.name}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            {c.created_at}
                                        </span>
                                    </div>
                                    {c.comment && (
                                        <p className="bg-green-600 text-left text-white text-xs px-2 py-0.5 rounded font-bold">
                                            {c.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {comments.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Chưa có bình luận nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}
