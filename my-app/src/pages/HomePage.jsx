import React from 'react';
import Navbar from '../components/Layout/Navbar';
 

const HomePage = () => {
  return (
    <div>
     <Navbar/>
      <div style={styles.wrapper}>
        <div style={styles.feed}>
          <h2>📝 Akış</h2>
          {/* Buraya postlar eklenecek */}
        </div>
        <div style={styles.sidebar}>
          <h4>💼 Önerilen Şirketler</h4>
          <p>(Gelecekte eklenecek)</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    padding: '20px',
    gap: '20px',
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
  },
  feed: {
    flex: 2,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
  },
};

export default HomePage;
