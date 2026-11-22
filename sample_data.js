/**
 * QUANG MINH AI DATA ANALYST — SAMPLE & CLEANED DATASETS
 * Dữ liệu mẫu chuẩn hóa tiếng Việt cho các ngữ cảnh doanh nghiệp
 */

const SAMPLE_DATASETS = {
  // 1. Chuỗi Bán Lẻ & Thương Mại Đa Kênh
  retail: [
    { Thang: "2026-01", Chi_Nhanh: "Hà Nội - Cầu Giấy", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 450000000, Chi_Phi_Von: 270000000, Loi_Nhuan_Gop: 180000000, So_Don_Hang: 1250 },
    { Thang: "2026-01", Chi_Nhanh: "TP.HCM - Quận 1", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 620000000, Chi_Phi_Von: 360000000, Loi_Nhuan_Gop: 260000000, So_Don_Hang: 1680 },
    { Thang: "2026-01", Chi_Nhanh: "Đà Nẵng - Hải Châu", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 280000000, Chi_Phi_Von: 175000000, Loi_Nhuan_Gop: 105000000, So_Don_Hang: 820 },
    { Thang: "2026-01", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "Shopee Mall", Doanh_Thu: 510000000, Chi_Phi_Von: 310000000, Loi_Nhuan_Gop: 200000000, So_Don_Hang: 2950 },
    { Thang: "2026-01", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "TikTok Shop", Doanh_Thu: 390000000, Chi_Phi_Von: 240000000, Loi_Nhuan_Gop: 150000000, So_Don_Hang: 2400 },

    { Thang: "2026-02", Chi_Nhanh: "Hà Nội - Cầu Giấy", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 520000000, Chi_Phi_Von: 300000000, Loi_Nhuan_Gop: 220000000, So_Don_Hang: 1420 },
    { Thang: "2026-02", Chi_Nhanh: "TP.HCM - Quận 1", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 710000000, Chi_Phi_Von: 410000000, Loi_Nhuan_Gop: 300000000, So_Don_Hang: 1910 },
    { Thang: "2026-02", Chi_Nhanh: "Đà Nẵng - Hải Châu", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 310000000, Chi_Phi_Von: 190000000, Loi_Nhuan_Gop: 120000000, So_Don_Hang: 890 },
    { Thang: "2026-02", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "Shopee Mall", Doanh_Thu: 590000000, Chi_Phi_Von: 350000000, Loi_Nhuan_Gop: 240000000, So_Don_Hang: 3300 },
    { Thang: "2026-02", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "TikTok Shop", Doanh_Thu: 480000000, Chi_Phi_Von: 290000000, Loi_Nhuan_Gop: 190000000, So_Don_Hang: 3100 },

    { Thang: "2026-03", Chi_Nhanh: "Hà Nội - Cầu Giấy", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 490000000, Chi_Phi_Von: 295000000, Loi_Nhuan_Gop: 195000000, So_Don_Hang: 1340 },
    { Thang: "2026-03", Chi_Nhanh: "TP.HCM - Quận 1", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 680000000, Chi_Phi_Von: 400000000, Loi_Nhuan_Gop: 280000000, So_Don_Hang: 1820 },
    { Thang: "2026-03", Chi_Nhanh: "Đà Nẵng - Hải Châu", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 290000000, Chi_Phi_Von: 180000000, Loi_Nhuan_Gop: 110000000, So_Don_Hang: 840 },
    { Thang: "2026-03", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "Shopee Mall", Doanh_Thu: 640000000, Chi_Phi_Von: 380000000, Loi_Nhuan_Gop: 260000000, So_Don_Hang: 3600 },
    { Thang: "2026-03", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "TikTok Shop", Doanh_Thu: 540000000, Chi_Phi_Von: 320000000, Loi_Nhuan_Gop: 220000000, So_Don_Hang: 3550 },

    { Thang: "2026-04", Chi_Nhanh: "Hà Nội - Cầu Giấy", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 550000000, Chi_Phi_Von: 320000000, Loi_Nhuan_Gop: 230000000, So_Don_Hang: 1490 },
    { Thang: "2026-04", Chi_Nhanh: "TP.HCM - Quận 1", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 760000000, Chi_Phi_Von: 440000000, Loi_Nhuan_Gop: 320000000, So_Don_Hang: 2010 },
    { Thang: "2026-04", Chi_Nhanh: "Đà Nẵng - Hải Châu", Kenh_Ban: "Cửa hàng Offline", Doanh_Thu: 330000000, Chi_Phi_Von: 200000000, Loi_Nhuan_Gop: 130000000, So_Don_Hang: 920 },
    { Thang: "2026-04", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "Shopee Mall", Doanh_Thu: 720000000, Chi_Phi_Von: 420000000, Loi_Nhuan_Gop: 300000000, So_Don_Hang: 4100 },
    { Thang: "2026-04", Chi_Nhanh: "Toàn quốc", Kenh_Ban: "TikTok Shop", Doanh_Thu: 630000000, Chi_Phi_Von: 370000000, Loi_Nhuan_Gop: 260000000, So_Don_Hang: 4200 }
  ],

  // 2. Tiếp Thị Số & Chiến Dịch Quảng Cáo
  marketing: [
    { Ky_Chien_Dich: "2026-T1", Kenh_Quang_Cao: "Facebook Ads", Ngan_Sach: 120000000, Luot_Hien_Thi: 2450000, Luot_Nhap: 78000, Don_Hang: 1560, Doanh_Thu_Mang_Ve: 624000000, ROAS: 5.2 },
    { Ky_Chien_Dich: "2026-T1", Kenh_Quang_Cao: "Google Search", Ngan_Sach: 95000000, Luot_Hien_Thi: 850000, Luot_Nhap: 52000, Don_Hang: 1820, Doanh_Thu_Mang_Ve: 728000000, ROAS: 7.66 },
    { Ky_Chien_Dich: "2026-T1", Kenh_Quang_Cao: "TikTok Video Ads", Ngan_Sach: 110000000, Luot_Hien_Thi: 3800000, Luot_Nhap: 95000, Don_Hang: 1350, Doanh_Thu_Mang_Ve: 472500000, ROAS: 4.3 },
    { Ky_Chien_Dich: "2026-T1", Kenh_Quang_Cao: "Zalo Official", Ngan_Sach: 35000000, Luot_Hien_Thi: 420000, Luot_Nhap: 18000, Don_Hang: 420, Doanh_Thu_Mang_Ve: 189000000, ROAS: 5.4 },

    { Ky_Chien_Dich: "2026-T2", Kenh_Quang_Cao: "Facebook Ads", Ngan_Sach: 135000000, Luot_Hien_Thi: 2800000, Luot_Nhap: 89000, Don_Hang: 1810, Doanh_Thu_Mang_Ve: 742000000, ROAS: 5.5 },
    { Ky_Chien_Dich: "2026-T2", Kenh_Quang_Cao: "Google Search", Ngan_Sach: 105000000, Luot_Hien_Thi: 920000, Luot_Nhap: 58000, Don_Hang: 2050, Doanh_Thu_Mang_Ve: 861000000, ROAS: 8.2 },
    { Ky_Chien_Dich: "2026-T2", Kenh_Quang_Cao: "TikTok Video Ads", Ngan_Sach: 140000000, Luot_Hien_Thi: 4900000, Luot_Nhap: 125000, Don_Hang: 1950, Doanh_Thu_Mang_Ve: 682500000, ROAS: 4.88 },
    { Ky_Chien_Dich: "2026-T2", Kenh_Quang_Cao: "Zalo Official", Ngan_Sach: 40000000, Luot_Hien_Thi: 490000, Luot_Nhap: 22000, Don_Hang: 510, Doanh_Thu_Mang_Ve: 229500000, ROAS: 5.74 },

    { Ky_Chien_Dich: "2026-T3", Kenh_Quang_Cao: "Facebook Ads", Ngan_Sach: 150000000, Luot_Hien_Thi: 3100000, Luot_Nhap: 96000, Don_Hang: 1980, Doanh_Thu_Mang_Ve: 811800000, ROAS: 5.41 },
    { Ky_Chien_Dich: "2026-T3", Kenh_Quang_Cao: "Google Search", Ngan_Sach: 120000000, Luot_Hien_Thi: 1050000, Luot_Nhap: 66000, Don_Hang: 2320, Doanh_Thu_Mang_Ve: 997600000, ROAS: 8.31 },
    { Ky_Chien_Dich: "2026-T3", Kenh_Quang_Cao: "TikTok Video Ads", Ngan_Sach: 165000000, Luot_Hien_Thi: 5800000, Luot_Nhap: 148000, Don_Hang: 2300, Doanh_Thu_Mang_Ve: 828000000, ROAS: 5.02 },
    { Ky_Chien_Dich: "2026-T3", Kenh_Quang_Cao: "Zalo Official", Ngan_Sach: 45000000, Luot_Hien_Thi: 550000, Luot_Nhap: 25000, Don_Hang: 580, Doanh_Thu_Mang_Ve: 261000000, ROAS: 5.8 }
  ],

  // 3. Hợp Đồng Dịch Vụ SaaS & Doanh Nghiệp B2B
  saas: [
    { Ma_HD: "HD-2026-001", Khach_Hang: "Tập đoàn VinaLogistics", Goi_Dich_Vu: "Enterprise Cloud", Ky_Han_Thang: 12, Gia_Tri_Hop_Dong: 360000000, Trang_Thai: "Đang triển khai", ARR: 360000000 },
    { Ma_HD: "HD-2026-002", Khach_Hang: "Công ty Dược PharmaTech", Goi_Dich_Vu: "Business Pro", Ky_Han_Thang: 24, Gia_Tri_Hop_Dong: 480000000, Trang_Thai: "Hoạt động", ARR: 240000000 },
    { Ma_HD: "HD-2026-003", Khach_Hang: "Chuỗi F&B Hương Việt", Goi_Dich_Vu: "Standard Growth", Ky_Han_Thang: 12, Gia_Tri_Hop_Dong: 120000000, Trang_Thai: "Hoạt động", ARR: 120000000 },
    { Ma_HD: "HD-2026-004", Khach_Hang: "Bảo hiểm An Khang", Goi_Dich_Vu: "Enterprise Cloud", Ky_Han_Thang: 36, Gia_Tri_Hop_Dong: 1080000000, Trang_Thai: "Đang nghiệm thu", ARR: 360000000 },
    { Ma_HD: "HD-2026-005", Khach_Hang: "Bất Động Sản CenLand", Goi_Dich_Vu: "Business Pro", Ky_Han_Thang: 12, Gia_Tri_Hop_Dong: 240000000, Trang_Thai: "Hoạt động", ARR: 240000000 },
    { Ma_HD: "HD-2026-006", Khach_Hang: "Hệ thống Anh Ngữ ILA", Goi_Dich_Vu: "Enterprise Cloud", Ky_Han_Thang: 24, Gia_Tri_Hop_Dong: 600000000, Trang_Thai: "Hoạt động", ARR: 300000000 },
    { Ma_HD: "HD-2026-007", Khach_Hang: "Ngân Hàng Số VPDirect", Goi_Dich_Vu: "Custom Solution", Ky_Han_Thang: 36, Gia_Tri_Hop_Dong: 1800000000, Trang_Thai: "Đang triển khai", ARR: 600000000 },
    { Ma_HD: "HD-2026-008", Khach_Hang: "Nội Thất Cozy Home", Goi_Dich_Vu: "Standard Growth", Ky_Han_Thang: 12, Gia_Tri_Hop_Dong: 96000000, Trang_Thai: "Đã gia hạn", ARR: 96000000 },
    { Ma_HD: "HD-2026-009", Khach_Hang: "Thời trang Canifa Group", Goi_Dich_Vu: "Business Pro", Ky_Han_Thang: 12, Gia_Tri_Hop_Dong: 260000000, Trang_Thai: "Hoạt động", ARR: 260000000 },
    { Ma_HD: "HD-2026-010", Khach_Hang: "Vận tải Đất Cảng", Goi_Dich_Vu: "Standard Growth", Ky_Han_Thang: 12, Gia_Tri_Hop_Dong: 144000000, Trang_Thai: "Hoạt động", ARR: 144000000 }
  ]
};

