const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


beforeEach((done) => {
    console.log("Running once before each unit tests");
    mongoose.connection.collections.users.drop(() => {
        done();
    });
});

before((done) => {
    console.log("Running once before all unit tests");
    try {
        mongoose.connect("mongodb://localhost:27017/usersTestDB");
        console.log("Successfully connected to the db");
        done();
    } catch (err) {
        console.log("Failed while connecting to mongodb");
        done();
    }
});



afterEach((done) => {
    console.log("Running once after each unit tests");
    mongoose.connection.collections.users.drop(() => {
        done();
    });
});

after((done) => {
    console.log("Running once after all unit tests");
    mongoose.disconnect();
    done();
});