import { createSlice } from '@reduxjs/toolkit';
import authService from '../services/authService';

const initialState = {
  userInfo: authService.getCurrentUser(),
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      authService.logout();
      state.userInfo = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUserInfo, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer;