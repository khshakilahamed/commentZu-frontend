import { useAuth } from "@/hooks/useAuth";
import {
  FaRegThumbsUp,
  FaThumbsUp,
  FaRegThumbsDown,
  FaThumbsDown,
} from "react-icons/fa6";
import { Button } from "./ui/button";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/lib/axios";
import type { IApiResponse, TComment } from "@/types";

interface CommentItemProps {
  comment: any;
  onCommentsUpdate?: () => void;
  setComments: React.Dispatch<React.SetStateAction<TComment[]>>;
  emit: (event: string, payload?: any) => void;
}

const CommentItem = ({ comment, setComments, emit }: CommentItemProps) => {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);

  const isLikeOrDislike = (userId: string, data: string[]) => {
    const isExist = data?.find((id) => id === userId);

    return !!isExist;
  };

  const handleLikeComment = async (commentId: string) => {
    if (!commentId) {
      return;
    }
    try {
      const { data } = await axiosInstance.get<IApiResponse<TComment>>(
        `/v1/comment/${commentId}/like`
      );

      console.log("Like: ", JSON.stringify(data?.data));

      if (data?.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? JSON.parse(JSON.stringify(data.data))
              : comment
          )
        );

        emit("comment:like", data?.data);
      }
    } catch (_) {}
  };

  const handleDislikeComment = async (commentId: string) => {
    if (!commentId) {
      return;
    }
    try {
      const { data } = await axiosInstance.get<IApiResponse<TComment>>(
        `/v1/comment/${commentId}/dislike`
      );

      console.log("Like: ", JSON.stringify(data?.data));

      if (data?.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? JSON.parse(JSON.stringify(data.data))
              : comment
          )
        );

        emit("comment:like", data?.data);
      }
    } catch (_) {}
  };

  //   console.log("comment: ", comment);

  return (
    <div className="p-2 border rounded-lg">
      <div>
        <h2 className="text-primary font-bold">
          {comment?.author?.firstName} {comment?.author?.lastName}
        </h2>
        <p>{comment?.content}</p>
      </div>
      <div className="flex gap-3 mt-2">
        {/* Like */}
        <p className="flex items-center gap-0.5">
          <span
            onClick={() => handleLikeComment(comment?._id)}
            className="cursor-pointer"
          >
            {isLikeOrDislike(
              user?._id as string,
              comment?.likes as string[]
            ) ? (
              <FaThumbsUp />
            ) : (
              <FaRegThumbsUp />
            )}
          </span>
          {comment?.totalLike ?? 0}
        </p>
        {/* Dislike */}
        <p className="flex items-center gap-0.5">
          <span onClick={()=> handleDislikeComment(comment?._id)} className="cursor-pointer">
            {isLikeOrDislike(
              user?._id as string,
              comment?.dislikes as string[]
            ) ? (
              <FaThumbsDown />
            ) : (
              <FaRegThumbsDown />
            )}
          </span>
          {comment?.totalDislike ?? 0}
        </p>

        <div>
          <Button
            onClick={() => setShowReply((prev) => !prev)}
            variant={"link"}
            className="cursor-pointer"
          >
            Reply
          </Button>
          {comment?.author?._id === user?._id && (
            <Button variant={"link"} className="cursor-pointer">
              Delete
            </Button>
          )}
        </div>
      </div>

      {showReply && (
        <div className="mt-4 pt-4 border-t ">
          <Textarea placeholder="Reply..." />
        </div>
      )}
    </div>
  );
};

export default CommentItem;
