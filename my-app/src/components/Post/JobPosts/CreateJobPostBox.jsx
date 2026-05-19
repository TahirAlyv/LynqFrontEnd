import React, { useState } from 'react';
import defaultAvatar from '../../../../assets/default-avatar.png';
import Toast from '../../UI/Toast';
import api from '../../../services/api';  

export default function EmployerJobCreate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    skills: '',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // ✅ toast state

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('Title', formData.title);
      data.append('Description', formData.description);
      data.append('Location', formData.location);
      data.append('Salary', formData.salary);
      data.append('Skills', formData.skills);
      if (formData.file) data.append('File', formData.file);

   const res = await api.post('/JobPost/jobposts', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

      // ✅ Uğurlu nəticə
      setToast({ message: 'Job post created successfully!', type: 'success' });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        skills: '',
        file: null,
      });
    } catch (err) {
      console.error(err);

      // ❌ Xəta halı
      if (err.response) {
        setToast({
          message: err.response.data?.message || 'Server error!',
          type: 'error',
        });
      } else {
        setToast({ message: 'Something went wrong!', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* ✅ Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}

      {/* Ana container */}
      <div style={styles.container}>
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setIsModalOpen(true)}
        >
          <img src={defaultAvatar} alt="Avatar" style={styles.avatar} />
          <div style={styles.textInput}>Create a job posting</div>
        </div>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Create Job Post</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                name="title"
                placeholder="Job Title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                required
              />

              <textarea
                name="description"
                placeholder="Job Description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...styles.input, height: '100px' }}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="skills"
                placeholder="Skills (comma separated)"
                value={formData.skills}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="file"
                name="file"
                onChange={handleChange}
                style={styles.input}
              />

              <div style={styles.buttons}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Styles
const styles = {
  mainContainer: { display: 'flex' },
  container: {
    width: '700px',
    height: '75px',
    margin: '40px auto',
    borderRadius: '50px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    objectFit: 'cover',
    margin: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#292929',
    cursor: 'pointer',
    borderRadius: 25,
    border: '1px solid #cccccc',
    padding: '12px 20px',
    width: '87%',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    width: '500px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#e4e4e4',
    border: 'none',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#0073b1',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};
