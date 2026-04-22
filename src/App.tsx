import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { Header } from './components/Header';
import { EventList } from './pages/EventList';
import { CreateEvent } from './pages/CreateEvent';
import { EventDetail } from './pages/EventDetail';
import { TicketEdit } from './pages/TicketEdit';
import { VendeurStats } from './pages/VendeurStats';

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/event/:id/vendeurs" element={<VendeurStats />} />
            <Route path="/event/:eventId/ticket/:ticketId" element={<TicketEdit />} />
          </Routes>
        </main>
      </StoreProvider>
    </BrowserRouter>
  );
}
