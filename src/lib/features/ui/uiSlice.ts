import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AdminNotification {
  id: string
  type: 'NEW_USER_REGISTRATION' | 'CONTACT_FORM_SUBMISSION'
  title: string
  message: string
  isRead: boolean
  metadata?: Record<string, any>
  createdAt: string
}

interface UiState {
  isSidebarOpen: boolean
  notifications: AdminNotification[]
  unreadCount: number
}

const initialState: UiState = {
  isSidebarOpen: false,
  notifications: [],
  unreadCount: 0,
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
    setNotifications: (state, action: PayloadAction<{ notifications: AdminNotification[]; unreadCount: number }>) => {
      state.notifications = action.payload.notifications
      state.unreadCount = action.payload.unreadCount
    },
    addNotification: (state, action: PayloadAction<AdminNotification>) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true })
      state.unreadCount = 0
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  closeSidebar,
  openSidebar,
  setNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
} = uiSlice.actions

export default uiSlice.reducer