import type { Metadata } from 'next'
import { getPageContentByPath } from '@/lib/services/content'

export const metadata: Metadata = {
  title: 'Chính sách quyền riêng tư',
  description: 'Chính sách quyền riêng tư của BongDaWap - Cách chúng tôi thu thập và bảo vệ thông tin của bạn.',
}

export default async function ChinhSachRiengTuPage() {
  const content = await getPageContentByPath('/chinh-sach-rieng-tu')

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="bg-green-700 px-6 py-4">
        <h1 className="text-lg font-bold text-white">Chính sách quyền riêng tư</h1>
      </div>
      <div className="p-6">
        {content ? (
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        ) : (
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>BongDaWap cam kết bảo vệ quyền riêng tư của người dùng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">1. Thông tin thu thập</h2>
            <p>Chúng tôi có thể thu thập các thông tin sau khi bạn sử dụng dịch vụ:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Địa chỉ IP và thông tin trình duyệt</li>
              <li>Dữ liệu sử dụng trang web (trang đã xem, thời gian truy cập)</li>
              <li>Cookie và dữ liệu phiên làm việc</li>
            </ul>

            <h2 className="text-base font-semibold text-gray-900 mt-6">2. Mục đích sử dụng thông tin</h2>
            <p>Thông tin thu thập được sử dụng để:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Cải thiện trải nghiệm người dùng</li>
              <li>Phân tích lưu lượng truy cập</li>
              <li>Đảm bảo an toàn và bảo mật hệ thống</li>
            </ul>

            <h2 className="text-base font-semibold text-gray-900 mt-6">3. Cookie</h2>
            <p>BongDaWap sử dụng cookie để lưu trữ tùy chọn của người dùng và cải thiện hiệu suất trang web. Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể bị ảnh hưởng.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">4. Chia sẻ thông tin</h2>
            <p>Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, ngoại trừ khi được yêu cầu bởi pháp luật hoặc để cung cấp dịch vụ (ví dụ: nhà cung cấp phân tích).</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">5. Bảo mật dữ liệu</h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ thông tin của bạn khỏi truy cập trái phép, thay đổi hoặc tiết lộ.</p>

            <h2 className="text-base font-semibold text-gray-900 mt-6">6. Liên hệ</h2>
            <p>Nếu có câu hỏi về chính sách quyền riêng tư, vui lòng liên hệ với chúng tôi qua trang web.</p>

            <p className="mt-6 text-xs text-gray-400">Cập nhật lần cuối: tháng 4 năm 2026</p>
          </div>
        )}
      </div>
    </div>
  )
}
