// src/components/auth/AuthPage.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Mail,
  User,
  Lock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Package,
  Check,
  Globe,
  Sparkles,
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebaseServices } from '../../contexts/FirebaseContext';
import { useNotifications } from '../../contexts/NotificationContext';

// --- Reusable Animated Input ---
function AnimatedInput({ id, label, ...props }) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="absolute -top-2.5 left-3 bg-white px-1 text-sm font-medium text-indigo-600"
      >
        {label}
      </label>
      <motion.input
        id={id}
        className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-4 text-lg text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-0"
        {...props}
        whileFocus={{
          borderColor: '#6366f1', // indigo-500
          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)', // Soft glowing ring
        }}
      />
    </div>
  );
}

// --- Reusable Animated Button ---
function AnimatedButton({ children, onClick, isDisabled = false, type = "button" }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-md disabled:opacity-50"
      // whileHover={isDisabled ? {} : { scale: 1.03 }} // <-- FIX: REMOVED SCALE
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.span
        className="absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"
        style={{ mixBlendMode: 'overlay' }}
      />
      {children}
    </motion.button>
  );
}

// --- Reusable Secondary Button ---
function SecondaryButton({ children, onClick, isDisabled = false, type = "button" }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      // --- FIX: Replaced scale with border/shadow on hover ---
      className="group relative flex w-full justify-center rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:shadow-md disabled:opacity-50"
      // whileHover={isDisabled ? {} : { scale: 1.03 }} // <-- FIX: REMOVED SCALE
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {children}
    </motion.button>
  );
}


// --- Login Form (The old form, for the "Login" toggle) ---
function LoginForm({ onSubmit, onForgotPassword }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(email, password).finally(() => setLoading(false));
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatedInput id="login-email" type="email" label={t('auth.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <AnimatedInput id="login-password" type="password" label={t('auth.passwordLabel')} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      <div className="pt-2">
        <AnimatedButton type="submit" isDisabled={loading}>
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('auth.loginButton')}
        </AnimatedButton>
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
        >
          {t('auth.forgotPassword')}
        </button>
      </div>
    </motion.form>
  );
}

