import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Pencil, Trash2, Users, GraduationCap, Award, BookOpen } from 'lucide-react';
import api from '../api/axios';

const GestionJury = ({ activeTab }) => {
  const [juries, setJuries] = useState([]);
  const [juryMembers, setJuryMembers] = useState([]);
  const [juryForm, setJuryForm] = useState({ nom: '', presidentId: '', rapporteurId: '', EncadrantId: '' });
  const [editingJuryId, setEditingJuryId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // For 'Jury-Modifier' pop-up
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    fetchJuries();
    fetchJuryMembers();
    // Reset form when switching tabs
    setJuryForm({ nom: '', presidentId: '', rapporteurId: '', EncadrantId: '' });
    setShowEditPopup(false);
    setMessage({ text: '', type: '' });
  }, [activeTab]);

  const fetchJuries = async () => {
    try {
      const res = await api.get('/jury/list');
      setJuries(res.data);
    } catch {
      console.error('Erreur lors du chargement des jurys');
    }
  };

  const fetchJuryMembers = async () => {
    try {
      const res = await api.get('/jury/membres');
      setJuryMembers(res.data);
    } catch {
      console.error('Erreur lors du chargement des membres du jury');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleJurySubmit = async (e) => {
    e.preventDefault();
    if (!juryForm.presidentId || !juryForm.rapporteurId || !juryForm.EncadrantId) {
      showMessage('Veuillez sélectionner tous les rôles', 'error');
      return;
    }
    if (new Set([juryForm.presidentId.toString(), juryForm.rapporteurId.toString(), juryForm.EncadrantId.toString()]).size !== 3) {
      showMessage('Les membres doivent être distincts pour chaque rôle', 'error');
      return;
    }

    const payload = {
      nom: juryForm.nom,
      members: [
        { userId: parseInt(juryForm.presidentId), role: 'Président' },
        { userId: parseInt(juryForm.rapporteurId), role: 'Rapporteur' },
        { userId: parseInt(juryForm.EncadrantId), role: 'Encadrant' }
      ]
    };

    try {
      if (editingJuryId) {
         await api.put(`/jury/update/${editingJuryId}`, payload);
         showMessage('Jury modifié avec succès !');
         setShowEditPopup(false);
         setEditingJuryId(null);
      } else {
         await api.post('/jury/create', payload);
         showMessage('Jury créé avec succès !');
         setJuryForm({ nom: '', presidentId: '', rapporteurId: '', EncadrantId: '' });
      }
      fetchJuries();
    } catch (err) {
      showMessage(err.response?.data || 'Erreur lors de l\'opération.', 'error');
    }
  };

  const openEditJury = (jury) => {
    const president = jury.members?.find(m => m.role === 'Président');
    const rapporteur = jury.members?.find(m => m.role === 'Rapporteur');
    const encadrant = jury.members?.find(m => m.role === 'Encadrant');

    setJuryForm({
       nom: jury.nom,
       presidentId: president ? president.user.id.toString() : '',
       rapporteurId: rapporteur ? rapporteur.user.id.toString() : '',
       EncadrantId: encadrant ? encadrant.user.id.toString() : ''
    });
    setEditingJuryId(jury.id);
    setShowEditPopup(true);
  };

  const handleDeleteJury = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce jury ?')) return;
    try {
      await api.delete(`/jury/delete/${id}`);
      showMessage('Jury supprimé avec succès !');
      fetchJuries();
    } catch (err) {
      showMessage('Erreur lors de la suppression.', 'error');
    }
  };

  const renderForm = (isEdit = false) => (
    <form onSubmit={handleJurySubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom du jury</label>
        <input
          type="text"
          required
          placeholder="Ex : Jury Informatique 2026"
          value={juryForm.nom}
          onChange={e => setJuryForm({ ...juryForm, nom: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Président</label>
          <select
            required
            value={juryForm.presidentId}
            onChange={e => setJuryForm({ ...juryForm, presidentId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            {juryMembers
              .filter(m => 
                m.id.toString() === juryForm.presidentId.toString() || 
                (m.id.toString() !== juryForm.rapporteurId.toString() && m.id.toString() !== juryForm.EncadrantId.toString())
              )
              .map(m => (
                <option key={`pres-${m.id}`} value={m.id}>{m.nom} ({m.email})</option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rapporteur</label>
          <select
            required
            value={juryForm.rapporteurId}
            onChange={e => setJuryForm({ ...juryForm, rapporteurId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            {juryMembers
              .filter(m => 
                m.id.toString() === juryForm.rapporteurId.toString() || 
                (m.id.toString() !== juryForm.presidentId.toString() && m.id.toString() !== juryForm.EncadrantId.toString())
              )
              .map(m => (
                <option key={`rap-${m.id}`} value={m.id}>{m.nom} ({m.email})</option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Encadrant</label>
          <select
            required
            value={juryForm.EncadrantId}
            onChange={e => setJuryForm({ ...juryForm, EncadrantId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            {juryMembers
              .filter(m => 
                m.id.toString() === juryForm.EncadrantId.toString() || 
                (m.id.toString() !== juryForm.presidentId.toString() && m.id.toString() !== juryForm.rapporteurId.toString())
              )
              .map(m => (
                <option key={`ex-${m.id}`} value={m.id}>{m.nom} ({m.email})</option>
              ))}
          </select>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-800 flex gap-4">
        <button
          type="submit"
          className="flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 text-white px-10 py-4 rounded-[2rem] font-bold shadow-xl shadow-violet-600/20 transition-all active:scale-95 flex-1 md:flex-none"
        >
          <Check size={20} /> {isEdit ? 'Mettre à jour le jury' : 'Finaliser la création'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => setShowEditPopup(false)}
            className="bg-slate-800 text-slate-300 px-10 py-4 rounded-[2rem] font-bold hover:bg-slate-700 transition-all"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className="animate-fade-in">
      {message.text && (
        <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border animate-fade-in ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <Check size={18} />
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      {activeTab === 'Jury-Créer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl">
              <Plus size={24} />
            </div>
            <h4 className="text-2xl font-black text-white">Nouveau Jury Académique</h4>
          </div>
          {renderForm(false)}
        </div>
      )}

      {(activeTab === 'Jury-Afficher' || activeTab === 'Jury-Modifier') && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-slate-800 flex justify-between items-center">
             <div>
               <h3 className="text-2xl font-black text-white">
                 {activeTab === 'Jury-Modifier' ? 'Configuration des Jurys' : 'Répertoire des Jurys'}
               </h3>
               <p className="text-slate-500 text-sm mt-1 font-medium">Supervision des commissions d'évaluation</p>
             </div>
             <div className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
                {juries.length} Jurys actifs
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] border-b border-slate-800">
                  <th className="px-10 py-6">ID</th>
                  <th className="px-10 py-6">Nom du Jury</th>
                  <th className="px-10 py-6">Composition de la Commission</th>
                  {activeTab === 'Jury-Modifier' && (
                    <th className="px-10 py-6 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {juries.map((jury) => (
                  <tr key={jury.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-10 py-6 font-mono text-xs text-slate-500">#{jury.id}</td>
                    <td className="px-10 py-6 font-bold text-white text-lg">{jury.nom}</td>
                    <td className="px-10 py-6">
                      <div className="flex flex-wrap gap-3">
                        {jury.members && jury.members.map((jm, i) => (
                          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{jm.role}</span>
                            <span className="text-sm font-bold text-slate-200">{jm.user?.nom}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    {activeTab === 'Jury-Modifier' && (
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditJury(jury)}
                            className="p-2.5 bg-slate-800 text-violet-400 hover:bg-violet-600 hover:text-white rounded-xl transition-all shadow-lg"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteJury(jury.id)}
                            className="p-2.5 bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {juries.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'Jury-Modifier' ? "4" : "3"} className="px-10 py-20 text-center text-slate-600 italic">
                      Aucun jury enregistré dans le système.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEditPopup && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 transition-all">
           <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-12 relative animate-fade-in">
              <button 
                onClick={() => setShowEditPopup(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white bg-slate-800 p-3 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-violet-500/10 text-violet-400 rounded-2xl shadow-inner">
                  <Settings size={32} />
                </div>
                <div>
                   <h4 className="text-3xl font-black text-white">Édition du Jury</h4>
                   <p className="text-slate-500 font-medium">Mise à jour des membres et rôles</p>
                </div>
              </div>
              {renderForm(true)}
           </div>
        </div>
      )}
    </div>
  );
};

export default GestionJury;
