import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/StoreContext';
import { formatAr } from '../utils/format';
import type { Ticket } from '../types';

export function VendeurStats() {
  const { id } = useParams<{ id: string }>();
  const { events } = useAppStore();
  const event = events.find(e => e.id === id);

  if (!event) {
    return <div className="page"><p>Événement introuvable.</p></div>;
  }

  const vendeurs = event.vendeurs ?? [];
  const getTypePrice = (typeId: string) => event.ticketTypes.find(tt => tt.id === typeId)?.price ?? 0;

  const statsForTickets = (tickets: Ticket[]) => {
    const prevendus = tickets.filter(t => t.status === 'reserved');
    const payesJourJ = tickets.filter(t => t.status === 'paid');
    return {
      total: tickets.length,
      totalAmount: tickets.reduce((s, t) => s + getTypePrice(t.ticketTypeId), 0),
      prevendusCount: prevendus.length,
      prevendusAmount: prevendus.reduce((s, t) => s + getTypePrice(t.ticketTypeId), 0),
      payesJourJCount: payesJourJ.length,
      payesJourJAmount: payesJourJ.reduce((s, t) => s + getTypePrice(t.ticketTypeId), 0),
    };
  };

  const vendeurRows = vendeurs.map(v => ({
    vendeur: v,
    tickets: event.tickets.filter(t => t.vendeurId === v.id),
  }));

  const sansVendeurTickets = event.tickets.filter(t => !t.vendeurId);

  return (
    <div className="page">
      <div className="vendeur-stats-header">
        <Link className="btn btn--outline btn--sm" to={`/event/${event.id}`}>← Retour</Link>
        <div>
          <h1 className="page__title">Détails par vendeur</h1>
          <p className="event-header__date">{event.name} — {new Date(event.date).toLocaleDateString()}</p>
        </div>
      </div>

      {vendeurs.length === 0 && sansVendeurTickets.length === 0 && (
        <p className="ticket-list__empty">Aucun billet enregistré.</p>
      )}

      <div className="vendeur-stats-grid">
        {vendeurRows.map(({ vendeur, tickets }) => {
          const stats = statsForTickets(tickets);
          return (
            <div key={vendeur.id} className="vendeur-card">
              <div className="vendeur-card__name">{vendeur.name}</div>
              <div className="vendeur-card__stats">
                <div className="vendeur-stat">
                  <span className="vendeur-stat__label">Total billets</span>
                  <span className="vendeur-stat__value">{stats.total}</span>
                  <span className="vendeur-stat__amount">{formatAr(stats.totalAmount)}</span>
                </div>
                <div className="vendeur-stat vendeur-stat--presale">
                  <span className="vendeur-stat__label">Pré-vendus</span>
                  <span className="vendeur-stat__value">{stats.prevendusCount}</span>
                  <span className="vendeur-stat__amount">{formatAr(stats.prevendusAmount)}</span>
                </div>
                <div className="vendeur-stat vendeur-stat--paid">
                  <span className="vendeur-stat__label">Payés le jour J</span>
                  <span className="vendeur-stat__value">{stats.payesJourJCount}</span>
                  <span className="vendeur-stat__amount">{formatAr(stats.payesJourJAmount)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {sansVendeurTickets.length > 0 && (
          <div className="vendeur-card vendeur-card--none">
            <div className="vendeur-card__name">Sans vendeur</div>
            <div className="vendeur-card__stats">
              {(() => {
                const stats = statsForTickets(sansVendeurTickets);
                return (
                  <>
                    <div className="vendeur-stat">
                      <span className="vendeur-stat__label">Total billets</span>
                      <span className="vendeur-stat__value">{stats.total}</span>
                      <span className="vendeur-stat__amount">{formatAr(stats.totalAmount)}</span>
                    </div>
                    <div className="vendeur-stat vendeur-stat--presale">
                      <span className="vendeur-stat__label">Pré-vendus</span>
                      <span className="vendeur-stat__value">{stats.prevendusCount}</span>
                      <span className="vendeur-stat__amount">{formatAr(stats.prevendusAmount)}</span>
                    </div>
                    <div className="vendeur-stat vendeur-stat--paid">
                      <span className="vendeur-stat__label">Payés le jour J</span>
                      <span className="vendeur-stat__value">{stats.payesJourJCount}</span>
                      <span className="vendeur-stat__amount">{formatAr(stats.payesJourJAmount)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
