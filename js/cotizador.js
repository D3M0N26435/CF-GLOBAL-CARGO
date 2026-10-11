// js/cotizador.js
const NUMERO_WHATSAPP_CF = "59170000000"; 

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

    switch(serviceType) {
        case 'lcl':
            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar Carga Consolidada LCL 🇨🇳.\n\n• Nombre: ${val('lcl-nombre')}\n• Origen: ${val('lcl-origen')}\n• Mercancía: ${val('lcl-mercancia')}\n• CBM: ${val('lcl-cbm')}\n• Peso: ${val('lcl-peso')} kg\n• Destino: ${val('lcl-destino')}, Bolivia\n• WhatsApp: ${val('lcl-whatsapp')}`;
            break;
        case 'zofri':
            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar Carga por Caja ZOFRI 🇨🇱.\n\n• Nombre: ${val('zofri-nombre')}\n• Cajas: ${val('zofri-cajas')}\n• Mercancía: ${val('zofri-mercancia')}\n• CBM: ${document.getElementById('zofri-cbm-val')?.innerText}\n• Peso Total: ${val('zofri-peso-total')}\n• Destino: ${val('zofri-destino')}, Bolivia\n• WhatsApp: ${val('zofri-whatsapp')}`;
            break;
        case 'fcl':
            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar Contenedor Completo FCL 🚢.\n\n• Nombre: ${val('fcl-nombre')}\n• Origen: ${val('fcl-pais')} (${val('fcl-puerto-select')})\n• Contenedor: ${val('fcl-tipo-contenedor')} (${val('fcl-cantidad')} unid.)\n• Tránsito: ${val('fcl-transito')}\n• Mercancía: ${val('fcl-mercancia')}\n• Peso: ${val('fcl-peso')} kg\n• Destino: ${val('fcl-destino')}, Bolivia\n• WhatsApp: ${val('fcl-whatsapp')}`;
            break;
        case 'maritimo':
            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar Transporte Marítimo 🌊.\n\n• Nombre: ${val('mar-nombre')}\n• Origen: ${val('mar-pais')} (${val('mar-puerto')})\n• Naviera: ${val('mar-naviera')}\n• Equipo: ${val('mar-equipo')}\n• Mercancía: ${val('mar-mercancia')}\n• Destino: ${val('mar-destino')}, Bolivia\n• WhatsApp: ${val('mar-whatsapp')}`;
            break;
        case 'aereo':
            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar Flete Aéreo ✈️.\n\n• Nombre: ${val('aereo-nombre')}\n• Origen: ${val('aereo-origen')}\n• Mercancía: ${val('aereo-mercancia')}\n• Peso: ${val('aereo-peso')} kg\n• Volumen: ${val('aereo-volumen')}\n• Destino: ${val('aereo-destino')}, Bolivia\n• WhatsApp: ${val('aereo-whatsapp')}`;
            break;
        case 'terrestre':
            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar Flete Terrestre 🚛.\n\n• Nombre: ${val('terr-nombre')}\n• Carga desde: ${val('terr-puerto')}\n• Despacho: ${val('terr-despacho')}\n• Mercancía: ${val('terr-mercancia')}\n• Peso: ${val('terr-peso')} kg\n• Aduana Destino: ${val('terr-destino')}\n• WhatsApp: ${val('terr-whatsapp')}`;
            break;
        case 'documental':
            mensaje = `Hola, CF GLOBAL CARGO. Solicito Gestión Documental 📑.\n\n• Nombre: ${val('doc-nombre')}\n• Origen: ${val('doc-pais')}\n• Servicio: ${val('doc-servicio')}\n• Detalle: ${val('doc-mensaje')}\n• WhatsApp: ${val('doc-whatsapp')}`;
            break;
        case 'asesoria':
            mensaje = `Hola, CF GLOBAL CARGO. Solicito Asesoría Personalizada 🤝.\n\n• Nombre: ${val('ase-nombre')}\n• Requerimiento: ${val('ase-opcion')}\n• Producto: ${val('ase-producto') || 'N/A'}\n• Consulta: ${val('ase-consulta')}\n• WhatsApp: ${val('ase-whatsapp')}`;
            break;
    }

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