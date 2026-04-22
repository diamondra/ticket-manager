export type TicketStatus = 'paid' | 'unpaid' | 'reserved' | 'cancelled' | 'refunded';

export interface TicketType {
  id: string;
  name: string;
  price: number;
}

export interface Vendeur {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  number: string;
  clientName: string;
  status: TicketStatus;
  vendeurId?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  ticketTypes: TicketType[];
  tickets: Ticket[];
  vendeurs: Vendeur[];
}
