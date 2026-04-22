import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store/StoreContext';
import type { Vendeur } from '../types';

interface TicketTypeForm {
  name: string;
  price: string;
}

export function CreateEvent() {
  const { createEvent } = useAppStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [newVendeurName, setNewVendeurName] = useState('');

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: '', price: '' },
  ]);

  const addVendeur = () => {
    if (!newVendeurName.trim()) return;
    setVendeurs(prev => [...prev, { id: uuidv4(), name: newVendeurName.trim() }]);
    setNewVendeurName('');
  };

  const removeVendeur = (id: string) => {
    setVendeurs(prev => prev.filter(v => v.id !== id));
  };

  const addTicketType = () => {
    setTicketTypes(prev => [...prev, { name: '', price: '' }]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(prev => prev.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: keyof TicketTypeForm, value: string) => {
    setTicketTypes(prev => prev.map((tt, i) => i === index ? { ...tt, [field]: value } : tt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const validTypes = ticketTypes
      .filter(tt => tt.name.trim() && Number(tt.price) >= 0)
      .map(tt => ({ name: tt.name.trim(), price: Number(tt.price) }));

    if (validTypes.length === 0) return;

    const eventId = createEvent(name.trim(), date, description.trim(), vendeurs, validTypes);
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="page">
      <h1 className="page__title">Créer un événement</h1>
      <form onSubmit={handleSubmit} className="form">

        <div className="form__group">
          <label className="form__label">Nom de l'événement *</label>
          <input
            className="form__input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ex. Concert d'été"
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label">Date *</label>
          <input
            className="form__input"
            type="text"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label">Description</label>
          <textarea
            className="form__input form__textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description optionnelle..."
            rows={3}
          />
        </div>

        {/* Vendeurs */}
        <div className="form__section">
          <div className="form__section-header">
            <h2>Vendeurs</h2>
          </div>
          <div className="vendeur-add-row">
            <input
              className="form__input"
              type="text"
              value={newVendeurName}
              onChange={e => setNewVendeurName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVendeur(); } }}
              placeholder="Nom du vendeur"
            />
            <button type="button" className="btn btn--outline btn--sm" onClick={addVendeur}>
              + Ajouter
            </button>
          </div>
          {vendeurs.length > 0 && (
            <div className="vendeur-tags">
              {vendeurs.map(v => (
                <span key={v.id} className="vendeur-tag">
                  {v.name}
                  <button type="button" className="vendeur-tag__remove" onClick={() => removeVendeur(v.id)}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Types de billets */}
        <div className="form__section">
          <div className="form__section-header">
            <h2>Types de billets</h2>
            <button type="button" className="btn btn--outline btn--sm" onClick={addTicketType}>
              + Ajouter
            </button>
          </div>
          <p className="form__hint">Les billets seront ajoutés après la création de l'événement.</p>

          {ticketTypes.map((tt, i) => (
            <div key={i} className="ticket-type-row">
              <input
                className="form__input"
                type="text"
                value={tt.name}
                onChange={e => updateTicketType(i, 'name', e.target.value)}
                placeholder="Nom du type (ex. VIP)"
                required
              />
              <input
                className="form__input form__input--sm"
                type="number"
                min="0"
                step="0.01"
                value={tt.price}
                onChange={e => updateTicketType(i, 'price', e.target.value)}
                placeholder="Prix"
                required
              />
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => removeTicketType(i)}
                >&times;</button>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn--primary btn--lg btn--full">
          Créer l'événement
        </button>
      </form>
    </div>
  );
}
