/**
 * Tiện ích cho bộ lọc "Điểm làm mềm".
 *
 * Dữ liệu `product.softeningPoint` lưu dưới dạng chuỗi tự do, ví dụ:
 *   "127-135", "78", "110-117", "3-4+"
 *
 * Vì vậy không thể so khớp chuỗi trực tiếp với khoảng lọc — phải parse ra
 * [min, max] rồi kiểm tra khoảng có giao với khoảng lọc hay không.
 */

/** Các khoảng điểm làm mềm dùng cho bộ lọc. `value` là giá trị lưu trong URL. */
export const SOFTENING_RANGES = [
  { value: '', label: '—' },
  { value: '<80', label: '< 80°C', min: -Infinity, max: 80 },
  { value: '80-100', label: '80 – 100°C', min: 80, max: 100 },
  { value: '100-120', label: '100 – 120°C', min: 100, max: 120 },
  { value: '>120', label: '> 120°C', min: 120, max: Infinity },
];

/**
 * Chuyển chuỗi `softeningPoint` thành cặp [min, max] số.
 * Trả về null nếu không parse được số nào.
 *
 * "127-135" -> [127, 135]
 * "78"     -> [78, 78]
 * "3-4+"   -> [3, 4]
 */
export const parseSofteningPoint = (value) => {
  if (value === null || value === undefined) return null;
  const numbers = String(value)
    .match(/\d+(?:[.,]\d+)?/g)
    ?.map((n) => Number(n.replace(',', '.')))
    .filter((n) => Number.isFinite(n));

  if (!numbers || numbers.length === 0) return null;
  if (numbers.length === 1) return [numbers[0], numbers[0]];
  return [Math.min(...numbers), Math.max(...numbers)];
};

/**
 * Kiểm tra một giá trị `softeningPoint` có nằm trong khoảng lọc hay không.
 * Khoảng lọc và khoảng của sản phẩm giao nhau → khớp.
 *
 * @param {string} value  giá trị softeningPoint của sản phẩm
 * @param {string} rangeValue  giá trị khoảng lọc (khớp `SOFTENING_RANGES`)
 */
export const matchesSofteningRange = (value, rangeValue) => {
  if (!rangeValue) return true;

  const range = SOFTENING_RANGES.find((r) => r.value === rangeValue);
  if (!range) return true;

  const parsed = parseSofteningPoint(value);
  if (!parsed) return false;

  const [min, max] = parsed;
  return min <= range.max && max >= range.min;
};

/**
 * Lọc một mảng sản phẩm theo khoảng điểm làm mềm.
 */
export const filterBySofteningRange = (products, rangeValue) => {
  if (!rangeValue) return products;
  return (products || []).filter((p) =>
    matchesSofteningRange(p?.softeningPoint, rangeValue)
  );
};
