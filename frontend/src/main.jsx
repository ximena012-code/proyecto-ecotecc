import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Registro from './pages/Registro.jsx';
import Login from './pages/Login.jsx';
import FavoritosPage from './pages/FavoritosPage.jsx';
import Carrito from './pages/Carrito.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MiInformacion from './pages/MiInformacion.jsx';
import Dashboardadmi from './pages/Dashboardadmi.jsx';
import Productos from './pages/Productos.jsx';
import Pedido from './pages/Pedido.jsx';
import HistorialFacturas from './pages/HistorialFacturas.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import UserRoute from './components/Userroute.jsx';
import DashboardCuentas from './pages/DashboardCuentas.jsx'; 
import Ventas from './pages/Ventas.jsx';
import Calificaciones from './pages/Calificaciones.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import ResetPassword from './pages/ResetPassword.jsx'; 
import Empresa from './pages/Empresa.jsx';
import VenderDispositivo from './pages/VenderDispositivo.jsx';
import SolicitarReparacion from './pages/SolicitarReparacion.jsx';
import { CartProvider } from './context/CartContext';
import CategoriaPage from './pages/CategoriaPage.jsx';
import PagoExitoso from './pages/PagoExitoso.jsx';
import BlogTipsDispositivos from './pages/BlogTipsDispositivos.jsx'; 
import DetallePedido from './pages/DetallePedido.jsx'; 
import EstadoReparacion from './pages/EstadoReparacion.jsx';
import { AuthProvider } from "./context/AuthContext.jsx";
import EstadoAdminReparacion from './pages/EstadoAdminReparacion.jsx';
import Buscar from './pages/Buscar.jsx';
import ProtectedNotifications from './components/ProtectedNotifications.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaginaPago from './pages/PaginaPago.jsx';

// Usa tu clave publicable de Stripe aquí
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); // 👈 Centralizado en .env

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="registro" element={<Registro />} />
                <Route path="login" element={<Login />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/buscar" element={<Buscar />} />
                <Route path="Empresa" element={<Empresa />} />
                <Route path="/servicios/vender-dispositivo" element={<VenderDispositivo />} />
                <Route path="/servicios/solicitar-reparacion" element={<SolicitarReparacion />} />
                <Route path="/servicios/ver-estado" element={<EstadoReparacion />} />
                <Route path="/blog" element={<BlogTipsDispositivos />} />
                <Route path="estado-reparacion" element={<EstadoAdminReparacion />} />
                <Route path="productos/:slug" element={<CategoriaPage />} />
                <Route path="/producto/:id" element={<DetalleProducto />} /> 
                <Route path="carrito" element={<UserRoute><Carrito /></UserRoute>} />
                <Route path="pedido" element={<Pedido />} />
                
                {/* Notificaciones - Accesible para usuarios autenticados */}
                <Route path="notificaciones" element={<ProtectedNotifications />} />
                
                {/* Rutas de usuario */}
                <Route path="dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
                <Route path="mi-informacion" element={<UserRoute><MiInformacion /></UserRoute>} />
                <Route path="favoritos" element={<UserRoute><FavoritosPage /></UserRoute>} />
                <Route path="historial-facturas" element={<UserRoute><HistorialFacturas /></UserRoute>} />
                <Route path="pagar" element={<UserRoute><PaginaPago /></UserRoute>} />
                <Route path="detalle-pedido" element={<UserRoute><DetallePedido /></UserRoute>} />
                <Route path="pago-exitoso" element={<PagoExitoso />}/>

                {/* Rutas de administrador */}
                <Route path="productos" element={<AdminRoute><Productos/></AdminRoute>} />
                <Route path="dashboardadmi" element={<AdminRoute><Dashboardadmi/></AdminRoute>} />
                <Route path="cuentas-registradas" element={<AdminRoute><DashboardCuentas /></AdminRoute>} />
                <Route path="ventas" element={<AdminRoute><Ventas /></AdminRoute>} />
                <Route path="calificaciones" element={<AdminRoute><Calificaciones /></AdminRoute>} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </Elements>
  </React.StrictMode>
);