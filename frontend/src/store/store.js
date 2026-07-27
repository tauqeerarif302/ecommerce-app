import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { buyerApi } from "../services/buyerApi";
import { sellerApi } from "../services/sellerApi";
import { checkoutApi } from "../services/checkoutApi";
import { cartApi } from "../services/cartApi";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    [buyerApi.reducerPath]: buyerApi.reducer,
    [sellerApi.reducerPath]: sellerApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      buyerApi.middleware,
      sellerApi.middleware,
      checkoutApi.middleware,
      cartApi.middleware
    ),
});

