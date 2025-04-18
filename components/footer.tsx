import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-green-800 dark:bg-gray-900 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-green-700 dark:bg-green-800 w-1 h-6 mr-2 rounded"></span>
              About KirnaMart
            </h3>
            <p className="text-green-100 dark:text-gray-300 mb-4">
              KirnaMart is your local green grocery platform, connecting you with fresh, organic products from trusted
              vendors.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white bg-green-700 dark:bg-green-800 p-2 rounded-full hover:scale-110 transition-transform">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="text-white bg-green-700 dark:bg-green-800 p-2 rounded-full hover:scale-110 transition-transform">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="text-white bg-green-700 dark:bg-green-800 p-2 rounded-full hover:scale-110 transition-transform">
                <Instagram size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-green-700 dark:bg-green-800 w-1 h-6 mr-2 rounded"></span>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-green-700 dark:bg-green-800 w-1 h-6 mr-2 rounded"></span>
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=Fruits" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Fruits
                </Link>
              </li>
              <li>
                <Link href="/products?category=Vegetables" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Vegetables
                </Link>
              </li>
              <li>
                <Link href="/products?category=Dairy" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Dairy
                </Link>
              </li>
              <li>
                <Link href="/products?category=Bakery" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Bakery
                </Link>
              </li>
              <li>
                <Link href="/products?category=Grains" className="text-green-100 dark:text-gray-300 hover:text-white transition flex items-center group">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Grains & Cereals
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-green-700 dark:bg-green-800 w-1 h-6 mr-2 rounded"></span>
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 group">
                <div className="p-2 bg-green-700 dark:bg-green-800 rounded-full group-hover:bg-green-600 dark:group-hover:bg-green-700 transition-colors">
                  <Mail size={16} />
                </div>
                <span className="text-green-100 dark:text-gray-300">support@kirnamart.com</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="p-2 bg-green-700 dark:bg-green-800 rounded-full group-hover:bg-green-600 dark:group-hover:bg-green-700 transition-colors">
                  <Phone size={16} />
                </div>
                <span className="text-green-100 dark:text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="p-2 bg-green-700 dark:bg-green-800 rounded-full group-hover:bg-green-600 dark:group-hover:bg-green-700 transition-colors">
                  <MapPin size={16} />
                </div>
                <span className="text-green-100 dark:text-gray-300">
                  123 Green Street<br />
                  Eco City, EC 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-700 dark:border-gray-800 mt-8 pt-6 text-center">
          <p className="text-green-200 dark:text-gray-400 flex items-center justify-center">
            &copy; {new Date().getFullYear()} KirnaMart. All rights reserved. 
            <span className="inline-flex items-center ml-2">Made with <Heart size={14} className="mx-1 text-red-400" /> in Eco City</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

