# CHIẾN LƯỢC NỘI DUNG CHO CÁC TRANG

## 1. Tổng quan

Để tăng giá trị SEO và trải nghiệm người dùng, cần bổ sung nội dung dạng bài viết ngắn cho các trang dữ liệu. Có 3 phương án chính:

---

## 2. So sánh các phương án

### **Phương án A: Mở rộng bảng `articles` hiện có** ⭐ **KHUYẾN NGHỊ**

**Ưu điểm:**
- ✅ Tận dụng hệ thống CMS admin đã có
- ✅ Không cần tạo bảng mới, giảm complexity
- ✅ Dễ quản lý tập trung (1 nơi cho tất cả nội dung)
- ✅ Có sẵn workflow: tạo, sửa, xóa, publish/draft
- ✅ Có sẵn tính năng upload ảnh, rich text editor

**Nhược điểm:**
- ⚠️ Cần thêm cột `content_type` để phân biệt loại nội dung
- ⚠️ Cần thêm cột `entity_id` và `entity_type` để liên kết với giải/đội/trang

**Cấu trúc bảng mở rộng:**
```sql
ALTER TABLE articles ADD COLUMN content_type VARCHAR(50) DEFAULT 'match_preview';
-- Các giá trị: 'match_preview', 'league_intro', 'team_intro', 'odds_guide', 'general'

ALTER TABLE articles ADD COLUMN entity_type VARCHAR(50);
-- Các giá trị: 'match', 'league', 'team', 'page', null

ALTER TABLE articles ADD COLUMN entity_id INTEGER;
-- ID của trận đấu, giải đấu, đội bóng tương ứng

-- Đổi tên match_id thành entity_id (backward compatible)
-- match_id vẫn giữ cho các bài nhận định trận đấu cũ
```

**Ví dụ sử dụng:**
```typescript
// Bài viết giới thiệu Premier League
{
  content_type: 'league_intro',
  entity_type: 'league',
  entity_id: 39,
  title: 'Giới thiệu Premier League 2025/2026',
  content: '...',
  slug: 'gioi-thieu-premier-league-2025-2026'
}

// Bài viết về Manchester United
{
  content_type: 'team_intro',
  entity_type: 'team',
  entity_id: 33,
  title: 'Lịch sử và thành tích Manchester United',
  content: '...'
}

// Bài hướng dẫn đọc kèo
{
  content_type: 'odds_guide',
  entity_type: 'page',
  entity_id: null,
  title: 'Hướng dẫn đọc tỷ lệ kèo châu Á',
  content: '...'
}
```

---

### **Phương án B: Tạo bảng `page_contents` riêng**

**Ưu điểm:**
- ✅ Tách biệt rõ ràng giữa "bài viết" và "nội dung trang"
- ✅ Schema đơn giản, dễ hiểu
- ✅ Có thể có cấu trúc khác với articles (ví dụ: sections, FAQ)

**Nhược điểm:**
- ❌ Cần xây dựng CMS admin mới cho page_contents
- ❌ Duplicate code: form tạo/sửa, upload ảnh, editor
- ❌ Quản lý phân tán (2 nơi khác nhau)
- ❌ Tốn thời gian phát triển

**Cấu trúc bảng:**
```sql
CREATE TABLE page_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type VARCHAR(50) NOT NULL, -- 'league', 'team', 'odds_page'
  entity_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sections JSONB, -- Cho phép nhiều sections
  author VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Phương án C: Lưu trực tiếp trong Redis/JSON files**

**Ưu điểm:**
- ✅ Nhanh, không cần query database
- ✅ Phù hợp với nội dung tĩnh, ít thay đổi

**Nhược điểm:**
- ❌ Không có UI quản lý, phải edit code/file
- ❌ Khó cập nhật, không phù hợp cho non-technical users
- ❌ Không có version control, history
- ❌ Không linh hoạt

---

## 3. Đề xuất triển khai (Phương án A)

### **Bước 1: Cập nhật Database Schema**

```sql
-- Migration script
ALTER TABLE articles 
  ADD COLUMN content_type VARCHAR(50) DEFAULT 'match_preview',
  ADD COLUMN entity_type VARCHAR(50),
  ADD COLUMN entity_id INTEGER;

-- Index để query nhanh
CREATE INDEX idx_articles_entity ON articles(entity_type, entity_id);
CREATE INDEX idx_articles_content_type ON articles(content_type);

-- Update existing articles
UPDATE articles SET 
  content_type = 'match_preview',
  entity_type = 'match',
  entity_id = match_id
