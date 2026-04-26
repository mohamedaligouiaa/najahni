import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Calendar, Clock, Trash2, Plus, AlertCircle, Check, 
  Search, Layers, Edit3, X, MapPin, Users,
  Settings, Pencil
} from 'lucide-react';

const GestionCreneaux = ({ activeTab, globalSearch }) => {
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [dateForm, setDateForm] = useState({ date: '', time: '09:00' });
  const [localSearch, setLocalSearch] = useState("");
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { 
    fetchData(); 
    setLocalSearch("");
    setMessage({ text: '', type: '' });
  }, [activeTab]);
  
  const fetchData = async () => {
    try {
      const res = await api.get('/creneaux');
      setSoutenances(res.data);
    } catch (err) { console.error("Erreur chargement créneaux", err); }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setDateForm({ date: '', time: '09:00' });
    setShowModal(true);
  };

  const openEditModal = (slot) => {
    setIsEditing(true);
    setCurrentId(slot.id);
    const d = new Date(slot.date);
    setDateForm({
      date: d.toISOString().split('T')[0],
      time: d.toTimeString().slice(0, 5)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateForm.date || !dateForm.time) {
        showMessage('Veuillez remplir tous les champs.', 'error');
        return;
    }
    setLoading(true);
    try {
        const dateTime = `${dateForm.date}T${dateForm.time}:00`;
        const payload = { date: dateTime };
        if (isEditing) {
            await api.put(`/creneaux/${currentId}`, payload);
            showMessage('Créneau mis à jour avec succès !');
        } else {
            await api.post('/creneaux', payload);
            showMessage('Créneau créé avec succès !');
        }
        setShowModal(false);
        fetchData();
    } catch (err) { 
        showMessage(err.response?.data || 'Erreur serveur.', 'error'); 
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce créneau ?')) return;
    try { 
      await api.delete(`/creneaux/${id}`); 
      showMessage('Créneau supprimé avec succès !');
      fetchData(); 
    } catch { 
      showMessage('Erreur lors de la suppression.', 'error'); 
    }
  };

  const filtered = soutenances.filter(s => {
    const d = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const search = (localSearch || globalSearch || "").toLowerCase();
    return d.toLowerCase().includes(search) || 
           new Date(s.date).toLocaleTimeString('fr-FR').includes(search);
  });

  const total = soutenances.length;
  const occupes = soutenances.filter(s => s.soutenance).length;
  const libres = total - occupes;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* TOAST (Style Salles) */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-[500] flex items-center gap-4 px-8 py-5
          rounded-2xl shadow-2xl text-white font-bold border border-white/10 backdrop-blur-xl ${
          message.type === 'success' ? 'bg-emerald-600/95' : 'bg-rose-600/95'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* STATS (Structure Salles) */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Créneaux', value: total, color: 'border-slate-700 text-slate-300', dot: 'bg-slate-500' },
          { label: 'Réservés', value: occupes, color: 'border-rose-500/30 text-rose-400', dot: 'bg-rose-500' },
          { label: 'Disponibles', value: libres, color: 'border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-500' },
        ].map((s, i) => (
          <div key={i} className={`flex items-center justify-between bg-slate-900 border ${s.color} rounded-2xl px-8 py-5`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">{s.label}</span>
            </div>
            <span className={`text-4xl font-black ${s.color.split(' ')[1]}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* PAGE CRÉER (Style Salles) */}
      {activeTab === 'Creneau-Ajouter' && (
        <div
          className="mt-6 border-2 border-dashed border-slate-700 hover:border-violet-500/50
            rounded-[3rem] p-24 text-center transition-all group cursor-pointer"
          onClick={openAddModal}
        >
          <div className="space-y-6">
            <div className="w-20 h-20 bg-slate-800 border border-slate-700
              group-hover:border-violet-500/50 rounded-3xl flex items-center
              justify-center mx-auto transition-all">
              <Calendar size={40} className="text-slate-600 group-hover:text-violet-400 transition-all" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Ajouter un nouveau créneau</h2>
              <p className="text-slate-500 text-sm">Cliquez pour ouvrir le formulaire de planification</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500
              text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/20">
              <Plus size={18} /> Nouveau créneau
            </div>
          </div>
        </div>
      )}

      {/* PAGE GÉRER (Style Salles) */}
      {activeTab === 'Creneau-Gerer' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher par date ou heure..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4
                  pl-12 pr-5 text-white text-sm font-medium outline-none focus:border-violet-500 transition-all"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
                text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg
                shadow-violet-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> Ajouter un créneau
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-600 italic border border-dashed border-slate-800 rounded-3xl">
              Aucun créneau trouvé.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(slot => (
                <div key={slot.id} className="group bg-slate-900 border border-slate-800
                  hover:border-slate-600 rounded-3xl p-7 flex flex-col gap-5
                  transition-all hover:shadow-xl hover:-translate-y-1">
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center">
                        <Clock size={22} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg leading-tight">
                          {new Date(slot.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-slate-600 font-mono text-xs">#{slot.id}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${
                      slot.soutenance 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${slot.soutenance ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {slot.soutenance ? 'Occupé' : 'Libre'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} className="text-violet-400 shrink-0" />
                      <span>{new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5
                        bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white
                        rounded-xl text-xs font-bold transition-all"
                    >
                      <Pencil size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5
                        bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white
                        rounded-xl text-xs font-bold transition-all"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL (Style Salles) */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl"><Settings size={20} /></div>
                <div>
                  <h3 className="text-lg font-black text-white">{isEditing ? 'Modifier créneau' : 'Nouveau créneau'}</h3>
                  <p className="text-slate-500 text-xs">Planification d'une plage horaire</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                <input type="date" required value={dateForm.date} onChange={e => setDateForm({ ...dateForm, date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-xl px-5 py-3.5 text-white text-sm outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Heure</label>
                <input type="time" required value={dateForm.time} onChange={e => setDateForm({ ...dateForm, time: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-800 focus:border-violet-500 rounded-xl px-5 py-3.5 text-white text-sm outline-none transition-all" />
              </div>
              {message.text && message.type === 'error' && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 animate-shake">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold">{message.text}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-600/20 transition-all">
                  {loading ? '...' : isEditing ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCreneaux;
