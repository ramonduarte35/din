import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TransactionModal } from '../transactions/TransactionModal';

interface LayoutContextType {
  openNewTransactionModal: () => void;
  triggerRefresh: () => void;
  refreshKey: number;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout deve ser utilizado dentro de um AppLayout');
  }
  return context;
}

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const openNewTransactionModal = () => {
    setIsTransactionModalOpen(true);
  };

  return (
    <LayoutContext.Provider value={{ openNewTransactionModal, triggerRefresh, refreshKey }}>
      <div className="flex h-screen bg-[#080d1a] bg-ambient-gradient text-slate-100 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0b1120] z-10 animate-slide-up">
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenNewTransaction={openNewTransactionModal}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {/* Global Nova Transação Modal */}
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSuccess={triggerRefresh}
        />
      </div>
    </LayoutContext.Provider>
  );
}
