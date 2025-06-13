const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const ExpressError = require('../utils/ExpressError');
const axios = require('axios');

// 住所をジオコーディングして緯度経度を取得する関数
async function geocodeCampgroundAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;// クエリの住所をURI用にエンコード
    try {
        const response = await axios.get(url);
        if (response.data.length > 0) {// 住所の検索が上手くいかないとresponse.dataは空の配列で返る
            const { lat, lon } = response.data[0];
            return { lat: parseFloat(lat), lng: parseFloat(lon) };
        } else {
            throw new ExpressError(400, '住所が見つかりませんでした');
        }
    } catch (error) {
        console.error('ジオコーディングエラー:', error);
        return null;
    }
}

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};


module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author');
    if(!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};


module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    // 新規登録時にgeocodeを取得し、データベースにGeoJSONで保存しておく。
    const geocode = await geocodeCampgroundAddress(campground.location);
    const GeoJson = {
        type: 'Point',
        coordinates: [geocode.lng, geocode.lat] // OpenStreetMapの座標は[経度, 緯度]の順
    }
    campground.geometry = GeoJson;
    await campground.save();
    req.flash('success', '新しいキャンプ場を登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground}, {new: true});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    const geocode = await geocodeCampgroundAddress(campground.location);
    campground.geometry = {
        type: 'Point',
        coordinates: [geocode.lng, geocode.lat] // OpenStreetMapの座標は[経度, 緯度]の順
    };
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: {filename: {$in: req.body.deleteImages} } }});
    }
    req.flash('success', 'キャンプ場を更新しました');
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました');
    res.redirect("/campgrounds");
};
