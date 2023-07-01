import {Link, useLocation} from 'react-router-dom';
import './header.scss';

interface IRoute {
  label: string;
  path: string;
}

const Header = () => {
  const location = useLocation();
  const routes: IRoute[] = [
    { label: 'Home', path: '/' },
    { label: 'Balances', path: '/balances' },
    { label: 'TPS', path: '/tps' },
    { label: 'Market Cap', path: '/market-cap' },
  ]

  const renderLink = (route: IRoute) => {
    return (
      <Link 
      key={route.label}
      to={route.path} 
      className={location.pathname === route.path? 'selected link':'link'} >
        {route.label}
      </Link>
    );
  };

  return (
    <div className="header">
      <div className="routes flex">
        {routes.map(renderLink)}
      </div>
    </div>
  )
}

export default Header;