const NUMERO_WHATSAPP_CF = "59169191099"; // Reemplaza con tu número real de WhatsApp

function switchForm(serviceKey) {
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(serviceKey));
    });

    document.querySelectorAll('.quote-form').forEach(form => {
        form.classList.remove('active-form');
    });

    const activeForm = document.getElementById(`form-${serviceKey}`);
    if (activeForm) activeForm.classList.add('active-form');
}

function handleQuoteSubmit(event, serviceType) {
    event.preventDefault();
    let mensaje = "";

    if (serviceType === 'lcl') {
        const nombre = document.getElementById('lcl-nombre').value;
        const mercancia = document.getElementById('lcl-mercancia').value;
        const cbm = document.getElementById('lcl-cbm').value;
        const whatsapp = document.getElementById('lcl-whatsapp').value;

        mensaje = `Hola, CF GLOBAL CARGO. Quiero cotizar carga consolidada LCL 🇨🇳.\n\n• Nombre: ${nombre}\n• Mercancía: ${mercancia}\n• Volumen: ${cbm} CBM\n• WhatsApp: ${whatsapp}`;
    }

    const waUrl = `https://wa.me/${NUMERO_WHATSAPP_CF}?text=${encodeURIComponent(mensaje)}`;
    window.open(waUrl, '_blank');
}