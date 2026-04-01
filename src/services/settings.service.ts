import { api } from '../lib/api';

export interface SettingsData {
  company_name: string;
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    complement: string;
  };
}

export const settingsService = {
  async get(): Promise<SettingsData> {
    const response = await api.get('/api/settings');
    return response.data.data;
  },

  async update(data: Partial<SettingsData>): Promise<SettingsData> {
    const response = await api.put('/api/settings', data);
    return response.data.data;
  },
};