WHERE match_id IS NOT NULL;
```

### **Bước 2: Tạo Service Layer**

```typescript
// lib/services/content.ts
export async function getLeagueContent(leagueId: number) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('entity_type', 'league')
    .eq('entity_id', leagueId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return data
}

export async function getTeamContent(teamId: number) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('entity_type', 'team')
    .eq('entity_id', teamId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return data
}

export async function getPageContent(contentType: string) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', contentType)
    .eq('entity_type', 'page')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return data
}
```

### **Bước 3: Cập nhật Admin Form**

Thêm fields vào `ArticleForm.tsx`:
- Dropdown chọn `content_type`
- Dropdown chọn `entity_type` (nếu không phải general article)
- Input `entity_id` (autocomplete với API search)

### **Bước 4: Hiển thị trên các trang**

```typescript
// app/giai-dau/[id]/page.tsx
async function LeagueIntro({ leagueId }: { leagueId: number }) {
  const content = await getLeagueContent(leagueId)
  if (!content) return null
  
  return (
    <div className="rounded-xl bg-white shadow-sm p-4 mb-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{content.title}</h2>
      <div 
        className="prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </div>
  )
}

// Thêm vào page
export default async function LeaguePage({ params }) {
  // ... existing code
  return (
    <>
      <LeagueIntro leagueId={leagueId} />
      {/* Existing tabs, standings, fixtures */}
    </>
  )
}
```

---

## 4. Các loại nội dung cần tạo

### **A. Trang Giải đấu (`/giai-dau/[id]`)**
- **content_type:** `league_intro`
- **Nội dung:** Giới thiệu giải đấu, lịch sử, format thi đấu, các đội tham gia
- **Vị trí:** Đầu trang, trước tabs BXH/Lịch/Nhận định
- **Độ dài:** 200-400 từ

### **B. Trang Đội bóng (`/doi-bong/[id]`)**
- **content_type:** `team_intro`
- **Nội dung:** Lịch sử đội bóng, thành tích, cầu thủ nổi bật, sân nhà
- **Vị trí:** Sau header đội bóng, trước tabs Thống kê/Lịch
- **Độ dài:** 200-400 từ

### **C. Trang Tỷ lệ kèo (`/ty-le-keo`)**
- **content_type:** `odds_guide`
- **Nội dung:** Hướng dẫn đọc kèo châu Á, tài xỉu, 1×2, tips cá cược
- **Vị trí:** Đầu trang hoặc tab riêng "Hướng dẫn"
- **Độ dài:** 400-600 từ

### **D. Trang Bảng xếp hạng (`/bang-xep-hang`)**
- **content_type:** `standings_guide`
- **Nội dung:** Giải thích các chỉ số (W, D, L, GF, GA, GD, Pts), cách tính điểm
- **Vị trí:** Collapsible section đầu trang
- **Độ dài:** 150-250 từ

### **E. Trang Lịch thi đấu (`/lich-thi-dau`)**
- **content_type:** `fixtures_intro`
- **Nội dung:** Giới thiệu các giải đang diễn ra, trận đáng chú ý
- **Vị trí:** Đầu trang, trước date picker
- **Độ dài:** 150-250 từ

---

## 5. Workflow tạo nội dung

1. **Admin đăng nhập** → `/admin/bai-viet/tao-moi`
2. **Chọn loại nội dung:**
   - Content Type: League Intro / Team Intro / Odds Guide / etc.
   - Entity Type: League / Team / Page
   - Entity ID: (autocomplete search)
3. **Viết nội dung:** Title, Content (rich text), Cover Image (optional)
4. **Publish:** Status = published
5. **Hiển thị tự động** trên trang tương ứng

---

## 6. SEO Benefits

- ✅ **Unique content** cho mỗi trang → tránh thin content
- ✅ **Keywords** tự nhiên trong nội dung
- ✅ **Dwell time** tăng (người dùng đọc thêm)
- ✅ **Internal linking** (link đến các bài viết liên quan)
- ✅ **Rich snippets** (có thể thêm FAQ schema)

---

## 7. Kết luận

**Phương án A (Mở rộng bảng articles)** là tối ưu nhất vì:
1. Tận dụng hệ thống CMS đã có
2. Dễ triển khai, ít code mới
3. Quản lý tập trung
4. Linh hoạt, mở rộng dễ dàng

**Timeline ước tính:**
- Database migration: 30 phút
- Service layer: 1 giờ
- Cập nhật admin form: 2 giờ
- Hiển thị trên các trang: 2-3 giờ
- **Tổng: ~6 giờ**
