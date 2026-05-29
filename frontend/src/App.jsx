import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Categories from './pages/Categories'
import Deals from './pages/Deals'
import About from './pages/About'
import Contact from './pages/Contact'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/categories" element={<Layout><Categories /></Layout>} />
	<Route path="/deals" element={<Layout><Deals /></Layout>} />
        <Route path="/categories/:slug" element={<Layout><Categories /></Layout>} />
	<Route path="/Contact" element={<Layout><Contact /></Layout>} />
	<Route path="/About" element={<Layout><About /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
	<Route path="/checkout" element={<Layout><Checkout /></Layout>} />
	<Route path="/order-success" element={<Layout><OrderSuccess /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
