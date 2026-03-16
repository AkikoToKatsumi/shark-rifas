'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  sort_order: number;
};

type Ticket = {
  id: string;
  raffle_id: string;
  ticket_number: string;
  status: string;
  payment_method: string;
  verification_code: string;
  created_at: string;
    participants: {
      full_name: string;
      phone: string;
      email: string;
      cedula: string;
      customer_code: string;
    } | {
      full_name: string;
      phone: string;
      email: string;
      cedula: string;
      customer_code: string;
    }[] | any;
};

interface DashboardMetrics {
  totalIncome: number;
  totalSold: number;
  pendingTickets: number;
  conversionRate: number;
}

interface DashboardData {
  revenueChartData: { name: string; value: number }[];
  salesChartData: { date: string; sales: number }[];
  raffleStats: { name: string; value: number; total: number }[];
  customerStats: { name: string; code: string; tickets: number; totalPaid: number }[];
  metrics: DashboardMetrics;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
    image_url: '',
    sort_order: '0'
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
        body: JSON.stringify({ username, password })
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
    router.push('/');
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
            image_url: newRaffle.image_url,
            sort_order: Number(newRaffle.sort_order)
          }}
        : {
            title: newRaffle.title,
            description: newRaffle.description,
            emoji: newRaffle.emoji,
            ticket_price: Number(newRaffle.ticket_price),
            total_tickets: Number(newRaffle.total_tickets),
            draw_date: newRaffle.draw_date || null,
            image_url: newRaffle.image_url,
            sort_order: Number(newRaffle.sort_order)
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
        setNewRaffle({ title: '', ticket_price: '', total_tickets: '10000', draw_date: '', description: '', emoji: '🎟️', image_url: '', sort_order: '0' });
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
      image_url: r.image_url || '',
      sort_order: String(r.sort_order || 0)
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingRaffleId(null);
    setNewRaffle({ title: '', ticket_price: '', total_tickets: '10000', draw_date: '', description: '', emoji: '🎟️', image_url: '', sort_order: '0' });
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

  const handleUpdateTicketStatus = async (ticketIds: string | string[], status: 'paid' | 'reserved', actionType: 'approve' | 'cancel') => {
    const ids = Array.isArray(ticketIds) ? ticketIds : [ticketIds];
    
    if (actionType === 'cancel') {
      const confirmDelete = confirm(`¿Estás seguro de cancelar ${ids.length > 1 ? 'estos boletos' : 'esta reserva'}? El número quedará libre.`);
      if (!confirmDelete) return;

      try {
        const res = await fetch('/api/admin/tickets', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-key': password
          },
          body: JSON.stringify({ ticketIds: ids })
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    } else {
      // Approve Payment
      const confirmApprove = confirm(`¿Aprobar pago de ${ids.length} boletos y enviar recibo por correo?`);
      if (!confirmApprove) return;

      try {
        const res = await fetch('/api/admin/tickets', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-key': password
          },
          body: JSON.stringify({ ticketIds: ids, status: 'paid' })
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReduceGroup = async (verificationCode: string) => {
    if (confirm('¿Reducir 1 boleto de esta compra? El último número asignado será eliminado.')) {
      try {
        const res = await fetch('/api/admin/tickets/reduce', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-key': password
          },
          body: JSON.stringify({ verificationCode })
        });
        if (res.ok) {
          fetchData();
        } else {
          const data = await res.json();
          alert(data.error || 'Error al reducir boletos');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- Dashboard Data Processing ---
  const dashboardData: DashboardData = useMemo(() => {
    const paidTickets = tickets.filter(t => t.status === 'paid');
    
    // 1. Revenue by Bank (Bar Chart)
    const revenueByMethod = paidTickets.reduce((acc: Record<string, number>, ticket) => {
      const method = ticket.payment_method || 'otro';
      const raffle = raffles.find(r => r.id === (ticket as any).raffle_id);
      const price = raffle?.ticket_price || 0;
      acc[method] = (acc[method] || 0) + price;
      return acc;
    }, {});
    
    const revenueChartData = Object.entries(revenueByMethod).map(([name, value]) => ({ 
      name: name.toUpperCase(), 
      value: Number(value)
    }));

    // 2. Sales Over Time (Line Chart)
    const salesByDate = paidTickets.reduce((acc: Record<string, number>, ticket) => {
      const date = new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const salesChartData = Object.entries(salesByDate)
      .map(([date, sales]) => ({ date, sales: Number(sales) }))
      .sort((a, b) => {
        const [d1, m1] = a.date.split('/').map(Number);
        const [d2, m2] = b.date.split('/').map(Number);
        return m1 !== m2 ? m1 - m2 : d1 - d2;
      })
      .slice(-7);

    // 3. Raffle Popularity (Pie Chart)
    const raffleStats = raffles.map(r => ({
      name: r.title.length > 15 ? r.title.substring(0, 12) + '...' : r.title,
      value: Number((r as any).sold || 0),
      total: Number(r.total_tickets)
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // 4. Top Customers (Bar Chart)
    const customerAggregates = tickets.reduce((acc: Record<string, any>, ticket) => {
      const participant = Array.isArray(ticket.participants) ? ticket.participants[0] : ticket.participants;
      if (!participant) return acc;
      
      const participantId = participant.id || 'unknown';
      if (!acc[participantId]) {
        acc[participantId] = { 
          name: participant.full_name, 
          code: participant.customer_code || 'S/N', 
          tickets: 0, 
          totalPaid: 0 
        };
      }
      acc[participantId].tickets += 1;
      if (ticket.status === 'paid') {
        const raffle = raffles.find(r => r.id === (ticket as any).raffle_id);
        acc[participantId].totalPaid += Number(raffle?.ticket_price || 0);
      }
      return acc;
    }, {});

    const customerStats = Object.values(customerAggregates)
      .map((c: any) => ({
        ...c,
        displayName: `[${c.code}] ${c.name}`
      }))
      .sort((a: any, b: any) => b.tickets - a.tickets)
      .slice(0, 5);

    // 5. Metrics
    const totalIncome = Object.values(revenueByMethod).reduce((a, b) => a + (b as number), 0);
    const totalSold = paidTickets.length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;
    const conversionRate = tickets.length > 0 ? (totalSold / tickets.length) * 100 : 0;

    return { 
      revenueChartData, 
      salesChartData, 
      raffleStats, 
      customerStats,
      metrics: { totalIncome, totalSold, pendingTickets, conversionRate } 
    };
  }, [tickets, raffles]);

  // Filtrado para tabla (manteniendo el buscador funcional)
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const p = Array.isArray(t.participants) ? t.participants[0] : t.participants;
      const search = ticketSearch.toLowerCase();
      return (
        t.ticket_number.includes(search) ||
        p?.full_name?.toLowerCase().includes(search) ||
        p?.phone?.includes(search) ||
        p?.cedula?.includes(search) ||
        p?.customer_code?.includes(search) ||
        t.verification_code?.toLowerCase().includes(search)
      );
    });
  }, [tickets, ticketSearch]);

  // Agrupación para tabla
  const groupedTicketsTable = useMemo(() => {
    const groups: Record<string, Ticket[]> = {};
    filteredTickets.forEach(t => {
      const code = t.verification_code || `no-code-${t.id}`;
      if (!groups[code]) groups[code] = [];
      groups[code].push(t);
    });
    
    return Object.entries(groups).map(([code, gTickets]) => {
      const first = gTickets[0];
      const participant = Array.isArray(first.participants) ? first.participants[0] : first.participants;
      const allPaid = gTickets.every(t => t.status === 'paid');
      const somePending = gTickets.some(t => t.status === 'pending');
      
      return {
        code,
        tickets: gTickets,
        participant,
        status: allPaid ? 'paid' : (somePending ? 'pending' : 'reserved'),
        totalPrice: gTickets.length * (raffles.find(r => r.id === first.raffle_id)?.ticket_price || 0),
        createdAt: first.created_at
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredTickets, raffles]);

  const COLORS = ['#00f2fe', '#4facfe', '#6a11cb', '#2575fc', '#f093fb'];

  if (!isAuthenticated) {
    return (
      <div className="admin-login-overlay">
        <div className="admin-login-card">
          <h1>🔐 Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ marginBottom: '10px' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn-primary w-full">Access Panel</button>
          </form>
          <button 
            onClick={() => router.push('/')}
            style={{ 
              marginTop: '15px', 
              background: 'none', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-muted)', 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="admin-dashboard">
      {/* --- DASHBOARD HEADER --- */}
      <div className="dashboard-header-card">
        <div>
          <h1 className="dashboard-title">Panel de Control</h1>
          <p className="dashboard-subtitle">Monitorea el rendimiento de Shark Rifas en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> ACTUALIZAR
          </button>
          <button onClick={handleLogout} className="btn-primary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            SALIR
          </button>
        </div>
      </div>

      {/* --- METRICS CARDS --- */}
      <div className="metrics-grid">
        <div className="metric-card-premium cyan">
          <div className="metric-content">
            <p>Ingresos Totales</p>
            <h3>RD${dashboardData.metrics.totalIncome.toLocaleString()}</h3>
            <div className="metric-trend success">
              <TrendingUp size={14} /> <span>Pagados</span>
            </div>
          </div>
          <div className="metric-icon-box" style={{ color: 'var(--primary-cyan)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="metric-card-premium blue">
          <div className="metric-content">
            <p>Boletos Pagados</p>
            <h3>{dashboardData.metrics.totalSold}</h3>
            <div className="metric-trend neutral">
              <span>Tickets confirmados</span>
            </div>
          </div>
          <div className="metric-icon-box" style={{ color: '#4facfe' }}>
            <Ticket size={24} />
          </div>
        </div>

        <div className="metric-card-premium orange">
          <div className="metric-content">
            <p>Por Confirmar</p>
            <h3>{dashboardData.metrics.pendingTickets}</h3>
            <div className="metric-trend warning">
              <span>Esperando revisión</span>
            </div>
          </div>
          <div className="metric-icon-box" style={{ color: 'var(--accent-orange)' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="metric-card-premium purple">
          <div className="metric-content">
            <p>Conversión</p>
            <h3>{dashboardData.metrics.conversionRate.toFixed(1)}%</h3>
            <div className="metric-trend neutral">
              <span>Interés vs Venta</span>
            </div>
          </div>
          <div className="metric-icon-box" style={{ color: '#a855f7' }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="charts-main-grid">
        {/* Sales Trend Line Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h4><LineIcon size={18} style={{ color: 'var(--primary-cyan)' }} /> Rendimiento de Ventas</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ÚLTIMOS 7 DÍAS</span>
          </div>
          <div className="chart-container-box">
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

        {/* Popularity Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h4><PieIcon size={18} style={{ color: '#4facfe' }} /> Popularidad</h4>
          </div>
          <div className="chart-container-box">
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

        {/* Top Customers Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h4><Users size={18} style={{ color: '#a855f7' }} /> Top Clientes</h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>POR CANTIDAD DE TICKETS</span>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.customerStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="displayName" 
                        type="category" 
                        width={120} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                <Bar dataKey="tickets" radius={[0, 4, 4, 0]}>
                        {dashboardData.customerStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="chart-card full-width-chart">
          <div className="chart-header">
            <h4><BarChart3 size={18} style={{ color: 'var(--success)' }} /> Ingresos por Método de Pago</h4>
          </div>
          <div className="chart-container-box" style={{ height: '250px' }}>
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
      </div>

      <div className="management-grid">
        
        {/* Left Column: Create Raffle */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary-cyan)', fontSize: '1.2rem', margin: 0 }}>
              {editingRaffleId ? '✏️ EDITAR RIFA' : '➕ CREAR NUEVA RIFA'}
            </h3>
            {editingRaffleId && (
              <button type="button" onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}>
                Cancelar Edición
              </button>
            )}
          </div>
          <form className="admin-form-container" onSubmit={handleSaveRaffle}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>NOMBRE DEL PREMIO</label>
                <input required value={newRaffle.title} onChange={e => setNewRaffle({...newRaffle, title: e.target.value})} type="text" placeholder="Ej: iPhone 15 Pro" />
              </div>
              <div className="form-group">
                <label>PRECIO POR BOLETO (RD$)</label>
                <input required value={newRaffle.ticket_price} onChange={e => setNewRaffle({...newRaffle, ticket_price: e.target.value})} type="number" placeholder="500" />
              </div>
              <div className="form-group">
                <label>TOTAL DE BOLETOS</label>
                <input required value={newRaffle.total_tickets} onChange={e => setNewRaffle({...newRaffle, total_tickets: e.target.value})} type="number" placeholder="10000" />
              </div>
              <div className="form-group">
                <label>FECHA DEL SORTEO</label>
                <input value={newRaffle.draw_date} onChange={e => setNewRaffle({...newRaffle, draw_date: e.target.value})} type="date" />
              </div>
            </div>
            <div className="form-group">
              <label>DESCRIPCIÓN</label>
              <textarea 
                value={newRaffle.description} 
                onChange={e => setNewRaffle({...newRaffle, description: e.target.value})} 
                placeholder="Descripción detallada del premio..."
                style={{ minHeight: '120px', padding: '12px', borderRadius: '8px' }}
              />
            </div>
            <div className="form-group">
              <label>IMAGEN DEL PREMIO</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '10px' }}>
                <div 
                  className="image-preview-box"
                  onClick={() => document.getElementById('raffle-img-upload')?.click()}
                >
                  {newRaffle.image_url ? (
                    <img src={newRaffle.image_url} alt="Preview" />
                  ) : (
                    <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>+</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input id="raffle-img-upload" type="file" onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Sube una foto clara del premio.</p>
                  <button type="button" onClick={() => document.getElementById('raffle-img-upload')?.click()} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                    {uploading ? 'SUBIENDO...' : 'SUBIR FOTO'}
                  </button>
                  {newRaffle.image_url && (
                    <button type="button" onClick={() => setNewRaffle({...newRaffle, image_url: ''})} style={{ marginLeft: '10px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>EMOJI / ÍCONO</label>
                <input value={newRaffle.emoji} onChange={e => setNewRaffle({...newRaffle, emoji: e.target.value})} type="text" style={{ width: '100%', textAlign: 'center' }} placeholder="🎁" maxLength={2} />
              </div>
              <div className="form-group">
                <label>POSICIÓN (ORDEN)</label>
                <input value={newRaffle.sort_order} onChange={e => setNewRaffle({...newRaffle, sort_order: e.target.value})} type="number" style={{ width: '100%' }} placeholder="0" />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '15px' }}>
              {editingRaffleId ? '⚡ GUARDAR CAMBIOS' : '⚡ CREAR RIFA'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Raffles Summary */}
        <div className="card">
          <h3 style={{ color: 'var(--accent-orange)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>🎲 RIFAS ACTUALES</h3>
          {loading ? <p>Cargando...</p> : (
            <div className="raffle-list-scroll">
              {raffles.map(r => (
                <div key={r.id} className="raffle-item-card">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       {r.emoji} {r.title}
                       <span style={{ 
                         fontSize: '0.6rem', 
                         padding: '2px 6px', 
                         borderRadius: '4px', 
                         backgroundColor: r.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                         color: r.is_active ? 'var(--success)' : '#ef4444'
                       }}>
                         {r.is_active ? 'ACTIVA' : 'INACTIVA'}
                       </span>
                    </h4>
                     <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                       Posición: {r.sort_order || 0} | Precio: RD${r.ticket_price} | {r.total_tickets} boletos
                     </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditRaffle(r)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.7rem' }}>✏️</button>
                    <button onClick={() => handleDeleteRaffle(r.id)} style={{ padding: '6px 10px', fontSize: '0.7rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', background: 'none', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
              {raffles.length === 0 && <p className="text-gray-500 italic">No hay rifas creadas aún.</p>}
            </div>
          )}
        </div>
      </div>
      
      {/* Consolidated Tickets Table */}
      <div className="table-wrapper" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--primary-cyan)', margin: 0 }}>📋 REGISTRO DE BOLETOS ({filteredTickets.length})</h3>
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre, teléfono o boleto..." 
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '350px', padding: '10px 15px', borderRadius: '12px' }}
          />
        </div>
        
        <table className="admin-table-premium">
          <thead>
            <tr>
              <th>Compra / Boletos</th>
              <th>ID Cliente</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Cédula</th>
              <th>Precio Total</th>
              <th style={{ textAlign: 'right' }}>Estado / Acciones</th>
            </tr>
          </thead>
          <tbody>
            {groupedTicketsTable.map(group => {
              const { participant, tickets: groupTickets, code } = group;
              const ticketIds = groupTickets.map(t => t.id);
              const ticketNumbers = groupTickets.map(t => `#${t.ticket_number}`).join(', ');
              
              return (
              <tr key={code}>
                <td>
                  <div style={{ color: 'var(--primary-cyan)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {groupTickets.length} Boletos
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ticketNumbers}
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '2px' }}>CODE: {code}</div>
                </td>
                <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{participant?.customer_code || '---'}</td>
                <td>{participant?.full_name || 'Desconocido'}</td>
                <td style={{ fontSize: '0.8rem' }}>
                  {participant?.phone}<br/>
                  <span style={{ opacity: 0.5 }}>{participant?.email}</span>
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{participant?.cedula || '-'}</td>
                <td style={{ fontWeight: 'bold' }}>RD${group.totalPrice}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.7rem', 
                      fontWeight: '700',
                      backgroundColor: group.status === 'paid' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 140, 0, 0.1)',
                      color: group.status === 'paid' ? 'var(--success)' : 'var(--accent-orange)'
                    }}>
                      {group.status === 'paid' ? 'PAGADO ✓' : (group.status === 'pending' ? 'PENDIENTE ⏳' : 'MIXTO / RESERVADO')}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {group.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateTicketStatus(ticketIds, 'paid', 'approve')} style={{ background: 'var(--success)', border: 'none', color: '#000', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>✓ APROBAR TODO</button>
                          <button onClick={() => handleReduceGroup(code)} style={{ background: '#333', border: '1px solid #444', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>➖ Bajar 1</button>
                          <button onClick={() => handleUpdateTicketStatus(ticketIds, 'reserved', 'cancel')} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>✕</button>
                        </>
                      )}
                      {group.status === 'paid' && (
                        <button onClick={() => handleUpdateTicketStatus(ticketIds, 'reserved', 'cancel')} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.65rem' }}>Anular Compra</button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
