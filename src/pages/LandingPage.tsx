import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Package, Shield, Smartphone, Globe, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { subscriptionsAPI } from '../lib/api';
import type { Plan } from '../types';
import Logo from "../assets/logo.png";
import Logo_white from "../assets/logo_white.png";

export default function LandingPage() {
  // Récupérer les plans depuis le backend
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await subscriptionsAPI.getPlans();
      return data as Plan[];
    },
  });
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
              <div className="w-20 h-20 relative overflow-hidden rounded-xl">
                <img src={Logo} alt="logo" className='w-full h-full object-cover' />
              </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Témoignages</a>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn btn-secondary">
                Connexion
              </Link>
            
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-tl from-primary-100 via-white to-blue-100">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              La gestion de boutique
              <span className="block bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                simplifiée pour l'Afrique
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Gérez vos stocks, ventes et finances en temps réel. Conçu spécialement pour les commerçants sénégalais et africains.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/register" className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all group">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn btn-secondary text-lg px-8 py-4">
                Se connecter
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14 jours gratuits</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Support en français</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-1">500+</div>
              <div className="text-gray-600">Boutiques actives</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-1">50K+</div>
              <div className="text-gray-600">Ventes enregistrées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-1">98%</div>
              <div className="text-gray-600">Satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-gray-600">Note moyenne</div>
            </div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour gérer votre boutique efficacement
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Package className="w-12 h-12 text-primary-600" />}
              title="Gestion des Stocks"
              description="Suivez vos stocks en temps réel avec des alertes automatiques de rupture. Gérez vos réapprovisionnements intelligemment."
              features={['Alertes de stock bas', 'Historique des mouvements', 'Inventaire multi-produits']}
            />
            <FeatureCard
              icon={<Smartphone className="w-12 h-12 text-primary-600" />}
              title="Point de Vente Rapide"
              description="Interface intuitive pour enregistrer vos ventes en quelques secondes. Support complet des paiements mobiles."
              features={['Wave & Orange Money', 'Ventes rapides', 'Reçus automatiques']}
            />
            <FeatureCard
              icon={<BarChart3 className="w-12 h-12 text-primary-600" />}
              title="Statistiques Avancées"
              description="Visualisez vos performances avec des graphiques clairs. Suivez vos revenus et marges en temps réel."
              features={['Rapports détaillés', 'Analyse des ventes', 'Prévisions']}
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-primary-600" />}
              title="Gestion d'Équipe"
              description="Ajoutez des employés avec des permissions personnalisées. Suivez les performances de chacun."
              features={['Rôles personnalisés', 'Suivi des activités', 'Accès sécurisé']}
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-primary-600" />}
              title="Sécurité Maximale"
              description="Vos données sont cryptées et sauvegardées automatiquement. Accès sécurisé depuis tous vos appareils."
              features={['Cryptage des données', 'Sauvegardes auto', 'Multi-appareils']}
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12 text-primary-600" />}
              title="Multi-Boutiques"
              description="Gérez plusieurs boutiques depuis un seul compte. Parfait pour les franchises et chaînes de magasins."
              features={['Vue consolidée', 'Gestion centralisée', 'Rapports par boutique']}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Démarrez en 3 étapes simples
            </h2>
            <p className="text-xl text-gray-600">
              Configurez votre boutique en moins de 5 minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 container mx-auto">
            <StepCard
              number="1"
              title="Créez votre compte"
              description="Inscrivez-vous gratuitement avec votre numéro de téléphone. Aucune carte bancaire requise."
            />
            <StepCard
              number="2"
              title="Ajoutez vos produits"
              description="Importez votre catalogue de produits rapidement. Définissez vos prix et stocks."
            />
            <StepCard
              number="3"
              title="Commencez à vendre"
              description="Utilisez le point de vente pour enregistrer vos transactions. C'est parti !"
            />
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Chargement des plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 container mx-auto items-start">
              {plans?.map((plan) => (
                <PricingCard key={plan.id} {...plan} />
              ))}
            </div>
          )}
    
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container  mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez ce que nos clients disent de invK
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="Fatou Diallo"
              role="Propriétaire, Boutique Chez Fatou"
              location="Dakar, Sénégal"
              content="invK a transformé ma façon de gérer ma boutique. Je sais exactement ce qui se vend et quand réapprovisionner. Plus de ruptures de stock !"
              rating={5}
            />
            <TestimonialCard
              name="Mamadou Sow"
              role="Gérant, Superette du Coin"
              location="Thiès, Sénégal"
              content="L'interface est simple et mes employés l'ont adoptée en quelques heures. Le support Wave est un vrai plus pour nos clients."
              rating={5}
            />
            <TestimonialCard
              name="Aïssatou Ba"
              role="Directrice, Chaîne de 3 boutiques"
              location="Saint-Louis, Sénégal"
              content="Avec invK, je gère mes 3 boutiques depuis mon téléphone. Les rapports me permettent de prendre de meilleures décisions."
              rating={5}
            />
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-3xl p-12 md:p-16 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Prêt à transformer votre boutique ?
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
                Rejoignez des centaines de commerçants qui font confiance à invK pour gérer leur activité
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn bg-white text-black cursor-pointer hover:bg-gray-200 text-lg px-8 py-4 shadow-xl group">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn bg-primary-700 hover:bg-primary-800 text-white text-lg px-8 py-4">
                  Se connecter
                </Link>
              </div>
              <p className="text-sm mt-6 opacity-90">
                ✓ Essai gratuit de 14 jours • ✓ Sans engagement • ✓ Annulation à tout moment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="w-20 h-20 relative overflow-hidden rounded-xl">
                <img src={Logo_white} alt="logo" className='w-full h-full object-cover' />
              </div>
              <p className="text-sm text-gray-400">
                La solution de gestion de boutique conçue pour l'Afrique
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Produit</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-primary-400 transition-colors">Tarifs</a></li>
                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Connexion</Link></li>
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">S'inscrire</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 invK. Tous droits réservés.</p>
            <p className="mt-2 text-gray-400">Fait avec ❤️ pour les commerçants africains</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, features }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  features: string[];
}) {
  return (
    <div className="card hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 group">
      <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white text-2xl font-bold rounded-full mb-6 shadow-lg">
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, popular, cta }: Plan) {
  return (
    <div className={`card relative cursor-pointer hover:shadow-2xl transition-all duration-300`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-blue-300 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
            Populaire
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="mb-2">
          <span className="text-xl font-extrabold text-gray-900">{price.toLocaleString('fr-FR')}</span>
          <span className="text-gray-600 ml-2">FCFA</span>
        </div>
        <p className="text-sm text-gray-500">par {period}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.slice(0,5).map((feature, i) => (
          <li key={i} className="flex items-start text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className='w-full flex items-center justify-center'>
      <Link
        to="/register"
        className={`text-center p-2 rounded-lg hover:bg-blue-200 shadow-lg cursor-pointer bg-gray-100`}
      >
        {cta}
      </Link>
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, location, content, rating }: {
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed italic">"{content}"</p>
      <div>
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{role}</p>
        <p className="text-xs text-gray-500 mt-1">{location}</p>
      </div>
    </div>
  );
}
