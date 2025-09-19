import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Recycle,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Leaf,
  Building2,
  Briefcase,
  Target,
  Award,
  Globe
} from 'lucide-react';
import Button from '../components/ui/Button';
import { SDGCard } from '../components/ui/SDGCard';
import { useToast } from '../contexts/ToastContext';
import type { SDGTheme } from '../types/sdg';

const HomePage: React.FC = () => {
  const { showToast } = useToast();

  const handleGetStarted = () => {
    showToast({
      title: 'Welcome!',
      message: 'Welcome to your green journey! 🌱',
      type: 'success',
      theme: 'climate-action' as SDGTheme
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Hero Section with SDG Theming */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-blue-600/10 to-orange-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Empowering Youth Through
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                {' '}Green Jobs
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join Kisumu's youth in creating a sustainable future through waste collection,
              recycling, and eco-friendly entrepreneurship. Turn environmental action into income.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register" onClick={handleGetStarted}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg px-8 py-4">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with SDG Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform connects youth with green opportunities while promoting environmental sustainability in Kisumu through the UN Sustainable Development Goals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Climate Action - Waste Collection */}
            <SDGCard
              theme="climate-action"
              variant="gradient"
              size="lg"
              title="Collect Waste"
              description="Report and collect waste in your community. Earn credits for every kilogram collected and properly sorted."
              icon={<Recycle className="h-8 w-8" />}
              badge="SDG 13"
              interactive
              className="transform hover:scale-105 transition-all duration-300"
            />

            {/* Sustainable Cities - Eco Products */}
            <SDGCard
              theme="sustainable-cities"
              variant="gradient"
              size="lg"
              title="Shop Eco Products"
              description="Browse and purchase eco-friendly products from local SMEs. Support sustainable businesses in your community."
              icon={<ShoppingBag className="h-8 w-8" />}
              badge="SDG 11"
              interactive
              className="transform hover:scale-105 transition-all duration-300"
            />

            {/* Decent Work - Track Impact */}
            <SDGCard
              theme="decent-work"
              variant="gradient"
              size="lg"
              title="Track Impact"
              description="Monitor your environmental impact, earnings, and contribution to Kisumu's sustainability goals."
              icon={<TrendingUp className="h-8 w-8" />}
              badge="SDG 8"
              interactive
              className="transform hover:scale-105 transition-all duration-300"
            />
          </div>

          {/* Additional SDG Goals Showcase */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Supporting Multiple SDG Goals
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform directly contributes to achieving several UN Sustainable Development Goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SDGCard
              theme="climate-action"
              variant="outline"
              size="md"
              title="Climate Action"
              description="Reduce waste and carbon footprint"
              icon={<Globe className="h-6 w-6" />}
              badge="Goal 13"
            />

            <SDGCard
              theme="sustainable-cities"
              variant="outline"
              size="md"
              title="Sustainable Cities"
              description="Build resilient communities"
              icon={<Building2 className="h-6 w-6" />}
              badge="Goal 11"
            />

            <SDGCard
              theme="decent-work"
              variant="outline"
              size="md"
              title="Decent Work"
              description="Create green job opportunities"
              icon={<Briefcase className="h-6 w-6" />}
              badge="Goal 8"
            />
          </div>
        </div>
      </section>

      {/* Stats Section with SDG Theming */}
      <section className="relative py-20 bg-gradient-to-r from-green-600 via-blue-600 to-orange-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Making a Difference Together
            </h2>
            <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed">
              Join thousands of youth already making an impact in Kisumu through sustainable practices and green entrepreneurship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80 text-lg">Active Youth</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10,000kg</div>
              <div className="text-white/80 text-lg">Waste Collected</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80 text-lg">SME Partners</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">25 tons</div>
              <div className="text-white/80 text-lg">CO₂ Reduced</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with SDG Card */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Start Your Green Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the movement today and start earning while protecting our environment. Be part of Kisumu's sustainable future.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SDGCard
              theme="climate-action"
              variant="solid"
              size="xl"
              title="Join the Community"
              description="Connect with like-minded youth, access green job opportunities, and make a real impact in your community while earning income."
              icon={<Award className="h-10 w-10" />}
              interactive
              className="text-center"
            >
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" onClick={handleGetStarted}>
                  <Button size="lg" className="w-full sm:w-auto bg-white text-green-600 hover:bg-gray-50 text-lg px-8 py-4">
                    <Users className="mr-2 h-5 w-5" />
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                    Learn More
                  </Button>
                </Link>
              </div>
            </SDGCard>
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-8">Trusted by youth across Kisumu</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">UN SDG Aligned</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Community Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Eco Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
