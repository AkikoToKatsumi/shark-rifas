'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Ticket, Activity, 
  BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  Download, Filter, RefreshCcw
} from 'lucide-react';

type Raffle = {
  id: string;
  title: string;
  description: string;
  ticket_price: number;
  total_tickets: number;
  emoji: string;
  draw_date: string;
  is_active: boolean;
  image_url: string;
};

type Ticket = {
  id: string;
  ticket_number: string;
  status: string;
  payment_method: string;
  created_at: string;
  participants: {
    full_name: string;
    phone: string;
    email: string;
  };
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Data State
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');

  // New Raffle Form State
  const [editingRaffleId, setEditingRaffleId] = useState<string | null>(null);
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    ticket_price: '',
    total_tickets: '10000',
    draw_date: '',
    description: '',
    emoji: '🎟️',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  // Login Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('shark_admin_auth');
      const savedPass = localStorage.getItem('shark_admin_key');
      if (auth === 'true' && savedPass) {
        setIsAuthenticated(true);
        setPassword(savedPass); // keep it in state for API calls
      }
    }
  }, []);

  // Fetch Data when authenticated
  useEffect(() => {
    if (isAuthenticated && password) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Raffles
      const resRaffles = await fetch('/api/admin/raffles', {
        headers: { 'x-admin-key': password }
      });
      if (resRaffles.ok) {
        const data = await resRaffles.json();
        setRaffles(data.raffles || []);
      }

      // Fetch Tickets
      const resTickets = await fetch('/api/admin/tickets', {
        headers: { 'x-admin-key': password }
      });
      if (resTickets.ok) {
        const data = await resTickets.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        localStorage.setItem('shark_admin_auth', 'true');
        localStorage.setItem('shark_admin_key', password);
        setIsAuthenticated(true);
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shark_admin_auth');
    localStorage.removeItem('shark_admin_key');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSaveRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/raffles';
      const method = editingRaffleId ? 'PATCH' : 'POST';
      const bodyData = editingRaffleId 
        ? { id: editingRaffleId, updates: {
            title: newRaffle.title,
            description: newRaffle.description,
            emoji: newRaffle.emoji,
            ticket_price: Number(newRaffle.ticket_price),
            total_tickets: Number(newRaffle.total_tickets),
            draw_date: newRaffle.draw_date || null,
            image_url: newRaffle.image_url
          }}
        : {
            title: newRaffle.title,
            description: newRaffle.description,
            emoji: newRaffle.emoji,
            ticket_price: Number(newRaffle.ticket_price),
            total_tickets: Number(newRaffle.total_tickets),
            draw_date: newRaffle.draw_date || null,
            image_url: newRaffle.image_url
          };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': password
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setNewRaffle({ title: '', ticket_price: '', total_tickets: '10000', draw_date: '', description: '', emoji: '🎟️', image_url: '' });
        setEditingRaffleId(null);
        fetchData(); // Refresh list
        alert(editingRaffleId ? 'Rifa actualizada exitosamente' : 'Rifa creada exitosamente');
      } else {
        alert(editingRaffleId ? 'Error al actualizar la rifa' : 'Error al crear la rifa');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleEditRaffle = (r: Raffle) => {
    setEditingRaffleId(r.id);
    setNewRaffle({
      title: r.title,
      description: r.description || '',
      emoji: r.emoji || '🎟️',
      ticket_price: String(r.ticket_price),
      total_tickets: String(r.total_tickets),
      draw_date: r.draw_date ? new Date(r.draw_date).toISOString().split('T')[0] : '',
      image_url: r.image_url || ''
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingRaffleId(null);
    setNewRaffle({ title: '', ticket_price: '', total_tickets: '10000', draw_date: '', description: '', emoji: '🎟️', image_url: '' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-key': password },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewRaffle(prev => ({ ...prev, image_url: data.publicUrl }));
      } else {
        alert('Error al subir imagen');
      }
    } catch (err) {
      alert('Error de conexión al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleRaffleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': password },
        body: JSON.stringify({ id, updates: { is_active: !currentStatus } })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRaffle = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta rifa? Esta acción no se puede deshacer y fallará si la rifa ya tiene boletos comprados/reservados.')) return;
    try {
      const res = await fetch('/api/admin/raffles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': password },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchData();
        if (editingRaffleId === id) cancelEdit();
      } else {
        alert('Error al eliminar. Es posible que la rifa tenga boletos asociados.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'paid' | 'reserved', actionType: 'approve' | 'cancel') => {
    if (actionType === 'cancel') {
      const confirmDelete = confirm('¿Estás seguro de cancelar esta reserva? El número quedará libre.');
      if (!confirmDelete) return;

      try {
        const res = await fetch('/api/admin/tickets', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-key': password
          },
          body: JSON.stringify({ ticketIds: [ticketId] })
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    } else {
      // Approve Payment
      const confirmApprove = confirm('¿Confirmar pago y enviar recibo por correo al cliente?');
      if (!confirmApprove) return;

      try {
        const res = await fetch('/api/admin/tickets', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-key': password
          },
          body: JSON.stringify({ ticketIds: [ticketId], status: 'paid' })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- Dashboard Data Processing ---
  const dashboardData = useMemo(() => {
    const paidTickets = tickets.filter(t => t.status === 'paid');
    
    // 1. Revenue by Bank (Bar Chart)
    const revenueByMethod = paidTickets.reduce((acc: any, ticket) => {
      const method = ticket.payment_method || 'otro';
      const raffle = raffles.find(r => r.id === (ticket as any).raffle_id);
      const price = raffle?.ticket_price || 0;
      acc[method] = (acc[method] || 0) + price;
      return acc;
    }, {});
    const revenueChartData = Object.entries(revenueByMethod).map(([name, value]) => ({ 
      name: name.toUpperCase(), 
      value 
    }));

    // 2. Sales Over Time (Line Chart)
    const salesByDate = paidTickets.reduce((acc: any, ticket) => {
      const date = new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const salesChartData = Object.entries(salesByDate)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => {
        const [d1, m1] = a.date.split('/').map(Number);
        const [d2, m2] = b.date.split('/').map(Number);
        return m1 !== m2 ? m1 - m2 : d1 - d2;
      })
      .slice(-7); // Last 7 days

    // 3. Raffle Popularity (Pie Chart)
    const raffleStats = raffles.map(r => ({
      name: r.title.length > 15 ? r.title.substring(0, 12) + '...' : r.title,
      value: (r as any).sold || 0,
      total: r.total_tickets
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // 4. Metrics
    const totalIncome = Object.values(revenueByMethod).reduce((a: any, b: any) => a + b, 0);
    const totalSold = paidTickets.length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;
    const conversionRate = tickets.length > 0 ? (totalSold / tickets.length) * 100 : 0;

    return { 
      revenueChartData, 
      salesChartData, 
      raffleStats, 
      metrics: { totalIncome, totalSold, pendingTickets, conversionRate } 
    };
  }, [tickets, raffles]);

  const COLORS = ['#00f2fe', '#4facfe', '#6a11cb', '#2575fc', '#f093fb'];

  if (!isAuthenticated) {
    return (
      <div className="admin-login-overlay">
        <div className="admin-login-card">
          <h1>🔐 Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn-primary w-full">Access Panel</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredTickets = tickets.filter(t => {
    const participant = Array.isArray(t.participants) ? t.participants[0] : t.participants;
    const searchStr = ticketSearch.toLowerCase();
    const name = (participant?.full_name || '').toLowerCase();
    const phone = (participant?.phone || '').toLowerCase();
    const tNum = (t.ticket_number || '').toLowerCase();
    
    return name.includes(searchStr) || phone.includes(searchStr) || tNum.includes(searchStr);
  });

  return (
    <div className="admin-dashboard p-2 sm:p-4 md:p-8 max-w-7xl mx-auto text-white">
      {/* --- DASHBOARD HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <p className="text-gray-400 text-sm mt-1">Monitorea el rendimiento de Shark Rifas en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all border border-gray-700">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 px-4 py-2 rounded-xl transition-all border border-red-900/30">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* --- METRICS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-cyan-500/50 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Ingresos Totales</p>
              <h3 className="text-2xl font-bold mt-1 text-white">RD${dashboardData.metrics.totalIncome.toLocaleString()}</h3>
              <p className="text-green-400 text-xs mt-2 flex items-center gap-1"><TrendingUp size={12} /> Pagados</p>
            </div>
            <div className="p-3 bg-cyan-950/30 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Boletos Pagados</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{dashboardData.metrics.totalSold}</h3>
              <p className="text-gray-500 text-xs mt-2">Tickets confirmados</p>
            </div>
            <div className="p-3 bg-blue-950/30 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
              <Ticket size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-orange-500/50 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Por Confirmar</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{dashboardData.metrics.pendingTickets}</h3>
              <p className="text-orange-400 text-xs mt-2">Esperando revisión</p>
            </div>
            <div className="p-3 bg-orange-950/30 rounded-2xl text-orange-400 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-purple-500/50 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Conversión</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{dashboardData.metrics.conversionRate.toFixed(1)}%</h3>
              <p className="text-purple-400 text-xs mt-2">Interés vs Venta</p>
            </div>
            <div className="p-3 bg-purple-950/30 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold flex items-center gap-2"><LineIcon size={18} className="text-cyan-400" /> Rendimiento de Ventas</h4>
            <span className="text-xs text-gray-500">Últimos 7 días</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#00f2fe' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Method Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
          <h4 className="font-bold mb-6 flex items-center gap-2"><PieIcon size={18} className="text-blue-400" /> Popularidad de Rifas</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.raffleStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.raffleStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- REVENUE BY BANK BARCHART (Full Width) --- */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl mb-12">
        <h4 className="font-bold mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-green-400" /> Ingresos por Método de Pago</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
              />
              <Bar dataKey="value" fill="#4facfe" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Create Raffle */}
        <div className="card mb-6 bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-cyan-400 font-bold text-xl">
              {editingRaffleId ? '✏️ EDITAR RIFA' : '➕ CREAR NUEVA RIFA'}
            </h3>
            {editingRaffleId && (
              <button type="button" onClick={cancelEdit} className="text-sm text-gray-400 hover:text-white underline">
                Cancelar Edición
              </button>
            )}
          </div>
          <form className="admin-form flex flex-col gap-4" onSubmit={handleSaveRaffle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group flex flex-col">
                <label className="text-xs text-gray-400 mb-1">NOMBRE DEL PREMIO</label>
                <input required value={newRaffle.title} onChange={e => setNewRaffle({...newRaffle, title: e.target.value})} type="text" className="admin-input p-2 rounded bg-gray-800 border-gray-700" placeholder="Ej: iPhone 15 Pro" />
              </div>
              <div className="form-group flex flex-col">
                <label className="text-xs text-gray-400 mb-1">PRECIO POR BOLETO (RD$)</label>
                <input required value={newRaffle.ticket_price} onChange={e => setNewRaffle({...newRaffle, ticket_price: e.target.value})} type="number" className="admin-input p-2 rounded bg-gray-800 border-gray-700" placeholder="500" />
              </div>
              <div className="form-group flex flex-col">
                <label className="text-xs text-gray-400 mb-1">TOTAL DE BOLETOS</label>
                <input required value={newRaffle.total_tickets} onChange={e => setNewRaffle({...newRaffle, total_tickets: e.target.value})} type="number" className="admin-input p-2 rounded bg-gray-800 border-gray-700" placeholder="10000" />
              </div>
              <div className="form-group flex flex-col">
                <label className="text-xs text-gray-400 mb-1">FECHA DEL SORTEO</label>
                <input value={newRaffle.draw_date} onChange={e => setNewRaffle({...newRaffle, draw_date: e.target.value})} type="date" className="admin-input p-2 rounded bg-gray-800 border-gray-700" />
              </div>
            </div>
            <div className="form-group flex flex-col mt-2">
              <label className="text-xs text-gray-400 mb-1">DESCRIPCIÓN</label>
              <input value={newRaffle.description} onChange={e => setNewRaffle({...newRaffle, description: e.target.value})} type="text" className="admin-input p-2 rounded bg-gray-800 border-gray-700" placeholder="Descripción del premio" />
            </div>
            <div className="form-group flex flex-col mt-2 mb-4">
              <label className="text-xs text-gray-400 mb-1">IMAGEN DEL PREMIO (Recomendado)</label>
              <div className="flex gap-4 items-center">
                <div 
                  className="image-preview w-24 h-24 bg-gray-800 border border-gray-700 rounded flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500 transition-all"
                  onClick={() => document.getElementById('raffle-img-upload')?.click()}
                >
                  {newRaffle.image_url ? (
                    <img src={newRaffle.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-600">+</span>
                  )}
                </div>
                <div className="flex-grow">
                  <input 
                    id="raffle-img-upload"
                    type="file" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                  <p className="text-[10px] text-gray-500 mb-2">Sube una foto clara del premio para aumentar las ventas.</p>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('raffle-img-upload')?.click()}
                    className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    {uploading ? 'SUBIENDO...' : 'SUBIR FOTO'}
                  </button>
                  {newRaffle.image_url && (
                    <button 
                      type="button" 
                      onClick={() => setNewRaffle({...newRaffle, image_url: ''})}
                      className="ml-2 text-xs text-red-500 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group flex flex-col mt-2 mb-4">
              <label className="text-xs text-gray-400 mb-1">EMOJI / ÍCONO (Opcional)</label>
              <input value={newRaffle.emoji} onChange={e => setNewRaffle({...newRaffle, emoji: e.target.value})} type="text" className="admin-input p-2 rounded bg-gray-800 border-gray-700 w-24 text-center" placeholder="🎁" maxLength={2} />
            </div>
            <button type="submit" className="btn-primary w-full bg-cyan-500 text-black font-bold py-3 rounded hover:bg-cyan-400 transition">
              {editingRaffleId ? '⚡ GUARDAR CAMBIOS' : '⚡ CREAR RIFA'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Raffles Summary */}
        <div className="card mb-6 bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h3 className="text-orange-400 font-bold mb-4 text-xl">🎲 RIFAS ACTUALES</h3>
          {loading ? <p>Cargando...</p> : (
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
              {raffles.map(r => (
                <div key={r.id} className="border border-gray-700 p-3 sm:p-4 rounded bg-gray-800 flex flex-col lg:flex-row lg:justify-between items-start lg:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                       {r.emoji} {r.title}
                       <span className={`text-[10px] px-2 py-0.5 rounded ${r.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                         {r.is_active ? 'ACTIVA' : 'INACTIVA'}
                       </span>
                    </h4>
                    <p className="text-sm text-gray-400">Precio: RD${r.ticket_price} | {r.total_tickets} boletos</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm w-full lg:w-auto mt-2 lg:mt-0 justify-start sm:justify-end">
                    <button 
                      type="button" 
                      onClick={() => handleToggleRaffleStatus(r.id, r.is_active)} 
                      className={`flex-1 sm:flex-none px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 border ${r.is_active ? 'border-gray-500 text-gray-400 hover:bg-gray-800 hover:text-white hover:shadow-[0_0_12px_rgba(156,163,175,0.4)]' : 'border-green-500 text-green-400 hover:bg-green-900/40 hover:text-green-300 hover:shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`}
                      title={r.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {r.is_active ? '⏸️ Pausar' : '▶️ Activar'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleEditRaffle(r)} 
                      className="flex-1 sm:flex-none px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-cyan-500 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteRaffle(r.id)} 
                      className="flex-1 sm:flex-none px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-red-500 text-red-500 hover:bg-red-900/40 hover:text-red-300 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {raffles.length === 0 && <p className="text-gray-500 italic">No hay rifas creadas aún.</p>}
            </div>
          )}
        </div>

      </div>
      
      {/* Consolidated Tickets Table */}
      <div className="card mt-8 bg-gray-900 border border-gray-800 p-6 rounded-lg overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-cyan-400 font-bold text-xl">📋 REGISTRO DE BOLETOS VENDIDOS ({filteredTickets.length})</h3>
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre, teléfono o boleto..." 
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            className="admin-input p-2 rounded bg-gray-800 border-gray-700 w-full md:w-1/3 min-w-[250px]"
          />
        </div>
        
        <div className="table-responsive">
          <table className="admin-table w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="py-2 px-4">Boleto</th>
              <th className="py-2 px-4">Cliente</th>
              <th className="py-2 px-4">Contacto</th>
              <th className="py-2 px-4">Método de Pago</th>
              <th className="py-2 px-4 text-right">Estado / Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(t => {
              const participant = Array.isArray(t.participants) ? t.participants[0] : t.participants;
              return (
              <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                <td className="py-3 px-4 font-bold text-cyan-400 text-xl">{t.ticket_number}</td>
                <td className="py-3 px-4 uppercase">{participant?.full_name || 'Desconocido'}</td>
                <td className="py-3 px-4 text-sm text-gray-300">
                  {participant?.phone}<br/>
                  <span className="text-xs text-gray-500">{participant?.email}</span>
                </td>
                <td className="py-3 px-4 text-sm uppercase">{t.payment_method}</td>
                <td className="py-3 px-4 text-right">
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    backgroundColor: t.status === 'paid' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 140, 0, 0.1)',
                    color: t.status === 'paid' ? 'var(--success)' : 'var(--accent-orange)',
                    textTransform: 'uppercase',
                    marginBottom: t.status === 'pending' ? '8px' : '0'
                  }}>
                    {t.status === 'paid' ? 'PAGADO ✓' : (t.status === 'pending' ? 'PENDIENTE ⏳' : 'RESERVADO')}
                  </span>
                  
                  {t.status === 'paid' && (
                    <div className="flex gap-2 justify-end mt-1">
                      <button 
                        onClick={() => handleUpdateTicketStatus(t.id, 'paid', 'cancel')}
                        className="border border-red-600 text-red-500 hover:bg-red-900/20 px-3 py-1 rounded text-xs transition font-bold"
                        title="Anular compra y liberar número"
                      >
                        ✕ Anular Compra
                      </button>
                    </div>
                  )}
                  
                  {t.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-1">
                      <button 
                        onClick={() => handleUpdateTicketStatus(t.id, 'paid', 'approve')}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs transition font-bold"
                        title="Confirmar Pago y Notificar"
                      >
                        ✓ Aprobar
                      </button>
                      <button 
                        onClick={() => handleUpdateTicketStatus(t.id, 'reserved', 'cancel')}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs transition font-bold"
                        title="Cancelar Reserva"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )})}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  {ticketSearch ? 'No se encontraron resultados para tu búsqueda.' : 'No hay boletos vendidos aún.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  );
}
