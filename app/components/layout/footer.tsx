import Link from 'next/link'
import { Gem, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
  ]

  const categories = [
    { name: 'Diamond Jewelry', href: '/category/diamond-jewelry' },
    { name: 'Gold Jewelry', href: '/category/gold-jewelry' },
    { name: 'Skincare', href: '/category/skincare' },
    { name: 'Makeup', href: '/category/makeup' },
  ]

  const support = [
    { name: 'Customer Support', href: '/support' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
    { name: 'Warranty', href: '/warranty' },
  ]

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'YouTube', href: '#', icon: Youtube },
  ]

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-16">
      {/* Main Footer Content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Gem className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-200" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                GlamBazar
              </span>
            </Link>
            <p className="text-gray-300 leading-relaxed max-w-sm">
              Discover luxury jewelry and premium cosmetics with same-day delivery in Kanpur. Your destination for authentic, high-quality products.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300 group">
                <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm">Kanpur, Uttar Pradesh</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 group">
                <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm">+91 12345 67890</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 group">
                <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm">hello@glambazar.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 inline-block transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Categories</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link 
                    href={category.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 inline-block transform"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-3">
              {support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 inline-block transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Newsletter Signup */}
            <div className="pt-4">
              <h4 className="text-sm font-medium text-white mb-3">Stay Updated</h4>
              <div className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md transition-colors duration-200 hover:scale-105 transform">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <span>© 2025 GlamBazar. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 hidden sm:block">Follow us:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="w-9 h-9 bg-slate-800 hover:bg-primary text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 transform group"
                      aria-label={social.name}
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </footer>
  )
}