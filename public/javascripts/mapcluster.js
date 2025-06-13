document.addEventListener('DOMContentLoaded', () => {
    const geoData = campgrounds.map(campground => ({
        title: campground.title,
        location: campground.location,
        coordinates: campground.geometry.coordinates
    }));

    const map = L.map('map').setView([37.5, 139.], 5); // 初期位置とズームレベルを設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const markers = L.markerClusterGroup({
        // spiderfyOnMaxZoom: false, // 最大ズーム時に展開
        // spiderfyDistanceMultiplier: 1.2, // 展開距離の倍率
        // maxClusterRadius: 80, // クラスタリングの半径（デフォルトは80）
        zoomToBoundsOnClick: false, // クリックでのズーム禁止
    });

    markers.on('clusterclick', function (cluster) {
        cluster.layer.bindPopup(`このクラスタには ${cluster.layer.getChildCount()} 件のキャンプ場があります`).openPopup();
    });

    geoData.forEach(campground => {
        const marker = L.marker(campground.coordinates.reverse())
            .bindPopup(`<h5>${campground.title}</h5><p>${campground.location}</p>`);
        markers.addLayer(marker);
    });

    map.addLayer(markers);
});
