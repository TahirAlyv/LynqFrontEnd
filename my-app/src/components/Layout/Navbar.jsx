import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import defaultAvatar from '../../assets/default-avatar.png';
import home from '../../assets/home.png';
import network from '../../assets/network.png';
import job from '../../assets/briefcase.png';
import chat from '../../assets/chat.png';
import notifications from '../../assets/notification.png';
import logout from '../../assets/logout.png';
import SearchModal from '../Search/SearchModal';

import * as signalR from '@microsoft/signalr';
import api from '../../services/api';

import { clearUnread as clearMessageUnread } from '../../store/messageSlice';
import { clearUnread as clearNotificationUnread } from '../../store/notificationSlice';

import {
  setPendingReceivedCount,
  incrementConnectionUpdateCount,
  clearConnectionUpdateCount,
} from '../../store/connectionSlice';

const API_ROOT = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const Navbar = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const unreadMessages = useSelector((state) => state.messages.unreadMessages);

  const notificationUnreadCount = useSelector(
    (state) => state.notifications.unreadCount
  );

  const pendingReceivedCount = useSelector(
    (state) => state.connections.pendingReceivedCount
  );

  const connectionUpdateCount = useSelector(
    (state) => state.connections.connectionUpdateCount
  );

  const networkBadgeCount = pendingReceivedCount + connectionUpdateCount;

  const navigate = useNavigate();
  const location = useLocation();

  const [modal, setModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const modalRef = useRef(null);

  const totalUnreadCount = Object.values(unreadMessages || {}).reduce(
    (acc, count) => acc + Number(count || 0),
    0
  );

  const isHome = location.pathname === '/home';
  const isNetwork = location.pathname.startsWith('/network');
  const isJobs = location.pathname.startsWith('/jobs');
  const isMessages = location.pathname.startsWith('/messages');
  const isNotifications = location.pathname.startsWith('/notifications');
  const isProfile = location.pathname.startsWith('/profile');

  const getImageUrl = (path) => {
    if (!path) return defaultAvatar;

    const cleanPath = String(path).trim();

    if (!cleanPath) return defaultAvatar;

    if (
      cleanPath.startsWith('http://') ||
      cleanPath.startsWith('https://') ||
      cleanPath.startsWith('blob:')
    ) {
      return cleanPath;
    }

    return `${API_ROOT}/${cleanPath.replace(/^\/+/, '')}`;
  };

  const profileImage =
    user?.photoUrl ||
    user?.profileImage ||
    user?.basicInfo?.profileImage ||
    user?.companyInfo?.logoUrl ||
    user?.company?.logoUrl ||
    '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');

    dispatch(clearMessageUnread());
    dispatch(clearNotificationUnread());
    dispatch(clearConnectionUpdateCount());

    setLogoutModal(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModal(false);
      }
    };

    if (modal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal]);

  useEffect(() => {
    if (!logoutModal) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [logoutModal]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) return;

    const fetchPendingRequestsCount = async () => {
      try {
        const res = await api.get('/Connection/received');

        const requests = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.Data)
          ? res.data.Data
          : [];

        dispatch(setPendingReceivedCount(requests.length));
      } catch (err) {
        console.error('Failed to fetch connection request count:', err);
      }
    };

    fetchPendingRequestsCount();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_ROOT}/connectionhub`, {
        accessTokenFactory: () => localStorage.getItem('token'),
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveConnectionRequest', () => {
      fetchPendingRequestsCount();
    });

    connection.on('ReceiveConnectionCancelled', () => {
      fetchPendingRequestsCount();
    });

    connection.on('ConnectionRequestAcceptedByMe', () => {
      fetchPendingRequestsCount();
    });

    connection.on('ConnectionRequestRejectedByMe', () => {
      fetchPendingRequestsCount();
    });

    connection.on('ReceiveConnectionAccepted', () => {
      dispatch(incrementConnectionUpdateCount());
    });

    connection.on('ConnectedDirectlyByMe', () => {
      dispatch(incrementConnectionUpdateCount());
    });

    connection
      .start()
      .then(() => console.log('ConnectionHub connected in Navbar'))
      .catch((err) => console.error('ConnectionHub error in Navbar:', err));

    return () => {
      connection.stop();
    };
  }, [dispatch]);

  return (
    <>
      <style>
        {`
          .navbar-icon {
            opacity: 0.55;
            transition: opacity 0.18s ease, transform 0.18s ease;
          }

          .navbar-icon-link:hover .navbar-icon {
            opacity: 1;
            transform: translateY(-1px);
          }

          .navbar-icon-active {
            opacity: 1;
          }

          .navbar-profile-avatar {
            opacity: 0.75;
            transition: opacity 0.18s ease, transform 0.18s ease;
          }

          .navbar-icon-link:hover .navbar-profile-avatar {
            opacity: 1;
            transform: translateY(-1px);
          }

          .navbar-profile-avatar-active {
            opacity: 1;
          }

          .navbar-logout-button:hover img {
            opacity: 1 !important;
            transform: translateY(-1px);
          }
        `}
      </style>

      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.brandArea}>
            <Link to="/home" style={styles.logo}>
              WorkHub
            </Link>

            {location.pathname !== '/search' && (
              <div ref={modalRef} style={styles.searchWrap}>
                <SearchModal />
              </div>
            )}
          </div>

          <div style={styles.menu}>
            <div style={styles.navItem}>
              <Link
                to="/home"
                className="navbar-icon-link"
                style={{
                  ...styles.iconLink,
                  ...(isHome ? styles.activeLink : {}),
                }}
              >
                <img
                  src={home}
                  alt="Home"
                  className={`navbar-icon ${
                    isHome ? 'navbar-icon-active' : ''
                  }`}
                  style={{
                    ...styles.iconImage,
                    ...(isHome ? styles.activeIcon : {}),
                  }}
                />
              </Link>

              <span
                style={{
                  ...styles.label,
                  ...(isHome ? styles.activeLabel : {}),
                }}
              >
                Home
              </span>
            </div>

            <div style={styles.navItem}>
              <Link
                to="/network"
                className="navbar-icon-link"
                onClick={() => dispatch(clearConnectionUpdateCount())}
                style={{
                  ...styles.iconLink,
                  ...(isNetwork ? styles.activeLink : {}),
                }}
              >
                <img
                  src={network}
                  alt="Network"
                  className={`navbar-icon ${
                    isNetwork ? 'navbar-icon-active' : ''
                  }`}
                  style={{
                    ...styles.iconImage,
                    ...(isNetwork ? styles.activeIcon : {}),
                  }}
                />

                {networkBadgeCount > 0 && (
                  <span style={styles.badge}>{networkBadgeCount}</span>
                )}
              </Link>

              <span
                style={{
                  ...styles.label,
                  ...(isNetwork ? styles.activeLabel : {}),
                }}
              >
                Network
              </span>
            </div>

            <div style={styles.navItem}>
              <Link
                to="/jobs"
                className="navbar-icon-link"
                style={{
                  ...styles.iconLink,
                  ...(isJobs ? styles.activeLink : {}),
                }}
              >
                <img
                  src={job}
                  alt="Jobs"
                  className={`navbar-icon ${
                    isJobs ? 'navbar-icon-active' : ''
                  }`}
                  style={{
                    ...styles.iconImage,
                    ...(isJobs ? styles.activeIcon : {}),
                  }}
                />
              </Link>

              <span
                style={{
                  ...styles.label,
                  ...(isJobs ? styles.activeLabel : {}),
                }}
              >
                Jobs
              </span>
            </div>

            <div style={styles.navItem}>
              <Link
                to="/messages"
                className="navbar-icon-link"
                style={{
                  ...styles.iconLink,
                  ...(isMessages ? styles.activeLink : {}),
                }}
              >
                <img
                  src={chat}
                  alt="Messages"
                  className={`navbar-icon ${
                    isMessages ? 'navbar-icon-active' : ''
                  }`}
                  style={{
                    ...styles.iconImage,
                    ...(isMessages ? styles.activeIcon : {}),
                  }}
                />

                {totalUnreadCount > 0 && (
                  <span style={styles.badge}>{totalUnreadCount}</span>
                )}
              </Link>

              <span
                style={{
                  ...styles.label,
                  ...(isMessages ? styles.activeLabel : {}),
                }}
              >
                Messages
              </span>
            </div>

            <div style={styles.navItem}>
              <Link
                to="/notifications"
                className="navbar-icon-link"
                style={{
                  ...styles.iconLink,
                  ...(isNotifications ? styles.activeLink : {}),
                }}
              >
                <img
                  src={notifications}
                  alt="Notifications"
                  className={`navbar-icon ${
                    isNotifications ? 'navbar-icon-active' : ''
                  }`}
                  style={{
                    ...styles.iconImage,
                    ...(isNotifications ? styles.activeIcon : {}),
                  }}
                />

                {notificationUnreadCount > 0 && (
                  <span style={styles.badge}>{notificationUnreadCount}</span>
                )}
              </Link>

              <span
                style={{
                  ...styles.label,
                  ...(isNotifications ? styles.activeLabel : {}),
                }}
              >
                Notifications
              </span>
            </div>

            <div style={styles.navItem}>
              <Link
                to="/profile"
                className="navbar-icon-link"
                style={{
                  ...styles.iconLink,
                  ...(isProfile ? styles.activeLink : {}),
                }}
              >
                <img
                  src={getImageUrl(profileImage)}
                  alt="Profile"
                  className={`navbar-profile-avatar ${
                    isProfile ? 'navbar-profile-avatar-active' : ''
                  }`}
                  style={styles.avatar}
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </Link>

              <span
                style={{
                  ...styles.label,
                  ...(isProfile ? styles.activeLabel : {}),
                }}
              >
                Profile
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="navbar-logout-button"
          onClick={() => setLogoutModal(true)}
          style={styles.logoutButton}
          title="Logout"
        >
          <img src={logout} alt="Logout" style={styles.logoutIcon} />
        </button>
      </nav>

      {logoutModal && (
        <div style={styles.logoutOverlay} onClick={() => setLogoutModal(false)}>
          <div style={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.logoutTitle}>Log out?</h3>

            <p style={styles.logoutText}>Are you sure you want to log out?</p>

            <div style={styles.logoutActions}>
              <button
                type="button"
                onClick={() => setLogoutModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={styles.confirmButton}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

const styles = {
  navbar: {
    height: '58px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #d6d6d6',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    width: '100%',
  },

  navInner: {
    maxWidth: '1120px',
    height: '100%',
    margin: '0 auto',
    padding: '0 12px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '34px',
  },

  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },

  logo: {
    fontWeight: 700,
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '20px',
    whiteSpace: 'nowrap',
  },

  searchWrap: {
    display: 'flex',
    alignItems: 'center',
  },

  menu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '22px',
  },

  navItem: {
    height: '58px',
    minWidth: '68px',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',
    cursor: 'pointer',
  },

  iconLink: {
    width: '34px',
    height: '30px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    textDecoration: 'none',
    position: 'relative',
    borderRadius: '8px',
  },

  activeLink: {
    borderBottom: '2px solid #111',
    borderRadius: 0,
  },

  iconImage: {
    width: '23px',
    height: '23px',
    objectFit: 'contain',
  },

  activeIcon: {
    filter: 'brightness(0) saturate(100%)',
  },

  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-6px',

    minWidth: '16px',
    height: '16px',

    backgroundColor: '#e11d48',
    color: '#ffffff',

    borderRadius: '999px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize: '10px',
    fontWeight: 700,
    lineHeight: 1,
    padding: '0 4px',
    boxSizing: 'border-box',
  },

  label: {
    fontSize: '12px',
    color: '#555',
    marginTop: '1px',
    fontWeight: 400,
    whiteSpace: 'nowrap',
  },

  activeLabel: {
    color: '#111',
    fontWeight: 500,
  },

  avatar: {
    width: '25px',
    height: '25px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  logoutButton: {
    position: 'fixed',
    right: '22px',
    top: '29px',
    transform: 'translateY(-50%)',

    width: '36px',
    height: '36px',

    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'transparent',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    cursor: 'pointer',
    padding: 0,
    zIndex: 1200,
  },

  logoutIcon: {
    width: '23px',
    height: '23px',
    objectFit: 'contain',
    opacity: 0.65,
    transition: 'opacity 0.18s ease, transform 0.18s ease',
  },

  logoutOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 3000,
  },

  logoutModal: {
    width: '360px',
    maxWidth: 'calc(100% - 32px)',

    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '22px',

    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
    boxSizing: 'border-box',
  },

  logoutTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#111',
  },

  logoutText: {
    margin: 0,
    fontSize: '14px',
    color: '#555',
    lineHeight: 1.5,
  },

  logoutActions: {
    marginTop: '22px',

    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },

  cancelButton: {
    height: '38px',
    padding: '0 16px',

    borderRadius: '999px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',

    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  confirmButton: {
    height: '38px',
    padding: '0 18px',

    borderRadius: '999px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',

    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};