import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business, UserSession, UserRole, BusinessStatus } from '../types/users';

// Definir el estado del contexto
interface UserContextState {
  currentUser: User | null;
  currentSession: UserSession | null;
  isLoading: boolean;
  error: string | null;
}

// Definir las acciones del contexto
interface UserContextActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

// Combinar estado y acciones
interface UserContextType extends UserContextState, UserContextActions {}

// Crear el contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
}

// Props del provider
interface UserProviderProps {
  children: React.ReactNode;
}

// Componente Provider
export function UserProvider({ children }: UserProviderProps) {
  // Estado inicial
  const [state, setState] = useState<UserContextState>({
    currentUser: null,
    currentSession: null,
    isLoading: true,
    error: null
  });

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    loadSavedSession();
  }, []);

  // Función para cargar la sesión guardada
  const loadSavedSession = async () => {
    try {
      const savedSession = localStorage.getItem('userSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        // TODO: Validar la sesión con el backend
        setState(prev => ({
          ...prev,
          currentUser: session.user,
          currentSession: session.session,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cargar la sesión',
        isLoading: false
      }));
    }
  };

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Implementar llamada al backend para autenticación
      // Por ahora, simulamos una respuesta exitosa
      const mockUser: User = {
        id: '1',
        name: 'Usuario Demo',
        email: email,
        role: 'owner',
        businesses: [{
          businessId: '1',
          role: 'owner'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockSession: UserSession = {
        userId: mockUser.id,
        businessId: mockUser.businesses[0].businessId,
        role: mockUser.businesses[0].role,
        status: 'active',
        startTime: new Date().toISOString()
      };

      // Guardar en localStorage
      localStorage.setItem('userSession', JSON.stringify({
        user: mockUser,
        session: mockSession
      }));

      setState({
        currentUser: mockUser,
        currentSession: mockSession,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al iniciar sesión',
        isLoading: false
      }));
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      localStorage.removeItem('userSession');
      setState({
        currentUser: null,
        currentSession: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cerrar sesión'
      }));
    }
  };

  // Función para cambiar de negocio
  const switchBusiness = async (businessId: string) => {
    try {
      if (!state.currentUser) throw new Error('No hay usuario activo');

      const businessRole = state.currentUser.businesses.find(b => b.businessId === businessId);
      if (!businessRole) throw new Error('Negocio no encontrado');

      const newSession: UserSession = {
        userId: state.currentUser.id,
        businessId: businessId,
        role: businessRole.role,
        status: 'active',
        startTime: new Date().toISOString()
      };

      // Actualizar la sesión guardada
      localStorage.setItem('userSession', JSON.stringify({
        user: state.currentUser,
        session: newSession
      }));

      setState(prev => ({
        ...prev,
        currentSession: newSession,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cambiar de negocio'
      }));
    }
  };

  // Función para cambiar de rol
  const switchRole = async (role: UserRole) => {
    try {
      if (!state.currentUser || !state.currentSession) {
        throw new Error('No hay sesión activa');
      }

      const businessRole = state.currentUser.businesses.find(
        b => b.businessId === state.currentSession?.businessId
      );
      
      if (!businessRole) throw new Error('Rol no disponible para este negocio');

      const newSession: UserSession = {
        ...state.currentSession,
        role: role,
        status: 'active',
        startTime: new Date().toISOString()
      };

      // Actualizar la sesión guardada
      localStorage.setItem('userSession', JSON.stringify({
        user: state.currentUser,
        session: newSession
      }));

      setState(prev => ({
        ...prev,
        currentSession: newSession,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error al cambiar de rol'
      }));
    }
  };

  // Valor del contexto
  const value: UserContextType = {
    ...state,
    login,
    logout,
    switchBusiness,
    switchRole
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
} 