import React, { useState, useEffect } from 'react';
import { Calendar, Check, AlertCircle, Save, Clock, Trash2, Plus, X, Pencil, Search, Filter, Layers, Zap } from 'lucide-react';
import api from '../api/axios';

const GestionCreneaux = ({ activeTab, globalSearch, setGlobalSearch }) => {
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Le searchTerm est maintenant synchronisé avec le Dashboard global
  const searchTerm = globalSearch || '';
  const setSearchTerm = setGlobalSearch;
  const [filterType, setFilterType] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [dateForm, setDateForm] = useState({ date: '', time: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const res = await api.get('/soutenances');
      setSoutenances(res.data);
    } catch (err) {
      console.error("Erreur chargement", err);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const total = soutenances.length;
  const occupees = soutenances.filter(s => s.etudiant).length;
  const libres = total - occupees;

  const filteredSoutenances = soutenances.filter(s => {
    const dt = new Date(s.date);
    const dateLabel = dt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
    const matchesSearch = dateLabel.includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || (filterType === 'occupe' && s.etudiant) || (filterType === 'libre' && !s.etudiant);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [year, month, day] = dateForm.date.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (checkDate < today) { showMessage("Erreur : La date est déjà passée.", "error"); return; }
    if (checkDate.getDay() === 0) { showMessage("Erreur : Dimanche interdit.", "error"); return; }

    const [h, m] = dateForm.time.split(':').map(Number);
    if (h < 9) { showMessage("Erreur : Début min 09:00.", "error"); return; }
    if (h > 15 || (h === 15 && m > 30)) { showMessage("Erreur : Fin max 16:00.", "error"); return; }

    const newStart = new Date(`${dateForm.date}T${dateForm.time}`);
    const newEnd = new Date(newStart.getTime() + 30 * 60000);
    const hasCollision = soutenances.find(s => {
        if (!s.date || (isEditing && s.id === currentId)) return false;
        const sStart = new Date(s.date);
        const sEnd = new Date(sStart.getTime() + 30 * 60000);
        return newStart < sEnd && sStart < newEnd;
    });

    if (hasCollision) {
        let suggestedTime = null;
        let searchTime = new Date(`${dateForm.date}T09:00`);
        const maxSearch = new Date(`${dateForm.date}T15:30`);
        while (searchTime <= maxSearch) {
            const timeStr = `${searchTime.getHours().toString().padStart(2, '0')}:${searchTime.getMinutes().toString().padStart(2, '0')}`;
            const cS = new Date(`${dateForm.date}T${timeStr}`);
            const cE = new Date(cS.getTime() + 30 * 60000);
            const isColliding = soutenances.find(s => {
                if (!s.date || (isEditing && s.id === currentId)) return false;
                const sS = new Date(s.date); const sE = new Date(sS.getTime() + 30 * 60000);
                return cS < sE && sS < cE;
            });
            if (!isColliding) { suggestedTime = timeStr; break; }
            searchTime.setMinutes(searchTime.getMinutes() + 30);
        }
        showMessage(`Déjà pris. Suggestion : ${suggestedTime || 'Aucun'}`, "error"); return;
    }

    setLoading(true);
    try {
        const dateTime = `${dateForm.date}T${dateForm.time}:00`;
        const payload = { date: dateTime };
        if (isEditing) {
            const s = soutenances.find(item => item.id === currentId);
            await api.put(`/soutenances/${currentId}`, { ...payload, salle: s.salle, etudiantId: s.etudiant?.id || null, juryId: s.jury?.id || null });
            showMessage("Mise à jour réussie !");
        } else {
            await api.post('/soutenances', payload);
            showMessage("Créneau enregistré !");
        }
        setShowModal(false); fetchData();
    } catch (err) { showMessage("Erreur serveur", "error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    try { await api.delete(`/soutenances/${id}`); showMessage("Supprimé."); fetchData(); } 
    catch (err) { showMessage("Erreur", "error"); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 relative">
      {/* GLOW DECORATIONS */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none" />

      {message.text && (
        <div className={`fixed top-12 right-12 z-[500] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 text-white font-black animate-bounce-in backdrop-blur-xl border border-white/10 ${
          message.type === 'success' ? 'bg-emerald-600/90' : 'bg-rose-600/90'
        }`}>
          {message.type === 'success' ? <Check size={24} strokeWidth={3} /> : <AlertCircle size={24} strokeWidth={3} />}
          <span className="tracking-tight">{message.text}</span>
        </div>
      )}

      {/* --- DASHBOARD STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'CALENDRIER GLOBAL', value: total, icon: Layers, color: 'violet' },
            { label: 'PLACES DISPONIBLES', value: libres, icon: Zap, color: 'emerald' },
            { label: 'SOUTENANCES FIXÉES', value: occupees, icon: Clock, color: 'rose' }
          ].map((kpi, idx) => (
            <div key={idx} className="group relative bg-slate-900/50 backdrop-blur-md border border-white/5 p-10 rounded-[2.5rem] shadow-2xl transition-all hover:border-white/20 hover:-translate-y-2">
                <div className={`absolute top-0 right-0 p-8 text-${kpi.color}-500/20 group-hover:scale-125 transition-all`}>
                    <kpi.icon size={100} strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                    <span className="text-slate-500 font-black text-[10px] tracking-[.3em] uppercase mb-4">{kpi.label}</span>
                    <h4 className={`text-6xl font-black italic text-white`}>
                        {kpi.value}
                    </h4>
                </div>
                <div className={`absolute bottom-0 left-0 w-32 h-1 bg-${kpi.color}-500 rounded-full translate-y-1 opacity-0 group-hover:opacity-100 transition-all`} />
            </div>
          ))}
      </div>

      {activeTab === 'Creneau-Ajouter' && (
        <div className="relative group bg-slate-900/40 backdrop-blur-lg border border-white/5 rounded-[4rem] p-32 text-center overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-emerald-600/10 opacity-30" />
             <div className="relative z-10 space-y-10">
                <div className="w-32 h-32 bg-slate-800 text-violet-400 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl group-hover:rotate-12 transition-all duration-500">
                    <Plus size={64} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Planifier un temps</h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">Initialisez une nouvelle plage horaire pour vos sessions de soutenances.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(false); setDateForm({date:'', time:''}); setShowModal(true); }}
                    className="group relative px-16 py-7 bg-white text-black font-black rounded-3xl transition-all shadow-2xl hover:scale-105 active:scale-95 uppercase tracking-widest text-sm overflow-hidden"
                >
                    <span className="relative z-10">Ouvrir le formulaire</span>
                    <div className="absolute inset-0 bg-violet-400 translate-y-full group-hover:translate-y-0 transition-all" />
                </button>
             </div>
        </div>
      )}

      {activeTab === 'Creneau-Gerer' && (
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 relative w-full">
                  <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" placeholder="Recherche dynamique (date, jour, mois)..."
                    className="w-full bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-white font-bold outline-none focus:border-violet-500/50 transition-all shadow-inner"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="flex gap-3 bg-slate-900/80 p-2 rounded-[1.8rem] border border-white/5 shadow-2xl">
                  {['all', 'libre', 'occupe'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setFilterType(t)} 
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${
                            filterType === t ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'
                        } uppercase`}
                    >
                        {t === 'all' ? 'TOUS' : t === 'libre' ? 'LIBRES' : 'OCCUPÉS'}
                    </button>
                  ))}
              </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] border-b border-white/5">
                  <th className="px-12 py-8">Statut</th>
                  <th className="px-12 py-8 text-white/50">Details de la séance</th>
                  <th className="px-12 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSoutenances.map(s => {
                    const dt = new Date(s.date);
                    return (
                        <tr key={s.id} className="group hover:bg-white/[0.02] transition-all">
                            <td className="px-12 py-10">
                                <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border ${
                                    s.etudiant ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${s.etudiant ? 'bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className="text-[10px] font-black tracking-tighter uppercase">{s.etudiant ? 'Réservé' : 'Disponible'}</span>
                                </div>
                            </td>
                            <td className="px-12 py-10">
                                <div className="space-y-1">
                                    <p className="text-xl font-black text-white italic tracking-tight capitalize">
                                        {dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                    <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                                        <span className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg">
                                            <Clock size={14} className="text-violet-400" />
                                            {dt.toTimeString().substring(0, 5)}
                                        </span>
                                        <span className="text-xs uppercase tracking-widest">{dt.getFullYear()}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-12 py-10 text-right">
                                <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => { setIsEditing(true); setCurrentId(s.id); setDateForm({date: s.date.split('T')[0], time: s.date.split('T')[1].substring(0,5)}); setShowModal(true); }} className="p-4 bg-white/5 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-2xl transition-all shadow-xl">
                                        <Pencil size={18} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="p-4 bg-white/5 hover:bg-rose-600 text-rose-400 hover:text-white rounded-2xl transition-all shadow-xl">
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DESIGNER */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[4rem] p-16 shadow-[0_0_100px_rgba(139,92,246,0.15)] relative scale-100 animate-bounce-in overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] -mr-32 -mt-32" />
                <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all"><X size={28} /></button>
                
                <div className="relative z-10 mb-12 text-center space-y-2">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{isEditing ? "Réglages Créneau" : "Nouveau Créneau"}</h3>
                    <p className="text-slate-500 font-medium">Administration du temps de soutenance</p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                    <div className="space-y-8">
                        <div className="group space-y-3">
                            <label className="text-[10px] font-black text-slate-600 group-hover:text-violet-400 uppercase tracking-[0.3em] ml-2 transition-all">Calendrier</label>
                            <input type="date" required className="w-full bg-slate-800/80 border-2 border-white/5 rounded-3xl p-6 text-white text-xl focus:border-violet-500/50 hover:border-white/20 outline-none transition-all" value={dateForm.date} onChange={e => setDateForm({...dateForm, date: e.target.value})} />
                        </div>
                        <div className="group space-y-3">
                            <label className="text-[10px] font-black text-slate-600 group-hover:text-violet-400 uppercase tracking-[0.3em] ml-2 transition-all">Heure Exacte</label>
                            <input type="time" required className="w-full bg-slate-800/80 border-2 border-white/5 rounded-3xl p-6 text-white text-xl focus:border-violet-500/50 hover:border-white/20 outline-none transition-all" value={dateForm.time} onChange={e => setDateForm({...dateForm, time: e.target.value})} />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-7 rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] italic text-sm">
                        {loading ? 'Traitement...' : 'Enregistrer les modifications'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default GestionCreneaux;
