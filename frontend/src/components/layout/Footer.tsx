/**
 * Enhanced Footer Component with SDG Theming
 * 
 * A comprehensive footer with SDG theme support, links, social media,
 * and contact information for the Youth Green Jobs Hub.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { SDGTheme } from '../../types/sdg';
import { getSDGTailwindClasses, getSDGTheme } from '../../config/sdgThemes';
import { clsx } from 'clsx';

interface FooterProps {
  theme?: SDGTheme;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  theme = 'climate',
  className = '',
}) => {
  const themeConfig = getSDGTheme(theme);
  const tailwindClasses = getSDGTailwindClasses(theme);

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Waste Collection', href: '/dashboard/waste' },
        { name: 'Eco Products', href: '/dashboard/products' },
        { name: 'Analytics', href: '/dashboard/analytics' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Community', href: '/community' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Data Protection', href: '/data-protection' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ];

  const sdgGoals = [
    { goal: 8, name: 'Decent Work', theme: 'work' as SDGTheme },
    { goal: 11, name: 'Sustainable Cities', theme: 'cities' as SDGTheme },
    { goal: 13, name: 'Climate Action', theme: 'climate' as SDGTheme },
  ];

  return (
    <footer className={clsx(
      'bg-gray-900 text-white',
      className
    )}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className={clsx(
                'p-2 rounded-lg',
                tailwindClasses.bg.primary
              )}>
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Youth Green Jobs Hub</span>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting youth with green jobs and eco-friendly opportunities 
              in Kisumu, Kenya. Building a sustainable future through 
              environmental action and economic empowerment.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Kisumu, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a 
                  href="mailto:info@youthgreenjobs.ke" 
                  className="hover:text-white transition-colors"
                >
                  info@youthgreenjobs.ke
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a 
                  href="tel:+254700000000" 
                  className="hover:text-white transition-colors"
                >
                  +254 700 000 000
                </a>
              </div>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SDG Goals section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Supporting UN Sustainable Development Goals
          </h3>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            {sdgGoals.map((sdg) => {
              const sdgClasses = getSDGTailwindClasses(sdg.theme);
              return (
                <div
                  key={sdg.goal}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    'bg-gray-800 border-2 transition-colors hover:bg-gray-700',
                    sdgClasses.border.primary
                  )}
                >
                  <span className={clsx(
                    'font-bold text-lg',
                    sdgClasses.text.primary
                  )}>
                    {sdg.goal}
                  </span>
                  <span className="text-sm text-gray-300">{sdg.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social links and newsletter */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Social links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Follow us:</span>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className={clsx(
                    'p-2 rounded-full transition-colors',
                    'text-gray-400 hover:text-white',
                    tailwindClasses.bg.primary.replace('bg-', 'hover:bg-')
                  )}
                  aria-label={`Follow us on ${social.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* Newsletter signup */}
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              className={clsx(
                'px-4 py-2 rounded-md text-white font-medium transition-colors',
                tailwindClasses.bg.primary,
                tailwindClasses.bg.primaryHover
              )}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © {new Date().getFullYear()} Youth Green Jobs Hub. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Powered by sustainable technology</span>
              <div className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Carbon Neutral</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
