import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { TopBarActionsProvider } from '../../context/TopBarActionsContext';

export default function Layout() {
  const location = useLocation();
  return (
    <TopBarActionsProvider>
      <div className="flex h-screen overflow-hidden bg-(--bg-base) gap-px">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main key={location.pathname} className="flex-1 overflow-y-auto p-5 lg:p-8 animate-page-enter">
            <Outlet />
          </main>
        </div>
      </div>
    </TopBarActionsProvider>
  );
}
