import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import defaultAvatar from '../assets/default-avatar.png';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const user = useSelector(state => state.user.user);
  const [showPostForm, setShowPostForm] = useState(false);

  console.log("Logged in user:", user);
  return (
    <div>
      <Navbar />
        <div style={styles.mainContainer}>
            <p>Please log in as an Employer to create posts.</p>
        </div>
    </div>
  );
};

const styles = {
 
mainContainer: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  backgroundColor: '#f0f0f0ff',
  minHeight: '100vh',
  width: '100%',
  margin: 0, 
  paddingTop: 0  
}

  
};

export default HomePage;
