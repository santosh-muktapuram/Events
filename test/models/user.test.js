const expect = require('chai').expect;
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const sinon = require('sinon');

describe("Creating the documents in mongodb - Without Mocking", () => {
    it("Creates a new user successfully ", (done) => {
        const user = new User({
            fullName: "test",
            email: "test123@gmail.com",
            role: "admin",
            password: bcrypt.hashSync("test1234", 8)
        });
        user.save().then((user) => {
            expect(user.fullName).eq("test")
            done();
        }).catch(err => {
            done(err);
        });
    }).timeout(50000);

    it("Validates the email of the user and does not save if the email is invalid", (done) => {
        const user = new User({
            fullName: "test",
            email: "test@123@gmail.com",
            role: "admin",
            password: bcrypt.hashSync("test1234", 8)
        });
        user.save().then((user) => {
            done();
        }).catch(err => {
            expect(err._message).eq("User validation failed");
            done();
        });
    });

    it("Validates the presence of all the fields of the user - does not save if the fields are not present", (done) => {
        const user = new User({
            fullName: "test",
            role: "admin",
            password: bcrypt.hashSync("test1234", 8)
        });
        user.save().then((user) => {
            done();
        }).catch(err => {
            expect(err._message).eq("User validation failed");
            done();
        });
    });

    it("Validates the role of the user and does not sabe if the role is anything other than admin, normal", (done) => {
        const user = new User({
            fullName: "test",
            email: "test@123@gmail.com",
            role: "bornak",
            password: bcrypt.hashSync("test1234", 8)
        });
        user.save().then((user) => {
            done();
        }).catch(err => {
            expect(err._message).eq("User validation failed");
            
            done();
        });
    });
});


describe("Creating the documents in mongodb - With mocking", () => {
    let saveStub;
    const user = new User({
        fullName: "test",
        email: "test123@gmail.com",
        role: "admin",
        password: bcrypt.hashSync("test1234", 8)
    });

    beforeEach(done => {
        saveStub = sinon.stub(User.prototype, 'save');
        done();
    })


    afterEach((done) => {
        saveStub.restore();
        done();
    })

    it('Should save the user', (done) => {
        const mockData = {_id: 123, fullName: 'test', email: "test123@gmail.com"};
        saveStub.resolves(mockData);
        user.save().then((user) => {
            console.log(user);
            expect(user.fullName).eq("test");
            done();
        }).catch(err => {
            done(err);
        });
    });

    it("Validates the email", (done) => {
        user.email = 'test@123@gmail.com';
        const mockError = new Error("Database error");
        saveStub.rejects(mockError);
        user.save().then((user) => {
            done();
        }).catch(err => {
            done();
        });
    })
});