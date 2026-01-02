document.addEventListener('DOMContentLoaded', () => {
    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveal
    gsap.from('.reveal-text', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });

    gsap.from('.floating-tyre', {
        x: 200,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5
    });

    // Scroll Animations
    gsap.utils.toArray('.exp-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.2
        });
    });

    gsap.from('.model-card', {
        scrollTrigger: {
            trigger: '.models-container',
            start: 'top 80%',
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'back.out(1.7)'
    });

    gsap.from('.fac-img', {
        scrollTrigger: {
            trigger: '.facility-section',
            start: 'top 70%',
        },
        x: -100,
        opacity: 0,
        duration: 1,
    });

    // Logo & Nav Animation
    gsap.from('.navbar', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });

    // Cart Logic
    let cart = [];
    const cartCount = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsDiv = document.getElementById('cart-items');
    const totalVal = document.getElementById('total-val');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.parentElement;
            const item = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price)
            };
            cart.push(item);
            updateCart();

            // Tiny animation
            gsap.to(btn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        });
    });

    function updateCart() {
        cartCount.textContent = cart.length;
        cartItemsDiv.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.marginBottom = '10px';
            div.innerHTML = `<span>${item.name}</span> <span>$${item.price}</span>`;
            cartItemsDiv.appendChild(div);
        });
        totalVal.textContent = total.toFixed(2);
    }

    cartBtn.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        alert('Thank you for your order! Our team will contact you for delivery.');
        cart = [];
        updateCart();
        cartModal.classList.add('hidden');
    });

    // AI Chat Toggle
    const aiToggle = document.getElementById('ai-chat-btn');
    const aiContainer = document.getElementById('ai-chat-container');
    const closeAi = document.getElementById('close-chat');

    aiToggle.addEventListener('click', () => {
        aiContainer.classList.toggle('hidden');
        if (!aiContainer.classList.contains('hidden')) {
            gsap.from(aiContainer, { y: 20, opacity: 0, duration: 0.3 });
        }
    });

    closeAi.addEventListener('click', () => aiContainer.classList.add('hidden'));
});
