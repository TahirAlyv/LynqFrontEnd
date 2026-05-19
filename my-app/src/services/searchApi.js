import api from "./api";

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/User/users?query=${encodeURIComponent(query)}`);
    return response.data?.data || [];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};