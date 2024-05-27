const express = require('express');
const app = express();
const courseData = require('./events.json');
const fs = require('fs');
const Validator = require('./helpers/validator');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const verifyToken = require('./middleware/authJWT');
const user = require('./models/user');
const PORT = 8000;
require('dotenv').config();
app.use(express.json());

app.post('/register', (req, res)=> {
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        role: req.body.role
    });
    user.save().then(data => {
        return res.status(200).json({message: "User registered successfully"});
    }).catch(err => {
        return res.status(500).json({error: err});
    });
});

app.post('/login', (req, res) => {
    let emailPassed = req.body.email;
    let passwordPassed = req.body.password;
    User.findOne({
        email: emailPassed
    }).then((user) => {
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        var isPasswordValid = bcrypt.compareSync(passwordPassed, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({
                message: "Invalid Password"
            });
        } else {
            var token = jwt.sign({
                id: user.id
            },  process.env.API_SECRET, {
                expiresIn: 86400
            });
            return res.status(200).send({
                user: {
                    id: user.id
                },
                message: "Login successful",
                accessToken: token
            });
        }
    }).catch(err => {
        
    })
});


app.get('/', (req, res) => {
    console.log(req);
    return res.status(200).send("Hello world");
});

app.get('/events', (req, res) => {
    return res.status(200).json(courseData);
})

app.get('/courses/:courseId', verifyToken, (req, res) => {
    if (req.user) {
        try {
            let airtribeCourses = courseData.airtribe;
            let courseIdPassed = req.params.courseId;
            let filteredCourse = airtribeCourses.filter(val => val.courseId == courseIdPassed);
            if(filteredCourse.length == 0) {
                return res.status(404).json("No appropriate course found with the provided course id");
            }
            return res.status(200).json(filteredCourse);
        } catch (error) {
            console.log(error);
            return res.status(500).json("Something went wrong while processing the request");
        }
    } else {
        return res.status(403).json({
            message: req.message
        });
    }
});

app.post('/courses/:courseId', (req, res) => {
    const userProvidedDetails = req.body;
    console.log(userProvidedDetails);
    let courseDataModified = courseData;
    courseDataModified.airtribe.push(userProvidedDetails);
    if (Validator.validateCourseInfo(userProvidedDetails).status == true) { 
        fs.writeFile('./courses.json', JSON.stringify(courseDataModified), {encoding: 'utf8', flag:'w'}, (err, data) => {
            if(err) {
                return res.status(500).send("Something went wrong while creating the course");
            } else {
                return res.status(201).send("Successfully created the course");
            }
        });
    } else {
        let message = Validator.validateCourseInfo(userProvidedDetails).message;
        return res.status(400).send(message);
    }
});

if (process.env.NODE_ENV != 'test') {
    try {
        console.log("Connect to Mango db");
        mongoose.connect("mongodb+srv://santoshmuktapuram:pANCmGeQbzBEaAaY@cluster0.45i4qss.mongodb.net/");
    } catch (err) {
        console.log("Failed while connecting to mongodb");
    }
}

app.listen(PORT, (err) => {
    if(err) {
        console.log("Error occured cant start the server");
    } else {
        console.log("Server started successfully");
    }
});


module.exports = app;

