import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  Space,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import './AdminPage.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const AdminPage = () => {
  const { logout, user } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal states
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [inventoryLogsModalVisible, setInventoryLogsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null);
  const [selectedProductForLogs, setSelectedProductForLogs] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });

  // Forms
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [inventoryForm] = Form.useForm();

  // Load data on mount
  useEffect(() => {
    loadCategories();
    if (selectedMenu === 'products') {
      loadProducts();
    } else if (selectedMenu === 'orders') {
      loadOrders();
    } else if (selectedMenu === 'inventory') {
      loadProducts(); // Load products for name mapping
      loadInventory();
    } else if (selectedMenu === 'dashboard') {
      loadDashboardStats();
    }
  }, [selectedMenu]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to load categories');
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await api.getProducts();
      // Handle new API response structure
      const productList = result.products || (Array.isArray(result) ? result : []);
      setProducts(productList);
    } catch (error) {
      message.error('Failed to load products');
      setProducts([]);
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAllOrders();
      const ordersList = Array.isArray(data) ? data : (data.orders || data.data || []);
      setOrders(ordersList);
    } catch (error) {
      console.error('Load orders error:', error);
      message.error('Failed to load orders');
      setOrders([]);
    }
    setLoading(false);
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const result = await api.getAllInventory();
      const inventoryList = result.items || [];
      setInventory(inventoryList);
    } catch (error) {
      message.error('Failed to load inventory');
      setInventory([]);
    }
    setLoading(false);
  };

  const loadInventoryLogs = async (productId) => {
    setLoading(true);
    try {
      const result = await api.getInventoryLogs(productId);
      setInventoryLogs(result.logs || []);
    } catch (error) {
      message.error('Failed to load inventory logs');
      setInventoryLogs([]);
    }
    setLoading(false);
  };

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const [productsResult, ordersData, inventoryResult] = await Promise.all([
        api.getProducts({ limit: 100 }), // Get all products
        api.getAllOrders(),
        api.getAllInventory().catch(() => ({ items: [] })),
      ]);

      const products = productsResult.products || (Array.isArray(productsResult) ? productsResult : []);
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || ordersData.data || []);
      
      // Use pagination totals if available, otherwise use array length
      const totalProducts = productsResult.pagination?.total || products.length;
      const totalOrders = orders.length;
      
      const inventoryItems = inventoryResult.items || [];

      // Calculate revenue from completed/paid orders (handle both field names)
      const totalRevenue = orders
        .filter((o) => o.status === 'COMPLETED' || o.status === 'PAID')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || o.totalAmount || 0), 0);

      const pendingOrders = orders.filter(
        (o) => o.status === 'PENDING' || o.status === 'PENDING_PAYMENT'
      ).length;

      // Count low stock items (availableQty < 10)
      const lowStockItems = inventoryItems.filter(
        (item) => item.availableQty < 10
      ).length;

      setStats({
        totalProducts: totalProducts,
        totalOrders: totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockItems: lowStockItems,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      message.error('Failed to load dashboard stats');
    }
    setLoading(false);
  };

  // Product CRUD
  const handleCreateProduct = () => {
    setEditingProduct(null);
    productForm.resetFields();
    setImageFiles([]);
    setProductModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    // Find category ID from category name
    const category = categories.find(cat => cat.name === product.category);
    const categoryId = category ? category.id : null;
    
    productForm.setFieldsValue({
      ...product,
      category_id: categoryId, // Set category_id for the select dropdown
    });
    setImageFiles([]);
    setProductModalVisible(true);
  };

  const handleSaveProduct = async () => {
    try {
      const values = await productForm.validateFields();
      setLoading(true);

      // Find category name from category_id
      const selectedCategory = categories.find(cat => cat.id === values.category_id);
      const categoryName = selectedCategory ? selectedCategory.name : '';

      // Prepare product data
      const productData = {
        name: values.name,
        price: values.price,
        category: categoryName, // Send category name instead of ID
        sku: values.sku,
        description: values.description || '',
        brand: values.brand || '',
        tags: values.tags || '',
        isFeatured: values.isFeatured || false,
      };

      let result;
      if (editingProduct) {
        result = await api.updateProduct(editingProduct.id, productData, imageFiles);
      } else {
        result = await api.createProduct(productData, imageFiles);
      }

      if (result.success) {
        message.success(result.message || 'Product saved successfully');
        setProductModalVisible(false);
        loadProducts();
      } else {
        message.error(result.message || 'Failed to save product');
      }
    } catch (error) {
      message.error('Failed to save product');
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      message.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      message.warning('You can only upload up to 5 images');
      setImageFiles(files.slice(0, 5));
    } else {
      setImageFiles(files);
    }
  };

  // Category CRUD
  const handleCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      setLoading(true);

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, values);
        message.success('Category updated successfully');
      } else {
        await api.createCategory(values);
        message.success('Category created successfully');
      }

      setCategoryModalVisible(false);
      loadCategories();
    } catch (error) {
      message.error('Failed to save category');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      message.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  // Inventory CRUD
  const handleCreateInventory = () => {
    setEditingInventory(null);
    inventoryForm.resetFields();
    setInventoryModalVisible(true);
  };

  const handleEditInventory = (inventory) => {
    setEditingInventory(inventory);
    inventoryForm.setFieldsValue({
      productId: inventory.productId,
      quantity: inventory.quantity,
      reorderLevel: inventory.reorderLevel,
      reorderQuantity: inventory.reorderQuantity,
    });
    setInventoryModalVisible(true);
  };

  const handleSaveInventory = async () => {
    try {
      const values = await inventoryForm.validateFields();
      setLoading(true);

      let result;
      if (editingInventory) {
        // Update existing inventory
        result = await api.updateInventoryStock(values.productId, {
          quantity: values.quantity,
          changeType: 'adjustment',
          reason: 'Admin adjustment',
        });
      } else {
        // Create new inventory - need to get product SKU
        const product = products.find(p => p.id === values.productId);
        
        if (!product) {
          message.error('Product not found');
          setLoading(false);
          return;
        }

        if (!product.sku) {
          message.error('Product SKU is missing. Please update product details first.');
          setLoading(false);
          return;
        }

        result = await api.createInventory({
          productId: values.productId,
          productSku: product.sku,
          quantity: values.quantity,
          reservedQty: 0,
          reorderLevel: values.reorderLevel || 10,
          reorderQty: values.reorderQuantity || 50,
        });
      }

      if (result.success) {
        message.success(editingInventory ? 'Inventory updated successfully' : 'Inventory created successfully');
        setInventoryModalVisible(false);
        loadInventory();
      } else {
        message.error(result.message || 'Failed to save inventory');
      }
    } catch (error) {
      message.error('Failed to save inventory');
    }
    setLoading(false);
  };

  const handleRestockInventory = async (productId) => {
    Modal.confirm({
      title: 'Restock Inventory',
      content: (
        <Form
          id="restockForm"
          layout="vertical"
          onFinish={async (values) => {
            try {
              const result = await api.updateInventoryStock(productId, {
                quantity: values.quantity,
                changeType: 'restock',
                reason: values.reason || 'Manual restock',
              });
              if (result.success) {
                message.success('Stock restocked successfully');
                loadInventory();
                Modal.destroyAll();
              } else {
                message.error(result.message || 'Failed to restock');
              }
            } catch (error) {
              message.error('Failed to restock inventory');
            }
          }}
        >
          <Form.Item
            name="quantity"
            label="Quantity to Add"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason">
            <Input.TextArea rows={2} placeholder="Optional reason" />
          </Form.Item>
        </Form>
      ),
      okText: 'Restock',
      onOk: () => {
        document.getElementById('restockForm')?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
      },
    });
  };

  const handleViewLogs = async (inventory) => {
    setSelectedProductForLogs(inventory);
    await loadInventoryLogs(inventory.productId);
    setInventoryLogsModalVisible(true);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Table columns
  const productColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      width: 50,
      render: (images) => (
        <img
          src={images?.[0] || 'https://via.placeholder.com/50'}
          alt="Product"
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (categoryName) => categoryName || 'N/A',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
          />
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
    },
    {
      title: 'Parent Category',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => {
        if (!parentId) return '-';
        const parent = categories.find(cat => cat.id === parentId);
        return parent ? parent.name : parentId;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          />
          <Popconfirm
            title="Are you sure to delete this category?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      render: (orderNumber) => <span style={{ fontWeight: 500 }}>{orderNumber}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 200,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (total) => `$${parseFloat(total || 0).toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const colorMap = {
          PENDING: 'orange',
          PENDING_PAYMENT: 'blue',
          PAID: 'green',
          PROCESSING: 'cyan',
          COMPLETED: 'green',
          CANCELLED: 'red',
          FAILED: 'red',
        };
        return (
          <Tag 
            color={colorMap[status] || 'default'} 
            style={{ 
              borderRadius: '4px', 
              padding: '2px 12px',
              fontWeight: '500'
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    },
  ];

  // Helper function to get product name from ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  };

  const inventoryColumns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (productId) => {
        const product = products.find(p => p.id === productId);
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{product?.name || 'Unknown Product'}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{productId}</div>
          </div>
        );
      },
    },
    {
      title: 'Total Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity) => <strong>{quantity}</strong>,
    },
    {
      title: 'Reserved',
      dataIndex: 'reservedQty',
      key: 'reservedQty',
      width: 100,
      render: (reserved) => (
        <Tag 
          color="orange" 
          style={{ 
            borderRadius: '4px', 
            padding: '2px 12px',
            fontWeight: '500'
          }}
        >
          {reserved || 0}
        </Tag>
      ),
    },
    {
      title: 'Available',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 100,
      render: (available, record) => {
        const qty = available !== undefined ? available : (record.quantity - (record.reservedQty || 0));
        const isLow = record.reorderLevel && qty <= record.reorderLevel;
        return (
          <Tag 
            color={isLow ? 'red' : 'green'}
            style={{ 
              borderRadius: '4px', 
              padding: '2px 12px',
              fontWeight: '500'
            }}
          >
            {qty}
          </Tag>
        );
      },
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      width: 120,
    },
    {
      title: 'Last Restocked',
      dataIndex: 'lastRestocked',
      key: 'lastRestocked',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleRestockInventory(record.productId)}
          >
            Restock
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditInventory(record)}
          />
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => handleViewLogs(record)}
          >
            Logs
          </Button>
        </Space>
      ),
    },
  ];

  const inventoryLogsColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Change Type',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 120,
      render: (type) => {
        const colorMap = {
          restock: 'green',
          reserve: 'orange',
          release: 'blue',
          sale_confirmed: 'purple',
          adjustment: 'cyan',
        };
        return (
          <Tag 
            color={colorMap[type] || 'default'}
            style={{ 
              borderRadius: '4px', 
              padding: '2px 12px',
              fontWeight: '500'
            }}
          >
            {type?.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Before',
      dataIndex: 'quantityBefore',
      key: 'quantityBefore',
      width: 80,
    },
    {
      title: 'After',
      dataIndex: 'quantityAfter',
      key: 'quantityAfter',
      width: 80,
    },
    {
      title: 'Changed',
      dataIndex: 'quantityChanged',
      key: 'quantityChanged',
      width: 80,
      render: (changed) => (
        <span style={{ color: changed > 0 ? 'green' : changed < 0 ? 'red' : 'gray' }}>
          {changed > 0 ? '+' : ''}{changed}
        </span>
      ),
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (orderId) => orderId || '-',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
  ];

  // Render content based on selected menu
  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div style={{ background: '#f5f7fa', padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '600', 
                color: '#1a1a1a',
                margin: 0
              }}>Dashboard</h2>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Overview of your store performance</p>
            </div>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  bordered={false}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: '#2d3748'
                  }}
                >
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Products</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                      <ShoppingOutlined style={{ marginRight: '12px', fontSize: '28px' }} />
                      {stats.totalProducts}
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  bordered={false}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: '#1a202c'
                  }}
                >
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Orders</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                      <ShoppingCartOutlined style={{ marginRight: '12px', fontSize: '28px' }} />
                      {stats.totalOrders}
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  bordered={false}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: '#4a5568'
                  }}
                >
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                      ${parseFloat(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  bordered={false}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: '#718096'
                  }}
                >
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Orders</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                      {stats.pendingOrders}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  bordered={false}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: stats.lowStockItems > 0 ? '#374151' : '#6b7280'
                  }}
                >
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Low Stock Items</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                      {stats.lowStockItems} {stats.lowStockItems > 0 ? '⚠️' : '✓'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {stats.lowStockItems > 0 ? 'Action required' : 'All items stocked'}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'products':
        return (
          <div style={{ background: '#f5f7fa', padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '600', 
                  color: '#1a1a1a',
                  margin: 0
                }}>Products</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Manage your product catalog</p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateProduct}
                style={{
                  background: '#1a202c',
                  border: 'none',
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                Add Product
              </Button>
            </div>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Table
                columns={productColumns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            </Card>
          </div>
        );

      case 'categories':
        return (
          <div style={{ background: '#f5f7fa', padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '600', 
                  color: '#1a1a1a',
                  margin: 0
                }}>Categories</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Organize your products</p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateCategory}
                style={{
                  background: '#1a202c',
                  border: 'none',
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                Add Category
              </Button>
            </div>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Table
                columns={categoryColumns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </div>
        );

      case 'inventory':
        return (
          <div style={{ background: '#f5f7fa', padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '600', 
                  color: '#1a1a1a',
                  margin: 0
                }}>Inventory Management</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Track and manage stock levels</p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateInventory}
                style={{
                  background: '#1a202c',
                  border: 'none',
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                Add Inventory
              </Button>
            </div>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Table
                columns={inventoryColumns}
                dataSource={inventory}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            </Card>
          </div>
        );

      case 'orders':
        return (
          <div style={{ background: '#f5f7fa', padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '600', 
                color: '#1a1a1a',
                margin: 0
              }}>Orders</h2>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>View and manage customer orders</p>
            </div>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Table
                columns={orderColumns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light" style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}>
        <div className="p-4 text-center border-b" style={{ padding: '24px 16px' }}>
          <h1 className="text-xl font-bold" style={{ 
            color: '#1a202c',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0
          }}>
            CloudRetail
          </h1>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'products',
              icon: <ShoppingOutlined />,
              label: 'Products',
            },
            {
              key: 'categories',
              icon: <TagsOutlined />,
              label: 'Categories',
            },
            {
              key: 'inventory',
              icon: <AppstoreOutlined />,
              label: 'Inventory',
            },
            {
              key: 'orders',
              icon: <ShoppingCartOutlined />,
              label: 'Orders',
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{ 
            background: '#fff', 
            padding: '0 32px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 10
          }}
        >
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="admin-profile-dropdown-wrapper">
              <button 
                className="admin-profile-icon-btn" 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {showProfileDropdown && (
                <>
                  <div 
                    className="admin-dropdown-overlay" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="admin-profile-dropdown">
                    <div className="admin-dropdown-header">
                      <div className="admin-user-email">{user?.email}</div>
                    </div>
                    <button 
                      className="admin-dropdown-item admin-logout-item"
                      onClick={handleLogout}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Header>

        <Content style={{ margin: 0, background: '#f5f7fa', padding: 0 }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Product Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
            {editingProduct ? 'Edit Product' : 'Create Product'}
          </div>
        }
        open={productModalVisible}
        onOk={handleSaveProduct}
        onCancel={() => setProductModalVisible(false)}
        confirmLoading={loading}
        width={900}
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: '#1a202c',
            border: 'none',
            borderRadius: '6px',
            height: '36px',
            color: 'white'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px',
            height: '36px'
          }
        }}
      >
        <Form form={productForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="e.g., MacBook Pro 16-inch" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input placeholder="e.g., MBP16-2024" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select a category">
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="brand" label="Brand">
                <Input placeholder="e.g., Apple" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="isFeatured" label="Featured Product" valuePropName="checked" initialValue={false}>
                <Select defaultValue={false}>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="Tags">
            <Input placeholder="e.g., laptop, professional, 16-inch" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Product description" />
          </Form.Item>

          <Form.Item label="Product Images">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
              Upload up to 5 images. Selected: {imageFiles.length}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </div>
        }
        open={categoryModalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setCategoryModalVisible(false)}
        confirmLoading={loading}
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: '#1a202c',
            border: 'none',
            borderRadius: '6px',
            height: '36px',
            color: 'white'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px',
            height: '36px'
          }
        }}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g., Electronics" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Please enter category slug' }]}
          >
            <Input placeholder="e.g., electronics" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Category">
            <Select placeholder="Select parent category (optional)" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Inventory Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
            {editingInventory ? 'Edit Inventory' : 'Add Inventory'}
          </div>
        }
        open={inventoryModalVisible}
        onOk={handleSaveInventory}
        onCancel={() => setInventoryModalVisible(false)}
        confirmLoading={loading}
        width={600}
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: '#1a202c',
            border: 'none',
            borderRadius: '6px',
            height: '36px',
            color: 'white'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px',
            height: '36px'
          }
        }}
      >
        <Form form={inventoryForm} layout="vertical">
          {editingInventory ? (
            <Form.Item
              name="productId"
              label="Product ID"
              rules={[{ required: true, message: 'Please enter product ID' }]}
            >
              <Input 
                placeholder="e.g., prod-001" 
                disabled={true}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="productId"
              label="Product"
              rules={[{ required: true, message: 'Please select a product' }]}
            >
              <Select 
                placeholder="Select a product"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={products.map(product => ({
                  value: product.id,
                  label: product.name,
                  key: product.id
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="quantity"
            label="Total Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="Initial stock quantity"
            />
          </Form.Item>

          <Form.Item
            name="reorderLevel"
            label="Reorder Level"
            tooltip="Minimum quantity before reorder alert"
            initialValue={10}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="e.g., 10"
            />
          </Form.Item>

          <Form.Item
            name="reorderQuantity"
            label="Reorder Quantity"
            tooltip="Quantity to order when stock is low"
            initialValue={50}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="e.g., 50"
            />
          </Form.Item>

          {editingInventory && (
            <div style={{ 
              padding: '12px', 
              background: '#f5f5f5', 
              borderRadius: '4px',
              marginTop: '16px'
            }}>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>Current Reserved:</strong> {editingInventory.reservedQty || 0}
              </p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>Current Available:</strong> {editingInventory.availableQty || 0}
              </p>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                Note: Adjusting quantity will update available stock
              </p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Inventory Logs Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
            Inventory Logs - {selectedProductForLogs?.productId || ''}
          </div>
        }
        open={inventoryLogsModalVisible}
        onCancel={() => {
          setInventoryLogsModalVisible(false);
          setSelectedProductForLogs(null);
          setInventoryLogs([]);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setInventoryLogsModalVisible(false);
              setSelectedProductForLogs(null);
              setInventoryLogs([]);
            }}
            style={{
              borderRadius: '6px',
              height: '36px'
            }}
          >
            Close
          </Button>
        ]}
        width={1000}
      >
        <Table
          columns={inventoryLogsColumns}
          dataSource={inventoryLogs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </Layout>
  );
};

export default AdminPage;
