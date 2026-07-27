import { createApi, baseQuery } from "./apiSlice";

export const sellerApi = createApi({
  reducerPath: "sellerApi",
  baseQuery,
  tagTypes: ["SellerProducts", "SellerOrders"],
  endpoints: (builder) => ({
    getSellerDashboardProducts: builder.query({
      query: ({ page, limit }) => ({
        url: "/seller/dashboard",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: [{ type: "SellerProducts", id: "LIST" }],
      transformResponse: (response) => {
        if (Array.isArray(response)) return { products: response };
        return response;
      },
    }),

    deleteSellerProduct: builder.mutation({
      query: (productId) => ({
        url: `/seller/delete-product/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SellerProducts", id: "LIST" }],
    }),

    addSellerProduct: builder.mutation({
      query: (formData) => ({
        url: "/seller/add-product",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "SellerProducts", id: "LIST" }],
    }),

    updateSellerProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `/seller/update-product/${productId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: [{ type: "SellerProducts", id: "LIST" }],
    }),

    getSellerOrders: builder.query({
      query: () => ({
        url: "/seller/orders",
        method: "GET",
      }),
      providesTags: ["SellerOrders"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/seller/orders/${orderId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["SellerOrders"],
    }),
  }),
});

export const {
  useGetSellerDashboardProductsQuery,
  useDeleteSellerProductMutation,
  useAddSellerProductMutation,
  useUpdateSellerProductMutation,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
} = sellerApi;
