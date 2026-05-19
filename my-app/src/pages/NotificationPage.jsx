import React, { useEffect, useState } from "react";
import Navbar from "../components/Layout/Navbar";
import defaultAvatar from "../assets/default-avatar.png";
import api from "../services/api";
import { clearUnread } from "../store/notificationSlice";
import { useDispatch } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ===============================
     🧠 SAFE DATE PARSER (ƏSAS FIX)
  =============================== */
  const toSafeDate = (value) => {
    if (!value) return null;

    let s = String(value);

    // fractional seconds çox uzundursa qısalt
    s = s.replace(/\.(\d{3})\d+/, ".$1");

    // timezone yoxdursa UTC kimi qəbul et
    if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
      s += "Z";
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const getActivityDate = (n) =>
    toSafeDate(n.lastTriggeredAt) || toSafeDate(n.createdAt);

  const sortByActivity = (list) =>
    [...list].sort((a, b) => {
      const da = getActivityDate(a)?.getTime() ?? 0;
      const db = getActivityDate(b)?.getTime() ?? 0;
      return db - da;
    });

  /* ===============================
     🔔 SIGNALR – NotificationHub
  =============================== */
  useEffect(() => {
    let connection;

    const connect = async () => {
      connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7257/notificationhub", {
          accessTokenFactory: () => localStorage.getItem("token"),
        })
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveNotification", (notification) => {
        setNotifications((prev) => {
          const index = prev.findIndex((n) => n.id === notification.id);

          let updated;
          if (index !== -1) {
            // 🔁 mövcud notification update
            updated = [...prev];
            updated[index] = notification;
          } else {
            // 🆕 yeni notification
            updated = [notification, ...prev];
          }

          return sortByActivity(updated);
        });
      });

      await connection.start();
      console.log("✅ NotificationHub connected");
    };

    connect();
    dispatch(clearUnread());

    return () => {
      connection?.stop();
    };
  }, [dispatch]);

  /* ===============================
     📥 FETCH INITIAL DATA
  =============================== */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/Notifications/notifications");
        setNotifications(sortByActivity(res.data));
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  /* ===============================
     🧠 MESSAGE BY TYPE
  =============================== */
  const getMessage = (n) => {
    switch (n.type) {
      case "Like":
        return "liked your post";
      case "Comment":
        return "commented on your post";
      case "Follow":
        return "started following you";
      default:
        return n.contentPreview || "";
    }
  };

  /* ===============================
     ⏱️ DISPLAY TIME (SAFE)
  =============================== */
  const getDisplayTime = (n) => {
    const d = getActivityDate(n);
    if (!d) return "just now";
    return formatDistanceToNow(d, { addSuffix: true });
  };

  /* ===============================
     👉 CLICK HANDLER
  =============================== */
  const handleNotificationClick = (n) => {
    if (n.type === "Like" || n.type === "Comment") {
      navigate(`/post/${n.postId}`);
    } else if (n.type === "Follow") {
      navigate(`/profile/${n.senderId}`);
    }
  };

  /* ===============================
     🖼️ UI
  =============================== */
  if (isLoading) {
    return (
      <div style={styles.page}>
        <h2 style={styles.title}>🔔 Notifications</h2>
        <p style={styles.empty}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>🔔 Notifications</h2>

        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              style={styles.notificationItem}
              onClick={() => handleNotificationClick(n)}
            >
              <img
                src={n.senderProfilePhoto || defaultAvatar}
                alt="Profile"
                style={styles.avatar}
              />

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span>
                  <strong>{n.senderUsername}</strong> {getMessage(n)}
                </span>
                <span style={styles.time}>{getDisplayTime(n)}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.empty}>No notifications yet.</p>
        )}
      </div>
    </>
  );
};

/* ===============================
   🎨 STYLES
=============================== */
const styles = {
  page: {
    padding: "30px",
    maxWidth: "700px",
    margin: "0 auto",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: "12px 20px",
    borderRadius: "12px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  time: {
    fontSize: "12px",
    color: "#777",
    marginTop: "4px",
  },
  empty: {
    color: "#777",
    marginTop: "30px",
    textAlign: "center",
  },
};

export default NotificationPage;
