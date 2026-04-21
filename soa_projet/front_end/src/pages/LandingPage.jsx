import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Calendar, Award, ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="text-violet-400" size={32} />,
      title: "Planification Intelligente",
      description: "Gérez les dates, les salles et les créneaux horaires de soutenance en toute simplicité."
    },
    {
      icon: <Users className="text-indigo-400" size={32} />,
      title: "Gestion des Jurys",
      description: "Assignez des présidents, rapporteurs et examinateurs avec des contrôles de cohérence automatiques."
    },
    {
      icon: <Award className="text-emerald-400" size={32} />,
      title: "Suivi des Notes",
      description: "Saisie sécurisée des notes par le jury et calcul instantané des moyennes et mentions."
    },
    {
      icon: <Shield className="text-rose-400" size={32} />,
      title: "Espace Sécurisé",
      description: "Authentification robuste et accès restreint selon les rôles (Admin, Jury, Étudiant)."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Award className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Najahni</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white font-medium transition-colors"
            >
              Se connecter
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-ping" />
            <span className="text-sm font-medium text-slate-300 italic">Plateforme de Gestion de Soutenances</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Propulsez la réussite de vos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400">
              Soutenances Académiques
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Une solution tout-en-un pour organiser, gérer et évaluer les soutenances.
            Simplifiez vos processus administratifs et gagnez en efficacité.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-violet-600/25 flex items-center justify-center gap-2 group"
            >
              Commencer maintenant <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all"
            >
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-[2.5rem] blur opacity-20" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50">
               <img 
                src="/hero_education_management_1776801247501.png" 
                alt="Tableau de bord Najahni" 
                className="w-full h-auto object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi choisir Najahni ?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Notre plateforme offre des outils robustes adaptés aux besoins des étudiants, des enseignants et de l'administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-violet-500/50 transition-all group"
              >
                <div className="mb-6 p-3 bg-slate-800 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">Prêt à transformer votre gestion académique ?</h2>
            <ul className="space-y-4">
              {[
                "Installation rapide et facile",
                "Interface intuitive et moderne",
                "Support technique dédié",
                "Mises à jour gratuites"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle size={20} className="text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-12 rounded-[3rem] text-center shadow-2xl shadow-violet-600/20">
            <h3 className="text-4xl font-black text-white mb-4">100%</h3>
            <p className="text-violet-100 font-medium mb-8">De satisfaction utilisateur</p>
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-white text-violet-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
            >
              Rejoindre l'aventure
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-60">
            <Award size={20} />
            <span className="font-bold">Najahni</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Najahni. Tous droits réservés. Développé pour l'excellence académique.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
