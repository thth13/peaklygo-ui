'use client';
import { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContext } from '@/context/AuthContext';
import { GOOGLE_CLIENT_ID } from '@/constants';
import GoogleLoginButton from '@/components/GoogleLoginButton';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  server?: string;
}

interface AuthFormProps {
  isLoginProp: boolean;
}

export default function AuthForm({ isLoginProp }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState<boolean>(isLoginProp);
  const auth = useContext(AuthContext);

  const { authUser, googleLogin } = auth;

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name as keyof ValidationErrors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    const { email, password } = formData;
    setLoading(true);

    try {
      await authUser(email, password, isLogin);
    } catch (error: any) {
      const serverErrors = error.response.data;

      setErrors(serverErrors);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16 flex items-center justify-center transition-colors">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div
            id="auth-card"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors"
          >
            <div id="auth-tabs" className="flex">
              <button
                className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${
                  isLogin
                    ? 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 border-transparent'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${
                  !isLogin
                    ? 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 border-transparent'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors">
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors">
                    {isLogin ? 'Continue your reading journey' : 'Start your reading journey today'}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
                      placeholder="your@email.com"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
                      placeholder="••••••••"
                      required
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
                        placeholder="••••••••"
                        required
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  )}
                  {errors.server && <p className="text-red-500 text-xs mt-1">{errors.server}</p>}
                  {/* {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Forgot password?</span>
                    </div>
                  )} */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </div>
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-600 transition-colors"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 ">
                    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                      <GoogleLoginButton googleLogin={googleLogin} />
                    </GoogleOAuthProvider>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
