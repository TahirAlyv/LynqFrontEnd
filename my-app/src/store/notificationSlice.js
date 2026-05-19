import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.length;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, clearUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
