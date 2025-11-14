import { useAuth } from "@/hooks/useAuth";
import {
  FaRegThumbsUp,
  FaThumbsUp,
  FaRegThumbsDown,
  FaThumbsDown,
} from "react-icons/fa6";
import { Button } from "./ui/button";
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/lib/axios";
import type { IApiResponse, TComment } from "@/types";
import { useForm } from "react-hook-form";
import { type TCommentData } from "./Comment";
import { useSocket } from "@/hooks/useSocket";
import { formatDateTime } from "@/helpers/formatDateTime";

interface CommentItemProps {
  comment: TComment;
  setComments: React.Dispatch<React.SetStateAction<TComment[]>>;
  emit: (event: string, payload?: any) => void;
}

const CommentItem = ({ comment, setComments, emit }: CommentItemProps) => {
  const { user } = useAuth();
  const { isConnected, on, off } = useSocket();

  const [showReplyField, setShowReplyField] = useState(false);
  const [repliesMap, setRepliesMap] = useState<Record<string, TComment[]>>({});
  const [isReplying, setIsReplying] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const { register, handleSubmit, reset } = useForm<TCommentData>({
    defaultValues: { content: "" },
  });

  // Real-time listener for new replies
  useEffect(() => {
    if (!isConnected) return;

    const handleReplyAdded = (payload: TComment) => {
      if (payload.parentComment !== comment._id) return; // only update relevant comment
      setRepliesMap((prev) => ({
        ...prev,
        [comment._id]: [payload, ...(prev[comment._id] || [])],
      }));
    };

    on("comment:reply:added", handleReplyAdded);

    return () => {
      off("comment:reply:added", handleReplyAdded);
    };
  }, [isConnected, on, comment._id]);

  const isLikeOrDislike = (
    userId: string,
    data: TComment["likes"] | TComment["dislikes"]
  ) => {
    return !!data?.find((id) => id === userId);
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const { data } = await axiosInstance.get<IApiResponse<TComment>>(
        `/v1/comment/${commentId}/like`
      );
      if (data?.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? data.data : c))
        );
        emit("comment:like", data.data);
      }
    } catch (_) {}
  };

  const handleDislikeComment = async (commentId: string) => {
    try {
      const { data } = await axiosInstance.get<IApiResponse<TComment>>(
        `/v1/comment/${commentId}/dislike`
      );
      if (data?.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? data.data : c))
        );
        emit("comment:dislike", data.data);
      }
    } catch (_) {}
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { data } = await axiosInstance.delete<IApiResponse<TComment>>(
        `/v1/comment/${commentId}/parent`
      );
      if (data?.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        emit("comment:delete", commentId);
      }
    } catch (_) {}
  };

  const fetchReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const { data } = await axiosInstance.get<IApiResponse<TComment[]>>(
        `/v1/comment/${comment._id}/reply`
      );
      if (data?.success) {
        setRepliesMap((prev) => ({ ...prev, [comment._id]: data.data }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReplies(false);
    }
  }, []);

  const onSubmitReply = async (payload: TCommentData) => {
    setIsReplying(true);
    try {
      const { data } = await axiosInstance.post<IApiResponse<TComment>>(
        `/v1/comment/${comment._id}/reply`,
        payload
      );
      if (data?.success) {
        setRepliesMap((prev) => ({
          ...prev,
          [comment._id]: [...(prev[comment._id] || []), data.data],
        }));
        // emit("comment:reply:add", data.data);
        reset();
      }
    } catch (_) {
    } finally {
      setIsReplying(false);
    }
  };

  const replies = repliesMap[comment._id] || [];

  return (
    <div className="p-2 border rounded-lg">
      <div>
        <h2 className="text-primary font-bold">
          {comment?.author?._id === user?._id
            ? "You"
            : `${comment?.author?.firstName} ${comment?.author?.lastName}`}
        </h2>
        <p className="text-gray-400 text-sm">
          {formatDateTime(comment?.createdAt)}
        </p>
        <p>{comment?.content}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        {/* Like */}
        <p
          className="flex items-center gap-0.5 cursor-pointer"
          onClick={() => handleLikeComment(comment._id)}
        >
          {isLikeOrDislike(user?._id as string, comment.likes) ? (
            <FaThumbsUp />
          ) : (
            <FaRegThumbsUp />
          )}
          {comment.totalLike ?? 0}
        </p>

        {/* Dislike */}
        <p
          className="flex items-center gap-0.5 cursor-pointer"
          onClick={() => handleDislikeComment(comment._id)}
        >
          {isLikeOrDislike(user?._id as string, comment.dislikes) ? (
            <FaThumbsDown />
          ) : (
            <FaRegThumbsDown />
          )}
          {comment.totalDislike ?? 0}
        </p>

        {/* Reply & Delete */}
        <Button
          variant="link"
          onClick={() => {
            setShowReplyField((prev) => !prev);
            fetchReplies();
          }}
        >
          Reply
        </Button>
        {comment.author._id === user?._id && (
          <Button
            variant="link"
            onClick={() => handleDeleteComment(comment._id)}
          >
            Delete
          </Button>
        )}
      </div>

      {showReplyField && (
        <div className="ml-8 mt-4 space-y-2">
          {loadingReplies && <p>Loading...</p>}
          {!loadingReplies && (
            <>
              {replies?.length ? (
                replies.map((reply) => (
                  <div key={reply._id} className="border rounded-lg p-2 ml-4">
                    <h2 className="text-sm text-primary font-bold">
                      {reply?.author?._id === user?._id
                        ? "You"
                        : `${comment?.author?.firstName} ${comment?.author?.lastName}`}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {formatDateTime(reply?.createdAt)}
                    </p>
                    <p>{reply.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-primary">
                  No reply found
                </p>
              )}
            </>
          )}

          {/* Reply form */}
          <form
            onSubmit={handleSubmit(onSubmitReply)}
            className="space-y-2 pt-2"
          >
            <Textarea placeholder="Type here..." {...register("content")} />
            <Button disabled={isReplying} size="sm" type="submit">
              {isReplying ? "Replying..." : "Reply"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
