'use strict';

(() => {
  const $ = id => document.getElementById(id);

  const style = document.createElement('style');
  style.textContent = `
    .details-modal[hidden] { display: none !important; }

    .details-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      overflow-y: auto;
      padding: 18px;
      background: rgba(8, 5, 20, .88);
      backdrop-filter: blur(8px);
    }

    .details-card {
      position: relative;
      width: min(100%, 900px);
      margin: 20px auto;
      padding: 22px;
      border: 1px solid rgba(180, 120, 255, .25);
      border-radius: 22px;
      background: #151025;
      color: #fff;
    }

    .details-close {
      position: sticky;
      top: 0;
      float: right;
      z-index: 2;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 50%;
      background: #302344;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }

    .details-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      clear: both;
    }

    .details-image {
      width: 100%;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      border-radius: 16px;
      background: #241b37;
    }

    .details-category {
      color: #c4a1ff;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .details-title {
      margin: 12px 0;
      font-size: clamp(24px, 5vw, 34px);
    }

    .details-description {
      color: #d2ccdf;
      line-height: 1.7;
    }

    .details-price {
      display: block;
      margin: 18px 0;
      color: #d2a9ff;
      font-size: 26px;
      font-weight: 800;
    }

    .details-label {
      display: block;
      margin: 18px 0 8px;
      font-weight: 700;
    }

    .details-select,
    .details-quantity {
      width: 100%;
      min-height: 44px;
      padding: 10px;
      border: 1px solid #55446f;
      border-radius: 10px;
      background: #211832;
      color: white;
    }

    .details-notice {
      margin: 18px 0;
      padding: 14px;
      border-radius: 12px;
      background: #251d36;
      color: #ded5ed;
      font-size: 13px;
      line-height: 1.7;
    }

    .details-favorite {
      margin: 14px 0;
      padding: 10px 14px;
      border: 1px solid #8061a8;
      border-radius: 10px;
      background: transparent;
      color: white;
      cursor: pointer;
    }

    .details-add {
      width: 100%;
      margin-top: 12px;
      padding: 15px;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(100deg, #a855f7, #7c3aed);
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    .details-related {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid #40334f;
    }

    .details-related button {
      margin: 5px;
      padding: 9px 12px;
      border: 1px solid #59436f;
      border-radius: 10px;
      background: #241a35;
      color: white;
      cursor: pointer;
    }

    .details-open {
      cursor: pointer;
    }

    .details-open:focus-visible,
    .details-favorite:focus-visible,
    .details-add:focus-visible {
      outline: 2px solid #d2a9ff;
      outline-offset: 3px;
    }

    @media (max-width: 620px) {
      .details-modal { padding: 8px; }
      .details-card { padding: 15px; margin: 8px auto; }
      .details-layout { grid-template-columns: 1fr; gap: 12px; }
      .details-image { max-height: 340px; }
    }
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'productDetailsModal';
  modal.className = 'details-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <section class="details-card" role="dialog"
      aria-modal="true" aria-labelledby="detailsTitle">
      <button class="details-close" type="button"
        aria-label="Fechar detalhes">×</button>

      <div class="details-layout">
        <div>
          <img class="details-image" id="detailsImage" alt="">
        </div>

        <div>
          <span class="details-category" id="detailsCategory"></span>
          <h2 class="details-title" id="detailsTitle"></h2>
          <p class="details-description" id="detailsDescription"></p>
          <strong class="details-price" id="detailsPrice"></strong>

          <label class="details-label" for="detailsSize">
            Tamanho
          </label>
          <select id="detailsSize" class="details-select">
            <option value="">Selecionar tamanho</option>
          </select>

          <label class="details-label" for="detailsColor">
            Cor
          </label>
          <select id="detailsColor" class="details-select">
            <option value="">Selecionar cor</option>
          </select>

          <label class="details-label" for="detailsQuantity">
            Quantidade
          </label>
          <input id="detailsQuantity" class="details-quantity"
            type="number" min="1" max="10" value="1">

          <div class="details-notice" id="detailsInformation"></div>

          <button class="details-favorite" id="detailsFavorite"
            type="button">♡ Adicionar aos favoritos</button>

          <button class="details-add" id="detailsAdd" type="button">
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div class="details-related">
        <h3>Também podes gostar</h3>
        <div id="detailsRelated"></div>
      </div>
    </section>
  `;

  document.body.appendChild(modal);

  let currentProduct = null;

  let favorites = [];
  try {
    favorites = JSON.parse(
      localStorage.getItem('thinkGlowFavorites') || '[]'
    );

    if (!Array.isArray(favorites)) favorites = [];
  } catch {
    favorites = [];
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('pt-MZ', {
      maximumFractionDigits: 2
    }).format(value) + ' MT';
  }

  function openDetails(id) {
    if (!Array.isArray(window.products)) {
      return;
    }

    const product = window.products.find(item => item.id === id);
    if (!product) return;

    currentProduct = product;

    $('detailsImage').src = product.image;
    $('detailsImage').alt = product.name;
    $('detailsImage').onerror = () => {
      $('detailsImage').removeAttribute('src');
      $('detailsImage').alt = product.emoji || 'Imagem indisponível';
    };

    $('detailsCategory').textContent = product.category;
    $('detailsTitle').textContent = product.name;
    $('detailsDescription').textContent = product.description;
    $('detailsPrice').textContent = formatPrice(product.price);

    const clothing = ['Roupas', 'Calçado', 'Crianças'].includes(
      product.category
    );

    const sizes = clothing
      ? (product.category === 'Calçado'
          ? ['36', '37', '38', '39', '40', '41', '42', '43', '44']
          : ['XS', 'S', 'M', 'L', 'XL', 'XXL'])
      : ['Tamanho único'];

    const sizeSelect = $('detailsSize');
    sizeSelect.innerHTML = '<option value="">Selecionar tamanho</option>';

    sizes.forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });

    const colors = ['Preto', 'Branco', 'Azul', 'Vermelho'];
    const colorSelect = $('detailsColor');
    colorSelect.innerHTML = '<option value="">Selecionar cor</option>';

    colors.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      colorSelect.appendChild(option);
    });

    $('detailsQuantity').value = '1';

    const childProduct = product.category === 'Crianças';

    $('detailsInformation').textContent =
      'Material: confirmar com o fornecedor. ' +
      'Cores, tamanhos e stock: confirmar antes da compra. ' +
      'Idade recomendada: consultar a informação do fabricante. ' +
      (childProduct
        ? 'Artigo infantil: confirmar o tamanho e os avisos de segurança ' +
          'indicados pelo fabricante.'
        : '') +
      ' Cuidados de conservação: seguir a etiqueta ou as instruções ' +
      'do fabricante. Os tamanhos e cores apresentados são opções ' +
      'demonstrativas, não uma confirmação de disponibilidade.';

    updateFavoriteButton();

    const related = window.products
      .filter(item =>
        item.id !== product.id &&
        item.category === product.category
      )
      .slice(0, 4);

    $('detailsRelated').replaceChildren();

    related.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.name;
      button.addEventListener('click', () => openDetails(item.id));
      $('detailsRelated').appendChild(button);
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('detailsSize').focus();
  }

  function closeDetails() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function updateFavoriteButton() {
    if (!currentProduct) return;

    const saved = favorites.includes(currentProduct.id);

    $('detailsFavorite').textContent = saved
      ? '♥ Remover dos favoritos'
      : '♡ Adicionar aos favoritos';
  }

  $('detailsFavorite').addEventListener('click', () => {
    if (!currentProduct) return;

    if (favorites.includes(currentProduct.id)) {
      favorites = favorites.filter(id => id !== currentProduct.id);
    } else {
      favorites.push(currentProduct.id);
    }

    try {
      localStorage.setItem(
        'thinkGlowFavorites',
        JSON.stringify(favorites)
      );
    } catch {
      // A loja continua utilizável mesmo se o armazenamento falhar.
    }

    updateFavoriteButton();
  });

  $('detailsAdd').addEventListener('click', () => {
    if (!currentProduct) return;

    const quantity = Number($('detailsQuantity').value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      alert('Escolhe uma quantidade entre 1 e 10.');
      return;
    }

    if (
      $('detailsSize').value === '' ||
      $('detailsColor').value === ''
    ) {
      alert('Seleciona o tamanho e a cor. As opções são demonstrativas.');
      return;
    }

    /*
     * O carrinho original ainda não guarda variantes.
     * Não fingimos que as escolhas foram registadas.
     */
    alert(
      'As opções foram selecionadas, mas o carrinho atual ainda não ' +
      'guarda tamanhos e cores. Vamos integrar essa função na próxima etapa.'
    );
  });

  modal.querySelector('.details-close')
    .addEventListener('click', closeDetails);

  modal.addEventListener('click', event => {
    if (event.target === modal) closeDetails();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeDetails();
  });

  /*
   * Torna as fotografias e os nomes dos artigos clicáveis.
   * O botão "+" existente continua a adicionar ao carrinho.
   */
  document.addEventListener('click', event => {
    const card = event.target.closest('.product-card');
    if (!card || event.target.closest('[data-add]')) return;

    const cards = [...document.querySelectorAll('.product-card')];
    const index = cards.indexOf(card);

    if (index < 0 || !Array.isArray(window.products)) return;

    const visibleProducts = window.products.filter(product => {
      const category = window.activeCategory || 'Todos';
      const search = $('searchInput')
        ? $('searchInput').value.trim().toLocaleLowerCase('pt')
        : '';

      const categoryMatches =
        category === 'Todos' || product.category === category;

      const text =
        `${product.name} ${product.category} ${product.description}`
          .toLocaleLowerCase('pt');

      return categoryMatches && text.includes(search);
    });

    if (visibleProducts[index]) openDetails(visibleProducts[index].id);
  });

  window.openProductDetails = openDetails;
})();
