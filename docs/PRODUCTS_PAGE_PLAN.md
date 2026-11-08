# Kế hoạch làm mới toàn bộ Trang Sản phẩm (`/{lang}/products`)

> Trạng thái: **đã triển khai P0 → P3** (P4 để dành cho khi catalog lớn).
> Ngày lập: 2026-11-08.
> Phạm vi: `client/src` (UI) + `server/src` (1 fix + 1 endpoint tùy chọn).

---

## 1. Mục tiêu

1. **Bộ lọc nằm ngay trên trang**, không còn cột sidebar bên trái → 1 hàng dropdown ngang dưới ô tìm kiếm.
2. **Danh sách chỉ hiển thị "sản phẩm chính"** — mỗi sản phẩm chính là 1 *Product line (danh mục sản phẩm)*.
3. **SKU chỉ hiện khi mở trang chi tiết của sản phẩm chính** → bấm vào sản phẩm chính sẽ điều hướng sang trang chi tiết, tại đó có bảng/danh sách các SKU bên trong.

Quyết định đã chốt:

| Hạng mục | Quyết định |
|---|---|
| Định nghĩa "sản phẩm chính" | Theo **Product line / danh mục sản phẩm (Category)** — mỗi danh mục = 1 sản phẩm chính, chứa các SKU bên trong |
| Cách hiện SKU | **Chuyển trang** sang trang chi tiết sản phẩm chính, bên trong hiển thị các SKU |
| Bố cục bộ lọc | **1 hàng dropdown ngang** (Ngành hàng / Thị trường / Điểm làm mềm / Sắp xếp) |

---

## 2. Hiện trạng & các vấn đề phát hiện

### 2.1. Mô hình dữ liệu hiện tại

```
MainTree (Ngành hàng)  1 ── n ── Category (Product line / danh mục sản phẩm)  1 ── n ── Product (SKU)
                                                                                        │
                                                                          productCode = mã SKU
```

Dữ liệu thật hiện có (9 SKU / 2 product line):

| Product line (sản phẩm chính) | SKU bên trong (`productCode`) |
|---|---|
| Rosin Modified Maleic Resin | M13035A, M13035, M120A, M1103, M135H, M13035-S70, M1306-S70 |
| Gum Rosin (X-Grade và WW-Grade) | ROSIN-TVJ, ROSIN-TVN |

Lưu ý: 1 SKU có thể thuộc nhiều product line (`productLines` là mảng) → sẽ được đếm trong từng nhóm tương ứng.

### 2.2. Bug hiện có (phát hiện khi rà soát, cần sửa trong đợt này)

| # | Vấn đề | Mức độ | Vị trí |
|---|---|---|---|
| B1 | Hiển thị **"9 9 sản phẩm"** — số bị render 2 lần (`{pagination.total}` + `t('product.productsCount', {n})` đã chứa sẵn số) | Lỗi hiển thị | `ProductList.jsx` (toolbar) |
| B2 | **Bộ lọc "Điểm làm mềm" không hoạt động**: UI gửi khoảng (`"80-100"`) nhưng server so khớp **chuỗi chính xác** `softeningPoint = "80-100"`, trong khi dữ liệu lưu `"127-135"`, `"78"`… → luôn ra 0 kết quả | Lỗi chức năng | `server/.../product.service.js` + `ProductFilterSidebar.jsx` |
| B3 | `ProductList` render `<p>{total} {t('product.productsCount',{n})}</p>` dùng key `product.productsCount` lẫn cả số → dễ lặp lại | Trùng B1 | `ProductList.jsx` |
| B4 | `Header.jsx` dùng `product.shortCode` nhưng field thật là `productCode` → mã SKU không hiện trong dropdown header | Lỗi hiển thị | `Header.jsx` (dòng 108-109) |

---

## 3. Kiến trúc trang mới

### 3.1. Sơ đồ trang `/products`

