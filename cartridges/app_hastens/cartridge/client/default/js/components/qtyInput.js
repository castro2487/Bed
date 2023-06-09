import ISpin from 'ispin';

export default class QtyInput {
    constructor(selector, qtyMax) {
        this.selector = selector;
        this.qtyMax = qtyMax;
        this.loopElements();
    }

    setInit(element) {
        let spinner = new ISpin(element, {
            wrapperClass: 'ispin-wrapper',
            buttonsClass: 'ispin-button',
            step: 1,
            min: 1
        });
        spinner._buttons.inc.setAttribute('aria-label', 'Increment quantity');
        spinner._buttons.dec.setAttribute('aria-label', 'Decrement quantity');
    }

    loopElements() {
        let qty = document.querySelectorAll(this.selector), i;
        for (i = 0; i < qty.length; ++i) {
          this.setInit(qty[i]);
        };
    }
}
