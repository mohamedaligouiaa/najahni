import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, DoorOpen, LogOut, User, Plus, Pencil, Trash2, X, Check, Users, ChevronDown, ChevronRight, GraduationCap, Settings, BookOpen, Search, Filter, Calendar } from 'lucide-react';
import api from '../api/axios';
import GestionJury from '../components/GestionJury';
import GestionCreneaux from '../components/GestionCreneaux';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [expandedMenus, setExpandedMenus] = useState({ 'Gestion des Jury': true });
  const [user, setUser] = useState(null);
  const [salles, setSalles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nom: '', capacite: '', disponible: true });
  const [editingId, setEditingId] = useState(null);
  const [globalSearch, setGlobalSearch] = useState(''); // Nouvelle recherche globale

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

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openAddForm = () => {
    setFormData({ nom: '', capacite: '', disponible: true });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (salle) => {
    setFormData({ nom: salle.nom, capacite: salle.capacite, disponible: salle.disponible });
    setEditingId(salle.id);
    setShowForm(true);
  };

  const handleSalleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/salles/update/${editingId}`, formData);
        showFeedback('Salle mise à jour avec succès');
      } else {
        await api.post('/salles/add', formData);
        showFeedback('Salle ajoutée avec succès');
      }
      setShowForm(false);
      fetchSalles();
    } catch (err) {
      showFeedback('Erreur lors de l\'opération', 'error');
    }
  };

  const deleteSalle = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette salle ?')) {
      try {
        await api.delete(`/salles/delete/${id}`);
        showFeedback('Salle supprimée');
        fetchSalles();
      } catch {
        showFeedback('Erreur lors de la suppression', 'error');
      }
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Gestion des Salles', icon: <DoorOpen size={20} /> },
    { 
      name: 'Gestion des Créneaux', 
      icon: <Calendar size={20} />,
      subItems: [
        { name: 'Ajouter Créneaux', tab: 'Creneau-Ajouter', icon: <Plus size={16} /> },
        { name: 'Gérer Créneaux', tab: 'Creneau-Gerer', icon: <Settings size={16} /> }
      ]
    },
    { 
      name: 'Gestion des Jury', 
      icon: <Users size={20} />,
      subItems: [
        { name: 'Encadrant', tab: 'Jury-Créer', icon: <GraduationCap size={16} /> },
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
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-30">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Settings className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-tighter">Admin Portal</h1>
          </div>
        </div>
        
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
                <div className="flex items-center gap-4">
                  <span className={(activeTab === item.name || (item.subItems && item.subItems.some(sub => sub.tab === activeTab))) ? 'text-violet-400' : 'text-slate-500 group-hover:text-violet-400'}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                </div>
                {item.subItems && (
                  expandedMenus[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
              </button>
              
              {item.subItems && expandedMenus[item.name] && (
                <div className="mt-1 space-y-1">
                  {item.subItems.map(sub => (
                    <button
                      key={sub.name}
                      onClick={() => setActiveTab(sub.tab)}
                      className={`w-full flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-xl transition-all text-sm ${
                        activeTab === sub.tab
                          ? 'text-violet-400 font-bold bg-violet-400/5'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                      }`}
                    >
                      {sub.icon} {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
           <div className="bg-slate-800/30 rounded-2xl p-4 mb-4 border border-slate-700/50">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Logged as</p>
             <p className="text-xs font-bold text-white truncate">{user?.email}</p>
           </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 py-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white font-bold transition-all"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />
        
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-10 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-black text-white">{activeTab}</h2>
             <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
             <p className="text-slate-500 text-sm font-medium">Administration Centrale</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher par date ou statut..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-violet-500 outline-none w-64 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                {user?.nom?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          {/* Messages */}
          {message.text && (
            <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border animate-fade-in ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
          )}

          {activeTab === 'Dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-violet-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-violet-500/10 text-violet-400 rounded-2xl"><LayoutDashboard size={28}/></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Salles</span>
                  </div>
                  <p className="text-5xl font-black text-white">{salles.length}</p>
                  <p className="text-slate-500 text-xs mt-4">Infrastructures enregistrées</p>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl"><Check size={28}/></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Disponibles</span>
                  </div>
                  <p className="text-5xl font-black text-white">{sallesDisponibles}</p>
                  <p className="text-emerald-500/60 text-xs mt-4 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Prêt pour usage
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-rose-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl"><X size={28}/></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Occupées</span>
                  </div>
                  <p className="text-5xl font-black text-white">{sallesOccupees}</p>
                  <p className="text-rose-500/60 text-xs mt-4 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> En cours d'utilisation
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'Gestion des Salles' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">Gestion des Salles</h3>
                  <p className="text-slate-500">Configurez les espaces de soutenance disponibles</p>
                </div>
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-3 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-violet-600/20 transition-all active:scale-95"
                >
                  <Plus size={20} /> Ajouter une salle
                </button>
              </div>

              {showForm && (
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 animate-fade-in shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-bold text-white">{editingId ? 'Modifier la salle' : 'Nouvelle Salle'}</h4>
                    <button onClick={() => setShowForm(false)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSalleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom de la salle</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Salle A102"
                        value={formData.nom}
                        onChange={e => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Capacité</label>
                      <input
                        type="number"
                        required
                        placeholder="Ex: 30"
                        value={formData.capacite}
                        onChange={e => setFormData({ ...formData, capacite: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-end">
                       <label className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 px-6 py-4 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all w-full">
                         <input
                           type="checkbox"
                           checked={formData.disponible}
                           onChange={e => setFormData({ ...formData, disponible: e.target.checked })}
                           className="w-5 h-5 rounded-md accent-violet-500"
                         />
                         <span className="font-bold text-slate-300">Disponible immédiatement</span>
                       </label>
                    </div>
                    <div className="md:col-span-3 pt-6 border-t border-slate-800 flex gap-4">
                      <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg transition-all">
                        {editingId ? 'Mettre à jour' : 'Enregistrer'}
                      </button>
                      <button type="button" onClick={() => setShowForm(false)} className="bg-slate-800 text-slate-300 px-10 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all">
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] border-b border-slate-800">
                      <th className="px-10 py-6">Identifiant</th>
                      <th className="px-10 py-6">Désignation</th>
                      <th className="px-10 py-6 text-center">Capacité</th>
                      <th className="px-10 py-6">Statut</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {salles.map(salle => (
                      <tr key={salle.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-10 py-6 font-mono text-xs text-slate-500">#{salle.id}</td>
                        <td className="px-10 py-6 font-bold text-white text-lg">{salle.nom}</td>
                        <td className="px-10 py-6 text-center font-bold text-slate-300">{salle.capacite} pl.</td>
                        <td className="px-10 py-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${
                            salle.disponible 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${salle.disponible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {salle.disponible ? 'DISPONIBLE' : 'OCCUPÉE'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditForm(salle)} className="p-2 bg-slate-800 text-violet-400 hover:bg-violet-600 hover:text-white rounded-lg transition-all shadow-lg">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteSalle(salle.id)} className="p-2 bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {salles.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-10 py-20 text-center text-slate-600 italic">
                          Aucune salle configurée. Cliquez sur "Ajouter une salle" pour commencer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab.startsWith('Jury-') && (
            <div className="animate-fade-in">
              <GestionJury activeTab={activeTab} />
            </div>
          )}

          {activeTab === 'Gestion des Créneaux' || activeTab.startsWith('Creneau-') && (
            <div className="animate-fade-in">
              <GestionCreneaux 
                activeTab={activeTab} 
                globalSearch={globalSearch} 
                setGlobalSearch={setGlobalSearch} 
              />
            </div>
          )}

          {activeTab === 'Profil' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl p-12 max-w-3xl">
               <div className="flex items-center gap-8 mb-12">
                 <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-violet-500/20">
                   {user?.nom?.charAt(0) || 'A'}
                 </div>
                 <div>
                   <h3 className="text-3xl font-black text-white">{user?.nom}</h3>
                   <p className="text-violet-400 font-bold uppercase text-xs tracking-widest mt-1">Administrator Access</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800 pt-10">
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                   <p className="text-lg font-bold text-white">{user?.email}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Role</p>
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                     <p className="text-lg font-bold text-white">Full Administrator</p>
                   </div>
                 </div>
               </div>
               
               <button className="mt-12 w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-slate-700">
                 Modifier le profil
               </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
