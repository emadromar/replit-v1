// src/ProfilePage.jsx

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Loader2, Save, User, Lock } from 'lucide-react';
import { Input } from './Forminput.jsx';

// --- Form Section Component ---
const FormSection = ({ title, description, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="md:col-span-1">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <div className="md:col-span-2 card p-6 space-y-4">
      {children}
    </div>
  </div>
);

// --- Main Profile Page Component ---
export function ProfilePage() {
  // Get props from the Outlet context
  const { user, store, showError, showSuccess, handleStoreUpdate } = useOutletContext();
  
  const [ownerName, setOwnerName] = useState(store?.ownerName || '');
  const [loadingName, setLoadingName] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const auth = getAuth();

  // --- Handler for Account Details ---
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setLoadingName(true);
    try {
      await handleStoreUpdate({ ownerName });
      showSuccess("Your name has been updated!");
    } catch (error) {
      console.error("Name update error:", error);
      showError(`Update failed: ${error.message}`);
    } finally {
      setLoadingName(false);
    }
  };

  // --- Handler for Password Change ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }
    
    setLoadingPassword(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      // Re-authenticate user before password change
      await reauthenticateWithCredential(user, credential);
      
      // If re-authentication is successful, update the password
      await updatePassword(user, newPassword);
      
      showSuccess("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Password change error:", error);
      if (error.code === 'auth/wrong-password') {
        showError("The current password you entered is incorrect.");
      } else {
        showError(`An error occurred: ${error.message}`);
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* --- Section 1: Account Details --- */}
      <form onSubmit={handleNameSubmit} className="space-y-6">
        <FormSection
          title="Account Details"
          description="Manage your personal information."
        >
          <Input 
            label="Your Name" 
            id="owner-name"
            value={ownerName}
            onChange={setOwnerName}
            required
          />
          <Input 
            label="Email Address" 
            id="email-address"
            value={user?.email || ''}
            disabled
            readOnly
          />
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loadingName}
              className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 disabled:opacity-70 transition-colors duration-150 font-semibold"
            >
              {loadingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Save Name
            </button>
          </div>
        </FormSection>
      </form>
      
      {/* --- Section 2: Change Password --- */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <FormSection
          title="Change Password"
          description="Update your password for enhanced security."
        >
          <Input 
            label="Current Password" 
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            required
          />
          <Input 
            label="New Password" 
            id="new-password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            required
          />
          <Input 
            label="Confirm New Password" 
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loadingPassword}
              className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 disabled:opacity-70 transition-colors duration-150 font-semibold"
            >
              {loadingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5 mr-2" />}
              Update Password
            </button>
          </div>
        </FormSection>
      </form>
    </div>
  );
}