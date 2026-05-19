import React from 'react';
import defaultAvatar from '../../assets/default-avatar.png';
import { useDispatch } from 'react-redux';
import { clearUnreadForUser } from '../../store/messageSlice';

const ChatItem = ({ convo, onSelect, currentUser, isSelected }) => {
  debugger;
  const dispatch = useDispatch();

  // 🔍 1️⃣ Kiminle konuşuyoruz belirle
  const isDirectMessage = !('sender' in convo) && !('receiver' in convo);

  const displayName = isDirectMessage ? convo.username : (convo.sender === currentUser ? convo.receiver : convo.sender);
  const displayPhoto = isDirectMessage ? convo.profileImage : (convo.sender === currentUser ? convo.receiverProfileImage : convo.senderProfileImage);

  // 🔥 2️⃣ Tıklanıldığında sohbeti seç ve Redux'tan temizle
  const handleClick = () => {
    if (onSelect) {
      const targetUser = isDirectMessage ? convo.username : (convo.sender === currentUser ? convo.receiver : convo.sender);

      // Redux'tan okunmamışları temizle
      dispatch(clearUnreadForUser(targetUser));

      // Sohbeti seç
      onSelect(targetUser);
    }
  };

  // 🔍 3️⃣ Son mesajı belirle
  const lastMessage = 
    convo.message && Array.isArray(convo.message) && convo.message.length > 0 
    ? convo.message[convo.message.length - 1]?.content || "No content" 
    : "No messages yet";

  return (
    <div 
     style={{ 
        ...styles.item, 
        backgroundColor: isSelected ? '#f9f9f9' : 'transparent',
        boxShadow: isSelected ? '0px 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
        borderLeft: isSelected ? '4px solid #007bff' : 'none',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease'
      }} 
      onClick={handleClick}
    >
      <img src={displayPhoto || defaultAvatar} alt="avatar" style={styles.avatar} />
      <div style={styles.info}>
        <p style={styles.name}>{displayName}</p>
        <p style={styles.message}>{lastMessage}</p>
      </div>
    </div>

 
  );
};

const styles = {
item: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',

  padding: '12px 14px',
  borderRadius: '14px',

  cursor: 'pointer',
  userSelect: 'none',

  borderBottom: '1px solid #e0e0e0ff',  

  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
},

  itemHover: {
    backgroundColor: '#f1f5f9',
  },

  itemSelected: {
    backgroundColor: '#e0e7ff',
    boxShadow: 'inset 4px 0 0 #4f46e5',
  },

  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,

    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
    flex: 1,
  },

  name: {
    fontSize: '14.5px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  message: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    marginLeft: 'auto',
  },
};


export default ChatItem;
