# Migration Guide: Add content_type Column

## Mục đích
Thêm cột `content_type` vào bảng `articles` để phân biệt rõ ràng giữa:
- `article`: Bài viết thường (nhận định, tin tức) - hiển thị ở /nhan-dinh
- `page_content`: Nội dung trang (giới thiệu giải đấu, đội bóng, hướng dẫn) - chỉ hiển thị ở trang tương ứng

## Cách chạy Migration

### Bước 1: Truy cập Supabase Dashboard
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor**

### Bước 2: Chạy Migration Script
Copy toàn bộ nội dung file `supabase/migration_add_content_type.sql` và paste vào SQL Editor, sau đó click **Run**.

Script sẽ:
1. Thêm cột `content_type` với giá trị mặc định là `'article'`
2. Tự động update các bài viết hiện có:
   - Bài có slug bắt đầu bằng `gioi-thieu-`, `huong-dan-`, `lich-su-` → `content_type = 'page_content'`
   - Các bài còn lại → `content_type = 'article'`
3. Thêm constraint để đảm bảo chỉ có 2 giá trị hợp lệ
4. Tạo index để tăng tốc query

### Bước 3: Verify Migration
Sau khi chạy xong, kiểm tra kết quả:

```sql
SELECT content_type, COUNT(*) as count 
FROM articles 
GROUP BY content_type;
```

Kết quả mong đợi:
```
content_type    | count
----------------|------
article         | X
page_content    | Y
```

### Bước 4: Deploy Code
Sau khi migration thành công, push code lên GitHub:

```bash
git add -A
git commit -m "feat: add content_type column to articles table"
git push origin main
```

## Quy ước sử dụng

### Bài viết (Article)
- `content_type = 'article'`
- Hiển thị ở: `/nhan-dinh`, sidebar "Tin HOT", tab "Nhận định" trong trang giải đấu
- Ví dụ: Nhận định trận đấu, tin tức bóng đá

### Nội dung trang (Page Content)
- `content_type = 'page_content'`
- Chỉ hiển thị ở trang được chỉ định
- Ví dụ:
  - Giới thiệu giải đấu: `league_id = 39`, `match_id = NULL`
  - Giới thiệu đội bóng: `match_id = 33` (team ID), `league_id = -1`
  - Hướng dẫn tỷ lệ kèo: `league_id = 0`, `match_id = NULL`

## Rollback (nếu cần)

Nếu có vấn đề, có thể rollback bằng cách:

```sql
-- Xóa index
DROP INDEX IF EXISTS idx_articles_content_type;

-- Xóa constraint
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_content_type_check;

-- Xóa cột
ALTER TABLE articles DROP COLUMN IF EXISTS content_type;
```

## Lưu ý
- Migration này **KHÔNG** xóa hoặc thay đổi dữ liệu hiện có
- Chỉ thêm cột mới và update giá trị dựa trên slug pattern
- Sau khi migration, slug không còn được dùng để phân loại nữa
