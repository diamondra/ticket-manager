import { Link } from 'react-router-dom';
import { useAppStore } from '../store/StoreContext';
import { formatAr } from '../utils/format';

export function EventList() {
  const { events, deleteEvent } = useAppStore();

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <h2>No events yet</h2>
        <p>Create your first event to get started.</p>
        <Link to="/create" className="btn btn--primary">+ New Event</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">Events</h1>
      <div className="event-grid">
        {events.map(event => {
          const totalTickets = event.tickets.length;
          const paidCount = event.tickets.filter(t => t.status === 'paid').length;
          const totalRevenue = event.tickets.reduce((sum, t) => {
            if (t.status === 'paid') {
              const tt = event.ticketTypes.find(tp => tp.id === t.ticketTypeId);
              return sum + (tt?.price ?? 0);
            }
            return sum;
          }, 0);

          return (
            <div key={event.id} className="card">
              <div className="card__header">
                <h3 className="card__title">{event.name}</h3>
                <span className="card__date">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              {event.description && (
                <p className="card__desc">{event.description}</p>
              )}
              <div className="card__stats">
                <span>{totalTickets} tickets</span>
                <span>{paidCount} paid</span>
                <span>{formatAr(totalRevenue)}</span>
              </div>
              <div className="card__types">
                {event.ticketTypes.map(tt => (
                  <span key={tt.id} className="tag">{tt.name} · {formatAr(tt.price)}</span>
                ))}
              </div>
              <div className="card__actions">
                <Link to={`/event/${event.id}`} className="btn btn--primary btn--sm">Manage</Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => {
                    if (confirm(`Delete "${event.name}"?`)) deleteEvent(event.id);
                  }}
                >Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
