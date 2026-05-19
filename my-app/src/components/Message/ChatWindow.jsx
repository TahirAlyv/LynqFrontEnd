import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import MessageInput from './MessageInput';
import api from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setActiveChat } from '../../store/messageSlice';
import defaultAvatar from '../../assets/default-avatar.png';
import { useNavigate } from 'react-router-dom';
const ChatWindow = ({ receiver }) => {
  const [messages, setMessages] = useState([]);
  const [messageIds, setMessageIds] = useState(new Set());
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();


  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  /* 🔐 Current user */
  let currentUsername = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUsername =
        decoded["unique_name"] ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    } catch {}
  }

  const handleClickProfile = () => {
    navigate(`/profile/${receiver}`);
  }

  /* 🕒 Saat formatı */
  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  /* 👤 Receiver user data */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get(`/user/otheruser/${receiver}`);
        setUserData(res.data);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    receiver && fetchUserData();
  }, [receiver]);

  /* 🔌 SignalR */
  useEffect(() => {
    const connect = async () => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7257/chathub", {
          accessTokenFactory: () => localStorage.getItem("token"),
        })
        .withAutomaticReconnect()
        .build();

      conn.on("ReceiveMessage", (message) => {
        if (
          (message.sender === receiver || message.receiver === receiver) &&
          (message.sender === currentUsername ||
            message.receiver === currentUsername)
        ) {
          if (!messageIds.has(message.dateTime)) {
            setMessages((prev) => [...prev, message]);
            setMessageIds((prev) => new Set(prev.add(message.dateTime)));
          }
        }
      });

      await conn.start();
      connectionRef.current = conn;
    };

    connect();
    dispatch(setActiveChat(receiver));

    return () => {
      dispatch(setActiveChat(null));
      connectionRef.current?.stop();
    };
  }, [receiver]);

  /* 📥 History */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${receiver}`);
        setMessages(res.data);
        res.data.forEach((m) =>
          setMessageIds((prev) => new Set(prev.add(m.dateTime)))
        );
      } catch {
        setMessages([]);
      }
    };

    receiver && fetchMessages();
  }, [receiver]);

  /* 📤 Send */
  const handleSend = async (text) => {
    if (!text.trim() || !connectionRef.current) return;

    const newMessage = {
      sender: currentUsername,
      receiver,
      content: text,
      dateTime: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageIds((prev) => new Set(prev.add(newMessage.dateTime)));

    try {
      await connectionRef.current.invoke("SendMessage", receiver, text);
    } catch {}
  };

  /* ⬇️ Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.wrapper}>
      {/* 🔥 HEADER – Instagram style */}
      <div style={styles.header}>
        <img
          src={userData?.logoUrl || defaultAvatar}
          alt="avatar"
          style={styles.avatar}
        />

        <div style={styles.headerInfo}>
          <div style={styles.username} onClick={handleClickProfile}>{userData?.userName || receiver}</div>
          <div style={styles.subInfo}>
            {userData?.companyName || userData?.bio || ''}
          </div>
        </div>
      </div>

      {/* 💬 MESSAGES */}
      <div style={styles.messages}>
        {messages.map((msg, i) => {
          const isMe = msg.sender === currentUsername;

          return (
            <div
              key={i}
              style={{
                ...styles.messageBubble,
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? '#dbeafe' : '#f1f5f9',
              }}
            >
              <div style={styles.messageText}>{msg.content}</div>
              <div style={styles.messageTime}>
                {formatTime(msg.dateTime)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ✍️ INPUT */}
      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;


const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff',
  },

  /* HEADER */
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',

    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },

  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  username: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111827',
    cursor: 'pointer',

  },

  subInfo: {
    fontSize: '12px',
    color: '#6b7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  /* MESSAGES */
  messages: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f8fafc',

    display: 'flex',
    flexDirection: 'column',
    gap: '10px',

    overflowY: 'auto',
  },

  messageBubble: {
    display: 'flex',
    flexDirection: 'column',

    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '70%',

    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    wordBreak: 'break-word',
  },

  messageText: {
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#111827',
    whiteSpace: 'pre-wrap',
  },

  messageTime: {
    alignSelf: 'flex-end',
    marginTop: '4px',
    fontSize: '11px',
    opacity: 0.55,
  },
};
