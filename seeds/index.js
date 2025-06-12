const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    }).then(() => {
        console.log('MongoDBコネクションOK!!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
});

// ランダムな要素を配列から取得する関数
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() *2000) + 1000;
        const camp = new Campground({
            author: '6849007588a6fe289cf478e0',
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            price,
            images:   [ 
                {
                    url: 'https://res.cloudinary.com/dxt9nc5yj/image/upload/v1749697046/YelpCamp/goejgyoiddpw7lbgnkl9.jpg',
                    filename: 'YelpCamp/piu5cwmkso57m7rvlszd'
                },
                {
                    url: 'https://res.cloudinary.com/dxt9nc5yj/image/upload/v1749702320/YelpCamp/jf2tlrws55s0i488rayr.png',
                    filename: 'YelpCamp/iq72bbabt1ttqafuz2yw'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
