const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function renderRooms(container, rooms) {
  if (!rooms.length) {
    container.innerHTML = '<p class="empty">No rooms are available currently.</p>';
    return;
  }

  container.innerHTML = rooms
    .map(
      (room) => `
      <article class="card room-card" data-room-id="${room.id}">
        <img src="${room.image}" alt="${room.type}" loading="lazy" />
        <div class="room-content">
          <div class="booking-top">
            <h3>${room.type}</h3>
            <span class="badge ${room.available ? 'badge-available' : 'badge-unavailable'}">
              ${room.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <p class="meta-row"><span>Per Night</span><strong>${currency.format(room.pricePerNight)}</strong></p>
          <p class="meta-row"><span>Capacity</span><span>${room.capacity} Guests</span></p>
        </div>
      </article>
    `
    )
    .join('');
}

export function renderRoomSelect(selectElement, rooms) {
  const options = rooms
    .map(
      (room) =>
        `<option value="${room.id}" ${room.available ? '' : 'disabled'}>${room.type} (${currency.format(
          room.pricePerNight
        )}/night)${room.available ? '' : ' - unavailable'}</option>`
    )
    .join('');

  selectElement.innerHTML = '<option value="">Select a room</option>' + options;
}

export function renderBookings(container, bookings, rooms) {
  if (!bookings.length) {
    container.innerHTML = '<p class="empty">No bookings yet. Start by creating your first booking.</p>';
    return;
  }

  const roomMap = new Map(rooms.map((room) => [room.id, room]));

  container.innerHTML = bookings
    .map((booking) => {
      const room = roomMap.get(booking.roomId);
      const statusClass = booking.status === 'confirmed' ? 'badge-available' : 'badge-unavailable';
      const canCancel = booking.status === 'confirmed';

      return `
      <article class="booking-item">
        <div class="booking-top">
          <h3>${booking.guestName}</h3>
          <span class="badge ${statusClass}">${booking.status}</span>
        </div>
        <p class="meta-row"><span>Room</span><span>${room ? room.type : booking.roomId}</span></p>
        <p class="meta-row"><span>Dates</span><span>${booking.checkIn} → ${booking.checkOut}</span></p>
        <p class="meta-row"><span>Total</span><strong>${currency.format(booking.totalPrice)}</strong></p>
        ${
          canCancel
            ? `<button class="btn btn-danger" data-action="cancel-booking" data-booking-id="${booking.id}">Cancel Booking</button>`
            : ''
        }
      </article>
    `;
    })
    .join('');
}

export function setLoading(element, isLoading) {
  element.hidden = !isLoading;
}

export function showNotification(element, message, type = 'success') {
  element.textContent = message;
  element.className = `notification ${type}`;
  element.hidden = false;

  setTimeout(() => {
    element.hidden = true;
  }, 2600);
}

export function clearFieldErrors(formElement) {
  formElement.querySelectorAll('[data-error-for]').forEach((node) => {
    node.textContent = '';
  });
}

export function setFieldError(formElement, fieldName, message) {
  const errorNode = formElement.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorNode) {
    errorNode.textContent = message;
  }
}

export function formatCurrency(amount) {
  return currency.format(amount);
}
