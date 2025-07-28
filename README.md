# Evolution API Backend

A backend service for handling WhatsApp integration using the Evolution API.

## 🚀 Features

- WhatsApp Web integration
- Message handling
- Session management
- Webhook support
- RESTful API endpoints

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL/PostgreSQL (or your preferred database)
- Evolution API credentials

## 🚦 Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd evocyiback
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📝 Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
EVOLUTION_API_KEY=your_evolution_api_key
```

## 📚 API Documentation

API documentation is available at `/api-docs` when running in development mode.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
