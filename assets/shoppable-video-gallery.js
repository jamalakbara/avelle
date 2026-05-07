import { DialogComponent, DialogCloseEvent } from '@theme/dialog';
import { supportsViewTransitions, startViewTransition, prefersReducedMotion } from '@theme/utilities';
import { CartAddEvent, CartErrorEvent } from '@theme/events';

class ShoppableVideoGallery extends DialogComponent {
  connectedCallback() {
    super.connectedCallback();
    this.#initScrollReveal();
    this.addEventListener('click', this.#handleAtcClick);
    this.addEventListener(DialogCloseEvent.eventName, this.#stopVideo);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#io?.disconnect();
    this.#stopVideo();
    this.removeEventListener('click', this.#handleAtcClick);
    this.removeEventListener(DialogCloseEvent.eventName, this.#stopVideo);
  }

  /** @type {IntersectionObserver|undefined} */
  #io;

  #initScrollReveal() {
    const cards = [...this.querySelectorAll('.ugc-card')];

    if (!('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('is-visible'));
      return;
    }

    this.#io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          this.#io?.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach((c) => this.#io?.observe(c));
  }

  #handleAtcClick = (event) => {
    const btn = /** @type {HTMLElement} */ (event.target).closest('.ugc-atc-btn');
    if (!btn || /** @type {HTMLButtonElement} */ (btn).disabled) return;
    event.preventDefault();
    this.#addToCart(/** @type {HTMLButtonElement} */ (btn));
  };

  async #addToCart(btn) {
    const item = btn.closest('.ugc-product-item');
    const select = /** @type {HTMLSelectElement|null} */ (item?.querySelector('.ugc-variant-select'));
    const variantId = select ? select.value : btn.dataset.variantId;

    if (!variantId) return;

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Adding…';

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ id: Number(variantId), quantity: 1 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.description || res.statusText);
      }

      const cartData = await res.json();

      document.dispatchEvent(
        new CartAddEvent(cartData, 'shoppable-video-gallery-component', {
          itemCount: 1,
          variantId,
        })
      );

      btn.textContent = 'Added!';
      btn.classList.add('ugc-atc-btn--added');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('ugc-atc-btn--added');
        btn.disabled = false;
      }, 2000);
    } catch (error) {
      document.dispatchEvent(
        new CartErrorEvent('shoppable-video-gallery-component', error.message, {}, {})
      );

      btn.textContent = 'Error — Retry';
      btn.classList.add('ugc-atc-btn--error');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('ugc-atc-btn--error');
        btn.disabled = false;
      }, 2500);
    }
  }

  openModal = async (event) => {
    const card = /** @type {HTMLElement} */ (event.target).closest('.ugc-card');
    if (!card) return;

    const { blockId, videoSrc } = /** @type {HTMLElement} */ (card).dataset;
    this.#loadProducts(blockId);
    this.#loadVideo(videoSrc);

    if (supportsViewTransitions() && !prefersReducedMotion()) {
      const thumb = card.querySelector('.ugc-card__thumbnail');
      const videoPaneEl = this.refs.dialog?.querySelector('.ugc-modal__video-pane');

      if (thumb instanceof HTMLElement && videoPaneEl instanceof HTMLElement) {
        thumb.style.viewTransitionName = 'ugc-hero';
        await startViewTransition(() => {
          thumb.style.viewTransitionName = '';
          videoPaneEl.style.viewTransitionName = 'ugc-hero';
          this.showDialog();
        });
        videoPaneEl.style.viewTransitionName = '';
        return;
      }
    }

    this.showDialog();
  };

  #currentSrc = '';

  #loadVideo(src) {
    const { modalVideo } = this.refs;
    if (!(modalVideo instanceof HTMLVideoElement) || !src) return;

    if (src === this.#currentSrc) {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
      return;
    }

    this.#currentSrc = src;
    modalVideo.pause();
    modalVideo.src = src;
    modalVideo.load();

    const play = () => {
      modalVideo.play().catch(() => {});
      modalVideo.removeEventListener('canplay', play);
    };
    modalVideo.addEventListener('canplay', play);
  }

  #stopVideo = () => {
    const { modalVideo } = this.refs;
    if (!(modalVideo instanceof HTMLVideoElement)) return;
    modalVideo.pause();
    modalVideo.src = '';
    this.#currentSrc = '';
  };

  #loadProducts(blockId) {
    const { productsContainer } = this.refs;
    if (!(productsContainer instanceof HTMLElement) || !blockId) return;

    const panel = this.querySelector(`[data-panel-id="${blockId}"]`);
    if (!panel) return;

    productsContainer.innerHTML = panel.innerHTML;
  }
}

if (!customElements.get('shoppable-video-gallery-component')) {
  customElements.define('shoppable-video-gallery-component', ShoppableVideoGallery);
}
