// Tipos para el sistema de usuarios y negocios

export type UserRole = 'owner' | 'waiter';
export type BusinessType = 'restaurant' | 'food_stand' | 'bar';
export type BusinessStatus = 'active' | 'inactive';

export interface BusinessRole {
  businessId: string;
  role: UserRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businesses: BusinessRole[];
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  type: BusinessType;
  status: BusinessStatus;
  settings: {
    currency: string;
    timezone: string;
    // Mantenemos las configuraciones existentes
    reportTitle?: string;
    excelFileName?: string;
    imageUrl?: string;
    backgroundUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Tipo para la sesión actual del usuario
export interface UserSession {
  userId: string;
  businessId: string;
  role: UserRole;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
} 