```
┌─────────────────────────────────────────────────────────────┐
│ HERO: breadcrumb + tiêu đề + ô tìm kiếm                     │
├─────────────────────────────────────────────────────────────┤
│ THANH BỘ LỌC NGANG (sticky)                                 │
│ [Ngành hàng ▾] [Thị trường ▾] [Điểm làm mềm ▾] [Sắp xếp ▾] │
│  chips đang lọc: [Ngành hàng: X ✕] [Sao chép liên kết]     │
├─────────────────────────────────────────────────────────────┤
│ GRID SẢN PHẨM CHÍNH (mỗi card = 1 Product line)            │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│ │ ảnh          │ │ ảnh          │ │ ảnh          │      │
│ │ Tên PL       │ │ Tên PL       │ │ Tên PL       │      │
│ │ mô tả ngắn   │ │ mô tả ngắn   │ │ mô tả ngắn   │      │
│ │ 🏷 7 SKU     │ │ 🏷 2 SKU     │ │ 🏷 5 SKU     │      │
│ │ [Xem SKU →]  │ │ [Xem SKU →]  │ │ [Xem SKU →]  │      │
│ └───────────────┘ └───────────────┘ └───────────────┘      │
│                       [Xem thêm]                            │
└─────────────────────────────────────────────────────────────┘
```

Bấm `[Xem SKU →]` / bấm card → điều hướng `/{lang}/categories/{categoryId}` (trang chi tiết sản phẩm chính).

### 3.2. Trang chi tiết sản phẩm chính (`/categories/:id`) — nơi chứa SKU

```
┌─────────────────────────────────────────────────────────────┐
│ HERO: breadcrumb (Trang chủ / Ngành hàng / <Tên PL>)       │
│ ảnh bìa + mô tả + badge "7 SKU"                            │
├─────────────────────────────────────────────────────────────┤
│ BẢNG SKU                                                   │
│ Mã SKU │ Tên │ Điểm làm mềm │ Chỉ số axit │ Màu │ Giá │ TDS│ CTA │
│ M135H  │ ... │ 132-142      │ 22-30        │ 5-6  │ ...  │ ⬇  │ [Báo giá] │
├─────────────────────────────────────────────────────────────┤
│ "Sản phẩm liên quan" (cùng ngành hàng)                    │
└─────────────────────────────────────────────────────────────┘
```

- Desktop: bảng dạng lưới, cột cố định, SKU code dạng mono.
- Mobile: bảng → card xếp dọc.
- Mỗi SKU vẫn dẫn tới trang chi tiết riêng `/products/{skuId}` như hiện tại.

### 3.3. Semantics của bộ lọc (quan trọng)

| Filter | API param | Hành vi mới |
|---|---|---|
| Ngành hàng (MainTree) | `industries` (CSV) | Lọc danh sách sản phẩm chính theo ngành hàng |
| Thị trường (MarketTree) | `market` (CSV) | Chỉ giữ product line có **ít nhất 1 SKU** thuộc thị trường đó |
| Điểm làm mềm | `softeningPoint` | Chỉ giữ product line có **ít nhất 1 SKU** nằm trong khoảng đã chọn; khoảng được áp dụng **ở client** (fix B2) |
| Tìm kiếm | `q` | Khớp theo: tên product line, tên SKU, **mã SKU** (`productCode`) |
| Sắp xếp | `sort` | `default` (theo `order` của danh mục), `name_asc`, `name_desc`, `newest` (SKU mới nhất trong nhóm), `popular` (SKU nhiều view nhất trong nhóm) |
| Danh mục (deep-link) | `category` | Giữ hỗ trợ: mở trang đã lọc sẵn 1 product line (dùng cho link từ header/footer) |

Bộ lọc **Product line** cũ (chip `category` trong `ActiveFilterChips`) bị bỏ khỏi thanh lọc vì danh mục chính là nội dung của trang — nhưng vẫn chấp nhận `?category=` để deep-link.

---

## 4. Kế hoạch triển khai theo giai đoạn

### P0 — Sửa lỗi hiển thị & chức năng (độc lập, làm trước)

| # | Việc | File |
|---|---|---|
| P0.1 | Bỏ số bị lặp "9 9 sản phẩm" | `client/src/pages/ProductList.jsx` |
| P0.2 | `shortCode` → `productCode` trong dropdown header | `client/src/components/Header.jsx` |
| P0.3 | Sửa filter điểm làm mềm: so khớp theo **khoảng số** (parse `softeningPoint` dạng `"127-135"` / `"78"`), áp dụng ở client (không cần deploy server) | `client/src/pages/ProductList.jsx` + helper mới `client/src/utils/softeningPoint.js` |

### P1 — Trang danh sách: top bar + lưới sản phẩm chính

