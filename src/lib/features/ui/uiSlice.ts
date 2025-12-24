import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  isSidebarOpen: boolean
}

const initialState: UiState = {
  isSidebarOpen: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true
    },
  },
})

export const { toggleSidebar, setSidebarOpen, closeSidebar, openSidebar } = uiSlice.actions

export default uiSlice.reducer
