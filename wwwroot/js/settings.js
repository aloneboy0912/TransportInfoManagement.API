window.loadSettings = async function() {
    // Check authentication before loading settings
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-cog"></i> Settings</h1>
            <p>Manage system settings and configurations</p>
        </div>

        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-user-cog"></i> Account Settings</h2>
                </div>
                <div style="padding: 1.5rem;">
                    <form id="accountSettingsForm">
                        <div class="form-group">
                            <label for="adminName">Administrator Name</label>
                            <input type="text" id="adminName" class="form-control" value="${localStorage.getItem('userFullName') || 'Administrator'}" required>
                        </div>
                        <div class="form-group">
                            <label for="adminEmail">Email Address</label>
                            <input type="email" id="adminEmail" class="form-control" value="admin@excell-on.com" required>
                        </div>
                        <div class="form-group">
                            <label for="timezone">Timezone</label>
                            <select id="timezone" class="form-control">
                                <option value="UTC">UTC (Coordinated Universal Time)</option>
                                <option value="EST">EST (Eastern Standard Time)</option>
                                <option value="PST">PST (Pacific Standard Time)</option>
                                <option value="GMT+7" selected>GMT+7 (Vietnam Time)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-shield-alt"></i> Security Settings</h2>
                </div>
                <div style="padding: 1.5rem;">
                    <form id="securitySettingsForm">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" class="form-control" placeholder="Enter current password">
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" class="form-control" placeholder="Enter new password">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm New Password</label>
                            <input type="password" id="confirmPassword" class="form-control" placeholder="Confirm new password">
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="enableTwoFactor"> Enable Two-Factor Authentication
                            </label>
                        </div>
                        <button type="submit" class="btn btn-warning">
                            <i class="fas fa-key"></i> Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 1.5rem;">
            <div class="card-header">
                <h2><i class="fas fa-sliders-h"></i> System Configuration</h2>
            </div>
            <div style="padding: 1.5rem;">
                <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4><i class="fas fa-bell"></i> Notification Settings</h4>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="emailNotifications" checked> Email Notifications
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="smsNotifications"> SMS Notifications
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="pushNotifications" checked> Push Notifications
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <h4><i class="fas fa-database"></i> Data Management</h4>
                        <div class="form-group">
                            <label for="backupFrequency">Backup Frequency</label>
                            <select id="backupFrequency" class="form-control">
                                <option value="daily" selected>Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dataRetention">Data Retention (months)</label>
                            <input type="number" id="dataRetention" class="form-control" value="12" min="1" max="60">
                        </div>
                        <button type="button" class="btn btn-info" onclick="exportData()">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                    <button type="button" class="btn btn-success" onclick="saveAllSettings()">
                        <i class="fas fa-save"></i> Save All Settings
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="resetSettings()">
                        <i class="fas fa-undo"></i> Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('accountSettingsForm').addEventListener('submit', handleAccountSettings);
    document.getElementById('securitySettingsForm').addEventListener('submit', handleSecuritySettings);
};

function handleAccountSettings(e) {
    e.preventDefault();
    // Simulate saving account settings
    alert('Account settings saved successfully!');
}

function handleSecuritySettings(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Simulate saving security settings
    alert('Security settings updated successfully!');
}

function saveAllSettings() {
    alert('All settings saved successfully!');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        alert('Settings reset to defaults!');
        window.loadSettings(); // Reload the page
    }
}

function exportData() {
    alert('Data export initiated. You will receive an email when the export is ready.');
}
