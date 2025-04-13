import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import defaultAvatar from '../../assets/default-avatar.png';  

const Navbar = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <nav style={styles.navbar}>
  <div style={styles.left}>
    <Link to="/home" style={styles.logo}>WorkHub</Link>
    <Link to="/home">Home</Link>
    <Link to="/jobs">Job Listings</Link>
    <Link to="/messages">Messages</Link>
    <Link to="/notifications">Notifications</Link>
    
    <div style={styles.searchBox} onClick={handleSearchClick}>
      <span style={styles.icon}>🔍</span>
      <span style={styles.placeholder}>Search</span>
    </div>
  </div>

  <div style={styles.right}>
    <Link to="/profile">
      <img
        src={user?.photoUrl || defaultAvatar}
        alt="Profile"
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
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    padding: '6px 12px',
    cursor: 'pointer',
    width: '100px',
  },
  icon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  placeholder: {
    color: '#555',
    fontSize: '14px',
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
