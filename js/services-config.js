export const SERVICES = [
  {
    id: "lcl_china",
    title: "Consolidación de carga LCL / CBM",
    shortTitle: "Consolidación LCL / CBM · China",
    origin: "China → Bolivia",
    icon: "▣",
    description: "Consolida mercancía de distintos proveedores y cotiza según peso y volumen.",
    fields: [
      { name: "ciudadOrigen", label: "Ciudad o almacén en China", placeholder: "Ej. Yiwu, Guangzhou, Shenzhen" },
      { name: "cantidadBultos", label: "Cantidad de bultos", type: "number", min: 1, step: 1, placeholder: "Ej. 5" },
      { name: "pesoTotalKg", label: "Peso total aproximado (kg)", type: "number", min: 0, step: "0.01", placeholder: "Ej. 120" },
      { name: "cbm", label: "Volumen aproximado (m³ / CBM)", type: "number", min: 0, step: "0.001", placeholder: "Ej. 1.25" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Describe qué deseas importar" },
      { name: "departamento", label: "Departamento de destino", type: "select", required: true, options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Proveedores, fechas u otros detalles" }
    ]
  },
  {
    id: "caja_zofri",
    title: "Carga por caja desde ZOFRI – Iquique",
    shortTitle: "Carga por caja · ZOFRI Iquique",
    origin: "Iquique → Bolivia",
    icon: "⌂",
    description: "Calcula peso y volumen de tus cajas para solicitar el traslado desde Iquique.",
    fields: [
      { name: "cantidadCajas", label: "Cantidad de cajas", type: "number", required: true, min: 1, step: 1, placeholder: "Ej. 10" },
      { name: "largoCm", label: "Largo de la caja (cm)", type: "number", required: true, min: 0, step: "0.1", placeholder: "Ej. 50" },
      { name: "anchoCm", label: "Ancho de la caja (cm)", type: "number", required: true, min: 0, step: "0.1", placeholder: "Ej. 40" },
      { name: "altoCm", label: "Alto de la caja (cm)", type: "number", required: true, min: 0, step: "0.1", placeholder: "Ej. 30" },
      { name: "pesoCajaKg", label: "Peso por caja (kg)", type: "number", required: true, min: 0, step: "0.01", placeholder: "Ej. 20" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Ropa, repuestos, electrónicos…" },
      { name: "departamento", label: "Departamento de destino", type: "select", required: true, options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Información adicional" }
    ],
    computed: ["pesoTotalKg", "cbm"]
  },
  {
    id: "fcl",
    title: "Contenedores completos – FCL",
    shortTitle: "Contenedor completo · FCL",
    origin: "Internacional → Bolivia",
    icon: "▤",
    description: "Solicita una estimación para contenedor completo y coordinación logística.",
    fields: [
      { name: "tipoContenedor", label: "Tipo de contenedor", type: "select", required: true, options: ["20 pies", "40 pies", "40 pies High Cube", "Otro / necesito asesoría"] },
      { name: "cantidadContenedores", label: "Cantidad de contenedores", type: "number", required: true, min: 1, step: 1, placeholder: "Ej. 1" },
      { name: "puertoOrigen", label: "Puerto / ciudad de origen", required: true, placeholder: "Ej. Ningbo, China" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Describe la carga" },
      { name: "pesoTotalKg", label: "Peso estimado de la carga (kg)", type: "number", min: 0, step: "0.01", placeholder: "Ej. 12000" },
      { name: "departamento", label: "Departamento de destino", type: "select", required: true, options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Fecha estimada, condiciones especiales, etc." }
    ]
  },
  {
    id: "maritimo",
    title: "Transporte marítimo",
    shortTitle: "Transporte marítimo",
    origin: "Internacional → Bolivia",
    icon: "◒",
    description: "Coordina embarques marítimos según origen, mercancía, peso y volumen.",
    fields: [
      { name: "puertoOrigen", label: "Puerto o país de origen", required: true, placeholder: "Ej. Shanghai, China" },
      { name: "cantidadBultos", label: "Cantidad de bultos", type: "number", min: 1, step: 1, placeholder: "Ej. 8" },
      { name: "pesoTotalKg", label: "Peso total aproximado (kg)", type: "number", min: 0, step: "0.01", placeholder: "Ej. 350" },
      { name: "cbm", label: "Volumen aproximado (m³ / CBM)", type: "number", min: 0, step: "0.001", placeholder: "Ej. 2.4" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Describe la carga" },
      { name: "departamento", label: "Departamento de destino", type: "select", required: true, options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Incoterm, fechas u otros detalles" }
    ]
  },
  {
    id: "aereo",
    title: "Flete aéreo",
    shortTitle: "Flete aéreo",
    origin: "Internacional → Bolivia",
    icon: "✈",
    description: "Cotiza carga aérea urgente o de alto valor con los datos básicos de tu envío.",
    fields: [
      { name: "ciudadOrigen", label: "Ciudad / aeropuerto de origen", required: true, placeholder: "Ej. Guangzhou, China" },
      { name: "pesoTotalKg", label: "Peso total aproximado (kg)", type: "number", required: true, min: 0, step: "0.01", placeholder: "Ej. 25" },
      { name: "largoCm", label: "Largo mayor (cm)", type: "number", min: 0, step: "0.1", placeholder: "Ej. 60" },
      { name: "anchoCm", label: "Ancho (cm)", type: "number", min: 0, step: "0.1", placeholder: "Ej. 40" },
      { name: "altoCm", label: "Alto (cm)", type: "number", min: 0, step: "0.1", placeholder: "Ej. 35" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Describe la carga" },
      { name: "departamento", label: "Departamento de destino", type: "select", required: true, options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Fecha límite u otros detalles" }
    ]
  },
  {
    id: "terrestre",
    title: "Flete terrestre",
    shortTitle: "Flete terrestre",
    origin: "Ruta terrestre",
    icon: "▰",
    description: "Solicita transporte terrestre con origen, destino y características de la carga.",
    fields: [
      { name: "ciudadOrigen", label: "Ciudad de origen", required: true, placeholder: "Ej. Iquique, Chile" },
      { name: "ciudadDestino", label: "Ciudad de destino", required: true, placeholder: "Ej. La Paz, Bolivia" },
      { name: "tipoCarga", label: "Tipo de carga", type: "select", required: true, options: ["Cajas / bultos", "Pallets", "Carga suelta", "Contenedor", "Otro"] },
      { name: "cantidadBultos", label: "Cantidad de bultos / unidades", type: "number", min: 1, step: 1, placeholder: "Ej. 12" },
      { name: "pesoTotalKg", label: "Peso total aproximado (kg)", type: "number", min: 0, step: "0.01", placeholder: "Ej. 450" },
      { name: "cbm", label: "Volumen aproximado (m³)", type: "number", min: 0, step: "0.001", placeholder: "Ej. 3.5" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Describe la carga" },
      { name: "observaciones", label: "Observaciones", type: "textarea", placeholder: "Fecha de recojo u otros detalles" }
    ]
  },
  {
    id: "documental",
    title: "Gestión documental",
    shortTitle: "Gestión documental",
    origin: "Importación → Bolivia",
    icon: "▤",
    description: "Indica qué documentos necesitas revisar o gestionar para tu importación.",
    fields: [
      { name: "tipoGestion", label: "Gestión que necesitas", type: "select", required: true, options: ["Revisión de factura comercial", "Lista de empaque", "Documentos de transporte", "Certificados de origen / producto", "Asesoría de importación", "Otra gestión"] },
      { name: "origenMercancia", label: "País de origen de la mercancía", required: true, placeholder: "Ej. China" },
      { name: "mercancia", label: "Mercancía / producto", required: true, placeholder: "Describe el producto" },
      { name: "estadoDocumentos", label: "Estado actual de los documentos", type: "select", options: ["Ya los tengo y necesito revisión", "Aún no los tengo", "No estoy seguro"] },
      { name: "departamento", label: "Departamento de destino", type: "select", required: true, options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "Cuéntanos qué necesitas", type: "textarea", required: true, placeholder: "Describe tu consulta documental" }
    ]
  },
  {
    id: "proveedores",
    title: "Verificación de proveedores",
    shortTitle: "Verificación de proveedores",
    origin: "Proveedor internacional",
    icon: "⌕",
    description: "Comparte los datos del proveedor y producto que deseas validar.",
    fields: [
      { name: "nombreProveedor", label: "Nombre de la empresa proveedora", required: true, placeholder: "Nombre comercial" },
      { name: "enlaceProveedor", label: "Enlace o perfil del proveedor", type: "url", placeholder: "https://…" },
      { name: "ciudadOrigen", label: "País / ciudad del proveedor", required: true, placeholder: "Ej. Yiwu, China" },
      { name: "mercancia", label: "Producto que deseas comprar", required: true, placeholder: "Describe el producto" },
      { name: "cantidadEstimada", label: "Cantidad estimada", type: "number", min: 1, step: 1, placeholder: "Ej. 100" },
      { name: "observaciones", label: "Qué deseas verificar", type: "textarea", required: true, placeholder: "Empresa, calidad, documentos u otra consulta" }
    ]
  },
  {
    id: "asesoria",
    title: "Asesoría personalizada",
    shortTitle: "Asesoría personalizada",
    origin: "Tu proyecto de importación",
    icon: "✧",
    description: "Cuéntanos tu proyecto para orientarte en compras, logística y costos.",
    fields: [
      { name: "etapaProyecto", label: "Etapa de tu proyecto", type: "select", required: true, options: ["Estoy empezando a investigar", "Ya elegí un producto", "Ya tengo proveedor", "Tengo una carga en camino", "Necesito resolver un problema"] },
      { name: "origenMercancia", label: "País de origen (si lo conoces)", placeholder: "Ej. China, Chile, Estados Unidos" },
      { name: "mercancia", label: "Producto o actividad", required: true, placeholder: "¿Qué deseas importar?" },
      { name: "presupuestoBOB", label: "Presupuesto estimado en Bs (opcional)", type: "number", min: 0, step: "0.01", placeholder: "Ej. 5000" },
      { name: "departamento", label: "Departamento", type: "select", options: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"] },
      { name: "observaciones", label: "¿En qué necesitas orientación?", type: "textarea", required: true, placeholder: "Escribe tu consulta" }
    ]
  }
];

export const DEFAULT_TARIFF = Object.freeze({
  enabled: false,
  baseBOB: 0,
  tarifaKg: 0,
  tarifaCbm: 0,
  tarifaCaja: 0,
  tarifaContenedor: 0,
  margen: 0,
  formula: "(base + kg * tarifaKg + cbm * tarifaCbm + cajas * tarifaCaja + contenedores * tarifaContenedor) * (1 + margen / 100)"
});

export const TARIFF_VARIABLES = "base, kg, cbm, cajas, contenedores, tarifaKg, tarifaCbm, tarifaCaja, tarifaContenedor, margen";
