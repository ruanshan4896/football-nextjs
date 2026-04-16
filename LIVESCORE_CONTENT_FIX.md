# Sửa lỗi hiển thị nội dung CMS trên trang Livescore

## Vấn đề
Người dùng đã thêm bài viết với path `/livescore` trong CMS nhưng không thấy hiển thị trên trang livescore.

## Nguyên nhân
Trang livescore (`/app/livescore/page.tsx`) thiếu component `PageContentSection` để hiển thị nội dung CMS. Khi di chuyển trang livescore từ `/` sang `/livescore`, component này đã bị bỏ sót.

## Giải pháp đã thực hiện

### 1. Thêm imports cần thiết
```typescript
import PageContentSection from '@/components/ui/PageContent'
import { getPageContentByPath } from '@/lib/services/content'
```

### 2. Cập nhật component trang livescore
- Thêm logic lấy nội dung CMS với path `/livescore`
- Hiển thị `PageContentSection` ở cuối trang (sau các section livescore)
- Chỉ hiển thị khi có nội dung

### 3. Cải thiện PageContent component
- Thêm dark mode support
- Cập nhật styling cho consistency
- Thêm border để phù hợp với design system

## Code thay đổi

### Trang Livescore (`app/livescore/page.tsx`)
```typescript
export default async function LivescorePage() {
  // Lấy nội dung CMS cho trang livescore
  const pageContent = await getPageContentByPath('/livescore')

  return (
    <div className="space-y-4">
      {/* Existing livescore content */}
      <Suspense fallback={<MatchListSkeleton />}>
        <LiveSection />
      </Suspense>
      <Suspense fallback={<MatchListSkeleton />}>
        <TodaySection />
      </Suspense>

      {/* Nội dung CMS - hiển thị ở cuối trang */}
      {pageContent && (
        <PageContentSection content={pageContent} />
      )}
    </div>
  )
}
```

### PageContent Component (`components/ui/PageContent.tsx`)
```typescript
export default function PageContentSection({ content, className = '' }: Props) {
  return (
    <div className={`rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{content.title}</h2>
        <div 
          className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
        {content.author && (
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Tác giả: {content.author}
          </p>
        )}
      </div>
    </div>
  )
}
```

## Cách hoạt động

### 1. CMS Content Flow
1. Admin tạo bài viết với `content_type = 'page_content'`
2. Đặt `page_path = '/livescore'`
3. Publish bài viết
4. Trang livescore tự động hiển thị nội dung ở cuối

### 2. Database Query
```sql
SELECT * FROM articles 
WHERE content_type = 'page_content' 
  AND page_path = '/livescore' 
  AND status = 'published'
ORDER BY created_at DESC 
LIMIT 1
```

### 3. Conditional Rendering
- Chỉ hiển thị khi `pageContent` tồn tại
- Không ảnh hưởng đến layout khi không có nội dung
- Hiển thị ở cuối trang theo pattern đã thiết lập

## Lợi ích

### Cho Admin:
- **Dễ quản lý**: Thêm nội dung cho trang livescore qua CMS
- **Flexible**: Có thể cập nhật nội dung mà không cần deploy code
- **Rich content**: Hỗ trợ HTML formatting đầy đủ

### Cho User:
- **Consistent UX**: Nội dung hiển thị theo design system
- **Dark mode**: Tự động adapt theo theme
- **Mobile friendly**: Responsive design

### Cho Developer:
- **Maintainable**: Code pattern nhất quán với các trang khác
- **Scalable**: Dễ dàng thêm tính năng tương tự cho trang khác
- **Type safe**: Full TypeScript support

## Testing

### Kiểm tra hoạt động:
1. ✅ Build successful
2. ✅ TypeScript compilation
3. ✅ Dark mode support
4. ✅ Responsive design
5. ✅ Content rendering

### Các trường hợp test:
- **Có nội dung**: Hiển thị bài viết ở cuối trang
- **Không có nội dung**: Trang hoạt động bình thường
- **Dark mode**: Styling phù hợp
- **Mobile**: Layout responsive

## Status
✅ **Hoàn thành** - Trang livescore hiện đã hiển thị nội dung CMS với path `/livescore` ở cuối trang.

## Ghi chú
Nội dung CMS sẽ xuất hiện ở **cuối trang livescore**, sau các section "Đang diễn ra" và "Sắp diễn ra hôm nay", theo pattern đã được thiết lập ở các trang khác.