import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, CheckSquare, List, ChevronRight, Award, Calendar, MapPin } from 'lucide-react';
import api from '../api/axios';

const DashboardJury = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [soutenances, setSoutenances] = useState([]);
  const [user, setUser] = useState(null);
  const [noteForm, setNoteForm] = useState({ soutenanceId: '', note: '', commentaire: '', moyenne: 0, mention: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [moyennes, setMoyennes] = useState({});

  useEffect(() => {
    fetchUser();
    fetchSoutenances();
  }, []);

  useEffect(() => {
    const fetchMoyennes = async () => {
      const results = {};
      await Promise.all(
        soutenances.map(async (s) => {
          try {
            const res = await api.get(`/jury/notes/soutenance/${s.id}`);
            const notes = res.data;
            results[s.id] = notes.length > 0
              ? (notes.reduce((acc, n) => acc + n.note, 0) / notes.length).toFixed(2)
              : "N/A";
          } catch {
            results[s.id] = "N/A";
          }
        })
      );
      setMoyennes(results);
    };

    if (soutenances.length > 0) fetchMoyennes();
  }, [soutenances]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      navigate('/login');
    }
  };

  const fetchSoutenances = async () => {
    try {
      const res = await api.get('/jury/mes-soutenance');
      setSoutenances(res.data);
    } catch {
      console.error('Failed to fetch soutenances');
    }
  };

  const calculateMoyenne = (notes, newNote, currentUserId) => {
    const otherNotes = notes.filter(n => n.jury?.membre?.id !== currentUserId);
    if (!newNote && otherNotes.length === 0) return 0;
    const allNotes = newNote
      ? [...otherNotes.map(n => n.note), Number(newNote)]
      : otherNotes.map(n => n.note);
    if (allNotes.length === 0) return 0;
    const sum = allNotes.reduce((acc, n) => acc + n, 0);
    return sum / allNotes.length;
  };

  const getMention = (moyenne) => {
    if (!moyenne) return '';
    if (moyenne < 10) return 'Redoublant';
    if (moyenne < 12) return 'Passable';
    if (moyenne < 14) return 'Assez Bien';
    if (moyenne < 16) return 'Bien';
    if (moyenne < 18) return 'Très Bien';
    return 'Excellent';
  };

  const handleSoutenanceChange = async (id) => {
    if (!id) {
      setNoteForm(prev => ({ ...prev, soutenanceId: '', moyenne: 0, mention: '' }));
      return;
    }
    const res = await api.get(`/jury/notes/soutenance/${id}`);
    const notes = res.data;
    const moy = calculateMoyenne(notes, noteForm.note, user?.id);
    setNoteForm(prev => ({
      ...prev,
      soutenanceId: id,
      moyenne: moy,
      mention: getMention(moy)
    }));
  };

  const handleNoteChange = async (value) => {
    if (!noteForm.soutenanceId) {
      setNoteForm(prev => ({ ...prev, note: value }));
      return;
    }
    const res = await api.get(`/jury/notes/soutenance/${noteForm.soutenanceId}`);
    const notes = res.data;
    const moy = calculateMoyenne(notes, value, user?.id);
    setNoteForm(prev => ({
      ...prev,
      note: value,
      moyenne: moy,
      mention: getMention(moy)
    }));
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const submitNote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jury/noter', noteForm);
      setMessage({ text: 'Évaluation enregistrée avec succès !', type: 'success' });
      setNoteForm({ soutenanceId: '', note: '', commentaire: '', moyenne: 0, mention: '' });
      fetchSoutenances();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'Erreur lors de la saisie de la note.', type: 'error' });
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <BookOpen size={20} /> },
    { name: 'Mes soutenances', icon: <List size={20} /> },
    { name: 'Saisie des notes', icon: <CheckSquare size={20} /> },
    { name: 'Profil', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckSquare className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Espace Jury</h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarItems.map(item => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.name 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={activeTab === item.name ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}>
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full -z-10" />
        
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-10 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{activeTab}</h2>
          <div className="flex items-center gap-4 bg-slate-800/50 p-2 pr-6 rounded-full border border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">
              {user?.nom?.charAt(0) || 'J'}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">{user?.nom || 'Membre Jury'}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-widest uppercase">Membre du Jury</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          {message.text && (
            <div className={`p-4 rounded-2xl mb-8 border animate-fade-in ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'Dashboard' && (
            <div className="space-y-10">
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform">
                   <Award size={200} />
                </div>
                <h3 className="text-4xl font-black text-white mb-6">Bienvenue, {user?.nom}</h3>
                <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-10">
                  Gérez vos évaluations et consultez le planning des soutenances en temps réel. Votre expertise est la clé de la réussite académique de nos étudiants.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Soutenances</p>
                     <p className="text-5xl font-black text-emerald-400">{soutenances.length}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Statut Compte</p>
                     <p className="text-3xl font-black text-white flex items-center gap-2">
                       <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" /> Actif
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Mes soutenances' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="text-2xl font-bold text-white">Planning des Soutenances</h3>
                 <div className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
                    {soutenances.length} Sessions
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] border-b border-slate-800">
                      <th className="px-10 py-6">ID</th>
                      <th className="px-10 py-6">Étudiant</th>
                      <th className="px-10 py-6">Date & Heure</th>
                      <th className="px-10 py-6">Emplacement</th>
                      <th className="px-10 py-6 text-right">Moyenne Gén.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {soutenances.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-10 py-6 font-mono text-xs text-slate-500">#{s.id}</td>
                        <td className="px-10 py-6 font-bold text-white text-lg">{s.etudiant ? s.etudiant.nom : 'N/A'}</td>
                        <td className="px-10 py-6 flex items-center gap-2 text-slate-300">
                           <Calendar size={14} className="text-slate-500" /> {s.date}
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-2 text-slate-300">
                             <MapPin size={14} className="text-slate-500" /> {s.salle ? s.salle.nom : 'N/A'}
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="bg-slate-800 text-emerald-400 px-4 py-1.5 rounded-full font-black text-sm">
                             {moyennes[s.id] ?? "..."}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Saisie des notes' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                <h3 className="text-3xl font-black mb-10 text-white border-b border-slate-800 pb-8">Formulaire d'Évaluation</h3>
                
                <form onSubmit={submitNote} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Soutenance à évaluer</label>
                      <select 
                        required 
                        value={noteForm.soutenanceId} 
                        onChange={(e) => handleSoutenanceChange(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez une session...</option>
                        {soutenances.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.etudiant?.nom} - {s.date} ({s.salle ? s.salle.nom : 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Note Individuelle (0-20)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="20" 
                        step="0.25" 
                        required 
                        value={noteForm.note} 
                        onChange={(e) => handleNoteChange(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-xl"
                        placeholder="15.50"
                      />
                    </div>

                    <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Moyenne & Mention (Auto)</label>
                       <div className="flex gap-4">
                         <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Moy:</span>
                            <span className="font-black text-emerald-400 text-xl">{noteForm.moyenne ? Number(noteForm.moyenne).toFixed(2) : '--'}</span>
                         </div>
                         <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Ment:</span>
                            <span className="font-black text-white text-sm truncate ml-2">{noteForm.mention || '--'}</span>
                         </div>
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Appréciations Détaillées</label>
                      <textarea 
                        required 
                        rows="5" 
                        value={noteForm.commentaire} 
                        onChange={e => setNoteForm({ ...noteForm, commentaire: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-[2rem] px-6 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                        placeholder="Observations sur la présentation, la rigueur scientifique et les réponses aux questions..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-800">
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <CheckSquare size={24} /> Valider l'Évaluation Finale
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'Profil' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl p-12 max-w-3xl mx-auto">
               <div className="flex items-center gap-8 mb-12">
                 <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-emerald-500/20">
                   {user?.nom?.charAt(0) || 'J'}
                 </div>
                 <div>
                   <h3 className="text-3xl font-black text-white">{user?.nom}</h3>
                   <p className="text-emerald-400 font-bold uppercase text-xs tracking-widest mt-1">Habilité Jury Académique</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800 pt-10">
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email de Contact</p>
                   <p className="text-lg font-bold text-white">{user?.email}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rôle Système</p>
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                     <p className="text-lg font-bold text-white">Membre du Jury</p>
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

export default DashboardJury;
