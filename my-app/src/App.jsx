import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AuthSelector from './components/Auth/AuthSelector';
import HomePage from './pages/HomePage';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {loginSuccess,authCheckDone} from './store/userSlice';
import api from './services/api';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './components/Search/SearchPage';

 

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  const { user, authLoading } = useSelector((state) => state.user); 
debugger;
useEffect(() => {
  const fetchUser = async () => {
    try {
      if (token) {
        const res = await api.get('/user/me');
        dispatch(loginSuccess(res.data));
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      dispatch(authCheckDone());  
    }
  };

  fetchUser();
}, []);

  

  if (authLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={token && user ? <Navigate to="/home" /> : <AuthSelector />} />
        <Route path="/login" element={token && user ? <Navigate to="/home" /> : <LoginForm />} />
        <Route path="/register" element={token && user ? <Navigate to="/home" /> : <RegisterForm />} />
        <Route path="/home" element={token && user ? <HomePage /> : <Navigate to="/" />} />
        <Route path="/search" element={token && user ? <SearchPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={<ProfilePage/>} />
      </Routes>
    </Router>
  );
}

export default App;
