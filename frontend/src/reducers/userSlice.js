import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  username: null,
  avatar_url: null,
  role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.avatar_url = action.payload.avatar_url;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.avatar_url = null;
      state.role = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
