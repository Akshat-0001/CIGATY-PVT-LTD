import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Input from '../components/forms/Input';
import Button from '../components/forms/Button';
import { authHelpers } from '../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const loginToast = toast.loading('Signing in...');
      
      const { data, error } = await authHelpers.signIn(
        formData.email,
        formData.password
      );

      if (error) {
        toast.error(error, { id: loginToast });
        setGeneralError(error);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        toast.success('Welcome back! Redirecting...', { id: loginToast });
        // Successful login - redirect to live-offers
        setTimeout(() => {
          navigate('/live-offers');
        }, 1000);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      setGeneralError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 hero-gradient" />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gold/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <img 
                src="/logo.png" 
                alt="CIGATY Logo" 
                className="w-16 h-16 object-contain"
              />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-light font-display">CIGATY</h2>
              <p className="text-xs text-gold">India's First B2B Liquor Exchange</p>
            </div>
          </Link>
          
          <h1 className="text-3xl font-bold text-light font-display">Welcome Back</h1>
          <p className="mt-2 text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card bg-dark-lighter/80 backdrop-blur-lg"
        >
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-wine/20 border border-wine rounded-lg flex items-start"
            >
              <AlertCircle className="w-5 h-5 text-wine mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-light">{generalError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your@email.com"
              icon={<Mail size={20} />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                icon={<Lock size={20} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-gray-400 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-light bg-dark text-wine 
                           focus:ring-wine focus:ring-offset-dark"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-gold hover:text-gold-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-gold hover:text-gold-light font-semibold transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

