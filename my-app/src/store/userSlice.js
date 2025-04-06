import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  user: null,
  loading: false,
  error: null,
  authLoading: true
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // REGISTER
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // LOGIN
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.authLoading = false;
      
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.authLoading = false;
    },
    authCheckDone: (state) => {
      state.authLoading = false;
    }
  },
});

// Tüm action'ları buradan dışa aktar
export const {
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  authCheckDone 
} = userSlice.actions;

export default userSlice.reducer;

 