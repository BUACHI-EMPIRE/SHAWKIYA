// Global variables
let currentUser = null;
let salesChart = null;
let productsChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    initializeAuthUX();
    initializeTheme();
});

// Initialize the application
function initializeApp() {
    // Initialize localStorage with default data if empty
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('sales')) {
        localStorage.setItem('sales', JSON.stringify([]));
    }
    
    // Set today's date as default for sales form
    const today = new Date().toISOString().split('T')[0];
    const salesDateInput = document.getElementById('sales-date');
    if (salesDateInput) {
        salesDateInput.value = today;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Authentication forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Product form
    document.getElementById('product-form').addEventListener('submit', handleAddProduct);
    document.getElementById('product-edit-form').addEventListener('submit', handleEditProductSave);
    
    // Sales form
    document.getElementById('sales-form').addEventListener('submit', handleRecordSale);
}

// Initialize auth UX interactions
function initializeAuthUX() {
    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            this.textContent = isPassword ? 'Hide' : 'Show';
        });
    });

    // Password strength meter
    const signupPasswordInput = document.getElementById('signup-password');
    if (signupPasswordInput) {
        signupPasswordInput.addEventListener('input', updatePasswordStrength);
    }
}

// Theme handling
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    const authToggle = document.getElementById('auth-theme-toggle');
    const appToggle = document.getElementById('app-theme-toggle');

    [authToggle, appToggle].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            setTheme(next);
        });
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const authToggle = document.getElementById('auth-theme-toggle');
    const appToggle = document.getElementById('app-theme-toggle');
    const label = theme === 'dark' ? '🌞 Light' : '🌙 Dark';
    if (authToggle) authToggle.textContent = label;
    if (appToggle) appToggle.textContent = label;
}

// Authentication Functions
function showAuthForm(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.querySelector('.auth-tab:first-child');
    const signupTab = document.querySelector('.auth-tab:last-child');
    
    if (type === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    clearFieldErrors(['login-username','login-password']);
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;
    
    let hasError = false;
    if (!username) {
        setFieldError('login-username', 'Username is required');
        hasError = true;
    }
    if (!password) {
        setFieldError('login-password', 'Password is required');
        hasError = true;
    }
    if (hasError) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        // Persist session based on remember me
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.removeItem('currentUser');
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.removeItem('currentUser');
        }
        showApp();
        showAlert('Login successful!', 'success');
    } else {
        setFieldError('login-username', '');
        setFieldError('login-password', 'Invalid username or password');
        showAlert('Invalid username or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    clearFieldErrors(['signup-username','signup-email','signup-password','signup-confirm-password']);
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    let hasError = false;
    if (username.length < 3) {
        setFieldError('signup-username', 'Username must be at least 3 characters');
        hasError = true;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        setFieldError('signup-email', 'Enter a valid email');
        hasError = true;
    }
    const strength = calculatePasswordStrength(password);
    if (strength.score < 2) {
        setFieldError('signup-password', 'Password is too weak');
        hasError = true;
    }
    
    if (password !== confirmPassword) {
        setFieldError('signup-confirm-password', 'Passwords do not match');
        hasError = true;
    }
    if (hasError) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.username === username)) {
        setFieldError('signup-username', 'Username already exists');
        showAlert('Username already exists', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username,
        email,
        password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert('Account created successfully! Please login.', 'success');
    showAuthForm('login');
    
    // Clear form
    document.getElementById('signup-form').reset();
}

function checkAuthStatus() {
    const savedSession = sessionStorage.getItem('currentUser');
    const savedLocal = localStorage.getItem('currentUser');
    const savedUser = savedSession || savedLocal;
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
}

function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('current-user').textContent = `Welcome, ${currentUser.username}`;
    
    // Load initial data
    loadDashboard();
    loadProducts();
    loadSales();
    updateProductSelect();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    
    // Clear forms
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
}

// Navigation Functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked nav button or find the matching one
    if (typeof event !== 'undefined' && event && event.target) {
        event.target.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-btn[onclick="showSection('${sectionName}')"]`);
        if (btn) btn.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'sales':
            loadSales();
            break;
        case 'reports':
            generateReport('all');
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    updateDashboardStats();
    updateDashboardCharts();
    updateRecentSales();
    updateLowStockAlert();
}

function updateDashboardStats() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalOrders = sales.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock < 10).length;
    
    document.getElementById('total-sales').textContent = `₵${totalSales.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('low-stock-count').textContent = lowStockCount;
}

function updateDashboardCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        showAlert('Charts are loading, please wait...', 'warning');
        // Retry after a short delay
        setTimeout(updateDashboardCharts, 1000);
        return;
    }
    
    createSalesChart();
    createProductsChart();
}

