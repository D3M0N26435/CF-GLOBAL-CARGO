// js/cotizador.js
const NUMERO_WHATSAPP_CF = "59169191099"; // Número oficial

function switchForm(serviceKey) {
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(serviceKey));
    });
    document.querySelectorAll('.quote-form').forEach(form => form.classList.remove('active-form'));
    const activeForm = document.getElementById(`form-${serviceKey}`);
    if (activeForm) activeForm.classList.add('active-form');
}

window.calcularCbmZofri = function() {
    const largo = parseFloat(document.getElementById('zofri-largo')?.value) || 0;
    const ancho = parseFloat(document.getElementById('zofri-ancho')?.value) || 0;
    const alto = parseFloat(document.getElementById('zofri-alto')?.value) || 0;
    const cajas = parseInt(document.getElementById('zofri-cajas')?.value) || 0;
    const pesoCaja = parseFloat(document.getElementById('zofri-peso-caja')?.value) || 0;

    const cbmTotal = (largo * ancho * alto * cajas) / 1000000;
    const pesoTotal = pesoCaja * cajas;

    document.getElementById('zofri-cbm-val').innerText = `${cbmTotal.toFixed(3)} CBM`;
    document.getElementById('zofri-peso-total').value = pesoTotal > 0 ? `${pesoTotal} kg` : '';
};

window.handleQuoteSubmit = function(event, serviceType) {
    if (event) event.preventDefault();
    let mensaje = "";

    if (serviceType === 'lcl') {
        mensaje = `Hola, CF GLOBAL CARGO. Quiero solicitar una cotización de carga consolidada LCL.\n\nNombre: ${val('lcl-nombre')}\nOrigen: ${val('lcl-origen')}\nMercancía: ${val('lcl-mercancia')}\nCBM: ${val('lcl-cbm')}\nPeso: ${val('lcl-peso')} kg\nDestino: ${val('lcl-destino')}, Bolivia.\nWhatsApp: ${val('lcl-whatsapp')}\n\nQuisiera recibir información sobre costos y condiciones.`;
    } else if (serviceType === 'zofri') {
        mensaje = `Hola, CF GLOBAL CARGO. Quiero solicitar cotización de carga por caja ZOFRI - Iquique 🇨🇱.\n\nNombre: ${val('zofri-nombre')}\nCajas: ${val('zofri-cajas')}\nMercancía: ${val('zofri-mercancia')}\nCBM: ${document.getElementById('zofri-cbm-val')?.innerText}\nPeso Total: ${val('zofri-peso-total')}\nDestino: ${val('zofri-destino')}, Bolivia.\nWhatsApp: ${val('zofri-whatsapp')}`;
    } else {
        mensaje = `Hola, CF GLOBAL CARGO. Deseo solicitar una cotización logística.`;
    }

    // Mostrar modal con resumen "SOLICITUD PREPARADA"
    document.getElementById('summaryPreviewText').innerText = mensaje;
    const waUrl = `https://wa.me/${NUMERO_WHATSAPP_CF}?text=${encodeURIComponent(mensaje)}`;
    document.getElementById('btnSendWhatsappFinal').href = waUrl;
    document.getElementById('whatsappSummaryModal').style.display = 'flex';

    return false;
};

window.closeWhatsappModal = function() {
    document.getElementById('whatsappSummaryModal').style.display = 'none';
};

function val(id) {
    return document.getElementById(id)?.value?.trim() || '';
}