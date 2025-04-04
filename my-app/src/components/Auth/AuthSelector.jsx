import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSelector = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Hoş Geldiniz 👋</h2>
        <p>Lütfen giriş yapın ya da yeni bir hesap oluşturun.</p>
        <div style={styles.buttons}>
          <button onClick={() => navigate('/login')}>Giriş Yap</button>
          <button onClick={() => navigate('/register')}>Kayıt Ol</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f7f7f7',
  },
  card: {
    background: 'white',
    padding: 30,
    borderRadius: 10,
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 20,
  },
};

export default AuthSelector;
