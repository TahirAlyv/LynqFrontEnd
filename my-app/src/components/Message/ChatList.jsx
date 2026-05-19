import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatItem from './ChatItem';
import api from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const ChatList = () => {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const navigate = useNavigate();
  const { username: selectedUsername } = useParams();

  let currentUser = null;
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUser =
        decoded['unique_name'] ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    } catch {}
  }

  /* ⏱ Debounce */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* 💬 Chats */
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      api.get('/chat/user-chats')
        .then(res => setConversations(res.data))
        .catch(() => setConversations([]));
    }
  }, [debouncedSearch]);

  /* 🔍 Search */
  useEffect(() => {
    if (debouncedSearch.trim()) {
      api.get(`/user/users?query=${debouncedSearch}`)
        .then(res => setAllUsers(res.data))
        .catch(() => setAllUsers([]));
    }
  }, [debouncedSearch]);

  const displayList = debouncedSearch.trim() ? allUsers : conversations;

  return (
    <div style={styles.container}>
      {/* 🔍 SEARCH – STICKY */}
      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search messages"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* 📜 LIST – SCROLL BURDA */}
      <div style={styles.list}>
        {displayList.length ? (
          displayList.map((conv, i) => {
            const targetUser = debouncedSearch.trim()
              ? conv.username
              : conv.receiver === currentUser
              ? conv.sender
              : conv.receiver;

            return (
              <ChatItem
                key={i}
                convo={conv}
                currentUser={currentUser}
                isSelected={selectedUsername === targetUser}
                onSelect={() => navigate(`/messages/${targetUser}`)}
              />
            );
          })
        ) : (
          <p style={styles.noUsers}>No conversations found</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },

  /* 🔍 SEARCH */
  searchWrapper: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: '#f8fafc',
    paddingBottom: '12px',
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
  },

  /* 📜 LIST */
  list: {
    flex: 1,              // 👈 ƏSAS HƏLL
    overflowY: 'auto',    // 👈 scroll yalnız burda
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  noUsers: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '24px',
    fontStyle: 'italic',
    fontSize: '14px',
  },
};
