import type { TicketStatus } from '../types';

const labels: Record<TicketStatus, string> = {
  paid: 'Payé',
  unpaid: 'Non payé',
  reserved: 'Réservé',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`badge badge--${status}`}>{labels[status]}</span>;
}
