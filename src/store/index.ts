import { configureStore } from '@reduxjs/toolkit';
// import { createAPI } from '../services/api';
import { rootReducer } from './root-reducer';

// export const api = createAPI();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      // thunk: {
      //   extraArgument: api,
      // },
      serializableCheck: false,
    })
});
