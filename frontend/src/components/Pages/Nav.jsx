import { Link, useLocation } from 'react-router'

export function Nav({ to, text }) { 
  const location = useLocation(); 
  return ( 
    <Link 
      className={`nav-link ${location.pathname === to ? 'active' : ''}`} 
      to={to}>
        <span>{text}</span>
        <b>→</b>
    </Link>
  ); 
}