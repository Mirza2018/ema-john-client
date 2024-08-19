import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    
    const [cart, setCart] = useState([])



    const { totalProducts } = useLoaderData();
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPages, setItemsPerPages] = useState(10)

    // const itemsPerPages = 10;  //TODO:Make it dynamic
    const totalPages = Math.ceil(totalProducts / itemsPerPages);

    const pageNumbers = [...Array(totalPages).keys()]
    // console.log(pageNumbers);
    const options = [5, 10, 15, 20];
    const handleSelectChange = (event) => {
        setItemsPerPages(parseInt(event.target.value))
        setCurrentPage(0)
    }




    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&limit=${itemsPerPages}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage, itemsPerPages]);


    // useEffect(() => {
    //     async function fetchData() {

    //         const response = await fetch(`http://localhost:5000/products?page=${currentPage}&limit=${itemsPerPages}`)


    //         const data = await response.json();
    //         setProducts(data)
    //     }
    //     fetchData()
    // }, [currentPage, itemsPerPages]);

    useEffect(() => {
        const storedCart = getShoppingCart();
        const ids = Object.keys(storedCart)

        fetch('http://localhost:5000/productsByIds', {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(ids)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const savedCart = [];
                // step 1: get id of the addedProduct
                for (const id in storedCart) {
                    // step 2: get product from products state by using id
                    const addedProduct = data.find(product => product._id === id)
                    if (addedProduct) {
                        // step 3: add quantity
                        const quantity = storedCart[id];
                        addedProduct.quantity = quantity;
                        // step 4: add the added product to the saved cart
                        savedCart.push(addedProduct);
                    }
                    // console.log('added Product', addedProduct)
                }
                // step 5: set the cart
                setCart(savedCart);
            })
    }, [])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }


    return (
        <>
            <div className='shop-container'>
                <div className="products-container">
                    {
                        products.map(product => <Product
                            key={product._id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                        ></Product>)
                    }
                </div>
                <div className="cart-container">
                    <Cart
                        cart={cart}
                        handleClearCart={handleClearCart}
                    >
                        <Link className='proceed-link' to="/orders">
                            <button className='btn-proceed'>Review Order</button>
                        </Link>

                    </Cart>
                </div>
            </div>
            {/* PAGINATION */}
            <div className="pagination">
                <p>{currentPage}</p>
                {
                    pageNumbers.map(number => <button
                        key={number}
                        className={currentPage === number ?
                            'selected' : ''}
                        onClick={() => setCurrentPage(number)}
                    >{number + 1}</button>)
                }


                <select value={itemsPerPages} onChange={handleSelectChange}>
                    {
                        options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))
                    }

                </select>
                
            </div>

        </>
    );
};

export default Shop;