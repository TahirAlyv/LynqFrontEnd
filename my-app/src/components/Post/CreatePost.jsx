import React, { useState } from 'react';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

const CreatePost = ({ onPostCreated }) => {
  const token = localStorage.getItem('token');
  const user = useSelector((state) => state.user.user);

  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded["role"] || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch (e) {
      console.error("Token decode hatası:", e);
    }
  }

  const [formData, setFormData] = useState({
    content: '',
    title: '',
    description: '',
    location: '',
    salary: '',
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    if (file) payload.append('file', file);

    if (role === 'JobSeeker') {
      payload.append('content', formData.content);
    } else if (role === 'Employer') {
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('location', formData.location);
      payload.append('salary', formData.salary);
    }

    const endpoint = role === 'JobSeeker' ? '/posts' : '/job-posts';

    debugger;
      try {
        const res = await api.post(`/Post${endpoint}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      
        console.log("✅ Post eklendi:", res.data);
      
        if (res.data?.message) {
          alert(res.data.message);
        }
      
        setFormData({
          content: '',
          title: '',
          description: '',
          location: '',
          salary: '',
        });
        setFile(null);
      
        if (onPostCreated) onPostCreated();
      
      } catch (err) {
        console.error("❌ Gönderi başarısız:", err);
        alert("Gönderi sırasında bir hata oluştu.");
      }
      
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {role === 'JobSeeker' ? (
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Neler düşünüyorsun?"
          style={styles.textarea}
        />
      ) : (
        <>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Pozisyon Başlığı"
            style={styles.input}
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="İş Tanımı"
            style={styles.textarea}
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Lokasyon"
            style={styles.input}
          />
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Maaş"
            style={styles.input}
          />
        </>
      )}

      <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '10px' }} />
      <button type="submit" style={styles.button}>Gönderi Paylaş</button>
    </form>
  );
};

const styles = {
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px'
  },
  textarea: {
    display: 'block',
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default CreatePost;
