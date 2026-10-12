function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close a modal via its × button or by clicking the dimmed backdrop.
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', event => {
    if (event.target === overlay || event.target.classList.contains('modal-close')) {
      closeModal(overlay.id);
    }
  });
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function setText(id, value) {
  document.getElementById(id).textContent = value ?? '';
}

// Renders an <img> only when the content entry has an "image" path set.
function imageTag(src, alt, className) {
  return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${className}" loading="lazy">` : '';
}

function iconTag(icon) {
  return icon ? `<i class="${escapeHtml(icon)}"></i> ` : '';
}

// Builds a link/button from a content.json entry. "action" can be:
//   "contact"  -> opens the contact modal
//   "linkedin" -> links to contact.linkedin
// otherwise "href" is used as-is (absolute URLs open in a new tab).
function linkTag(item, className, contact) {
  let href = item.href || '#';
  let extra = '';
  if (item.action === 'contact') {
    extra = ' data-open-modal="contact-modal"';
    href = '#';
  } else if (item.action === 'linkedin') {
    href = contact.linkedin;
  }
  if (/^https?:/.test(href)) extra += ' target="_blank" rel="noopener"';
  return `<a href="${escapeHtml(href)}"${className ? ` class="${className}"` : ''}${extra}>${iconTag(item.icon)}${escapeHtml(item.label)}</a>`;
}

const BUTTON_CLASSES = { primary: 'btn-primary', secondary: 'btn-secondary', contact: 'btn-contact' };

function renderListItem(entry, title, org, time, bullets) {
  return `
    <div class="exp-item${entry.image ? ' has-image' : ''}">
      ${imageTag(entry.image, org, 'exp-image')}
      <div class="exp-content">
        <div class="exp-header">
          <div>
            <div class="exp-role">${escapeHtml(title)}</div>
            <div class="exp-org">${escapeHtml(org)}</div>
          </div>
          <div class="exp-time">${escapeHtml(time)}</div>
        </div>
        <ul class="exp-bullets">${bullets}</ul>
      </div>
    </div>`;
}

function openProject(project) {
  const highlights = (project.highlights || []).map(h =>
    `<li><strong>${escapeHtml(h.title)}:</strong> ${escapeHtml(h.text)}</li>`).join('');
  document.getElementById('project-modal-content').innerHTML = `
    ${imageTag(project.image, project.title, 'modal-image')}
    <h3 class="modal-title">${escapeHtml(project.title)}</h3>
    <div class="modal-subtitle">${escapeHtml(project.subtitle)}</div>
    <div class="modal-body">
      ${project.overview ? `<p>${escapeHtml(project.overview)}</p>` : ''}
      ${highlights ? `<ul>${highlights}</ul>` : ''}
    </div>`;
  openModal('project-modal');
}

function render(data) {
  const { profile, contact } = data;

  document.title = profile.pageTitle || profile.name;
  setText('logo', profile.name);
  setText('hero-name', profile.name);
  setText('hero-title', profile.tagline);
  document.getElementById('hero-badge').innerHTML = iconTag(profile.badgeIcon) + escapeHtml(profile.badge);
  setText('footer-text', profile.footer);
  document.getElementById('hero-intro').innerHTML =
    (profile.intro || []).map(escapeHtml).join('<br><br>');

  const headshot = document.getElementById('headshot');
  headshot.src = profile.headshot;
  headshot.alt = `${profile.name} Headshot`;

  document.getElementById('nav-links').innerHTML = (data.nav || []).map(item =>
    `<li>${linkTag(item, BUTTON_CLASSES[item.style], contact)}</li>`).join('');

  document.getElementById('hero-actions').innerHTML = (data.heroButtons || []).map(item =>
    linkTag(item, BUTTON_CLASSES[item.style] || 'btn-secondary', contact)).join('');

  document.querySelectorAll('[data-section]').forEach(heading => {
    const section = (data.sections || {})[heading.dataset.section] || {};
    heading.innerHTML = iconTag(section.icon) + escapeHtml(section.title);
  });

  document.getElementById('stats').innerHTML = (data.stats || []).map(s => `
    <div class="stat-card">
      <div class="stat-number${s.highlight ? ' pink' : ''}">${escapeHtml(s.value)}</div>
      <div class="stat-label">${escapeHtml(s.label)}</div>
    </div>`).join('');

  document.getElementById('experience-list').innerHTML = (data.experience || []).map(e =>
    renderListItem(e, e.role, e.organization, e.dates,
      (e.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join(''))).join('');

  document.getElementById('publications-list').innerHTML = (data.publications || []).map(p =>
    renderListItem(p, p.title, p.venue, p.year,
      (p.details || []).map(d => `<li><strong>${escapeHtml(d.label)}:</strong> ${escapeHtml(d.text)}</li>`).join(''))).join('');

  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  (data.projects || []).forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-header">
        ${imageTag(project.image, project.title, 'project-image')}
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-desc">${escapeHtml(project.summary)}</p>
      </div>
      <div class="tags">${(project.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
    card.addEventListener('click', () => openProject(project));
    grid.appendChild(card);
  });

  document.getElementById('coursework-grid').innerHTML = (data.coursework || []).map(group => `
    <div class="course-card">
      <h3 class="course-card-title"><i class="${escapeHtml(group.icon)}"></i> ${escapeHtml(group.title)}</h3>
      <ul class="course-list">
        ${(group.courses || []).map(c => `
          <li class="course-item">
            <span class="course-code">${escapeHtml(c.code)}</span>
            <span class="course-name">${escapeHtml(c.name)}</span>
          </li>`).join('')}
      </ul>
    </div>`).join('');

  setText('contact-heading', contact.heading);
  setText('contact-subtitle', contact.subtitle);
  const contactItems = [
    contact.email && { href: `mailto:${contact.email}`, icon: 'fa-solid fa-envelope', label: 'Email', value: contact.email },
    contact.phone && { href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, icon: 'fa-solid fa-phone', label: 'Phone', value: contact.phone },
    contact.linkedin && { href: contact.linkedin, icon: 'fa-brands fa-linkedin', label: 'LinkedIn', value: contact.linkedin.replace(/^https?:\/\//, ''), external: true }
  ].filter(Boolean);
  document.getElementById('contact-list').innerHTML = contactItems.map(c => `
    <a href="${escapeHtml(c.href)}" class="contact-item"${c.external ? ' target="_blank"' : ''}>
      <i class="${c.icon}"></i>
      <div class="contact-item-info">
        <span>${c.label}</span>
        <strong>${escapeHtml(c.value)}</strong>
      </div>
    </a>`).join('');

  document.querySelectorAll('[data-open-modal]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      openModal(link.dataset.openModal);
    });
  });
}

fetch('content.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(render)
  .catch(err => {
    console.error('Failed to load content.json', err);
    document.querySelector('main').insertAdjacentHTML('afterbegin',
      '<p class="load-error">Could not load content.json. If you opened this file directly, run a local server instead (e.g. <code>python3 -m http.server</code>).</p>');
  });
