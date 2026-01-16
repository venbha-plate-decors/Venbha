import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Helmet>
                <title>Admin Dashboard | Venbha Plate Decors</title>
            </Helmet>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header-mobile">
                    <div className="sidebar-brand">VENBHA ADMIN</div>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
                </div>
                <nav className="sidebar-nav">
                    <a className="nav-item active">
                        <span className="nav-icon">📊</span> Dashboard
                    </a>
                    <a className="nav-item">
                        <span className="nav-icon">🛍️</span> Products
                    </a>
                    <a className="nav-item">
                        <span className="nav-icon">📦</span> Orders
                    </a>
                    <a className="nav-item">
                        <span className="nav-icon">👥</span> Customers
                    </a>
                    <a className="nav-item">
                        <span className="nav-icon">🎨</span> Designs
                    </a>
                    <a className="nav-item">
                        <span className="nav-icon">⚙️</span> Settings
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <motion.div
                    className="dashboard-header"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="header-left">
                        <button className="menu-toggle-btn" onClick={toggleSidebar}>
                            ☰
                        </button>
                        <div className="header-title">
                            <h1>Dashboard Overview</h1>
                            <p>Welcome back, Admin! Here's what's happening today.</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="admin-profile">
                            <div className="admin-avatar">AD</div>
                            <span className="admin-name">Admin User</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    className="stats-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-info">
                            <h3>Total Sales</h3>
                            <p className="stat-value">$24,500</p>
                            <span className="stat-change positive">↑ 12% from last month</span>
                        </div>
                        <div className="stat-icon sales">💰</div>
                    </motion.div>

                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-info">
                            <h3>Active Orders</h3>
                            <p className="stat-value">45</p>
                            <span className="stat-change positive">↑ 5 new today</span>
                        </div>
                        <div className="stat-icon orders">📦</div>
                    </motion.div>

                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-info">
                            <h3>Total Designs</h3>
                            <p className="stat-value">128</p>
                            <span className="stat-change">Added 3 new this week</span>
                        </div>
                        <div className="stat-icon products">🖼️</div>
                    </motion.div>

                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-info">
                            <h3>Total Customers</h3>
                            <p className="stat-value">1,250</p>
                            <span className="stat-change positive">↑ 18% growth</span>
                        </div>
                        <div className="stat-icon users">👥</div>
                    </motion.div>
                </motion.div>

                {/* Recent Orders Table */}
                <motion.div
                    className="recent-orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="section-header">
                        <h2>Recent Orders</h2>
                        <a href="#" className="view-all">View All</a>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#ORD-2451</td>
                                    <td>Sarah Johnson</td>
                                    <td>Traditional Wedding Plate</td>
                                    <td>Today, 10:23 AM</td>
                                    <td>$120.00</td>
                                    <td><span className="status-badge completed">Completed</span></td>
                                </tr>
                                <tr>
                                    <td>#ORD-2450</td>
                                    <td>Michael Chen</td>
                                    <td>Modern Floral Set</td>
                                    <td>Yesterday</td>
                                    <td>$85.50</td>
                                    <td><span className="status-badge processing">Processing</span></td>
                                </tr>
                                <tr>
                                    <td>#ORD-2449</td>
                                    <td>Priya Patel</td>
                                    <td>Gold Leaf Collection</td>
                                    <td>Oct 24, 2025</td>
                                    <td>$24.00</td>
                                    <td><span className="status-badge pending">Pending</span></td>
                                </tr>
                                <tr>
                                    <td>#ORD-2448</td>
                                    <td>Emily Davis</td>
                                    <td>Custom Engraved Plate</td>
                                    <td>Oct 24, 2025</td>
                                    <td>$145.00</td>
                                    <td><span className="status-badge completed">Completed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AdminDashboard;
