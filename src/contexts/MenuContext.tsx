import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { getMenu, clearMenu } from '../utils/menu';

interface MenuContextType {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  refreshMenu: () => void;
  clearMenuItems: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getMenu());

  const refreshMenu = () => {
    setMenuItems(getMenu());
  };

  const clearMenuItems = () => {
    clearMenu();
    setMenuItems([]);
  };

  return (
    <MenuContext.Provider value={{ menuItems, setMenuItems, refreshMenu, clearMenuItems }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 