import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  unreadMessages: {},
  activeChat: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    incrementUnread: (state, action) => {
      const user = action.payload;
      if (state.activeChat !== user) {
        state.unreadMessages[user] = (state.unreadMessages[user] || 0) + 1;
      }
    },
    clearUnreadForUser: (state, action) => {
      delete state.unreadMessages[action.payload];
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    clearUnread: (state) => {
      // Tüm unread mesajları temizler
      state.unreadMessages = {};
    }
  },
});

export const { incrementUnread, clearUnread, clearUnreadForUser, setActiveChat } = messageSlice.actions;
export default messageSlice.reducer;