// --- Sign Up Wizard (The new creative flow) ---
function SignupWizard({ onSignup, loading, showError, showSuccess }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  // Form Data
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const steps = [
    { id: 1, title: 'Create' },
    { id: 2, title: 'Identity' },
    { id: 3, title: 'Save' },
  ];

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 500 : -500, opacity: 0 }),
  };

  const nextStep = () => {
    if (loading) return; 
    if (step === 1 && !storeName) return showError('Please enter a store name.');
    if (step === 2 && !storeCategory) return showError('Please choose a category.');
    setDirection(1);
    setStep(step + 1);
  };

  const prevStep = () => {
    if (loading) return;
    setDirection(-1);
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ownerName || !email || !password) {
      showError('Please fill in all account fields.');
      return;
    }
    onSignup(email, password, ownerName, storeName, storeCategory);
  };

  return (
    <div className="relative h-[450px] overflow-hidden">
      {/* Animated Progress Bar */}
      <div className="relative mb-8 h-2 w-full rounded-full bg-gray-200">
        <motion.div
          className="absolute top-0 left-0 h-2 rounded-full bg-indigo-600"
          initial={{ width: '0%' }}
          animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute w-full"
        >
          {/* --- SCENE 1: Store Name --- */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <motion.h1 className="text-3xl font-bold text-gray-900" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                Let's bring your brand to life.
              </motion.h1>
              <motion.p className="text-lg text-gray-600" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                What's your store name?
              </motion.p>
              <motion.div className="pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <AnimatedInput id="storeName" label="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g., Emad's Awesome Kicks" />
              </motion.div>
              <motion.div className="pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <AnimatedButton onClick={nextStep} isDisabled={!storeName}>
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </motion.div>
            </div>
          )}

          {/* --- SCENE 2: Store Identity --- */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <motion.h1 className="text-3xl font-bold text-gray-900" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                Build Your Store Identity
              </motion.h1>
              <motion.p className="text-lg text-gray-600" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                What kind of products will you be selling?
              </motion.p>
              <motion.div className="grid grid-cols-3 gap-4 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, staggerChildren: 0.1 }}>
                {['Fashion', 'Food', 'Electronics'].map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className={`rounded-lg border-2 p-4 text-center transition-all duration-200 ${
                      storeCategory === cat
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                        : 'border-gray-300 bg-white hover:border-indigo-400 hover:shadow-md'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat === 'Fashion' && <Package className="w-8 h-8 mx-auto text-pink-500" />}
                    {cat === 'Food' && <Store className="w-8 h-8 mx-auto text-yellow-500" />}
                    {cat === 'Electronics' && <Sparkles className="w-8 h-8 mx-auto text-blue-500" />}
                    <span className="mt-2 block font-medium">{cat}</span>
                  </motion.button>
                ))}
              </motion.div>
              
              <motion.div className="flex gap-4 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <SecondaryButton onClick={prevStep} isDisabled={loading}>
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </SecondaryButton>
                <AnimatedButton onClick={nextStep} isDisabled={!storeCategory || loading}>
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </motion.div>

            </div>
          )}

          {/* --- SCENE 3: Save Your World (Account Creation) --- */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <motion.h1 className="text-3xl font-bold text-gray-900 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                Save Your New World
              </motion.h1>
              <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <AnimatedInput id="ownerName" label={t('auth.yourNameLabel')} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                <AnimatedInput id="email" label={t('auth.emailLabel')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <AnimatedInput id="password" label={t('auth.passwordMin')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </motion.div>
              
              <motion.div className="flex gap-4 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SecondaryButton onClick={prevStep} isDisabled={loading}>
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </SecondaryButton>
                <AnimatedButton type="submit" isDisabled={loading}>
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('auth.createButton')}
                </AnimatedButton>
              </motion.div>

            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


// --- Main AuthPage Component ---
export function AuthPage({ showError, showSuccess, services }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { auth, db } = services;
  const { showError: notifyError, showSuccess: notifySuccess } = useNotifications();

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const [isLogin, setIsLogin] = useState(() => !window.location.pathname.endsWith('/signup'));
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    if (!auth) {
      notifyError('Authentication service not ready.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let message = "Invalid email or password.";
      if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      }
      notifyError(`Login failed: ${message}`);
      console.error("Login Error:", error);
    }
  };

  const handleSignup = async (email, password, ownerName, storeName, storeCategory) => {
    if (!auth || !db) {
      notifyError('Authentication or Database service is not ready.');
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const storeRef = doc(db, "stores", user.uid);
      const storeSlug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      await setDoc(storeRef, {
        userId: user.uid,
        ownerName,
        email,
        name: storeName,
        name_slug: storeSlug,
        phone: '',
        logoUrl: '',
        themeColor: storeCategory === 'Fashion' ? '#ec4899' : (storeCategory === 'Food' ? '#eab308' : '#3b82f6'),
        createdAt: serverTimestamp(),
        isActive: true,
        customPath: null,
        planId: 'free',
        subscriptionEnds: null,
        onboardingComplete: true,
      });
      notifySuccess("Welcome! Your store is created.");

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        notifyError("This email address is already in use.");
      } else {
        notifyError(`Signup failed: ${error.message}`);
      }
      console.error("Signup error:", error);
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      notifyError('Please enter a valid email address.');
      return;
    }
    if (!auth) {
      notifyError('Authentication service not ready.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      notifySuccess(`Password reset email sent to ${email}. Check your inbox.`);
      setShowForgotPassword(false);
    } catch (error) {
      notifyError(`Reset failed: ${error.message}`);
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  let content;
  if (showForgotPassword) {
    content = <ForgotPasswordForm onSubmit={handlePasswordReset} />;
  } else if (isLogin) {
    content = <LoginForm onSubmit={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />;
  } else {
    content = <SignupWizard onSignup={handleSignup} loading={loading} showError={notifyError} showSuccess={notifySuccess} />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-4">
      {/* --- Animated Background --- */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: isLogin
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(255,255,255,0) 70%)',
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-prism.png')] opacity-20"></div>
      </div>

      {/* --- Main Card --- */}
      <motion.div 
        className="relative z-10 w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <button
          onClick={toggleLanguage}
          className="absolute top-4 right-4 flex items-center p-2 rounded-full text-gray-500 hover:bg-gray-100"
          title="Change language"
        >
          <Globe className="w-5 h-5" />
          <span className="ml-1 text-sm font-medium">
            {currentLanguage === 'en' ? 'AR' : 'EN'}
          </span>
        </button>

        <div className="text-center">
          <Store className="w-12 h-12 mx-auto text-indigo-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {showForgotPassword ? t('auth.resetTitle') : (isLogin ? t('auth.loginTitle') : t('auth.signupTitle'))}
          </h2>
        </div>

        {content}

        <div className="text-sm text-center text-gray-600">
          {showForgotPassword ? (
            <button onClick={() => setShowForgotPassword(false)} className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              {t('auth.backToLogin')}
            </button>
          ) : isLogin ? (
            <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-2 space-y-1 sm:space-y-0">
              <span className="whitespace-nowrap">{t('auth.noAccount')}</span>
              <button onClick={() => setIsLogin(false)} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                {t('auth.signUpButton')}
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center space-x-2">
              <span>{t('auth.haveAccount')}</span>
              <button onClick={() => setIsLogin(true)} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                {t('auth.loginButton')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ...
function ForgotPasswordForm({ onSubmit }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(email).finally(() => setLoading(false));
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-sm text-gray-600">{t('auth.resetSubtitle')}</p>
      <AnimatedInput id="reset-email" type="email" label={t('auth.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <div className="pt-2">
        <AnimatedButton type="submit" isDisabled={loading}>
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('auth.resetButton')}
        </AnimatedButton>
      </div>
    </motion.form>
  );
}