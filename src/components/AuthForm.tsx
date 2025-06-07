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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div id="auth-card" className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div id="auth-tabs" className="flex">
              <button
                className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${
                  isLogin
                    ? 'text-gray-600 hover:text-blue-600 border-blue-600'
                    : 'text-gray-400 hover:text-blue-600 border-transparent'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium border-b-2 transition-colors ${
                  !isLogin
                    ? 'text-gray-600 hover:text-blue-600 border-blue-600'
                    : 'text-gray-400 hover:text-blue-600 border-transparent'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'Continue your reading journey' : 'Start your reading journey today'}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="your@email.com"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="••••••••"
                      required
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </div>
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
