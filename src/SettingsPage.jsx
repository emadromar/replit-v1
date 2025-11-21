// src/SettingsPage.jsx
import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { Settings, User } from 'lucide-react';

const SettingsNavLink = ({ to, icon, children }) => {
  const Icon = icon;
  const activeClass = "bg-primary-50 text-primary-700 border-l-4 border-primary-600";
  const inactiveClass = "text-gray-600 hover:bg-gray-100 border-l-4 border-transparent";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-semibold transition-colors ${
          isActive ? activeClass : inactiveClass
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{children}</span>
    </NavLink>
  );
};

export function SettingsPage() {
  // Get the context from DashboardLayout
  const context = useOutletContext();

  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-lg text-gray-600">
          Manage your store and account preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* --- LEFT COLUMN: Settings Navigation --- */}
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden">
            <nav className="py-2 space-y-1">
              {/* --- FIX: Correct NavLink paths --- */}
              <SettingsNavLink to="/dashboard/settings/general" icon={Settings}>
                General Store
              </SettingsNavLink>
              <SettingsNavLink to="/dashboard/settings/profile" icon={User}>
                My Profile
              </SettingsNavLink>
            </nav>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Content Outlet --- */}
        <div className="lg:col-span-3">
          {/* Pass the context down one more level to general/profile */}
          <Outlet context={context} />
        </div>
      </div>
    </div>
  );
}