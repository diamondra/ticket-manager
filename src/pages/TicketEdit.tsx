import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/StoreContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatAr } from '../utils/format';
import type { TicketStatus } from '../types';

const SELECTABLE_STATUSES: TicketStatus[] = ['unpaid', 'reserved', 'paid', 'cancelled', 'refunded'];

const STATUS_LABELS: Record<TicketStatus, string> = {
  paid: 'Payé',
  unpaid: 'Non payé',
  reserved: 'Réservé',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
};

export function TicketEdit() {
  const { eventId, ticketId } = useParams<{ eventId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { events, updateTicketStatus, updateTicketClient } = useAppStore();

  const event = events.find(e => e.id === eventId);
  const ticket = event?.tickets.find(t => t.id === ticketId);

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(ticket?.status ?? 'unpaid');

  if (!event || !ticket) {
    return <div className="page"><p>Ticket introuvable.</p></div>;
  }

  const ticketType = event.ticketTypes.find(tt => tt.id === ticket.ticketTypeId);

  const apply = () => {
    updateTicketStatus(event.id, ticket.id, selectedStatus);
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="page">
      <button className="btn btn--outline btn--sm" onClick={() => navigate(`/event/${event.id}`)}>
        ← Retour
      </button>

      <div className="ticket-edit__header">
        <h1 className="page__title">Billet #{ticket.number ?? '?'}</h1>
        <p className="ticket-edit__event">{event.name} · {new Date(event.date).toLocaleDateString()}</p>
      </div>

      <div className="ticket-edit__info">
        <div className="ticket-edit__row">
          <span className="ticket-edit__label">Type</span>
          <span className="ticket-edit__value">{ticketType?.name ?? 'Inconnu'}</span>
        </div>
        <div className="ticket-edit__row">
          <span className="ticket-edit__label">Prix</span>
          <span className="ticket-edit__value">{formatAr(ticketType?.price ?? 0)}</span>
        </div>
        <div className="ticket-edit__row">
          <span className="ticket-edit__label">Statut actuel</span>
          <span className="ticket-edit__value"><StatusBadge status={ticket.status} /></span>
        </div>
        <div className="ticket-edit__row">
          <span className="ticket-edit__label">Client</span>
          <input
            className="form__input form__input--inline"
            type="text"
            value={ticket.clientName}
            onChange={e => updateTicketClient(event.id, ticket.id, e.target.value)}
            placeholder="Nom du client"
          />
        </div>
      </div>

      <div className="ticket-edit__actions">
        <select
          className="form__select"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value as TicketStatus)}
        >
          {SELECTABLE_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button
          className="btn btn--primary btn--lg btn--full"
          onClick={apply}
          disabled={selectedStatus === ticket.status}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
