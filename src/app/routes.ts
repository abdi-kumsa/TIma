import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import NewTask from './pages/NewTask';
import OverallPlans from './pages/OverallPlans';
import Settings from './pages/Settings';
import Stats from './pages/Stats';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
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
]);