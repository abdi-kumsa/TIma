import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
