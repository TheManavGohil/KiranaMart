"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Send, MessageCircle, Phone, Mail, MapPin } from "lucide-react"
import FormInput from "@/components/form-input"

interface FAQ {
  question: string
  answer: string
  isOpen: boolean
}

export default function SupportPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "How do I place an order?",
      answer:
        "To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various payment methods and select your preferred delivery time.",
      isOpen: false,
    },
    {
      question: "What are your delivery hours?",
      answer:
        "We deliver from 9 AM to 8 PM, seven days a week. You can select your preferred delivery window during checkout.",
      isOpen: false,
    },
    {
      question: "How can I track my order?",
      answer:
        'Once your order is confirmed, you will receive a confirmation email with a tracking link. You can also track your order by going to "My Orders" in your account.',
      isOpen: false,
    },
    {
      question: "What if I'm not satisfied with my order?",
      answer:
        "We have a 100% satisfaction guarantee. If you're not happy with any product, please contact our customer service within 24 hours of delivery, and we'll arrange a refund or replacement.",
      isOpen: false,
    },
    {
      question: "Do you offer free delivery?",
      answer:
        "Yes, we offer free delivery on all orders above $50. For orders below this amount, a delivery fee of $5.99 is applied.",
      isOpen: false,
    },
    {
      question: "How do I become a vendor on KirnaMart?",
      answer:
        "To become a vendor, visit our Vendor Portal and complete the application form. Our team will review your application and get back to you within 2-3 business days.",
      isOpen: false,
    },
    {
      question: "Are all products organic?",
      answer:
        "We prioritize organic and locally sourced products, but not all products are certified organic. Each product description clearly indicates whether it is organic or conventionally grown.",
      isOpen: false,
    },
    {
      question: "Can I modify or cancel my order?",
      answer:
        'You can modify or cancel your order up to 2 hours before the scheduled delivery time. Go to "My Orders" in your account and select the order you wish to modify or cancel.',
      isOpen: false,
    },
  ])

  const toggleFAQ = (index: number) => {
    setFaqs((prevFaqs) => prevFaqs.map((faq, i) => (i === index ? { ...faq, isOpen: !faq.isOpen } : faq)))
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
      <p className="text-gray-600 mb-8">Get answers to common questions or contact our support team</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <MessageCircle className="mr-2 text-green-500" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="flex justify-between items-center w-full px-4 py-3 text-left font-medium hover:bg-gray-50 focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span>{faq.question}</span>
                    {faq.isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {faq.isOpen && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Mail className="mr-2 text-green-500" />
              Contact Us
            </h2>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <button className="btn-primary" onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormInput
                  label="Your Name"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <FormInput
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <FormInput
                  label="Subject"
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />

                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="form-input"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 8am-8pm</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">support@kirnamart.com</p>
                    <p className="text-sm text-gray-500">We aim to respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Headquarters</p>
                    <p className="text-gray-600">
                      123 Green Street
                      <br />
                      Eco City, EC 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

