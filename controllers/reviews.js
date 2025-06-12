const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id); 
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'レビューを登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {review: reviewId } });// キャンプ場からレビューのIDを削除
    await Review.findByIdAndDelete(req.params.reviewId);// レビュー自体を削除
    req.flash('success', 'レビューを削除しました');
    res.redirect(`/campgrounds/${id}`);
};
