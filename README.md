# سامانه مدیریت تعمیرات موبایل

یک سیستم کامل و حرفه‌ای برای مدیریت فرآیند تعمیرات موبایل با معماری جداگانه (جداسازی Frontend از Backend).

## ویژگی‌ها

*   **پنل مشتری:** ثبت درخواست تعمیر، دریافت کد پیگیری یکتا، پیگیری وضعیت تعمیر.
*   **پنل مدیریت:** احراز هویت امن، مشاهده و جستجوی درخواست‌ها، تغییر وضعیت تعمیر، ثبت هزینه نهایی و قطعات مصرفی، خروجی گزارش اکسل، نمودارهای آماری.
*   **طراحی مدرن:** رابط کاربری واکنش‌گرا با Tailwind CSS و انیمیشن‌های نرم.
*   **API استاندارد:** ارتباط Frontend و Backend از طریق REST API.

##  تکنولوژی‌های استفاده شده

| بخش | تکنولوژی |
|------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios, Recharts, Framer Motion |
| Backend | PHP 8, MySQL, PDO |
| سرور محلی | XAMPP (Apache + MySQL) |

## پیش‌نیازها

قبل از شروع، مطمئن شوید موارد زیر روی سیستم شما نصب شده است:

- [XAMPP](https://www.apachefriends.org/) (نسخه 8 یا بالاتر)
- [Node.js](https://nodejs.org/) (نسخه 18 یا بالاتر)
- [Git](https://git-scm.com/) (اختیاری، برای clone مخزن)
- یک مرورگر مدرن (Chrome، Firefox، Edge)

## راهنمای نصب و اجرا (گام به گام)

### دریافت پروژه

```bash
git clone https://github.com/useraref/repair_system-beta-.git
cd repair_system-beta-
