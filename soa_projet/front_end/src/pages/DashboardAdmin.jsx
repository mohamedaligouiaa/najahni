import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, DoorOpen, LogOut, User, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../api/axios';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState(null);
  const [salles, setSalles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [salleForm, setSalleForm] = useState({ nom: '', capacite: '', localisation: '', disponible: true });

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
      const res = await api.get('/admin/salles');
      setSalles(res.data);
    } catch {
      console.error('Erreur lors du chargement des salles');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const openAddForm = () => {
    setEditingSalle(null);
    setSalleForm({ nom: '', capacite: '', localisation: '', disponible: true });
    setShowForm(true);
  };

  const openEditForm = (salle) => {
    setEditingSalle(salle);
    setSalleForm({
      nom: salle.nom,
      capacite: salle.capacite,
      localisation: salle.localisation,
      disponible: salle.disponible,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSalle) {
        await api.put(`/admin/salles/${editingSalle.id}`, salleForm);
        showMessage('Salle modifiée avec succès !');
      } else {
        await api.post('/admin/salles', salleForm);
        showMessage('Salle ajoutée avec succès !');
      }
      setShowForm(false);
      fetchSalles();
    } catch {
      showMessage('Erreur lors de l\'opération.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cette salle ?')) return;
    try {
      await api.delete(`/admin/salles/${id}`);
      showMessage('Salle supprimée.');
      fetchSalles();
    } catch {
      showMessage('Erreur lors de la suppression.', 'error');
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Gestion des Salles', icon: <DoorOpen size={20} /> },
    { name: 'Profil', icon: <User size={20} /> },
  ];

  const sallesDisponibles = salles.filter(s => s.disponible).length;
  const sallesOccupees = salles.filter(s => !s.disponible).length;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r shadow-xl flex flex-col text-slate-300">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            Espace Admin
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${
                activeTab === item.name
                  ? 'bg-slate-800 border-r-4 border-violet-400 text-white font-semibold'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 font-medium transition"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-800">{activeTab}</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold uppercase shadow-inner">
              {user?.nom?.charAt(0) || 'A'}
            </div>
            <span className="font-medium text-gray-700">{user?.nom || 'Administrateur'}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">

          {/* ───── DASHBOARD ───── */}
          {activeTab === 'Dashboard' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">Bienvenue, {user?.nom}</h3>
              <p className="text-slate-600 text-lg mb-8">
                Gérez les salles de soutenance, leur disponibilité et leurs informations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                  <h4 className="text-lg font-bold opacity-90">Total des salles</h4>
                  <p className="text-4xl font-extrabold mt-2">{salles.length}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
                  <h4 className="text-lg font-bold opacity-90">Salles disponibles</h4>
                  <p className="text-4xl font-extrabold mt-2">{sallesDisponibles}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white">
                  <h4 className="text-lg font-bold opacity-90">Salles occupées</h4>
                  <p className="text-4xl font-extrabold mt-2">{sallesOccupees}</p>
                </div>
              </div>
            </div>
          )}

          {/* ───── GESTION DES SALLES ───── */}
          {activeTab === 'Gestion des Salles' && (
            <div>
              {/* Message feedback */}
              {message.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Header + bouton Ajouter */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Liste des salles</h3>
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:opacity-90 transition"
                >
                  <Plus size={18} /> Ajouter une salle
                </button>
              </div>

              {/* Formulaire Ajout / Édition */}
              {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6 max-w-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-slate-800">
                      {editingSalle ? 'Modifier la salle' : 'Nouvelle salle'}
                    </h4>
                    <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la salle</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : Salle B204"
                        value={salleForm.nom}
                        onChange={e => setSalleForm({ ...salleForm, nom: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Capacité (personnes)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Ex : 30"
                        value={salleForm.capacite}
                        onChange={e => setSalleForm({ ...salleForm, capacite: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Localisation</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : Bâtiment B, 2ème étage"
                        value={salleForm.localisation}
                        onChange={e => setSalleForm({ ...salleForm, localisation: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="disponible"
                        checked={salleForm.disponible}
                        onChange={e => setSalleForm({ ...salleForm, disponible: e.target.checked })}
                        className="w-5 h-5 accent-violet-500 cursor-pointer"
                      />
                      <label htmlFor="disponible" className="text-sm font-semibold text-slate-700 cursor-pointer">
                        Salle disponible
                      </label>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:opacity-90 transition"
                      >
                        <Check size={18} /> {editingSalle ? 'Enregistrer les modifications' : 'Ajouter la salle'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-3 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tableau des salles */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider border-b">
                        <th className="px-8 py-4">ID</th>
                        <th className="px-8 py-4">Nom</th>
                        <th className="px-8 py-4">Capacité</th>
                        <th className="px-8 py-4">Localisation</th>
                        <th className="px-8 py-4">Statut</th>
                        <th className="px-8 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {salles.map((salle) => (
                        <tr key={salle.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-4 font-mono text-slate-500">#{salle.id}</td>
                          <td className="px-8 py-4 font-semibold text-slate-800">{salle.nom}</td>
                          <td className="px-8 py-4 text-slate-600">{salle.capacite} pers.</td>
                          <td className="px-8 py-4 text-slate-600">{salle.localisation}</td>
                          <td className="px-8 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              salle.disponible
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {salle.disponible ? 'Disponible' : 'Occupée'}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditForm(salle)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition"
                              >
                                <Pencil size={13} /> Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(salle.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                              >
                                <Trash2 size={13} /> Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {salles.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-8 py-10 text-center text-slate-400">
                            Aucune salle enregistrée. Cliquez sur "Ajouter une salle" pour commencer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ───── PROFIL ───── */}
          {activeTab === 'Profil' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl">
              <h3 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">Vos informations</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="font-medium text-slate-500">Nom complet</span>
                  <span className="font-semibold text-slate-800">{user?.nom}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="font-medium text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-slate-500">Rôle d'accès</span>
                  <span className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {user?.role}
                  </span>
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
