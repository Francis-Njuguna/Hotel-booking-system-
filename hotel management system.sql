-- Create the database
CREATE DATABASE IF NOT EXISTS HotelBookingDB;
USE HotelBookingDB;

-- Table: Customers
CREATE TABLE Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: RoomTypes
CREATE TABLE RoomTypes (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL
);

-- Table: Rooms
CREATE TABLE Rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    type_id INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (type_id) REFERENCES RoomTypes(type_id)
);

-- Table: Bookings
CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Booked', 'CheckedIn', 'CheckedOut', 'Cancelled') DEFAULT 'Booked',
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);

-- Table: Orders (e.g., room service, food, etc.)
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

-- Table: OrderItems
CREATE TABLE OrderItems (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- Table: Payments
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    booking_id INT,
    order_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Online') NOT NULL,
    status ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Paid',
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);
