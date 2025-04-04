import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AuthSelector from './components/Auth/AuthSelector';
import HomePage from './pages/HomePage';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loginSuccess } from './store/userSlice';

 

function App() {
 
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem('token');


  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
  
   
    try {
      if (token && userData && userData !== 'undefined' && !user) {
        const parsedUser = JSON.parse(userData);
        dispatch(loginSuccess(parsedUser));
      }
    } catch (err) {
      console.error('User verisi parse edilemedi ❌:', err);
      localStorage.removeItem('user');  
    }
  }, [dispatch, user]);
  
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={token && user ? <Navigate to="/home" /> : <AuthSelector />} />
        <Route path="/login" element={token && user ? <Navigate to="/home" /> : <LoginForm />} />
        <Route path="/register" element={token && user ? <Navigate to="/home" /> : <RegisterForm />} />
        <Route path="/home" element={token && user ? <HomePage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
