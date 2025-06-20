if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => {
    console.log('MongoDBコネクションOK!!');
})
.catch(err => {
    console.log('MongoDBコネクションエラー!!!');
    console.log(err);
});

const app = express();

app.engine('ejs', ejsMate);// EJSのテンプレートエンジンをejsMateで拡張
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_',
}));// SQLインジェクション対策

const sessionConfig = {
    name: 'session', // cookieの名前を指定
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // JavaScriptからcookieにアクセスできないようにする
        // secure: true, // 本番環境ではHTTPSを使用する場合に有効にする
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7日間有効;
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());// app.use(session(sessionConfig))の後に書く。
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false
}));// セキュリティ対策のためにHelmetを使用

app.use((req, res, next) => {
    res.locals.currentUser = req.user;// リクエストのライフサイクルの間、どこのテンプレートでもcurrentUserを参照できるようにする。
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.get('/', (req, res) => {
    res.render('home');
});

// ベースパスは今回はいらない('/')
app.use('/', userRoutes);
// campgroundsのルーティングをcampgroundsRoutesに分離
app.use('/campgrounds', campgroundsRoutes);
// reviewsのルーティングをreviewsRoutesに分離
app.use('/campgrounds/:id/reviews', reviewsRoutes);// 親側に:idが存在する場合は、子のrouterで{mergeParams: true}とする必要がある。


app.all('*', (req, res, next) => {
    next(new ExpressError('ページが見つかりません', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log("リクエストを受付中");
});
