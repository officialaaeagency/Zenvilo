import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { Lock, Mail, User, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { route, navigate } = useNavigation();
  const { user, isAdmin, signIn, signUp, requestPasswordReset, updatePassword } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'login' | 'signup' | 'forgot' | 'reset'>(
    route.params?.authTab || 'login'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto redirect if already logged in
  useEffect(() => {
    if (user && tab !== 'reset') {
      if (isAdmin) {
        navigate('admin');
      } else {
        navigate('account');
      }
    }
  }, [user, isAdmin, tab, navigate]);

  useEffect(() => {
    if (route.params?.authTab) {
      setTab(route.params.authTab);
    }
  }, [route.params?.authTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (tab === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }
      setLoading(true);
      const res = await signIn(email.trim(), password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        showToast('Logged in successfully', 'success');
        // Will auto-redirect via useEffect
      }
    } else if (tab === 'signup') {
      if (!fullName.trim() || !email.trim() || !password) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      setLoading(true);
      const res = await signUp(email.trim(), password, fullName.trim());
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Account registered! If confirmation email is enabled, please verify your inbox.');
        showToast('Account registered successfully', 'success');
      }
    } else if (tab === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      const res = await requestPasswordReset(email.trim());
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('A password reset link has been dispatched to your email address.');
        showToast('Password reset link sent', 'success');
      }
    } else if (tab === 'reset') {
      if (!password || password.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      setLoading(true);
      const res = await updatePassword(password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Your password has been updated. You can now log in.');
        showToast('Password updated successfully', 'success');
        setTab('login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded p-1 mb-6"
        >
          <Logo size="lg" />
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          {tab === 'login' && 'Sign in to Zenvilo'}
          {tab === 'signup' && 'Create your Zenvilo Account'}
          {tab === 'forgot' && 'Reset your password'}
          {tab === 'reset' && 'Set a new password'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400">
          {tab === 'login' && 'Access your order history, tracking, and customer preferences.'}
          {tab === 'signup' && 'Join for verified order tracking, fast checkout, and release notifications.'}
          {tab === 'forgot' && 'Enter your email to receive a secure password recovery link.'}
          {tab === 'reset' && 'Enter your new secure account password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab buttons for Login / Sign Up */}
          {(tab === 'login' || tab === 'signup') && (
            <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'login' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'signup' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            {(tab === 'login' || tab === 'signup' || tab === 'forgot') && (
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            {(tab === 'login' || tab === 'signup' || tab === 'reset') && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-neutral-300">
                    {tab === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            {(tab === 'signup' || tab === 'reset') && (
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={loading}
              className="mt-2"
            >
              {tab === 'login' && 'Sign In'}
              {tab === 'signup' && 'Create Account'}
              {tab === 'forgot' && 'Send Recovery Email'}
              {tab === 'reset' && 'Update Password'}
            </Button>
          </form>

          {/* Navigation back */}
          {tab === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Supabase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
