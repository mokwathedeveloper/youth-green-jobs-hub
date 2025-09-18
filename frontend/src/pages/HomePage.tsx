import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Recycle, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering Youth Through
              <span className="text-green-600"> Green Jobs</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join Kisumu's youth in creating a sustainable future through waste collection, 
              recycling, and eco-friendly entrepreneurship. Turn environmental action into income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform connects youth with green opportunities while promoting environmental sustainability in Kisumu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Collect Waste
              </h3>
              <p className="text-gray-600">
                Report and collect waste in your community. Earn credits for every kilogram collected and properly sorted.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Shop Eco Products
              </h3>
              <p className="text-gray-600">
                Browse and purchase eco-friendly products from local SMEs. Support sustainable businesses in your community.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Impact
              </h3>
              <p className="text-gray-600">
                Monitor your environmental impact, earnings, and contribution to Kisumu's sustainability goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Making a Difference Together
            </h2>
            <p className="text-green-100 text-lg">
              Join thousands of youth already making an impact in Kisumu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-green-100">Active Youth</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000kg</div>
              <div className="text-green-100">Waste Collected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-green-100">SME Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25 tons</div>
              <div className="text-green-100">CO₂ Reduced</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Green Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the movement today and start earning while protecting our environment.
          </p>
          <Link to="/register">
            <Button size="lg">
              <Users className="mr-2 h-5 w-5" />
              Join the Community
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
