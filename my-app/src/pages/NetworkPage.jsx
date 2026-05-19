import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import api from "../services/api";
import Toast from "../components/UI/Toast";
import {
  setPendingReceivedCount,
  clearConnectionUpdateCount,
} from "../store/connectionSlice";

const API_BASE_URL = "https://localhost:7257";

const NetworkPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("received");
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const getResponseData = (res) => {
    return res?.data?.data ?? res?.data?.Data ?? res?.data ?? null;
  };

  const getDataArray = (res) => {
    const data = getResponseData(res);

    if (Array.isArray(data)) return data;

    return [];
  };

  const getItemId = (item) => {
    return item?.id ?? item?.Id ?? item?.userId ?? item?.UserId ?? null;
  };

  const getUsername = (item) => {
    return item?.username ?? item?.Username ?? null;
  };

  const sameItem = (a, b) => {
    const aId = getItemId(a);
    const bId = getItemId(b);

    if (aId && bId) {
      return String(aId) === String(bId);
    }

    const aUsername = getUsername(a);
    const bUsername = getUsername(b);

    if (aUsername && bUsername) {
      return aUsername.toLowerCase() === bUsername.toLowerCase();
    }

    return false;
  };

  const addUniqueById = (list, item) => {
    if (!item) return list;

    const exists = list.some((x) => sameItem(x, item));
    if (exists) return list;

    return [item, ...list];
  };

  const removeByRequestId = (list, request) => {
    const requestId =
      typeof request === "object" ? getItemId(request) : request;

    if (!requestId) return list;

    return list.filter((x) => String(getItemId(x)) !== String(requestId));
  };

  const removeByUser = (list, user) => {
    if (!user) return list;

    return list.filter((x) => !sameItem(x, user));
  };

  const getRequestSender = (request) => {
    return request?.sender ?? request?.Sender ?? null;
  };

  const getRequestReceiver = (request) => {
    return request?.receiver ?? request?.Receiver ?? null;
  };

  const parseUtcDate = (dateValue) => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) return dateValue;

    if (typeof dateValue !== "string") {
      return new Date(dateValue);
    }

    const hasTimezone =
      dateValue.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateValue);

    return new Date(hasTimezone ? dateValue : `${dateValue}Z`);
  };

  const getDateValue = (item, type) => {
    if (!item) return null;

    if (type === "connections") {
      return item.connectedAt ?? item.ConnectedAt ?? null;
    }

    if (type === "received" || type === "sent") {
      return item.createdAt ?? item.CreatedAt ?? null;
    }

    return (
      item.createdAt ??
      item.CreatedAt ??
      item.respondedAt ??
      item.RespondedAt ??
      item.connectedAt ??
      item.ConnectedAt ??
      null
    );
  };

  const formatTimeAgo = (dateValue) => {
    const date = parseUtcDate(dateValue);

    if (!date || Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return "now";

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} d ago`;
    if (diffWeeks < 5) return `${diffWeeks} w ago`;
    if (diffMonths < 12) return `${diffMonths} mo ago`;

    return `${diffYears} y ago`;
  };

  const getMetaText = (type, item) => {
    const timeText = formatTimeAgo(getDateValue(item, type));

    if (!timeText) return "";

    if (type === "received") return `Requested ${timeText}`;
    if (type === "sent") return `Sent ${timeText}`;
    if (type === "connections") return `Connected ${timeText}`;

    return timeText;
  };

  const normalizeConnection = (user, fallbackDate) => {
    if (!user) return user;

    return {
      ...user,
      connectedAt:
        user.connectedAt ??
        user.ConnectedAt ??
        fallbackDate ??
        new Date().toISOString(),
    };
  };

  const goToProfile = (user) => {
    const username = getUsername(user);

    if (!username) return;

    navigate(`/profile/${username}`);
  };

  const updateReceivedRequests = (updater) => {
    setReceivedRequests((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      dispatch(setPendingReceivedCount(next.length));
      return next;
    });
  };

  const updateConnections = (updater) => {
    setConnections((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  };

  const fetchNetworkData = async () => {
    try {
      setLoading(true);

      const [receivedRes, sentRes, connectionsRes] = await Promise.all([
        api.get("/Connection/received"),
        api.get("/Connection/sent"),
        api.get("/Connection/my-connections"),
      ]);

      const received = getDataArray(receivedRes);
      const sent = getDataArray(sentRes);
      const myConnections = getDataArray(connectionsRes);

      setReceivedRequests(received);
      setSentRequests(sent);
      setConnections(myConnections);

      dispatch(setPendingReceivedCount(received.length));
    } catch (err) {
      console.error("Failed to fetch network data:", err);
      showToast("Network data could not be loaded.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openRemoveModal = (user) => {
    setSelectedConnection(user);
    setIsRemoveModalOpen(true);
  };

  const closeRemoveModal = () => {
    if (removing) return;

    setIsRemoveModalOpen(false);
    setSelectedConnection(null);
  };

  const handleRemoveConnection = async () => {
    const username = getUsername(selectedConnection);

    if (!username) {
      showToast("Username not found.", "error");
      return;
    }

    try {
      setRemoving(true);

      await api.post(`/Connection/remove/${username}`);

      updateConnections((prev) => removeByUser(prev, selectedConnection));

      setIsRemoveModalOpen(false);
      setSelectedConnection(null);
    } catch (err) {
      console.error("Remove connection failed:", err);
      showToast("Connection could not be removed.", "error");
    } finally {
      setRemoving(false);
    }
  };

  useEffect(() => {
    dispatch(clearConnectionUpdateCount());
    fetchNetworkData();
  }, []);

  useEffect(() => {
    if (!isRemoveModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isRemoveModalOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/connectionhub`, {
        accessTokenFactory: () => localStorage.getItem("token"),
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveConnectionRequest", (request) => {
      updateReceivedRequests((prev) => addUniqueById(prev, request));
    });

    connection.on("ConnectionRequestSent", (request) => {
      setSentRequests((prev) => addUniqueById(prev, request));
    });

    connection.on("ReceiveConnectionAccepted", (request) => {
      const requestId = getItemId(request);
      const receiver = getRequestReceiver(request);
      const respondedAt = request?.respondedAt ?? request?.RespondedAt;

      setSentRequests((prev) => removeByRequestId(prev, requestId));

      if (receiver) {
        updateConnections((prev) =>
          addUniqueById(prev, normalizeConnection(receiver, respondedAt))
        );
      }
    });

    connection.on("ConnectionRequestAcceptedByMe", (request) => {
      const requestId = getItemId(request);
      const sender = getRequestSender(request);
      const respondedAt = request?.respondedAt ?? request?.RespondedAt;

      updateReceivedRequests((prev) => removeByRequestId(prev, requestId));

      if (sender) {
        updateConnections((prev) =>
          addUniqueById(prev, normalizeConnection(sender, respondedAt))
        );
      }
    });

    connection.on("ReceiveConnectionRejected", (request) => {
      setSentRequests((prev) => removeByRequestId(prev, request));
    });

    connection.on("ConnectionRequestRejectedByMe", (request) => {
      updateReceivedRequests((prev) => removeByRequestId(prev, request));
    });

    connection.on("ReceiveConnectionCancelled", (request) => {
      updateReceivedRequests((prev) => removeByRequestId(prev, request));
    });

    connection.on("ConnectionRequestCancelledByMe", (request) => {
      setSentRequests((prev) => removeByRequestId(prev, request));
    });

    connection.on("ConnectedDirectlyByMe", (user) => {
      updateConnections((prev) =>
        addUniqueById(prev, normalizeConnection(user))
      );
    });

    connection.on("ReceiveDirectConnection", (user) => {
      updateConnections((prev) =>
        addUniqueById(prev, normalizeConnection(user))
      );
    });

    connection.on("ConnectionRemovedByMe", (removedUser) => {
      updateConnections((prev) => removeByUser(prev, removedUser));
    });

    connection.on("ReceiveConnectionRemoved", () => {
      fetchNetworkData();
    });

    connection
      .start()
      .then(() => console.log("ConnectionHub connected in NetworkPage"))
      .catch((err) => console.error("ConnectionHub error:", err));

    return () => {
      connection.stop();
    };
  }, [dispatch]);

  const handleAccept = async (request) => {
    const requestId = getItemId(request);

    if (!requestId) {
      showToast("Request id not found.", "error");
      return;
    }

    try {
      const res = await api.post(`/Connection/accept/${requestId}`);
      const responseRequest = getResponseData(res) ?? request;

      updateReceivedRequests((prev) => removeByRequestId(prev, requestId));

      const sender = getRequestSender(responseRequest) ?? getRequestSender(request);
      const respondedAt =
        responseRequest?.respondedAt ??
        responseRequest?.RespondedAt ??
        request?.respondedAt ??
        request?.RespondedAt;

      if (sender) {
        updateConnections((prev) =>
          addUniqueById(prev, normalizeConnection(sender, respondedAt))
        );
      }
    } catch (err) {
      console.error("Accept request failed:", err);
      showToast("Request could not be accepted.", "error");
    }
  };

  const handleReject = async (request) => {
    const requestId = getItemId(request);

    if (!requestId) {
      showToast("Request id not found.", "error");
      return;
    }

    try {
      await api.post(`/Connection/reject/${requestId}`);

      updateReceivedRequests((prev) => removeByRequestId(prev, requestId));
    } catch (err) {
      console.error("Reject request failed:", err);
      showToast("Request could not be rejected.", "error");
    }
  };

  const handleCancel = async (request) => {
    const requestId = getItemId(request);

    if (!requestId) {
      showToast("Request id not found.", "error");
      return;
    }

    try {
      await api.post(`/Connection/cancel/${requestId}`);

      setSentRequests((prev) => removeByRequestId(prev, requestId));
    } catch (err) {
      console.error("Cancel request failed:", err);
      showToast("Request could not be cancelled.", "error");
    }
  };

  const getProfileImage = (user) => {
    const profileImage = user?.profileImage ?? user?.ProfileImage;

    if (!profileImage) return "https://via.placeholder.com/46";

    if (
      profileImage.startsWith("http://") ||
      profileImage.startsWith("https://")
    ) {
      return profileImage;
    }

    return `${API_BASE_URL}/${profileImage.replace(/^\/+/, "")}`;
  };

  const renderUserInfo = (user, metaText = "") => {
    const fullName = user?.fullName ?? user?.FullName ?? "Unknown user";
    const currentPosition =
      user?.currentPosition ?? user?.CurrentPosition ?? "No position";
    const username = user?.username ?? user?.Username ?? "unknown";

    return (
      <div style={styles.userInfo}>
        <img src={getProfileImage(user)} alt="User" style={styles.avatar} />

        <div>
          <div
            className="network-fullname"
            style={styles.fullName}
            onClick={() => goToProfile(user)}
            title="View profile"
          >
            {fullName}
          </div>

          <div style={styles.position}>{currentPosition}</div>
          <div style={styles.username}>@{username}</div>

          {metaText && <div style={styles.metaText}>{metaText}</div>}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .network-fullname:hover {
            text-decoration: underline;
          }
        `}
      </style>

      <Navbar />

      <main style={styles.page}>
        <section style={styles.container}>
          <h1 style={styles.title}>Network</h1>
          <p style={styles.subtitle}>
            Manage your connection requests and connections.
          </p>

          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "received" ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab("received")}
            >
              Received
              {receivedRequests.length > 0 && (
                <span style={styles.tabCount}>{receivedRequests.length}</span>
              )}
            </button>

            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "sent" ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab("sent")}
            >
              Sent
              {sentRequests.length > 0 && (
                <span style={styles.tabCount}>{sentRequests.length}</span>
              )}
            </button>

            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "connections" ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab("connections")}
            >
              Connections
              {connections.length > 0 && (
                <span style={styles.connectionTabCount}>
                  {connections.length}
                </span>
              )}
            </button>
          </div>

          <div style={styles.content}>
            {loading && <p style={styles.emptyText}>Loading...</p>}

            {!loading && activeTab === "received" && (
              <>
                {receivedRequests.length === 0 ? (
                  <p style={styles.emptyText}>
                    No received connection requests yet.
                  </p>
                ) : (
                  receivedRequests.map((request) => (
                    <div key={getItemId(request)} style={styles.requestItem}>
                      {renderUserInfo(
                        getRequestSender(request),
                        getMetaText("received", request)
                      )}

                      <div style={styles.actions}>
                        <button
                          style={styles.acceptBtn}
                          onClick={() => handleAccept(request)}
                        >
                          Accept
                        </button>

                        <button
                          style={styles.rejectBtn}
                          onClick={() => handleReject(request)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {!loading && activeTab === "sent" && (
              <>
                {sentRequests.length === 0 ? (
                  <p style={styles.emptyText}>
                    No sent connection requests yet.
                  </p>
                ) : (
                  sentRequests.map((request) => (
                    <div key={getItemId(request)} style={styles.requestItem}>
                      {renderUserInfo(
                        getRequestReceiver(request),
                        getMetaText("sent", request)
                      )}

                      <div style={styles.actions}>
                        <button
                          style={styles.cancelBtn}
                          onClick={() => handleCancel(request)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {!loading && activeTab === "connections" && (
              <>
                {connections.length === 0 ? (
                  <p style={styles.emptyText}>No connections yet.</p>
                ) : (
                  connections.map((user) => (
                    <div
                      key={getItemId(user) ?? getUsername(user)}
                      style={styles.requestItem}
                    >
                      {renderUserInfo(user, getMetaText("connections", user))}

                      <div style={styles.actions}>
                        <button
                          style={styles.connectedBtn}
                          onClick={() => openRemoveModal(user)}
                        >
                          Connected
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {isRemoveModalOpen && (
        <div style={styles.removeModalOverlay} onClick={closeRemoveModal}>
          <div
            style={styles.removeModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.removeModalTitle}>Remove connection?</h3>

            <p style={styles.removeModalText}>
              Do you want to remove this connection?
            </p>

            <div style={styles.removeModalActions}>
              <button
                style={styles.removeCancelBtn}
                onClick={closeRemoveModal}
                disabled={removing}
              >
                Cancel
              </button>

              <button
                style={styles.removeConfirmBtn}
                onClick={handleRemoveConnection}
                disabled={removing}
              >
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f2ef",
    paddingTop: "80px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "20px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
    color: "#191919",
  },

  subtitle: {
    marginTop: "6px",
    marginBottom: "18px",
    color: "#666",
    fontSize: "14px",
  },

  tabs: {
    display: "flex",
    gap: "10px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "12px",
  },

  tabButton: {
    border: "none",
    backgroundColor: "#f3f2ef",
    color: "#555",
    padding: "8px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  activeTab: {
    backgroundColor: "#0a66c2",
    color: "#fff",
  },

  tabCount: {
    minWidth: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#e11d48",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
  },

  connectionTabCount: {
    minWidth: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#16a34a",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
  },

  content: {
    paddingTop: "20px",
  },

  emptyText: {
    color: "#777",
    fontSize: "14px",
  },

  requestItem: {
    minHeight: "72px",
    borderBottom: "1px solid #eee",
    padding: "12px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "#eee",
  },

  fullName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#191919",
    cursor: "pointer",
  },

  position: {
    fontSize: "13px",
    color: "#666",
    marginTop: "2px",
  },

  username: {
    fontSize: "12px",
    color: "#777",
    marginTop: "2px",
  },

  metaText: {
    fontSize: "12px",
    color: "#999",
    marginTop: "2px",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },

  acceptBtn: {
    border: "none",
    backgroundColor: "#0a66c2",
    color: "#fff",
    padding: "7px 13px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  rejectBtn: {
    border: "1px solid #999",
    backgroundColor: "#fff",
    color: "#555",
    padding: "7px 13px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  cancelBtn: {
    border: "1px solid #d93025",
    backgroundColor: "#fff",
    color: "#d93025",
    padding: "7px 13px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  connectedBtn: {
    border: "none",
    backgroundColor: "#5f9f6f",
    color: "#fff",
    padding: "7px 13px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  removeModalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },

  removeModal: {
    width: "100%",
    maxWidth: "380px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  },

  removeModalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#191919",
  },

  removeModalText: {
    marginTop: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.4",
  },

  removeModalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  removeCancelBtn: {
    border: "1px solid #999",
    backgroundColor: "#fff",
    color: "#555",
    padding: "8px 14px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  removeConfirmBtn: {
    border: "none",
    backgroundColor: "#d93025",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default NetworkPage;