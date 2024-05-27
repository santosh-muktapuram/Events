const expect = require('chai').expect;
const validator = require('../../helpers/validator');
let courseDetails = {
    "course": "test",
    "courseId": 100,
    "cohort": 1,
    "college": "LPU",
    "semester": 2,
    "instructor": "test",
    "studentsVoted": 0,
    "averageRating": 0
};

describe('Testing the validate course info functionality', function() {
    it("1.validating the course info - validates the course info successfully and add the course", (done) => {
        let response = validator.validateCourseInfo(courseDetails);
        expect(response.status).equal(true);
        expect(response.message).equal("Validated successfully");
        done();
    });

    it("2. validating the course info - Fails if the course info is malformed", (done) => {
        let response = validator.validateCourseInfo({});
        expect(response.status).equal(false);
        expect(response.message).equal("Course info is malformed, please provide all the parameters");
        done();
    })
});