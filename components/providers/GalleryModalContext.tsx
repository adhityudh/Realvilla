'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface GalleryModalContextType {
  isOpen: boolean;
  selectedItem: any;
  openModal: (item?: any) => void;
  closeModal: () => void;
}

const GalleryModalContext = createContext<GalleryModalContextType | undefined>(undefined);

export function GalleryModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const openModal = (item?: any) => {
    setSelectedItem(item || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Delay clearing selectedItem to allow exit animation
    setTimeout(() => setSelectedItem(null), 450);
  };

  return (
    <GalleryModalContext.Provider value={{ isOpen, selectedItem, openModal, closeModal }}>
      {children}
    </GalleryModalContext.Provider>
  );
}

export function useGalleryModal() {
  const context = useContext(GalleryModalContext);
  if (context === undefined) {
    throw new Error('useGalleryModal must be used within a GalleryModalProvider');
  }
  return context;
}