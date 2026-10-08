// Mock data for Apple Products E-commerce Platform
// Replace with actual API calls when backend is ready

export const mockProducts = [
  // iPhone Category
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system. Features a 6.7-inch Super Retina XDR display with ProMotion technology.',
    price: 1199.00,
    category: 'iPhone',
    brand: 'Apple',
    sku: 'IPHONE-15-PRO-MAX-256',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600',
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600'
    ]),
    tags: 'iPhone,Pro,flagship,5G,titanium',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Pro performance in a compact design. Features A17 Pro chip, triple camera system, and Action button. 6.1-inch Super Retina XDR display.',
    price: 999.00,
    category: 'iPhone',
    brand: 'Apple',
    sku: 'IPHONE-15-PRO-128',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
    ]),
    tags: 'iPhone,Pro,compact,5G,performance',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'iPhone 15',
    description: 'All-day battery life and a design you can depend on. Dynamic Island, 48MP main camera, and USB-C. Available in five stunning colors.',
    price: 799.00,
    category: 'iPhone',
    brand: 'Apple',
    sku: 'IPHONE-15-128',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'
    ]),
    tags: 'iPhone,standard,5G,affordable',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    name: 'iPhone 14',
    description: 'A total powerhouse. A15 Bionic chip, advanced dual-camera system, and Emergency SOS via satellite. Great value for essential iPhone features.',
    price: 699.00,
    category: 'iPhone',
    brand: 'Apple',
    sku: 'IPHONE-14-128',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
    ]),
    tags: 'iPhone,affordable,reliable,5G',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // MacBook Category
  {
    id: '5',
    name: 'MacBook Pro 16" M3 Max',
    description: 'The most powerful MacBook Pro ever. M3 Max chip with up to 16-core CPU and 40-core GPU. Up to 128GB unified memory. Perfect for professionals.',
    price: 3499.00,
    category: 'MacBook',
    brand: 'Apple',
    sku: 'MBP-16-M3-MAX-1TB',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600'
    ]),
    tags: 'MacBook,Pro,M3,professional,performance',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '6',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'Supercharged for pros. M3 Pro chip with 12-core CPU and 18-core GPU. Liquid Retina XDR display. Up to 18 hours battery life.',
    price: 1999.00,
    category: 'MacBook',
    brand: 'Apple',
    sku: 'MBP-14-M3-PRO-512',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600'
    ]),
    tags: 'MacBook,Pro,M3,portable,creator',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '7',
    name: 'MacBook Air 15" M2',
    description: 'Impressively big. Impossibly thin. M2 chip, up to 18 hours battery life, and a stunning 15.3-inch Liquid Retina display in a portable design.',
    price: 1299.00,
    category: 'MacBook',
    brand: 'Apple',
    sku: 'MBA-15-M2-256',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600'
    ]),
    tags: 'MacBook,Air,M2,thin,portable',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '8',
    name: 'MacBook Air 13" M2',
    description: 'Strikingly thin and fast. M2 chip, up to 18 hours battery life. Four stunning colors. Perfect for everyday tasks and lightweight portability.',
    price: 1099.00,
    category: 'MacBook',
    brand: 'Apple',
    sku: 'MBA-13-M2-256',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'
    ]),
    tags: 'MacBook,Air,M2,compact,student',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },

  // AirPods Category
  {
    id: '9',
    name: 'AirPods Pro (2nd generation)',
    description: 'Up to 2x more Active Noise Cancellation. Adaptive Audio. Spatial Audio. All-day battery life. Now with USB-C charging case.',
    price: 249.00,
    category: 'AirPods',
    brand: 'Apple',
    sku: 'AIRPODS-PRO-2-USBC',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600',
      'https://images.unsplash.com/photo-1625245488600-f89b8c7f366f?w=600'
    ]),
    tags: 'AirPods,Pro,noise-cancelling,premium,spatial-audio',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '10',
    name: 'AirPods (3rd generation)',
    description: 'Personalized Spatial Audio with dynamic head tracking. Sweat and water resistant. Up to 30 hours of total listening time with charging case.',
    price: 179.00,
    category: 'AirPods',
    brand: 'Apple',
    sku: 'AIRPODS-3-GEN',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600'
    ]),
    tags: 'AirPods,spatial-audio,wireless,comfort',
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '11',
    name: 'AirPods Max',
    description: 'Computational audio. High-fidelity sound. Active Noise Cancellation. Premium over-ear design with breathable knit mesh canopy.',
    price: 549.00,
    category: 'AirPods',
    brand: 'Apple',
    sku: 'AIRPODS-MAX-SILVER',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600',
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600'
    ]),
    tags: 'AirPods,Max,over-ear,premium,hi-fi',
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

