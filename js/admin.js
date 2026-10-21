import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración pública de subida de imágenes en Cloudinary.
const CLOUD_NAME = "dsbzdsrgk";
const UPLOAD_PRESET = "cf-global-cargo";
const PRODUCTS_COLLECTION = "productos";
const categoryLabels = { china: "China", zofri: "Chile · Zofri" };

const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');
const adminTableBody = document.getElementById('adminTableBody');
const addProductForm = document.getElementById('addProductForm');
const saveProductButton = document.getElementById('saveProductButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const productFormTitle = document.getElementById('productFormTitle');
const productFormStatus = document.getElementById('productFormStatus');
const productImageInput = document.getElementById('prod-imagenFile');

let productsList = [];
let editingProductId = null;
let editingImageUrl = "";

onAuthStateChanged(auth, (user) => {
    loginSection.style.display = user ? 'none' : 'flex';
    adminDashboard.style.display = user ? 'block' : 'none';
    if (user) loadAdminProducts();
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.hidden = true;
    loginError.textContent = "";
    try {
        await signInWithEmailAndPassword(
            auth,
            document.getElementById('loginEmail').value.trim(),
            document.getElementById('loginPassword').value
        );
    } catch (error) {
        console.error("Error de acceso:", error);
        loginError.textContent = "No se pudo iniciar sesión. Revisa tu correo y contraseña.";
        loginError.hidden = false;
    }
});

btnLogout.addEventListener('click', () => signOut(auth));
cancelEditButton.addEventListener('click', resetProductForm);

addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = productImageInput.files[0];

    if (!editingProductId && !file) {
        productFormStatus.textContent = "Selecciona una fotografía para el producto.";
        return;
    }

    saveProductButton.disabled = true;
    cancelEditButton.disabled = true;

    try {
        let imageUrl = editingImageUrl;
        if (file) {
            productFormStatus.textContent = "Subiendo fotografía...";
            imageUrl = await uploadProductImage(file);
        }

        const productData = {
            categoria: document.getElementById('prod-categoria').value,
            subcategoria: document.getElementById('prod-subcategoria').value.trim(),
            nombre: document.getElementById('prod-nombre').value.trim(),
            descripcion: document.getElementById('prod-desc').value.trim(),
            precioUnitario: Number(document.getElementById('prod-precioUnitario').value) || 0,
            precioCaja: Number(document.getElementById('prod-precioCaja').value) || 0,
            unidadesCaja: Number.parseInt(document.getElementById('prod-unidadesCaja').value, 10) || 0,
            precioBolivia: document.getElementById('prod-precioBolivia').value.trim(),
            imagenUrl: imageUrl,
            disponibilidad: document.getElementById('prod-disponibilidad').value,
            fechaActualizacion: new Date()
        };

        if (editingProductId) {
            await updateDoc(doc(db, PRODUCTS_COLLECTION, editingProductId), productData);
            productFormStatus.textContent = "Cambios guardados.";
        } else {
            await addDoc(collection(db, PRODUCTS_COLLECTION), { ...productData, fechaCreacion: new Date() });
            productFormStatus.textContent = "Producto publicado.";
        }

        resetProductForm();
        await loadAdminProducts();
    } catch (error) {
        console.error("Error guardando producto:", error);
        productFormStatus.textContent = "No se pudo guardar. Revisa la conexión e inténtalo nuevamente.";
    } finally {
        saveProductButton.disabled = false;
        cancelEditButton.disabled = false;
    }
});

async function uploadProductImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (!response.ok || !result.secure_url) {
        throw new Error(result.error?.message || "Cloudinary no pudo subir la imagen.");
    }
    return result.secure_url;
}

async function loadAdminProducts() {
    adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px;">Cargando productos...</td></tr>';

    try {
        const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy("fechaCreacion", "desc"));
        const snapshot = await getDocs(productsQuery);
        productsList = snapshot.docs.map((productDoc) => ({ id: productDoc.id, ...productDoc.data() }));
        renderAdminTable();
    } catch (error) {
        console.error("Error cargando productos:", error);
        adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center admin-error-row" style="padding:20px;">No se pudieron cargar los productos.</td></tr>';
    }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function safeImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}

