// js/cotizador.js

// NÚMERO OFICIAL DE WHATSAPP DE CF GLOBAL CARGO (Cambiar por el real con código 591)
const NUMERO_WHATSAPP_CF = "59169191099"; 

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar pestañas del cotizador
    const selectorButtons = document.querySelectorAll('.selector-btn');
    selectorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/switchForm\('([^']+)'\)/);
                if (match) {
                    switchForm(match[1]);
                }
            }
        });
    });
});

window.switchForm = function(serviceKey) {
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(serviceKey)) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.quote-form').forEach(form => {
        form.classList.remove('active-form');
    });

    const activeForm = document.getElementById(`form-${serviceKey}`);
    if (activeForm) activeForm.classList.add('active-form');
};

// CALCULADORA CBM PARA ZOFRI
window.calcularCbmZofri = function() {
    const largo = parseFloat(document.getElementById('zofri-largo')?.value) || 0;
    const ancho = parseFloat(document.getElementById('zofri-ancho')?.value) || 0;
    const alto = parseFloat(document.getElementById('zofri-alto')?.value) || 0;
    const cajas = parseInt(document.getElementById('zofri-cajas')?.value) || 0;
    const pesoCaja = parseFloat(document.getElementById('zofri-peso-caja')?.value) || 0;

    const cbmTotal = (largo * ancho * alto * cajas) / 1000000;
    const pesoTotal = pesoCaja * cajas;

    const cbmValElem = document.getElementById('zofri-cbm-val');
    const pesoTotalElem = document.getElementById('zofri-peso-total');

    if (cbmValElem) cbmValElem.innerText = `${cbmTotal.toFixed(3)} CBM`;
    if (pesoTotalElem) pesoTotalElem.value = pesoTotal > 0 ? `${pesoTotal} kg` : '';
};

// MANEJADOR GENERAL PARA LOS 8 FORMULARIOS
window.handleQuoteSubmit = function(event, serviceType) {
    if (event) event.preventDefault();

    let mensaje = "";

    try {
        switch (serviceType) {
            case 'lcl':
                mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar carga consolidada LCL 🇨🇳.\n\n• Nombre: ${val('lcl-nombre')}\n• Origen: ${val('lcl-origen')}\n• Mercancía: ${val('lcl-mercancia')}\n• Volumen: ${val('lcl-cbm')} CBM\n• Peso: ${val('lcl-peso')} kg\n• Bultos: ${val('lcl-bultos')}\n• Destino: ${val('lcl-destino')}\n• WhatsApp: ${val('lcl-whatsapp')}`;
                break;

            case 'zofri':
                mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar carga por caja desde ZOFRI - Iquique 🇨🇱.\n\n• Nombre: ${val('zofri-nombre')}\n• Mercancía: ${val('zofri-mercancia')}\n• Cajas: ${val('zofri-cajas')}\n• Medidas (cm): ${val('zofri-largo')}x${val('zofri-ancho')}x${val('zofri-alto')}\n• CBM: ${document.getElementById('zofri-cbm-val')?.innerText || '0'}\n• Peso Total: ${val('zofri-peso-total')}\n• Destino: ${val('zofri-destino')}\n• WhatsApp: ${val('zofri-whatsapp')}`;
                break;

            case 'fcl':
                mensaje = `Hola, CF GLOBAL CARGO. Solicito cotización de Contenedor Completo (FCL) 🚢.\n\n• Nombre: ${val('fcl-nombre')}\n• Origen: ${val('fcl-pais')} (${val('fcl-puerto-select')})\n• Contenedor: ${val('fcl-tipo-contenedor')} (${val('fcl-cantidad')} unid.)\n• Tránsito: ${val('fcl-transito')}\n• Mercancía: ${val('fcl-mercancia')}\n• Peso: ${val('fcl-peso')} kg\n• Destino: ${val('fcl-destino')}\n• WhatsApp: ${val('fcl-whatsapp')}`;
                break;

            case 'maritimo':
                mensaje = `Hola, CF GLOBAL CARGO. Solicito cotización de Transporte Marítimo 🌊.\n\n• Nombre: ${val('mar-nombre')}\n• Origen: ${val('mar-pais')} (${val('mar-puerto')})\n• Naviera: ${val('mar-naviera')}\n• Equipo: ${val('mar-equipo')}\n• Mercancía: ${val('mar-mercancia')}\n• Peso: ${val('mar-peso')} kg\n• Destino: ${val('mar-destino')}\n• WhatsApp: ${val('mar-whatsapp')}`;
                break;

            case 'aereo':
                mensaje = `Hola, CF GLOBAL CARGO. Solicito cotización de Flete Aéreo ✈️.\n\n• Nombre: ${val('aereo-nombre')}\n• Origen: ${val('aereo-origen')}\n• Mercancía: ${val('aereo-mercancia')}\n• Peso: ${val('aereo-peso')} kg\n• Volumen: ${val('aereo-volumen')}\n• Destino: ${val('aereo-destino')}\n• WhatsApp: ${val('aereo-whatsapp')}`;
                break;

            case 'terrestre':
                mensaje = `Hola, CF GLOBAL CARGO. Solicito cotización de Flete Terrestre 🚛.\n\n• Nombre: ${val('terr-nombre')}\n• Carga desde: ${val('terr-puerto')}\n• Despacho: ${val('terr-despacho')}\n• Mercancía: ${val('terr-mercancia')}\n• Peso: ${val('terr-peso')} kg\n• Aduana Destino: ${val('terr-destino')}\n• WhatsApp: ${val('terr-whatsapp')}`;
                break;

            case 'documental':
                mensaje = `Hola, CF GLOBAL CARGO. Solicito Gestión Documental 📑.\n\n• Nombre: ${val('doc-nombre')}\n• Origen: ${val('doc-pais')}\n• Servicio: ${val('doc-servicio')}\n• Detalle: ${val('doc-mensaje')}\n• WhatsApp: ${val('doc-whatsapp')}`;
                break;

            case 'asesoria':
                mensaje = `Hola, CF GLOBAL CARGO. Solicito Asesoría Personalizada 🤝.\n\n• Nombre: ${val('ase-nombre')}\n• Requerimiento: ${val('ase-opcion')}\n• Producto: ${val('ase-producto') || 'N/A'}\n• Proveedor: ${val('ase-pais-prov') || 'N/A'}\n• Consulta: ${val('ase-consulta')}\n• WhatsApp: ${val('ase-whatsapp')}`;
                break;

            default:
                mensaje = `Hola, CF GLOBAL CARGO. Deseo solicitar una cotización de importación y logística.`;
        }

        const waUrl = `https://wa.me/${NUMERO_WHATSAPP_CF}?text=${encodeURIComponent(mensaje)}`;
        window.open(waUrl, '_blank');

    } catch (error) {
        console.error("Error al procesar formulario:", error);
        alert("Por favor complete los campos obligatorios.");
    }

    return false;
};

// Función auxiliar segura para extraer valores de inputs
function val(id) {
    const elem = document.getElementById(id);
    return elem ? elem.value.trim() : '';
}