// Theme Toggle
const html = document.documentElement;
function syncTheme(){
  const d = html.classList.contains('dark');
  const cls = d ? 'fa-moon' : 'fa-sun';
  ['themeIcon','themeIconMob'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.className = 'fa-solid ' + cls;
  });
}
syncTheme();

['themeBtn','themeBtnMob'].forEach(id => {
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('nv-theme', html.classList.contains('dark') ? 'dark' : 'light');
    syncTheme();
  });
});

// Nav Scroll
const navbar = document.getElementById('navbar');
if(navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, {passive:true});
}

// Mobile Menu
const hamburger = document.getElementById('hamburger');
const mobMenu = document.getElementById('mobMenu');
if(hamburger && mobMenu) {
  hamburger.addEventListener('click', () => {
    mobMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mob-link').forEach(l => {
    l.addEventListener('click', () => {
      mobMenu.classList.remove('open');
    });
  });
}

// Custom Cursor
const dot = document.getElementById('cursorDot');
if(dot) {
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });
}

// Experience Timeline
const tlLine = document.getElementById('tlLine');
const tlFill = document.getElementById('tlFill');
function updateTl(){
  if(!tlLine || !tlFill) return; // Prevents crash on pages without a timeline!
  const h = tlLine.offsetHeight || 300;
  const lineRect = tlLine.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - lineRect.top) / h));
  const fillH = p * h;
  tlFill.style.height = fillH + 'px';
  
  document.querySelectorAll('.tl-dot-wrap').forEach(function(dotWrap){
    const dotRect = dotWrap.getBoundingClientRect();
    const dotCenter = (dotRect.top + dotRect.height / 2) - lineRect.top;
    dotWrap.classList.toggle('active', fillH >= dotCenter);
  });
}
window.addEventListener('scroll', updateTl, {passive:true});
window.addEventListener('load', updateTl);
setTimeout(updateTl, 200);

// Skills Rendering
const skills = [
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg', n:'AWS'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg', n:'Azure'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-original.svg', n:'Kubernetes'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', n:'Docker'},
  {t:'img', img:'https://cdn.simpleicons.org/helm/0F1689', n:'Helm'},
  {t:'img', img:'https://cdn.simpleicons.org/terraform/7B42BC', n:'Terraform'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg', n:'Jenkins'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/githubactions/githubactions-original.svg', n:'GitHub Actions'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', n:'Git'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg', n:'Linux'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', n:'Python'},
  {t:'img', img:'https://cdn.simpleicons.org/gnubash/4EAA25', n:'Bash'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/powershell/powershell-original.svg', n:'PowerShell'},
  {t:'img', img:'https://cdn.simpleicons.org/digitalocean/0080FF', n:'DigitalOcean'},
  {t:'icon', icon:'fa-brands fa-microsoft', color:'#00A4EF', n:'Windows Server'},
  {t:'img', img:'https://cdn.simpleicons.org/vmware/607078', n:'VMware'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jira/jira-original.svg', n:'Jira'},
  {t:'img', img:'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg', n:'MySQL'},
  {t:'img', img:'https://cdn.simpleicons.org/apachemaven/C71A36', n:'Maven'},
];
const MAX = 12;
let showAllSk = false;

function renderSkills(){
  const g = document.getElementById('skillsGrid');
  if(!g) return; // Prevents crash on the Projects page!
  const list = showAllSk ? skills : skills.slice(0, MAX);
  g.innerHTML = list.map(s => `
    <div class="skill-card">
      <div class="sk-inner">
        ${s.t === 'img'
          ? `<img src="${s.img}" alt="${s.n}" style="width:2.5rem;height:2.5rem;object-fit:contain;">`
          : `<i class="${s.icon}" style="font-size:2.5rem; color:${s.color}"></i>`
        }
        <span class="sk-name">${s.n}</span>
      </div>
      <div class="sk-border"></div>
    </div>`).join('');
}

function toggleSkills(){
  showAllSk = !showAllSk;
  renderSkills();
  const btn = document.getElementById('skillsToggle');
  if(btn) btn.textContent = showAllSk ? 'Show Less' : 'Show All (' + skills.length + ')';
}
renderSkills();

// Project Filtering (Handles both Home page and Projects page logic)
const filterBtns = document.querySelectorAll('.f-btn');
if (filterBtns.length > 0) {
  // Stamp original order to restore on "All"
  document.querySelectorAll('.proj-card').forEach((c, i) => c.dataset.order = i);

  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('on'); });
      btn.classList.add('on');
      
      const f = btn.dataset.f;
      const grid = document.getElementById('projGrid');
      if(!grid) return; // Prevents crash if grid is missing
      
      const cards = Array.from(grid.querySelectorAll('.proj-card'));

      if (f === 'all') {
        cards.sort((a, b) => +a.dataset.order - +b.dataset.order)
             .forEach(c => { c.classList.remove('off'); grid.appendChild(c); });
      } else {
        // Checks both data-topic (Projects page) and data-tags (Home page)
        const matching = cards.filter(c => c.dataset.topic === f || (c.dataset.tags || '').toLowerCase().includes(f));
        const nonMatching = cards.filter(c => c.dataset.topic !== f && !(c.dataset.tags || '').toLowerCase().includes(f));
        
        matching.forEach(c => { c.classList.remove('off'); grid.prepend(c); });
        nonMatching.forEach(c => { c.classList.add('off'); });
      }
    });
  });
}

// Copy Toast
function copyText(text, label){
  navigator.clipboard.writeText(text).then(() => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i class="fa-solid fa-check" style="color:#22c55e"></i> ' + label + ' copied!';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  });
}

// Scroll Reveal
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) e.target.classList.add('visible');
  });
}, {threshold:0.05});
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

// ---------------------------------------------------------
// Visitor Counter - Fetches and displays visitor count from Azure Function
// ---------------------------------------------------------
async function updateVisitorCount() {
    const counterElement = document.getElementById('visitor-count');
    if (!counterElement) return; // Only run if the element exists on the page

    try {
        // Production API URL
        const apiUrl = 'https://noah-resume-api.azurewebsites.net/api/getvisitorcount';
        
        // Call the API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update the counter display
        counterElement.textContent = data.count;
        console.log('Visitor count updated:', data.count);
        
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        // Display error message to user
        counterElement.textContent = 'Error loading count';
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', updateVisitorCount);