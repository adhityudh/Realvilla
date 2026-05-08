import { fetchMunicipalities } from './geonames';

export type Municipality = string;

export async function getMunicipalities(): Promise<string[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/geo/tenerife');
      const data = await res.json();
      return data.municipalities || [];
    } catch (err) {
      console.error('Error fetching municipalities from local API:', err);
      return [];
    }
  }
  return fetchMunicipalities();
}

// Strictly for Sanity schema synchronous dropdown options
export const TENERIFE_MUNICIPALITIES = [
  'Adeje', 'Arafo', 'Arico', 'Arona', 'Buenavista del Norte',
  'Candelaria', 'El Rosario', 'El Sauzal', 'El Tanque', 'Fasnia',
  'Garachico', 'Granadilla de Abona', 'Guía de Isora', 'Güímar',
  'Icod de los Vinos', 'La Guancha', 'La Matanza de Acentejo',
  'La Orotava', 'La Victoria de Acentejo', 'Los Realejos',
  'Los Silos', 'Puerto de la Cruz', 'San Cristóbal de La Laguna',
  'San Juan de la Rambla', 'San Miguel de Abona',
  'Santa Cruz de Tenerife', 'Santa Úrsula', 'Santiago del Teide',
  'Tacoronte', 'Tegueste', 'Vilaflor'
];
