export type Language = 'de' | 'tr';

export interface Service {
  id: string;
  category: 'schnitt' | 'farbe' | 'balayage' | 'pflege' | 'hochzeit';
  nameDe: string;
  nameTr: string;
  durationMinutes: number;
  priceChf: number;
  descriptionDe: string;
  descriptionTr: string;
}

export interface BookingFormData {
  serviceId: string;
  startIso: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  feeAccepted: boolean;
  privacyAccepted: boolean;
  website_hp?: string;
}

export interface AvailableSlot {
  time: string;
  startIso: string;
  endIso: string;
  available: boolean;
}

export interface ConfirmedAppointment {
  id: string;
  serviceName: string;
  serviceNameTr?: string;
  customerName: string;
  priceChf: number;
  durationMinutes: number;
  startIso: string;
  endIso: string;
  cancelToken?: string;
  cancelUrl?: string;
}
