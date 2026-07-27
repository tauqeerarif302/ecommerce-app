import { createApi, baseQuery } from "./apiSlice";

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    placeOrder: builder.mutation({
      query: (payload) => ({
        url: "/buyer/checkout",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Orders"],
    }),

    getOrders: builder.query({
      query: () => ({
        url: "/buyer/orders",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
  }),
});

export const { usePlaceOrderMutation, useGetOrdersQuery } = checkoutApi;
