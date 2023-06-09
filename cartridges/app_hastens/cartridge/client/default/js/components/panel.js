import loader from './loader';

export default class Panel {
    constructor(selector, options) {
        this.selector = selector;
        this.$panel = $(selector);
        this.$container = $('body > .page');

        this.settings = {
            duration: 350,
            loader: false,
        };

        this.settings = Object.assign(this.settings, options);

        this.state = {
            open: false,
        };

        if (this.settings.loader) {
            this.setLoading();
        }

        if ('panels' in window === false) {
            window.panels = [];
        }
        window.panels.push(this);

        this.events();
    }

    areThereAnyOpenPanels() {
        const openPanels = window.panels.filter((panel) => panel.state.open);

        return openPanels.length > 0;
    }

    observeLoad() {
        if (!this.$panel.length) {
            return;
        }

        // If observer already exists, disconnect and undefine
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }

        const config = { attributes: false, childList: true, subtree: false };

        const callback = (mutationsList, obsv) => {
            this.$panel.removeClass('loading');

            obsv.disconnect();
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(this.$panel.get(0), config);
    }

    events() {
        $(document)
            .on('click touchstart', (e) => {
                if ($(e.target).hasClass('page panel-open')) {
                    this.close();
                }
            })
            .on('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });

        $('body')
            .on('menu:open', () => {
                this.close();
            });
    }

    setLoading() {
        this.$panel.html($(`<div class="loader">${loader()}</div>`));
        this.$panel.addClass('loading');
        this.observeLoad();
    }

    open() {
        return new Promise((resolve, reject) => {
            if (this.isOpen()) {
                reject();
            } else {
                this.$container.addClass(`panel-open ${this.$panel.attr('data-id')}`);

                this.$panel
                    .show(0)
                    .addClass('show');

                setTimeout(() => {
                    this.$panel.aria('hidden', false);
                    this.state.open = true;
                    resolve(this);
                }, this.settings.duration);

                $('body').trigger('panel:open', this);
            }
        })
        .catch(() => {
            // Panel already open!
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.isOpen()) {
                reject();
            } else {
                this.$panel.addClass('hiding');

                if (!this.areThereAnyOpenPanels()) {
                    this.$container.addClass('hiding');
                }

                setTimeout(() => {
                    this.$panel.hide().removeClass('show hiding');
                    this.$container.removeClass(this.$panel.attr('data-id'));
                    this.$panel.aria('hidden', false);
                    this.state.open = false;
                    if (!this.areThereAnyOpenPanels()) {
                        this.$container.removeClass('panel-open hiding');
                    }
                    resolve(this);
                }, this.settings.duration);

                $('body').trigger('panel:close', this);
            }
        })
        .catch(() => {
            // Panel not currently open!
        });
    }

    setContent(html) {
        this.$panel.html($(html));
    }

    isOpen() {
        return !!this.state.open;
    }
}
