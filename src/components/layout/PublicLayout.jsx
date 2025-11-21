// src/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../Header.jsx'; // Go up two levels to find Header.jsx

export const PublicLayout = () => {
  return (
    <>
      <Header />
      {/* This main tag adds padding so the content appears *below* the fixed header */}
      <main className="pt-16"> 
        <Outlet />
      </main>
    </>
  );
};