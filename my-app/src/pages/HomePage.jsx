import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Navbar from "../components/Layout/Navbar";
import CreatePostBox from "../components/Post/CreatePostBox";
import HomeFeed from "../components/Home/HomeFeed";
import Toast from "../components/UI/Toast";

import api from "../services/api";
import defaultAvatar from "../assets/default-avatar.png";
import defaultBackground from "../assets/defoultBackground.jpg";

const API_ROOT = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

const HomePage = ({ likeConnection }) => {
  const user = useSelector((state) => state.user.user);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [toast, setToast] = useState(null);
  const isCurrentEmployer =
  user?.userType === "Employer" ||
  user?.role === "Employer" ||
  user?.roleName === "Employer" ||
  user?.basicInfo?.userType === "Employer" ||
  user?.basicInfo?.role === "Employer" ||
  user?.basicInfo?.roleName === "Employer" ||
  !!user?.companyInfo ||
  !!user?.company;

  const basicInfo = user?.basicInfo || user || {};

  const fullName =
    basicInfo.fullName ||
    user?.fullName ||
    user?.name ||
    "User";

  const username =
    basicInfo.username ||
    user?.username ||
    "";

  const currentPosition =
    basicInfo.currentPosition ||
    user?.currentPosition ||
    "Member";

  const location =
    basicInfo.location ||
    user?.location ||
    "";

  const profileImage =
    basicInfo.profileImage ||
    user?.profileImage ||
    "";

  const backgroundImage =
    basicInfo.backgroundImage ||
    user?.backgroundImage ||
    "";

  const profileImageSrc = profileImage
    ? `${API_ROOT}/${profileImage.replace(/^\/+/, "")}`
    : defaultAvatar;

  const backgroundImageSrc = backgroundImage
    ? `${API_ROOT}/${backgroundImage.replace(/^\/+/, "")}`
    : defaultBackground;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchConnectionCount = async () => {
      try {
        const res = await api.get("/Connection/my-connections");

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.Data)
          ? res.data.Data
          : [];

        setConnectionCount(data.length);
      } catch (err) {
        console.error("Connection count failed:", err);
      }
    };

    fetchConnectionCount();
  }, []);

  useEffect(() => {
    if (!isCreateOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [isCreateOpen]);

  const handlePostCreated = () => {
    setIsCreateOpen(false);
    setFeedRefreshKey((prev) => prev + 1);
    showToast("Post shared successfully.", "success");
  };

  return (
    <div>
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={styles.page}>
        <div style={styles.layout}>
          <aside style={styles.leftSidebar}>
            <div style={styles.profileCard}>
              <div
                style={{
                  ...styles.cover,
                  backgroundImage: `url(${backgroundImageSrc})`,
                }}
              />

              <div style={styles.profileBody}>
                <img
                  src={profileImageSrc}
                  alt={fullName}
                  style={{
                    ...styles.profileAvatar,
                    borderRadius: isCurrentEmployer ? "10px" : "50%",
                  }}
                />

                <div style={styles.profileName}>{fullName}</div>

                <div style={styles.profileTitle}>
                  {currentPosition || "Member"}
                </div>

                {location && (
                  <div style={styles.profileLocation}>{location}</div>
                )}

                {username && (
                  <a href="/profile" style={styles.profileLink}>
                    View profile
                  </a>
                )}
              </div>
            </div>

            <div style={styles.statsCard}>
              <div style={styles.statsRow}>
                <span>Connections</span>
                <strong>{connectionCount}</strong>
              </div>

              <div style={styles.smallMuted}>Grow your network</div>
            </div>
 
          </aside>

          <main style={styles.feed}>
            <div style={styles.createCard}>
              <div style={styles.createTop}>
                <img
                  src={profileImageSrc}
                  alt={fullName}
                  style={{
                    ...styles.createAvatar,
                    borderRadius: isCurrentEmployer ? "8px" : "50%",
                  }}
                />

                <button
                  type="button"
                  style={styles.createInput}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Start a post
                </button>
              </div>

              <div style={styles.createActions}>
                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Video
                </button>

                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Photo
                </button>

                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Write article
                </button>
              </div>
            </div>

            <div style={styles.sortRow}>
              <div style={styles.line}></div>
              <span>Sort by: Top</span>
            </div>

            <HomeFeed
              key={feedRefreshKey}
              likeConnection={likeConnection}
              showToast={showToast}
            />
          </main>
        </div>
      </div>

      {isCreateOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsCreateOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={styles.modalClose}
              onClick={() => setIsCreateOpen(false)}
            >
              ×
            </button>

            <CreatePostBox onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f3f2ef",
    minHeight: "100vh",
    paddingTop: "18px",
    paddingBottom: "40px",
  },

layout: {
  maxWidth: "980px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "225px 720px",
  gap: "22px",
  alignItems: "flex-start",
},

  leftSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  profileCard: {
    backgroundColor: "#fff",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
    overflow: "hidden",
  },

  cover: {
    height: "58px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#dce6ef",
  },

  profileBody: {
    position: "relative",
    padding: "40px 14px 14px",
    textAlign: "center",
  },

  profileAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fff",
    position: "absolute",
    top: "-38px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#fff",
  },

  profileName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#191919",
    lineHeight: "1.2",
    marginBottom: "5px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  profileTitle: {
    fontSize: "12px",
    color: "#333",
    lineHeight: "1.35",
    marginBottom: "4px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  profileLocation: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "10px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  profileLink: {
    display: "inline-block",
    marginTop: "8px",
    fontSize: "13px",
    color: "#0a66c2",
    fontWeight: "700",
    textDecoration: "none",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  statsCard: {
    backgroundColor: "#fff",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
    padding: "12px 14px",
  },

  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    color: "#191919",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  smallMuted: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  menuCard: {
    backgroundColor: "#fff",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
    padding: "8px 0",
  },

  menuItem: {
    padding: "8px 14px",
    fontSize: "13px",
    color: "#191919",
    fontWeight: "600",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

 feed: {
  width: "680px",
},
  createCard: {
    backgroundColor: "#fff",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "14px",
  },

  createTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  createAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  createInput: {
    flex: 1,
    height: "48px",
    borderRadius: "999px",
    border: "1px solid #b2b2b2",
    backgroundColor: "#fff",
    textAlign: "left",
    padding: "0 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    cursor: "pointer",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  createActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actionButton: {
    border: "none",
    backgroundColor: "transparent",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#444",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  sortRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
    fontSize: "12px",
    color: "#666",
    justifyContent: "flex-end",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  line: {
    flex: 1,
    height: "1px",
    backgroundColor: "#d0d0d0",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "70px",
  },

  modalContent: {
    width: "560px",
    position: "relative",
  },

  modalClose: {
    position: "absolute",
    top: "10px",
    right: "12px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f3f2ef",
    color: "#333",
    fontSize: "24px",
    lineHeight: "32px",
    cursor: "pointer",
    zIndex: 2,
  },
};

export default HomePage;