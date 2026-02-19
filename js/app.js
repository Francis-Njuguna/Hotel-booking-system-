import { cancelBooking, createBooking, getBookings, getRooms } from './api.js';
import { getState, initializeState, subscribe } from './state.js';
import {
  clearFieldErrors,
  formatCurrency,
  renderBookings,
  renderRooms,
  renderRoomSelect,
  setFieldError,
  setLoading,
  showNotification,
} from './ui.js';

const roomList = document.getElementById('room-list');
const bookingList = document.getElementById('booking-list');
const bookingForm = document.getElementById('booking-form');
const roomSelect = document.getElementById('room-select');
const totalPriceNode = document.getElementById('total-price');
const notifyNode = document.getElementById('notification');
const roomsLoadingNode = document.getElementById('rooms-loading');
const bookingsLoadingNode = document.getElementById('bookings-loading');
const submitButton = document.getElementById('submit-booking');

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function parseNights(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const ms = outDate.getTime() - inDate.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function calculateTotalPrice() {
  const { rooms } = getState();
  const formData = new FormData(bookingForm);
  const roomId = formData.get('roomId');
  const checkIn = formData.get('checkIn');
  const checkOut = formData.get('checkOut');
  const room = rooms.find((item) => item.id === roomId);

  if (!room || !checkIn || !checkOut) {
    totalPriceNode.textContent = '$0';
    return 0;
  }

  const nights = parseNights(checkIn, checkOut);
  if (nights <= 0) {
    totalPriceNode.textContent = '$0';
    return 0;
  }

  const total = room.pricePerNight * nights;
  totalPriceNode.textContent = formatCurrency(total);
  return total;
}

function validateBooking(data) {
  const errors = {};
  const today = todayString();

  if (!data.guestName.trim()) errors.guestName = 'Guest name is required.';
  if (!data.email.trim()) errors.email = 'Email is required.';
  if (!data.phone.trim()) errors.phone = 'Phone is required.';
  if (!data.roomId) errors.roomId = 'Please select a room.';
  if (!data.checkIn) errors.checkIn = 'Check-in date is required.';
  if (!data.checkOut) errors.checkOut = 'Check-out date is required.';

  if (data.checkIn && data.checkIn < today) {
    errors.checkIn = 'Check-in cannot be in the past.';
  }

  if (data.checkOut && data.checkOut <= data.checkIn) {
    errors.checkOut = 'Check-out must be after check-in.';
  }

  return errors;
}


function applyDateGuards() {
  const today = todayString();
  bookingForm.querySelector('input[name="checkIn"]').setAttribute('min', today);
  bookingForm.querySelector('input[name="checkOut"]').setAttribute('min', today);
}

function renderApp() {
  const { rooms, bookings } = getState();
  renderRooms(roomList, rooms);
  renderRoomSelect(roomSelect, rooms);
  renderBookings(bookingList, bookings, rooms);
}

async function bootstrap() {
  initializeState();
  applyDateGuards();
  subscribe(renderApp);

  setLoading(roomsLoadingNode, true);
  setLoading(bookingsLoadingNode, true);

  await Promise.all([getRooms(), getBookings()]);

  setLoading(roomsLoadingNode, false);
  setLoading(bookingsLoadingNode, false);

  renderApp();
}

bookingForm.addEventListener('input', (event) => {
  if (event.target.matches('select, input[type="date"]')) {
    const checkInInput = bookingForm.querySelector('input[name="checkIn"]');
    const checkOutInput = bookingForm.querySelector('input[name="checkOut"]');
    if (checkInInput.value) {
      checkOutInput.min = checkInInput.value;
    }
    calculateTotalPrice();
  }
});

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFieldErrors(bookingForm);

  const formData = new FormData(bookingForm);
  const payload = {
    guestName: String(formData.get('guestName') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    roomId: String(formData.get('roomId') || ''),
    checkIn: String(formData.get('checkIn') || ''),
    checkOut: String(formData.get('checkOut') || ''),
  };

  const errors = validateBooking(payload);
  const totalPrice = calculateTotalPrice();

  if (totalPrice <= 0) {
    errors.checkOut = errors.checkOut || 'Please select valid stay dates.';
  }

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => setFieldError(bookingForm, field, message));
    showNotification(notifyNode, 'Please fix errors before submitting.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  try {
    await createBooking({ ...payload, totalPrice });
    bookingForm.reset();
    totalPriceNode.textContent = '$0';
    showNotification(notifyNode, 'Booking created successfully.', 'success');
  } catch {
    showNotification(notifyNode, 'Unable to create booking. Please retry.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Confirm Booking';
  }
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action="cancel-booking"]');
  if (!button) return;

  button.disabled = true;
  button.textContent = 'Cancelling...';

  try {
    await cancelBooking(button.dataset.bookingId);
    showNotification(notifyNode, 'Booking cancelled.', 'success');
  } catch {
    showNotification(notifyNode, 'Unable to cancel booking.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Cancel Booking';
  }
});

bootstrap();
