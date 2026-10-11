// js/admin.js
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ================= CONFIGURACIÓN DE CLOUDINARY =================
const CLOUD_NAME = "dsbzdsrgk";       // <--- Cambia esto por tu Cloud name real de Cloudinary
const UPLOAD_PRESET = "cf-global-cargo"; // <--- Cambia esto por tu Preset "Unsigned" de Cloudinary
// ==============================================================

const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const adminTableBody = document.getElementById('adminTableBody');
const addProductForm = document.getElementById('addProductForm');

let productsList = [];

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadAdminProducts();
    } else {
        loginSection.style.display = 'flex';
        adminDashboard.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        alert('Credenciales incorrectas o error de acceso.');
    }
});

btnLogout.addEventListener('click', () => signOut(auth));

// REGISTRAR PRODUCTO NUEVO CON IMAGEN DESDE DISPOSITIVO
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageInput = document.getElementById('prod-imagenFile');
    const file = imageInput.files[0];

    if (!file) {
        alert('Por favor selecciona una imagen del producto.');
        return;
    }

    const submitBtn = addProductForm.querySelector('button[type="submit"]');

    try {
        // Deshabilitar botón y mostrar estado de carga mientras sube la foto
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subiendo imagen a la nube... ⏳';

        // 1. Subir la imagen a Cloudinary directamente desde el navegador
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const cloudinaryData = await cloudinaryRes.json();

        if (!cloudinaryData.secure_url) {
            throw new Error('No se pudo obtener la URL de la imagen en Cloudinary.');
        }

        const imagenUrlFinal = cloudinaryData.secure_url;

        submitBtn.textContent = 'Guardando producto en base de datos... 📦';

        // 2. Crear objeto del producto con la URL segura de Cloudinary
        const nuevoProducto = {
            categoria: document.getElementById('prod-categoria').value,
            nombre: document.getElementById('prod-nombre').value.trim(),
            descripcion: document.getElementById('prod-desc').value.trim(),
            precioUnitario: parseFloat(document.getElementById('prod-precioUnitario').value) || 0,
            precioCaja: parseFloat(document.getElementById('prod-precioCaja').value) || 0,
            unidadesCaja: parseInt(document.getElementById('prod-unidadesCaja').value) || 0,
            precioBolivia: document.getElementById('prod-precioBolivia').value.trim(),
            imagenUrl: imagenUrlFinal, // <--- URL generada por Cloudinary
            disponibilidad: document.getElementById('prod-disponibilidad').value,
            fechaCreacion: new Date()
        };

        // 3. Guardar en Firestore
        await addDoc(collection(db, "productos"), nuevoProducto);
        
        alert('¡Producto y fotografía subidos exitosamente!');
        addProductForm.reset();
        loadAdminProducts();

    } catch (error) {
        console.error("Error al registrar producto:", error);
        alert('Hubo un error al subir la imagen o registrar el producto.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'GUARDAR Y PUBLICAR PRODUCTO';
    }
});

async function loadAdminProducts() {
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px;">Cargando productos...</td></tr>';
    
    try {
        const q = query(collection(db, "productos"), orderBy("fechaCreacion", "desc"));
        const snapshot = await getDocs(q);
        productsList = [];
        snapshot.forEach(docSnap => {
            productsList.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderAdminTable();
    } catch (error) {
        console.error("Error cargando admin:", error);
    }
}

function renderAdminTable() {
    if (productsList.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px;">No hay productos registrados.</td></tr>';
        return;
    }

    adminTableBody.innerHTML = productsList.map(p => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 10px;"><img src="${p.imagenUrl || 'https://via.placeholder.com/50'}" style="width:45px; height:45px; object-fit:cover; border-radius:6px;" alt=""></td>
            <td style="padding: 10px;"><strong>${p.nombre}</strong></td>
            <td style="padding: 10px;"><span style="font-size:0.75rem; font-weight:800; color:var(--accent-orange);">${p.categoria.toUpperCase()}</span></td>
            <td style="padding: 10px;">$${p.precioUnitario} USD</td>
            <td style="padding: 10px;"><strong style="color:var(--primary-blue);">${p.precioBolivia}</strong></td>
            <td style="padding: 10px;">
                <button onclick="deleteProd('${p.id}')" style="background:#FEE2E2; color:#B91C1C; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:700; font-size:0.75rem;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

window.deleteProd = async (id) => {
    if (confirm('¿Desea eliminar este producto permanentemente?')) {
        try {
            await deleteDoc(doc(db, "productos", id));
            loadAdminProducts();
        } catch (error) {
            alert('Error al eliminar el producto.');
        }
    }
};