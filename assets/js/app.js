// ============================================
// Kilis Taksi Portalı - JavaScript Application
// ============================================

// Global state
const AppState = {
  taxis: [],
  filteredTaxis: [],
  userLocation: null,
  activeFilters: {
    search: '',
    mahalle: '',
    is24_7: false,
    acceptsCard: false,
    airport: false,
    busStation: false
  }
};

// ============================================
// Data Loading
// ============================================
async function loadTaxiData() {
  try {
    showLoading();
    const response = await fetch('./assets/data/taksiler.json');
    if (!response.ok) throw new Error('Veri yüklenemedi');

    AppState.taxis = await response.json();
    AppState.filteredTaxis = [...AppState.taxis];

    hideLoading();
    renderTaxis();
    populateFilters();
  } catch (error) {
    console.error('Taksi verileri yüklenirken hata:', error);
    showError('Taksi verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
  }
}

// ============================================
// Search & Filter Functions
// ============================================
function applyFilters() {
  let filtered = [...AppState.taxis];

  // Search filter
  if (AppState.activeFilters.search) {
    const searchLower = AppState.activeFilters.search.toLowerCase();
    filtered = filtered.filter(taxi =>
      taxi.durakAdi.toLowerCase().includes(searchLower) ||
      taxi.mahalle.toLowerCase().includes(searchLower) ||
      taxi.hizmetler.some(h => h.toLowerCase().includes(searchLower))
    );
  }

  // Mahalle filter
  if (AppState.activeFilters.mahalle) {
    filtered = filtered.filter(taxi =>
      taxi.mahalle === AppState.activeFilters.mahalle
    );
  }

  // 7/24 filter
  if (AppState.activeFilters.is24_7) {
    filtered = filtered.filter(taxi =>
      taxi.calismaSaatleri === '7/24'
    );
  }

  // Card payment filter
  if (AppState.activeFilters.acceptsCard) {
    filtered = filtered.filter(taxi =>
      taxi.odeme.includes('kart')
    );
  }

  // Airport transfer filter
  if (AppState.activeFilters.airport) {
    filtered = filtered.filter(taxi =>
      taxi.hizmetler.includes('havalimani')
    );
  }

  // Bus station filter
  if (AppState.activeFilters.busStation) {
    filtered = filtered.filter(taxi =>
      taxi.hizmetler.includes('otogar')
    );
  }

  // Sort: Featured first, then by name
  filtered.sort((a, b) => {
    if (a.oneCikar && !b.oneCikar) return -1;
    if (!a.oneCikar && b.oneCikar) return 1;
    return a.durakAdi.localeCompare(b.durakAdi, 'tr');
  });

  // If user location available, sort by distance
  if (AppState.userLocation) {
    filtered = sortByDistance(filtered);
  }

  AppState.filteredTaxis = filtered;
  renderTaxis();
  updateActiveFiltersDisplay();
}

// Search with debounce
let searchTimeout;
function handleSearch(searchTerm) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    AppState.activeFilters.search = searchTerm;
    applyFilters();
    updateDynamicSEO();
  }, 300);
}

// ============================================
// Dynamic SEO Updates
// ============================================
function updateDynamicSEO() {
  const metaDescription = document.querySelector('meta[name="description"]');
  const pageTitle = document.querySelector('title');
  if (!pageTitle) return;

  const originalTitle = "Kilis Taksi Portalı | 7/24 Taksi Hizmeti";
  const originalDescription = metaDescription ? metaDescription.getAttribute('content') : "";

  // For Duraklar Page with filters
  if (window.location.pathname.includes('duraklar.html')) {
    if (AppState.activeFilters.mahalle) {
      const mahalle = AppState.activeFilters.mahalle;
      document.title = `${mahalle} Taksi Durakları - Kilis Taksi`;
      if (metaDescription) {
        metaDescription.setAttribute('content', `${mahalle} mahallesindeki taksi durakları, telefon numaraları ve hizmetler. Kilis ${mahalle} en yakın taksi durağını bulun.`);
      }
    } else if (AppState.activeFilters.search) {
      document.title = `"${AppState.activeFilters.search}" için Sonuçlar - Kilis Taksi`;
    } else {
      document.title = "Tüm Taksi Durakları - Kilis Taksi";
    }
  }
}

// ============================================
// Location Services
// ============================================
function requestUserLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        AppState.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        applyFilters();
        showNotification('Konumunuz alındı! En yakın duraklar gösteriliyor.', 'success');
      },
      (error) => {
        console.log('Konum alınamadı:', error);
        showNotification('Konumunuz alınamadı. Varsayılan sıralama kullanılıyor.', 'info');
      }
    );
  }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sortByDistance(taxis) {
  if (!AppState.userLocation) return taxis;

  return taxis.map(taxi => {
    const [lat, lng] = taxi.konum.split(',').map(Number);
    const distance = calculateDistance(
      AppState.userLocation.lat,
      AppState.userLocation.lng,
      lat,
      lng
    );
    return { ...taxi, distance };
  }).sort((a, b) => {
    // Featured first
    if (a.oneCikar && !b.oneCikar) return -1;
    if (!a.oneCikar && b.oneCikar) return 1;
    // Then by distance
    return a.distance - b.distance;
  });
}

// ============================================
// Rendering Functions
// ============================================
function renderTaxis() {
  const container = document.getElementById('taxis-container');
  if (!container) return;

  if (AppState.filteredTaxis.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
        <p style="font-size: 1.5rem; margin-bottom: 1rem;">😕</p>
        <p style="font-size: 1.25rem; font-weight: 600;">Aramanıza uygun taksi durağı bulunamadı</p>
        <p style="color: #CBD5E1; margin-top: 0.5rem;">Filtreleri değiştirerek tekrar deneyin</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.filteredTaxis.map((taxi, index) => {
    // Add ad after every 6 cards
    const adHtml = (index + 1) % 6 === 0 ? `
      <div class="ad-container" style="grid-column: 1 / -1;">
        <!-- AdSense In-Feed Ad -->
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-6t+ed+2i-1n-4w"
             data-ad-client="ca-pub-4211004489667670"
             data-ad-slot="XXXXXXXXXX"></ins>
      </div>
    ` : '';

    return createTaxiCard(taxi) + adHtml;
  }).join('');

  // Reinitialize AdSense ads
  if (window.adsbygoogle) {
    const ads = document.querySelectorAll('.adsbygoogle');
    ads.forEach(ad => {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.log('AdSense error:', e);
      }
    });
  }
}

function createTaxiCard(taxi) {
  const badges = [];

  if (taxi.oneCikar) {
    badges.push('<span class="badge badge-featured">⭐ Sponsorlu</span>');
  }

  if (taxi.calismaSaatleri === '7/24') {
    badges.push('<span class="badge badge-24-7">7/24</span>');
  }

  if (taxi.distance !== undefined) {
    const isNearest = taxi.distance < 2;
    if (isNearest) {
      badges.push(`<span class="badge badge-nearest">📍 ${taxi.distance.toFixed(1)} km</span>`);
    }
  }

  const services = taxi.hizmetler.map(service => {
    const serviceNames = {
      '7/24': '24 Saat',
      'havalimani': '✈️ Havalimanı',
      'otogar': '🚌 Otogar'
    };
    return `<span class="service-tag">${serviceNames[service] || service}</span>`;
  }).join('');

  const paymentMethods = taxi.odeme.map(method => {
    return method === 'kart' ? '💳 Kart' : '💵 Nakit';
  }).join(', ');

  return `
    <div class="taxi-card fade-in">
      <div class="taxi-card-header">
        <div>
          <h3 class="taxi-card-title">${taxi.durakAdi}</h3>
          <p class="taxi-card-subtitle">${taxi.mahalle}</p>
        </div>
        <div class="badges">
          ${badges.join('')}
        </div>
      </div>
      
      <div class="taxi-card-info">
        <div class="info-row">
          <span class="info-icon">📞</span>
          <span>${taxi.telefonlar.join(' / ')}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🕐</span>
          <span>${taxi.calismaSaatleri}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">💳</span>
          <span>${paymentMethods}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">🚗</span>
          <span>${taxi.aracTipi}</span>
        </div>
      </div>
      
      ${services ? `<div class="services">${services}</div>` : ''}
      
      <div class="taxi-card-actions">
        <a href="tel:${taxi.telefonlar[0].replace(/\s/g, '')}" class="action-btn action-btn-call">
          <span class="action-btn-icon">📞</span>
          <span>Ara</span>
        </a>
        <a href="https://wa.me/${taxi.whatsapp}" target="_blank" class="action-btn action-btn-whatsapp">
          <span class="action-btn-icon">💬</span>
          <span>WhatsApp</span>
        </a>
        <a href="https://www.google.com/maps/search/?api=1&query=${taxi.konum}" target="_blank" class="action-btn action-btn-directions">
          <span class="action-btn-icon">📍</span>
          <span>Yol Tarifi</span>
        </a>
      </div>
      
      <a href="durak-detay.html?id=${taxi.id}" style="display: block; margin-top: 0.75rem; text-align: center; color: var(--color-primary); font-weight: 600; font-size: 0.875rem;">
        Detaylı Bilgi →
      </a>
    </div>
  `;
}

function populateFilters() {
  const mahalleSelect = document.getElementById('mahalle-filter');
  if (!mahalleSelect) return;

  // Get unique mahalle values
  const mahalleler = [...new Set(AppState.taxis.map(t => t.mahalle))].sort((a, b) =>
    a.localeCompare(b, 'tr')
  );

  mahalleler.forEach(mahalle => {
    const option = document.createElement('option');
    option.value = mahalle;
    option.textContent = mahalle;
    mahalleSelect.appendChild(option);
  });
}

function updateActiveFiltersDisplay() {
  const container = document.getElementById('active-filters');
  if (!container) return;

  const chips = [];

  if (AppState.activeFilters.search) {
    chips.push(`
      <span class="filter-chip">
        ${AppState.activeFilters.search}
        <span class="filter-chip-remove" onclick="removeFilter('search')">×</span>
      </span>
    `);
  }

  if (AppState.activeFilters.mahalle) {
    chips.push(`
      <span class="filter-chip">
        ${AppState.activeFilters.mahalle}
        <span class="filter-chip-remove" onclick="removeFilter('mahalle')">×</span>
      </span>
    `);
  }

  if (AppState.activeFilters.is24_7) {
    chips.push(`
      <span class="filter-chip">
        7/24
        <span class="filter-chip-remove" onclick="removeFilter('is24_7')">×</span>
      </span>
    `);
  }

  if (AppState.activeFilters.acceptsCard) {
    chips.push(`
      <span class="filter-chip">
        Kartla Ödeme
        <span class="filter-chip-remove" onclick="removeFilter('acceptsCard')">×</span>
      </span>
    `);
  }

  if (AppState.activeFilters.airport) {
    chips.push(`
      <span class="filter-chip">
        Havalimanı
        <span class="filter-chip-remove" onclick="removeFilter('airport')">×</span>
      </span>
    `);
  }

  if (AppState.activeFilters.busStation) {
    chips.push(`
      <span class="filter-chip">
        Otogar
        <span class="filter-chip-remove" onclick="removeFilter('busStation')">×</span>
      </span>
    `);
  }

  if (chips.length > 0) {
    container.innerHTML = chips.join('') + `
      <button onclick="clearAllFilters()" style="padding: 0.25rem 0.75rem; background: #EF4444; color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
        Tümünü Temizle
      </button>
    `;
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }

  // Update result count
  const resultCount = document.getElementById('result-count');
  if (resultCount) {
    resultCount.textContent = `${AppState.filteredTaxis.length} durak bulundu`;
  }
}

function removeFilter(filterName) {
  if (filterName === 'search') {
    AppState.activeFilters.search = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
  } else if (filterName === 'mahalle') {
    AppState.activeFilters.mahalle = '';
    const mahalleSelect = document.getElementById('mahalle-filter');
    if (mahalleSelect) mahalleSelect.value = '';
  } else {
    AppState.activeFilters[filterName] = false;
    const checkbox = document.getElementById(`${filterName}-filter`);
    if (checkbox) checkbox.checked = false;
  }

  applyFilters();
}

function clearAllFilters() {
  AppState.activeFilters = {
    search: '',
    mahalle: '',
    is24_7: false,
    acceptsCard: false,
    airport: false,
    busStation: false
  };

  // Reset form elements
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const mahalleSelect = document.getElementById('mahalle-filter');
  if (mahalleSelect) mahalleSelect.value = '';

  document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);

  applyFilters();
}

// ============================================
// Price Calculator
// ============================================
function calculatePrice() {
  const distanceInput = document.getElementById('distance-input');
  const resultDiv = document.getElementById('calculator-result');

  if (!distanceInput || !resultDiv) return;

  const distance = parseFloat(distanceInput.value);

  if (isNaN(distance) || distance <= 0) {
    resultDiv.innerHTML = `
      <p style="color: #EF4444; font-weight: 600;">Lütfen geçerli bir mesafe girin</p>
    `;
    resultDiv.style.display = 'block';
    return;
  }

  const acilisUcreti = 30;
  const kmBasiUcret = 15;
  const tahminiUcret = acilisUcreti + (distance * kmBasiUcret);

  resultDiv.innerHTML = `
    <div class="calculator-result">
      <div class="calculator-price">${tahminiUcret.toFixed(2)} ₺</div>
      <div class="calculator-disclaimer">
        * Fiyatlar duruma göre değişebilir. Bu bir tahmini ücrettir.
      </div>
    </div>
  `;
  resultDiv.style.display = 'block';
}

// ============================================
// Detail Page Functions
// ============================================
function loadTaxiDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const taxiId = urlParams.get('id');

  if (!taxiId) {
    window.location.href = 'index.html';
    return;
  }

  fetch('./assets/data/taksiler.json')
    .then(res => res.json())
    .then(taxis => {
      const taxi = taxis.find(t => t.id === taxiId);

      if (!taxi) {
        window.location.href = 'index.html';
        return;
      }

      renderTaxiDetail(taxi);
    })
    .catch(error => {
      console.error('Veri yüklenirken hata:', error);
      showError('Taksi bilgileri yüklenemedi');
    });
}

function renderTaxiDetail(taxi) {
  document.title = `${taxi.durakAdi} | Kilis Taksi Telefon & Detaylar`;
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', `${taxi.durakAdi} iletişim bilgileri, telefon numarası ${taxi.telefonlar[0]}, ${taxi.mahalle} mahallesi konumu ve hizmetleri. Kilis taksi durağı detayları.`);
  }

  const container = document.getElementById('taxi-detail-container');
  if (!container) return;

  const paymentMethods = taxi.odeme.map(method => {
    return method === 'kart' ? '💳 Kart' : '💵 Nakit';
  }).join(', ');

  const services = taxi.hizmetler.map(service => {
    const serviceNames = {
      '7/24': '24 Saat Hizmet',
      'havalimani': '✈️ Havalimanı Transferi',
      'otogar': '🚌 Otogar Transferi'
    };
    return `<li>${serviceNames[service] || service}</li>`;
  }).join('');

  container.innerHTML = `
    <div class="detail-content" style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
      <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: #0F172A;">
        ${taxi.durakAdi}
      </h1>
      
      <div style="margin-bottom: 2rem;">
        <div style="margin-bottom: 1rem;">
          <strong>📍 Konum:</strong> ${taxi.konumAdres}
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>📞 Telefon:</strong> ${taxi.telefonlar.join(', ')}
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>🕐 Çalışma Saatleri:</strong> ${taxi.calismaSaatleri}
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>💳 Ödeme:</strong> ${paymentMethods}
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>🚗 Araç Tipi:</strong> ${taxi.aracTipi}
        </div>
      </div>
      
      ${services ? `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Hizmetler:</h3>
          <ul style="list-style: none; padding: 0;">
            ${services}
          </ul>
        </div>
      ` : ''}
      
      ${taxi.aciklama ? `
        <div style="margin-bottom: 2rem; padding: 1rem; background: #F1F5F9; border-radius: 0.5rem;">
          <p>${taxi.aciklama}</p>
        </div>
      ` : ''}
      
      <div style="margin-bottom: 2rem;">
        <h3 style="font-weight: 600; margin-bottom: 1rem;">Konum</h3>
        <iframe 
          width="100%" 
          height="300" 
          frameborder="0" 
          style="border:0; border-radius: 0.5rem;" 
          src="https://maps.google.com/maps?q=${taxi.konum}&output=embed"
          allowfullscreen>
        </iframe>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        <a href="tel:${taxi.telefonlar[0].replace(/\s/g, '')}" class="action-btn action-btn-call" style="text-align: center; padding: 1rem;">
          <span class="action-btn-icon">📞</span>
          <span>Hemen Ara</span>
        </a>
        <a href="https://wa.me/${taxi.whatsapp}" target="_blank" class="action-btn action-btn-whatsapp" style="text-align: center; padding: 1rem;">
          <span class="action-btn-icon">💬</span>
          <span>WhatsApp</span>
        </a>
        <a href="https://www.google.com/maps/search/?api=1&query=${taxi.konum}" target="_blank" class="action-btn action-btn-directions" style="text-align: center; padding: 1rem;">
          <span class="action-btn-icon">📍</span>
          <span>Yol Tarifi Al</span>
        </a>
      </div>
    </div>
  `;
}

// ============================================
// UI Helper Functions
// ============================================
function showLoading() {
  const container = document.getElementById('taxis-container');
  if (container) {
    container.innerHTML = `
      <div class="loading" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
      </div>
    `;
  }
}

function hideLoading() {
  // Loading will be replaced by content
}

function showError(message) {
  showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
    color: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// Mobile Menu Toggle
// ============================================
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('active');
  }
}

// ============================================
// Event Listeners Setup
// ============================================
function initializeEventListeners() {
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }

  // Mahalle filter
  const mahalleSelect = document.getElementById('mahalle-filter');
  if (mahalleSelect) {
    mahalleSelect.addEventListener('change', (e) => {
      AppState.activeFilters.mahalle = e.target.value;
      applyFilters();
      updateDynamicSEO();
    });
  }

  // Checkbox filters
  const filters = [
    { id: 'is24_7-filter', key: 'is24_7' },
    { id: 'acceptsCard-filter', key: 'acceptsCard' },
    { id: 'airport-filter', key: 'airport' },
    { id: 'busStation-filter', key: 'busStation' }
  ];

  filters.forEach(filter => {
    const checkbox = document.getElementById(filter.id);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        AppState.activeFilters[filter.key] = e.target.checked;
        applyFilters();
      });
    }
  });

  // Location button
  const locationBtn = document.getElementById('location-btn');
  if (locationBtn) {
    locationBtn.addEventListener('click', requestUserLocation);
  }

  // Calculator
  const calculateBtn = document.getElementById('calculate-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculatePrice);
  }

  const distanceInput = document.getElementById('distance-input');
  if (distanceInput) {
    distanceInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculatePrice();
    });
  }

  // Mobile menu toggle
  const navbarToggle = document.querySelector('.navbar-toggle');
  if (navbarToggle) {
    navbarToggle.addEventListener('click', toggleMobileMenu);
  }
}

// ============================================
// Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize based on current page
  if (window.location.pathname.includes('durak-detay.html')) {
    loadTaxiDetail();
  } else {
    loadTaxiData().then(() => {
      // Check for URL parameters on load
      const urlParams = new URLSearchParams(window.location.search);
      const mahalleParam = urlParams.get('mahalle');
      const searchParam = urlParams.get('search');
      
      if (mahalleParam) {
        AppState.activeFilters.mahalle = mahalleParam;
        const mahalleSelect = document.getElementById('mahalle-filter');
        if (mahalleSelect) mahalleSelect.value = mahalleParam;
      }
      
      if (searchParam) {
        AppState.activeFilters.search = searchParam;
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = searchParam;
      }
      
      if (mahalleParam || searchParam) {
        applyFilters();
        updateDynamicSEO();
      }
    });
    initializeEventListeners();
  }

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-menu a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});
