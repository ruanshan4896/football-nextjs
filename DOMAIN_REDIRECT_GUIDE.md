# Hướng dẫn thiết lập chuyển hướng domain

## 1. Sử dụng Next.js (Đã cấu hình)

### Middleware (middleware.ts)
- Chỉnh sửa object `DOMAIN_REDIRECTS` trong file `middleware.ts`
- Thêm domain cũ và domain mới tương ứng
- Tự động giữ nguyên path và query parameters

### Next.js Config (next.config.ts)
- Uncomment và chỉnh sửa phần redirects trong `next.config.ts`
- Thay đổi `old-domain.com` thành domain cũ thực tế

## 2. Cấu hình Server (Nginx/Apache)

### Nginx
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name old-domain.com www.old-domain.com;
    
    # SSL certificates (nếu có)
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;
    
    return 301 https://bongdalive.com$request_uri;
}
```

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?old-domain\.com$ [NC]
RewriteRule ^(.*)$ https://bongdalive.com/$1 [R=301,L]
```

## 3. Cấu hình DNS
1. Trỏ domain cũ về cùng server với domain mới
2. Hoặc sử dụng CNAME record trỏ về domain mới

## 4. Cloudflare (nếu sử dụng)
1. Vào Cloudflare Dashboard
2. Chọn domain cũ
3. Vào Rules > Page Rules
4. Tạo rule: `old-domain.com/*` → `https://bongdalive.com/$1` (301 redirect)

## 5. Kiểm tra
- Sử dụng curl: `curl -I http://old-domain.com`
- Kiểm tra HTTP status code 301
- Verify redirect URL đúng

## Lưu ý SEO
- Sử dụng 301 redirect (permanent) để giữ SEO ranking
- Cập nhật Google Search Console với domain mới
- Submit sitemap mới
- Cập nhật backlinks quan trọng