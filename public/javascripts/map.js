document.addEventListener('DOMContentLoaded', () => {
    const geocode = campground.geometry.coordinates.reverse();
    const map = L.map('map').setView(geocode, 13); // 初期位置とズームレベルを設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // マーカーを追加する例
    L.marker(geocode).addTo(map)
        .bindPopup(`<div style="text-align: center; font-size: 16px;"><b>${campground.title}</b></div>`)
        .openPopup();
});
