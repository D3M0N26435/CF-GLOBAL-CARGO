// js/catalog.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPublicCatalog();
});

async function loadPublicCatalog() {
    const grid = document.getElementById('publicCatalogGrid');
    if (!grid) return;

    grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-light);">Cargando catálogo de productos...</p>';

    try {
        const q = query(collection(db, "productos"), orderBy("fechaCreacion", "desc"));
        const snapshot = await getDocs(q);
        allProducts = [];
        snapshot.forEach(docSnap => {
            allProducts.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderCatalog('china'); // Por defecto muestra China
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--danger);">Error al cargar los productos. Verifique su conexión con Firebase.</p>';
    }
}

window.filterCatalog = function(categoria) {
    document.querySelectorAll('.catalog-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(categoria));
    });
    renderCatalog(categoria);
};

function renderCatalog(categoria) {
    const grid = document.getElementById('publicCatalogGrid');
    if (!grid) return;

    const filtered = allProducts.filter(p => p.categoria === categoria);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--white); border-radius: 12px; border: 1px solid var(--border-color);">
                <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: var(--text-light); margin-bottom: 10px;"></i>
                <p style="color: var(--text-light); font-weight: 600;">No hay productos disponibles en esta categoría actualmente.</p>
                <small style="color: var(--text-light);">Pronto agregaremos más novedades.</small>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${p.imagenUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'}" alt="${p.nombre}" class="product-img">
            <div class="product-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-orange); text-transform: uppercase;">
                        ${p.categoria === 'china' ? '🇨🇳 Origen: China' : '🇨🇱 ZOFRI – Iquique'}
                    </span>
                    <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: ${p.disponibilidad === 'disponible' ? '#D1FAE5' : '#FEE2E2'}; color: ${p.disponibilidad === 'disponible' ? '#065F46' : '#991B1B'};">
                        ${p.disponibilidad.replace('_', ' ')}
                    </span>
                </div>
                <h3 class="product-title">${p.nombre}</h3>
                <p class="product-desc">${p.descripcion}</p>
                
                <div class="product-prices">
                    <div>• Precio Unitario: <strong>$${p.precioUnitario} USD</strong></div>
                    <div>• Precio por Caja: <strong>$${p.precioCaja} USD</strong> (${p.unidadesCaja} u./caja)</div>
                </div>

                <div class="price-bolivia-tag">
                    PRECIO PUESTO EN BOLIVIA 🇧🇴<br>
                    <span style="font-size: 1.1rem; font-weight: 800;">${p.precioBolivia}</span>
                </div>

                <a href="#cotizador" class="btn-consultar-prod" onclick="consultarProducto('${encodeURIComponent(p.nombre)}')">
                    <i class="fa-brands fa-whatsapp"></i> CONSULTAR PRODUCTO
                </a>
            </div>
        </div>
    `).join('');
}

window.consultarProducto = function(nombreProd) {
    const nombreDecoded = decodeURIComponent(nombreProd);
    const selectorAsesoria = document.querySelector('.selector-btn[onclick*="asesoria"]');
    if (selectorAsesoria) selectorAsesoria.click();
    
    const inputProd = document.getElementById('ase-producto');
    if (inputProd) inputProd.value = nombreDecoded;
};