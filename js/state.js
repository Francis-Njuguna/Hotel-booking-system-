const STORAGE_KEY = 'hotel_booking_app_state_v1';

const state = {
  rooms: [],
  bookings: [],
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(getState()));
}

function persistBookings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings));
}

export function initializeState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.bookings = parsed;
    }
  } catch {
    state.bookings = [];
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return {
    rooms: [...state.rooms],
    bookings: [...state.bookings],
  };
}

export function setRooms(rooms) {
  state.rooms = rooms;
  notify();
}

export function setBookings(bookings) {
  state.bookings = bookings;
  persistBookings();
  notify();
}

export function addBooking(booking) {
  state.bookings = [booking, ...state.bookings];
  persistBookings();
  notify();
}

export function markBookingCancelled(bookingId) {
  state.bookings = state.bookings.map((booking) => {
    if (booking.id !== bookingId) return booking;
    return {
      ...booking,
      status: 'cancelled',
    };
  });
  persistBookings();
  notify();
}
