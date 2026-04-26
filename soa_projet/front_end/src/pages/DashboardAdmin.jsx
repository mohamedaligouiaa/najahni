import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, DoorOpen, LogOut, User, Plus, X, Check, Users, ChevronDown, ChevronRight, GraduationCap, Settings, BookOpen, Search, Calendar } from 'lucide-react';
import api from '../api/axios';
import GestionJury from '../components/GestionJury';
import GestionCreneaux from '../components/GestionCreneaux';
import GestionSalles from '../components/GestionSalles';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [expandedMenus, setExpandedMenus] = useState({ 'Gestion des Jury': true });
  const [user, setUser] = useState(null);
  const [salles, setSalles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    fetchUser();
    fetchSalles();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      navigate('/login');
    }
  };

  const fetchSalles = async () => {
    try {
      const res = await api.get('/salles/list');
      setSalles(res.data);
    } catch {
      console.error('Failed to fetch salles');
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
      name: 'Gestion des Salles',
      icon: <DoorOpen size={20} />,
      subItems: [
        { name: 'Ajouter une salle', tab: 'Salle-Créer', icon: <Plus size={16} /> },
        { name: 'Gérer les salles',  tab: 'Salle-Gérer', icon: <Settings size={16} /> },
      ]
    },
    {
      name: 'Gestion des Créneaux',
      icon: <Calendar size={20} />,
      subItems: [
        { name: 'Ajouter Créneaux', tab: 'Creneau-Ajouter', icon: <Plus size={16} /> },
        { name: 'Gérer Créneaux',   tab: 'Creneau-Gerer',   icon: <Settings size={16} /> }
      ]
    },
    {
      name: 'Gestion des Jury',
      icon: <Users size={20} />,
      subItems: [
        { name: 'Encadrant',     tab: 'Jury-Créer',    icon: <GraduationCap size={16} /> },
        { name: 'Modifier jury', tab: 'Jury-Modifier', icon: <Settings size={16} /> },
        { name: 'Afficher jury', tab: 'Jury-Afficher', icon: <BookOpen size={16} /> }
      ]
    },
    { name: 'Profil', icon: <User size={20} /> },
  ];

  const handleMenuClick = (item) => {
    if (item.subItems) {
      setExpandedMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }));
    } else {
      setActiveTab(item.name);
    }
  };

  const sallesDisponibles = salles.filter(s => s.disponible).length;
  const sallesOccupees = salles.filter(s => !s.disponible).length;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100">

      {/* ── SIDEBAR ── */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-30">
        {/* Logo */}
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Settings className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">Admin Portal</h1>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {sidebarItems.map(item => (
            <div key={item.name}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                  (activeTab === item.name || (item.subItems && item.subItems.some(sub => sub.tab === activeTab)))
                    ? 'bg-slate-800/50 text-white border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={
                    (activeTab === item.name || (item.subItems && item.subItems.some(sub => sub.tab === activeTab)))
                      ? 'text-violet-400'
                      : 'text-slate-500 group-hover:text-violet-400'
                  }>
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {item.subItems && (
                  expandedMenus[item.name]
                    ? <ChevronDown size={15} className="text-slate-500" />
                    : <ChevronRight size={15} className="text-slate-500" />
                )}
              </button>

              {item.subItems && expandedMenus[item.name] && (
                <div className="mt-1 ml-2 space-y-0.5">
                  {item.subItems.map(sub => (
                    <button
                      key={sub.name}
                      onClick={() => setActiveTab(sub.tab)}
                      className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 rounded-xl transition-all text-sm ${
                        activeTab === sub.tab
                          ? 'text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className={activeTab === sub.tab ? 'text-violet-400' : 'text-slate-600'}>
                        {sub.icon}
                      </span>
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-5 border-t border-slate-800 space-y-3">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
              {user?.nom?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logged as</p>
              <p className="text-xs font-bold text-white truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white font-bold text-sm transition-all"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-10 py-5 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white">{activeTab}</h2>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <p className="text-slate-500 text-sm font-medium">Administration Centrale</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="text"
                placeholder="Rechercher par date ou statut..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-violet-500 outline-none w-56 transition-all text-white"
              />
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
              {user?.nom?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-10">

          {/* Message global */}
          {message.text && (
            <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-3xl font-black text-white mb-1">Bienvenue 👋</h3>
                <p className="text-slate-500 text-sm">Voici un aperçu de votre système de soutenance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total salles */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl hover:border-violet-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
                      <LayoutDashboard size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Total Salles</span>
                  </div>
                  <p className="text-5xl font-black text-white">{salles.length}</p>
                  <p className="text-slate-500 text-xs mt-3">Infrastructures enregistrées</p>
                  <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Disponibles */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl hover:border-emerald-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Check size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Disponibles</span>
                  </div>
                  <p className="text-5xl font-black text-white">{sallesDisponibles}</p>
                  <p className="text-emerald-500/60 text-xs mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Prêt pour usage
                  </p>
                  <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: salles.length ? `${(sallesDisponibles / salles.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Occupées */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl hover:border-rose-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                      <X size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Occupées</span>
                  </div>
                  <p className="text-5xl font-black text-white">{sallesOccupees}</p>
                  <p className="text-rose-500/60 text-xs mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    En cours d'utilisation
                  </p>
                  <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: salles.length ? `${(sallesOccupees / salles.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Raccourcis rapides */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Accès rapide</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Ajouter une salle',   tab: 'Salle-Créer',      icon: <DoorOpen size={18} />,      color: 'violet' },
                    { label: 'Gérer les salles',     tab: 'Salle-Gérer',      icon: <Settings size={18} />,      color: 'slate' },
                    { label: 'Nouveau créneau',      tab: 'Creneau-Ajouter',  icon: <Calendar size={18} />,      color: 'indigo' },
                    { label: 'Gérer créneaux',       tab: 'Creneau-Gerer',    icon: <BookOpen size={18} />,      color: 'slate' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(item.tab)}
                      className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 hover:text-white transition-all text-left"
                    >
                      <span className="text-violet-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SALLES ── */}
          {activeTab.startsWith('Salle-') && (
            <GestionSalles
              activeTab={activeTab}
              onSallesChange={fetchSalles}
            />
          )}

          {/* ── JURY ── */}
          {activeTab.startsWith('Jury-') && (
            <div className="animate-fade-in">
              <GestionJury activeTab={activeTab} />
            </div>
          )}

          {/* ── CRÉNEAUX ── */}
          {(activeTab === 'Gestion des Créneaux' || activeTab.startsWith('Creneau-')) && (
            <div className="animate-fade-in">
              <GestionCreneaux
                activeTab={activeTab}
                globalSearch={globalSearch}
                setGlobalSearch={setGlobalSearch}
              />
            </div>
          )}

          {/* ── PROFIL ── */}
          {activeTab === 'Profil' && (
            <div className="max-w-2xl">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
                {/* Banner */}
                <div className="h-28 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-slate-900" />
                <div className="px-10 pb-10 -mt-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-violet-500/20 border-4 border-slate-900 mb-6">
                    {user?.nom?.charAt(0) || 'A'}
                  </div>
                  <h3 className="text-2xl font-black text-white">{user?.nom}</h3>
                  <p className="text-violet-400 font-bold uppercase text-xs tracking-widest mt-1">Administrator Access</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-slate-800 pt-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-white">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rôle</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-sm font-bold text-white">Full Administrator</p>
                      </div>
                    </div>
                  </div>

                  <button className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all border border-slate-700">
                    Modifier le profil
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;