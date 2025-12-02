// =======================================================
// 🟩 BOTÓN PARA MOSTRAR EL JSON TAL COMO VIENE DEL SERVIDOR
// =======================================================

// ============================================================
// 🌐 1. URL BASE DE NUESTRA API
// ============================================================
// Aquí guardamos la dirección del backend para no repetirla.
// Si mañana cambia (por ejemplo, a un dominio real),
// solo tendrás que modificar esta línea.
const URL_API = "http://localhost:3000/api";



// ============================================================
// 📥 2. FUNCIÓN QUE PIDE EL JSON AL SERVIDOR Y LO MUESTRA
// ============================================================
// Esta función se ejecutará cuando el usuario pulse el botón.
// Hace una petición GET a "/productos" y muestra el JSON tal cual.
async function verJSON() {
    try {
        // --------------------------------------------------------
        // Hacemos la petición al backend con fetch().
        // fetch devuelve un objeto "Response", NO los datos aún.
        // --------------------------------------------------------
        const respuesta = await fetch(`${URL_API}/productos`);

        // --------------------------------------------------------
        // Convertimos la respuesta en JSON (otro await necesario).
        // "datos" contendrá EXACTAMENTE lo que envía tu servidor.
        // --------------------------------------------------------
        const datos = await respuesta.json();

        // --------------------------------------------------------
        // Buscamos el <pre id="jsonOutput"> del HTML.
        // Este es el sitio donde vamos a imprimir el JSON en pantalla.
        // --------------------------------------------------------
        const salida = document.getElementById("jsonOutput");

        // --------------------------------------------------------
        // JSON.stringify convierte el objeto en texto.
        // El "null, 2" es para que lo muestre bonito y organizado.
        // --------------------------------------------------------
        salida.textContent = JSON.stringify(datos, null, 2);

    } catch (error) {
        // Si algo falla (servidor caído, URL mala, etc.) lo veremos aquí.
        console.error("Error al obtener JSON:", error);
    }
}




// ============================================================
// 🖱️ 3. ACTIVAMOS EL BOTÓN CUANDO LA PÁGINA CARGA
// ============================================================
// Esperamos a que el HTML esté listo para manipularlo.
document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // Buscamos el botón con id="btnVerJSON" en el HTML.
    // Cuando lo pulse → ejecutará la función verJSON().
    // --------------------------------------------------------
    document.getElementById("btnVerJSON").addEventListener("click", verJSON);

});



// =======================================================
// 🔵 TODO TU CÓDIGO ORIGINAL — QUEDA COMENTADO
// =======================================================




// 📦 Función para cargar productos desde el backend
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${URL_API}/productos`);
        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarProductos(datos.data);
        } else {
            console.error("Error al cargar productos");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// 🎨 Función para mostrar los productos en la página
function mostrarProductos(lista) {
    const contenedor = document.getElementById("productsGrid");

    contenedor.innerHTML = lista.map(producto => `
        <div class="product-card">
            <img src="foto.png" class="product-image" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p><strong>${producto.precio}€</strong></p>
            <p>Stock: ${producto.stock}</p>
        </div>
    `).join('');
}

// 🚀 Cuando la página termine de cargar, ejecutamos la función
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

