# Angular Docs Tiếng Việt (Headless Data-driven Documentation)

Dự án tài liệu Angular tiếng Việt với kiến trúc **Data-driven**: Mỗi trang tài liệu là 1 file JSON chuẩn hoá, Angular app tự động load và render theo block.

---

## 🚀 Tính năng nổi bật

1. **Zero-code khi thêm bài mới**: Thêm trang mới bằng cách tạo 1 file `.json` trong `public/content/` và khai báo vào `nav.json`. Không cần sửa router hay code Angular.
2. **Clean Git Diff**: Mã nguồn code được lưu dạng mảng `code: string[]` giúp diff trực quan từng dòng, không bị escape `\n`.
3. **Độ an toàn cao (Type-safe & Schema Validation)**: Tích hợp [Zod](https://zod.dev) kiểm tra cấu trúc toàn bộ file JSON qua `npm run validate`.
4. **Code Highlighting xịn xò**: Tích hợp [Shiki](https://shiki.style) với bộ theme `github-dark`, hỗ trợ hiển thị tên file và nút bấm Copy tiện lợi.
5. **Giao diện hiện đại**:
   - Layout 3 cột (Sidebar trái - Nội dung ở giữa - Mục lục TOC bên phải).
   - Hỗ trợ đổi giao diện Tối / Sáng (Dark / Light mode).
   - Responsive với menu drawer trên thiết bị di động.
   - Smooth anchor scrolling khi click vào mục lục.

---

## 📂 Cấu trúc thư mục

```
documents-vn/
├── public/content/              # Nơi chứa toàn bộ dữ liệu tài liệu dạng JSON
│   ├── nav.json                 # Cấu hình danh mục thanh điều hướng trái
│   ├── overview.json            # Trang "Angular là gì?"
│   ├── essentials/              # Các bài về tính năng cốt lõi (components, signals, ssr, ...)
│   ├── tools/                   # Các bài về công cụ (cli, devtools, update)
│   ├── ecosystem/               # Bảo mật, i18n, build system
│   └── community/               # Roadmap, cộng đồng
├── scripts/
│   └── validate.ts              # Script kiểm tra JSON hợp lệ bằng Zod
├── src/app/
│   ├── models.ts                # TypeScript interfaces cho DocPage & Block
│   ├── doc.service.ts           # Service đọc JSON từ public/content/
│   ├── doc-page.component.ts    # Component chính render danh sách blocks
│   ├── layout/
│   │   ├── sidebar.component.ts # Sidebar trái
│   │   └── toc.component.ts     # Mục lục trang bên phải (TOC)
│   └── blocks/                  # Các component render từng loại block
│       ├── cards.component.ts
│       ├── code-block.component.ts
│       ├── callout.component.ts
│       └── inline.pipe.ts       # Pipe xử lý inline `code` và [link](url)
```

---

## 🛠️ Hướng dẫn cài đặt và chạy

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Kiểm tra tính hợp lệ của các file JSON (Schema Validation)
```bash
npm run validate
```

### 3. Chạy môi trường phát triển (Dev server)
```bash
npm start
```
Truy cập trình duyệt tại: `http://localhost:4200`

### 4. Đóng gói cho Production
```bash
npm run build
```

---

## 📝 Cách thêm một bài viết mới

1. **Bước 1**: Tạo file JSON trong thư mục tương ứng trong `public/content/`, ví dụ `public/content/essentials/lifecycle.json`.
2. **Bước 2**: Khai báo đường dẫn vào `public/content/nav.json`:
   ```json
   { "label": "Vòng đời Component", "path": "essentials/lifecycle" }
   ```
3. **Bước 3**: Chạy kiểm tra:
   ```bash
   npm run validate
   ```
Trang mới sẽ lập tức xuất hiện trên giao diện web mà không cần cấu hình thêm bất kỳ dòng code Angular nào!