function createSalesChart() {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) {
        console.error('Sales chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context for sales chart');
        return;
    }
    
    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }
    
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const last7Days = getLast7Days();
    
    const salesData = last7Days.map(date => {
        const daySales = sales.filter(sale => sale.date === date);
        return daySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    });
    
    try {
        salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(date => formatDate(date)),
                datasets: [{
                    label: 'Daily Sales (₵)',
                    data: salesData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                                                    callback: function(value) {
                            return '₵' + value.toFixed(2);
                        }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 6
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating sales chart:', error);
        // Show error message to user
        const chartContainer = canvas.parentElement;
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="alert error">Unable to load sales chart. Please refresh the page.</div>';
        }
    }
}

function createProductsChart() {
    const canvas = document.getElementById('products-chart');
    if (!canvas) {
        console.error('Products chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context for products chart');
        return;
    }
    
    // Destroy existing chart if it exists
    if (productsChart) {
        productsChart.destroy();
    }
    
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Get top 5 products by sales quantity
    const productSales = {};
    sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            productSales[product.name] = (productSales[product.name] || 0) + sale.quantity;
        }
    });
    
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    try {
        productsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: topProducts.map(([name]) => name),
                datasets: [{
                    data: topProducts.map(([, quantity]) => quantity),
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#fd7e14',
                        '#6f42c1',
                        '#dc3545'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating products chart:', error);
        // Show error message to user
        const chartContainer = canvas.parentElement;
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="alert error">Unable to load products chart. Please refresh the page.</div>';
        }
    }
}

function updateRecentSales() {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const recentSales = sales
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const container = document.getElementById('recent-sales');
    container.innerHTML = '';
    
    recentSales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div>
                    <strong>${product.name}</strong>
                    <br>
                    <small>${formatDate(sale.date)}</small>
                </div>
                <div>
                    <strong>₵${sale.totalPrice.toFixed(2)}</strong>
                    <br>
                    <small>Qty: ${sale.quantity}</small>
                </div>
            `;
            container.appendChild(item);
        }
    });
}

function updateLowStockAlert() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    const container = document.getElementById('low-stock-alert');
    container.innerHTML = '';
    
    lowStockProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div>
                <strong>${product.name}</strong>
                <br>
                <small>${product.category}</small>
            </div>
            <div>
                <span class="alert warning" style="padding: 4px 8px; font-size: 12px;">
                    Stock: ${product.stock}
                </span>
            </div>
        `;
        container.appendChild(item);
    });
}

// Product Management Functions
function showAddProductForm() {
    document.getElementById('add-product-form').classList.remove('hidden');
}

function hideAddProductForm() {
    document.getElementById('add-product-form').classList.add('hidden');
    document.getElementById('product-form').reset();
}

function showEditProductForm(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-stock').value = product.stock;
    document.getElementById('edit-product-discount').value = product.discount || 0;
    document.getElementById('edit-product-form').classList.remove('hidden');
    document.getElementById('add-product-form').classList.add('hidden');
}

function hideEditProductForm() {
    document.getElementById('edit-product-form').classList.add('hidden');
    document.getElementById('product-edit-form').reset();
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const discount = Math.max(0, Math.min(100, parseFloat(document.getElementById('product-discount').value) || 0));
    
    const newProduct = {
        id: Date.now(),
        name,
        price,
        category,
        stock,
        discount
    };
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    showAlert('Product added successfully!', 'success');
    hideAddProductForm();
    loadProducts();
    updateProductSelect();
    loadDashboard();
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const tbody = document.getElementById('products-tbody');
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>₵${product.price.toFixed(2)}${product.discount ? ` <small style="color: var(--muted-text);">(-${product.discount}% )</small>` : ''}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn secondary" onclick="showEditProductForm(${product.id})">Edit</button>
                <button class="btn danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleEditProductSave(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-product-id').value);
    const name = document.getElementById('edit-product-name').value;
    const price = parseFloat(document.getElementById('edit-product-price').value);
    const category = document.getElementById('edit-product-category').value;
    const stock = parseInt(document.getElementById('edit-product-stock').value);
    const discount = Math.max(0, Math.min(100, parseFloat(document.getElementById('edit-product-discount').value) || 0));
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return;
    products[index] = { ...products[index], name, price, category, stock, discount };
    localStorage.setItem('products', JSON.stringify(products));
    showAlert('Product updated successfully!', 'success');
    hideEditProductForm();
    loadProducts();
    updateProductSelect();
    loadDashboard();
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        
        showAlert('Product deleted successfully!', 'success');
        loadProducts();
        updateProductSelect();
        loadDashboard();
    }
}

