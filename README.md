# ⚡ MicroHub — Microservices Dashboard UI

An animated React.js frontend that integrates with the **Product Service** and **Order Service** microservices. Every action in the UI (create, read, update, delete) talks to the backend services and persists data in the H2 databases.

## 🏗️ Full Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React UI (Port 3000)                       │
│                                                              │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Dashboard │  │ Products  │  │  Orders  │  │  Search   │ │
│  │   Page    │  │   CRUD    │  │  CRUD    │  │  & Filter │ │
│  └─────┬─────┘  └─────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│        │              │             │              │        │
│        └──────────────┼─────────────┼──────────────┘        │
│                       │             │                        │
│              Axios + Vite Proxy     │                        │
│                       │             │                        │
└───────────────────────┼─────────────┼────────────────────────┘
                        │             │
            ┌───────────▼──┐   ┌──────▼──────────┐
            │   Product    │   │  Order Service  │
            │   Service    │   │   (Port 8082)   │
            │  (Port 8081) │   │                 │
            │              │   │  Feign Client ──┼──► Product Service
            │  H2 Database │   │  WebClient ─────┼──► Product Service
            │  (productdb) │   │                 │
            └──────────────┘   │  H2 Database    │
                               │  (orderdb)      │
                               └─────────────────┘
```

## 🛠️ Tech Stack

| Technology      | Purpose                          |
|-----------------|----------------------------------|
| React 18        | UI Framework                     |
| Vite            | Build tool & dev server          |
| React Router    | Client-side routing              |
| Axios           | HTTP client for API calls        |
| Framer Motion   | Page transitions & animations    |
| React Icons     | Icon library                     |
| React Toastify  | Toast notifications              |

## 📁 Project Structure

```
microservices-ui/
├── package.json
├── vite.config.js           # Dev server + API proxy config
├── index.html
├── src/
│   ├── main.jsx             # App entry point
│   ├── App.jsx              # Layout + routing + sidebar
│   ├── index.css            # Global styles & animations
│   ├── services/
│   │   └── api.js           # Axios API service layer
│   └── pages/
│       ├── Dashboard.jsx    # Overview with stats
│       ├── Products.jsx     # Full CRUD for products
│       ├── Orders.jsx       # Place/cancel/delete orders
│       └── Search.jsx       # Search & category filter
```

## 🚀 How to Run

### Prerequisites
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Product Service** running on port 8081
- **Order Service** running on port 8082

### Steps

1. **Start both backend services first**
   ```bash
   # Terminal 1 — Product Service
   cd product-service
   gradlew.bat bootRun

   # Terminal 2 — Order Service
   cd order-service
   gradlew.bat bootRun
   ```

2. **Install UI dependencies**
   ```bash
   cd microservices-ui
   npm install
   ```

3. **Start the UI**
   ```bash
   npm run dev
   ```

4. **Open in browser** → `http://localhost:3000`

## 📡 API Integration Map

### Products Page → Product Service (8081)
| UI Action         | HTTP Method | Backend Endpoint                          |
|-------------------|-------------|-------------------------------------------|
| Load products     | GET         | `/api/products`                           |
| Create product    | POST        | `/api/products`                           |
| Edit product      | PUT         | `/api/products/{id}`                      |
| Delete product    | DELETE      | `/api/products/{id}`                      |

### Orders Page → Order Service (8082) → Product Service (8081)
| UI Action              | HTTP Method | Backend Endpoint              |
|------------------------|-------------|-------------------------------|
| Load orders            | GET         | `/api/orders`                 |
| Place order (Feign)    | POST        | `/api/orders/feign`           |
| Place order (WebClient)| POST        | `/api/orders/webclient`       |
| Cancel order           | PUT         | `/api/orders/{id}/cancel`     |
| Delete order           | DELETE      | `/api/orders/{id}`            |

### Search Page → Product Service (8081)
| UI Action          | HTTP Method | Backend Endpoint                     |
|--------------------|-------------|--------------------------------------|
| Search by name     | GET         | `/api/products/search?keyword=xxx`   |
| Filter by category | GET         | `/api/products/category/{category}`  |

## ✨ Features

- **Animated page transitions** — smooth fade and slide between pages
- **Hover animations** — cards and buttons respond to mouse interaction
- **Animated background** — floating gradient blobs
- **Toast notifications** — success/error/warning feedback on every action
- **Spring animations** — modals open with spring physics
- **Live stock tracking** — placing orders reduces product stock in real-time
- **Feign vs WebClient toggle** — choose which client to use when placing orders
- **Product search** — keyword search and category filter with animated cards
- **Dark theme** — professional dark UI with glow effects

## 🔗 Related Repositories

- **Product Service** → [https://github.com/gmk-santhoshkumar/product-service](https://github.com/gmk-santhoshkumar/product-service)
- **Order Service** → [https://github.com/gmk-santhoshkumar/order-service](htnptps://github.com/gmk-santhoshkumar/order-service)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
