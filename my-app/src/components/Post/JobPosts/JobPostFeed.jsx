import JobPostItem from "./JobPostItem";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import Toast from "../../UI/Toast";

 
export default function EmployerJobPosts({ userId, isOwner }) {
  const [jobPosts, setJobPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);


  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!userId) return;
    fetchPosts(1, true);
  }, [userId, isOwner]);


   const fetchPosts = async (pageNumber, reset = false) => {
   setLoading(true);
   try {
     const url = isOwner

       ? `/JobPost/my?page=${pageNumber}&pageSize=${PAGE_SIZE}`
       : `/JobPost/user/${userId}?page=${pageNumber}&pageSize=${PAGE_SIZE}`;
     const res = await api.get(url);
     const newPosts = res.data || [];
     setJobPosts(prev =>
       reset ? newPosts : [...prev, ...newPosts]
     );
     setHasMore(newPosts.length === PAGE_SIZE);
     setPage(pageNumber);
   } catch (err) {
     console.error("Failed to load posts", err);
   } finally {
     setLoading(false);
   }
 };
 
  // ✅ update handler
const handlePostUpdated = (postId, updatedPost) => {
  setPosts(prev =>
    prev.map(p => (p.id === postId ? { ...p, ...updatedPost } : p))
  );
};

// ✅ delete handler
const handlePostDeleted = (postId) => {
  setPosts(prev => prev.filter(p => p.id !== postId));
};


  if (!posts.length && loading) {
    return <div style={styles.info}>Loading posts...</div>;
  }


    return (
      <div style={styles.mainContainer}>
        {posts.map(post => (
          <JobPostItem 
            key={post.id}
            post={post}
            isOwner={isOwner}
            onUpdated={handlePostUpdated}   // ✅ əlavə et
            onDeleted={handlePostDeleted}   // ✅ əlavə et
            showToast={showToast} 
          />
        ))}
  
        {/* LOAD MORE */}
        {hasMore && (
          <button
            style={styles.loadMore}
            disabled={loading}
            onClick={() => fetchPosts(page + 1)}
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        )}
  
        {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      </div>
    );
  }
  
  
  /* 🎨 STYLES */
  const styles = {
    mainContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  


 

}