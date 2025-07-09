class VotingSystem {
    constructor() {
      this.candidates = JSON.parse(localStorage.getItem("candidates")) || []
      this.votes = JSON.parse(localStorage.getItem("votes")) || {}
      this.totalVoters = Number.parseInt(localStorage.getItem("totalVoters")) || 1000
      this.hasVoted = localStorage.getItem("hasVoted") === "true"
      this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null
      this.users = JSON.parse(localStorage.getItem("users")) || this.getDefaultUsers()
  
      this.init()
    }
  
    getDefaultUsers() {
      return {
        admin: { password: "admin123", role: "admin", name: "Administrator" },
        user: { password: "user123", role: "user", name: "Pemilih" },
      }
    }
  
    init() {
      this.checkLoginStatus()
      this.setupEventListeners()
      this.loadDefaultCandidates()
  
      if (this.currentUser) {
        this.renderCandidates()
        this.renderQuickCount()
        this.renderAdminCandidates()
        this.updateVoteStatus()
        this.updateUserInterface()
      }
    }
  
    checkLoginStatus() {
      if (!this.currentUser) {
        this.showLoginScreen()
      } else {
        this.showMainApp()
      }
    }
  
    showLoginScreen() {
      document.getElementById("login-screen").style.display = "flex"
      document.getElementById("main-app").style.display = "none"
    }
  
    showMainApp() {
      document.getElementById("login-screen").style.display = "none"
      document.getElementById("main-app").style.display = "block"
    }
  
    setupEventListeners() {
      // Login form
      document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleLogin()
      })
  
      // Show manual from login screen
      document.getElementById("show-manual").addEventListener("click", () => {
        // Temporary login as guest to view manual
        this.currentUser = { username: "guest", role: "user", name: "Guest" }
        this.showMainApp()
        this.switchTab("manual")
        this.updateUserInterface()
      })
  
      // Logout
      document.getElementById("logout-btn").addEventListener("click", () => {
        this.handleLogout()
      })
  
      // Navigation
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.switchTab(e.target.dataset.tab)
        })
      })
  
      // Manual navigation
      document.querySelectorAll(".manual-nav-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.switchManualSection(e.target.dataset.manual)
        })
      })
  
      // Admin form
      document.getElementById("add-candidate-form").addEventListener("submit", (e) => {
        e.preventDefault()
        this.addCandidate()
      })
  
      // Admin actions
      document.getElementById("reset-votes").addEventListener("click", () => {
        this.resetVotes()
      })
  
      document.getElementById("export-results").addEventListener("click", () => {
        this.exportResults()
      })
  
      document.getElementById("manage-users").addEventListener("click", () => {
        this.showUserManagement()
      })
  
      // Real-time updates
      setInterval(() => {
        if (this.currentUser) {
          this.simulateRealTimeVotes()
        }
      }, 5000)
    }
  
    handleLogin() {
      const username = document.getElementById("username").value.trim()
      const password = document.getElementById("password").value.trim()
      const role = document.getElementById("role").value
  
      if (!username || !password || !role) {
        this.showNotification("Mohon lengkapi semua field!", "error")
        return
      }
  
      // Check credentials
      const user = this.users[username]
      if (!user || user.password !== password || user.role !== role) {
        this.showNotification("Username, password, atau role tidak valid!", "error")
        return
      }
  
      // Successful login
      this.currentUser = {
        username: username,
        role: user.role,
        name: user.name,
      }
  
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
      this.showMainApp()
      this.updateUserInterface()
      this.renderCandidates()
      this.renderQuickCount()
      this.renderAdminCandidates()
      this.updateVoteStatus()
  
      this.showNotification(`Selamat datang, ${user.name}!`, "success")
    }
  
    handleLogout() {
      if (confirm("Yakin ingin logout?")) {
        this.currentUser = null
        localStorage.removeItem("currentUser")
        this.showLoginScreen()
  
        // Reset form
        document.getElementById("login-form").reset()
        this.showNotification("Berhasil logout!", "success")
      }
    }
  
    updateUserInterface() {
      if (!this.currentUser) return
  
      // Update user info
      document.getElementById("current-user").textContent = `Selamat datang, ${this.currentUser.name}`
  
      // Show/hide admin features
      const adminElements = document.querySelectorAll(".admin-only")
      adminElements.forEach((element) => {
        if (this.currentUser.role === "admin") {
          element.style.display = "block"
        } else {
          element.style.display = "none"
        }
      })
  
      // If user is not admin and currently on admin tab, switch to voting
      if (this.currentUser.role !== "admin" && document.getElementById("admin").classList.contains("active")) {
        this.switchTab("voting")
      }
    }
  
    switchTab(tabName) {
      // Check admin access
      if (tabName === "admin" && this.currentUser?.role !== "admin") {
        this.showNotification("Akses ditolak! Hanya admin yang dapat mengakses panel ini.", "error")
        return
      }
  
      // Update navigation
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.remove("active")
      })
      const targetBtn = document.querySelector(`[data-tab="${tabName}"]`)
      if (targetBtn) {
        targetBtn.classList.add("active")
      }
  
      // Update sections
      document.querySelectorAll(".section").forEach((section) => {
        section.classList.remove("active")
      })
      document.getElementById(tabName).classList.add("active")
  
      // Refresh data when switching to quick count
      if (tabName === "quickcount") {
        this.renderQuickCount()
      }
    }
  
    switchManualSection(sectionName) {
      // Update manual navigation
      document.querySelectorAll(".manual-nav-btn").forEach((btn) => {
        btn.classList.remove("active")
      })
      document.querySelector(`[data-manual="${sectionName}"]`).classList.add("active")
  
      // Update manual sections
      document.querySelectorAll(".manual-section").forEach((section) => {
        section.classList.remove("active")
      })
      document.getElementById(`manual-${sectionName}`).classList.add("active")
    }
  
    loadDefaultCandidates() {
      if (this.candidates.length === 0) {
        this.candidates = [
          {
            id: 1,
            name: "Ahmad Rizki Pratama",
            vision:
              "Membangun organisasi yang inovatif dan berkelanjutan dengan fokus pada pengembangan SDM dan teknologi digital untuk mencapai visi organisasi yang lebih maju.",
            color: "blue",
            votes: 0,
          },
          {
            id: 2,
            name: "Sari Indah Permata",
            vision:
              "Menciptakan lingkungan kerja yang kolaboratif dan inklusif untuk mencapai visi bersama organisasi melalui program-program pemberdayaan anggota.",
            color: "green",
            votes: 0,
          },
          {
            id: 3,
            name: "Budi Santoso Wijaya",
            vision:
              "Mengoptimalkan potensi setiap anggota melalui program pelatihan dan pengembangan karir yang berkelanjutan serta meningkatkan kualitas pelayanan organisasi.",
            color: "orange",
            votes: 0,
          },
        ]
        this.saveData()
      }
    }
  
    renderCandidates() {
      const container = document.getElementById("candidates-list")
      container.innerHTML = ""
  
      this.candidates.forEach((candidate) => {
        const candidateCard = document.createElement("div")
        candidateCard.className = `candidate-card theme-${candidate.color}`
  
        const isDisabled = this.hasVoted || this.currentUser?.role !== "user"
        const buttonText = this.hasVoted
          ? "SUDAH MEMILIH"
          : this.currentUser?.role !== "user"
            ? "LOGIN SEBAGAI PEMILIH"
            : "PILIH"
  
        candidateCard.innerHTML = `
          <div class="candidate-number theme-${candidate.color}">${candidate.id}</div>
          <div class="candidate-name">${candidate.name}</div>
          <div class="candidate-vision">${candidate.vision}</div>
          <button class="vote-btn" onclick="votingSystem.vote(${candidate.id})" 
                  ${isDisabled ? "disabled" : ""}>
              ${buttonText}
          </button>
        `
        container.appendChild(candidateCard)
      })
    }
  
    vote(candidateId) {
      if (this.currentUser?.role !== "user") {
        this.showNotification("Hanya pemilih yang dapat melakukan voting!", "error")
        return
      }
  
      if (this.hasVoted) {
        this.showNotification("Anda sudah melakukan voting!", "error")
        return
      }
  
      const candidate = this.candidates.find((c) => c.id === candidateId)
      if (!candidate) return
  
      // Update votes
      if (!this.votes[candidateId]) {
        this.votes[candidateId] = 0
      }
      this.votes[candidateId]++
      candidate.votes = this.votes[candidateId]
  
      // Mark as voted
      this.hasVoted = true
  
      this.saveData()
      this.renderCandidates()
      this.renderQuickCount()
      this.updateVoteStatus()
  
      this.showNotification(`Terima kasih! Anda telah memilih ${candidate.name}`, "success")
    }
  
    renderQuickCount() {
      const totalVotes = Object.values(this.votes).reduce((sum, votes) => sum + votes, 0)
      const participationRate = ((totalVotes / this.totalVoters) * 100).toFixed(1)
  
      // Update stats
      document.getElementById("total-votes").textContent = totalVotes.toLocaleString()
      document.getElementById("participation-rate").textContent = `${participationRate}%`
  
      // Render results chart
      const resultsContainer = document.getElementById("results-chart")
      resultsContainer.innerHTML = "<h3>Hasil Sementara</h3>"
  
      // Sort candidates by votes
      const sortedCandidates = [...this.candidates].sort((a, b) => (this.votes[b.id] || 0) - (this.votes[a.id] || 0))
  
      sortedCandidates.forEach((candidate) => {
        const candidateVotes = this.votes[candidate.id] || 0
        const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : 0
  
        const resultItem = document.createElement("div")
        resultItem.className = "result-item"
        resultItem.innerHTML = `
          <div class="result-info">
              <div class="result-name">${candidate.name}</div>
              <div class="result-votes">${candidateVotes.toLocaleString()} suara</div>
          </div>
          <div class="result-bar">
              <div class="result-fill bg-${candidate.color}" style="width: ${percentage}%"></div>
          </div>
          <div class="result-percentage">${percentage}%</div>
        `
        resultsContainer.appendChild(resultItem)
      })
    }
  
    addCandidate() {
      if (this.currentUser?.role !== "admin") {
        this.showNotification("Akses ditolak! Hanya admin yang dapat menambah kandidat.", "error")
        return
      }
  
      const name = document.getElementById("candidate-name").value.trim()
      const vision = document.getElementById("candidate-vision").value.trim()
      const color = document.getElementById("candidate-color").value
  
      if (!name || !vision) {
        this.showNotification("Mohon lengkapi semua field!", "error")
        return
      }
  
      const newCandidate = {
        id: this.candidates.length + 1,
        name: name,
        vision: vision,
        color: color,
        votes: 0,
      }
  
      this.candidates.push(newCandidate)
      this.saveData()
      this.renderCandidates()
      this.renderAdminCandidates()
  
      // Reset form
      document.getElementById("add-candidate-form").reset()
      this.showNotification("Kandidat berhasil ditambahkan!", "success")
    }
  
    renderAdminCandidates() {
      const container = document.getElementById("admin-candidates-list")
      container.innerHTML = ""
  
      this.candidates.forEach((candidate) => {
        const candidateItem = document.createElement("div")
        candidateItem.className = "result-item"
        candidateItem.innerHTML = `
          <div class="result-info">
              <div class="result-name">${candidate.name}</div>
              <div class="result-votes">${candidate.vision}</div>
          </div>
          <button class="btn-danger" onclick="votingSystem.removeCandidate(${candidate.id})">
              Hapus
          </button>
        `
        container.appendChild(candidateItem)
      })
    }
  
    removeCandidate(candidateId) {
      if (this.currentUser?.role !== "admin") {
        this.showNotification("Akses ditolak!", "error")
        return
      }
  
      if (confirm("Yakin ingin menghapus kandidat ini?")) {
        this.candidates = this.candidates.filter((c) => c.id !== candidateId)
        delete this.votes[candidateId]
        this.saveData()
        this.renderCandidates()
        this.renderAdminCandidates()
        this.renderQuickCount()
        this.showNotification("Kandidat berhasil dihapus!", "success")
      }
    }
  
    resetVotes() {
      if (this.currentUser?.role !== "admin") {
        this.showNotification("Akses ditolak!", "error")
        return
      }
  
      if (confirm("Yakin ingin mereset semua suara? Tindakan ini tidak dapat dibatalkan!")) {
        this.votes = {}
        this.hasVoted = false
        this.candidates.forEach((candidate) => {
          candidate.votes = 0
        })
        this.saveData()
        this.renderCandidates()
        this.renderQuickCount()
        this.updateVoteStatus()
        this.showNotification("Semua suara berhasil direset!", "success")
      }
    }
  
    exportResults() {
      if (this.currentUser?.role !== "admin") {
        this.showNotification("Akses ditolak!", "error")
        return
      }
  
      const totalVotes = Object.values(this.votes).reduce((sum, votes) => sum + votes, 0)
      const participationRate = ((totalVotes / this.totalVoters) * 100).toFixed(1)
  
      let exportData = `HASIL PEMILIHAN KETUA ORGANISASI\n`
      exportData += `=====================================\n\n`
      exportData += `Total Suara: ${totalVotes.toLocaleString()}\n`
      exportData += `Tingkat Partisipasi: ${participationRate}%\n`
      exportData += `Estimasi Total Pemilih: ${this.totalVoters.toLocaleString()}\n\n`
      exportData += `HASIL PER KANDIDAT:\n`
      exportData += `-------------------\n`
  
      const sortedCandidates = [...this.candidates].sort((a, b) => (this.votes[b.id] || 0) - (this.votes[a.id] || 0))
  
      sortedCandidates.forEach((candidate, index) => {
        const candidateVotes = this.votes[candidate.id] || 0
        const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : 0
        exportData += `${index + 1}. ${candidate.name}\n`
        exportData += `   Suara: ${candidateVotes.toLocaleString()} (${percentage}%)\n`
        exportData += `   Visi: ${candidate.vision}\n\n`
      })
  
      exportData += `\nDiekspor pada: ${new Date().toLocaleString("id-ID")}\n`
      exportData += `Diekspor oleh: ${this.currentUser.name} (${this.currentUser.role})\n`
  
      // Download as text file
      const blob = new Blob([exportData], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `hasil-pemilihan-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
  
      this.showNotification("Hasil berhasil diekspor!", "success")
    }
  
    showUserManagement() {
      if (this.currentUser?.role !== "admin") {
        this.showNotification("Akses ditolak!", "error")
        return
      }
  
      const userList = Object.keys(this.users)
        .map((username) => {
          const user = this.users[username]
          return `${username} (${user.role}) - ${user.name}`
        })
        .join("\n")
  
      alert(`Daftar User:\n\n${userList}\n\nUntuk mengelola user lebih lanjut, hubungi developer sistem.`)
    }
  
    simulateRealTimeVotes() {
      // Simulasi suara masuk secara real-time (untuk demo)
      if (Math.random() < 0.2) {
        // 20% chance
        const randomCandidate = this.candidates[Math.floor(Math.random() * this.candidates.length)]
        if (!this.votes[randomCandidate.id]) {
          this.votes[randomCandidate.id] = 0
        }
        this.votes[randomCandidate.id]++
        randomCandidate.votes = this.votes[randomCandidate.id]
  
        this.saveData()
  
        // Update quick count if it's the active tab
        if (document.getElementById("quickcount").classList.contains("active")) {
          this.renderQuickCount()
        }
      }
    }
  
    updateVoteStatus() {
      const statusElement = document.getElementById("vote-status")
  
      if (this.currentUser?.role !== "user") {
        statusElement.innerHTML = `
          <div style="text-align: center; padding: 20px; background: rgba(59, 130, 246, 0.1); 
                     border: 2px solid var(--accent-primary); border-radius: 10px; margin-top: 20px;">
              <h3 style="color: var(--accent-primary); margin-bottom: 10px;">ℹ️ INFORMASI</h3>
              <p>Login sebagai Pemilih untuk dapat melakukan voting</p>
          </div>
        `
      } else if (this.hasVoted) {
        statusElement.innerHTML = `
          <div style="text-align: center; padding: 20px; background: rgba(5, 150, 105, 0.1); 
                     border: 2px solid var(--accent-success); border-radius: 10px; margin-top: 20px;">
              <h3 style="color: var(--accent-success); margin-bottom: 10px;">✓ VOTING BERHASIL</h3>
              <p>Terima kasih telah berpartisipasi dalam pemilihan!</p>
          </div>
        `
      } else {
        statusElement.innerHTML = `
          <div style="text-align: center; padding: 20px; background: rgba(217, 119, 6, 0.1); 
                     border: 2px solid var(--accent-warning); border-radius: 10px; margin-top: 20px;">
              <h3 style="color: var(--accent-warning); margin-bottom: 10px;">⚠ BELUM MEMILIH</h3>
              <p>Silakan pilih kandidat favorit Anda!</p>
          </div>
        `
      }
    }
  
    showNotification(message, type = "info") {
      const notification = document.createElement("div")
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      `
  
      switch (type) {
        case "success":
          notification.style.background = "linear-gradient(45deg, var(--accent-success), #047857)"
          break
        case "error":
          notification.style.background = "linear-gradient(45deg, var(--accent-danger), #b91c1c)"
          break
        default:
          notification.style.background = "linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))"
      }
  
      notification.textContent = message
      document.body.appendChild(notification)
  
      setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease-in"
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }, 3000)
    }
  
    saveData() {
      localStorage.setItem("candidates", JSON.stringify(this.candidates))
      localStorage.setItem("votes", JSON.stringify(this.votes))
      localStorage.setItem("hasVoted", this.hasVoted.toString())
      localStorage.setItem("totalVoters", this.totalVoters.toString())
      localStorage.setItem("users", JSON.stringify(this.users))
    }
  }
  
  // Add CSS animations for notifications
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
  
  // Initialize the voting system
  const votingSystem = new VotingSystem()
  