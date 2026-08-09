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
  Download, Filter, RefreshCcw, Search
} from 'lucide-react';
import DigitalTicket from '../components/DigitalTicket';
import RichTextEditor from '../components/RichTextEditor';

type Raffle = {
  id: string;
  title: string;
  description: string;
  ticket_price: number;
  total_tickets: number;
  emoji: string;
  start_date: string;
  draw_date: string;
  is_active: boolean;
  image_url: string;
  sort_order: number;
  is_paused?: boolean;
  min_tickets?: number;
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
  const [users, setUsers] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'hero'>('dashboard');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Participant Search State
  const [searchParticipantQuery, setSearchParticipantQuery] = useState('');
  const [isSearchingParticipant, setIsSearchingParticipant] = useState(false);
  const [participantResult, setParticipantResult] = useState<any>(null);
  const [searchParticipantError, setSearchParticipantError] = useState('');

  // Ticket Detail Modal State
  const [viewingTickets, setViewingTickets] = useState<{ 
    code: string, 
    tickets: any[], 
    quantity: number, 
    participant: any 
  } | null>(null);

  // New Raffle Form State
  const [editingRaffleId, setEditingRaffleId] = useState<string | null>(null);
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    ticket_price: '',
    total_tickets: '10000',
    start_date: '',
    draw_date: '',
    description: '',
    emoji: '🎟️',
    image_url: '',
    sort_order: '0',
    raffle_type: 'estandar',
    min_tickets: '1'
  });

  // New User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    cedula: '',
    points: '0',
    is_cash_collector: false,
    password: ''
  });

  // Hero Slide Form State
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
  const [heroForm, setHeroForm] = useState({
    badge: '⚡ NUEVO BANNER',
    badge_color: '#00f2fe',
    title: '',
    subtitle: '',
    image_url: '',
    cta_text: '⚡ COMPRAR BOLETOS',
    link_href: '#buy',
    display_order: '1',
    is_active: true
  });

  const [uploading, setUploading] = useState(false);
  const [editingGroupCode, setEditingGroupCode] = useState<string | null>(null);

  // Custom UI State
  const [isRowActionLoading, setIsRowActionLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void; 
    onCancel?: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Confirmar') => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmConfig(prev => ({ ...prev, isOpen: false })),
      confirmText
    });
  };

  // Login Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          // Sync localStorage for UI consistency if needed
          localStorage.setItem('shark_admin_auth', 'true');
        } else {
          // Si el servidor dice que no hay sesión, limpiamos local
          localStorage.removeItem('shark_admin_auth');
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Fallback to localStorage if API fails (offline/dev)
        const auth = localStorage.getItem('shark_admin_auth');
        if (auth === 'true') {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, []);

  // Fetch Data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (viewingTickets) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [viewingTickets]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch Raffles
    try {
      const resRaffles = await fetch(`/api/admin/raffles?t=${Date.now()}`);
      if (resRaffles.ok) {
        const data = await resRaffles.json();
        setRaffles(data.raffles || []);
      } else {
        showToast('Error cargando rifas', 'error');
      }
    } catch (e) { console.error(e); }

    // Fetch Tickets
    try {
      const resTickets = await fetch(`/api/admin/tickets?t=${Date.now()}`);
      if (resTickets.ok) {
        const data = await resTickets.json();
        setTickets([...(data.tickets || [])]);
      } else {
        const errData = await resTickets.json().catch(() => ({}));
        showToast('Error cargando tickets: ' + (errData.error || ''), 'error');
      }
    } catch (e) { console.error(e); }

    // Fetch Users
    try {
      const resUsers = await fetch(`/api/admin/users?t=${Date.now()}`);
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.users || []);
      } else {
        showToast('Error cargando usuarios', 'error');
      }
    } catch (e) { console.error(e); }

    // Fetch Hero Slides
    try {
      const resHero = await fetch(`/api/admin/hero?t=${Date.now()}`);
      if (resHero.ok) {
        const data = await resHero.json();
        setHeroSlides(data.slides || []);
      }
    } catch (e) { console.error(e); }

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
        setIsAuthenticated(true);
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error logging out:', err);
    }
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
            start_date: newRaffle.start_date || null,
            draw_date: newRaffle.draw_date || null,
            image_url: newRaffle.image_url,
            sort_order: Number(newRaffle.sort_order),
            min_tickets: newRaffle.raffle_type === 'personalizada' ? Number(newRaffle.min_tickets) : 1
          }}
        : {
            title: newRaffle.title,
            description: newRaffle.description,
            emoji: newRaffle.emoji,
            ticket_price: Number(newRaffle.ticket_price),
            total_tickets: Number(newRaffle.total_tickets),
            start_date: newRaffle.start_date || null,
            draw_date: newRaffle.draw_date || null,
            image_url: newRaffle.image_url,
            sort_order: Number(newRaffle.sort_order),
            min_tickets: newRaffle.raffle_type === 'personalizada' ? Number(newRaffle.min_tickets) : 1
          };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setNewRaffle({ title: '', ticket_price: '', total_tickets: '10000', start_date: '', draw_date: '', description: '', emoji: '🎟️', image_url: '', sort_order: '0', raffle_type: 'estandar', min_tickets: '1' });
        setEditingRaffleId(null);
        fetchData(); // Refresh list
        showToast(editingRaffleId ? 'Rifa actualizada exitosamente' : 'Rifa creada exitosamente', 'success');
      } else {
        showToast(editingRaffleId ? 'Error al actualizar la rifa' : 'Error al crear la rifa', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
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
      start_date: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '',
      draw_date: r.draw_date ? new Date(r.draw_date).toISOString().split('T')[0] : '',
      image_url: r.image_url || '',
      sort_order: String(r.sort_order || 0),
      raffle_type: (r.min_tickets && r.min_tickets > 1) ? 'personalizada' : 'estandar',
      min_tickets: String(r.min_tickets || 1)
    });
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.getElementById('raffle-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setEditingRaffleId(null);
    setNewRaffle({ title: '', ticket_price: '', total_tickets: '10000', start_date: '', draw_date: '', description: '', emoji: '🎟️', image_url: '', sort_order: '0', raffle_type: 'estandar', min_tickets: '1' });
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max resolution 1920px
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob failed'));
            },
            'image/jpeg',
            0.8 // Quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;
    
    // Check original file size (hard limit 15MB to avoid browser crashes)
    if (originalFile.size > 15 * 1024 * 1024) {
      showToast('La imagen es demasiado pesada (máx 15MB)', 'error');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      let fileToUpload: Blob | File = originalFile;
      
      // If file is > 1MB, compress it
      if (originalFile.size > 1 * 1024 * 1024) {
        showToast('Optimizando imagen...', 'info');
        fileToUpload = await compressImage(originalFile);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg");

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        const errorText = await res.text();
        console.error('Upload failed:', res.status, errorText);
        showToast(`Error del servidor (${res.status}). Intente con una imagen más pequeña.`, 'error');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setNewRaffle(prev => ({ ...prev, image_url: data.publicUrl }));
        showToast('Imagen subida correctamente', 'success');
      } else {
        showToast(data.error || 'Error al subir imagen', 'error');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      showToast('Error de conexión al subir imagen. Verifique su internet.', 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset to allow re-uploading same file
    }
  };

  const handleToggleRaffleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { is_active: !currentStatus } })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePause = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { is_paused: !currentStatus } })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRaffle = async (id: string) => {
    showConfirm(
      '¿Eliminar Rifa?', 
      '¿Estás seguro de eliminar esta rifa? Esta acción no se puede deshacer y fallará si la rifa ya tiene boletos comprados.',
      async () => {
        try {
          const res = await fetch('/api/admin/raffles', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          if (res.ok) {
            fetchData();
            if (editingRaffleId === id) cancelEdit();
            showToast('Rifa eliminada', 'success');
          } else {
            showToast('Error al eliminar. Es posible que la rifa tenga boletos asociados.', 'error');
          }
        } catch (err) {
          console.error(err);
        }
      },
      'Eliminar Rifa'
    );
  };

  const handleUpdateTicketStatus = async (ticketIds: string | string[], status: 'paid' | 'reserved', actionType: 'approve' | 'cancel') => {
    const ids = Array.isArray(ticketIds) ? ticketIds : [ticketIds];
    
    try {
      if (actionType === 'cancel') {
        const res = await fetch('/api/admin/tickets', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ticketIds: ids })
        });
        if (res.ok) {
          await fetchData();
          showToast('Boletos cancelados correctamente', 'success');
        } else {
          showToast('Error al cancelar boletos', 'error');
        }
      } else {
        const res = await fetch('/api/admin/tickets', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ticketIds: ids, status: 'paid' })
        });
        if (res.ok) {
          await fetchData();
          showToast('Pago aprobado y recibo enviado', 'success');
        } else {
          showToast('Error al aprobar el pago', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'error');
    }
  };

  const handleReduceGroup = async (verificationCode: string) => {
    showConfirm(
      'Reducir Boletos', 
      '¿Reducir 1 boleto de esta compra? El último número asignado será eliminado.',
      async () => {
        setIsRowActionLoading(prev => ({ ...prev, [verificationCode]: true }));
        try {
          const res = await fetch('/api/admin/tickets/reduce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': password },
            body: JSON.stringify({ verificationCode })
          });
          if (res.ok) {
            await fetchData();
            showToast('Boleto reducido', 'success');
          } else {
            const data = await res.json();
            showToast(data.error || 'Error al reducir boletos', 'error');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsRowActionLoading(prev => ({ ...prev, [verificationCode]: false }));
        }
      },
      'Reducir 1'
    );
  };

  const handleAddTicketToGroup = async (verificationCode: string, raffleId: string) => {
    setIsRowActionLoading(prev => ({ ...prev, [verificationCode]: true }));
    try {
      const res = await fetch('/api/admin/tickets/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationCode, raffleId })
      });
      if (res.ok) {
        await fetchData();
        showToast('Boleto sumado correctamente', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Error al agregar boleto', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'error');
    } finally {
      setIsRowActionLoading(prev => ({ ...prev, [verificationCode]: false }));
    }
  };

  const handleSearchParticipant = async () => {
    setSearchParticipantError('');
    setParticipantResult(null);
    if (!searchParticipantQuery.trim()) return;

    setIsSearchingParticipant(true);
    try {
      const res = await fetch('/api/verify-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchParticipantQuery })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al buscar boletos');
      setParticipantResult(data);
      showToast('Búsqueda completada', 'success');
    } catch (err: any) {
      setSearchParticipantError(err.message);
      showToast(err.message, 'error');
    } finally {
      setIsSearchingParticipant(false);
    }
  };

  const handleToggleCollaborator = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { is_cash_collector: !currentStatus } })
      });
      if (res.ok) {
        showToast('Estado de colaborador actualizado', 'success');
        fetchData();
      } else {
        showToast('Error al actualizar usuario', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    showConfirm(
      '¿Eliminar Usuario?',
      `¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer y fallará si tiene boletos asociados.`,
      async () => {
        try {
          const res = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          if (res.ok) {
            showToast('Usuario eliminado', 'success');
            fetchData();
          } else {
            const data = await res.json();
            showToast(data.error || 'Error al eliminar usuario', 'error');
          }
        } catch (err) {
          console.error(err);
        }
      },
      'Eliminar'
    );
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/users';
      const method = editingUserId ? 'PATCH' : 'POST';
      const bodyData = editingUserId 
        ? { userId: editingUserId, updates: {
            full_name: userForm.full_name,
            email: userForm.email.toLowerCase(),
            phone: userForm.phone,
            cedula: userForm.cedula,
            points: Number(userForm.points),
            is_cash_collector: userForm.is_cash_collector,
            ...(userForm.password ? { password: userForm.password } : {})
          }}
        : {
            full_name: userForm.full_name,
            email: userForm.email.toLowerCase(),
            phone: userForm.phone,
            cedula: userForm.cedula,
            points: Number(userForm.points),
            is_cash_collector: userForm.is_cash_collector,
            ...(userForm.password ? { password: userForm.password } : {})
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
        setUserForm({ full_name: '', email: '', phone: '', cedula: '', points: '0', is_cash_collector: false, password: '' });
        setEditingUserId(null);
        fetchData();
        showToast(editingUserId ? 'Usuario actualizado' : 'Usuario creado', 'success');
      } else {
        showToast('Error al guardar usuario', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleEditUser = (u: any) => {
    setEditingUserId(u.id);
    setUserForm({
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      cedula: u.cedula || '',
      points: String(u.points || 0),
      is_cash_collector: !!u.is_cash_collector,
      password: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelUserEdit = () => {
    setEditingUserId(null);
    setUserForm({ full_name: '', email: '', phone: '', cedula: '', points: '0', is_cash_collector: false, password: '' });
  };

  const handleSaveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/hero';
      const method = editingHeroId ? 'PATCH' : 'POST';
      const bodyData = editingHeroId
        ? { slideId: editingHeroId, updates: {
            badge: heroForm.badge,
            badge_color: heroForm.badge_color,
            title: heroForm.title,
            subtitle: heroForm.subtitle,
            image_url: heroForm.image_url,
            cta_text: heroForm.cta_text,
            link_href: heroForm.link_href,
            display_order: Number(heroForm.display_order),
            is_active: heroForm.is_active
          }}
        : {
            badge: heroForm.badge,
            badge_color: heroForm.badge_color,
            title: heroForm.title,
            subtitle: heroForm.subtitle,
            image_url: heroForm.image_url,
            cta_text: heroForm.cta_text,
            link_href: heroForm.link_href,
            display_order: Number(heroForm.display_order),
            is_active: heroForm.is_active
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setHeroForm({
          badge: '⚡ NUEVO BANNER',
          badge_color: '#00f2fe',
          title: '',
          subtitle: '',
          image_url: '',
          cta_text: '⚡ COMPRAR BOLETOS',
          link_href: '#buy',
          display_order: '1',
          is_active: true
        });
        setEditingHeroId(null);
        fetchData();
        showToast(editingHeroId ? 'Banner actualizado' : 'Banner creado', 'success');
      } else {
        showToast('Error al guardar el banner', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleEditHeroSlide = (slide: any) => {
    setEditingHeroId(slide.id);
    setHeroForm({
      badge: slide.badge || '',
      badge_color: slide.badge_color || '#00f2fe',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      image_url: slide.image_url || '',
      cta_text: slide.cta_text || '',
      link_href: slide.link_href || '',
      display_order: String(slide.display_order || 1),
      is_active: slide.is_active !== false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHeroSlide = (id: string) => {
    showConfirm(
      '¿Eliminar Banner?',
      '¿Estás seguro de eliminar este banner del carrusel?',
      async () => {
        try {
          const res = await fetch('/api/admin/hero', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slideId: id })
          });
          if (res.ok) {
            fetchData();
            showToast('Banner eliminado', 'success');
          } else {
            showToast('Error al eliminar banner', 'error');
          }
        } catch (err) {
          console.error(err);
        }
      },
      'Eliminar'
    );
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

    // 4. Top Customers (Bar Chart) — agrupado por cédula para consolidar múltiples compras
    const customerAggregates = tickets.reduce((acc: Record<string, any>, ticket) => {
      const participant = Array.isArray(ticket.participants) ? ticket.participants[0] : ticket.participants;
      if (!participant) return acc;
      
      // Usar cédula como clave única; si no tiene, usar nombre+teléfono como fallback
      const cedula = participant.cedula?.trim();
      const groupKey = cedula && cedula !== '-' && cedula !== ''
        ? `cedula_${cedula}`
        : `name_${participant.full_name}_${participant.phone}`;

      if (!acc[groupKey]) {
        acc[groupKey] = { 
          name: participant.full_name, 
          cedula: cedula || '---',
          code: participant.customer_code || 'S/N', 
          tickets: 0, 
          totalPaid: 0 
        };
      }
      acc[groupKey].tickets += 1;
      if (ticket.status === 'paid') {
        const raffle = raffles.find(r => r.id === (ticket as any).raffle_id);
        acc[groupKey].totalPaid += Number(raffle?.ticket_price || 0);
      }
      return acc;
    }, {});

    const customerStats = Object.values(customerAggregates)
      .map((c: any) => ({
        ...c,
        displayName: c.cedula && c.cedula !== '---'
          ? `${c.name} (${c.cedula})`
          : `[${c.code}] ${c.name}`
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

  // Agrupación para tabla (POR COMPRA / CÓDIGO DE VERIFICACIÓN)
  const groupedTicketsTable = useMemo(() => {
    const groups: Record<string, Ticket[]> = {};
    filteredTickets.forEach(t => {
      // Clave de grupo: Código de verificación (cada compra tiene uno único)
      const groupKey = t.verification_code || `anon-${t.id}`;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(t);
    });
    
    return Object.entries(groups).map(([code, gTickets]) => {
      // Ordenar por fecha para obtener la información más reciente (código, etc)
      const sortedByDate = [...gTickets].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const first = sortedByDate[0];
      const participant = Array.isArray(first.participants) ? first.participants[0] : first.participants;
      
      const allPaid = gTickets.every(t => t.status === 'paid');
      const allPending = gTickets.every(t => t.status === 'pending' || t.status === 'reserved');
      const isMixed = !allPaid && !allPending;

      // Código de verificación más reciente para sumas/restas manuales (hereda últimos datos)
      const latestCode = first.verification_code;
      
      return {
        code, 
        tickets: gTickets,
        participant,
        status: allPaid ? 'paid' : (allPending ? 'pending' : 'mixed'),
        paymentMethod: first.payment_method || 'N/A',
        collectorId: (first as any).collector_id || null,
        totalPrice: gTickets.reduce((acc, t) => {
          const r = raffles.find(raf => raf.id === (t as any).raffle_id);
          return acc + (r?.ticket_price || 0);
        }, 0),
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
              className="mb-10"
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
            className="mt-15 bg-none border-faint text-muted w-full p-10 rounded-4 pointer text-sm"
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
        <div className="admin-header-flex">
          <div className="admin-tabs-container">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`admin-tab-btn ${activeTab === 'dashboard' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
            >
              📊 DASHBOARD
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`admin-tab-btn ${activeTab === 'users' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
            >
              👥 USUARIOS
            </button>
            <button 
              onClick={() => setActiveTab('hero')}
              className={`admin-tab-btn ${activeTab === 'hero' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
            >
              🎯 BANNER HERO
            </button>
          </div>
          <button onClick={fetchData} className="btn-secondary flex items-center gap-8">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> ACTUALIZAR
          </button>
          <button onClick={handleLogout} className="btn-primary admin-logout-btn">
            SALIR
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>

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
          <div className="metric-icon-box primary-cyan">
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
          <div className="metric-icon-box text-blue-sky">
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
          <div className="metric-icon-box accent-orange">
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
          <div className="metric-icon-box text-purple">
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
        <div id="raffle-form-container" className="premium-form-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary-cyan)', fontSize: '1.4rem', margin: 0, letterSpacing: '1px' }}>
              {editingRaffleId ? '✏️ EDITAR RIFA' : '➕ CREAR NUEVA RIFA'}
            </h3>
            {editingRaffleId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                CANCELAR EDICIÓN
              </button>
            )}
          </div>
          
          <form className="admin-form-container" onSubmit={handleSaveRaffle}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>NOMBRE DEL PREMIO</label>
                <input className="admin-input" required value={newRaffle.title} onChange={e => setNewRaffle({...newRaffle, title: e.target.value})} type="text" placeholder="Ej: iPhone 15 Pro" />
              </div>
              <div className="admin-form-group">
                <label>PRECIO POR BOLETO (RD$)</label>
                <input className="admin-input" required value={newRaffle.ticket_price} onChange={e => setNewRaffle({...newRaffle, ticket_price: e.target.value})} type="number" placeholder="500" />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>FECHA DE INICIO</label>
                <input className="admin-input" value={newRaffle.start_date} onChange={e => setNewRaffle({...newRaffle, start_date: e.target.value})} type="date" />
              </div>
              <div className="admin-form-group">
                <label>FECHA DEL SORTEO (FIN)</label>
                <input className="admin-input" value={newRaffle.draw_date} onChange={e => setNewRaffle({...newRaffle, draw_date: e.target.value})} type="date" />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>TOTAL DE BOLETOS</label>
                <input className="admin-input" required value={newRaffle.total_tickets} onChange={e => setNewRaffle({...newRaffle, total_tickets: e.target.value})} type="number" placeholder="10000" />
              </div>
              <div className="admin-form-group">
                <label>POSICIÓN (ORDEN)</label>
                <input className="admin-input" value={newRaffle.sort_order} onChange={e => setNewRaffle({...newRaffle, sort_order: e.target.value})} type="number" placeholder="0" />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>TIPO DE RIFA</label>
                <select className="admin-input" value={newRaffle.raffle_type} onChange={e => setNewRaffle({...newRaffle, raffle_type: e.target.value})}>
                  <option value="estandar" style={{ color: '#000' }}>Normal (Mín. 1 boleto)</option>
                  <option value="personalizada" style={{ color: '#000' }}>Oferta Flash (Compra mínima obligatoria)</option>
                </select>
              </div>
              {newRaffle.raffle_type === 'personalizada' ? (
                <div className="admin-form-group">
                  <label>MÍNIMO DE BOLETOS POR COMPRA</label>
                  <input className="admin-input" value={newRaffle.min_tickets} onChange={e => setNewRaffle({...newRaffle, min_tickets: e.target.value})} type="number" min="2" placeholder="Ej: 3" />
                </div>
              ) : (
                <div className="admin-form-group"></div>
              )}
            </div>

            <div className="admin-form-group">
              <label>DESCRIPCIÓN</label>
              <RichTextEditor
                value={newRaffle.description}
                onChange={(html) => setNewRaffle({...newRaffle, description: html})}
                placeholder="Descripción detallada del premio..."
              />
            </div>

            <div className="admin-form-group">
              <label>IMAGEN DEL PREMIO</label>
              <div className="image-upload-wrapper">
                <div 
                  className="image-preview-box"
                  onClick={() => document.getElementById('raffle-img-upload')?.click()}
                >
                  {newRaffle.image_url ? (
                    <img src={newRaffle.image_url} alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl block">+</span>
                      <span className="text-xs opacity-5">IMAGEN</span>
                    </div>
                  )}
                </div>
                <div>
                  <input id="raffle-img-upload" type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                  <p className="text-sm text-muted mb-10">Formatos aceptados: JPG, PNG, WEBP. Máximo 15MB (se optimizará automáticamente).</p>
                  <div className="flex gap-10">
                    <button type="button" onClick={() => document.getElementById('raffle-img-upload')?.click()} className="btn-secondary text-sm p-10">
                      {uploading ? 'SUBIENDO...' : 'SELECCIONAR FOTO'}
                    </button>
                    {newRaffle.image_url && (
                      <button type="button" onClick={() => setNewRaffle({...newRaffle, image_url: ''})} className="btn-delete-img">
                        ELIMINAR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-group w-150">
              <label>EMOJI / ÍCONO</label>
              <input className="admin-input text-center text-2xl" value={newRaffle.emoji} onChange={e => setNewRaffle({...newRaffle, emoji: e.target.value})} type="text" placeholder="🎁" maxLength={2} />
            </div>

            <button type="submit" className="btn-primary btn-raffle-submit">
              {editingRaffleId ? '⚡ ACTUALIZAR RIFA' : '⚡ CREAR RIFA AHORA'}
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
                         {r.is_active ? 'ACTIVA' : 'OCULTA'}
                       </span>
                       {r.is_paused && (
                         <span style={{ 
                           fontSize: '0.6rem', 
                           padding: '2px 6px', 
                           borderRadius: '4px', 
                           backgroundColor: 'rgba(255, 140, 0, 0.1)',
                           color: 'var(--accent-orange)'
                         }}>
                           PAUSADA
                         </span>
                       )}
                    </h4>
                     <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                       Posición: {r.sort_order || 0} | Precio: RD${r.ticket_price} | {r.total_tickets} boletos
                     </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleToggleRaffleStatus(r.id, r.is_active)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} title={r.is_active ? 'Ocultar' : 'Mostrar'}>
                      {r.is_active ? '👁️' : '🙈'}
                    </button>
                    <button onClick={() => handleTogglePause(r.id, !!r.is_paused)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.7rem' }} title={r.is_paused ? 'Reanudar Ventas' : 'Pausar Ventas'}>
                      {r.is_paused ? '▶️' : '⏸️'}
                    </button>
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
      
      {/* Participant Digital Ticket Search */}
      <div className="card" style={{ marginTop: '2.5rem' }}>
        <h3 style={{ color: 'var(--primary-cyan)', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} /> BUSCADOR DE BOLETOS VIRTUALES (EN VIVO)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Utiliza esta herramienta durante las transmisiones en vivo para buscar todos los boletos de un participante por su teléfono o cédula y mostrarlos en formato de comprobante digital.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Ingresa Teléfono o Cédula (Ej. 8090000000)" 
            value={searchParticipantQuery}
            onChange={(e) => setSearchParticipantQuery(e.target.value)}
            className="admin-input flex-grow"
            style={{ maxWidth: '400px' }}
          />
          <button onClick={handleSearchParticipant} className="btn-accent" disabled={isSearchingParticipant} style={{ padding: '0 25px' }}>
            {isSearchingParticipant ? 'BUSCANDO...' : 'BUSCAR COMPROBANTE'}
          </button>
        </div>
        {searchParticipantError && <p className="error-text mb-4" style={{ color: '#ff6b6b' }}>{searchParticipantError}</p>}
        {participantResult && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            {participantResult.raffles?.length === 0 ? (
              <p className="text-muted">No se encontraron boletos para este participante.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                {participantResult.raffles?.map((raffle: any, idx: number) => (
                  <div key={idx} style={{ flex: '1 1 400px', maxWidth: '500px' }}>
                    <DigitalTicket 
                      participantName={participantResult.participantName}
                      participantPhone={participantResult.participantPhone}
                      raffleData={raffle}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
              <th>Método</th>
              <th>Vendedor / Info</th>
              <th>Estado</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Cédula</th>
              <th>Precio Total</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {groupedTicketsTable.map(group => {
              const { participant, tickets: groupTickets, code } = group;
              const ticketIds = groupTickets.map(t => t.id);
              
              return (
              <tr key={code}>
                <td>
                  <button 
                    onClick={() => setViewingTickets({ 
                      code, 
                      tickets: groupTickets, 
                      quantity: groupTickets.length,
                      participant: participant
                    })}
                    className="ticket-count-badge"
                    title="Ver detalle de todos los boletos"
                  >
                    {groupTickets.length} Boletos
                  </button>
                </td>
                <td className="text-xs uppercase">{group.paymentMethod}</td>
                <td>
                  {group.collectorId ? (
                    <div className="text-xs primary-cyan bold">
                      🤝 {users.find(u => u.id === group.collectorId)?.full_name || 'Colaborador'}
                    </div>
                  ) : (
                    <div className="text-xs text-muted">Venta Directa</div>
                  )}
                </td>
                <td>
                      <span className={`badge-status ${group.status === 'paid' ? 'status-paid-alt' : 'status-pending-alt'}`}>
                        {group.status === 'paid' ? 'PAGADO ✓' : (group.status === 'pending' ? 'PENDIENTE ⏳' : 'MIXTO ⚠️')}
                      </span>
                </td>
                <td>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{participant?.full_name || 'Desconocido'}</div>
                  {participant?.customer_code && !participant.customer_code.includes('NaN') && (
                    <div style={{ marginTop: '3px' }}>
                      <span style={{ 
                        background: 'rgba(0, 242, 254, 0.12)', 
                        color: 'var(--primary-cyan)', 
                        border: '1px solid rgba(0, 242, 254, 0.3)', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        ID: #{participant.customer_code}
                      </span>
                    </div>
                  )}
                </td>
                <td className="text-sm bold" style={{ color: 'var(--primary-cyan)' }}>
                  {participant?.phone ? (
                    <a 
                      href={`https://wa.me/${participant.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Abrir WhatsApp para contactar"
                    >
                      📱 {participant.phone}
                    </a>
                  ) : '-'}
                </td>
                <td className="text-sm text-main bold">{participant?.cedula || '-'}</td>
                <td className="bold">RD${group.totalPrice}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {editingGroupCode === code ? (
                          <>
                            <button 
                              onClick={() => setEditingGroupCode(null)}
                              style={{
                                background: 'var(--success)',
                                border: 'none',
                                color: '#000',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                fontWeight: 'bold'
                              }}
                              title="Listo / Guardar cambios"
                            >
                              ✅ LISTO
                            </button>
                            <button 
                              onClick={() => setEditingGroupCode(null)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.2s'
                              }}
                              title="Cancelar edición"
                            >
                              ❌
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setEditingGroupCode(code)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: 'none',
                              color: 'var(--text-muted)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s'
                            }}
                            title="Editar cantidad de boletos (Modo regalo/ajuste)"
                          >
                            ✏️ Editar
                          </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', opacity: isRowActionLoading[code] ? 0.5 : 1 }}>
                      {(group.status === 'pending' || group.status === 'reserved' || editingGroupCode === code) && (
                        <>
                          {/* Only show 'APROBAR TODO' if there are tickets NOT paid, or if we are in Edit Mode forcing changes */}
                          {(group.status !== 'paid' || groupTickets.some(t => t.status !== 'paid')) && (
                            <button 
                              disabled={isRowActionLoading[code]}
                              onClick={() => {
                                showConfirm(
                                  'Aprobar Pago', 
                                  `¿Aprobar pago de ${ticketIds.length} boletos de ${participant?.full_name}?`,
                                  () => handleUpdateTicketStatus(ticketIds, 'paid', 'approve'),
                                  'APROBAR TODO'
                                );
                              }} 
                              style={{ 
                                background: 'var(--success)', 
                                border: 'none', 
                                color: '#000', 
                                padding: '5px 12px', 
                                borderRadius: '4px', 
                                cursor: isRowActionLoading[code] ? 'not-allowed' : 'pointer', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold' 
                              }}
                            >
                              {isRowActionLoading[code] ? '...' : '✓ APROBAR TODO'}
                            </button>
                          )}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            background: 'rgba(255,255,255,0.03)', 
                            borderRadius: '8px', 
                            padding: '2px',
                            border: '1px solid rgba(255,255,255,0.1)' 
                          }}>
                            <button 
                              disabled={isRowActionLoading[code]}
                              onClick={() => handleReduceGroup(code)} 
                              style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: 'none', 
                                color: '#fff', 
                                width: '30px', 
                                height: '30px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '6px', 
                                cursor: isRowActionLoading[code] ? 'not-allowed' : 'pointer', 
                                fontSize: '1.2rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => !isRowActionLoading[code] && (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)')}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                              title="Bajar 1 Boleto"
                            >
                              -
                            </button>
                            <div style={{ 
                              width: '40px', 
                              textAlign: 'center', 
                              fontSize: '1.1rem', 
                              fontWeight: 'bold', 
                              color: isRowActionLoading[code] ? 'var(--text-muted)' : 'var(--primary-cyan)' 
                            }}>
                              {groupTickets.length}
                            </div>
                            <button 
                              disabled={isRowActionLoading[code]}
                              onClick={() => handleAddTicketToGroup(code, groupTickets[0].raffle_id)}
                              style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                border: 'none', 
                                color: 'var(--primary-cyan)', 
                                width: '30px', 
                                height: '30px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '6px', 
                                cursor: isRowActionLoading[code] ? 'not-allowed' : 'pointer', 
                                fontSize: '1.2rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => !isRowActionLoading[code] && (e.currentTarget.style.backgroundColor = 'rgba(0, 242, 254, 0.15)')}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                              title="Sumar 1 Boleto manualmente"
                            >
                              +
                            </button>
                          </div>
                          {(group.status !== 'paid' || editingGroupCode === code) && (
                            <button 
                              disabled={isRowActionLoading[code]}
                              onClick={() => handleUpdateTicketStatus(ticketIds, 'reserved', 'cancel')} 
                              style={{ 
                                background: '#ef4444', 
                                border: 'none', 
                                color: '#fff', 
                                padding: '5px 10px', 
                                borderRadius: '4px', 
                                cursor: isRowActionLoading[code] ? 'not-allowed' : 'pointer', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold' 
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </>
                      )}

                      {group.status === 'paid' && (
                        <button 
                          disabled={isRowActionLoading[code]}
                          onClick={() => {
                            showConfirm(
                              'Anulación Total',
                              `¿Deseas anular LA PARTICIPACIÓN TOTAL de ${participant?.full_name}? Se liberarán ${groupTickets.length} boletos.`,
                              () => handleUpdateTicketStatus(ticketIds, 'reserved', 'cancel'),
                              'ANULAR TODO'
                            );
                          }} 
                          style={{ 
                            background: 'none', 
                            border: '1px solid #ef4444', 
                            color: '#ef4444', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            cursor: isRowActionLoading[code] ? 'not-allowed' : 'pointer', 
                            fontSize: '0.65rem' 
                          }}
                        >
                          {isRowActionLoading[code] ? '...' : 'Anular Compra'}
                        </button>
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

      {/* Ticket List Modal for Table */}
      {viewingTickets && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '450px', backgroundColor: 'var(--bg-panel)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.8)' }}>
            <button className="modal-close" onClick={() => setViewingTickets(null)}>×</button>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: 'var(--primary-cyan)', margin: '0 0 5px 0', fontSize: '1.4rem' }}>Boletos Asignados</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 10px 0', letterSpacing: '1px' }}>
                CÓDIGO: <strong style={{ color: '#fff' }}>{viewingTickets.code}</strong>
              </p>
              
              {viewingTickets.participant && (
                <div style={{ 
                  borderTop: '1px solid rgba(255,255,255,0.1)', 
                  paddingTop: '12px',
                  marginTop: '10px'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>
                    {viewingTickets.participant.full_name}
                    {viewingTickets.participant.customer_code && !viewingTickets.participant.customer_code.includes('NaN') && (
                      <span style={{ 
                        marginLeft: '8px',
                        background: 'rgba(0, 242, 254, 0.15)', 
                        color: 'var(--primary-cyan)', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        ID: #{viewingTickets.participant.customer_code}
                      </span>
                    )}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Cédula: <span style={{ color: '#fff', fontWeight: 'bold' }}>{viewingTickets.participant.cedula || '---'}</span>
                    <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                    Tel: {viewingTickets.participant.phone ? (
                      <a 
                        href={`https://wa.me/${viewingTickets.participant.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-cyan)', fontWeight: 'bold', textDecoration: 'none' }}
                        title="Abrir en WhatsApp"
                      >
                        📱 {viewingTickets.participant.phone}
                      </a>
                    ) : '---'}
                  </p>
                </div>
              )}
            </div>
            
            {viewingTickets.tickets.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay boletos activos.</p>
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '10px', 
              maxHeight: '300px', 
              overflowY: 'auto',
              padding: '15px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {viewingTickets.tickets.sort((a,b) => parseInt(a.ticket_number) - parseInt(b.ticket_number)).map((ticket, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  position: 'relative'
                }}>
                  <span>{ticket.ticket_number}</span>
                  <button 
                    onClick={() => {
                      showConfirm(
                        'Eliminar Boleto',
                        `¿Estás seguro de que deseas eliminar el boleto #${ticket.ticket_number}? El cliente será notificado.`,
                        async () => {
                          const res = await fetch('/api/admin/tickets', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ticketIds: [ticket.id] })
                          });
                          if (res.ok) {
                            showToast(`Boleto #${ticket.ticket_number} eliminado`, 'success');
                            await fetchData();
                            // Update modal state localy to reflect change
                            setViewingTickets(prev => {
                              if (!prev) return null;
                              return { ...prev, tickets: prev.tickets.filter(t => t.id !== ticket.id), quantity: prev.quantity - 1 };
                            });
                          } else {
                            showToast('Error al eliminar boleto', 'error');
                          }
                        },
                        'ELIMINAR'
                      );
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: 'none',
                      color: '#ef4444',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      cursor: 'pointer'
                    }}
                  >
                    ELIMINAR
                  </button>
                </div>
              ))}
            </div>
            
            <button className="btn-primary w-full mt-6" onClick={() => setViewingTickets(null)} style={{ borderRadius: '12px' }}>
              CERRAR LISTA
            </button>
          </div>
        </div>
      )}

      </>
      ) : (
        /* --- USERS MANAGEMENT TAB --- */
        <div className="users-management-section">
          {/* Create/Edit User Form */}
          <div className="premium-form-container" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary-cyan)', fontSize: '1.2rem', margin: 0 }}>
                {editingUserId ? '✏️ EDITAR USUARIO' : '➕ REGISTRAR NUEVO USUARIO / CLIENTE'}
              </h3>
              {editingUserId && (
                <button type="button" onClick={cancelUserEdit} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                  CANCELAR
                </button>
              )}
            </div>

            <form onSubmit={handleSaveUser} className="admin-form-container">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>NOMBRE COMPLETO</label>
                  <input className="admin-input" required value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})} type="text" placeholder="Ej: Juan Pérez" />
                </div>
                <div className="admin-form-group">
                  <label>EMAIL</label>
                  <input className="admin-input" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} type="email" placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>TELÉFONO</label>
                  <input className="admin-input" required value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} type="text" placeholder="8091234567" />
                </div>
                <div className="admin-form-group">
                  <label>CÉDULA</label>
                  <input className="admin-input" value={userForm.cedula} onChange={e => setUserForm({...userForm, cedula: e.target.value})} type="text" placeholder="402XXXXXXX-X" />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>PUNTOS ACUMULADOS</label>
                  <input className="admin-input" value={userForm.points} onChange={e => setUserForm({...userForm, points: e.target.value})} type="number" />
                </div>
                <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                  <input 
                    type="checkbox" 
                    id="is-collab-check" 
                    checked={userForm.is_cash_collector} 
                    onChange={e => setUserForm({...userForm, is_cash_collector: e.target.checked})}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="is-collab-check" style={{ margin: 0, cursor: 'pointer', color: userForm.is_cash_collector ? 'var(--success)' : 'inherit' }}>
                    ES COLABORADOR (Vendedor en efectivo)
                  </label>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>CONTRASEÑA (Dejar en blanco para no cambiar/crear)</label>
                  <input className="admin-input" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} type="text" placeholder="Nueva Contraseña..." />
                </div>
                <div className="admin-form-group">
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {editingUserId ? '⚡ ACTUALIZAR DATOS' : '👤 REGISTRAR USUARIO'}
              </button>
            </form>
          </div>

          <div className="table-wrapper" style={{ marginTop: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--primary-cyan)', margin: 0 }}>👥 GESTIÓN DE USUARIOS Y COLABORADORES</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '5px' }}>
                  Administra los roles de colaboradores (cobro en efectivo) y visualiza tus clientes registrados.
                </p>
              </div>
              <input 
                type="text" 
                placeholder="🔍 Buscar por nombre, cédula o teléfono..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: '100%', maxWidth: '350px', padding: '10px 15px', borderRadius: '12px' }}
              />
            </div>
            
            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>ID User</th>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Puntos</th>
                  <th>Rol / Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => {
                    const search = userSearch.toLowerCase();
                    return (
                      u.full_name?.toLowerCase().includes(search) ||
                      u.customer_code?.toLowerCase().includes(search) ||
                      u.phone?.includes(search) ||
                      u.cedula?.includes(search) ||
                      u.email?.toLowerCase().includes(search)
                    );
                  })
                  .map(user => (
                    <tr key={user.id}>
                      <td>
                        <span style={{ 
                          background: 'rgba(0, 242, 254, 0.12)', 
                          color: 'var(--primary-cyan)', 
                          border: '1px solid rgba(0, 242, 254, 0.25)', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold', 
                          padding: '3px 8px', 
                          borderRadius: '6px' 
                        }}>
                          #{user.customer_code && !user.customer_code.includes('NaN') ? user.customer_code : '---'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{user.email}</div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{user.cedula || '---'}</td>
                      <td style={{ fontSize: '0.9rem' }}>{user.phone}</td>
                      <td style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>{user.points || 0} pts</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.7rem', 
                          fontWeight: '700',
                          backgroundColor: user.is_cash_collector ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: user.is_cash_collector ? 'var(--success)' : 'var(--text-muted)'
                        }}>
                          {user.is_cash_collector ? '🤝 COLABORADOR (CASH)' : '👤 CLIENTE'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleToggleCollaborator(user.id, !!user.is_cash_collector)}
                            className="btn-secondary"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.7rem',
                              border: user.is_cash_collector ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                              color: user.is_cash_collector ? 'var(--success)' : '#fff'
                            }}
                            title={user.is_cash_collector ? 'Quitar Rol' : 'Hacer Colaborador'}
                          >
                            {user.is_cash_collector ? '🤝' : '👤'}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            style={{ 
                              padding: '6px 10px', 
                              fontSize: '0.7rem', 
                              color: '#ef4444', 
                              border: '1px solid rgba(239, 68, 68, 0.2)', 
                              borderRadius: '4px', 
                              background: 'none', 
                              cursor: 'pointer' 
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Collaborator Statistics Section */}
          <div className="card" style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ color: 'var(--success)', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} /> ESTADÍSTICAS DE COLABORADORES
              </h3>
              
              <div className="filter-group" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                {(['all', 'today', 'week', 'month'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.7rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: dateFilter === f ? 'var(--success)' : 'transparent',
                      color: dateFilter === f ? '#000' : 'var(--text-muted)',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {f === 'all' ? 'TODO' : f === 'today' ? 'HOY' : f === 'week' ? 'SEMANA' : 'MES'}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrapper" style={{ background: 'rgba(0,0,0,0.2)', border: 'none' }}>
              <table className="admin-table-premium">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Tickets Vendidos</th>
                    <th>Dinero Generado</th>
                    <th>Última Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => u.is_cash_collector)
                    .map(collab => {
                      // Filter tickets by collector AND date
                      const collabTickets = tickets.filter(t => {
                        const isCollab = (t as any).collector_id === collab.id;
                        if (!isCollab) return false;
                        
                        if (dateFilter === 'all') return true;
                        
                        const ticketDate = new Date(t.created_at);
                        const now = new Date();
                        
                        if (dateFilter === 'today') {
                          return ticketDate.toDateString() === now.toDateString();
                        }
                        
                        if (dateFilter === 'week') {
                          const startOfWeek = new Date(now);
                          startOfWeek.setDate(now.getDate() - now.getDay());
                          startOfWeek.setHours(0,0,0,0);
                          return ticketDate >= startOfWeek;
                        }
                        
                        if (dateFilter === 'month') {
                          return ticketDate.getMonth() === now.getMonth() && ticketDate.getFullYear() === now.getFullYear();
                        }
                        
                        return true;
                      });

                      const totalMoney = collabTickets.reduce((acc, t) => {
                        const raffle = raffles.find(r => r.id === t.raffle_id);
                        return acc + (raffle?.ticket_price || 0);
                      }, 0);
                      
                      return (
                        <tr key={collab.id}>
                          <td>
                            <div style={{ fontWeight: 'bold' }}>{collab.full_name}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{collab.phone}</div>
                          </td>
                          <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{collabTickets.length}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>RD${totalMoney.toLocaleString()}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {collabTickets.length > 0 
                              ? new Date(collabTickets[0].created_at).toLocaleDateString() 
                              : 'Sin ventas en este periodo'
                            }
                          </td>
                        </tr>
                      );
                    })}
                  {users.filter(u => u.is_cash_collector).length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>No hay colaboradores activos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="admin-content-grid">
          {/* Form to Create / Edit Hero Slide */}
          <div className="card shadow-lg" style={{ marginBottom: '2.5rem' }}>
            <div className="form-header-between">
              <h3 className="form-title-premium">
                {editingHeroId ? '✏️ EDITAR BANNER HERO' : '➕ NUEVO BANNER HERO'}
              </h3>
              {editingHeroId && (
                <button onClick={() => { setEditingHeroId(null); setHeroForm({ badge: '⚡ NUEVO BANNER', badge_color: '#00f2fe', title: '', subtitle: '', image_url: '', cta_text: '⚡ COMPRAR BOLETOS', link_href: '#buy', display_order: '1', is_active: true }); }} className="btn-secondary">
                  CANCELAR EDICIÓN
                </button>
              )}
            </div>

            <form onSubmit={handleSaveHeroSlide}>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>DISTINTIVO / BADGE (ENCABEZADO)</label>
                  <input 
                    className="admin-input" 
                    value={heroForm.badge} 
                    onChange={e => setHeroForm({...heroForm, badge: e.target.value})} 
                    placeholder="Ej: ⚡ RIFA DESTACADA EN VIVO" 
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label>COLOR DEL DISTINTIVO</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      value={heroForm.badge_color} 
                      onChange={e => setHeroForm({...heroForm, badge_color: e.target.value})}
                      style={{ width: '45px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input 
                      className="admin-input" 
                      value={heroForm.badge_color} 
                      onChange={e => setHeroForm({...heroForm, badge_color: e.target.value})} 
                      placeholder="#00f2fe" 
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label>TÍTULO PRINCIPAL DEL BANNER</label>
                <input 
                  className="admin-input" 
                  value={heroForm.title} 
                  onChange={e => setHeroForm({...heroForm, title: e.target.value})} 
                  placeholder="Ej: YAMAHA YZ • SUPER GATO • RD$50,000" 
                  required 
                />
              </div>

              <div className="admin-form-group">
                <label>SUBTÍTULO / DESCRIPCIÓN CORTA</label>
                <textarea 
                  className="admin-input" 
                  rows={2}
                  value={heroForm.subtitle} 
                  onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})} 
                  placeholder="Ej: Solo RD$100 por boleto. Sorteo oficial Pick 4 Florida..." 
                />
              </div>

              <div className="admin-form-group">
                <label>IMAGEN DE FONDO DEL BANNER</label>
                <div className="image-upload-wrapper">
                  <div 
                    className="image-preview-box"
                    onClick={() => document.getElementById('hero-img-upload')?.click()}
                  >
                    {heroForm.image_url ? (
                      <img src={heroForm.image_url} alt="Preview Hero" />
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl block">+</span>
                        <span className="text-xs opacity-5">SUBIR FOTO</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <input id="hero-img-upload" type="file" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.success) {
                          setHeroForm(prev => ({ ...prev, image_url: data.publicUrl }));
                          showToast('Imagen subida', 'success');
                        }
                      } catch (err) { showToast('Error al subir', 'error'); }
                      finally { setUploading(false); }
                    }} className="hidden" accept="image/*" />
                    <input 
                      className="admin-input mb-10" 
                      value={heroForm.image_url} 
                      onChange={e => setHeroForm({...heroForm, image_url: e.target.value})} 
                      placeholder="O pega una URL de imagen directa (ej: https://...)" 
                    />
                    <button type="button" onClick={() => document.getElementById('hero-img-upload')?.click()} className="btn-secondary text-sm">
                      {uploading ? 'SUBIENDO...' : '📁 SELECCIONAR FOTO LOCAL'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-grid-3">
                <div className="admin-form-group">
                  <label>TEXTO DEL BOTÓN (CTA)</label>
                  <input 
                    className="admin-input" 
                    value={heroForm.cta_text} 
                    onChange={e => setHeroForm({...heroForm, cta_text: e.target.value})} 
                    placeholder="Ej: ⚡ COMPRAR BOLETOS AHORA" 
                  />
                </div>

                <div className="admin-form-group">
                  <label>ENLACE / DESTINO AL HACER CLIC</label>
                  <input 
                    className="admin-input" 
                    value={heroForm.link_href} 
                    onChange={e => setHeroForm({...heroForm, link_href: e.target.value})} 
                    placeholder="#buy, /recompensas, /verificador" 
                  />
                </div>

                <div className="admin-form-group">
                  <label>ORDEN DE POSICIÓN</label>
                  <input 
                    className="admin-input" 
                    type="number"
                    value={heroForm.display_order} 
                    onChange={e => setHeroForm({...heroForm, display_order: e.target.value})} 
                    placeholder="1, 2, 3..." 
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-4">
                {editingHeroId ? '⚡ ACTUALIZAR BANNER HERO' : '➕ GUARDAR NUEVO BANNER'}
              </button>
            </form>
          </div>

          {/* Table / List of Hero Slides */}
          <div className="table-wrapper">
            <h3 style={{ color: 'var(--primary-cyan)', marginBottom: '1rem' }}>🎯 BANNERS Y SLIDES ACTIVOS</h3>
            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>Vista Previa</th>
                  <th>Encabezado / Título</th>
                  <th>Botón / Destino</th>
                  <th>Orden</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {heroSlides.map(slide => (
                  <tr key={slide.id}>
                    <td>
                      <img src={slide.image_url} alt={slide.title} style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: slide.badge_color || 'var(--primary-cyan)', fontWeight: 'bold' }}>{slide.badge}</div>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{slide.title}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-cyan)', fontSize: '0.85rem' }}>{slide.cta_text}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slide.link_href}</div>
                    </td>
                    <td><span style={{ fontWeight: 'bold' }}>#{slide.display_order || 1}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleEditHeroSlide(slide)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>✏️ Editar</button>
                        <button onClick={() => handleDeleteHeroSlide(slide.id)} style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 10px', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {heroSlides.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Mostrando banners por defecto. Puedes agregar tus propios banners arriba.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Global Notifications Interface */}
      {confirmConfig.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-content" style={{ 
            maxWidth: '400px', 
            background: 'linear-gradient(135deg, #111, #1a1a1a)', 
            border: '1px solid rgba(0, 242, 254, 0.4)', 
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 242, 254, 0.1)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            animation: 'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ color: 'var(--primary-cyan)', fontSize: '1.6rem', marginBottom: '0.8rem', fontWeight: '900', letterSpacing: '0.5px' }}>
              {confirmConfig.title}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
              {confirmConfig.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-secondary flex-grow" 
                onClick={confirmConfig.onCancel}
                style={{ padding: '14px', borderRadius: '12px', fontWeight: 'bold' }}
              >
                CANCELAR
              </button>
              <button 
                className="btn-primary flex-grow" 
                onClick={confirmConfig.onConfirm}
                style={{ padding: '14px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: '#22c55e', borderColor: '#22c55e' }}
              >
                {confirmConfig.confirmText || 'CONFIRMAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3000,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 242, 254, 0.95)',
          color: toast.type === 'error' ? '#fff' : '#000',
          padding: '14px 28px',
          borderRadius: '50px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUpToast 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(4px)'
        }}>
          {toast.type === 'error' ? '🚫' : '💎'} {toast.message.toUpperCase()}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUpToast {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
