import React, { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

import EditPostModal from "./EditPostModal";
import pencil from "../../assets/pencil.png";
import likeActiveIcon from "../../assets/LikeActive.png";
import likeDeactiveIcon from "../../assets/LikeDeactive.png";
import commentIcon from "../../assets/comment.png";
import CommentWindow from "../comment/commentWindow";

const API_BASE_URL = "https://localhost:7257";

const PostItem = ({
  post,
  showActions = false,
  isEmployer = false,
  onPostUpdated,
  onPostDeleted,
  showToast,
  likeConnection,
  defaultCommentsOpen = false,
}) => {
  const commentCountConnectionRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(!!post.isLikedByCurrentUser);
  const [isCommentsOpen, setIsCommentsOpen] = useState(defaultCommentsOpen);  
  const [localCommentCount, setLocalCommentCount] = useState(
    post.commentCount || 0
  );

  const {
    id,
    username,
    userPhoto,
    role,
    content,
    imageUrl,
    videoUrl,
    createdAt,
  } = post;

  useEffect(() => {
    setLocalLikeCount(post.likeCount || 0);
    setIsLiked(!!post.isLikedByCurrentUser);
  }, [post.likeCount, post.isLikedByCurrentUser]);

  useEffect(() => {
    setLocalCommentCount(post.commentCount || 0);
  }, [post.commentCount]);
  
  useEffect(() => {
  if (defaultCommentsOpen) {
    setIsCommentsOpen(true);
  }
}, [defaultCommentsOpen]);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const connectCommentCounter = async () => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/commenthub`, {
            accessTokenFactory: () => localStorage.getItem("token"),
          })
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveCommentCountUpdated", (updatedPostId, count) => {
          if (!isMounted) return;

          if (Number(updatedPostId) !== Number(id)) return;

          setLocalCommentCount(count);

          onPostUpdated?.({
            ...post,
            commentCount: count,
          });
        });

        connection.onreconnected(() => {
          connection
            .invoke("JoinPostCounter", id)
            .catch((err) =>
              console.error("JoinPostCounter after reconnect failed:", err)
            );
        });

        await connection.start();
        await connection.invoke("JoinPostCounter", id);

        commentCountConnectionRef.current = connection;
      } catch (error) {
        console.error("Comment count connection failed:", error);
      }
    };

    connectCommentCounter();

    return () => {
      isMounted = false;

      const connection = commentCountConnectionRef.current;

      if (connection) {
        connection
          .invoke("LeavePostCounter", id)
          .catch((err) => console.error("LeavePostCounter failed:", err))
          .finally(() => {
            connection.stop().catch((err) => {
              console.error("Comment count connection stop failed:", err);
            });
          });
      }

      commentCountConnectionRef.current = null;
    };
  }, [id, onPostUpdated, post]);

  const handleLike = async () => {
    if (!likeConnection) {
      showToast?.("Like connection hazır deyil.", "error");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = localLikeCount;

    const nextLiked = !previousLiked;
    const nextCount = previousLiked
      ? Math.max(previousCount - 1, 0)
      : previousCount + 1;

    setIsLiked(nextLiked);
    setLocalLikeCount(nextCount);

    try {
      await likeConnection.invoke("ToggleLike", id);

      onPostUpdated?.({
        ...post,
        likeCount: nextCount,
        isLikedByCurrentUser: nextLiked,
      });
    } catch (error) {
      console.error("Like failed:", error);

      setIsLiked(previousLiked);
      setLocalLikeCount(previousCount);

      showToast?.("Like əməliyyatı uğursuz oldu.", "error");
    }
  };

  const handleCommentCreated = () => {
    // Comment count artıq ReceiveCommentCountUpdated ilə gəlir.
    // Ona görə burada manual artırmırıq ki, count 2 dəfə artmasın.
  };

  const handleCommentDeleted = () => {
    // Comment count artıq ReceiveCommentCountUpdated ilə gəlir.
    // Ona görə burada manual azaltmırıq ki, count 2 dəfə azalmasın.
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const profileImageSrc = userPhoto
    ? `${API_BASE_URL}${userPhoto}`
    : "https://via.placeholder.com/48";

  const postImageSrc = imageUrl ? `${API_BASE_URL}${imageUrl}` : null;
  const postVideoSrc = videoUrl ? `${API_BASE_URL}${videoUrl}` : null;

  return (
    <>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.authorSection}>
            <img
              src={profileImageSrc}
              alt={username || "User"}
              style={{
                ...styles.avatar,
                borderRadius: isEmployer ? "8px" : "50%",
              }}
            />

            <div>
              <div style={styles.authorName}>{username || "Unknown User"}</div>
              <div style={styles.authorMeta}>
                {role || "Member"}
                {formattedDate ? ` • ${formattedDate}` : ""}
              </div>
            </div>
          </div>

          {showActions && (
            <button
              type="button"
              style={styles.pencilButton}
              onClick={() => setIsEditOpen(true)}
            >
              <img src={pencil} alt="Edit post" style={styles.pencilIcon} />
            </button>
          )}
        </div>

        {content && <div style={styles.content}>{content}</div>}

        {postImageSrc && (
          <img src={postImageSrc} alt="Post" style={styles.postImage} />
        )}

        {postVideoSrc && (
          <video controls style={styles.postVideo}>
            <source src={postVideoSrc} />
            Your browser does not support the video tag.
          </video>
        )}

        <div style={styles.stats}>
          <span>{localLikeCount || 0} likes</span>

          <button
            type="button"
            className="comment-count-button"
            style={styles.commentCountButton}
            onClick={() => setIsCommentsOpen((prev) => !prev)}
          >
            {localCommentCount || 0} comments
          </button>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            className="post-footer-button"
            style={styles.footerButton}
            onClick={handleLike}
          >
            <img
              src={isLiked ? likeActiveIcon : likeDeactiveIcon}
              alt={isLiked ? "Liked" : "Like"}
              style={styles.footerIcon}
            />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          <button
            type="button"
            className="post-footer-button"
            style={styles.footerButton}
            onClick={() => setIsCommentsOpen((prev) => !prev)}
          >
            <img src={commentIcon} alt="Comment" style={styles.footerIcon} />
            <span>Comment</span>
          </button>

          <button type="button" className="post-footer-button" style={styles.footerButton}>
            Share
          </button>
        </div>

        {isCommentsOpen && (
          <div style={styles.commentsBox}>
            <CommentWindow
              postId={id}
              isPostOwner={showActions}
              onCommentCreated={handleCommentCreated}
              onCommentDeleted={handleCommentDeleted}
              showToast={showToast}
            />
          </div>
        )}
      </div>

      {isEditOpen && (
        <EditPostModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          post={post}
          showToast={showToast}
          onUpdated={(updatedPost) => {
            onPostUpdated?.({
              ...post,
              ...updatedPost,
              id: post.id,
            });

            setIsEditOpen(false);
          }}
          onDeleted={(deletedPostId) => {
            onPostDeleted?.(deletedPostId);
            setIsEditOpen(false);
          }}
        />
      )}
    </>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "14px",
  },

  authorSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ddd",
  },

  authorName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#222",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  authorMeta: {
    fontSize: "13px",
    color: "#666",
    marginTop: "2px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  content: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#222",
    marginBottom: "14px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  postImage: {
    width: "100%",
    maxHeight: "420px",
    objectFit: "cover",
    borderRadius: "14px",
    marginBottom: "14px",
    border: "1px solid #eee",
  },

  postVideo: {
    width: "100%",
    maxHeight: "420px",
    borderRadius: "14px",
    marginBottom: "14px",
    border: "1px solid #eee",
    backgroundColor: "#000",
  },

  stats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#666",
    paddingBottom: "12px",
    marginBottom: "12px",
    borderBottom: "1px solid #eee",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },

  footerButton: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#444",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
  },

  footerIcon: {
    width: 18,
    height: 18,
    objectFit: "contain",
  },

  commentsBox: {
    marginTop: "14px",
    borderTop: "1px solid #eee",
    paddingTop: "12px",
  },

  pencilButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pencilIcon: {
    width: 18,
    height: 18,
    objectFit: "contain",
  },

  commentCountButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    fontSize: "13px",
    color: "#666",
    cursor: "pointer",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export default PostItem;