function updateProductSelect() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const select = document.getElementById('sales-product');
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Choose a product...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        const hasDiscount = product.discount && product.discount > 0;
        const unitPrice = product.price;
        const discounted = hasDiscount ? unitPrice * (1 - product.discount / 100) : unitPrice;
        option.textContent = `${product.name} - ₵${discounted.toFixed(2)}${hasDiscount ? ` (was ₵${unitPrice.toFixed(2)}, -${product.discount}%)` : ''} (Stock: ${product.stock})`;
        select.appendChild(option);
    });
}

// Sales Functions
function handleRecordSale(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('sales-product').value);
    const quantity = parseInt(document.getElementById('sales-quantity').value);
    const date = document.getElementById('sales-date').value;
    
    if (!productId) {
        showAlert('Please select a product', 'error');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showAlert('Product not found', 'error');
        return;
    }
    
    if (product.stock < quantity) {
        showAlert('Insufficient stock', 'error');
        return;
    }
    
    // Apply discount if available
    const discountPercent = product.discount && product.discount > 0 ? product.discount : 0;
    const effectiveUnitPrice = product.price * (1 - discountPercent / 100);

    // Create sale record
    const sale = {
        id: Date.now(),
        productId,
        quantity,
        unitPrice: effectiveUnitPrice,
        totalPrice: effectiveUnitPrice * quantity,
        date
    };
    
    // Update stock
    product.stock -= quantity;
    
    // Save to localStorage
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    sales.push(sale);
    
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('products', JSON.stringify(products));
    
    showAlert('Sale recorded successfully!', 'success');
    document.getElementById('sales-form').reset();
    document.getElementById('sales-date').value = new Date().toISOString().split('T')[0];
    
    loadSales();
    updateProductSelect();
    loadDashboard();
}

function loadSales() {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '';
    
    const recentSales = sales
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    recentSales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(sale.date)}</td>
                <td>${product.name}</td>
                <td>${sale.quantity}</td>
                <td>₵${sale.totalPrice.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        }
    });
}

// Reports Functions
function generateReport(period) {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    let filteredSales = sales;
    const today = new Date().toISOString().split('T')[0];
    
    switch(period) {
        case 'today':
            filteredSales = sales.filter(sale => sale.date === today);
            break;
        case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredSales = sales.filter(sale => new Date(sale.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            filteredSales = sales.filter(sale => new Date(sale.date) >= monthAgo);
            break;
        case 'all':
        default:
            filteredSales = sales;
            break;
    }
    
    updateReportSummary(filteredSales, products);
    updateReportTable(filteredSales, products);
}

function updateReportSummary(sales, products) {
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Find top product
    const productSales = {};
    sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            productSales[product.name] = (productSales[product.name] || 0) + sale.quantity;
        }
    });
    
    const topProduct = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)[0];
    
    document.getElementById('report-total-sales').textContent = `₵${totalSales.toFixed(2)}`;
    document.getElementById('report-items-sold').textContent = totalItems;
    document.getElementById('report-top-product').textContent = topProduct ? topProduct[0] : 'None';
}

function updateReportTable(sales, products) {
    const tbody = document.getElementById('report-tbody');
    tbody.innerHTML = '';
    
    sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(sale.date)}</td>
                <td>${product.name}</td>
                <td>${sale.quantity}</td>
                <td>₵${sale.unitPrice.toFixed(2)}</td>
                <td>₵${sale.totalPrice.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        }
    });
}

function printReport() {
    // Ensure reports section is visible and up to date before printing
    showSection('reports');
    generateReport('all');
    setTimeout(() => window.print(), 100);
}

