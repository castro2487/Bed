import Panel from './components/panel';
import QtyInput from './components/qtyInput';

document.addEventListener('DOMContentLoaded', () => {
    const panel = new Panel('.uikit__panel');
    const qtyMax = $('.number-input').attr('max');
    const qtyInput = new QtyInput('.number-input', qtyMax);

    $('.open-uikit-panel').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        panel
            .open()
            .then((p) => {
                if (p) {
                    p.$panel.find('.close-uikit-panel').focus();
                }
            });
    });

    $('.close-uikit-panel').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        panel.close();
    });
});
