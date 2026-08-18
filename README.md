# University Student Portal

Giao diện cổng thông tin sinh viên (dashboard, lịch học, điểm số, đăng ký môn, thông báo, hồ sơ...).

## Công nghệ

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Recharts
- `qrcode` (sinh mã QR thật cho thiết lập MFA)

## Xác thực hai yếu tố (MFA/TOTP)


- `src/lib/totp.ts` — sinh secret Base32, tạo `otpauth://` URI, tính/so khớp mã TOTP (dung sai ±1 bước 30s), chống replay, sinh mã khôi phục.
- `src/lib/mockAuth.ts` — mô phỏng backend: đăng ký/đăng nhập (hash mật khẩu), khóa tạm sau 5 lần sai (lockout 30s) cho cả login và OTP, thiết lập/kích hoạt MFA, xác thực OTP khi đăng nhập, xác thực mã khôi phục, cấp session dạng JWT giả.
- `src/components/QRCode.tsx` — vẽ QR **thật** (dùng package `qrcode`), quét được bằng Google Authenticator/Authy.

**Tài khoản demo:** `nguyentuan@student.edu.vn` / `Student@123` (xem `src/data/student.ts`, `src/lib/demoAccount.ts`). Đăng nhập → vào **Cài đặt → Bảo mật** để bật MFA (quét QR thật, nhập mã xác nhận, lưu recovery codes). Lần đăng nhập sau sẽ được yêu cầu nhập mã OTP tại `/two-factor`, hoặc dùng recovery code tại `/recovery` nếu mất thiết bị.

## Cài đặt & chạy

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Cấu trúc thư mục

```
src/
  app/            # routes
  components/     # component dùng chung (Layout, Toast, QRCode...)
  data/           # dữ liệu mẫu
  i18n/           # đa ngôn ngữ
  imports/        # ảnh
  pages/          # các trang chính
  pages/auth/     # trang đăng nhập/đăng ký/khôi phục mật khẩu
```
