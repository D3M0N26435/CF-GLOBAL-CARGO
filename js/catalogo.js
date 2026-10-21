import { db } from './firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const origin = document.body.dataset.catalogOrigin;
const productGrid = document.getElementById("productGrid");
const catalogStatus = document.getElementById("catalogStatus");
const productSearch = document.getElementById("productSearch");
const productCategory = document.getElementById("productCategory");
const productAvailability = document.getElementById("productAvailability");
const productSort = document.getElementById("productSort");
const availabilityLabels = {
  disponible: "Disponible",
  proxima_llegada: "Próxima llegada",
  agotado: "Agotado"
};

let products = [];

function normalizeText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function formatPrice(value, currency = "BOB") {
  const price = Number(value);
  if (currency !== "BOB") return "Precio pendiente de actualizar en Bs.";
  return Number.isFinite(price) && price > 0
    ? `Bs ${price.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Consultar";
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProduct(product) {
  const card = makeElement("article", "product-card");
  const media = makeElement("div", "product-card-media");
  const imageUrl = safeImageUrl(product.imagenUrl);
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = product.nombre ? `Imagen de ${product.nombre}` : "Producto de importación";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      media.replaceChildren(makeElement("span", "product-image-placeholder", "📦"));
    }, { once: true });
    media.append(image);
  } else {
    media.append(makeElement("span", "product-image-placeholder", "📦"));
  }

  const content = makeElement("div", "product-card-content");
  if (product.subcategoria) content.append(makeElement("p", "product-card-category", product.subcategoria));
  content.append(makeElement("h2", "", product.nombre || "Producto"));
  if (product.descripcion) content.append(makeElement("p", "product-card-description", product.descripcion));

  const availability = availabilityLabels[product.disponibilidad] || "Consultar disponibilidad";
  content.append(makeElement("span", `product-availability ${product.disponibilidad || ""}`, availability));

  const prices = makeElement("div", "product-prices");
  const unitPrice = makeElement("div");
  unitPrice.append("Precio unitario: ", makeElement("strong", "", formatPrice(product.precioUnitario, product.moneda)));
  prices.append(unitPrice);
  if (Number(product.precioCaja) > 0) {
    const boxPrice = makeElement("div");
    boxPrice.append("Por caja: ", makeElement("strong", "", formatPrice(product.precioCaja, product.moneda)));
    if (Number(product.unidadesCaja) > 0) boxPrice.append(` · ${product.unidadesCaja} unidades`);
    prices.append(boxPrice);
  }
  if (product.moneda === "BOB" && Number(product.precioBolivia) > 0) {
    const boliviaPrice = makeElement("div");
    boliviaPrice.append("En Bolivia: ", makeElement("strong", "", formatPrice(product.precioBolivia, product.moneda)));
    prices.append(boliviaPrice);
  } else if (product.moneda !== "BOB") {
    prices.append(makeElement("div", "legacy-price-notice", "Precio pendiente de actualizar en Bs."));
  }
  content.append(prices);

  const quoteLink = makeElement("a", "button button-orange product-card-quote", "CONSULTAR PRODUCTO →");
  quoteLink.href = `index.html#servicios`;
  quoteLink.setAttribute("aria-label", `Consultar por ${product.nombre || "este producto"}`);
  content.append(quoteLink);
  card.append(media, content);
  return card;
}

function renderCatalog() {
  const searchTerm = normalizeText(productSearch.value.trim());
  const selectedCategory = normalizeText(productCategory.value);
  const selectedAvailability = productAvailability.value;
  let filteredProducts = products.filter((product) => {
    const searchableText = normalizeText(`${product.nombre || ""} ${product.descripcion || ""} ${product.subcategoria || ""}`);
    return (!searchTerm || searchableText.includes(searchTerm))
      && (!selectedCategory || normalizeText(product.subcategoria) === selectedCategory)
      && (!selectedAvailability || product.disponibilidad === selectedAvailability);
  });

  if (productSort.value === "name") {
    filteredProducts.sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"));
  } else if (productSort.value === "price") {
    filteredProducts.sort((a, b) => {
      const priceA = a.moneda === "BOB" ? Number(a.precioUnitario) || 0 : Number.POSITIVE_INFINITY;
      const priceB = b.moneda === "BOB" ? Number(b.precioUnitario) || 0 : Number.POSITIVE_INFINITY;
      return priceA === priceB ? 0 : priceA - priceB;
    });
  } else {
    filteredProducts.sort((a, b) => {
      const dateA = a.fechaCreacion?.toDate?.()?.getTime?.() || 0;
      const dateB = b.fechaCreacion?.toDate?.()?.getTime?.() || 0;
      return dateB - dateA;
    });
  }

  productGrid.replaceChildren();
  if (!filteredProducts.length) {
    const empty = makeElement("div", "catalog-empty-state");
    const title = products.length ? "No encontramos productos con esos filtros." : "Este catálogo todavía no tiene productos publicados.";
    empty.append(makeElement("strong", "", title));
    empty.append(makeElement("span", "", products.length ? "Prueba con otra búsqueda o categoría." : "Estamos preparando nuevas opciones para ti."));
    productGrid.append(empty);
  } else {
    productGrid.append(...filteredProducts.map(renderProduct));
  }
  catalogStatus.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? "producto" : "productos"}`;
}

function populateCategories() {
  const categories = [...new Set(products.map((product) => String(product.subcategoria || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
  productCategory.replaceChildren(new Option("Todas las categorías", ""));
  categories.forEach((category) => productCategory.add(new Option(category, category)));
}

async function loadProducts() {
  try {
    const productsQuery = query(collection(db, "productos"), where("categoria", "==", origin));
    const snapshot = await getDocs(productsQuery);
    products = snapshot.docs.map((productDoc) => ({ id: productDoc.id, ...productDoc.data() }));
    populateCategories();
    renderCatalog();
  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
    catalogStatus.textContent = "No pudimos cargar los productos. Intenta nuevamente más tarde.";
    productGrid.replaceChildren();
  }
}

[productSearch, productCategory, productAvailability, productSort].forEach((control) => {
  control.addEventListener(control === productSearch ? "input" : "change", renderCatalog);
});

loadProducts();
