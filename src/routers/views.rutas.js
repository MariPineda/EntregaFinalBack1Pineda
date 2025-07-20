const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Ruta raíz - redirige a /products o muestra algo inicial
router.get('/', (req, res) => {
    res.redirect('/products');  
});

// Vista principal de productos con filtros y carrito automático
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        // Filtro por categoría o status
        const filter = query
            ? ['true', 'false'].includes(query)
                ? { status: query === 'true' }
                : { category: query }
            : {};

        // Opciones de paginación y ordenamiento
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
            lean: true
        };

        // Crear carrito si no existe en cookies
        let cartId = req.cookies.cartId;
        if (!cartId) {
            const newCart = await Cart.create({ products: [] });
            cartId = newCart._id.toString();
            res.cookie('cartId', cartId, { httpOnly: true });
        }

        const result = await Product.paginate(filter, options);

        res.render('productList', {
            ...result,
            limit,
            sort,
            query,
            cartId, 
            showCartButton: true, 
            title: 'Catálogo de Productos'
        });
    } catch (error) {
        console.error('Error en /products:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Vista de un producto individual
router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    let cartId = req.cookies.cartId;
    if (!cartId) {
        const newCart = await Cart.create({ products: [] });
        cartId = newCart._id.toString();
        res.cookie('cartId', cartId, { httpOnly: true });
    }

    const product = await Product.findById(pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');

    res.render('productDetails', {
        product,
        cartId,
        showCartButton: true  
    });
});

// Vista en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    const products = await Product.find().lean();
    let cartId = req.cookies.cartId;
    if (!cartId) {
        const newCart = await Cart.create({ products: [] });
        cartId = newCart._id.toString();
        res.cookie('cartId', cartId, { httpOnly: true });
    }

    res.render('realTimeProducts', { 
        products,
        cartId, 
        showCartButton: false   
    });
});

// Vista para ver detalles del carrito
    router.get('/carts/:cid', async (req, res) => {
        try {
            const { cid } = req.params;

            const cart = await Cart.findById(cid).populate('products.product').lean();
            if (!cart) return res.status(404).send('Carrito no encontrado');

            res.render('cartDetails', { cart });
        } catch (err) {
            console.error('Error al mostrar carrito:', err);
            res.status(500).send('Error al cargar el carrito');
        }
    });

module.exports = router;


