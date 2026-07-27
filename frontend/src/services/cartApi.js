import { createApi, baseQuery } from "./apiSlice";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: "/buyer/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
      transformResponse: (response) => {
        // Handle both { items: [...] } and direct array responses
        if (Array.isArray(response)) return { items: response };
        return response;
      },
    }),

    addToCart: builder.mutation({
      query: ({ productId, quantity = 1 }) => ({
        url: "/buyer/cart/add",
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/buyer/cart/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/buyer/cart/${productId}`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: "/buyer/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
  useClearCartMutation,
} = cartApi;

