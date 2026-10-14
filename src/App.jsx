import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Preloader from './components/Preloader/Preloader';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Signup from './pages/Signup/Signup';
import GoogleCallback from './pages/GoogleCallback/GoogleCallback';
import MyInvitations from './pages/MyInvitations/MyInvitations';
import DesignPage from './pages/DesignPage/DesignPage';
import ScanPage from './pages/ScanPage/ScanPage';
import PreviewPage from './pages/PreviewPage/PreviewPage';
import InvitationPage from './pages/InvitationPage/InvitationPage';
import PaymentPage from './pages/PaymentPage/PaymentPage';
import MockCheckoutPage from './pages/MockCheckoutPage/MockCheckoutPage';
import PublicInvitePage from './pages/PublicInvitePage/PublicInvitePage';
import SharePage from './pages/SharePage/SharePage';
import GuestsDashboardPage from './pages/GuestsDashboardPage/GuestsDashboardPage';
import TemplatesPage from './pages/TemplatesPage/TemplatesPage';
import TutorialPage from './pages/TutorialPage/TutorialPage';
import PricingPage from './pages/PricingPage/PricingPage';
import TemplatePreviewPage from './pages/TemplatePreviewPage/TemplatePreviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Preloader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<Signup />} />
<Route path="/auth/google/callback" element={<GoogleCallback />} />
<Route path="/my-invitations" element={<MyInvitations />} />
<Route path="/invitations/create" element={<DesignPage />} />
<Route path="/invitations/:id/edit" element={<DesignPage />} />
<Route path="/scan/:token" element={<ScanPage />} />
<Route path="/preview/:id" element={<PreviewPage />} />
<Route path="/invitation/:id" element={<InvitationPage />} />
<Route path="/payment/:id" element={<PaymentPage />} />
<Route path="/mock-checkout" element={<MockCheckoutPage />} />
<Route path="/i/:slug" element={<PublicInvitePage />} />
<Route path="/share/:id" element={<SharePage />} />

<Route path="/dashboard/:id" element={<GuestsDashboardPage />} />
<Route path="/templates" element={<TemplatesPage />} />
<Route path="/tutorial" element={<TutorialPage />} />
<Route path="/pricing" element={<PricingPage />} />
<Route path="/template-preview/:id" element={<TemplatePreviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}