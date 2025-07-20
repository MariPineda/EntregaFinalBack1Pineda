const socket = io();

// Crear producto
document.getElementById('create-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = document.getElementById('title').value;
    const descripcion = document.getElementById('description').value;
    const precio = document.getElementById('price').value;
    const dataProducto = { title: titulo, description: descripcion, price: precio };//const dataProducto = { titulo, descripcion, precio };  
    socket.emit('new-product', dataProducto);
});

// Actualizar producto
socket.on('update-products', products => { 
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    products.forEach(p => {
        const li = document.createElement('li');
        li.innerText = `${p.titulo} - $${p.precio}`;
        productsList.appendChild(li);
    });
});

// Actualizar lista de productos
socket.on('products', (products) => {
    const productos = document.getElementById('products-list');
    productos.innerHTML = '';
    products.forEach((producto) => {
        const productHTML = `
            <div>
                <h2>${producto.titulo}</h2>
                <p>${producto.descripcion}</p>
                <p>Precio: ${producto.precio}</p>
            </div>
        `;
        productos.innerHTML += productHTML;
    });
});