import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import postSlice from './slices/postSlice';
import commentSlice from './slices/commentSlice';
import partTimeSlice from './slices/partTimeSlice';
import expressSlice from './slices/expressSlice';
import notificationSlice from './slices/notificationSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postSlice,
    comments: commentSlice,
    partTime: partTimeSlice,
    express: expressSlice,
    notifications: notificationSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;