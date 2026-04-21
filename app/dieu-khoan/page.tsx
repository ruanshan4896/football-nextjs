import type { Metadata } from 'next'
import { getPageContentByPath } from '@/lib/services/content'

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ',
  description: 'Điều khoản dịch vụ của BongDaWap - Các quy định và điều kiện sử dụng trang web.',
  alternates: {
    canonical: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')}/dieu-khoan`,
  },
}

export default async function DieuKhoanPage() {
  const content = await getPageContentByPath('/dieu-khoan')

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="bg-green-700 px-6 py-4">
        <h1 className="text-lg font-bold text-white">Điều khoản dịch vụ</h1>
      </div>
      <div className="p-6">
        {content ? (
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        ) : (
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>Chào mừng bạn đến với <strong>BongDaWap</strong>. Bằng cách truy cập và sử dụng trang web này, bạn đồng ý tuân thủ các điều khoản dịch vụ sau đây.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">1. Chấp nhận điều khoản</h2>
            <p>Khi sử dụng BongDaWap, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">2. Mục đích sử dụng</h2>
            <p>BongDaWap cung cấp thông tin bóng đá bao gồm livescore, kết quả, bảng xếp hạng, tỷ lệ kèo và nhận định chỉ mang tính chất tham khảo. Chúng tôi không chịu trách nhiệm về bất kỳ quyết định nào được đưa ra dựa trên thông tin từ trang web.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">3. Sở hữu trí tuệ</h2>
            <p>Toàn bộ nội dung trên BongDaWap bao gồm văn bản, hình ảnh, logo và dữ liệu thuộc quyền sở hữu của BongDaWap hoặc các đối tác cung cấp dữ liệu. Nghiêm cấm sao chép, phân phối lại mà không có sự cho phép bằng văn bản.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">4. Giới hạn trách nhiệm</h2>
            <p>BongDaWap không đảm bảo tính chính xác tuyệt đối của dữ liệu thời gian thực. Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc sử dụng thông tin trên trang web.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">5. Thay đổi điều khoản</h2>
            <p>BongDaWap có quyền thay đổi các điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>

            <p className="mt-6 text-xs text-gray-400">Cập nhật lần cuối: tháng 4 năm 2026</p>
          </div>
        )}
      </div>
    </div>
  )
}
