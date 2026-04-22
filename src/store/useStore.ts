import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Event, Ticket, TicketType, TicketStatus, Vendeur } from '../types';

const STORAGE_KEY = 'ticket-manager-events';

function loadEvents(): Event[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: Event[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function useStore() {
  const [events, setEvents] = useState<Event[]>(loadEvents);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const createEvent = useCallback((
    name: string,
    date: string,
    description: string,
    vendeurs: Vendeur[],
    ticketTypes: Omit<TicketType, 'id'>[],
  ) => {
    const eventId = uuidv4();
    const types: TicketType[] = ticketTypes.map(tt => ({ id: uuidv4(), name: tt.name, price: tt.price }));
    const event: Event = { id: eventId, name, date, description, ticketTypes: types, tickets: [], vendeurs };
    setEvents(prev => [...prev, event]);
    return eventId;
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const addTicketType = useCallback((eventId: string, name: string, price: number) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        ticketTypes: [...event.ticketTypes, { id: uuidv4(), name, price }],
      };
    }));
  }, []);

  const addVendeur = useCallback((eventId: string, name: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        vendeurs: [...(event.vendeurs ?? []), { id: uuidv4(), name: name.trim() }],
      };
    }));
  }, []);

  const addTickets = useCallback((
    eventId: string,
    ticketTypeId: string,
    startNumber: number,
    endNumber: number,
    vendeurId?: string,
    clientName?: string,
  ) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      const from = Math.min(startNumber, endNumber);
      const to = Math.max(startNumber, endNumber);
      const padLen = Math.max(3, String(to).length);
      const newTickets: Ticket[] = [];
      for (let n = from; n <= to; n++) {
        newTickets.push({
          id: uuidv4(),
          eventId,
          ticketTypeId,
          number: String(n).padStart(padLen, '0'),
          clientName: clientName ?? '',
          status: 'unpaid',
          vendeurId,
        });
      }
      return { ...event, tickets: [...event.tickets, ...newTickets] };
    }));
  }, []);

  const updateTicketStatus = useCallback((eventId: string, ticketId: string, status: TicketStatus) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        tickets: event.tickets.map(t => t.id === ticketId ? { ...t, status } : t),
      };
    }));
  }, []);

  const updateTicketClient = useCallback((eventId: string, ticketId: string, clientName: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        tickets: event.tickets.map(t => t.id === ticketId ? { ...t, clientName } : t),
      };
    }));
  }, []);

  return {
    events,
    createEvent,
    deleteEvent,
    addTicketType,
    addVendeur,
    addTickets,
    updateTicketStatus,
    updateTicketClient,
  };
}