// Categories aligned with Category model
export const mockCategories = [
  { 
    id: '1',
    name: 'iPhone', 
    description: 'Latest iPhone models with cutting-edge technology',
    slug: 'iphone',
    parentId: null,
    image: 'https://images.unsplash.com/photo-1678652197950-81971a7b0e4c?w=400',
    isActive: true,
    icon: '📱',
    count: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  { 
    id: '2',
    name: 'MacBook', 
    description: 'Powerful MacBook Pro and Air models for every need',
    slug: 'macbook',
    parentId: null,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    isActive: true,
    icon: '💻',
    count: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  { 
    id: '3',
    name: 'AirPods', 
    description: 'Premium wireless audio experience from Apple',
    slug: 'airpods',
    parentId: null,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    isActive: true,
    icon: '🎧',
    count: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock shipping options for global distribution
export const mockShippingOptions = [
  { 
    id: 1, 
    name: 'Standard Shipping', 
    price: 0, 
    duration: '5-7 business days',
    description: 'Free shipping for orders over $50' 
  },
  { 
    id: 2, 
    name: 'Express Shipping', 
    price: 15.99, 
    duration: '2-3 business days',
    description: 'Fast delivery to your doorstep' 
  },
  { 
    id: 3, 
    name: 'Next Day Delivery', 
    price: 29.99, 
    duration: '1 business day',
    description: 'Order by 2 PM for next day delivery' 
  },
  { 
    id: 4, 
    name: 'International Shipping', 
    price: 35.99, 
    duration: '7-14 business days',
    description: 'Worldwide delivery with tracking' 
  }
];

// Enterprise voucher codes for marketing campaigns
export const mockVouchers = [
  { 
    code: 'WELCOME10', 
    discount: 10, 
    type: 'percentage',
    description: 'Welcome discount for new customers',
    minPurchase: 50
  },
  { 
    code: 'SUMMER25', 
    discount: 25, 
    type: 'percentage',
    description: 'Summer sale special',
    minPurchase: 100
  },
  { 
    code: 'FREESHIP', 
    discount: 0, 
    type: 'free_shipping',
    description: 'Free shipping on all orders',
    minPurchase: 0
  },
  { 
    code: 'SAVE50', 
    discount: 50, 
    type: 'fixed',
    description: '$50 off your purchase',
    minPurchase: 200
  }
];

// Helper functions for data access (returns Promises to match API interface)
export const getProducts = (category = null) => {
  const products = !category 
    ? mockProducts 
    : mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  return Promise.resolve(products);
};

export const getFeaturedProducts = () => {
  const products = mockProducts.filter(p => p.isFeatured);
  return Promise.resolve(products);
};

export const getProductById = (id) => {
  const product = mockProducts.find(p => p.id === id || p.id === parseInt(id));
  return Promise.resolve(product);
};

export const validateVoucher = (code) => {
  const voucher = mockVouchers.find(v => v.code.toUpperCase() === code.toUpperCase());
  return Promise.resolve(voucher);
};

export const getCategoryById = (categoryId) => {
  const category = mockCategories.find(c => c.id === categoryId || c.slug === categoryId);
  return Promise.resolve(category);
};

export const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  const products = mockProducts.filter(p => {
    const tagsArray = p.tags ? p.tags.split(',') : [];
    return (
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.brand && p.brand.toLowerCase().includes(lowerQuery)) ||
      tagsArray.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
  return Promise.resolve(products);
};

// Mock data for Admin Dashboard
export const mockOrders = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD-2024-001',
    userId: 'user-1',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    status: 'COMPLETED',
    total_amount: 1998.00,
    totalAmount: 1998.00,
    subtotal: 1998.00,
    tax: 159.84,
    shippingCost: 0,
    paymentMethod: 'credit_card',
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    items: [
      {
        id: 'item-1',
        productId: '2',
        productName: 'iPhone 15 Pro',
        productSku: 'IPHONE-15-PRO-128',
        quantity: 2,
        price: 999.00,
        subtotal: 1998.00
      }
    ],
    createdAt: new Date('2024-01-20T10:30:00'),
    updatedAt: new Date('2024-01-25T14:20:00')
  },
  {
    id: 'ORD-002',
    orderNumber: 'ORD-2024-002',
    userId: 'user-2',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    status: 'SHIPPED',
    total_amount: 3499.00,
    totalAmount: 3499.00,
    subtotal: 3499.00,
    tax: 279.92,
    shippingCost: 0,
    paymentMethod: 'paypal',
    shippingAddress: {
      fullName: 'Jane Smith',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    items: [
      {
        id: 'item-2',
        productId: '5',
        productName: 'MacBook Pro 16" M3 Max',
        productSku: 'MBP-16-M3-MAX-1TB',
        quantity: 1,
        price: 3499.00,
        subtotal: 3499.00
      }
    ],
    createdAt: new Date('2024-01-22T14:15:00'),
    updatedAt: new Date('2024-01-26T09:30:00')
  },
  {
    id: 'ORD-003',
    orderNumber: 'ORD-2024-003',
    userId: 'user-3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike.j@example.com',
    status: 'PENDING',
    total_amount: 1048.00,
    totalAmount: 1048.00,
    subtotal: 1048.00,
    tax: 83.84,
    shippingCost: 0,
    paymentMethod: 'credit_card',
    shippingAddress: {
      fullName: 'Mike Johnson',
      address: '789 Pine Rd',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    items: [
      {
        id: 'item-3',
        productId: '3',
        productName: 'iPhone 15',
        productSku: 'IPHONE-15-128',
        quantity: 1,
        price: 799.00,
        subtotal: 799.00
      },
      {
        id: 'item-4',
        productId: '9',
        productName: 'AirPods Pro (2nd generation)',
        productSku: 'AIRPODS-PRO-2',
        quantity: 1,
        price: 249.00,
        subtotal: 249.00
      }
    ],
    createdAt: new Date('2024-01-28T16:45:00'),
    updatedAt: new Date('2024-01-28T16:45:00')
  },
  {
    id: 'ORD-004',
    orderNumber: 'ORD-2024-004',
    userId: 'user-4',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah.w@example.com',
    status: 'PROCESSING',
    total_amount: 2797.00,
    totalAmount: 2797.00,
    subtotal: 2797.00,
    tax: 223.76,
    shippingCost: 0,
    paymentMethod: 'credit_card',
    shippingAddress: {
      fullName: 'Sarah Williams',
      address: '321 Elm St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    items: [
      {
        id: 'item-5',
        productId: '6',
        productName: 'MacBook Pro 14" M3 Pro',
        productSku: 'MBP-14-M3-PRO-512',
        quantity: 1,
        price: 2499.00,
        subtotal: 2499.00
      },
      {
        id: 'item-6',
        productId: '10',
        productName: 'AirPods Max',
        productSku: 'AIRPODS-MAX-SILVER',
        quantity: 1,
        price: 549.00,
        subtotal: 549.00
      }
    ],
    createdAt: new Date('2024-01-27T11:20:00'),
    updatedAt: new Date('2024-01-28T08:15:00')
  },
  {
    id: 'ORD-005',
    orderNumber: 'ORD-2024-005',
    userId: 'user-5',
    customerName: 'David Brown',
    customerEmail: 'david.b@example.com',
    status: 'PENDING_PAYMENT',
    total_amount: 1199.00,
    totalAmount: 1199.00,
    subtotal: 1199.00,
    tax: 95.92,
    shippingCost: 0,
    paymentMethod: 'credit_card',
    shippingAddress: {
      fullName: 'David Brown',
      address: '555 Maple Dr',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    items: [
      {
        id: 'item-7',
        productId: '1',
        productName: 'iPhone 15 Pro Max',
        productSku: 'IPHONE-15-PRO-MAX-256',
        quantity: 1,
        price: 1199.00,
        subtotal: 1199.00
      }
    ],
    createdAt: new Date('2024-01-29T13:00:00'),
    updatedAt: new Date('2024-01-29T13:00:00')
  }
];

export const mockAdminStats = {
  totalProducts: mockProducts.length,
  totalOrders: mockOrders.length,
  totalRevenue: mockOrders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.total_amount, 0),
  pendingOrders: mockOrders.filter(o => 
    o.status === 'PENDING' || o.status === 'PENDING_PAYMENT'
  ).length,
  monthlyRevenue: [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 15800 },
    { month: 'Mar', revenue: 18200 },
    { month: 'Apr', revenue: 16900 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 19500 }
  ],
  topProducts: [
    { name: 'iPhone 15 Pro Max', sales: 45, revenue: 53955 },
    { name: 'MacBook Pro 16" M3 Max', sales: 12, revenue: 41988 },
    { name: 'AirPods Pro (2nd gen)', sales: 78, revenue: 19422 },
    { name: 'MacBook Air 15" M2', sales: 28, revenue: 33572 },
    { name: 'iPhone 15 Pro', sales: 62, revenue: 61938 }
  ],
  ordersByStatus: {
    PENDING: 1,
    PENDING_PAYMENT: 1,
    PROCESSING: 1,
    SHIPPED: 1,
    COMPLETED: 1,
    CANCELLED: 0,
    FAILED: 0
  }
};

// Admin helper functions
export const getAllOrders = () => {
  return Promise.resolve(mockOrders);
};

export const getOrderById = (orderId) => {
  const order = mockOrders.find(o => o.id === orderId || o.orderNumber === orderId);
  return Promise.resolve(order);
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orderIndex = mockOrders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    mockOrders[orderIndex].status = newStatus;
    mockOrders[orderIndex].updatedAt = new Date();
    return Promise.resolve(mockOrders[orderIndex]);
  }
  return Promise.reject(new Error('Order not found'));
};

export const getDashboardStats = () => {
  return Promise.resolve(mockAdminStats);
};

export const getRevenueByPeriod = (period = 'month') => {
  return Promise.resolve(mockAdminStats.monthlyRevenue);
};

export const getTopProducts = (limit = 5) => {
  return Promise.resolve(mockAdminStats.topProducts.slice(0, limit));
};

export const getOrdersByStatus = () => {
  return Promise.resolve(mockAdminStats.ordersByStatus);
};

