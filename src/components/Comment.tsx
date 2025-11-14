import z from "zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "./ui/card";
import { useSocket } from "@/hooks/useSocket";
import type { IApiResponse, TComment, TCommentResponse, TMeta } from "@/types";
import axiosInstance from "@/lib/axios";
import CommentItem from "./CommentItem";

const commentSchema = z.object({
  content: z.string().min(1),
});

type TCommentData = z.infer<typeof commentSchema>;

const Comment = () => {
  const [comments, setComments] = useState<TComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const { isConnected, emit, on, off } = useSocket();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TCommentData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  // Fetch initial comments (API)
  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data } = await axiosInstance.get<
      IApiResponse<{
        data: TComment[];
        meta: TMeta;
      }>
    >("/v1/comment");

    const responseData = data?.data?.data || [];

    setComments(responseData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 🔥 Real-time listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleAdded = (newComment: TComment) => {
      setComments((prev) => [newComment, ...prev]);
    };

    const handleDeleted = ({ commentId }: { commentId: string }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    const handleLiked = (data: TComment) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === data?._id ? JSON.parse(JSON.stringify(data)) : comment
        )
      );
    };

    const handleDisliked = (data: any) => {
      setComments((prev) =>
        prev.map((c) =>
          c._id === data.commentId
            ? {
                ...c,
                dislikes: data.dislikes,
                dislikesCount: data.dislikes.length,
              }
            : c
        )
      );
    };

    on("comment:added", handleAdded);
    on("comment:deleted", handleDeleted);
    on("comment:liked", handleLiked);
    on("comment:disliked", handleDisliked);

    return () => {
      off("comment:added", handleAdded);
      off("comment:deleted", handleDeleted);
      off("comment:liked", handleLiked);
      off("comment:disliked", handleDisliked);
    };
  }, [isConnected, on, off]);

  // 🔥 Emit new comment to backend
  const onSubmit = async (payload: TCommentData) => {
    setIsPostingComment(true);
    try {
      const { data } = await axiosInstance.post<IApiResponse<TComment>>(
        "/v1/comment",
        payload
      );

      if (data?.success) {
        setComments([data?.data, ...comments]);
        emit("comment:add", data?.data); // socket broadcast
        reset();
      }
    } catch (_) {
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="space-y-5 mb-10">
      <Card className="px-5 gap-2">
        <div>
          <h2 className="text">Share your thoughts</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <Textarea
              className="h-[100px]"
              placeholder="Type here..."
              {...register("content")}
            />
            <Button disabled={isPostingComment} type="submit">
              {isPostingComment ? "Sharing..." : "Share"}
            </Button>
          </form>
        </div>
      </Card>

      <Card className="px-5">
        {comments?.map((comment) => (
          <CommentItem
            key={comment?._id}
            comment={comment}
            setComments={setComments}
            emit={emit}
          />
        ))}
      </Card>
    </div>
  );
};

export default Comment;
