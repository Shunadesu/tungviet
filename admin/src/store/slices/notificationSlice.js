/**
 * Notification slice — replaces NotificationContext.
 *
 * Public API kept identical to the previous React context so existing
 * pages keep working without changes:
 *
 *   const { addNotification, removeNotification, notifications } = useNotification();
 */
let nextId = 0;

export const createNotificationSlice = (set, get) => ({
  notifications: {
    list: [],

    add: (message, type = 'success', { duration = 3000 } = {}) => {
      const id = `noti-${Date.now()}-${nextId++}`;
      set(
        (s) => ({
          notifications: {
            ...s.notifications,
            list: [...s.notifications.list, { id, message, type }],
          },
        }),
        false,
        'notifications/add',
      );
      if (duration > 0) {
        setTimeout(() => {
          // Skip if the notification was already removed manually
          if (get().notifications.list.some((n) => n.id === id)) {
            get().notifications.remove(id);
          }
        }, duration);
      }
      return id;
    },

    remove: (id) =>
      set(
        (s) => ({
          notifications: {
            ...s.notifications,
            list: s.notifications.list.filter((n) => n.id !== id),
          },
        }),
        false,
        'notifications/remove',
      ),

    clear: () =>
      set(
        (s) => ({ notifications: { ...s.notifications, list: [] } }),
        false,
        'notifications/clear',
      ),
  },
});

export default createNotificationSlice;