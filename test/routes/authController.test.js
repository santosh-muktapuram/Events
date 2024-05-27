process.env.NODE_ENV = 'test';
let chai = require('chai');
let expect = require('chai').expect;
const server = require('../../app');
let chaiHttp = require('chai-http');
const { sign } = require('jsonwebtoken');
chai.use(chaiHttp);

describe('Verifies the signup flow with the actual mongo db calls', () => {
    let signupBody = {
        fullName: "test",
        email: "test123@gmail.com",
        role: "admin",
        password: "test1234"
    }
    it('Successful signup of the user', (done) => {
        chai.request(server).post('/register').send(signupBody).end((err, res) => {
            expect(res.status).eq(200);
            expect(res.body.message).equal('User registered successfully');
            done();
        });
    });

    it("Email validation fails", (done) => {
        signupBody.email = 'test@123@gmail.com';
        chai.request(server).post('/register').send(signupBody).end((err, res) => {
            expect(res.status).eq(500);
            expect(res.body.error.message).equal('User validation failed: email: test@123@gmail.com is not a valid email!');
            done();
        });
    });
});


describe("Verifies the sign in flow with the actual mongo db calls", () => {
    beforeEach((done) => {
        let signupBody = {
            fullName: "test",
            email: "test123@gmail.com",
            role: "admin",
            password: "test1234"
        }
        chai.request(server).post('/register').send(signupBody).end((err, res) => {
            done();
        });
    });

    it("successful sign in", (done) => {
        let signInBody = {
            email: "test123@gmail.com",
            password: "test1234"
        };
        chai.request(server).post('/login').send(signInBody).end((err, res) => {
            expect(res.status).eq(200);
            expect(res.body.user).to.have.property("id");
            expect(res.body.message).eq("Login successful");
            expect(res.body).to.have.property("accessToken");
            done();
        });
    });

    it("Invalid password", (done) => {
        let signInBody = {
            email: "test123@gmail.com",
            password: "test12345555555"
        };
        chai.request(server).post('/login').send(signInBody).end((err, res) => {
            expect(res.status).eq(401);
            expect(res.body.message).eq("Invalid Password");
            expect(res.body.accessToken).to.be.undefined;
            done();
        });
    });

    it("User does not exist", (done) => {
        let signInBody = {
            email: "pawan@gmail.com",
            password: "test12345555555"
        };
        chai.request(server).post('/login').send(signInBody).end((err, res) => {
            expect(res.status).eq(404);
            expect(res.body.message).eq("User not found");
            expect(res.body.accessToken).to.be.undefined;
            console.log(res.body);
            done();
        });
    });
});

describe("Fetches the course info", () => {
    let jwt = '';
    beforeEach((done) => {
        let signupBody = {
            fullName: "test",
            email: "test123@gmail.com",
            role: "admin",
            password: "test1234"
        }
        let signInBody = {
            email: "test123@gmail.com",
            password: "test1234"
        };
        
        chai.request(server).post('/register').send(signupBody).end((err, res) => {
            chai.request(server).post('/login').send(signInBody).end((err, res) => {
                jwt = res.body.accessToken;
                done();
            });
        });
        
    })

    it("Validates the token and the user and gets a course ", (done) => {
        chai.request(server).get('/courses/2').set('authorization', jwt).end((err, res) => {
            expect(res.status).equal(200);
            done();
        });
    });

    it("Invalid token passed by user should not allow access to the course endpoint", (done) => {
        chai.request(server).get('/courses/2').set('authorization', "abcdegg").end((err, res) => {
            expect(res.status).equal(403);
            done();
        });
    });

    it("no authorization header should not allow access to the endpoint", (done) => {
        chai.request(server).get('/courses/2').end((err, res) => {
            expect(res.status).equal(403);
            console.log(res.body);
            done();
        });
    });
});