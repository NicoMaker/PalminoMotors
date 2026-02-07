document.addEventListener('DOMContentLoaded', () => {
    loadData();
    document.getElementById('year').textContent = new Date().getFullYear();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        renderLinks(data.appLinks);
        renderBrands(data.brands);
        populateFooter(data.company);
    } catch (error) {
        console.error("Errore caricamento dati:", error);
    }
}

function renderLinks(links) {
    const container = document.getElementById('linksContainer');
    container.innerHTML = links.map(link => `
        <a href="${link.url}" target="_blank" class="link-card">
            <span class="link-icon">${link.icon}</span>
            <div class="link-info">
                <h3>${link.title}</h3>
                <p>${link.description}</p>
            </div>
        </a>
    `).join('');
}

function renderBrands(brands) {
    const container = document.getElementById('brandContainer');
    container.innerHTML = brands.map(brand => `
        <a href="${brand.url}" target="_blank" class="brand-item">${brand.name}</a>
    `).join('');
}

function populateFooter(company) {
    document.getElementById('companyName').textContent = company.fullName;
    document.getElementById('fullAddress').textContent = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    document.getElementById('footerPhone').textContent = `Tel: ${company.phone}`;
    document.getElementById('footerEmail').textContent = `Email: ${company.email}`;
    document.getElementById('footerPiva').textContent = `P.IVA: ${company.piva}`;
}