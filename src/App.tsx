import React, { useState, useEffect } from 'react';
import { TacoCalculator } from './components/Calculator/TacoCalculator';
import { MenuProvider } from './contexts/MenuContext';
import { TablesProvider } from './contexts/TablesContext';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { TableList } from './components/Tables/TableList';
import { Header } from './components/Header/Header';
import { SettingsModal } from './components/Settings/SettingsModal';
import { GlobalSalesTotal } from './components/Sales/GlobalSalesTotal';
import { LoginForm } from './components/Auth/LoginForm';

// Props para AppContent
interface AppContentProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

function AppContent({ showSettings, setShowSettings }: AppContentProps) {
  const { config, setConfig } = useConfig();
  const { currentUser, isLoading } = useUser();
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'menu' | 'bank' | 'currencyAndTime' | 'security' | 'resetData' | 'about'>('general');

  // Efecto para escuchar el evento openSettingsMenu
  useEffect(() => {
    const handleOpenSettingsMenu = () => {
      setActiveSettingsTab('menu');
      setShowSettings(true);
    };

    window.addEventListener('openSettingsMenu', handleOpenSettingsMenu);

    return () => {
      window.removeEventListener('openSettingsMenu', handleOpenSettingsMenu);
    };
  }, [setShowSettings]);

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Mostrar formulario de login si no hay usuario autenticado
  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ 
        backgroundImage: `url(${config.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: 'bg-gray-50'
      }}
    >
      <Header onOpenSettings={() => {
        setActiveSettingsTab('general');
        setShowSettings(true);
      }} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <TableList />
          <TacoCalculator />
        </div>
      </main>

      <GlobalSalesTotal />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentConfig={config}
        onConfigUpdate={setConfig}
        activeTab={activeSettingsTab}
      />
    </div>
  );
}

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <UserProvider>
      <ConfigProvider>
        <MenuProvider>
          <TablesProvider>
            <AppContent showSettings={showSettings} setShowSettings={setShowSettings} />
          </TablesProvider>
        </MenuProvider>
      </ConfigProvider>
    </UserProvider>
  );
}

export default App; 