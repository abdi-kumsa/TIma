import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import NewTask from './pages/NewTask';
import OverallPlans from './pages/OverallPlans';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import Login from './pages/Login';
import SetPin from './pages/SetPin';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/set-pin',
    element: <ProtectedRoute><SetPin /></ProtectedRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'new',
        Component: NewTask,
      },
      {
        path: 'plans',
        Component: OverallPlans,
      },
      {
        path: 'stats',
        Component: Stats,
      },
      {
        path: 'settings',
        Component: Settings,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
], {
  basename: import.meta.env.PROD ? '/TIma' : '/',
});