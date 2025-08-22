# Sales Management System

A comprehensive web-based sales management system built with HTML, CSS, and JavaScript. This application allows sales managers to manage products, record sales, and generate detailed reports - all without requiring a backend server.

## Features

### 🔐 Authentication System
- **User Registration**: Create new sales manager accounts
- **User Login**: Secure authentication with localStorage
- **Session Management**: Automatic login persistence
- **Logout**: Secure session termination

### 📊 Dashboard
- **Real-time Statistics**: Total sales, orders, products, and low stock alerts
- **Interactive Charts**: 
  - Sales overview chart (last 7 days)
  - Top products doughnut chart
- **Recent Sales**: Latest 5 sales transactions
- **Low Stock Alerts**: Products with stock below 10 units

### 📦 Product Management
- **Add Products**: Create new products with name, price, category, and stock quantity
- **Product List**: View all products in a clean table format
- **Delete Products**: Remove products from inventory
- **Stock Tracking**: Automatic stock updates when sales are recorded

### 💰 Sales Recording
- **Easy Sales Entry**: Select product, enter quantity, date auto-filled
- **Stock Validation**: Prevents overselling with real-time stock checks
- **Automatic Calculations**: Total price calculated automatically
- **Recent Sales View**: Display latest 10 sales transactions

### 📈 Reports & Analytics
- **Flexible Time Periods**: Today, Last 7 Days, Last 30 Days, All Time
- **Comprehensive Metrics**:
  - Total sales amount
  - Number of items sold
  - Top performing product
- **Detailed Sales Table**: Complete transaction history
- **Export Functionality**: Download reports as CSV files
- **Print Support**: Print-friendly report layouts

## Technical Implementation

### Frontend Only
- **No Backend Required**: All data stored in browser localStorage
- **Pure JavaScript**: No frameworks or libraries except Chart.js for visualizations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

### Data Storage
- **localStorage**: All data persists in browser storage
- **JSON Format**: Structured data storage for users, products, and sales
- **Automatic Initialization**: Creates default data structures on first use

### Charts & Visualizations
- **Chart.js Integration**: Professional charts for data visualization
- **Real-time Updates**: Charts refresh automatically with new data
- **Responsive Charts**: Adapt to different screen sizes

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download all files to a local directory
2. Open `index.html` in your web browser
3. The application will load automatically

### First Time Setup
1. **Create Account**: Click "Sign Up" and create your first sales manager account
2. **Login**: Use your credentials to access the system
3. **Add Products**: Navigate to Products section and add your inventory
4. **Start Recording Sales**: Use the Sales section to record transactions
5. **View Reports**: Generate and export sales reports as needed

## Usage Guide

### Adding Products
1. Navigate to the "Products" section
2. Click "Add New Product"
3. Fill in the product details:
   - Product Name
   - Price (in dollars)
   - Category
   - Stock Quantity
4. Click "Add Product"

### Recording Sales
1. Go to the "Record Sales" section
2. Select a product from the dropdown
3. Enter the quantity sold
4. The date will be automatically set to today
5. Click "Record Sale"
6. Stock will be automatically updated

### Generating Reports
1. Navigate to the "Reports" section
2. Choose a time period:
   - Today
   - Last 7 Days
   - Last 30 Days
   - All Time
3. View the summary statistics
4. Use "Print Report" for hard copies
5. Use "Export CSV" to download data

### Dashboard Overview
- **Total Sales**: Cumulative revenue from all sales
- **Total Orders**: Number of sales transactions
- **Products Available**: Total number of products in inventory
- **Low Stock Items**: Products with stock below 10 units

## File Structure

```
sales-management-system/
├── index.html          # Main application file
├── styles.css          # All styling and responsive design
├── script.js           # Application logic and functionality
└── README.md           # This documentation file
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Data Persistence

All data is stored locally in your browser's localStorage:
- **Users**: Registered sales manager accounts
- **Products**: Product inventory and details
- **Sales**: All sales transactions and history

⚠️ **Important**: Data is stored locally in your browser. Clearing browser data will remove all stored information.

## Security Features

- **Password Validation**: Ensures password confirmation matches
- **Username Uniqueness**: Prevents duplicate usernames
- **Session Management**: Automatic login state management
- **Input Validation**: Form validation for all user inputs

## Customization

### Adding New Features
The modular JavaScript structure makes it easy to add new features:
- Add new chart types in the dashboard
- Create additional report filters
- Implement product categories management
- Add user roles and permissions

### Styling Customization
The CSS is well-organized and commented for easy customization:
- Color schemes can be modified in the CSS variables
- Layout adjustments for different screen sizes
- Custom animations and transitions

## Troubleshooting

### Common Issues

**Charts not displaying:**
- Ensure internet connection (Chart.js is loaded from CDN)
- Check browser console for JavaScript errors

**Data not saving:**
- Verify localStorage is enabled in your browser
- Check browser storage limits

**Login issues:**
- Clear browser data and create a new account
- Ensure username and password match exactly

### Browser Console Errors
If you encounter issues, check the browser's developer console (F12) for error messages. Most issues can be resolved by:
1. Refreshing the page
2. Clearing browser cache
3. Creating a new account

## Future Enhancements

Potential improvements for future versions:
- **Data Export**: Additional export formats (Excel, PDF)
- **Advanced Analytics**: More detailed reporting options
- **Product Images**: Support for product photos
- **Multi-user Support**: Multiple sales managers
- **Backup/Restore**: Data backup functionality
- **Offline Support**: Service worker for offline access

## Support

For technical support or feature requests, please refer to the code comments or create an issue in the project repository.

---

**Note**: This is a frontend-only application designed for demonstration and small business use. For production environments with multiple users, consider implementing a proper backend database system.
