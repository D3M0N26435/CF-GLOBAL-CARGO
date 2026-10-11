// js/cotizador.js

// NÚMERO OFICIAL DE WHATSAPP DE CF GLOBAL CARGO (Cambiar por el real con código de país 591)
const NUMERO_WHATSAPP_CF = "59169191099"; 

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar pestañas del cotizador
    const selectorButtons = document.querySelectorAll('.selector-btn');
    selectorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                // Extraer la clave del servicio del onclick si estuviera definida así
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
    if (activeForm) {
        activeForm.classList.add('active-form');
    }
};

window.handleQuoteSubmit = function(event, serviceType) {
    // DETIENE EL REINICIO DE PÁGINA OBLIGATORIAMENTE
    if (event) event.preventDefault();

    let mensaje = "";

    try {
        if (serviceType === 'lcl') {
            const nombre = document.getElementById('lcl-nombre')?.value || '';
            const mercancia = document.getElementById('lcl-mercancia')?.value || '';
            const cbm = document.getElementById('lcl-cbm')?.value || '';
            const whatsapp = document.getElementById('lcl-whatsapp')?.value || '';

            mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar carga consolidada LCL 🇨🇳.\n\n• Nombre: ${nombre}\n• Mercancía: ${mercancia}\n• Volumen: ${cbm} CBM\n• WhatsApp: ${whatsapp}`;
        } else {
            // Mensaje genérico para otros formularios si se requiere ampliar
            mensaje = `Hola, CF GLOBAL CARGO. Deseo solicitar una cotización de importación y logística.`;
        }

        // Abre WhatsApp con el mensaje codificado
        const waUrl = `https://wa.me/${NUMERO_WHATSAPP_CF}?text=${encodeURIComponent(mensaje)}`;
        window.open(waUrl, '_blank');

    } catch (error) {
        console.error("Error al procesar la cotización:", error);
        alert("Ocurrió un error al preparar la solicitud. Por favor verifique los campos.");
    }

    return false; // Evita propagación adicional
};