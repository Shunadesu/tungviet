import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Estimate from './models/Estimate.js';

dotenv.config();

const HOURLY_RATE = 450000; // VND/giờ - đơn giá khởi điểm, admin có thể chỉnh

/**
 * BÁO GIÁ REDESIGN WEBSITE TUNG VIET
 *
 * Bản gói gọn: 10 hạng mục lớn, đi theo 6 giai đoạn trong RFP.
 *
 * Mọi hạng mục được tạo với:
 *   - estimatedHours = 0
 *   - estimatedDays  = 0
 *   - totalCost      = 0
 *   - hourlyRate     = HOURLY_RATE  (đơn giá khởi điểm, admin chỉnh được)
 *   - complexity     = 'Medium'     (admin chỉnh được)
 *
 * Admin sẽ tự điền số giờ / số ngày / đơn giá / thành tiền cho từng hạng mục
 * trong giao diện quản trị (Estimate).
 */
const baoGia = [
  // ===== 1. KHẢO SÁT & THIẾT KẾ =====
  {
    stt: 1,
    feature: 'Khảo sát & Thiết kế UI/UX',
    requirement: 'Kickoff, sitemap, wireframe, thiết kế high-fidelity, design system, prototype duyệt.',
    description: 'Khởi động dự án và khảo sát yêu cầu; xây dựng sitemap & kiến trúc thông tin; thiết kế wireframe và UI high-fidelity trên Figma với design system (màu, type, component); prototype tương tác để khách duyệt.',
  },

  // ===== 2. PHÍA KHÁCH HÀNG - CLIENT =====
  {
    stt: 2,
    feature: 'Trang chủ, Giới thiệu, Liên hệ',
    requirement: '3 trang tĩnh với hero, gallery và form liên hệ.',
    description: 'Xây dựng 3 trang nội dung tĩnh: Trang chủ (hero, sản phẩm nổi bật, blog teaser, newsletter), Trang giới thiệu (câu chuyện công ty, đội ngũ, gallery) và Trang liên hệ (form, Google Maps, Zalo, hotline).',
  },
  {
    stt: 3,
    feature: 'Catalog & Chi tiết sản phẩm',
    requirement: 'Danh sách + bộ lọc + chi tiết + tìm kiếm.',
    description: 'Trang danh sách sản phẩm (sidebar danh mục, bộ lọc, sắp xếp, phân trang), trang chi tiết (gallery, biến thể, sản phẩm liên quan, thêm giỏ, chia sẻ) và thanh tìm kiếm với auto-suggest.',
  },
  {
    stt: 4,
    feature: 'Giỏ hàng & Thanh toán',
    requirement: 'Giỏ hàng + checkout nhiều bước + xác nhận đơn.',
    description: 'Giỏ hàng persistent (localStorage + server), áp mã giảm giá, ước tính phí ship, mini-cart. Flow checkout đa bước: thông tin/địa chỉ → vận chuyển → thanh toán → xác nhận đơn. Hỗ trợ khách vãng lai và đã đăng nhập.',
  },
  {
    stt: 5,
    feature: 'Tài khoản & Lịch sử đơn',
    requirement: 'Đăng ký/đăng nhập + hồ sơ + sổ địa chỉ + lịch sử đơn.',
    description: 'Hệ thống tài khoản khách hàng: đăng ký/đăng nhập (email), hồ sơ cá nhân, đổi mật khẩu, sổ địa chỉ giao hàng, lịch sử đơn hàng với chi tiết trạng thái và theo dõi vận chuyển.',
  },

  // ===== 3. ADMIN / DASHBOARD =====
  {
    stt: 6,
    feature: 'Quản trị nội dung & đơn hàng (Admin)',
    requirement: 'Auth + Dashboard + CRUD Sản phẩm/Danh mục/Đơn hàng/Khách hàng + CMS.',
    description: 'Đăng nhập admin (JWT, phân quyền Admin/Staff), dashboard thống kê, CRUD sản phẩm & danh mục, quản lý đơn hàng với workflow trạng thái, quản lý khách hàng (lịch sử, ghi chú, blacklist), CMS nội dung tĩnh (banner, blog, footer), mã giảm giá và trang cài đặt hệ thống.',
  },

  // ===== 4. TÍCH HỢP HỆ THỐNG =====
  {
    stt: 7,
    feature: 'Thanh toán & Vận chuyển',
    requirement: 'COD + 1 cổng online (VNPay/MoMo) + 1 đơn vị vận chuyển (GHN/GHTK).',
    description: 'Tích hợp COD và 1 cổng thanh toán online phổ biến (VNPay hoặc MoMo) xử lý callback/IPN, đối soát giao dịch. Tích hợp API đơn vị vận chuyển (GHN hoặc GHTK) để tính phí, tạo đơn và theo dõi trạng thái đơn.',
  },
  {
    stt: 8,
    feature: 'Thông báo & Upload media',
    requirement: 'Email SMTP + SMS provider + Upload ảnh lên cloud (Cloudinary/S3).',
    description: 'Tích hợp SMTP (SendGrid/Mailgun) gửi email tự động: xác nhận đơn, cập nhật vận chuyển, abandoned cart, newsletter. SMS provider cho thông báo quan trọng. Module upload media lên cloud storage với tối ưu ảnh tự động.',
  },

  // ===== 5. SEO, HIỆU NĂNG & BẢO MẬT =====
  {
    stt: 9,
    feature: 'SEO, Hiệu năng & Bảo mật',
    requirement: 'On-page SEO + Lighthouse >= 90 + HTTPS/CSP/rate-limit.',
    description: 'SEO on-page & technical (meta, schema.org, sitemap, robots, canonical). Tối ưu hiệu năng (code-splitting, lazy-load, CDN, cache) đạt Lighthouse >= 90. Bảo mật nền tảng: HTTPS, HSTS, CSP, rate limiting, input validation chống XSS/NoSQL injection, log audit.',
  },

  // ===== 6. KIỂM THỬ, TRIỂN KHAI & BÀN GIAO =====
  {
    stt: 10,
    feature: 'QA, Triển khai & Bàn giao',
    requirement: 'Test + CI/CD + Deploy production + Đào tạo admin + 30 ngày hỗ trợ.',
    description: 'Kiểm thử toàn diện (functional, cross-browser, responsive, load test). Thiết lập CI/CD (GitHub Actions), triển khai production (Vercel/Railway/AWS), DNS cutover, đào tạo admin, viết tài liệu kỹ thuật, 30 ngày hỗ trợ sau bàn giao.',
  },
];

