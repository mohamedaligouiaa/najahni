import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, CheckSquare, List } from 'lucide-react';
import api from '../api/axios';

const DashboardJury = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [soutenances, setSoutenances] = useState([]);
  const [user, setUser] = useState(null);
  const [noteForm, setNoteForm] = useState({ soutenanceId: '', note: '', commentaire: '', moyenne: 0, mention: '' });
  const [message, setMessage] = useState('');
  

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      navigate('/login');
    }
  };
  useEffect(() => {
    fetchUser();
    fetchSoutenances();
  }, []);
  const calculateMoyenne = (notes, newNote, currentUserId) => {
    // Exclure la note existante du jury courant pour éviter le double comptage
    const otherNotes = notes.filter(n => n.jury?.membre?.id !== currentUserId);

    if (!newNote && otherNotes.length === 0) return 0;

    const allNotes = newNote
      ? [...otherNotes.map(n => n.note), Number(newNote)]
      : otherNotes.map(n => n.note);

    if (allNotes.length === 0) return 0;

    const sum = allNotes.reduce((acc, n) => acc + n, 0);
    return sum / allNotes.length;
  };


  const mention = (moyenne) => {
    if (!moyenne) return '';

    if (moyenne < 10) return 'redoublant';
    else if (moyenne >= 10 && moyenne < 12) return 'passable';
    else if (moyenne >= 12 && moyenne < 14) return 'assez bien';
    else if (moyenne >= 14 && moyenne < 16) return 'bien';
    else if (moyenne >= 16 && moyenne < 18) return 'très bien';
    else if (moyenne >= 18 && moyenne <= 20) return 'excellent';
    else return 'moyenne invalide';



  };

  const [moyennes, setMoyennes] = useState({});

