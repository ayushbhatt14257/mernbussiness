const mongoose = require('mongoose');

const DB = process.env.DATABASE

mongoose.connect(DB).then(() => {
    console.log('connection succefull to db')
}).catch((err) => console.log(err));