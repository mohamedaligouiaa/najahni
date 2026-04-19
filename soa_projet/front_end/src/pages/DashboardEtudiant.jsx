import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, User, LogOut } from 'lucide-react';
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
    <div className="flex h-screen bg-orange-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r shadow-xl flex flex-col text-slate-300">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            Espace Étudiant
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map(item => (
            <button key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${activeTab === item.name ? 'bg-slate-800 border-r-4 border-orange-400 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}>
              {item.icon} {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 font-medium transition">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-800">{activeTab}</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold uppercase shadow-inner">
              {user?.nom?.charAt(0) || 'U'}
            </div>
            <span className="font-medium text-gray-700">{user?.nom || 'Étudiant'}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {activeTab === 'Dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><GraduationCap size={24}/></div>
                  <h3 className="text-lg font-bold">État de la soutenance</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">{data.soutenance ? 'Planifiée' : 'Non assignée'}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Award size={24}/></div>
                  <h3 className="text-lg font-bold">Moyenne</h3>
                </div>
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                  {data.moyenne ? data.moyenne.toFixed(2) : '-'} / 20
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><BookOpen size={24}/></div>
                  <h3 className="text-lg font-bold">Mention</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">{data.mention}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'Ma soutenance' && (
            <div className="bg-white rounded-2xl shadow p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Détails de la soutenance</h3>
              {data.soutenance ? (
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Date d'évaluation</p>
                    <p className="text-lg font-medium text-gray-900">{data.soutenance.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Salle</p>
                    <p className="text-lg font-medium text-gray-900">{data.soutenance.salle}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Encadrant</p>
                    <p className="text-lg font-medium text-gray-900">{data.soutenance.encadrant}</p>
                  </div>
                </div>
              ) : <p className="text-gray-500 italic">Aucune soutenance n'a été planifiée pour vous.</p>}
            </div>
          )}

          {activeTab === 'Mes notes' && (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
               <div className="px-8 py-6 border-b">
                 <h3 className="text-2xl font-bold text-gray-800">Résultats détaillés</h3>
               </div>
               <div className="p-8">
                 {data.notes && data.notes.length > 0 ? (
                   <ul className="space-y-6">
                     {data.notes.map((n, i) => (
                       <li key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-xl border">
                         <div>
                           <p className="font-semibold text-gray-800 text-lg">Jury #{n.jury.id}</p>
                           <p className="text-gray-600 mt-2 italic">"{n.commentaire}"</p>
                         </div>
                         <div className="mt-4 md:mt-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-lg font-bold text-xl shadow-md">
                           {n.note} / 20
                         </div>
                       </li>
                     ))}
                   </ul>
                 ) : <p className="text-gray-500 italic">Aucune note saisie pour le moment.</p>}
               </div>
            </div>
          )}

          {activeTab === 'Profil' && (
            <div className="bg-white rounded-2xl shadow p-8 max-w-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Informations personnelles</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-24 font-medium text-gray-500">Nom complet:</div>
                  <div className="text-lg font-semibold">{user?.nom}</div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-24 font-medium text-gray-500">Email:</div>
                  <div className="text-lg font-semibold">{user?.email}</div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-24 font-medium text-gray-500">Rôle:</div>
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">{user?.role}</div>
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
