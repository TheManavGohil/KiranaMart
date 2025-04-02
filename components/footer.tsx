import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-semibold mb-4">About KirnaMart</h3>
            <p className="text-green-100 mb-4">
              KirnaMart is your local green grocery platform, connecting you with fresh, organic products from trusted
              vendors.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white hover:text-green-300">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-white hover:text-green-300">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-white hover:text-green-300">
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-green-100 hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-green-100 hover:text-white transition">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="text-green-100 hover:text-white transition">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-green-100 hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-green-100 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=Fruits" className="text-green-100 hover:text-white transition">
                  Fruits
                </Link>
              </li>
              <li>
                <Link href="/products?category=Vegetables" className="text-green-100 hover:text-white transition">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link href="/products?category=Dairy" className="text-green-100 hover:text-white transition">
                  Dairy
                </Link>
              </li>
              <li>
                <Link href="/products?category=Bakery" className="text-green-100 hover:text-white transition">
                  Bakery
                </Link>
              </li>
              <li>
                <Link href="/products?category=Grains" className="text-green-100 hover:text-white transition">
                  Grains & Cereals
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <span className="text-green-100">support@kirnamart.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <span className="text-green-100">+1 (555) 123-4567</span>
              </li>
              <li>
                <p className="text-green-100">
                  123 Green Street
                  <br />
                  Eco City, EC 12345
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-6 text-center">
          <p className="text-green-200">&copy; {new Date().getFullYear()} KirnaMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

