export function getCookie(name: string): string {
    const cookie = window.document.cookie.split(';').filter((item) => {
        return item.trim().indexOf(name + '=') === 0;
    });

    return cookie.length ? cookie[0].split('=')[1] : null;
}

export function setCookie(name: string, value: string, exdays: number) {
    const date = new Date();
    date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    window.document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}
