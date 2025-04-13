import api from './api';


export const searchUsers = async (query) => {
  try {
    debugger;
    const response = await api.get(`/User/users?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
};