// 2. Fetch all averages when soutenances load
useEffect(() => {
  const fetchMoyennes = async () => {
    const results = {};
    await Promise.all(
      soutenances.map(async (s) => {
        const res = await api.get(`/jury/notes/soutenance/${s.id}`);
        const notes = res.data;
        results[s.id] = notes.length > 0
          ? (notes.reduce((acc, n) => acc + n.note, 0) / notes.length).toFixed(2)
          : "N/A";
      })
    );
    setMoyennes(results);
  };

  if (soutenances.length > 0) fetchMoyennes();
}, [soutenances]);
  const handleSoutenanceChange = async (id) => {
    const res = await api.get(`/jury/notes/soutenance/${id}`);
    const notes = res.data;

    console.log('[handleSoutenanceChange] notes reçues:', notes);
    console.log('[handleSoutenanceChange] note actuelle dans form:', noteForm.note);

    setNoteForm(prev => {
      const moy = calculateMoyenne(notes, prev.note, user?.id);
      console.log('[handleSoutenanceChange] moyenne calculée:', moy);
      return {
        ...prev,
        soutenanceId: id,
        moyenne: moy,
        mention: mention(moy)
      };
    });
  };

  const handleNoteChange = async (value, id) => {
    if (!id) {
      setNoteForm(prev => ({ ...prev, note: value }));
      return;
    }

    const res = await api.get(`/jury/notes/soutenance/${id}`);
    const notes = res.data;

    console.log('[handleNoteChange] nouvelle valeur:', value);
    console.log('[handleNoteChange] notes reçues:', notes);

    const moy = calculateMoyenne(notes, value, user?.id);
    console.log('[handleNoteChange] moyenne calculée:', moy);

    setNoteForm(prev => ({
      ...prev,
      note: value,
      moyenne: moy,
      mention: mention(moy)
    }));
  };

  const fetchSoutenances = async () => {
    try {
      const res = await api.get('/jury/mes-soutenance');
      setSoutenances(res.data);
    } catch {
      console.error('Failed to fetch soutenances');
    }
  };

  const fetchMoyenne = async (id) => {
    const res = await api.get(`/moyenne/${id}`);
    return res.data;
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const submitNote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jury/noter', noteForm);
      setMessage('Note enregistrée avec succès !');
      setNoteForm({ soutenanceId: '', note: '', commentaire: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erreur lors de la saisie de la note.');
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <BookOpen size={20} /> },
    { name: 'Mes soutenances', icon: <List size={20} /> },
    { name: 'Saisie des notes', icon: <CheckSquare size={20} /> },
    
    { name: 'Profil', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r shadow-xl flex flex-col text-slate-300">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            Espace Jury
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map(item => (
            <button key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${activeTab === item.name ? 'bg-slate-800 border-r-4 border-emerald-400 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}>
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
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold uppercase shadow-inner">
              {user?.nom?.charAt(0) || 'J'}
            </div>
            <span className="font-medium text-gray-700">{user?.nom || 'Membre Jury'}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">

          {activeTab === 'Dashboard' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Bienvenue, {user?.nom}</h3>
              <p className="text-slate-600 text-lg">Vous pouvez gérer les soutenances, évaluer les étudiants et fournir vos retours via cet interface.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
                  <h4 className="text-lg font-bold opacity-90">Total des soutenances</h4>
                  <p className="text-4xl font-extrabold mt-2">{soutenances.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Mes soutenances' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b">
                <h3 className="text-2xl font-bold text-gray-800">Liste des soutenances disponibles</h3>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider border-b">
                      <th className="px-8 py-4">ID</th>
                      <th className="px-8 py-4">Étudiant</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Salle</th>
                      <th className="px-8 py-4">Moyenne actuelle</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {soutenances.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4 font-mono text-slate-500">#{s.id}</td>
                        <td className="px-8 py-4 font-semibold text-slate-800">{s.etudiant ? s.etudiant.nom : 'N/A'}</td>
                        <td className="px-8 py-4">{s.date}</td>
                        <td className="px-8 py-4">{s.salle}</td>
                        <td className="px-8 py-4">{moyennes[s.id] ?? "..."}</td>

                      </tr>
                    ))}
                    {soutenances.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-8 py-8 text-center text-slate-500">Aucune soutenance trouvée.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Saisie des notes' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-3xl">
              <h3 className="text-2xl font-bold mb-6 text-slate-800">Évaluer une soutenance</h3>

              {message && (
                <div className={`p-4 rounded-lg mb-6 text-sm font-semibold ${message.includes('succès') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={submitNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Choisir la soutenance</label>
                  <select required value={noteForm.soutenanceId} onChange={(e) => handleSoutenanceChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition soutid">
                    <option value="">Sélectionnez...</option>
                    {soutenances.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.etudiant?.nom} - {s.date} ({s.salle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Note (sur 20)</label>
                  <input type="number" min="0" max="20" step="0.25" required value={noteForm.note} onChange={(e) => handleNoteChange(e.target.value, noteForm.soutenanceId)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Commentaires / Appréciations</label>
                  <textarea required rows="4" value={noteForm.commentaire} onChange={e => setNoteForm({ ...noteForm, commentaire: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition"></textarea>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end", paddingRight: "10px"
                }}>
                  <label style={{ paddingRight: "10px" }} className="block text-sm font-semibold text-slate-700 mb-2">Moyenne general :</label>
                  <input style={{ border: "2px solid black" }} type="number" min="0" max="20" step="0.25" required disabled value={noteForm.moyenne} onChange={e => setNoteForm({ ...noteForm, moyenne: e.target.value })} />

                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end", paddingRight: "10px"
                }}>
                  <label style={{ paddingRight: "10px" }} className="block text-sm font-semibold text-slate-700 mb-2">Mention :</label>
                  <input style={{ border: "2px solid black" }} type="text" min="0" max="20" step="0.25" required disabled value={noteForm.mention} onChange={e => setNoteForm({ ...noteForm, mention: e.target.value })} />

                </div>
                <div className="pt-4 mt-6 border-t border-slate-100">
                  <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                    <CheckSquare size={18} /> Enregistrer l'évaluation
                  </button>
                </div>
              </form>
            </div>
          )}

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
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{user?.role}</span>
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
