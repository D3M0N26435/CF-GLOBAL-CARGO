import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { DEFAULT_TARIFF, SERVICES } from "./services-config.js";
import { evaluateFormula } from "./formula.js";

const optionsRoot = document.querySelector("#serviceOptions");
const panel = document.querySelector("#serviceFormPanel");
const formRoot = document.querySelector("#serviceFormContent");
const APP_CONFIG = window.APP_CONFIG || {};
let tariffs = {};

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function makeOptionCard(service) {
  const card = document.createElement("article");
  card.className = "service-card";
  const icon = document.createElement("span");
  icon.className = "service-card-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = service.icon;
  const origin = document.createElement("small");
  origin.className = "service-card-origin";
  origin.textContent = service.origin;
  const title = document.createElement("h3");
  title.textContent = service.title;
  const description = document.createElement("p");
  description.textContent = service.description;
  const button = document.createElement("button");
  button.className = "button button-orange service-card-button";
  button.type = "button";
  button.textContent = "COTIZAR SERVICIO →";
  button.addEventListener("click", () => showServiceForm(service.id));
  card.append(icon, origin, title, description, button);
  card.addEventListener("click", (event) => {
    if (!event.target.closest("button")) showServiceForm(service.id);
  });
  return card;
}

function fieldMarkup(field, serviceId) {
  const id = `field-${serviceId}-${field.name}`;
  const required = field.required ? " required" : "";
  const label = `${escapeText(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ""}`;
  if (field.type === "select") {
    const choices = (field.options || []).map((option) => `<option value="${escapeText(option)}">${escapeText(option)}</option>`).join("");
    return `<div class="service-field"><label for="${id}">${label}</label><select id="${id}" name="${escapeText(field.name)}"${required}><option value="">Selecciona una opción</option>${choices}</select></div>`;
  }
  if (field.type === "textarea") {
    return `<div class="service-field service-field-wide"><label for="${id}">${label}</label><textarea id="${id}" name="${escapeText(field.name)}" rows="3" maxlength="600" placeholder="${escapeText(field.placeholder || "")}"${required}></textarea></div>`;
  }
  const type = field.type || "text";
  const numeric = type === "number" ? ` min="${field.min ?? 0}" step="${field.step ?? "any"}" inputmode="decimal"` : "";
  const maxLength = ["text", "url", "email", "tel"].includes(type) ? ` maxlength="${type === "email" ? 254 : 180}"` : "";
  return `<div class="service-field"><label for="${id}">${label}</label><input id="${id}" name="${escapeText(field.name)}" type="${escapeText(type)}" placeholder="${escapeText(field.placeholder || "")}"${numeric}${maxLength}${required}></div>`;
}

function renderForm(service) {
  const computedLabels = service.id === "caja_zofri"
    ? '<div class="service-computed"><span>Peso total estimado</span><strong data-computed-weight>Se calcula automáticamente</strong><span>Volumen aproximado</span><strong data-computed-cbm>Se calcula automáticamente</strong></div>'
    : '<div class="service-computed" data-computed-summary hidden><span>Peso total estimado</span><strong data-computed-weight></strong><span>Volumen aproximado</span><strong data-computed-cbm></strong></div>';
  const fields = service.fields.map((field) => fieldMarkup(field, service.id)).join("");
  formRoot.innerHTML = `
    <div class="service-form-heading">
      <button class="service-back" type="button" data-back-services>← Cambiar servicio</button>
      <p class="service-card-origin">${escapeText(service.origin)}</p>
      <h3>${escapeText(service.shortTitle)}</h3>
      <p>${escapeText(service.description)}</p>
    </div>
    <form class="service-form" id="quoteForm-${escapeText(service.id)}" novalidate>
      <div class="service-form-grid">
        <div class="service-field"><label for="field-${service.id}-nombre">Nombre completo <span aria-hidden="true">*</span></label><input id="field-${service.id}-nombre" name="nombre" required maxlength="180" autocomplete="name" placeholder="Tu nombre completo"></div>
        <div class="service-field"><label for="field-${service.id}-whatsapp">WhatsApp <span aria-hidden="true">*</span></label><input id="field-${service.id}-whatsapp" name="whatsapp" type="tel" required maxlength="20" autocomplete="tel" inputmode="tel" placeholder="+591 70000000" pattern="[+0-9() -]{7,20}"></div>
        <div class="service-field service-field-wide"><label for="field-${service.id}-email">Correo electrónico (opcional)</label><input id="field-${service.id}-email" name="email" type="email" autocomplete="email" placeholder="tu@correo.com"></div>
        ${fields}
      </div>
      ${computedLabels}
      <div class="service-estimate" data-estimate role="status" aria-live="polite">Cotización por confirmar con un asesor.</div>
      <button class="button button-orange service-submit" type="submit">PREPARAR SOLICITUD POR WHATSAPP <span aria-hidden="true">➜</span></button>
      <div class="service-submit-result" data-submit-result role="status" aria-live="polite" hidden></div>
    </form>`;

  panel.hidden = false;
  optionsRoot.hidden = true;
  formRoot.querySelector("[data-back-services]").addEventListener("click", showServiceOptions);
  const form = formRoot.querySelector("form");
  form.addEventListener("input", () => updateEstimate(service, form));
  form.addEventListener("change", () => updateEstimate(service, form));
  form.addEventListener("submit", (event) => submitQuote(event, service, form));
  updateEstimate(service, form);
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
  form.querySelector("input[name=nombre]").focus({ preventScroll: true });
}

