# CloudRetail Customer Web Portal

React-based customer-facing web application for the CloudRetail e-commerce platform.

## Features

- **Authentication**: AWS Cognito login/signup with JWT tokens
- **Product Browsing**: Browse products with filters (category, price, search)
- **Product Details**: View detailed product information with stock availability
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout**: Place orders with shipping information
- **Order Tracking**: View order history and status
- **User Profile**: Manage personal information and addresses

## Tech Stack

- **Framework**: React 18
- **UI Library**: AWS Amplify UI React
- **Authentication**: AWS Amplify (Cognito)
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: CSS3

## Prerequisites

- Node.js 18+
- npm or yarn
- AWS Cognito User Pool (configured)

## Environment Variables

Create a `.env` file:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=your_user_pool_id
REACT_APP_COGNITO_CLIENT_ID=your_client_id
REACT_APP_API_BASE_URL=http://localhost
```

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Runs on [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Project Structure

```
src/
├── pages/              # Page components
│   ├── HomePage.js
│   ├── ProductsPage.js
│   ├── ProductDetailPage.js
│   ├── CartPage.js
│   ├── CheckoutPage.js
│   ├── OrdersPage.js
│   └── ProfilePage.js
├── services/           # API services
│   └── api.js
├── App.js              # Main app component
├── App.css             # Global styles
└── index.js            # Entry point
```

## API Integration

The app communicates with 5 backend microservices:

- **User Service** (3001): Profile management
- **Catalog Service** (3002): Products and categories
- **Inventory Service** (3003): Stock availability
- **Order Service** (3004): Order management
- **Payment Service** (3005): Payment processing

## Key Features

### Authentication
- Uses AWS Amplify Authenticator component
- JWT tokens automatically attached to API requests
- Sign in/Sign up/Sign out flows

### Shopping Flow
1. Browse products
2. Add to cart (stored in localStorage)
3. Checkout with shipping details
4. Mock payment processing
5. Order confirmation

### Cart Management
- Persistent cart using localStorage
- Real-time quantity updates
- Cart total calculation with tax

## Mock Payment
The payment system is mocked with 90% success rate for academic purposes. No real payment processing occurs.

## Deployment

Can be deployed to:
- AWS S3 + CloudFront
- Vercel
- Netlify
- Any static hosting service

## License

MIT
