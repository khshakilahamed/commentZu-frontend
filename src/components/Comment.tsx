import z from "zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "./ui/card";
import { useSocket } from "@/hooks/useSocket";
import type { IApiResponse, TComment, TMeta } from "@/types";
import axiosInstance from "@/lib/axios";
import CommentItem from "./CommentItem";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";

export const commentSchema = z.object({
  content: z.string().min(1),
});

export type TCommentData = z.infer<typeof commentSchema>;

export const SORT_BY = {
  NEWEST: "newest",
  MOST_LIKED: "mostLiked",
  MOST_DISLIKED: "mostDisliked",
} as const;

export type SortByType = (typeof SORT_BY)[keyof typeof SORT_BY];

const Comment = () => {
  const [comments, setComments] = useState<TComment[]>([]);
  const [metaData, setMetaData] = useState<TMeta>();
  const [selectedSortBy, setSelectedSortBy] = useState<SortByType>(
    SORT_BY.NEWEST
  );
  const [page, setPage] = useState<number>(1);
  const [limit, _] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const { isConnected, emit, on, off } = useSocket();
  const {
    register,
    handleSubmit,
    reset,
  } = useForm<TCommentData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  // Fetch comments with page & sort
  const fetchComments = useCallback(
    async (
      sort?: SortByType,
      pageNumber: number = 1,
      append: boolean = false
    ) => {
      setLoading(true);
      try {
        const query = `?sortBy=${sort}&page=${pageNumber}&limit=${limit}`;
        const { data } = await axiosInstance.get<
          IApiResponse<{
            data: TComment[];
            meta: TMeta;
          }>
        >(`/v1/comment${query}`);

        if (data?.success) {
          const responseData = data?.data?.data || [];
          setMetaData(data?.data?.meta);

          setComments((prev) =>
            append ? [...prev, ...responseData] : responseData
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch when sort or page changes
  useEffect(() => {
    fetchComments(selectedSortBy, page, page > 1);
  }, [selectedSortBy, page, fetchComments]);

  // Reset page when sort changes
  useEffect(() => {
    setPage(1);
  }, [selectedSortBy]);

  // Real-time listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleAdded = (newComment: TComment) => {
      if (selectedSortBy === SORT_BY.NEWEST && page === 1) {
        setComments((prev) => [newComment, ...prev]);
      }
    };

    const handleDeleted = (commentId: string) => {
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    };

    const handleLiked = (data: TComment) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === data._id ? JSON.parse(JSON.stringify(data)) : comment
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
                totalDislike: data.dislikes.length,
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
  }, [isConnected, on, off, selectedSortBy, page]);

  // Submit new comment
  const onSubmit = async (payload: TCommentData) => {
    setIsPostingComment(true);
    try {
      const { data } = await axiosInstance.post<IApiResponse<TComment>>(
        "/v1/comment",
        payload
      );
      if (data?.success) {
        setComments((prev) => [data.data, ...prev]);
        emit("comment:add", data.data);
        reset();
      }
    } catch (_) {
    } finally {
      setIsPostingComment(false);
    }
  };

  // Load more handler
  const handleLoadMore = () => {
    if (metaData?.page && metaData?.totalPages && page < metaData.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-5 mb-10">
      <Card className="px-5 gap-2">
        <h2 className="font-semibold text-primary">Share your thoughts</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <Textarea
            className="h-[100px]"
            placeholder="Type here..."
            {...register("content")}
          />
          <Button
            disabled={isPostingComment}
            type="submit"
            className="cursor-pointer"
          >
            {isPostingComment ? "Sharing..." : "Share"}
          </Button>
        </form>
      </Card>

      <Card className="px-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl text-primary">
            Total Displaying: {comments?.length ?? 0}
          </h2>

          <Select
            value={selectedSortBy}
            onValueChange={(v) => setSelectedSortBy(v as SortByType)}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(SORT_BY).map((sortItem) => (
                  <SelectItem
                    key={sortItem}
                    value={sortItem}
                    className="capitalize"
                  >
                    {sortItem}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Comments or Skeleton */}
        {loading && page === 1 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="h-5 w-1/4 mb-2" /> {/* author */}
                <Skeleton className="h-4 w-full" /> {/* content */}
              </div>
            ))}
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              setComments={setComments}
              emit={emit}
            />
          ))
        )}

        {metaData?.page &&
          metaData?.totalPages &&
          page < metaData.totalPages && (
            <div className="flex justify-center mt-5">
              <Button onClick={handleLoadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
      </Card>
    </div>
  );
};

export default Comment;