// === Các field cố định - admin sẽ tự điền số liệu trong giao diện ===
const DEFAULTS = {
  complexity: 'Medium',
  estimatedHours: 0,
  estimatedDays: 0,
  hourlyRate: HOURLY_RATE,
  totalCost: 0,
  notes: '',
  product: '',
};

const run = async () => {
  try {
    await connectDB();

    await Estimate.deleteMany({});

    // Inject defaults vào từng hạng mục
    const seedData = baoGia.map((item) => ({ ...DEFAULTS, ...item }));
    const estimates = await Estimate.insertMany(seedData);

    console.log('=========================================================');
    console.log(' BÁO GIÁ REDESIGN WEBSITE TUNG VIET  (gói gọn 10 mục)');
    console.log('=========================================================');
    console.log(` Đã tạo:        ${estimates.length} hạng mục (mặc định: 0h / 0 ngày / 0 VND)`);
    console.log(` Đơn giá KD:    ${HOURLY_RATE.toLocaleString('vi-VN')} VND/giờ (admin chỉnh được)`);
    console.log('---------------------------------------------------------');

    estimates.forEach((item) => {
      console.log(`  ${String(item.stt).padStart(2)}. ${item.feature}`);
    });

    console.log('---------------------------------------------------------');
    console.log(' → Vào trang quản trị Estimate để tự điền số giờ/ngày/tiền.');
    console.log('=========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed thất bại:', error);
    process.exit(1);
  }
};

run();