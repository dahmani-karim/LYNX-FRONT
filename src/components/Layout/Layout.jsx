import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import './Layout.scss';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