| # | Việc | File |
|---|---|---|
| P1.1 | Tạo `ProductFilterTopBar.jsx`: 1 hàng dropdown (Ngành hàng multi-select, Thị trường multi-select, Điểm làm mềm single-select, Sắp xếp), responsive (mobile: nút "Bộ lọc" mở bottom sheet) | **mới** `client/src/components/ProductFilterTopBar.jsx` |
| P1.2 | Tạo `ProductLineCard.jsx`: card sản phẩm chính (ảnh, tên, mô tả rút gọn, badge số SKU, nút "Xem SKU"), link tới `/categories/:id` | **mới** `client/src/components/ProductLineCard.jsx` |
| P1.3 | Viết lại `ProductList.jsx`: bỏ `ProductFilterSidebar` + `ProductCard`; fetch product lines + SKU, gom nhóm theo `productLines`, áp filter/sort client-side, phân trang theo **nhóm** | `client/src/pages/ProductList.jsx` |
| P1.4 | `ActiveFilterChips`: bỏ chip product line, giữ chip ngành hàng/thị trường/điểm làm mềm + copy link | `client/src/components/ActiveFilterChips.jsx` |
| P1.5 | `useProductFilters`: cập nhật `activeCount` (bỏ `category`), thêm helper parse khoảng điểm làm mềm | `client/src/hooks/useProductFilters.js` |
| P1.6 | Xoá `ProductFilterSidebar.jsx` (không còn dùng) + dọn import | `client/src/components/ProductFilterSidebar.jsx` |

### P2 — Trang chi tiết sản phẩm chính chứa SKU

| # | Việc | File |
|---|---|---|
| P2.1 | Tạo `SkuTable.jsx`: bảng SKU (mã SKU, tên, điểm làm mềm, chỉ số axit, màu, giá, link TDS, nút "Yêu cầu báo giá"), mobile → card | **mới** `client/src/components/SkuTable.jsx` |
| P2.2 | `CategoryDetail.jsx`: thay lưới `ProductCard` bằng `SkuTable`; badge số SKU ở hero; đổi copy "Sản phẩm trong ngành hàng" → "Danh sách SKU" | `client/src/pages/CategoryDetail.jsx` |
| P2.3 | `SkuTable` dùng chung `addToQuoteBag` (context sẵn có) để nút báo giá hoạt động | — |
| P2.4 | (Nâng cấp) Trang chi tiết SKU: thêm mục "SKU khác trong sản phẩm chính" để điều hướng 2 chiều | `client/src/pages/ProductDetail.jsx` |

### P3 — Hoàn thiện & dọn dẹp

| # | Việc | File |
|---|---|---|
| P3.1 | i18n: thêm key mới (VI + EN) — nhãn bộ lọc, "N SKU", "Xem SKU", "Danh sách SKU", empty state mới | `client/src/i18n/locales/vi.json`, `en.json` |
| P3.2 | SEO: tiêu đề/nhóm sản phẩm chính, breadcrumb | `client/src/components/SEO.jsx` (dùng lại) |
| P3.3 | Header dropdown "Sản phẩm": đổi hiển thị **product line** (sản phẩm chính) thay vì SKU thô, để đồng nhất IA | `client/src/components/Header.jsx` |
| P3.4 | Kiểm tra lại `MarketDetail.jsx` / `Wishlist.jsx` / `RelatedProducts` — vẫn dùng `ProductCard` (SKU), giữ nguyên | — |

### P4 — Tùy chọn (chỉ khi catalog lớn lên)

Hiện tại client gom nhóm từ tối đa **500 SKU/tải** → đủ dùng khi catalog còn nhỏ. Khi SKU > 500 cần endpoint mới ở server:

| # | Việc | File |
|---|---|---|
| P4.1 | `GET /api/public/product-lines` — aggregation theo `productLines`, trả về `{category, skuCount, matchingSkuCount}` + filter (mainTree/market/softening/search) + phân trang theo nhóm | `server/src/services/product.service.js`, `controllers/public/product.controller.js`, `routes/public/product.routes.js` |
| P4.2 | Client tự fallback về gom nhóm client-side nếu endpoint trả 404 (deploy chưa kịp) | `client/src/api/publicApi.js`, `ProductList.jsx` |

> **Khuyến nghị:** làm P0 → P1 → P2 trước, chạy thử với API production hiện tại. Chỉ làm P4 khi cần.

---

