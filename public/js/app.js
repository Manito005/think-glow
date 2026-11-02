'use strict';

const categories = [
  'Todos',
  'Roupas',
  'Calçado',
  'Bolsas',
  'Acessórios',
  'Joias',
  'Beleza',
  'Tecnologia',
  'Casa',
  'Crianças',
  'Desporto'
];

const products = [
  {id:1,name:'Camiseta Urban Classic',category:'Roupas',description:'Camiseta casual para o dia a dia.',price:450,emoji:'👕',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'},
  {id:2,name:'Camisa Elegance',category:'Roupas',description:'Camisa moderna para diferentes ocasiões.',price:850,emoji:'👔',image:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80'},
  {id:3,name:'Calças Jeans Classic',category:'Roupas',description:'Jeans versáteis para combinar com o teu estilo.',price:1200,emoji:'👖',image:'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80'},
  {id:4,name:'Vestido Modern Glow',category:'Roupas',description:'Design elegante para ocasiões especiais.',price:1500,emoji:'👗',image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80'},
  {id:5,name:'Casaco Street Style',category:'Roupas',description:'Uma camada extra para completar o visual.',price:1800,emoji:'🧥',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80'},
  {id:6,name:'Calções Casual',category:'Roupas',description:'Conforto para os dias mais quentes.',price:700,emoji:'🩳',image:'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80'},

  {id:7,name:'Ténis Urban Pro',category:'Calçado',description:'Estilo desportivo para acompanhar o teu dia.',price:2200,emoji:'👟',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80'},
  {id:8,name:'Sapatilhas Everyday',category:'Calçado',description:'Um visual casual para várias ocasiões.',price:1900,emoji:'👟',image:'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=700&q=80'},
  {id:9,name:'Sandálias Comfort',category:'Calçado',description:'Calçado leve para o dia a dia.',price:650,emoji:'🩴',image:'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=700&q=80'},
  {id:10,name:'Sapatos Elegance',category:'Calçado',description:'Uma opção clássica para ocasiões especiais.',price:1700,emoji:'👞',image:'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80'},

  {id:11,name:'Bolsa Everyday',category:'Bolsas',description:'Espaço e estilo para levar os teus essenciais.',price:1250,emoji:'👜',image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80'},
  {id:12,name:'Mochila City',category:'Bolsas',description:'Ideal para estudar, trabalhar ou passear.',price:1400,emoji:'🎒',image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80'},
  {id:13,name:'Carteira Compacta',category:'Bolsas',description:'Uma carteira prática para os teus essenciais.',price:500,emoji:'👛',image:'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80'},

  {id:14,name:'Óculos Urban',category:'Acessórios',description:'Um acessório para completar o teu look.',price:550,emoji:'🕶️',image:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80'},
  {id:15,name:'Boné Street',category:'Acessórios',description:'Estilo descontraído para o dia a dia.',price:400,emoji:'🧢',image:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80'},
  {id:16,name:'Cinto Classic',category:'Acessórios',description:'Um detalhe simples para completar o conjunto.',price:350,emoji:'🪢',image:'https://images.unsplash.com/photo-1624222247344-550fb8d5e4d5?auto=format&fit=crop&w=700&q=80'},

  {id:17,name:'Colar Minimalista',category:'Joias',description:'Um toque delicado para o teu estilo.',price:450,emoji:'📿',image:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80'},
  {id:18,name:'Relógio Moderno',category:'Joias',description:'Design elegante para diferentes ocasiões.',price:1100,emoji:'⌚',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'},
  {id:19,name:'Brincos Elegance',category:'Joias',description:'Um acessório delicado para oferecer ou usar.',price:300,emoji:'💎',image:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80'},

  {id:20,name:'Perfume Fresh',category:'Beleza',description:'Fragrância para acrescentar à tua rotina.',price:950,emoji:'🧴',image:'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80'},
  {id:21,name:'Kit de Maquilhagem',category:'Beleza',description:'Produtos para criar diferentes estilos.',price:800,emoji:'💄',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80'},
  {id:22,name:'Cuidados para Cabelo',category:'Beleza',description:'Artigos para a tua rotina de cuidados.',price:600,emoji:'🧴',image:'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80'},

  {id:23,name:'Auscultadores Wireless',category:'Tecnologia',description:'Acessório para ouvir música em movimento.',price:1300,emoji:'🎧',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80'},
  {id:24,name:'Capa para Telemóvel',category:'Tecnologia',description:'Proteção e estilo para o teu telefone.',price:250,emoji:'📱',image:'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=700&q=80'},
  {id:25,name:'Relógio Digital',category:'Tecnologia',description:'Um acessório tecnológico para o dia a dia.',price:1500,emoji:'⌚',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'},

  {id:26,name:'Candeeiro Decorativo',category:'Casa',description:'Um detalhe para renovar o teu espaço.',price:900,emoji:'💡',image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80'},
  {id:27,name:'Almofada Decorativa',category:'Casa',description:'Conforto e cor para a tua casa.',price:500,emoji:'🛋️',image:'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80'},

  {id:28,name:'Mochila Infantil',category:'Crianças',description:'Uma companheira prática para a escola.',price:750,emoji:'🎒',image:'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=700&q=80'},
  {id:29,name:'Ténis Infantil',category:'Crianças',description:'Calçado casual para os mais pequenos.',price:950,emoji:'👟',image:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80'},

  {id:30,name:'Garrafa Desportiva',category:'Desporto',description:'Leva a tua bebida para o treino ou passeio.',price:350,emoji:'🥤',image:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80'}
];

window.products = products;
let activeCategory = 'Todos';
let cart = JSON.parse(localStorage.getItem('thinkGlowDemoCart') || '[]');
let toastTimer;

const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('pt-MZ', {
  maximumFractionDigits: 2
}).format(value) + ' MT';

function showToast(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function saveCart() {
  localStorage.setItem('thinkGlowDemoCart', JSON.stringify(cart));
  renderCart();
}

function renderFilters() {
  const filters = $('filters');
  if (!filters) return;

  filters.innerHTML = categories.map(category => `
    <button class="filter-btn ${category === activeCategory ? 'active' : ''}"
      data-filter="${category}">${category}</button>
  `).join('');
}

function renderProducts() {
  const input = $('searchInput');
  const search = input ? input.value.trim().toLocaleLowerCase('pt') : '';

  const visible = products.filter(product => {
    const categoryMatches = activeCategory === 'Todos' || product.category === activeCategory;
    const text = `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase('pt');
    return categoryMatches && text.includes(search);
  });

  $('productGrid').innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-art">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          style="width:100%;height:100%;object-fit:cover;display:block"
          onerror="this.style.display='none';this.parentElement.innerHTML='<span style=&quot;font-size:4rem;display:grid;place-items:center;height:100%&quot;>${product.emoji}</span>'"
        >
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-bottom">
          <span class="product-price">${money(product.price)}</span>
          <button class="add-btn" data-add="${product.id}" aria-label="Adicionar ${product.name} ao carrinho">+</button>
        </div>
      </div>
    </article>
  `).join('');

  $('productCount').textContent = `${visible.length} ${visible.length === 1 ? 'artigo' : 'artigos'}`;
  $('emptyMessage').hidden = visible.length !== 0;
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('cartCount').textContent = count;
  $('cartTotal').textContent = money(total);

  if (!cart.length) {
    $('cartItems').innerHTML = '<p class="empty-message">O teu carrinho ainda está vazio. Descobre os nossos artigos!</p>';
    return;
  }

  $('cartItems').innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-icon" aria-hidden="true">${item.emoji || '🛍️'}</span>
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <small>${item.quantity} × ${money(item.price)}</small>
      </div>
      <button class="remove-btn" data-remove="${item.id}">Remover</button>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });

  saveCart();
  showToast(`${product.name} adicionado ao carrinho!`);
}

$('productGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(Number(button.dataset.add));
});

$('cartItems').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  const id = Number(button.dataset.remove);
  cart = cart.filter(item => item.id !== id);
  saveCart();
  showToast('Artigo removido do carrinho.');
});

$('searchInput').addEventListener('input', renderProducts);

$('filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeCategory = button.dataset.filter;
  renderFilters();
  renderProducts();
});

document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    renderFilters();
    renderProducts();
    $('produtos').scrollIntoView({ behavior: 'smooth' });
  });
});

$('menuBtn').addEventListener('click', () => {
  $('navMenu').classList.toggle('open');
});

$('navMenu').addEventListener('click', event => {
  if (event.target.closest('a')) $('navMenu').classList.remove('open');
});

$('cartFab').addEventListener('click', () => {
  $('cartModal').hidden = false;
});

function closeCart() {
  $('cartModal').hidden = true;
}

$('closeCart').addEventListener('click', closeCart);
$('closeCartBackdrop').addEventListener('click', closeCart);

$('checkoutBtn').addEventListener('click', () => {
  showToast('A finalização de encomendas será configurada na próxima etapa.');
});



$('helpBtn').addEventListener('click', () => {
  $('helpPanel').hidden = !$('helpPanel').hidden;
});

$('helpPanel').addEventListener('click', event => {
  const button = event.target.closest('[data-answer]');
  if (button) $('helpAnswer').textContent = button.dataset.answer;
});

$('year').textContent = new Date().getFullYear();

renderFilters();
renderProducts();
renderCart();
