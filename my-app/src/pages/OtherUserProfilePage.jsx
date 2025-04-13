import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import defaultAvatar from '../assets/default-avatar.png';
import Navbar from '../components/Layout/Navbar';

const OtherUserProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const fetchUser = async () => {
    try {
      debugger;
      const res = await api.get(`/User/otheruser/${username}`);
      setUser(res.data);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error('Failed to retrieve user information:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [username]);

  const handleFollow = async () => {
    if (!user) return;
    if (isFollowing) {
      setShowUnfollowModal(true);
    } else {
      try {
        await api.post(`/Follow/follow/${user.username}`);
        setIsFollowing(true);
        fetchUser();
      } catch (err) {
        console.error('Follow error:', err);
      }
    }
  };

  const confirmUnfollow = async () => {
    try {
      await api.post(`/Follow/unfollow/${user.username}`);
      setIsFollowing(false);
      setShowUnfollowModal(false);
      fetchUser();
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    }
  };

  if (!user) return <div style={{ textAlign: 'center', marginTop: '60px' }}>Loading....</div>;

  return (
    <>
      <Navbar />
      <div style={styles.pageWrapper}>
        <div style={styles.profileCard}>
          <img
            src={user.profileImage || defaultAvatar}
            alt="Profil"
            style={styles.avatar}
          />
          <div style={styles.info}>
            <h2 style={styles.name}>{user.username}</h2>
            <p style={styles.bio}>{user.bio || 'No biography available'}</p>
            <div style={styles.stats}>
              <span><strong>Follow:</strong> {user.following}</span>
              <span><strong>Follower:</strong> {user.followers}</span>
            </div>
            <div style={styles.actions}>
              <button
                onClick={handleFollow}
                style={{
                  ...styles.button,
                  ...(isFollowing ? styles.following : styles.notFollowing)
                }}
              >
              {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                style={styles.messageButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#007bff';
                  e.target.style.border = '2px solid #007bff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#007bff';
                  e.target.style.color = '#fff';
                  e.target.style.border = 'none';
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>

        {user.visibility === 0 && !isFollowing && (
          <div style={styles.privateNotice}>
            <p><strong>This profile is private.</strong></p>
            <p>Follow to see their posts.</p>
          </div>
        )}
      </div>

      {showUnfollowModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
           <p>Do you want to unfollow this user?</p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button style={styles.cancelButton} onClick={() => setShowUnfollowModal(false)}>Cancel</button>
            <button style={styles.confirmButton} onClick={confirmUnfollow}>Unfollow</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh'
  },
  profileCard: {
    backgroundColor: '#fff',
    display: 'flex',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '600px',
    gap: '25px'
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #007bff'
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  name: {
    fontSize: '24px',
    margin: 0
  },
  bio: {
    color: '#555'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#666'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  },
  notFollowing: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none'
  },
  following: {
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #007bff'
  },
  messageButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  privateNotice: {
    marginTop: '30px',
    padding: '25px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 0 12px rgba(0,0,0,0.1)',
    width: '600px',
    textAlign: 'center',
    color: '#555',
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  modal: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '12px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  cancelButton: {
    padding: '8px 12px',
    backgroundColor: '#ddd',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  confirmButton: {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default OtherUserProfilePage;
