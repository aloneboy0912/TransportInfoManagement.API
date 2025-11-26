window.loadNotifications = async function() {
    // Check authentication before loading notifications
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-bell"></i> Notifications</h1>
            <p>Manage system notifications and alerts</p>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="markAllAsRead()">
                    <i class="fas fa-check-double"></i> Mark All as Read
                </button>
                <button class="btn btn-secondary" onclick="clearAllNotifications()">
                    <i class="fas fa-trash"></i> Clear All
                </button>
            </div>
        </div>

        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <h3>Unread</h3>
                <div class="value">12</div>
                <small><i class="fas fa-envelope" style="color: var(--primary-color);"></i> New notifications</small>
            </div>
            <div class="stat-card">
                <h3>Today</h3>
                <div class="value">28</div>
                <small><i class="fas fa-calendar-day" style="color: var(--info-color);"></i> Notifications today</small>
            </div>
            <div class="stat-card">
                <h3>Critical</h3>
                <div class="value">3</div>
                <small><i class="fas fa-exclamation-triangle" style="color: var(--danger-color);"></i> Urgent alerts</small>
            </div>
            <div class="stat-card">
                <h3>System</h3>
                <div class="value">7</div>
                <small><i class="fas fa-cog" style="color: var(--success-color);"></i> System updates</small>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-list"></i> Recent Notifications</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <select id="filterType" class="form-control" style="width: auto;" onchange="filterNotifications()">
                        <option value="all">All Types</option>
                        <option value="critical">Critical</option>
                        <option value="info">Information</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                    </select>
                    <select id="filterStatus" class="form-control" style="width: auto;" onchange="filterNotifications()">
                        <option value="all">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>
            </div>
            <div id="notificationsList" style="padding: 0;">
                ${generateNotificationsList()}
            </div>
        </div>

        <div class="card" style="margin-top: 1.5rem;">
            <div class="card-header">
                <h2><i class="fas fa-plus"></i> Create New Notification</h2>
            </div>
            <div style="padding: 1.5rem;">
                <form id="newNotificationForm">
                    <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="notificationTitle">Title</label>
                            <input type="text" id="notificationTitle" class="form-control" placeholder="Enter notification title" required>
                        </div>
                        <div class="form-group">
                            <label for="notificationType">Type</label>
                            <select id="notificationType" class="form-control" required>
                                <option value="">Select type</option>
                                <option value="info">Information</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                                <option value="success">Success</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="notificationMessage">Message</label>
                        <textarea id="notificationMessage" class="form-control" rows="3" placeholder="Enter notification message" required></textarea>
                    </div>
                    <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="notificationTarget">Target Users</label>
                            <select id="notificationTarget" class="form-control" required>
                                <option value="all">All Users</option>
                                <option value="admins">Administrators Only</option>
                                <option value="employees">Employees Only</option>
                                <option value="clients">Clients Only</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="notificationSchedule">Schedule</label>
                            <select id="notificationSchedule" class="form-control">
                                <option value="now">Send Now</option>
                                <option value="later">Schedule for Later</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i> Send Notification
                    </button>
                </form>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('newNotificationForm').addEventListener('submit', handleNewNotification);
};

function generateNotificationsList() {
    const notifications = [
        { id: 1, type: 'critical', title: 'System Security Alert', message: 'Multiple failed login attempts detected', time: '2 minutes ago', read: false },
        { id: 2, type: 'info', title: 'New Client Registration', message: 'ABC Corporation has registered as a new client', time: '15 minutes ago', read: false },
        { id: 3, type: 'success', title: 'Backup Completed', message: 'Daily system backup completed successfully', time: '1 hour ago', read: true },
        { id: 4, type: 'warning', title: 'Server Load High', message: 'Server CPU usage is above 85%', time: '2 hours ago', read: false },
        { id: 5, type: 'info', title: 'Payment Received', message: 'Payment of $5,000 received from XYZ Corp', time: '3 hours ago', read: true },
        { id: 6, type: 'critical', title: 'Database Connection Error', message: 'Temporary database connection issues resolved', time: '4 hours ago', read: true },
        { id: 7, type: 'success', title: 'Report Generated', message: 'Monthly financial report has been generated', time: '5 hours ago', read: true },
        { id: 8, type: 'info', title: 'Employee Update', message: 'John Doe has updated their profile information', time: '6 hours ago', read: true }
    ];

    return notifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-type="${notification.type}" data-status="${notification.read ? 'read' : 'unread'}" style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; ${!notification.read ? 'background: rgba(59, 130, 246, 0.05);' : ''}">
            <div class="notification-icon" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; ${getNotificationIconStyle(notification.type)}">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.25rem;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${notification.title}</h4>
                    <small style="color: var(--text-secondary); margin-left: auto;">${notification.time}</small>
                </div>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">${notification.message}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                ${!notification.read ? `<button class="btn btn-sm btn-primary" onclick="markAsRead(${notification.id})"><i class="fas fa-check"></i></button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteNotification(${notification.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    switch(type) {
        case 'critical': return 'fa-exclamation-triangle';
        case 'warning': return 'fa-exclamation-circle';
        case 'success': return 'fa-check-circle';
        case 'info': default: return 'fa-info-circle';
    }
}

function getNotificationIconStyle(type) {
    switch(type) {
        case 'critical': return 'background: var(--danger-color); color: white;';
        case 'warning': return 'background: var(--warning-color); color: white;';
        case 'success': return 'background: var(--success-color); color: white;';
        case 'info': default: return 'background: var(--info-color); color: white;';
    }
}

function markAsRead(id) {
    alert(`Notification ${id} marked as read`);
    window.loadNotifications(); // Reload to update UI
}

function deleteNotification(id) {
    if (confirm('Are you sure you want to delete this notification?')) {
        alert(`Notification ${id} deleted`);
        window.loadNotifications(); // Reload to update UI
    }
}

function markAllAsRead() {
    if (confirm('Mark all notifications as read?')) {
        alert('All notifications marked as read');
        window.loadNotifications(); // Reload to update UI
    }
}

function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
        alert('All notifications cleared');
        window.loadNotifications(); // Reload to update UI
    }
}

function filterNotifications() {
    const typeFilter = document.getElementById('filterType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const notifications = document.querySelectorAll('.notification-item');
    
    notifications.forEach(notification => {
        const type = notification.getAttribute('data-type');
        const status = notification.getAttribute('data-status');
        
        const typeMatch = typeFilter === 'all' || type === typeFilter;
        const statusMatch = statusFilter === 'all' || status === statusFilter;
        
        notification.style.display = (typeMatch && statusMatch) ? 'flex' : 'none';
    });
}

function handleNewNotification(e) {
    e.preventDefault();
    
    const title = document.getElementById('notificationTitle').value;
    const type = document.getElementById('notificationType').value;
    const message = document.getElementById('notificationMessage').value;
    const target = document.getElementById('notificationTarget').value;
    const schedule = document.getElementById('notificationSchedule').value;
    
    // Simulate sending notification
    alert(`Notification "${title}" sent to ${target} successfully!`);
    
    // Reset form
    document.getElementById('newNotificationForm').reset();
}
