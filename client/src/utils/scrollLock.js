/**
 * Khoá scroll của <body> khi một overlay (drawer, modal) đang mở.
 * Trả về hàm để mở khoá lại (restore đúng giá trị trước đó).
 *
 * Lưu ý: padding-right được cộng thêm bằng độ rộng scrollbar để tránh
 * nội dung bị "nhảy" ngang khi scrollbar bị ẩn đi.
 */
export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return () => {};
  const prevOverflow = document.body.style.overflow;
  const prevPaddingRight = document.body.style.paddingRight;
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  return () => {
    document.body.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPaddingRight;
  };
};

export default lockBodyScroll;
