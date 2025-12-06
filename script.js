/* ===================== Smooth scroll (tu código original) ===================== */
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth' 
                });
            }
        });
    });

    // Inicializaciones que deben ocurrir al cargar la página:
    initUsersDB();
    updateLoginButton();
    loadCartFromStorage();
    updateCartUI();
});

/* ===================== INICIALIZAR "usuariosDB" EN localStorage ===================== */
function initUsersDB() {
    if (!localStorage.getItem("usuariosDB")) {
        const initial = {
            usuarios: [
                { user: "admin", pass: "1234" },
                { user: "demo", pass: "password" }
            ]
        };
        localStorage.setItem("usuariosDB", JSON.stringify(initial));
    }
}

/* ===================== MODALES (login / registro) ===================== */
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

/* ===================== REGISTRO (JSON en localStorage) ===================== */
function register() {
    const user = document.getElementById("regUser").value.trim();
    const pass = document.getElementById("regPass").value;
    const pass2 = document.getElementById("regPass2").value;

    if (!user || !pass) {
        alert("Completa todos los campos.");
        return;
    }
    if (pass !== pass2) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    let db = JSON.parse(localStorage.getItem("usuariosDB") || '{"usuarios":[]}');

    if (db.usuarios.some(u => u.user.toLowerCase() === user.toLowerCase())) {
        alert("Ese usuario ya existe.");
        return;
    }

    db.usuarios.push({ user, pass });
    localStorage.setItem("usuariosDB", JSON.stringify(db));

    alert("Cuenta creada correctamente.");
    // limpiar inputs
    document.getElementById("regUser").value = "";
    document.getElementById("regPass").value = "";
    document.getElementById("regPass2").value = "";

    switchModal('registerModal', 'loginModal');
}

/* ===================== LOGIN ===================== */
function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;

    if (!user || !pass) {
        alert("Completa todos los campos.");
        return;
    }

    let db = JSON.parse(localStorage.getItem("usuariosDB") || '{"usuarios":[]}');

    const found = db.usuarios.find(u => u.user.toLowerCase() === user.toLowerCase() && u.pass === pass);

    if (found) {
        localStorage.setItem("loggedUser", found.user);
        alert("Bienvenido " + found.user);
        closeModal('loginModal');
        // limpiar inputs
        document.getElementById("loginUser").value = "";
        document.getElementById("loginPass").value = "";
        updateLoginButton();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

/* ===================== SESIÓN / BOTÓN LOGIN ===================== */
function updateLoginButton() {
    const btn = document.querySelector(".login-btn");
    const user = localStorage.getItem("loggedUser");

    if (!btn) return;

    if (user) {
        btn.innerText = "Cerrar sesión (" + user + ")";
        btn.onclick = logout;
    } else {
        btn.innerText = "Iniciar Sesión";
        btn.onclick = () => openModal('loginModal');
    }
}

function logout() {
    localStorage.removeItem("loggedUser");
    updateLoginButton();
    alert("Sesión cerrada.");
}

/* ===================== CARRITO (localStorage) ===================== */
let cart = [];

// Cargar carrito desde localStorage (llamado en DOMContentLoaded)
function loadCartFromStorage() {
    cart = JSON.parse(localStorage.getItem("cartDB") || "[]");
}

// Guardar carrito
function saveCart() {
    localStorage.setItem("cartDB", JSON.stringify(cart));
}

// Añadir producto al carrito
function addToCart(name, price) {
    // opcional: si quieres agrupar por producto y cantidad,
    // en vez de push simple puedes buscar y aumentar quantity.
    // Aquí añadimos como item separado (simple).
    cart.push({ name, price });
    saveCart();
    updateCartUI();
    // pequeña confirmación visual
    alert(`"${name}" agregado al carrito`);
}

// Quitar producto por índice
function removeFromCart(i) {
    if (i < 0 || i >= cart.length) return;
    cart.splice(i, 1);
    saveCart();
    updateCartUI();
}

// Vaciar carrito
function clearCart() {
    if (!confirm("¿Vaciar todo el carrito?")) return;
    cart = [];
    saveCart();
    updateCartUI();
}

// Calcular total
function calculateTotal() {
    return cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
}

// Actualizar contador, listado y total
function updateCartUI() {
    const countEl = document.getElementById("cartCount");
    const totalEl = document.getElementById("cartTotal");
    const container = document.getElementById("cartItems");

    if (countEl) countEl.innerText = cart.length;
    if (totalEl) totalEl.innerText = calculateTotal();

    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        const empty = document.createElement("div");
        empty.className = "cart-empty";
        empty.innerText = "Tu carrito está vacío.";
        container.appendChild(empty);
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size:0.9rem;color:#555;">$${item.price}</div>
            </div>
            <div>
                <button onclick="removeFromCart(${index})">Quitar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Abrir/Cerrar modal carrito
function openCart() {
    const el = document.getElementById("cartModal");
    if (el) el.style.display = "flex";
    updateCartUI();
}

function closeCart() {
    const el = document.getElementById("cartModal");
    if (el) el.style.display = "none";
}

/* ============================
   BUSCADOR REAL DE PRODUCTOS
================================ */

document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador");
    if (!buscador) return; // si no existe, no hace nada

    buscador.addEventListener("keyup", function () {
        const texto = this.value.toLowerCase().trim();

        // Selecciona TODOS los productos del menú
        const productos = document.querySelectorAll(".menu-category ul li");

        productos.forEach(prod => {
            const nombre = prod.querySelector(".product-name").textContent.toLowerCase();
            const desc = prod.querySelector(".description").textContent.toLowerCase();

            // Mostrar solo los productos que coinciden
            if (nombre.includes(texto) || desc.includes(texto)) {
                prod.style.display = "block";
            } else {
                prod.style.display = "none";
            }
        });
    });
});
/* ============================
   BUSCADOR DE PRODUCTOS + AUTO SCROLL
================================ */

document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador");
    const menuSection = document.getElementById("menu");

    if (!buscador) return;

    buscador.addEventListener("keyup", function () {
        const texto = this.value.toLowerCase().trim();

        // 🔽 BAJA AUTOMÁTICAMENTE AL MENÚ
        menuSection.scrollIntoView({
            behavior: "smooth"
        });

        // TODOS LOS PRODUCTOS
        const productos = document.querySelectorAll(".menu-category ul li");

        productos.forEach(prod => {
            const nombre = prod.querySelector(".product-name").textContent.toLowerCase();
            const desc = prod.querySelector(".description").textContent.toLowerCase();

            if (nombre.includes(texto) || desc.includes(texto)) {
                prod.style.display = "block";
            } else {
                prod.style.display = "none";
            }
        });
    });
});
