import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import defaultAvatar from '../../assets/default-avatar.png';  

const Navbar = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <Link to="/home" style={styles.logo}>MiniLink</Link>
        <Link to="/home">Ana Sayfa</Link>
        <Link to="/jobs">İş İlanları</Link>
        <Link to="/messages">Mesajlar</Link>
        <Link to="/notifications">Bildirimler</Link>
      </div>

      <div style={styles.right}>
        <Link to="/profile">
          <img
            src={user?.photoUrl || defaultAvatar}
            alt="Profil"
            style={styles.avatar}
          />
        </Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    height: '60px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  left: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    color: '#0073b1',
    textDecoration: 'none',
    fontSize: '20px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
  },
};

export default Navbar;