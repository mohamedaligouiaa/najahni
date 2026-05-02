import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, User, Users, DoorOpen, X, Check } from 'lucide-react';
import api from '../api/axios';

const GestionSoutenances = ({ activeTab }) => {
  const [soutenances, setSoutenances] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Listes déroulantes
  const [etudiants, setEtudiants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [jurys, setJurys] = useState([]);
  const [creneaux, setCreneaux] = useState([]);

  const [formData, setFormData] = useState({
    etudiantId: '',
    salleId: '',
    juryId: '',
    date: '' // sera remplie par le créneau sélectionné
  });

  useEffect(() => {
    fetchSoutenances();
    fetchEtudiants();
    fetchSalles();
    fetchJurys();
    fetchCreneaux();
  }, []);

  const fetchSoutenances = async () => {
    try {
      const res = await api.get('/soutenances');
      setSoutenances(res.data);
    } catch (err) {
      showMessage('Erreur lors du chargement des soutenances', 'error');
    }
  };

  const fetchEtudiants = async () => {
    try {
      const res = await api.get('/users/etudiants');
      setEtudiants(res.data);
    } catch { console.error('Impossible de charger les étudiants'); }
  };

  const fetchSalles = async () => {
    try {
      const res = await api.get('/salles/list');
      setSalles(res.data);
    } catch { console.error('Impossible de charger les salles'); }
  };

  const fetchJurys = async () => {
    try {
      const res = await api.get('/jury/list');
      setJurys(res.data);
    } catch { console.error('Impossible de charger les jurys'); }
  };

  const fetchCreneaux = async () => {
    try {
      const res = await api.get('/creneaux');
      setCreneaux(res.data);
    } catch { console.error('Impossible de charger les créneaux'); }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ etudiantId: '', salleId: '', juryId: '', date: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingId(s.id);
    setFormData({
      etudiantId: s.etudiantId ? String(s.etudiantId) : '',
      salleId: s.salleId ? String(s.salleId) : '',
      juryId: s.juryId ? String(s.juryId) : '',
      date: s.date ? s.date.slice(0, 16) : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        etudiantId: parseInt(formData.etudiantId),
        // encadrantId est auto-rempli côté backend depuis le jury
        encadrantId: null,
        salleId: parseInt(formData.salleId),
        juryId: parseInt(formData.juryId),
        date: formData.date || null
      };

      if (editingId) {
        await api.put(`/soutenances/${editingId}`, payload);
        showMessage('Soutenance modifiée avec succès', 'success');
      } else {
        await api.post('/soutenances', payload);
        showMessage('Soutenance créée avec succès', 'success');
      }
      setIsModalOpen(false);
      fetchSoutenances();
    } catch (err) {
      showMessage(err.response?.data || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette soutenance ?')) {
      try {
        await api.delete(`/soutenances/${id}`);
        showMessage('Soutenance supprimée', 'success');
        fetchSoutenances();
      } catch (err) {
        showMessage('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Helpers pour afficher les noms dans le tableau
  const getEtudiantNom = (id) => {
    const e = etudiants.find(e => e.id === id);
    return e ? e.nom : `Étudiant #${id}`;
  };
  const getSalleNom = (id) => {
    const s = salles.find(s => s.id === id);
    return s ? s.nom : `Salle #${id}`;
  };
  const getJuryNom = (id) => {
    const j = jurys.find(j => j.id === id);
    return j ? j.nom : `Jury #${id}`;
  };
  // L'encadrant vient du jury — on le cherche dans les membres
  const getEncadrantFromJury = (juryId) => {
    const j = jurys.find(j => j.id === juryId);
    if (!j || !j.members) return null;
    const enc = j.members.find(m => m.role === 'Encadrant');
    return enc?.user?.nom || null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non défini';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const selectClass = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h3 className="text-2xl font-black text-white">Gestion des Soutenances</h3>
          <p className="text-slate-500 text-sm mt-1">Planifiez et gérez les soutenances des étudiants</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
        >
          <Plus size={18} />
          Nouvelle Soutenance
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      {/* Liste des soutenances */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-800">Créneau</th>
                <th className="p-4 font-bold border-b border-slate-800">Étudiant</th>
                <th className="p-4 font-bold border-b border-slate-800">Salle</th>
                <th className="p-4 font-bold border-b border-slate-800">Jury</th>
                <th className="p-4 font-bold border-b border-slate-800">Encadrant</th>
                <th className="p-4 font-bold border-b border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {soutenances.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-violet-400" />
                      {formatDate(s.date)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-emerald-400" />
                      {s.etudiantId ? getEtudiantNom(s.etudiantId) : <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <DoorOpen size={16} className="text-rose-400" />
                      {s.salleId ? getSalleNom(s.salleId) : <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-blue-400" />
                      {s.juryId ? getJuryNom(s.juryId) : <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-amber-400" />
                      {s.juryId ? (getEncadrantFromJury(s.juryId) || <span className="text-slate-600">—</span>) : <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(s)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {soutenances.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">
                    Aucune soutenance n'a été trouvée. Créez-en une nouvelle !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h4 className="text-lg font-black text-white">
                {editingId ? 'Modifier la soutenance' : 'Nouvelle soutenance'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Créneau (Date/Heure) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} className="text-violet-400" /> Créneau (Date & Heure) *
                </label>
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className={selectClass}
                  >
                    <option value="">-- Choisir un créneau --</option>
                    {creneaux
                      .filter(c => !soutenances.some(s => s.date === c.date) || c.date === formData.date)
                      .map(c => (
                        <option key={c.id} value={c.date}>
                          {formatDate(c.date)}
                        </option>
                      ))}
                  </select>
                {creneaux.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">⚠ Aucun créneau disponible. Créez-en d'abord dans "Gestion des Créneaux".</p>
                )}
              </div>

              {/* Étudiant */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-emerald-400" /> Étudiant *
                </label>
                <select
                  name="etudiantId"
                  value={formData.etudiantId}
                  onChange={handleInputChange}
                  required
                  className={selectClass}
                >
                  <option value="">-- Choisir un étudiant --</option>
                  {etudiants.map(e => (
                    <option key={e.id} value={e.id}>{e.nom} — {e.email}</option>
                  ))}
                </select>
                {etudiants.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">⚠ Aucun étudiant inscrit.</p>
                )}
              </div>

              {/* Salle & Jury */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DoorOpen size={12} className="text-rose-400" /> Salle *
                  </label>
                  <select
                    name="salleId"
                    value={formData.salleId}
                    onChange={handleInputChange}
                    required
                    className={selectClass}
                  >
                    <option value="">-- Choisir --</option>
                    {salles.map(s => (
                      <option key={s.id} value={s.id}>{s.nom} — {s.localisation || 'N/A'}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={12} className="text-blue-400" /> Jury *
                  </label>
                  <select
                    name="juryId"
                    value={formData.juryId}
                    onChange={handleInputChange}
                    required
                    className={selectClass}
                  >
                    <option value="">-- Choisir --</option>
                    {jurys.map(j => (
                      <option key={j.id} value={j.id}>{j.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Info encadrant (auto-rempli) */}
              {formData.juryId && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Encadrant (automatique depuis le jury)</p>
                  <p className="text-sm font-semibold text-amber-400">
                    {getEncadrantFromJury(parseInt(formData.juryId)) || 'Aucun encadrant défini dans ce jury'}
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
                >
                  {editingId ? 'Modifier' : 'Créer la soutenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionSoutenances;
