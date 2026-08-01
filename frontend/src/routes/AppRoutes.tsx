import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import AboutPage from '../pages/AboutPage';
import AdminPage from '../pages/AdminPage';
import HomePage from '../pages/HomePage';
import InviteActivationPage from '../pages/InviteActivationPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProgrammePage from '../pages/ProgrammePage';
import RegisterPage from '../pages/RegisterPage';
import RegisterSuccessPage from '../pages/RegisterSuccessPage';
import DemoVillagePage from '../pages/DemoVillagePage';
import StartupAwardsPage from '../pages/StartupAwardsPage';
import SideEventsPage from '../pages/SideEventsPage';
import PartnersPage from '../pages/PartnersPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="programme" element={<ProgrammePage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="register/success" element={<RegisterSuccessPage />} />
        <Route path="demo-village" element={<DemoVillagePage />} />
        <Route path="startup-awards" element={<StartupAwardsPage />} />
        <Route path="side-events" element={<SideEventsPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="admin/invite/:token" element={<InviteActivationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminPage />} />
        <Route path="*" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
