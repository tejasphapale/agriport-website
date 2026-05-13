/**
 * Download Form Data Storage Manager
 * Stores form data in localStorage and syncs across devices
 */

class DownloadStore {
  constructor() {
    this.storageKey = 'agriport_downloads_data'
    this.version = 1
    this.initStorage()
  }

  // Initialize storage
  initStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({
        version: this.version,
        downloads: [],
        lastUpdated: new Date().toISOString()
      }))
    }
  }

  // Get all downloads
  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data).downloads : []
    } catch (e) {
      console.error('Error reading downloads:', e)
      return []
    }
  }

  // Add new download
  add(downloadData) {
    try {
      const store = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      const newRecord = {
        id: 'DL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...downloadData,
        timestamp: new Date().toISOString(),
        dateAdded: new Date().toLocaleDateString('en-IN'),
        status: 'Active'
      }
      
      store.downloads = store.downloads || []
      store.downloads.unshift(newRecord)
      store.lastUpdated = new Date().toISOString()
      
      localStorage.setItem(this.storageKey, JSON.stringify(store))
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.storageKey,
        newValue: JSON.stringify(store),
        url: window.location.href
      }))
      
      return newRecord
    } catch (e) {
      console.error('Error adding download:', e)
      return null
    }
  }

  // Delete download
  delete(id) {
    try {
      const store = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      store.downloads = (store.downloads || []).filter(d => d.id !== id)
      store.lastUpdated = new Date().toISOString()
      localStorage.setItem(this.storageKey, JSON.stringify(store))
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.storageKey,
        newValue: JSON.stringify(store)
      }))
      
      return true
    } catch (e) {
      console.error('Error deleting download:', e)
      return false
    }
  }

  // Block user
  blockUser(id) {
    try {
      const store = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      const download = (store.downloads || []).find(d => d.id === id)
      if (download) {
        download.status = 'Blocked'
        store.lastUpdated = new Date().toISOString()
        localStorage.setItem(this.storageKey, JSON.stringify(store))
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: this.storageKey,
          newValue: JSON.stringify(store)
        }))
        return true
      }
      return false
    } catch (e) {
      console.error('Error blocking user:', e)
      return false
    }
  }

  // Unblock user
  unblockUser(id) {
    try {
      const store = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
      const download = (store.downloads || []).find(d => d.id === id)
      if (download) {
        download.status = 'Active'
        store.lastUpdated = new Date().toISOString()
        localStorage.setItem(this.storageKey, JSON.stringify(store))
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: this.storageKey,
          newValue: JSON.stringify(store)
        }))
        return true
      }
      return false
    } catch (e) {
      console.error('Error unblocking user:', e)
      return false
    }
  }

  // Clear all
  clearAll() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        version: this.version,
        downloads: [],
        lastUpdated: new Date().toISOString()
      }))
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.storageKey
      }))
      return true
    } catch (e) {
      console.error('Error clearing downloads:', e)
      return false
    }
  }

  // Export to CSV
  exportCSV() {
    const downloads = this.getAll()
    if (downloads.length === 0) {
      alert('No data to export!')
      return
    }

    let csv = 'ID,Name,Email,Phone,City,State,Occupation,Farm Name,Experience,Message,Date Added,Status\n'
    
    downloads.forEach(d => {
      csv += `"${d.id}","${d.name}","${d.email}","${d.phone}","${d.city}","${d.state}","${d.occupation}","${d.farmName || ''}","${d.experience || ''}","${d.message || ''}","${d.dateAdded}","${d.status}"\n`
    })

    this.downloadFile(csv, 'agriport-downloads.csv', 'text/csv')
  }

  // Export to JSON
  exportJSON() {
    const downloads = this.getAll()
    if (downloads.length === 0) {
      alert('No data to export!')
      return
    }

    const json = JSON.stringify(downloads, null, 2)
    this.downloadFile(json, 'agriport-downloads.json', 'application/json')
  }

  // Helper to download file
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

// Create global instance
const downloadStore = new DownloadStore()
