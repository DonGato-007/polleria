// PRELOADER
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader').classList.add('hidden');
    }, 900);
  });

  // THEME TOGGLE
  function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.classList.contains('light-mode') ? 'dark' : 'light';
    
    if (currentTheme === 'light') {
      root.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }

  // Load saved theme on page load
  (function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  })();

  // SLIDER
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');

  function goSlide(n) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = n;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  setInterval(() => {
    goSlide((currentSlide + 1) % slides.length);
  }, 4500);

  // MOBILE NAV
  function openMobileNav() {
    document.getElementById('mobileNav').classList.add('open');
    document.getElementById('overlay').classList.add('show');
  }
  function closeMobileNav() {
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }

  // SCROLL TOP
  window.addEventListener('scroll', () => {
    const st = document.getElementById('scrollTop');
    if (window.scrollY > 400) st.classList.add('show');
    else st.classList.remove('show');
  });

  // SCROLL TO SECTION - Now shows/hides product sections
  function scrollToSection(id) {
    // Hide all product sections
    const allSections = document.querySelectorAll('.product-section');
    allSections.forEach(section => {
      section.classList.remove('active');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(id);
    if (targetSection) {
      targetSection.classList.add('active');
      // Smooth scroll to the section
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update active state on category items
    const allCatItems = document.querySelectorAll('.cat-item');
    allCatItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to clicked category items (including duplicates)
    const clickedItems = document.querySelectorAll(`.cat-item[onclick="scrollToSection('${id}')"]`);
    clickedItems.forEach(item => {
      item.classList.add('active');
    });
  }

  // PEDIR WHATSAPP
  function pedirWhatsapp(producto) {
    const msg = encodeURIComponent('Hola El Fogón 🍗 Quiero pedir: ' + producto);
    window.open('https://wa.me/51910795135?text=' + msg, '_blank');
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileNav();
      }
    });
  });

  // ===== SHOPPING CART =====
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const body = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    // Update badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;

    // Update cart body
    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-shopping-bag"></i>
          <p>Tu carrito está vacío</p>
        </div>
      `;
      footer.style.display = 'none';
    } else {
      body.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <div class="cart-item-icon">${item.icon}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">S/ ${item.price.toFixed(2)}</div>
            <div class="cart-item-controls">
              <button class="cart-qty-btn" onclick="decreaseQty(${index})">-</button>
              <span class="cart-qty">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="increaseQty(${index})">+</button>
              <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalEl.textContent = `S/ ${total.toFixed(2)}`;
      footer.style.display = 'block';
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function addToCart(name, price, icon) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, icon, quantity: 1 });
    }
    
    updateCartUI();
    openCart();
    
    // Show feedback
    const badge = document.getElementById('cartBadge');
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => badge.style.transform = 'scale(1)', 300);
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
  }

  function increaseQty(index) {
    cart[index].quantity++;
    updateCartUI();
  }

  function decreaseQty(index) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    } else {
      removeFromCart(index);
    }
    updateCartUI();
  }

  function clearCart() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      cart = [];
      updateCartUI();
    }
  }

  // Login Modal Functions
  function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Aquí iría la lógica de autenticación real
    console.log('Login attempt:', { email, password });
    
    // Simulación de login exitoso
    alert('¡Bienvenido a El Fogón! 🍗\n\nFuncionalidad de login en desarrollo.');
    closeLoginModal();
    
    // Limpiar formulario
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  }

  function loginWithGoogle() {
    alert('Login con Google próximamente 🔐');
  }

  function loginWithFacebook() {
    alert('Login con Facebook próximamente 🔐');
  }

  // Cerrar modal al hacer clic fuera de él
  document.getElementById('loginModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeLoginModal();
    }
  });

  function openCart() {
    document.getElementById('cartModal').classList.add('open');
    document.getElementById('cartOverlay').style.display = 'block';
  }

  function closeCart() {
    document.getElementById('cartModal').classList.remove('open');
    document.getElementById('cartOverlay').style.display = 'none';
  }

  function checkoutCart() {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    let message = 'Hola El Fogón 🍗 Quiero hacer el siguiente pedido:\n\n';
    
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total: S/ ${total.toFixed(2)}*`;
    
    const encodedMsg = encodeURIComponent(message);
    window.open('https://wa.me/51910795135?text=' + encodedMsg, '_blank');
  }

  // Initialize cart on page load
  updateCartUI();

  // Category carousel dots for mobile
  const categoriesScroll = document.querySelector('.categories-scroll');
  const categoryDots = document.querySelectorAll('.category-dot');
  const catItems = document.querySelectorAll('.cat-item');
  
  if (categoriesScroll && categoryDots.length > 0 && window.innerWidth <= 700) {
    let isScrolling;
    
    categoriesScroll.addEventListener('scroll', () => {
      // Clear timeout if scrolling
      clearTimeout(isScrolling);
      
      // Set timeout to run after scrolling ends
      isScrolling = setTimeout(() => {
        const scrollLeft = categoriesScroll.scrollLeft;
        const scrollWidth = categoriesScroll.scrollWidth - categoriesScroll.clientWidth;
        const scrollPercentage = scrollLeft / scrollWidth;
        
        // Calculate which dot should be active (0, 1, or 2)
        let activeDotIndex = 0;
        if (scrollPercentage > 0.66) {
          activeDotIndex = 2;
        } else if (scrollPercentage > 0.33) {
          activeDotIndex = 1;
        }
        
        // Update dots
        categoryDots.forEach((dot, index) => {
          if (index === activeDotIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }, 50);
    });

    // Click on dots to scroll to sections
    categoryDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const scrollWidth = categoriesScroll.scrollWidth - categoriesScroll.clientWidth;
        let targetScroll = 0;
        
        if (index === 1) {
          targetScroll = scrollWidth * 0.5;
        } else if (index === 2) {
          targetScroll = scrollWidth;
        }
        
        categoriesScroll.scrollTo({ left: targetScroll, behavior: 'smooth' });
      });
    });
  }