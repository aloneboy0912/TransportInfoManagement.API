window.loadAnalytics = async function() {
    // Check authentication before loading analytics
    if (!window.requireAuth || !window.requireAuth()) {
        return;
    }
    
    const content = document.getElementById('pageContent');
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fas fa-chart-pie"></i> Analytics</h1>
            <p>Advanced analytics and insights for your business</p>
        </div>
        
        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <h3>Revenue Growth</h3>
                <div class="value">+24.5%</div>
                <small><i class="fas fa-arrow-up" style="color: var(--success-color);"></i> vs last month</small>
            </div>
            <div class="stat-card">
                <h3>Customer Satisfaction</h3>
                <div class="value">94.2%</div>
                <small><i class="fas fa-star" style="color: var(--warning-color);"></i> Average rating</small>
            </div>
            <div class="stat-card">
                <h3>Active Projects</h3>
                <div class="value">127</div>
                <small><i class="fas fa-project-diagram" style="color: var(--info-color);"></i> In progress</small>
            </div>
            <div class="stat-card">
                <h3>Team Performance</h3>
                <div class="value">87.3%</div>
                <small><i class="fas fa-users" style="color: var(--primary-color);"></i> Efficiency score</small>
            </div>
        </div>

        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-chart-line"></i> Revenue Trends</h2>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="height: 300px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.125rem;">
                        <i class="fas fa-chart-line" style="margin-right: 0.5rem;"></i>
                        Revenue Chart Placeholder
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2><i class="fas fa-pie-chart"></i> Service Distribution</h2>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="height: 300px; background: linear-gradient(135deg, var(--success-color) 0%, var(--warning-color) 100%); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.125rem;">
                        <i class="fas fa-pie-chart" style="margin-right: 0.5rem;"></i>
                        Service Chart Placeholder
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2><i class="fas fa-table"></i> Performance Metrics</h2>
            </div>
            <div style="padding: 1.5rem;">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current Value</th>
                                <th>Target</th>
                                <th>Progress</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><i class="fas fa-users"></i> Customer Acquisition</td>
                                <td>245</td>
                                <td>300</td>
                                <td>
                                    <div style="background: var(--bg-color); border-radius: 10px; height: 8px; overflow: hidden;">
                                        <div style="background: var(--success-color); height: 100%; width: 82%;"></div>
                                    </div>
                                </td>
                                <td><span class="badge badge-success">On Track</span></td>
                            </tr>
                            <tr>
                                <td><i class="fas fa-dollar-sign"></i> Revenue Target</td>
                                <td>$87,500</td>
                                <td>$100,000</td>
                                <td>
                                    <div style="background: var(--bg-color); border-radius: 10px; height: 8px; overflow: hidden;">
                                        <div style="background: var(--warning-color); height: 100%; width: 87.5%;"></div>
                                    </div>
                                </td>
                                <td><span class="badge badge-warning">Behind</span></td>
                            </tr>
                            <tr>
                                <td><i class="fas fa-clock"></i> Project Delivery</td>
                                <td>94%</td>
                                <td>95%</td>
                                <td>
                                    <div style="background: var(--bg-color); border-radius: 10px; height: 8px; overflow: hidden;">
                                        <div style="background: var(--info-color); height: 100%; width: 94%;"></div>
                                    </div>
                                </td>
                                <td><span class="badge badge-info">Good</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};
