/**
 * Backward-compatibility shim.
 *
 * The notification queue is now backed by zustand (see
 * `src/store/slices/notificationSlice.js` and the `useNotification`
 * helper in `src/hooks/useAdminStore.js`).
 *
 * Existing pages still import `useNotification` from this path — we
 * simply re-export the zustand-backed hook so they keep working
 * without changes.
 *
 * NOTE: There is no longer a `<NotificationProvider>` required; the
 * store is global. Existing `<NotificationProvider>` wrappers in
 * `App.jsx` are no-ops.
 */
export { useNotification } from '../hooks/useAdminStore';

// Keep the old export shape for any code that imports the provider
// component (it's now a no-op so old trees don't crash).
export const NotificationProvider = ({ children }) => children || null;

export default NotificationProvider;