function renderAdminTable() {
    if (!productsList.length) {
        adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px;">No hay productos registrados.</td></tr>';
        return;
    }

    adminTableBody.innerHTML = productsList.map((product) => {
        const imageUrl = safeImageUrl(product.imagenUrl);
        const image = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" style="width:45px;height:45px;object-fit:cover;border-radius:6px;" alt="">`
            : '<span aria-label="Sin fotografía">—</span>';
        const category = categoryLabels[product.categoria] || product.categoria || "Sin origen";
        return `
            <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:10px;">${image}</td>
                <td style="padding:10px;"><strong>${escapeHtml(product.nombre)}</strong><br><small>${escapeHtml(product.subcategoria || "")}</small></td>
                <td style="padding:10px;"><span style="font-size:.75rem;font-weight:800;color:var(--accent-orange);">${escapeHtml(category)}</span></td>
                <td style="padding:10px;">US$ ${escapeHtml(product.precioUnitario)}</td>
                <td style="padding:10px;"><strong style="color:var(--primary-blue);">${escapeHtml(product.precioBolivia)}</strong></td>
                <td style="padding:10px;"><div class="admin-action-group">
                    <button type="button" class="btn-admin-action" data-action="edit" data-id="${escapeHtml(product.id)}">Editar</button>
                    <button type="button" class="btn-admin-action" data-action="delete" data-id="${escapeHtml(product.id)}">Eliminar</button>
                </div></td>
            </tr>`;
    }).join('');
}

adminTableBody.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('button[data-action][data-id]');
    if (!actionButton) return;
    const product = productsList.find((item) => item.id === actionButton.dataset.id);
    if (!product) return;

    if (actionButton.dataset.action === "edit") {
        startEditingProduct(product);
    } else if (actionButton.dataset.action === "delete") {
        await deleteProduct(product);
    }
});

function startEditingProduct(product) {
    editingProductId = product.id;
    editingImageUrl = product.imagenUrl || "";
    document.getElementById('prod-categoria').value = product.categoria || "china";
    document.getElementById('prod-subcategoria').value = product.subcategoria || "";
    document.getElementById('prod-nombre').value = product.nombre || "";
    document.getElementById('prod-desc').value = product.descripcion || "";
    document.getElementById('prod-precioUnitario').value = product.precioUnitario ?? "";
    document.getElementById('prod-precioCaja').value = product.precioCaja ?? "";
    document.getElementById('prod-unidadesCaja').value = product.unidadesCaja ?? "";
    document.getElementById('prod-precioBolivia').value = product.precioBolivia || "";
    document.getElementById('prod-disponibilidad').value = product.disponibilidad || "disponible";
    productImageInput.value = "";
    productImageInput.required = false;
    productFormTitle.textContent = `Editar producto: ${product.nombre || "Producto"}`;
    saveProductButton.textContent = "GUARDAR CAMBIOS";
    cancelEditButton.hidden = false;
    productFormStatus.textContent = editingImageUrl ? "La fotografía actual se conserva si no seleccionas otra." : "Selecciona una fotografía para este producto.";
    addProductForm.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById('prod-nombre').focus({ preventScroll: true });
}

function resetProductForm() {
    addProductForm.reset();
    editingProductId = null;
    editingImageUrl = "";
    productImageInput.required = true;
    productFormTitle.textContent = "📦 Registrar Nuevo Producto en Catálogo";
    saveProductButton.textContent = "GUARDAR Y PUBLICAR PRODUCTO";
    cancelEditButton.hidden = true;
    productFormStatus.textContent = "";
}

async function deleteProduct(product) {
    if (!confirm(`¿Eliminar “${product.nombre || "este producto"}” permanentemente?`)) return;
    try {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, product.id));
        productsList = productsList.filter((item) => item.id !== product.id);
        renderAdminTable();
        productFormStatus.textContent = "Producto eliminado.";
    } catch (error) {
        console.error("Error eliminando producto:", error);
        productFormStatus.textContent = "No se pudo eliminar el producto.";
    }
}
