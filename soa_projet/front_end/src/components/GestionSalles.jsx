import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Pencil, Trash2, MapPin, Users, Settings,
         Search, AlertCircle, DoorOpen, Calendar, Clock } from 'lucide-react';
import api from '../api/axios';

const GestionSalles = ({ activeTab, onSallesChange }) => {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [salleForm, setSalleForm] = useState({ nom: '', capacite: '', localisation: '' });

  // Modal affectation soutenance
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [affectSalleId, setAffectSalleId] = useState(null);
  const [soutenancesSansSalle, setSoutenancesSansSalle] = useState([]);
  const [selectedSoutenanceId, setSelectedSoutenanceId] = useState('');

  useEffect(() => {
    fetchSalles();
    setSearchTerm('');
    setFilterType('all');
    setMessage({ text: '', type: '' });
  }, [activeTab]);

  const fetchSalles = async () => {
    try {
      await api.post('/salles/liberer-terminees');
      const res = await api.get('/salles/list');
      setSalles(res.data);
      onSallesChange?.();
    } catch (err) {
      console.error('Erreur chargement salles', err);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const total = salles.length;
  const disponibles = salles.filter(s => s.disponible).length;
  const indisponibles = total - disponibles;

  const filteredSalles = salles.filter(s => {
    const matchesSearch =
      s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.localisation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'disponible' && s.disponible) ||
      (filterType === 'indisponible' && !s.disponible);
    return matchesSearch && matchesFilter;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setSalleForm({ nom: '', capacite: '', localisation: '' });
    setShowModal(true);
  };

  const openEditModal = (salle) => {
    setIsEditing(true);
    setCurrentId(salle.id);
    setSalleForm({
      nom: salle.nom,
      capacite: salle.capacite.toString(),
      localisation: salle.localisation ?? '',
    });
    setShowModal(true);
  };

  // Ouvrir modal affectation soutenance
  const openAffectModal = async (salleId) => {
    setAffectSalleId(salleId);
    setSelectedSoutenanceId('');
    try {
      const res = await api.get('/soutenances/sans-salle');
      setSoutenancesSansSalle(res.data);
    } catch {
      setSoutenancesSansSalle([]);
    }
    setShowAffectModal(true);
  };

  // Confirmer affectation
  const handleAffecterSoutenance = async () => {
    if (!affectSalleId) return;
    setLoading(true);
    try {
      await api.patch(`/salles/${affectSalleId}/affecter-soutenance`, {
        soutenanceId: selectedSoutenanceId ? parseInt(selectedSoutenanceId) : null
      });
      showMessage(selectedSoutenanceId
        ? 'Soutenance affectée à la salle avec succès !'
        : 'Affectation retirée.');
      setShowAffectModal(false);
      fetchSalles();
    } catch (err) {
      showMessage(err.response?.data || "Erreur lors de l'affectation.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salleForm.nom || !salleForm.capacite || !salleForm.localisation) {
      showMessage('Veuillez remplir tous les champs.', 'error');
      return;
    }
    const payload = {
      nom: salleForm.nom,
      capacite: parseInt(salleForm.capacite),
      localisation: salleForm.localisation,
    };
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/salles/update/${currentId}`, payload);
        showMessage('Salle mise à jour avec succès !');
      } else {
        await api.post('/salles/add', payload);
        showMessage('Salle créée avec succès !');
      }
      setShowModal(false);
      fetchSalles();
    } catch (err) {
      showMessage(err.response?.data || 'Erreur serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cette salle ?')) return;
    try {
      await api.delete(`/salles/delete/${id}`);
      showMessage('Salle supprimée avec succès !');
      fetchSalles();
    } catch {
      showMessage('Erreur lors de la suppression.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">

      {/* TOAST */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-[500] flex items-center gap-4 px-8 py-5
          rounded-2xl shadow-2xl text-white font-bold border border-white/10 backdrop-blur-xl ${
          message.type === 'success' ? 'bg-emerald-600/95' : 'bg-rose-600/95'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: total,
            color: 'border-slate-700 text-slate-300', dot: 'bg-slate-500' },
          { label: 'Disponibles', value: disponibles,
            color: 'border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-500' },
          { label: 'Indisponibles', value: indisponibles,
            color: 'border-rose-500/30 text-rose-400', dot: 'bg-rose-500' },
        ].map((s, i) => (
          <div key={i} className={`flex items-center justify-between bg-slate-900
            border ${s.color} rounded-2xl px-8 py-5`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                {s.label}
              </span>
            </div>
            <span className={`text-4xl font-black ${s.color.split(' ')[1]}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* PAGE CRÉER */}
      {activeTab === 'Salle-Créer' && (
        <div
          className="mt-6 border-2 border-dashed border-slate-700 hover:border-violet-500/50
            rounded-[3rem] p-24 text-center transition-all group cursor-pointer"
          onClick={openAddModal}
        >
          <div className="space-y-6">
            <div className="w-20 h-20 bg-slate-800 border border-slate-700
              group-hover:border-violet-500/50 rounded-3xl flex items-center
              justify-center mx-auto transition-all">
              <DoorOpen size={40} className="text-slate-600 group-hover:text-violet-400
                transition-all" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">
                Ajouter une nouvelle salle
              </h2>
              <p className="text-slate-500 text-sm">
                Cliquez pour ouvrir le formulaire de création
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500
              text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all
              shadow-lg shadow-violet-600/20">
              <Plus size={18} /> Nouvelle salle
            </div>
          </div>
        </div>
      )}

      {/* PAGE GÉRER */}
      {activeTab === 'Salle-Gérer' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2
                text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher par nom ou localisation..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4
                  pl-12 pr-5 text-white text-sm font-medium outline-none
                  focus:border-violet-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 bg-slate-900 border border-slate-700 p-1.5 rounded-xl">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'disponible', label: 'Disponibles' },
                { key: 'indisponible', label: 'Indisponibles' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterType === f.key
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
                text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg
                shadow-violet-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> Ajouter une salle
            </button>
          </div>

          {filteredSalles.length === 0 ? (
            <div className="text-center py-24 text-slate-600 italic border border-dashed
              border-slate-800 rounded-3xl">
              Aucune salle trouvée.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSalles.map(salle => (
                <div key={salle.id} className="group bg-slate-900 border border-slate-800
                  hover:border-slate-600 rounded-3xl p-7 flex flex-col gap-5
                  transition-all hover:shadow-xl hover:-translate-y-1">

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20
                        rounded-2xl flex items-center justify-center">
                        <DoorOpen size={22} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg leading-tight">
                          {salle.nom}
                        </p>
                        <p className="text-slate-600 font-mono text-xs">#{salle.id}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full
                      text-[10px] font-black border ${
                      salle.disponible
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        salle.disponible ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                      }`} />
                      {salle.disponible ? 'Disponible' : 'Occupée'}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex flex-col gap-2.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} className="text-violet-400 shrink-0" />
                      <span className="truncate">{salle.localisation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={14} className="text-violet-400 shrink-0" />
                      <span>
                        <span className="text-white font-bold">{salle.capacite}</span> places
                      </span>
                    </div>
                  </div>

                  {/* Barre capacité */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500
                          rounded-full transition-all"
                        style={{ width: `${Math.min((salle.capacite / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium">
                      Capacité : {salle.capacite} / 100 max
                    </p>
                  </div>

                  {/* Soutenance active */}
                  {salle.soutenanceActive && (
                    <div className="flex flex-col gap-1 bg-rose-500/5 border
                      border-rose-500/20 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={13} className="text-rose-400 shrink-0" />
                        <p className="text-rose-400 text-xs font-black uppercase
                          tracking-wider">Soutenance en cours</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs ml-5">
                        <Calendar size={12} className="text-violet-400" />
                        {new Date(salle.soutenanceActive.date)
                          .toLocaleDateString('fr-FR', {
                            weekday: 'short', day: 'numeric', month: 'short'
                          })}
                        <Clock size={12} className="text-violet-400 ml-1" />
                        {new Date(salle.soutenanceActive.date)
                          .toTimeString().substring(0, 5)}
                        {' → '}
                        {new Date(salle.soutenanceActive.dateFin)
                          .toTimeString().substring(0, 5)}
                      </div>
                      {salle.soutenanceActive.etudiantNom && (
                        <p className="text-slate-500 text-xs ml-5">
                          Étudiant : {salle.soutenanceActive.etudiantNom}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    {/* Affecter soutenance — seulement si disponible */}
                    {salle.disponible && (
                      <button
                        onClick={() => openAffectModal(salle.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5
                          bg-violet-600/20 hover:bg-violet-600 text-violet-400
                          hover:text-white border border-violet-500/30 rounded-xl
                          text-xs font-bold transition-all"
                      >
                        <Calendar size={14} /> Affecter
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(salle)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5
                        bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white
                        rounded-xl text-xs font-bold transition-all"
                    >
                      <Pencil size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(salle.id)}
                      disabled={!salle.disponible}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5
                        rounded-xl text-xs font-bold transition-all ${
                        salle.disponible
                          ? 'bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white'
                          : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                      }`}
                      title={!salle.disponible
                        ? 'Impossible de supprimer une salle occupée' : ''}
                    >
                      <Trash2 size={14} />
                      {salle.disponible ? 'Supprimer' : 'Occupée'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL CRÉER / MODIFIER SALLE */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6
          bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md
            rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6
              border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isEditing ? 'Modifier la salle' : 'Nouvelle salle'}
                  </h3>
                  <p className="text-slate-500 text-xs">Remplissez tous les champs requis</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white bg-slate-800
                  hover:bg-slate-700 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {[
                { label: 'Nom de la salle', key: 'nom',
                  type: 'text', placeholder: 'Ex : Salle A101' },
                { label: 'Capacité', key: 'capacite',
                  type: 'number', placeholder: 'Ex : 50' },
                { label: 'Localisation', key: 'localisation',
                  type: 'text', placeholder: 'Ex : Bâtiment A, 1er étage' },
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500
                    uppercase tracking-widest">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required
                    min={field.type === 'number' ? 1 : undefined}
                    placeholder={field.placeholder}
                    value={salleForm[field.key]}
                    onChange={e => setSalleForm({ ...salleForm, [field.key]: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700
                      focus:border-violet-500 rounded-xl px-5 py-3.5 text-white text-sm
                      outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between bg-slate-800/50
                border border-slate-700 rounded-xl px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-white">Disponibilité</p>
                  <p className="text-xs text-slate-500">
                    Calculée automatiquement selon les soutenances affectées
                  </p>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase
                  tracking-widest bg-slate-800 border border-slate-700 px-3 py-1.5
                  rounded-lg">Auto</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300
                    rounded-xl font-bold text-sm transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white
                    rounded-xl font-bold text-sm shadow-lg shadow-violet-600/20
                    transition-all active:scale-95 disabled:opacity-50">
                  {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AFFECTER SOUTENANCE */}
      {showAffectModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6
          bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md
            rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6
              border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Affecter une soutenance
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Soutenances sans salle uniquement
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAffectModal(false)}
                className="p-2 text-slate-500 hover:text-white bg-slate-800
                  hover:bg-slate-700 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              {/* Option aucune */}
              <div
                onClick={() => setSelectedSoutenanceId('')}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer
                  transition-all ${
                  selectedSoutenanceId === ''
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center
                  justify-center">
                  <X size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Aucune soutenance</p>
                  <p className="text-slate-500 text-xs">Retirer l'affectation actuelle</p>
                </div>
                {selectedSoutenanceId === '' &&
                  <Check size={16} className="text-violet-400 ml-auto" />}
              </div>

              {/* Liste soutenances sans salle */}
              {soutenancesSansSalle.length === 0 ? (
                <div className="text-center py-8 text-slate-600 italic text-sm
                  border border-dashed border-slate-800 rounded-2xl">
                  Aucune soutenance sans salle disponible.
                </div>
              ) : (
                soutenancesSansSalle.map(s => {
                  const dt = new Date(s.date);
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSoutenanceId(s.id.toString())}
                      className={`flex items-center gap-4 p-4 rounded-2xl border
                        cursor-pointer transition-all ${
                        selectedSoutenanceId === s.id.toString()
                          ? 'border-violet-500/50 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20
                        rounded-xl flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm capitalize">
                          {dt.toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric', month: 'long'
                          })}
                        </p>
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                          <Clock size={11} />
                          {dt.toTimeString().substring(0, 5)}
                          {' → '}
                          {new Date(dt.getTime() + 30 * 60000)
                            .toTimeString().substring(0, 5)}
                          {s.etudiant && (
                            <span className="ml-2 text-violet-400">
                              · {s.etudiant.nom}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedSoutenanceId === s.id.toString() &&
                        <Check size={16} className="text-violet-400" />}
                    </div>
                  );
                })
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button onClick={() => setShowAffectModal(false)}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300
                    rounded-xl font-bold text-sm transition-all">
                  Annuler
                </button>
                <button
                  onClick={handleAffecterSoutenance}
                  disabled={loading || selectedSoutenanceId === ''}
                  className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white
                    rounded-xl font-bold text-sm shadow-lg shadow-violet-600/20
                    transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionSalles;