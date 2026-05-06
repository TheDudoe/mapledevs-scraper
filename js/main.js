/**
 * MapleDevs Main JavaScript
 * Clean, modular JavaScript for the MapleDevs job board
 */

(function() {
  'use strict';

  // ═══════ STATE MANAGEMENT ═══════
  const state = {
    jobs: [],
    filteredJobs: [],
    filters: {
      search: '',
      city: '',
      type: '',
      mode: '',
      role: '',
      exp: '',
      engine: '',
      visa: '',
      student: false
    },
    saved: [],
    theme: localStorage.getItem('theme') || 'light',
    currentPage: 1,
    perPage: 20
  };

  // ═══════ DOM ELEMENTS ═══════
  const elements = {
    header: document.querySelector('.header'),
    main: document.querySelector('.main'),
    jobList: document.querySelector('.job-list'),
    filterBar: document.querySelector('.filter-bar'),
    searchInput: document.querySelector('.filter-search input'),
    citySelect: document.querySelector('.filter-select[data-filter="city"] select'),
    typeSelect: document.querySelector('.filter-select[data-filter="type"] select'),
    modeSelect: document.querySelector('.filter-select[data-filter="mode"] select'),
    roleSelect: document.querySelector('.filter-select[data-filter="role"] select'),
    expSelect: document.querySelector('.filter-select[data-filter="exp"] select'),
    engineSelect: document.querySelector('.filter-select[data-filter="engine"] select'),
    visaSelect: document.querySelector('.filter-select[data-filter="visa"] select'),
    studentCheckbox: document.querySelector('.filter-checkbox input[data-filter="student"]'),
    filterPills: document.querySelector('.filter-pills'),
    resultsCount: document.querySelector('.results-count'),
    loadMoreBtn: document.querySelector('.load-more-btn'),
    themeBtn: document.getElementById('theme-btn'),
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    headerNav: document.querySelector('.header-nav'),
    toastContainer: document.querySelector('.toast-container')
  };

  // ═══════ UTILITY FUNCTIONS ═══════
  const utils = {
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    formatDate(dateString) {
      if (!dateString) return 'Recently';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

      return date.toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    isNew(dateString) {
      if (!dateString) return false;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      const diffTime = Math.abs(new Date() - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 4;
    },

    generateSlug(text) {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    highlightText(text, query) {
      if (!query) return utils.escapeHtml(text);
      const escapedQuery = utils.escapeHtml(query);
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return utils.escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }
  };

  // ═══════ THEME MANAGEMENT ═══════
  const theme = {
    init() {
      this.apply(state.theme);
      if (elements.themeBtn) {
        elements.themeBtn.addEventListener('click', () => this.toggle());
      }
    },

    apply(themeName) {
      document.documentElement.setAttribute('data-theme', themeName);
      localStorage.setItem('theme', themeName);
      state.theme = themeName;
    },

    toggle() {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      this.apply(newTheme);
    }
  };

  // ═══════ TOAST NOTIFICATIONS ═══════
  const toast = {
    show(message, type = 'info') {
      if (!elements.toastContainer) {
        elements.toastContainer = document.createElement('div');
        elements.toastContainer.className = 'toast-container';
        document.body.appendChild(elements.toastContainer);
      }

      const toastEl = document.createElement('div');
      toastEl.className = `toast ${type}`;
      toastEl.innerHTML = `
        <span>${message}</span>
        <button type="button" class="toast-close" aria-label="Close">&times;</button>
      `;

      elements.toastContainer.appendChild(toastEl);

      const closeBtn = toastEl.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        toastEl.remove();
      });

      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove();
        }
      }, 5000);
    },

    success(message) {
      this.show(message, 'success');
    },

    error(message) {
      this.show(message, 'error');
    },

    info(message) {
      this.show(message, 'info');
    }
  };

  // ═══════ FILTER MANAGEMENT ═══════
  const filters = {
    init() {
      // Search input
      if (elements.searchInput) {
        elements.searchInput.addEventListener('input', utils.debounce((e) => {
          state.filters.search = e.target.value.trim();
          this.apply();
        }, 300));
      }

      // Select dropdowns
      const selectElements = [
        { el: elements.citySelect, key: 'city' },
        { el: elements.typeSelect, key: 'type' },
        { el: elements.modeSelect, key: 'mode' },
        { el: elements.roleSelect, key: 'role' },
        { el: elements.expSelect, key: 'exp' },
        { el: elements.engineSelect, key: 'engine' },
        { el: elements.visaSelect, key: 'visa' }
      ];

      selectElements.forEach(({ el, key }) => {
        if (el) {
          el.addEventListener('change', (e) => {
            state.filters[key] = e.target.value;
            this.apply();
          });
        }
      });

      // Student checkbox
      if (elements.studentCheckbox) {
        elements.studentCheckbox.addEventListener('change', (e) => {
          state.filters.student = e.target.checked;
          this.apply();
        });
      }

      // Clear all filters
      const clearBtn = document.querySelector('.filter-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearAll());
      }
    },

    apply() {
      state.filteredJobs = this.filterJobs(state.jobs, state.filters);
      this.updatePills();
      this.updateResultsCount();
      render.jobs(state.filteredJobs, state.currentPage, state.perPage);
    },

    filterJobs(jobs, filters) {
      return jobs.filter(job => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            job.title?.toLowerCase().includes(searchLower) ||
            job.studio?.toLowerCase().includes(searchLower) ||
            job.description?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // City filter
        if (filters.city && job.location) {
          const matchesCity = job.location.toLowerCase().includes(filters.city.toLowerCase());
          if (!matchesCity) return false;
        }

        // Type filter
        if (filters.type && job.type) {
          const matchesType = job.type.toLowerCase().includes(filters.type.toLowerCase());
          if (!matchesType) return false;
        }

        // Mode filter
        if (filters.mode && job.mode) {
          const matchesMode = job.mode.toLowerCase().includes(filters.mode.toLowerCase());
          if (!matchesMode) return false;
        }

        // Role filter
        if (filters.role && job.role) {
          const matchesRole = job.role.toLowerCase().includes(filters.role.toLowerCase());
          if (!matchesRole) return false;
        }

        // Experience filter
        if (filters.exp && job.experience) {
          const matchesExp = job.experience.toLowerCase().includes(filters.exp.toLowerCase());
          if (!matchesExp) return false;
        }

        // Engine filter
        if (filters.engine && job.engine) {
          const matchesEngine = job.engine.toLowerCase().includes(filters.engine.toLowerCase());
          if (!matchesEngine) return false;
        }

        // Visa filter
        if (filters.visa === 'yes' && !job.visaSupport) {
          return false;
        }
        if (filters.visa === 'no' && job.visaSupport) {
          return false;
        }

        // Student filter
        if (filters.student && !job.studentFriendly) {
          return false;
        }

        return true;
      });
    },

    updatePills() {
      if (!elements.filterPills) return;

      const pills = [];

      if (state.filters.search) {
        pills.push({
          label: `"${state.filters.search}"`,
          key: 'search',
          value: ''
        });
      }

      if (state.filters.city) {
        pills.push({
          label: state.filters.city,
          key: 'city',
          value: ''
        });
      }

      if (state.filters.type) {
        pills.push({
          label: state.filters.type,
          key: 'type',
          value: ''
        });
      }

      if (state.filters.mode) {
        pills.push({
          label: state.filters.mode,
          key: 'mode',
          value: ''
        });
      }

      if (state.filters.role) {
        pills.push({
          label: state.filters.role,
          key: 'role',
          value: ''
        });
      }

      if (state.filters.exp) {
        pills.push({
          label: state.filters.exp,
          key: 'exp',
          value: ''
        });
      }

      if (state.filters.engine) {
        pills.push({
          label: state.filters.engine,
          key: 'engine',
          value: ''
        });
      }

      if (state.filters.visa) {
        pills.push({
          label: state.filters.visa === 'yes' ? 'Visa Support' : 'No Visa',
          key: 'visa',
          value: ''
        });
      }

      if (state.filters.student) {
        pills.push({
          label: 'Student-friendly',
          key: 'student',
          value: false
        });
      }

      if (pills.length === 0) {
        elements.filterPills.innerHTML = '';
        return;
      }

      elements.filterPills.innerHTML = pills.map((pill, index) => `
        <button class="filter-pill" data-index="${index}">
          ${utils.escapeHtml(pill.label)}
          <span class="filter-pill-remove">&times;</span>
        </button>
      `).join('') + `
        <button class="filter-clear">Clear all</button>
      `;

      // Add click handlers
      elements.filterPills.querySelectorAll('.filter-pill').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          const pill = pills[index];
          state.filters[pill.key] = pill.value;
          this.updateFilterElements();
          this.apply();
        });
      });

      elements.filterPills.querySelector('.filter-clear').addEventListener('click', () => {
        this.clearAll();
      });
    },

    updateFilterElements() {
      if (elements.searchInput) elements.searchInput.value = state.filters.search;
      if (elements.citySelect) elements.citySelect.value = state.filters.city;
      if (elements.typeSelect) elements.typeSelect.value = state.filters.type;
      if (elements.modeSelect) elements.modeSelect.value = state.filters.mode;
      if (elements.roleSelect) elements.roleSelect.value = state.filters.role;
      if (elements.expSelect) elements.expSelect.value = state.filters.exp;
      if (elements.engineSelect) elements.engineSelect.value = state.filters.engine;
      if (elements.visaSelect) elements.visaSelect.value = state.filters.visa;
      if (elements.studentCheckbox) elements.studentCheckbox.checked = state.filters.student;
    },

    updateResultsCount() {
      if (!elements.resultsCount) return;
      const count = state.filteredJobs.length;
      elements.resultsCount.innerHTML = `Showing <strong>${count}</strong> role${count !== 1 ? 's' : ''}`;
    },

    clearAll() {
      state.filters = {
        search: '',
        city: '',
        type: '',
        mode: '',
        role: '',
        exp: '',
        engine: '',
        visa: '',
        student: false
      };
      this.updateFilterElements();
      this.apply();
    }
  };

  // ═══════ SAVED JOBS ═══════
  const savedJobs = {
    init() {
      const saved = localStorage.getItem('md_saved');
      if (saved) {
        try {
          state.saved = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved jobs:', e);
          state.saved = [];
        }
      }
      this.updateBadge();
    },

    add(jobId) {
      if (!state.saved.includes(jobId)) {
        state.saved.push(jobId);
        this.save();
        this.updateBadge();
        toast.success('Job saved!');
      }
    },

    remove(jobId) {
      const index = state.saved.indexOf(jobId);
      if (index > -1) {
        state.saved.splice(index, 1);
        this.save();
        this.updateBadge();
        toast.info('Job removed from saved');
      }
    },

    toggle(jobId) {
      if (state.saved.includes(jobId)) {
        this.remove(jobId);
      } else {
        this.add(jobId);
      }
    },

    isSaved(jobId) {
      return state.saved.includes(jobId);
    },

    save() {
      localStorage.setItem('md_saved', JSON.stringify(state.saved));
    },

    updateBadge() {
      const badge = document.getElementById('sv-badge');
      if (badge) {
        badge.textContent = state.saved.length;
        badge.classList.toggle('show', state.saved.length > 0);
      }
    },

    getAll() {
      return state.jobs.filter(job => this.isSaved(job.id));
    }
  };

  // ═══════ RENDERING ═══════
  const render = {
    jobs(jobs, page, perPage) {
      if (!elements.jobList) return;

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const jobsToShow = jobs.slice(start, end);

      if (jobs.length === 0) {
        elements.jobList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">No jobs found</h3>
            <p class="empty-state-description">Try adjusting your filters or search terms to find more opportunities.</p>
          </div>
        `;
        return;
      }

      elements.jobList.innerHTML = jobsToShow.map((job, index) => this.jobCard(job, start + index)).join('');

      // Update load more button
      if (elements.loadMoreBtn) {
        const remaining = jobs.length - end;
        if (remaining > 0) {
          elements.loadMoreBtn.textContent = `Show more (${remaining} remaining)`;
          elements.loadMoreBtn.style.display = 'inline-flex';
        } else {
          elements.loadMoreBtn.style.display = 'none';
        }
      }

      // Add event listeners to job cards
      elements.jobList.querySelectorAll('.job-card').forEach((card, index) => {
        const jobIndex = start + index;
        const job = jobsToShow[index];

        // Save button
        const saveBtn = card.querySelector('.job-card-save');
        if (saveBtn) {
          saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            savedJobs.toggle(job.id);
            saveBtn.classList.toggle('saved', savedJobs.isSaved(job.id));
          });
        }

        // Card click
        card.addEventListener('click', () => {
          this.openJobDetail(job);
        });
      });
    },

    jobCard(job) {
      const isNew = utils.isNew(job.posted);
      const isFeatured = job.featured;
      const isSaved = savedJobs.isSaved(job.id);

      const badges = [];
      if (isFeatured) badges.push('<span class="badge badge-accent">Featured</span>');
      if (isNew) badges.push('<span class="badge badge-new">New</span>');

      const tags = [];
      if (job.type) tags.push(`<span class="tag">${utils.escapeHtml(job.type)}</span>`);
      if (job.mode) tags.push(`<span class="tag">${utils.escapeHtml(job.mode)}</span>`);
      if (job.studentFriendly) tags.push(`<span class="tag">Student-friendly</span>`);

      return `
        <article class="job-card${isFeatured ? ' featured' : ''}" data-job-id="${utils.escapeHtml(job.id)}">
          <div class="job-card-header">
            <div>
              <div class="job-card-badges">${badges.join('')}</div>
              <h3 class="job-card-title">${utils.highlightText(job.title, state.filters.search)}</h3>
              <div class="job-card-studio">${utils.highlightText(job.studio, state.filters.search)}</div>
            </div>
            <button class="job-card-save${isSaved ? ' saved' : ''}" aria-label="${isSaved ? 'Remove from saved' : 'Save job'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <div class="job-card-meta">
            <div class="job-card-meta-item">
              <span class="job-card-meta-label">Location</span>
              <span class="job-card-meta-value">${utils.escapeHtml(job.location || 'Canada')}</span>
            </div>
            <div class="job-card-meta-item">
              <span class="job-card-meta-label">Type</span>
              <span class="job-card-meta-value">${utils.escapeHtml(job.type || 'Full-time')}</span>
            </div>
            <div class="job-card-meta-item">
              <span class="job-card-meta-label">Mode</span>
              <span class="job-card-meta-value">${utils.escapeHtml(job.mode || 'On-site')}</span>
            </div>
            ${job.salary ? `
              <div class="job-card-meta-item">
                <span class="job-card-meta-label">Salary</span>
                <span class="job-card-meta-value salary">${utils.escapeHtml(job.salary)}</span>
              </div>
            ` : ''}
          </div>

          <div class="job-card-tags">${tags.join('')}</div>

          <p class="job-card-description">${utils.escapeHtml(job.description || '')}</p>

          <div class="job-card-footer">
            <span class="job-card-date">${utils.formatDate(job.posted)}</span>
            <div class="job-card-actions">
              <a href="${utils.escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                Apply
              </a>
            </div>
          </div>
        </article>
      `;
    },

    openJobDetail(job) {
      // For now, just open the apply URL
      if (job.applyUrl) {
        window.open(job.applyUrl, '_blank', 'noopener noreferrer');
      }
    }
  };

  // ═══════ DATA LOADING ═══════
  const dataLoader = {
    async loadJobs() {
      try {
        // Try to load from Google Sheets CSV
        const sheetId = '1L2KcTO32jK5MVY1m3qdqdja7LTZ38f8lYXsK5mNMMDo';
        const sheetName = 'jobs_live';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Failed to load jobs');

        const csvText = await response.text();
        state.jobs = this.parseCSV(csvText);
        state.filteredJobs = [...state.jobs];

        // Initialize filters
        filters.init();
        savedJobs.init();

        // Render initial jobs
        filters.apply();

      } catch (error) {
        console.error('Failed to load jobs:', error);
        toast.error('Failed to load jobs. Please try again later.');
      }
    },

    parseCSV(csvText) {
      const lines = csvText.split('\n');
      if (lines.length < 2) return [];

      const headers = this.parseCSVLine(lines[0]);
      const jobs = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line);
        const job = {};

        headers.forEach((header, index) => {
          job[header] = values[index] || '';
        });

        // Normalize job data
        job.id = job['job_id'] || job['Job ID'] || `${i}`;
        job.title = job['title'] || job['Job Title'] || '';
        job.studio = job['studio'] || job['Studio Name'] || '';
        job.location = job['location'] || job['Location'] || '';
        job.type = job['type'] || job['Job Type'] || '';
        job.mode = job['mode'] || job['Work Mode'] || '';
        job.salary = job['salary'] || job['Salary'] || '';
        job.description = job['description'] || job['Description'] || '';
        job.applyUrl = job['apply'] || job['Apply URL'] || job['How to Apply'] || '';
        job.posted = job['posted'] || job['Date Posted'] || '';
        job.featured = (job['feature'] || job['Featured'] || '').toLowerCase() === 'yes';
        job.studentFriendly = (job['student'] || job['Student'] || '').toLowerCase() === 'yes';
        job.visaSupport = (job['visa'] || job['Visa'] || '').toLowerCase().includes('yes');

        if (job.title && job.studio) {
          jobs.push(job);
        }
      }

      return jobs;
    },

    parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current);
      return result;
    }
  };

  // ═══════ MOBILE MENU ═══════
  const mobileMenu = {
    init() {
      if (elements.mobileMenuToggle && elements.headerNav) {
        elements.mobileMenuToggle.addEventListener('click', () => this.toggle());
      }

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (elements.headerNav && elements.headerNav.classList.contains('mobile-open')) {
          if (!elements.headerNav.contains(e.target) && !elements.mobileMenuToggle.contains(e.target)) {
            this.close();
          }
        }
      });
    },

    toggle() {
      elements.headerNav.classList.toggle('mobile-open');
    },

    close() {
      elements.headerNav.classList.remove('mobile-open');
    }
  };

  // ═══════ FEATURE BANNER ═══════
  const featureBanner = {
    init() {
      const banner = document.querySelector('.feature-banner');
      const closeBtn = document.querySelector('.feature-banner-close');

      if (banner && closeBtn) {
        // Check if user has already closed it
        if (localStorage.getItem('featureBannerClosed')) {
          banner.style.display = 'none';
        }

        closeBtn.addEventListener('click', () => {
          banner.style.display = 'none';
          localStorage.setItem('featureBannerClosed', 'true');
        });
      }
    }
  };

  // ═══════ INITIALIZATION ═══════
  function init() {
    // Initialize all modules
    theme.init();
    mobileMenu.init();
    featureBanner.init();

    // Load jobs
    dataLoader.loadJobs();

    // Load more button
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener('click', () => {
        state.currentPage++;
        render.jobs(state.filteredJobs, state.currentPage, state.perPage);
      });
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to global scope for debugging
  window.MapleDevs = {
    state,
    utils,
    toast,
    filters,
    savedJobs,
    render
  };

})();
