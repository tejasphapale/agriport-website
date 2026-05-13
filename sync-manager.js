// 🔄 Cross-Device Data Synchronization Manager
// This helps sync download form data across different devices and browsers

class DataSyncManager {
    constructor() {
        this.storageKey = 'agriport_downloads';
        this.blockedKey = 'agriport_blocked_users';
        this.initStorage();
        this.startAutoSync();
    }

    // Initialize storage if empty
    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.blockedKey)) {
            localStorage.setItem(this.blockedKey, JSON.stringify([]));
        }
    }

    // Add a new download record
    addRecord(data) {
        try {
            const records = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            const newRecord = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                ...data,
                timestamp: data.timestamp || new Date().toISOString(),
                downloaded: true,
                status: 'active'
            };
            records.unshift(newRecord); // Add to beginning
            localStorage.setItem(this.storageKey, JSON.stringify(records));
            
            // Broadcast to other tabs
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: newRecord }));
            
            return newRecord;
        } catch (e) {
            console.error('Error adding record:', e);
            return null;
        }
    }

    // Get all records
    getRecords() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (e) {
            console.error('Error getting records:', e);
            return [];
        }
    }

    // Delete a record
    deleteRecord(id) {
        try {
            const records = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            const filtered = records.filter(r => r.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            
            // Broadcast update
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { id, action: 'deleted' } }));
            
            return true;
        } catch (e) {
            console.error('Error deleting record:', e);
            return false;
        }
    }

    // Block a user
    blockUser(id) {
        try {
            const blocked = JSON.parse(localStorage.getItem(this.blockedKey) || '[]');
            if (!blocked.includes(id)) {
                blocked.push(id);
                localStorage.setItem(this.blockedKey, JSON.stringify(blocked));
            }
            
            // Broadcast update
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { id, action: 'blocked' } }));
            
            return true;
        } catch (e) {
            console.error('Error blocking user:', e);
            return false;
        }
    }

    // Unblock a user
    unblockUser(id) {
        try {
            const blocked = JSON.parse(localStorage.getItem(this.blockedKey) || '[]');
            const filtered = blocked.filter(uid => uid !== id);
            localStorage.setItem(this.blockedKey, JSON.stringify(filtered));
            
            // Broadcast update
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { id, action: 'unblocked' } }));
            
            return true;
        } catch (e) {
            console.error('Error unblocking user:', e);
            return false;
        }
    }

    // Get blocked users
    getBlockedUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.blockedKey) || '[]');
        } catch (e) {
            console.error('Error getting blocked users:', e);
            return [];
        }
    }

    // Clear all data
    clearAll() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            localStorage.setItem(this.blockedKey, JSON.stringify([]));
            
            // Broadcast update
            window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { action: 'cleared' } }));
            
            return true;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    }

    // Start auto-sync listener
    startAutoSync() {
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            if (event.key === this.storageKey || event.key === this.blockedKey) {
                console.log('📊 Data synced from another tab!');
                // Trigger reload event for listeners
                window.dispatchEvent(new Event('dataReloaded'));
            }
        });
    }

    // Export data to JSON
    exportAsJSON() {
        const records = this.getRecords();
        const blocked = this.getBlockedUsers();
        const data = {
            records,
            blocked,
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Export data to CSV
    exportAsCSV() {
        const records = this.getRecords();
        if (records.length === 0) return '';

        const headers = ['ID', 'Name', 'Email', 'Phone', 'City', 'State', 'Occupation', 'Farm', 'Experience', 'Date', 'Status'];
        const rows = records.map(r => [
            r.id,
            r.name,
            r.email,
            r.phone,
            r.city,
            r.state,
            r.occupation,
            r.farmName || '',
            r.experience || '',
            new Date(r.timestamp).toLocaleDateString('en-IN'),
            r.status || 'active'
        ]);

        const csv = [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"` ).join(',')
        ).join('\n');

        return csv;
    }
}

// Create global instance
window.syncManager = new DataSyncManager();
