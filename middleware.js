const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
const axios = require('axios');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // ログイン後にリダイレクトするURLを保存
        req.flash('error', 'ログインしてください');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo; // テンプレートで使用できるようにする
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    }else {
        next();
    }
}

module.exports.validateAddress = async(req, res, next) => {
    const address = req.body.campground.location;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await axios.get(url);
    if (response.data.length === 0) {
        req.flash('error', '住所が検索できませんでした');
        if(req.params.id) {
            return res.redirect(`/campgrounds/${req.params.id}/edit`);
        }
        return res.redirect(`/campgrounds/new`);
    }else {
        const { lat, lon } = response.data[0];
        req.body.geocode = { lat: parseFloat(lat), lng: parseFloat(lon) }; // 緯度・経度を保存
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'そのアクションの権限がありません');
        return res.redirect(`/campgrounds/${id}`);
    };
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    }else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'そのアクションの権限がありません');
        return res.redirect(`/campgrounds/${id}`);
    };
    next();
}
