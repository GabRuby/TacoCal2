import { BusinessConfig } from '../types';

const CONFIG_KEY = 'business_config';

const DEFAULT_CONFIG: BusinessConfig = {
  name: 'Barbacoa Cervantes',
  imageUrl: '',
  backgroundUrl: '',
  workingHours: [
    { day: 'monday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'tuesday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'wednesday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'thursday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'saturday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { day: 'sunday', openTime: '09:00', closeTime: '22:00', isClosed: false }
  ],
  currencyCode: '',
  timeZone: '',
  nipEnabled: false
};

export function saveConfig(config: BusinessConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getConfig(): BusinessConfig {
  const savedConfig = localStorage.getItem(CONFIG_KEY);
  if (!savedConfig) {
    return DEFAULT_CONFIG;
  }
  
  // Merge saved config with default config to ensure all properties exist
  return {
    ...DEFAULT_CONFIG,
    ...JSON.parse(savedConfig)
  };
}