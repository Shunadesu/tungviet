import heroBanner from '../assets/placeholder-banner.svg';

/**
 * Nội dung trang Giới thiệu (hard-code, song ngữ vi/en).
 * Khi có ảnh thật, thay `heroImage` bằng đường dẫn ảnh mới.
 */
export const aboutCompany = {
  vi: {
    seoTitle: 'Giới thiệu',
    seoDescription:
      'Công Ty Cổ Phần Hóa Phẩm Tùng Việt - nhà sản xuất nhựa thông, rosin và các sản phẩm chế biến từ nhựa thông tại Việt Nam.',
    hero: {
      title: 'Công Ty Cổ Phần Hóa Phẩm Tùng Việt',
      subtitle: 'Chế biến chuyên sâu nhựa thông từ nguyên liệu trong nước',
      image: heroBanner,
    },
    intro: [
      'Chúng tôi bắt đầu sản xuất hóa chất từ năm 2007 với đội ngũ chuyên gia và kỹ sư giỏi, giàu kinh nghiệm.',
      'Đến đầu năm 2011, với nhu cầu mở rộng sản xuất, Nhà Máy Tùng Việt được xây dựng mới, chuyên về chế biến nhựa thông.',
      'Là nhà máy của Việt Nam chế biến chuyên sâu từ nguyên liệu nhựa thông thô trong nước, chúng tôi sản xuất các sản phẩm từ nhựa thông như Rosin Modified Maleic Resin, Rosin Glycerin Ester, Nhựa Sơn Giao Thông, Colophan, Tinh Dầu Thông, Pine Oil và nhiều sản phẩm khác.',
    ],
    historyTitle: 'Lịch sử',
    history: [
      { year: '2007', text: 'Bắt đầu sản xuất hóa chất với đội ngũ chuyên gia và kỹ sư giàu kinh nghiệm.' },
      { year: '2011', text: 'Xây dựng mới Nhà Máy Tùng Việt, chuyên chế biến nhựa thông.' },
      { year: 'Hiện nay', text: 'Công suất nhà máy đạt 20.000 tấn sản phẩm mỗi năm.' },
    ],
    factsTitle: 'Tùng Việt tính đến nay',
    facts: [
      { value: 2007, isYear: true, label: 'Năm bắt đầu sản xuất' },
      { value: 2011, isYear: true, label: 'Năm xây dựng nhà máy nhựa thông' },
      { value: 20000, suffix: ' tấn', label: 'Công suất mỗi năm' },
      { value: 6, label: 'Sản phẩm chính từ nhựa thông' },
    ],
    valuesTitle: 'Giá trị cốt lõi',
    valuesIntro: 'Những cam kết định hướng mọi hoạt động của chúng tôi',
    values: [
      { icon: 'FiShield', title: 'Chất lượng ổn định', description: 'Hệ thống máy móc hiện đại và kiểm soát sản xuất chặt chẽ, đảm bảo chất lượng đồng đều qua từng lô hàng.' },
      { icon: 'FiTrendingUp', title: 'Giá cả hợp lý', description: 'Chủ động nguồn nguyên liệu trong nước giúp chúng tôi cung cấp sản phẩm với giá cạnh tranh.' },
      { icon: 'FiHeart', title: 'Dịch vụ sau bán hàng', description: 'Đồng hành cùng khách hàng từ khâu tư vấn, giao hàng đến hỗ trợ sau bán.' },
    ],
    contactTitle: 'Thông tin liên hệ',
    contactSubtitle: 'Liên hệ với chúng tôi để được tư vấn sản phẩm và báo giá',
    contactLabels: {
      address: 'Địa chỉ',
      taxCode: 'Mã số thuế',
      phone: 'Điện thoại',
      fax: 'Fax',
      hotline: 'Hotline',
      email: 'Email',
      website: 'Website',
    },
    address: 'Đường số 7, Khu Công Nghiệp Nhơn Trạch II-Nhơn Phú, Thị Trấn Hiệp Phước, Huyện Nhơn Trạch, Tỉnh Đồng Nai',
    taxCode: '3602483670',
    phone: '028 3862 0025',
    fax: '028 3862 0027',
    hotlines: [
      { phone: '0907 776 779', email: 'sales@tungviet.com' },
      { phone: '0902 422 457', email: 'info@tungviet.com' },
    ],
    website: 'www.tungviet.com',
    ctaTitle: 'Cần báo giá hoặc tư vấn?',
    ctaButton: 'Gửi yêu cầu',
  },
  en: {
    seoTitle: 'About Us',
    seoDescription:
      'Tung Viet Chemical Joint Stock Company - producer of rosin, pine resin and pine-based chemical products in Vietnam.',
    hero: {
      title: 'Tung Viet Chemical Joint Stock Company',
      subtitle: 'In-depth processing of pine resin from domestic raw materials',
      image: heroBanner,
    },
    intro: [
      'We began producing chemicals in 2007 with a team of experienced experts and engineers.',
      'In early 2011, to expand production, the Tung Viet Factory was newly built, specializing in pine resin processing.',
      'As a Vietnamese factory that processes crude domestic pine resin in depth, we produce pine-based products such as Rosin Modified Maleic Resin, Rosin Glycerin Ester, Road Marking Resin, Colophony, Pine Oil and more.',
    ],
    historyTitle: 'History',
    history: [
      { year: '2007', text: 'Began chemical production with an experienced team of experts and engineers.' },
      { year: '2011', text: 'The new Tung Viet Factory was built, specializing in pine resin processing.' },
      { year: 'Today', text: 'The factory capacity reaches 20,000 tons of product per year.' },
    ],
    factsTitle: 'Tung Viet to date',
    facts: [
      { value: 2007, isYear: true, label: 'Year production began' },
      { value: 2011, isYear: true, label: 'Year the pine resin factory was built' },
      { value: 20000, suffix: ' t', label: 'Tons of capacity per year' },
      { value: 6, label: 'Main pine resin products' },
    ],
    valuesTitle: 'Core values',
    valuesIntro: 'The commitments that guide everything we do',
    values: [
      { icon: 'FiShield', title: 'Stable quality', description: 'Modern machinery and strict production control keep quality consistent from batch to batch.' },
      { icon: 'FiTrendingUp', title: 'Fair pricing', description: 'Stable domestic raw material supply lets us offer competitive prices.' },
      { icon: 'FiHeart', title: 'After-sales service', description: 'We support customers from consultation and delivery through after-sales care.' },
    ],
    contactTitle: 'Contact information',
    contactSubtitle: 'Contact us for product consultation and quotations',
    contactLabels: {
      address: 'Address',
      taxCode: 'Tax code',
      phone: 'Phone',
      fax: 'Fax',
      hotline: 'Hotline',
      email: 'Email',
      website: 'Website',
    },
    address: 'Road No. 7, Nhon Trach II-Nhon Phu Industrial Park, Hiep Phuoc Town, Nhon Trach District, Dong Nai Province, Vietnam',
    taxCode: '3602483670',
    phone: '+84 28 3862 0025',
    fax: '+84 28 3862 0027',
    hotlines: [
      { phone: '0907 776 779', email: 'sales@tungviet.com' },
      { phone: '0902 422 457', email: 'info@tungviet.com' },
    ],
    website: 'www.tungviet.com',
    ctaTitle: 'Need a quote or advice?',
    ctaButton: 'Send a request',
  },
};
