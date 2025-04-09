import api from './api';


export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/search/users?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('❌ Arama hatası:', error);
    throw error;
  }
};
