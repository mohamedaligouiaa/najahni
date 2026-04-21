import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, User, LogOut, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const DashboardEtudiant = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState({ soutenance: null, notes: [], moyenne: 0, mention: 'N/A' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchDashboardData();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      navigate('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/etudiant/dashboard');
      setData(res.data);
    } catch {
      console.error('Failed to fetch dashboard');
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <BookOpen size={20} /> },
    { name: 'Ma soutenance', icon: <GraduationCap size={20} /> },
    { name: 'Mes notes', icon: <Award size={20} /> },
    { name: 'Profil', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Award className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Espace Étudiant</h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarItems.map(item => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.name 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={activeTab === item.name ? 'text-white' : 'text-slate-500 group-hover:text-violet-400 transition-colors'}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.name}</span>
              </div>
              {activeTab === item.name && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-rose-500/10 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white font-bold transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Abstract Background Blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -z-10" />
        
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-10 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{activeTab}</h2>
          <div className="flex items-center gap-4 bg-slate-800/50 p-2 pr-6 rounded-full border border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">
              {user?.nom?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">{user?.nom || 'Étudiant'}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-widest uppercase">ID: #{user?.id || '---'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          {activeTab === 'Dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Card 1 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <GraduationCap size={80} />
                  </div>
                  <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">Soutenance</h3>
                  <p className="text-3xl font-black text-white">{data.soutenance ? 'Confirmée' : 'En attente'}</p>
                  <p className="text-slate-500 text-xs mt-4 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${data.soutenance ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {data.soutenance ? 'Planning finalisé' : 'En attente d\'attribution'}
                  </p>
                </div>

                {/* Stats Card 2 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Award size={80} />
                  </div>
                  <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">Moyenne Générale</h3>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                    {data.moyenne ? data.moyenne.toFixed(2) : '--'}
                  </p>
                  <p className="text-slate-500 text-xs mt-4 italic">Sur un barème de 20 points</p>
                </div>

                {/* Stats Card 3 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <BookOpen size={80} />
                  </div>
                  <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">Mention</h3>
                  <p className="text-3xl font-black text-white">{data.mention || 'N/A'}</p>
                  <p className="text-slate-500 text-xs mt-4">Résultat officiel final</p>
                </div>
              </div>

              {/* Recent Activity or Welcome Message */}
              <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-10 rounded-[3rem]">
                <h3 className="text-2xl font-bold mb-4">Bienvenue, {user?.nom} !</h3>
                <p className="text-slate-400 max-w-2xl leading-relaxed">
                  Consultez les détails de votre soutenance, vos notes et vos évaluations directement depuis votre espace personnel. 
                  Bonne chance pour votre présentation !
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'Ma soutenance' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl p-10 max-w-4xl">
              <h3 className="text-2xl font-bold mb-10 text-white flex items-center gap-3">
                <GraduationCap className="text-violet-400" /> Détails de l'évaluation
              </h3>
              {data.soutenance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Date & Heure</p>
                    <p className="text-xl font-bold text-white">{data.soutenance.date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Salle Assignée</p>
                    <p className="text-xl font-bold text-white">{data.soutenance.salle}</p>
                  </div>
                  <div className="md:col-span-2 space-y-2 pt-6 border-t border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Encadrant Principal</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      {data.soutenance.encadrant}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[2rem]">
                  <p className="text-slate-500 text-lg italic">Planning en cours de finalisation par l'administration.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Mes notes' && (
            <div className="space-y-8">
               <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-bold text-white">Résultats détaillés</h3>
                 <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {data.notes?.length || 0} évaluations
                 </div>
               </div>
               
               {data.notes && data.notes.length > 0 ? (
                 <div className="grid grid-cols-1 gap-6">
                   {data.notes.map((n, i) => (
                     <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-violet-500/30 transition-all shadow-xl">
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-3">
                           <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300">#{i+1}</span>
                           <h4 className="font-bold text-xl text-white">Membre du Jury</h4>
                         </div>
                         <p className="text-slate-400 italic leading-relaxed">"{n.commentaire}"</p>
                       </div>
                       <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white w-24 h-24 rounded-3xl flex flex-col items-center justify-center shadow-xl shadow-violet-600/20">
                         <span className="text-3xl font-black">{n.note}</span>
                         <span className="text-[10px] font-bold opacity-60 uppercase">/ 20</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-[3rem]">
                   <Award className="mx-auto text-slate-700 mb-4" size={48} />
                   <p className="text-slate-500 text-lg italic">Les notes seront affichées après la délibération du jury.</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'Profil' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl p-10 max-w-2xl">
              <h3 className="text-2xl font-bold mb-10 text-white border-b border-slate-800 pb-6">Informations du Profil</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400">
                    <User size={40} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">{user?.nom}</h4>
                    <p className="text-slate-500">{user?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-800">
                  <div className="p-6 bg-slate-800/50 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Statut Actuel</p>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">Actif</span>
                  </div>
                  <div className="p-6 bg-slate-800/50 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Type de Compte</p>
                    <span className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-bold border border-violet-500/20">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardEtudiant;
