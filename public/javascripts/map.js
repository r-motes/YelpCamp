document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([51.505, -0.09], 13); // 初期位置とズームレベルを設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // マーカーを追加する例
    L.marker([51.505, -0.09]).addTo(map)
        .bindPopup('A pretty popup.<br> Easily customizable.')
        .openPopup();
});
