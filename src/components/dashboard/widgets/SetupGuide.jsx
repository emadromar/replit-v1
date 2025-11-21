// src/components/dashboard/widgets/SetupGuide.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Check, Lock, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';

export const SetupGuide = ({ store, products, onOpenUpgradeModal }) => {
  const [tasks, setTasks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isVisible, setIsVisible] = useState(true);
  const currentPlanId = store?.planId || 'free';

  useEffect(() => {
    const isDismissed = localStorage.getItem(`setup_dismissed_${store?.id}`);
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    const newTasks = [
      { id: 'products', title: 'Add your first product', isComplete: products.length > 0, href: '/dashboard/products', plan: 'free' },
      { id: 'theme', title: 'Choose theme color', isComplete: store.themeColor !== '#6D28D9', href: '/dashboard/settings/general', plan: 'basic' },
      { id: 'logo', title: 'Upload store logo', isComplete: !!store.logoUrl, href: '/dashboard/settings/general', plan: 'basic' },
    ];
    setTasks(newTasks);
    
    const completed = newTasks.filter(t => t.isComplete).length;
    if (completed === 0) setIsExpanded(true);
    
  }, [store, products]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    if (window.confirm("Hide the setup guide? You can find these settings in the sidebar later.")) {
        localStorage.setItem(`setup_dismissed_${store?.id}`, 'true');
        setIsVisible(false);
    }
  };

  const completedTasks = tasks.filter((task) => task.isComplete).length;
  const isAllComplete = completedTasks === tasks.length;
  const progressPercent = (completedTasks / tasks.length) * 100;

  if (isAllComplete || !isVisible) return null;

  const renderTask = (task) => {
    const isLocked = (task.plan === 'basic' && currentPlanId === 'free');
    
    const Content = () => (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center min-w-0 gap-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
            task.isComplete 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {task.isComplete && <Check className="w-3.5 h-3.5" />}
          </div>
          <span className={`text-sm font-medium truncate ${task.isComplete ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
            {task.title}
          </span>
        </div>
        
        {isLocked && !task.isComplete && (
          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-subscription-basic bg-blue-50 px-2 py-1 rounded-full border border-blue-100 flex items-center">
            <Lock className="w-3 h-3 mr-1" /> Basic
          </span>
        )}
        {!isLocked && !task.isComplete && (
           <ChevronRight className="w-4 h-4 text-gray-300" />
        )}
      </div>
    );

    if (isLocked && !task.isComplete) {
      return (
        <button 
          onClick={(e) => { e.preventDefault(); onOpenUpgradeModal(); }}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
        >
          <Content />
        </button>
      );
    }

    return (
      <Link
        to={task.href}
        className={`block w-full p-3 rounded-xl border transition-all ${
          task.isComplete 
            ? 'bg-white border-gray-100 opacity-60' 
            : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
        }`}
      >
        <Content />
      </Link>
    );
  };

  return (
    <motion.div 
      className="card overflow-hidden transition-all duration-300"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div 
        className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
                <Rocket className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-base font-bold text-gray-900">Setup Progress</h2>
                <p className="text-xs text-gray-500">{completedTasks}/{tasks.length} steps completed</p>
            </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleDismiss}
                    className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                    title="Dismiss Guide"
                >
                    <X className="w-4 h-4" />
                </button>
                <button className="text-gray-400 group-hover:text-gray-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-100 bg-gray-50/50"
            >
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <div key={task.id}>
                          {renderTask(task)}
                      </div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};