## 5. Chi tiết thay đổi file

### 5.1. File mới

| File | Vai trò |
|---|---|
| `client/src/components/ProductFilterTopBar.jsx` | Thanh bộ lọc ngang (thay sidebar) |
| `client/src/components/ProductLineCard.jsx` | Card sản phẩm chính (thay `ProductCard` ở trang list) |
| `client/src/components/SkuTable.jsx` | Bảng/danh sách SKU ở trang chi tiết |
| `client/src/utils/softeningPoint.js` | Parse + so khớp khoảng điểm làm mềm |

### 5.2. File sửa

| File | Thay đổi |
|---|---|
| `client/src/pages/ProductList.jsx` | Viết lại phần lấy dữ liệu + render lưới + thanh lọc |
| `client/src/pages/CategoryDetail.jsx` | Dùng `SkuTable` thay lưới `ProductCard` |
| `client/src/components/ActiveFilterChips.jsx` | Bỏ chip danh mục; giữ copy link |
| `client/src/hooks/useProductFilters.js` | `activeCount` + parse khoảng mềm |
| `client/src/components/Header.jsx` | `shortCode` → `productCode`; (P3) dropdown theo product line |
| `client/src/components/ProductFilterSidebar.jsx` | **Xoá** (P1.6) |
| `client/src/i18n/locales/vi.json`, `en.json` | Key mới |
| `client/src/api/publicApi.js` | (P4) `getProductLines()` |

---

## 6. Rủi ro & cách kiểm thử

| Rủi ro | Xử lý |
|---|---|
| Fetch tối đa 500 SKU/lần → thiếu dữ liệu khi catalog lớn | Hiển thị cảnh báo nhỏ "đang hiển thị N trong M SKU"; chuẩn bị P4 |
| 1 SKU thuộc nhiều product line → đếm trùng giữa các nhóm | Chấp nhận (đúng ngữ nghĩa "danh mục chứa SKU"); hiển thị badge là số SKU thuộc nhóm đó |
| `?category=` cũ vẫn được index/link cũ | Vẫn hỗ trợ deep-link → trang list lọc theo danh mục đó |
| SEO: trang list giờ là danh mục chứ không phải SKU | Cập nhật `SEO` title/description + `breadcrumb` (P3.2) |
| Không đồng bộ `client/dist` | `dist/` đang chứa build cũ — cần rebuild hoặc loại khỏi git tracking |

### Checklist kiểm thử

- [ ] `/vi/products` hiển thị **2 card sản phẩm chính** (Rosin Modified Maleic Resin — 7 SKU, Gum Rosin — 2 SKU), không phải 9 card SKU.
- [ ] Không còn cột sidebar bên trái; bộ lọc là 1 hàng dropdown ngang dưới hero.
- [ ] Bấm card → sang `/vi/categories/{id}`, thấy bảng SKU đúng số lượng.
- [ ] Chọn "Ngành hàng" → danh sách sản phẩm chính thu hẹp đúng.
- [ ] Chọn "Điểm làm mềm: 120 – 135°C" → chỉ còn product line có SKU trong khoảng (fix B2).
- [ ] Tìm "M135H" → ra sản phẩm chính chứa SKU đó (tìm theo mã SKU).
- [ ] Header "Sản phẩm" hiện mã SKU đúng (fix B4).
- [ ] Copy link bộ lọc → mở lại vẫn giữ nguyên trạng thái.
- [ ] Mobile: nút "Bộ lọc" mở sheet; bảng SKU chuyển thành card.
- [ ] `npx vite build` không lỗi; không còn import tới file đã xoá.

---

## 7. Câu hỏi còn mở (không chặn P0–P2)

1. **Tên gọi hiển thị**: "Danh mục sản phẩm" (tên hiện tại của Category) hay đổi thành "Sản phẩm chính" / "Dòng sản phẩm" cho khớp với IA mới? Cần thống nhất cả header dropdown, breadcrumb, menu admin.
2. **URL của trang chi tiết sản phẩm chính**: dùng lại `/categories/:id` (đã có, SEO sẵn) hay tạo route mới `/product-lines/:id`? Tái dùng `/categories/:id` là ít rủi ro hơn.
3. **Trang `/products/:id` (chi tiết SKU)**: có giữ nguyên bố cục hiện tại không, hay đồng bộ lại với phong cách bảng SKU mới?
