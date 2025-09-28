"use client";
import { useState, useEffect, useCallback } from "react";
import { LiquidEther } from "@/components/ui/liquid-ether";
import Link from "next/link";
import {
  Menu,
  X,
  Database,
  Zap,
  Shield,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  LogOut,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

// LoginModal component (unchanged from your input, should be included here)

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  formData: {
    name: string;
    email: string;
    password: string;
  };
  setFormData: (data: any) => void;
  error: string;
  setError: (error: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function LoginModal({
  isOpen,
  onClose,
  isSignUp,
  setIsSignUp,
  formData,
  setFormData,
  error,
  setError,
  showPassword,
  setShowPassword,
  onSubmit,
}: LoginModalProps) {
  if (!isOpen) return null;

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors pr-10"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{
              background:
                "linear-gradient(to right, var(--primary), var(--secondary))",
              color: "var(--primary-foreground)",
            }}
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={toggleSignUp}
              className="text-purple-400 hover:text-purple-300 ml-2 font-medium"
              type="button"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const projectId = "1234"; // Add back projectId for redirect
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Login Modal States
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);

    // Check for existing user in localStorage
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      if (isSignUp) {
        // Sign Up Logic
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const existingUser = users.find(
          (user: any) => user.email === formData.email
        );

        if (existingUser) {
          setError("User already exists with this email");
          return;
        }

        const newUser = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        setCurrentUser(newUser);
        setIsLoginModalOpen(false);
        setFormData({ name: "", email: "", password: "" });

        // Redirect after successful signup
        setTimeout(() => {
          window.location.href = `/in/${projectId}`;
        }, 500);
      } else {
        // Sign In Logic
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find(
          (u: any) =>
            u.email === formData.email && u.password === formData.password
        );

        if (user) {
          localStorage.setItem("currentUser", JSON.stringify(user));
          setCurrentUser(user);
          setIsLoginModalOpen(false);
          setFormData({ name: "", email: "", password: "" });

          // Redirect after successful login
          setTimeout(() => {
            window.location.href = `/in/${projectId}`;
          }, 500);
        } else {
          setError("Invalid email or password");
        }
      }
    },
    [isSignUp, formData, projectId]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  }, []);

  const handleGetStarted = useCallback(() => {
    if (currentUser) {
      // Direct redirect for logged-in users
      window.location.href = `/in/${projectId}`;
    } else {
      setIsLoginModalOpen(true);
    }
  }, [currentUser, projectId]);

  if (!mounted) return null;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={["#1DA4E3", "#41CC8D", "#10B981"]}
          mouseForce={25}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={1.8}
        />
      </div>

      {/* Loading Screen */}
      {loading && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-700 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-light text-white mb-2">Initializing</h2>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={handleSubmit}
      />

      {/* Main Content Container */}
      <div className="absolute inset-0 z-30 flex flex-col">
        {/* Navigation */}
        <nav
          className="relative z-40 backdrop-blur-md border-b"
          style={{ backgroundColor: "rgba(16,16,20,0.2)", borderColor: "var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-white">
                  Syntra
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="#features"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Features
                  </Link>
                  <Link
                    href="#about"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="#contact"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* User Section */}
              <div className="hidden md:flex items-center space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-white">Welcome, {currentUser.name}</span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    style={{
                      background:
                        "linear-gradient(to right, var(--primary), var(--secondary))",
                      color: "var(--primary-foreground)",
                    }}
                    className="px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Get Started
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/30 backdrop-blur-md">
                <Link
                  href="#features"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Features
                </Link>
                <Link
                  href="#about"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Contact
                </Link>
                <button
                  onClick={handleGetStarted}
                  style={{
                    background:
                      "linear-gradient(to right, var(--primary), var(--secondary))",
                    color: "var(--primary-foreground)",
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span
                  style={{
                    background:
                      "linear-gradient(to right, var(--primary), var(--secondary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI Database
                </span>
                <br />
                Management
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your database operations with intelligent AI automation.
                Streamline queries, optimize performance, and manage data effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleGetStarted}
                  style={{
                    background:
                      "linear-gradient(to right, var(--primary), var(--secondary))",
                    color: "var(--primary-foreground)",
                  }}
                  className="px-8 py-4 rounded-full text-lg font-medium hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Building <ArrowRight className="ml-2 inline" size={20} />
                </button>

                <Link
                  href="#features"
                  className="border border-white/20 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                <p className="text-gray-300 leading-relaxed">
                  Optimize queries and boost performance with AI-powered insights that analyze and enhance your database operations in real-time.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Database className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Management</h3>
                <p className="text-gray-300 leading-relaxed">
                  Intelligent database operations with automated maintenance, backup scheduling, and performance monitoring built right in.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
                <p className="text-gray-300 leading-relaxed">
                  Advanced security features with real-time monitoring, encryption, and compliance tools to keep your data safe and secure.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="py-12 px-4 sm:px-6 lg:px-8 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold text-white">Syntra</h3>
                <p className="text-gray-400">AI-Powered Database Management</p>
              </div>

              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github size={24} />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter size={24} />
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin size={24} />
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-gray-400">© 2024 Syntra. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
