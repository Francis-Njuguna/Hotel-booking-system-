import { addBooking, getState, markBookingCancelled, setBookings, setRooms } from './state.js';

const ROOMS = [
  {
    id: 'r101',
    type: 'Deluxe King Room',
    pricePerNight: 149,
    capacity: 2,
    available: true,
    image:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'r202',
    type: 'Executive Twin Room',
    pricePerNight: 219,
    capacity: 3,
    available: true,
    image:
      'https://images.unsplash.com/photo-1616594039964-f4c0df8bd6b1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'r303',
    type: 'Skyline Suite',
    pricePerNight: 299,
    capacity: 4,
    available: false,
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  },
];

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getRooms() {
  await wait();
  setRooms(ROOMS);
  return ROOMS;
}

export async function getBookings() {
  await wait(250);
  const { bookings } = getState();
  setBookings(bookings);
  return bookings;
}

export async function createBooking(payload) {
  await wait(400);

  const booking = {
    id: crypto.randomUUID(),
    ...payload,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  addBooking(booking);
  return booking;
}

export async function cancelBooking(bookingId) {
  await wait(250);
  markBookingCancelled(bookingId);
  return { success: true };
}
