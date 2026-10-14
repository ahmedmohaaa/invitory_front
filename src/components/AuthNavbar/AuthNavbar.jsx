import Navbar from '../Navbar/Navbar';
import './AuthNavbar.css';

/**
 * النافبار الموحد لصفحات المصادقة (تسجيل الدخول + نسيت كلمة المرور).
 * يعيد استخدام مكوّن Navbar الموجود بالفعل — بدون أي تكرار كود.
 */
export default function AuthNavbar() {
  return <Navbar />;
}