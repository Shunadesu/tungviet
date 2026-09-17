import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import adminApi from '../api/adminApi';

import { createEntitySlice } from './slices/entitySlice';
import { createUiSlice } from './slices/uiSlice';
import { createSelectionSlice } from './slices/selectionSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { createSiteConfigSlice } from './slices/siteConfigSlice';

/**
 * Persisted state: only UI preferences (collapsed, openKeys,
 * filters, pagination). Auth, notifications and entity caches
 * are intentionally NOT persisted.
 */
const partialize = (state) => ({
  ui: {
    collapsed: state.ui.collapsed,
    openKeys: state.ui.openKeys,
    filters: state.ui.filters,
    pagination: state.ui.pagination,
  },
});

export const useAdminStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...createUiSlice(set, get),
        ...createSelectionSlice(set, get),
        ...createNotificationSlice(set, get),

        // ── Site config (singleton, loaded once on startup) ────────
        siteConfig: createSiteConfigSlice()(set, get),

        // ── Entity slices ────────────────────────────────────────
        mainTrees: createEntitySlice('mainTrees', {
          getOne: adminApi.getMainTree,
          getAll: adminApi.getMainTrees,
          create: adminApi.createMainTree,
          update: adminApi.updateMainTree,
          remove: adminApi.deleteMainTree,
          removeMany: adminApi.deleteMainTrees,
          reorder: adminApi.reorderMainTrees,
        })(set, get),

        marketTrees: createEntitySlice('marketTrees', {
          getOne: adminApi.getMarketTree,
          getAll: adminApi.getMarketTrees,
          create: adminApi.createMarketTree,
          update: adminApi.updateMarketTree,
          remove: adminApi.deleteMarketTree,
          removeMany: undefined,
          reorder: adminApi.reorderMarketTrees,
        })(set, get),

        categories: createEntitySlice('categories', {
          getOne: adminApi.getCategory,
          getAll: adminApi.getCategories,
          create: adminApi.createCategory,
          update: adminApi.updateCategory,
          remove: adminApi.deleteCategory,
          removeMany: adminApi.deleteCategories,
          reorder: adminApi.reorderCategories,
        })(set, get),

        products: createEntitySlice('products', {
          getOne: adminApi.getProduct,
          getAll: adminApi.getProducts,
          create: adminApi.createProduct,
          update: adminApi.updateProduct,
          remove: adminApi.deleteProduct,
          removeMany: adminApi.deleteProducts,
          reorder: undefined,
        })(set, get),

        // ── 9 new slices ──────────────────────────────────────

        members: createEntitySlice('members', {
          getOne: adminApi.getMember,
          getAll: adminApi.getMembers,
          create: adminApi.createMember,
          update: adminApi.updateMember,
          remove: adminApi.deleteMember,
          removeMany: undefined,
          reorder: adminApi.reorderMembers,
        })(set, get),

        locations: createEntitySlice('locations', {
          getOne: adminApi.getLocation,
          getAll: adminApi.getLocations,
          create: adminApi.createLocation,
          update: adminApi.updateLocation,
          remove: adminApi.deleteLocation,
          removeMany: undefined,
          reorder: adminApi.reorderLocations,
        })(set, get),

        leadership: createEntitySlice('leadership', {
          getOne: adminApi.getLeadershipMember,
          getAll: adminApi.getLeadership,
          create: adminApi.createLeadership,
          update: adminApi.updateLeadership,
          remove: adminApi.deleteLeadership,
          removeMany: undefined,
          reorder: adminApi.reorderLeadership,
        })(set, get),

        partners: createEntitySlice('partners', {
          getOne: (id) => adminApi.getPartners({ _id: id }).then((r) => ({ data: { data: r.data?.data?.[0] } })),
          getAll: adminApi.getPartners,
          create: adminApi.createPartner,
          update: adminApi.updatePartner,
          remove: adminApi.deletePartner,
          removeMany: undefined,
          reorder: adminApi.reorderPartners,
        })(set, get),

        posts: createEntitySlice('posts', {
          getOne: adminApi.getPost,
          getAll: adminApi.getPosts,
          create: adminApi.createPost,
          update: adminApi.updatePost,
          remove: adminApi.deletePost,
          removeMany: undefined,
          reorder: adminApi.reorderPosts,
        })(set, get),

        postCategories: createEntitySlice('postCategories', {
          getOne: adminApi.getPostCategory,
          getAll: adminApi.getPostCategories,
          create: adminApi.createPostCategory,
          update: adminApi.updatePostCategory,
          remove: adminApi.deletePostCategory,
          removeMany: undefined,
          reorder: adminApi.reorderPostCategories,
        })(set, get),

        orders: createEntitySlice('orders', {
          getOne: adminApi.getOrder,
          getAll: adminApi.getOrders,
          create: undefined,
          update: adminApi.updateOrderStatus,
          remove: adminApi.deleteOrder,
          removeMany: undefined,
          reorder: undefined,
        })(set, get),

        productColumns: createEntitySlice('productColumns', {
          getOne: adminApi.getProductColumn,
          getAll: adminApi.getProductColumns,
          create: adminApi.createProductColumn,
          update: adminApi.updateProductColumn,
          remove: adminApi.deleteProductColumn,
          removeMany: undefined,
          reorder: adminApi.reorderProductColumns,
        })(set, get),

        quoteSubmissions: createEntitySlice('quoteSubmissions', {
          getOne: (id) => adminApi.getQuoteSubmissions({ _id: id }).then((r) => ({ data: { data: r.data?.data?.[0] } })),
          getAll: adminApi.getQuoteSubmissions,
          create: undefined,
          update: adminApi.updateQuoteSubmission,
          remove: undefined,
          removeMany: undefined,
          reorder: undefined,
        })(set, get),
      }),
      {
        name: 'admin-store',
        version: 2,
        partialize,
        // Deep merge so persisted slices don't overwrite action
        // methods defined by the slice factories.
        merge: (persistedState, currentState) => {
          const persisted = persistedState || {};
          const out = { ...currentState, ...persisted };
          if (persisted.ui) {
            out.ui = { ...currentState.ui, ...persisted.ui };
          }
          return out;
        },
        // Bump version + migrate when shape changes.
        migrate: (persisted, version) => {
          if (!persisted) return persisted;
          // Future migrations can branch on `version`.
          return persisted;
        },
      },
    ),
    { name: 'admin-store', enabled: import.meta.env.DEV },
  ),
);

export default useAdminStore;