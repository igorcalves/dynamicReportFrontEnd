/* eslint-disable @typescript-eslint/no-explicit-any */

// Obtém o endereço base da API das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helpers para requisições à API
export const API = {
  // URL base da API
  baseUrl: API_BASE_URL,
  
  // Obter o manifesto do relatório
  getManifest: async (reportName: string): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/manifests/${reportName}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.json();
  },
  
  // Obter dados do relatório
  getReport: async (reportName: string, params: Record<string, any>): Promise<any> => {
    const token = localStorage.getItem("token");
    const filteredParams: Record<string, any> = {};
    for (const key in params) {
      filteredParams[key] = params[key] || null;
    }

    const queryString = new URLSearchParams(filteredParams).toString();
    const response = await fetch(
      `${API_BASE_URL}/reports/${reportName}${
        queryString ? `?${queryString}` : ""
      }`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.json();
  }
};

export default API;
