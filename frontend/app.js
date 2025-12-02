const URL_API = "http://localhost:3000/api";

async function verJSON() {
    try {
        const respuesta = await fetch(`${URL_API}/productos`);
        const datos = await respuesta.json();
        const salida = document.getElementById("jsonOutput");
        salida.textContent = JSON.stringify(datos, null, 2);
    } catch (error) {
        console.error("Error al obtener JSON:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnVerJSON").addEventListener("click", verJSON);
});



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

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});
