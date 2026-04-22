import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/StoreContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatAr } from '../utils/format';
import type { TicketStatus } from '../types';

const ALL_STATUSES: TicketStatus[] = ['paid', 'unpaid', 'reserved', 'cancelled', 'refunded'];
const STATUS_LABELS: Record<TicketStatus, string> = {
  paid: 'Payé',
  unpaid: 'Non payé',
  reserved: 'Réservé',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
};

type ManagePanel = null | 'type' | 'vendeur';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { events, addTickets, addTicketType, addVendeur, updateTicketStatus, updateTicketClient } = useAppStore();
  const event = events.find(e => e.id === id);

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendeur, setFilterVendeur] = useState<string>('all');
  const [searchNumber, setSearchNumber] = useState<string>('');

  const [managePanel, setManagePanel] = useState<ManagePanel>(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypePrice, setNewTypePrice] = useState('');
  const [newVendeurName, setNewVendeurName] = useState('');

  const [showAddTickets, setShowAddTickets] = useState(false);
  const [addTypeId, setAddTypeId] = useState('');
  const [addStartNum, setAddStartNum] = useState('');
  const [addEndNum, setAddEndNum] = useState('');
  const [addVendeurId, setAddVendeurId] = useState('');
  const [addClient, setAddClient] = useState('');

  if (!event) {
    return <div className="page"><p>Événement introuvable.</p></div>;
  }

  const vendeurs = event.vendeurs ?? [];

  const addQty = (() => {
    const s = parseInt(addStartNum);
    const e = parseInt(addEndNum);
    if (!addStartNum) return 0;
    if (!addEndNum || addEndNum === addStartNum) return 1;
    if (!isNaN(s) && !isNaN(e) && e >= s) return e - s + 1;
    return 0;
  })();

  const filteredTickets = event.tickets.filter(t => {
    if (filterType !== 'all' && t.ticketTypeId !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterVendeur !== 'all' && (t.vendeurId ?? '') !== filterVendeur) return false;
    if (searchNumber.trim()) {
      if (!(t.number ?? '').includes(searchNumber.trim())) return false;
    }
    return true;
  });

  const getTypeName = (typeId: string) => event.ticketTypes.find(tt => tt.id === typeId)?.name ?? 'Inconnu';
  const getTypePrice = (typeId: string) => event.ticketTypes.find(tt => tt.id === typeId)?.price ?? 0;
  const getVendeurName = (vendeurId?: string) => vendeurs.find(v => v.id === vendeurId)?.name;

  const totalAll = event.tickets.reduce((sum, t) => sum + getTypePrice(t.ticketTypeId), 0);
  const totalByStatus = (status: TicketStatus) =>
    event.tickets.filter(t => t.status === status).reduce((sum, t) => sum + getTypePrice(t.ticketTypeId), 0);
  const countByStatus = (status: TicketStatus) => event.tickets.filter(t => t.status === status).length;
  const totalPaid = totalByStatus('paid');
  const countPaid = countByStatus('paid');

  const handleAddTicketType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim() || Number(newTypePrice) < 0) return;
    addTicketType(event.id, newTypeName.trim(), Number(newTypePrice));
    setNewTypeName('');
    setNewTypePrice('');
    setManagePanel(null);
  };

  const handleAddVendeur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendeurName.trim()) return;
    addVendeur(event.id, newVendeurName.trim());
    setNewVendeurName('');
    setManagePanel(null);
  };

  const handleAddTickets = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(addStartNum);
    if (!addTypeId || isNaN(start)) return;
    const end = addEndNum.trim() ? parseInt(addEndNum) : start;
    if (isNaN(end) || end < start) return;
    addTickets(
      event.id,
      addTypeId,
      start,
      end,
      addVendeurId || undefined,
      addClient.trim() || undefined,
    );
    setAddTypeId('');
    setAddStartNum('');
    setAddEndNum('');
    setAddVendeurId('');
    setAddClient('');
    setShowAddTickets(false);
  };

  const toggleManage = (panel: ManagePanel) => {
    setManagePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="page">

      <div className="event-header">
        <h1 className="page__title">{event.name}</h1>
        <p className="event-header__date">{new Date(event.date).toLocaleDateString()}</p>
        {event.description && <p className="event-header__desc">{event.description}</p>}
      </div>

      {/* Gestion : ajouter type / vendeur */}
      <div className="manage-bar">
        <button
          className={`btn btn--sm ${managePanel === 'type' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => toggleManage('type')}
        >
          + Type de billet
        </button>
        <button
          className={`btn btn--sm ${managePanel === 'vendeur' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => toggleManage('vendeur')}
        >
          + Vendeur
        </button>
      </div>

      {managePanel === 'type' && (
        <form onSubmit={handleAddTicketType} className="manage-form">
          <input
            className="form__input"
            type="text"
            value={newTypeName}
            onChange={e => setNewTypeName(e.target.value)}
            placeholder="Nom du type (ex. VIP)"
            required
            autoFocus
          />
          <input
            className="form__input form__input--sm"
            type="number"
            min="0"
            step="1"
            value={newTypePrice}
            onChange={e => setNewTypePrice(e.target.value)}
            placeholder="Prix (Ar)"
            required
          />
          <button type="submit" className="btn btn--primary btn--sm">Ajouter</button>
        </form>
      )}

      {managePanel === 'vendeur' && (
        <form onSubmit={handleAddVendeur} className="manage-form">
          <input
            className="form__input"
            type="text"
            value={newVendeurName}
            onChange={e => setNewVendeurName(e.target.value)}
            placeholder="Nom du vendeur"
            required
            autoFocus
          />
          <button type="submit" className="btn btn--primary btn--sm">Ajouter</button>
        </form>
      )}

      {/* Totaux */}
      <div className="summary">
        <div className="summary__card summary__card--total">
          <span className="summary__label">Total</span>
          <span className="summary__value">{formatAr(totalAll)}</span>
          <span className="summary__count">{event.tickets.length} billets</span>
        </div>
        {countPaid > 0 && (
          <div className="summary__card summary__card--paid">
            <span className="summary__label">Encaissé</span>
            <span className="summary__value">{formatAr(totalPaid)}</span>
            <span className="summary__count">{countPaid} billets</span>
          </div>
        )}
        {(['unpaid', 'reserved', 'cancelled', 'refunded'] as TicketStatus[]).map(status => {
          const count = countByStatus(status);
          if (count === 0) return null;
          return (
            <div key={status} className={`summary__card summary__card--${status}`}>
              <span className="summary__label">{STATUS_LABELS[status]}</span>
              <span className="summary__value">{formatAr(totalByStatus(status))}</span>
              <span className="summary__count">{count} billets</span>
            </div>
          );
        })}
      </div>

      <div className="summary-actions">
        <Link className="btn btn--outline btn--sm" to={`/event/${event.id}/vendeurs`}>
          Détails par vendeur
        </Link>
      </div>

      {/* Ajouter des billets */}
      <div className="section">
        <div className="section__header">
          <h2>Billets</h2>
          <button className="btn btn--outline btn--sm" onClick={() => setShowAddTickets(v => !v)}>
            {showAddTickets ? 'Annuler' : '+ Ajouter des billets'}
          </button>
        </div>

        {showAddTickets && (
          <form onSubmit={handleAddTickets} className="add-tickets-form">
            <div className="add-tickets-form__row">
              <select
                className="form__select add-tickets-form__type"
                value={addTypeId}
                onChange={e => setAddTypeId(e.target.value)}
                required
              >
                <option value="">-- Type --</option>
                {event.ticketTypes.map(tt => (
                  <option key={tt.id} value={tt.id}>{tt.name} ({formatAr(tt.price)})</option>
                ))}
              </select>
              <select
                className="form__select add-tickets-form__vendeur"
                value={addVendeurId}
                onChange={e => setAddVendeurId(e.target.value)}
              >
                <option value="">-- Vendeur --</option>
                {vendeurs.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="add-tickets-form__row">
              <div className="add-tickets-form__nums">
                <input
                  className="form__input"
                  type="number"
                  min="1"
                  value={addStartNum}
                  onChange={e => setAddStartNum(e.target.value)}
                  placeholder="N° début"
                  required
                />
                <span className="add-tickets-form__sep">→</span>
                <input
                  className="form__input"
                  type="number"
                  min="1"
                  value={addEndNum}
                  onChange={e => setAddEndNum(e.target.value)}
                  placeholder="N° fin (opt.)"
                />
                {addQty > 0 && (
                  <span className="add-tickets-form__qty">{addQty} billet{addQty > 1 ? 's' : ''}</span>
                )}
              </div>
              <input
                className="form__input add-tickets-form__client"
                type="text"
                value={addClient}
                onChange={e => setAddClient(e.target.value)}
                placeholder="Client (optionnel)"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--sm" disabled={addQty === 0}>
              Ajouter {addQty > 1 ? `(${addQty})` : ''}
            </button>
          </form>
        )}
      </div>

      {/* Filtres + recherche */}
      <div className="filters">
        <input
          className="form__input filters__search"
          type="search"
          value={searchNumber}
          onChange={e => setSearchNumber(e.target.value)}
          placeholder="Rechercher par N°..."
        />
        <select
          className="form__select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">Tous les types</option>
          {event.ticketTypes.map(tt => (
            <option key={tt.id} value={tt.id}>{tt.name}</option>
          ))}
        </select>
        <select
          className="form__select"
          value={filterVendeur}
          onChange={e => setFilterVendeur(e.target.value)}
        >
          <option value="all">Tous les vendeurs</option>
          {vendeurs.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <select
          className="form__select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        {(searchNumber || filterType !== 'all' || filterVendeur !== 'all' || filterStatus !== 'all') && (
          <button
            className="btn btn--outline btn--sm filters__reset"
            onClick={() => {
              setSearchNumber('');
              setFilterType('all');
              setFilterVendeur('all');
              setFilterStatus('all');
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste des billets */}
      <div className="ticket-list">
        {filteredTickets.length === 0 && (
          <p className="ticket-list__empty">Aucun billet ne correspond aux filtres.</p>
        )}
        {filteredTickets
          .slice()
          .sort((a, b) => (a.number ?? '').localeCompare(b.number ?? '', undefined, { numeric: true }))
          .map(ticket => {
            const canPay = ticket.status === 'unpaid';
            const showPay = canPay || ticket.status === 'reserved' || ticket.status === 'paid';
            const vendeurName = getVendeurName(ticket.vendeurId);
            return (
              <div key={ticket.id} className="ticket-row">
                <div className="ticket-row__info">
                  <span className="ticket-row__number">#{ticket.number ?? '?'}</span>
                  <span className="ticket-row__type">{getTypeName(ticket.ticketTypeId)}</span>
                  <span className="ticket-row__price">{formatAr(getTypePrice(ticket.ticketTypeId))}</span>
                  {vendeurName && <span className="ticket-row__vendeur">{vendeurName}</span>}
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="ticket-row__controls">
                  <input
                    className="form__input form__input--inline"
                    type="text"
                    value={ticket.clientName}
                    onChange={e => updateTicketClient(event.id, ticket.id, e.target.value)}
                    placeholder="Nom du client"
                  />
                  {showPay && (
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={!canPay}
                      onClick={() => updateTicketStatus(event.id, ticket.id, 'paid')}
                    >Payer</button>
                  )}
                  <Link
                    className="btn btn--outline btn--sm"
                    to={`/event/${event.id}/ticket/${ticket.id}`}
                  >→</Link>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
