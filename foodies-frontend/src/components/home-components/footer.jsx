import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Clock,
  ChefHat,
} from "lucide-react";
import logo from "../../assets/logo.png"; 

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Menus", href: "#menus" },
    { name: "Food", href: "#food" },
    { name: "Services", href: "#services" },
    { name: "Reviews", href: "#review" },
  ];

  const services = [
    { name: "Online Ordering", href: "#order" },
    { name: "Table Reservation", href: "#reservation" },
    { name: "Catering Services", href: "#catering" },
    { name: "Gift Cards", href: "#giftcards" },
    { name: "Careers", href: "#careers" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-3">
              {/* Logo with racing light effect */}
              <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(251, 146, 60, 0.8) 85%, rgba(249, 115, 22, 1) 90%, rgba(251, 146, 60, 0.8) 95%, transparent 100%)",
                    }}
                  ></div>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-sm opacity-40"></div>
                <div className="relative bg-white rounded-full p-0.5 shadow-lg h-full w-full flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Foodies Logo"
                    className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-full"
                  />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                FOODIES
              </h2>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Bringing you the finest culinary experiences with fresh
              ingredients and authentic flavors. Your satisfaction is our
              passion.
            </p>
            <div className="flex items-center space-x-2 text-orange-400">
              <ChefHat size={18} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                Est. 2020 | Premium Quality
              </span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  
                  <a  href={link.href}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-xs sm:text-sm flex items-center space-x-2 group"
                  >
                    <span className="w-0 h-0.5 bg-orange-400 group-hover:w-3 transition-all duration-200"></span>
                    <span>{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">
              Our Services
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {services.map((service, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  
                  <a  href={service.href}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-xs sm:text-sm flex items-center space-x-2 group"
                  >
                    <span className="w-0 h-0.5 bg-orange-400 group-hover:w-3 transition-all duration-200"></span>
                    <span>{service.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white">
              Contact Us
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-2 sm:space-x-3 text-gray-400 text-xs sm:text-sm">
                <MapPin size={16} className="text-orange-400 mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <span>123 Food Street, Culinary District, City 12345</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400 text-xs sm:text-sm">
                <Phone size={16} className="text-orange-400 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400 text-xs sm:text-sm">
                <Mail size={16} className="text-orange-400 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <span className="break-all">info@foodies.com</span>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 text-gray-400 text-xs sm:text-sm">
                <Clock size={16} className="text-orange-400 mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <div>
                  <p>Mon - Fri: 9:00 AM - 10:00 PM</p>
                  <p>Sat - Sun: 10:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Social Media & Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-700 pt-6 sm:pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-4">
            {/* Social Links */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <span className="text-gray-400 text-xs sm:text-sm">Follow Us:</span>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-gray-800 p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 transition-all duration-300 group"
                      aria-label={social.label}
                    >
                      <IconComponent
                        size={16}
                        className="text-gray-400 group-hover:text-white transition-colors sm:w-[18px] sm:h-[18px]"
                      />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-xs sm:text-sm text-center md:text-right">
              <p>
                © {currentYear}{" "}
                <span className="text-orange-400 font-semibold">FOODIES</span>.
                All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-4 mt-2">
                
                <a  href="#privacy"
                  className="hover:text-orange-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="hidden sm:inline">|</span>
                
                <a  href="#terms"
                  className="hover:text-orange-400 transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;