// Bộ Dữ Liệu Làm Sạch Mẫu Chuẩn (100% Clean Data Template)
const CLEAN_DATA_TEMPLATE = [
  { Ky_Bao_Cao: "Q1-2026", Don_Vi_Kinh_Doanh: "Miền Bắc - Hà Nội", Kenh_Phan_Phoi: "Đại lý Cấp 1", Doanh_Thu_Thuan: 850000000, Gia_Von_Hang_Ban: 480000000, Chi_Phi_Van_Hanh: 120000000, Loi_Nhuan_Rong: 250000000 },
  { Ky_Bao_Cao: "Q1-2026", Don_Vi_Kinh_Doanh: "Miền Nam - TP.HCM", Kenh_Phan_Phoi: "Đại lý Cấp 1", Doanh_Thu_Thuan: 1200000000, Gia_Von_Hang_Ban: 680000000, Chi_Phi_Van_Hanh: 170000000, Loi_Nhuan_Rong: 350000000 },
  { Ky_Bao_Cao: "Q1-2026", Don_Vi_Kinh_Doanh: "Miền Trung - Đà Nẵng", Kenh_Phan_Phoi: "Bán lẻ Trực tiếp", Doanh_Thu_Thuan: 420000000, Gia_Von_Hang_Ban: 240000000, Chi_Phi_Van_Hanh: 70000000, Loi_Nhuan_Rong: 110000000 },
  { Ky_Bao_Cao: "Q1-2026", Don_Vi_Kinh_Doanh: "Khối Thương Mại Điện Tử", Kenh_Phan_Phoi: "Shopee & TikTok", Doanh_Thu_Thuan: 980000000, Gia_Von_Hang_Ban: 550000000, Chi_Phi_Van_Hanh: 150000000, Loi_Nhuan_Rong: 280000000 },
  
  { Ky_Bao_Cao: "Q2-2026", Don_Vi_Kinh_Doanh: "Miền Bắc - Hà Nội", Kenh_Phan_Phoi: "Đại lý Cấp 1", Doanh_Thu_Thuan: 920000000, Gia_Von_Hang_Ban: 510000000, Chi_Phi_Van_Hanh: 130000000, Loi_Nhuan_Rong: 280000000 },
  { Ky_Bao_Cao: "Q2-2026", Don_Vi_Kinh_Doanh: "Miền Nam - TP.HCM", Kenh_Phan_Phoi: "Đại lý Cấp 1", Doanh_Thu_Thuan: 1350000000, Gia_Von_Hang_Ban: 740000000, Chi_Phi_Van_Hanh: 185000000, Loi_Nhuan_Rong: 425000000 },
  { Ky_Bao_Cao: "Q2-2026", Don_Vi_Kinh_Doanh: "Miền Trung - Đà Nẵng", Kenh_Phan_Phoi: "Bán lẻ Trực tiếp", Doanh_Thu_Thuan: 460000000, Gia_Von_Hang_Ban: 260000000, Chi_Phi_Van_Hanh: 75000000, Loi_Nhuan_Rong: 125000000 },
  { Ky_Bao_Cao: "Q2-2026", Don_Vi_Kinh_Doanh: "Khối Thương Mại Điện Tử", Kenh_Phan_Phoi: "Shopee & TikTok", Doanh_Thu_Thuan: 1150000000, Gia_Von_Hang_Ban: 640000000, Chi_Phi_Van_Hanh: 170000000, Loi_Nhuan_Rong: 340000000 }
];
