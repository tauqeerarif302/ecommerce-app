import { createApi, baseQuery } from "./apiSlice";

export const buyerApi = createApi({
  reducerPath: "buyerApi",
  baseQuery,
  tagTypes: ["BuyerProducts"],
  endpoints: (builder) => ({
    getBuyerProducts: builder.query({
      query: ({ page, limit }) => ({
        url: "/buyer/products",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map((p) => ({ type: "BuyerProducts", id: p?._id ?? p?.id })),
              { type: "BuyerProducts", id: "LIST" },
            ]
          : [{ type: "BuyerProducts", id: "LIST" }],
      transformResponse: (response) => {
        // Keep response shape compatible with existing UI logic
        // Current UI expects either {products,totalProducts} or array.
        if (Array.isArray(response)) return { products: response };
        return response;
      },
    }),
  }),
});

export const { useGetBuyerProductsQuery } = buyerApi;

