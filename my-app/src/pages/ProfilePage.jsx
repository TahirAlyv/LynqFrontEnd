import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import defaultAvatar from '../assets/default-avatar.png';
import Navbar from '../components/Layout/Navbar';
import CreatePost from '../components/Post/CreatePost';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/me');
        setUser(res.data);
      } catch (err) {
        console.error("Profil bilgisi alınamadı:", err);
      }
    };
    fetchProfile();
  }, []);

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;

  return (
    <>
      <Navbar />
      <div style={styles.pageWrapper}>
        <div style={styles.mainContent}>
          <div style={styles.profileCard}>
            <img
              src={user.photoUrl || defaultAvatar}
              alt="profil"
              style={styles.avatar}
            />
            <div style={styles.infoSection}>
              <h2 style={styles.name}>{user.username}</h2>
              <p style={styles.bio}>{user.bio || 'Biyografi yok'}</p>
              <p style={styles.detail}><strong>Meslek:</strong> {user.profession || 'Belirtilmemiş'}</p>
              <p style={styles.detail}><strong>Deneyim:</strong> {user.experience || 'Yok'}</p>
            </div>
          </div>

          <div style={styles.container}>
            <div style={{ width: '620px', marginTop: '30px' }}>
            <CreatePost onPostCreated={(newPost) => console.log('Post eklendi:', newPost)} />
         </div>
</div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.sidebarBox}>
            <p style={styles.sidebarItem} onClick={() => navigate('/profile/edit')}>Profili Düzenle</p>
            <p style={styles.sidebarItem} onClick={() => navigate('/followers')}>Takipçiler</p>
            <p style={styles.sidebarItem} onClick={() => navigate('/following')}>Takip Ettiklerim</p>
          </div>
 
        </div>
      </div>
    </>
  );
};

const styles = {
  pageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    padding: '40px',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '600px',
    height: '200px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #007bff',
    marginRight: '20px'
  },
  infoSection: {
    flex: 1
  },
  name: {
    margin: '0 0 10px',
    fontSize: '22px',
    color: '#222'
  },
  bio: {
    margin: '4px 0',
    color: '#555',
  },
  detail: {
    margin: '2px 0',
    color: '#444',
    fontSize: '14px'
  },
  postArea: {
    width: '600px'
  },
  postBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #ccc'
  },
  postIcon: {
    fontSize: '20px'
  },
  postText: {
    fontWeight: 'bold'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  sidebarItem: {
    fontWeight: '500',
    color: '#222',
    cursor: 'pointer'
  }
};

export default ProfilePage;
