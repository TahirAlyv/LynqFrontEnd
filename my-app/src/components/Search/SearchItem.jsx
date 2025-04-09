import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/default-avatar.png';

const SearchItem = ({ user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (user.isPublic) {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <div style={styles.container} onClick={handleClick}>
      <img src={user.profileImage || defaultAvatar} alt="" style={styles.avatar} />
      <div style={styles.info}>
        <span style={{ fontWeight: 'bold' }}>{user.username}</span>
        {!user.isPublic && <span style={styles.lock}>🔒</span>}
      </div>
      <button style={styles.followBtn}>Takip Et</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  lock: {
    marginLeft: 8,
    color: '#888',
  },
  followBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: '6px 12px',
    cursor: 'pointer'
  }
};

export default SearchItem;
