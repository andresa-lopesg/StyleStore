import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-base)">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main key={location.pathname} className="flex-1 overflow-y-auto p-6 animate-page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
