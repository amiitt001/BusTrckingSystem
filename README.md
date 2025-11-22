# Real-Time Bus Tracking System

A self-contained, real-time bus tracking application using **Node.js**, **Socket.io**, and **Leaflet** (OpenStreetMap).

![Tracker Map UI](https://github.com/user-attachments/assets/placeholder-image-1)
*(Note: You can replace this with your actual screenshot after uploading to GitHub)*

## Features
-   **Real-time Tracking**: Uses WebSockets to update bus location instantly.
-   **No API Keys**: Uses OpenStreetMap and Leaflet, so no Google Maps API key is required.
-   **Driver App**: A mobile-friendly interface for the driver to send location updates.
-   **Simulation Mode**: Test the tracking functionality without moving.

## Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start the Server**
    ```bash
    npm start
    ```

3.  **Open in Browser**
    .   **live link**: [https://bustrackersystem](https://bustrckingsystem.onrender.com/)
    -   **Tracker Map**: [http://localhost:3000](http://localhost:3000)
    -   **Driver App**: [http://localhost:3000/driver](http://localhost:3000/driver)

## How it Works

1.  **Backend**: A Node.js server with `socket.io` listens for location updates.
2.  **Driver App**: Sends the device's GPS coordinates (or simulated coordinates) to the server.
3.  **Tracker Map**: Listens for updates and moves the bus marker on the map in real-time.

## Deployment

This app is ready to deploy on platforms like **Render**, **Railway**, or **Heroku**.

1.  Push this code to a GitHub repository.
2.  Connect your repository to a hosting provider.
3.  Use the following settings:
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`

## Screenshots

### Driver App
![Driver App](https://github.com/user-attachments/assets/placeholder-image-2)

### Tracker Map
![Tracker Map](https://github.com/user-attachments/assets/placeholder-image-3)
