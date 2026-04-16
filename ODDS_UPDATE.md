# Cập nhật Trang Tỷ Lệ Kèo - Chỉ Hiển Thị Trận Sắp Diễn Ra

## Vấn đề
Trang tỷ lệ kèo trước đây hiển thị tất cả các trận trong mùa giải, bao gồm cả những trận đã kết thúc, gây khó khăn cho người dùng khi tìm kiếm kèo cho các trận sắp diễn ra.

## Giải pháp
Đã chỉnh sửa service `getOddsByLeague` để lọc và chỉ hiển thị các trận có status = 'NS' (Not Started - Sắp diễn ra).

## Thay đổi chi tiết

### 1. Service Odds (`lib/services/odds.ts`)
- **Cập nhật function `getOddsByLeague`**:
  - Lấy tất cả odds từ API như trước
  - Fetch thông tin fixture để kiểm tra status
  - Lọc chỉ những trận có `fixture.status.short === 'NS'`
  - Cập nhật cache key để tránh conflict với dữ liệu cũ
  - Giảm thời gian cache để dữ liệu cập nhật nhanh hơn

### 2. Trang Tỷ Lệ Kèo (`app/ty-le-keo/page.tsx`)
- **Cập nhật thông báo**: Thay đổi từ "Chưa có tỷ lệ kèo" thành "Hiện không có trận sắp diễn ra"
- **Thêm dark mode support**: Cập nhật tất cả components với classes dark mode

### 3. Components UI
- **OddsMatchRow**: Thêm dark mode support cho tất cả elements
- **BookmakerSelect**: Cập nhật với dark mode styling
- **Header và borders**: Cập nhật colors cho dark theme

## Lợi ích

### Cho người dùng:
- **Thông tin chính xác**: Chỉ hiển thị kèo cho các trận sắp diễn ra
- **Tiết kiệm thời gian**: Không phải lọc qua các trận đã kết thúc
- **Trải nghiệm tốt hơn**: Dark mode support cho việc xem kèo ban đêm

### Cho hệ thống:
- **Cache hiệu quả**: Cache key riêng biệt cho dữ liệu đã lọc
- **Performance**: Giảm số lượng trận hiển thị, tăng tốc độ load
- **Dữ liệu cập nhật**: Cache time ngắn hơn để đảm bảo tính real-time

## Kỹ thuật

### Lọc dữ liệu:
```typescript
// Lấy thông tin fixture để kiểm tra status
const fixtures = await Promise.all(fixtureIds.map(id => fetchFixtureById(id)))

// Lọc chỉ những trận sắp diễn ra
const upcomingOdds = result.odds.filter((odds, index) => {
  const fixture = fixtures[index]
  return fixture && fixture.fixture.status.short === 'NS'
})
```

### Cache strategy:
- Cache key: `odds_league_{id}_{season}_{page}_bm{bookmaker}_upcoming`
- TTL: `CACHE_TTL.ODDS / 2` (ngắn hơn để cập nhật nhanh)

### Dark mode:
- Sử dụng Tailwind `dark:` prefix
- Cập nhật tất cả text, background, border colors
- Maintain contrast ratios cho accessibility

## Status
✅ **Hoàn thành** - Trang tỷ lệ kèo hiện chỉ hiển thị các trận sắp diễn ra với full dark mode support.

## Test
- Build thành công ✅
- TypeScript compilation ✅  
- Dark mode styling ✅
- Responsive design ✅