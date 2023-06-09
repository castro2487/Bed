export default function(url: string) {
    window.history.pushState({}, null, url);
    window.dispatchEvent(new Event('hastens:pushstate'));
}