function exportReport() {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    let csv = 'Date,Product,Quantity,Unit Price (GHS),Total Price (GHS)\n';

    const quote = (val) => `"${String(val).replace(/"/g, '""')}"`;

    sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            const date = sale.date; // ISO yyyy-mm-dd for compatibility
            const name = product.name;
            const qty = sale.quantity;
            const unit = Number(sale.unitPrice).toFixed(2); // numeric, no currency symbol
            const total = Number(sale.totalPrice).toFixed(2); // numeric, no currency symbol
            csv += [quote(date), quote(name), quote(qty), quote(unit), quote(total)].join(',') + '\n';
        }
    });
    
    // Prepend BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Utility Functions
function showAlert(message, type) {
    // Remove existing alert in visible container
    const visibleContainer = document.getElementById('app-container').classList.contains('hidden')
        ? document.querySelector('#auth-container .auth-box')
        : document.querySelector('.main-content');
    const existingAlert = visibleContainer ? visibleContainer.querySelector('.alert') : null;
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    if (visibleContainer) {
        visibleContainer.insertBefore(alert, visibleContainer.firstChild);
    }
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(`${inputId}-error`);
    if (!input || !errorEl) return;
    if (message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        input.classList.add('has-error');
    } else {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
        input.classList.remove('has-error');
    }
}

function clearFieldErrors(ids) {
    ids.forEach(id => setFieldError(id, ''));
}

function updatePasswordStrength() {
    const password = document.getElementById('signup-password').value;
    const { score, label } = calculatePasswordStrength(password);
    const bar = document.getElementById('signup-strength-bar');
    const text = document.getElementById('signup-strength-text');
    if (!bar || !text) return;
    const widths = ['10%','35%','60%','85%','100%'];
    const colors = ['#dc3545','#fd7e14','#ffc107','#28a745','#1e7e34'];
    bar.style.width = widths[score];
    bar.style.backgroundColor = colors[score];
    text.textContent = `Strength: ${label}`;
}

function calculatePasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, label: 'Very weak' };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score > 4) score = 4;
    const labels = ['Very weak','Weak','Fair','Good','Strong'];
    return { score, label: labels[score] };
}

function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// PIN and Clear Functions
let pendingClearAction = null;
const DEFAULT_PIN = '1234';

function clearProducts() {
    showPinModal('Clear all products? This action cannot be undone.', 'clearProductsAction');
}

function clearSales() {
    showPinModal('Clear all sales records? This action cannot be undone.', 'clearSalesAction');
}

function clearReports() {
    showPinModal('Clear all sales records? This action cannot be undone.', 'clearSalesAction');
}

function clearAllData() {
    showPinModal('Clear ALL data (products, sales, users)? This action cannot be undone.', 'clearAllDataAction');
}

function showPinModal(message, action) {
    document.getElementById('pin-message').textContent = message;
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-modal').classList.remove('hidden');
    pendingClearAction = action;
    document.getElementById('pin-input').focus();
}

function confirmPinAction() {
    const enteredPin = document.getElementById('pin-input').value;
    if (enteredPin === DEFAULT_PIN) {
        switch(pendingClearAction) {
            case 'clearProductsAction':
                clearProductsAction();
                break;
            case 'clearSalesAction':
                clearSalesAction();
                break;
            case 'clearAllDataAction':
                clearAllDataAction();
                break;
        }
        cancelPinAction();
    } else {
        showAlert('Incorrect PIN. Please try again.', 'error');
        document.getElementById('pin-input').value = '';
        document.getElementById('pin-input').focus();
    }
}

function cancelPinAction() {
    document.getElementById('pin-modal').classList.add('hidden');
    pendingClearAction = null;
}

function clearProductsAction() {
    localStorage.setItem('products', JSON.stringify([]));
    showAlert('All products cleared successfully!', 'success');
    loadProducts();
    updateProductSelect();
    loadDashboard();
}

function clearSalesAction() {
    localStorage.setItem('sales', JSON.stringify([]));
    showAlert('All sales records cleared successfully!', 'success');
    loadSales();
    loadDashboard();
    if (document.getElementById('reports').classList.contains('active')) {
        generateReport('all');
    }
}

function clearAllDataAction() {
    localStorage.clear();
    showAlert('All data cleared successfully!', 'success');
    logout();
}
