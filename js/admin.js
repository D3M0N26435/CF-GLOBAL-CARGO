// js/admin.js
import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const adminTableBody = document.getElementById('adminTableBody');

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
        alert('Credenciales incorrectas.');
    }
});

btnLogout.addEventListener('click', () => signOut(auth));

async function loadAdminProducts() {
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando...</td></tr>';
    
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
        adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos registrados.</td></tr>';
        return;
    }

    adminTableBody.innerHTML = productsList.map(p => `
        <tr>
            <td><img src="${p.imagenUrl || 'https://via.placeholder.com/50'}" class="img-thumb" alt=""></td>
            <td><strong>${p.nombre}</strong></td>
            <td>${p.categoria.toUpperCase()}</td>
            <td>$${p.precioUnitario} USD</td>
            <td><strong style="color:var(--accent-orange);">${p.precioBolivia}</strong></td>
            <td>
                <button onclick="deleteProd('${p.id}')" style="background:#FEE2E2; color:#B91C1C; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

window.deleteProd = async (id) => {
    if (confirm('¿Desea eliminar este producto?')) {
        await deleteDoc(doc(db, "productos", id));
        loadAdminProducts();
    }
};