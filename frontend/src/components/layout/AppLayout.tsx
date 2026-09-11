import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { QuickActionModal } from './QuickActionModal';
import { PWAInstallBanner } from '../pwa/PWAInstallBanner';
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
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('din_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('din_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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
        isSidebarCollapsed,
        toggleSidebarCollapse,
      }}
    >
      <div className="flex h-screen bg-background bg-ambient-gradient text-din-text overflow-hidden transition-colors duration-300">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[var(--bg-sidebar)] z-10 animate-slide-right border-r border-border shadow-2xl overflow-hidden">
              <Sidebar
                isCollapsed={false}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenNewTransaction={openNewTransactionModal}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleDesktopSidebar={toggleSidebarCollapse}
          />

          {/* Padding bottom extra no mobile para não sobrepor a BottomNav */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav onOpenQuickAction={openQuickActionModal} />

        {/* PWA Install Banner & Offline Sync Indicator */}
        <PWAInstallBanner />

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