function showServiceForm(serviceId) {
  const service = SERVICES.find((item) => item.id === serviceId);
  if (service) renderForm(service);
}

function showServiceOptions() {
  panel.hidden = true;
  optionsRoot.hidden = false;
  optionsRoot.scrollIntoView({ behavior: "smooth", block: "start" });
}

function numeric(form, fieldName) {
  const input = form.elements.namedItem(fieldName);
  const value = Number(input?.value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function metricsFor(form) {
  const boxCount = numeric(form, "cantidadCajas") || numeric(form, "cantidadBultos") || numeric(form, "cantidadPallets");
  const containerCount = numeric(form, "cantidadContenedores");
  let weightKg = numeric(form, "pesoTotalKg");
  if (!weightKg && numeric(form, "pesoCajaKg") && numeric(form, "cantidadCajas")) {
    weightKg = numeric(form, "pesoCajaKg") * numeric(form, "cantidadCajas");
  }
  let cbm = numeric(form, "cbm");
  const length = numeric(form, "largoCm");
  const width = numeric(form, "anchoCm");
  const height = numeric(form, "altoCm");
  if (!cbm && length && width && height) {
    cbm = length * width * height / 1_000_000 * (boxCount || 1);
  }
  return { kg: weightKg, cbm, cajas: boxCount, contenedores: containerCount };
}

function tariffVariables(tariff, metrics) {
  return {
    base: Number(tariff.baseBOB) || 0,
    kg: metrics.kg,
    cbm: metrics.cbm,
    cajas: metrics.cajas,
    contenedores: metrics.contenedores,
    tarifaKg: Number(tariff.tarifaKg) || 0,
    tarifaCbm: Number(tariff.tarifaCbm) || 0,
    tarifaCaja: Number(tariff.tarifaCaja) || 0,
    tarifaContenedor: Number(tariff.tarifaContenedor) || 0,
    margen: Number(tariff.margen) || 0
  };
}

function formatBolivianos(value) {
  return `Bs ${Number(value).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateEstimate(service, form) {
  const metrics = metricsFor(form);
  const weightOutput = form.querySelector("[data-computed-weight]");
  const cbmOutput = form.querySelector("[data-computed-cbm]");
  const computedSummary = form.querySelector("[data-computed-summary]");
  if (weightOutput) weightOutput.textContent = metrics.kg ? `${metrics.kg.toLocaleString("es-BO", { maximumFractionDigits: 2 })} kg` : "Se calcula automáticamente";
  if (cbmOutput) cbmOutput.textContent = metrics.cbm ? `${metrics.cbm.toLocaleString("es-BO", { maximumFractionDigits: 3 })} m³ (CBM)` : "Se calcula automáticamente";
  if (computedSummary) computedSummary.hidden = !metrics.kg && !metrics.cbm;

  const estimate = form.querySelector("[data-estimate]");
  const tariff = { ...DEFAULT_TARIFF, ...(tariffs[service.id] || {}) };
  if (!tariff.enabled) {
    estimate.textContent = "Cotización por confirmar con un asesor.";
    estimate.dataset.amount = "";
    return;
  }
  try {
    const amount = evaluateFormula(tariff.formula, tariffVariables(tariff, metrics));
    if (amount < 0) throw new Error("La fórmula produjo un monto negativo.");
    estimate.textContent = `Estimación referencial: ${formatBolivianos(amount)}. El monto final se confirma al revisar los datos de la carga.`;
    estimate.dataset.amount = String(amount);
  } catch (error) {
    estimate.textContent = "Tarifa pendiente de revisión por el administrador.";
    estimate.dataset.amount = "";
  }
}

function currentFormValues(service, form) {
  const fields = new FormData(form);
  const values = [];
  for (const [name, value] of fields.entries()) {
    const field = service.fields.find((item) => item.name === name);
    const label = name === "nombre" ? "Nombre completo"
      : name === "whatsapp" ? "WhatsApp"
        : name === "email" ? "Correo electrónico"
          : field?.label || name;
    const stringValue = String(value).trim();
    if (stringValue) values.push(`${label}: ${stringValue}`);
  }
  return values;
}

function recipientValues() {
  return [APP_CONFIG.whatsappRecipient1, APP_CONFIG.whatsappRecipient2]
    .map((phone) => String(phone || "").replace(/\D/g, ""))
    .filter(Boolean);
}

function whatsappLink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function showManualWhatsAppLinks(result, message, noteText, configuredRecipients = recipientValues()) {
  result.replaceChildren();
  result.classList.remove("is-error");
  const recipients = configuredRecipients;
  const note = document.createElement("p");
  note.textContent = noteText || (recipients.length === 2
    ? "Solicitud preparada para los dos contactos. Abre cada chat y confirma el envío en WhatsApp."
    : recipients.length === 1
      ? "Solo hay un número configurado. Abre el chat y confirma el envío en WhatsApp."
      : "No hay números configurados para enviar la solicitud.");
  result.append(note);
  recipients.forEach((phone, index) => {
    const link = document.createElement("a");
    link.className = "button button-orange service-whatsapp-link";
    link.href = whatsappLink(phone, message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `ABRIR WHATSAPP ${index + 1} →`;
    result.append(link);
  });
  if (!recipients.length) {
    const warning = document.createElement("small");
    warning.textContent = "No hay números configurados. Completa los destinatarios en .env y vuelve a generar la configuración pública.";
    result.append(warning);
    result.classList.add("is-error");
  } else {
    const limitation = document.createElement("small");
    limitation.textContent = "El mensaje ya está rellenado; confirma Enviar en cada chat de WhatsApp.";
    result.append(limitation);
    result.classList.add("is-success");
  }
}

async function submitQuote(event, service, form) {
  event.preventDefault();
  const result = form.querySelector("[data-submit-result]");
  result.hidden = false;
  result.replaceChildren();
  if (!form.reportValidity()) return;
  const metrics = metricsFor(form);
  const estimate = form.querySelector("[data-estimate]");
  const amount = Number(estimate.dataset.amount);
  const messageLines = [
    `SOLICITUD DE COTIZACIÓN · ${service.shortTitle}`,
    `Ruta / servicio: ${service.origin}`,
    ...currentFormValues(service, form)
  ];
  if (metrics.kg) messageLines.push(`Peso total calculado: ${metrics.kg.toLocaleString("es-BO")} kg`);
  if (metrics.cbm) messageLines.push(`Volumen calculado: ${metrics.cbm.toLocaleString("es-BO", { maximumFractionDigits: 3 })} m³ (CBM)`);
  if (Number.isFinite(amount) && amount >= 0 && estimate.dataset.amount) {
    messageLines.push(`Estimación referencial: ${formatBolivianos(amount)}`);
    messageLines.push("Monto sujeto a revisión y confirmación de CF Global Cargo.");
  } else {
    messageLines.push("Cotización: pendiente de revisión por el equipo.");
  }
  const message = messageLines.join("\n");
  showManualWhatsAppLinks(result, message);
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

optionsRoot.append(...SERVICES.map(makeOptionCard));

try {
  const configSnapshot = await getDoc(doc(db, "configuracion", "cotizaciones"));
  if (configSnapshot.exists()) tariffs = configSnapshot.data().tarifas || {};
} catch (error) {
  console.error("No se pudieron cargar las tarifas de cotización:", error);
}
