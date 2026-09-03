import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { QuickActionModal } from './QuickActionModal';
import { TransactionModal } from '../transactions/TransactionModal';
import { BillModal } from '../bills/BillModal';
import { AccountModal } from '../accounts/AccountModal';

interface LayoutContextType {
  openNewTransactionModal: () => void;
  openNewBillModal: () => void;
  openNewAccountModal: () => void;
  openQuickActionModal: () => void;
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
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const openNewTransactionModal = () => setIsTransactionModalOpen(true);
  const openNewBillModal = () => setIsBillModalOpen(true);
  const openNewAccountModal = () => setIsAccountModalOpen(true);
  const openQuickActionModal = () => setIsQuickActionOpen(true);

  return (
    <LayoutContext.Provider
      value={{
        openNewTransactionModal,
        openNewBillModal,
        openNewAccountModal,
        openQuickActionModal,
        triggerRefresh,
        refreshKey,
      }}
    >
      <div className="flex h-screen bg-background bg-ambient-gradient text-din-text overflow-hidden transition-colors duration-300">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card z-10 animate-slide-up border-r border-border">
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

          {/* Padding bottom extra no mobile para não sobrepor a BottomNav */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav onOpenQuickAction={openQuickActionModal} />

        {/* Quick Action Modal (FAB / Bottom Sheet) */}
        <QuickActionModal
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
          onSelectNewTransaction={openNewTransactionModal}
          onSelectNewBill={openNewBillModal}
          onSelectNewAccount={openNewAccountModal}
        />

        {/* Global Modais */}
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSuccess={triggerRefresh}
        />

        <BillModal
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
          onSuccess={triggerRefresh}
        />

        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSuccess={triggerRefresh}
        />
      </div>
    </LayoutContext.Provider>
  );
}
