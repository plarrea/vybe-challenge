//import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Balances from './pages/Balances';
import MarketCap from './pages/MarketCap';
import TPS from './pages/TPS';
import Header from './components/Header';
import './app.scss';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/balances" element={<Balances />} />
        <Route path="/market-cap" element={<MarketCap />} />
        <Route path="/tps" element={<TPS />} />
        <Route path="*">
          <>Page not found</>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;