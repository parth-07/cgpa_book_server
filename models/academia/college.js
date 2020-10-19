const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const __ROOT = require(__dirname + '/../../config.js').__ROOT;
const courseSchema = require('./course.js');
const utility = require(__ROOT+'/utility');
const {findNeedle} = require('../../utility/array-util.js');

var collegeSchema = new Schema({
    college: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
    },
    abbreviation: {
        type: String,
        trim: true,
        minlength: 1
    },
    courses: [courseSchema],
    lastModified: {
        type: Date
    },
    lastListModification: {
        type: Date
    }
});

collegeSchema.path('courses').validate(utility.mongoose.validators.uniqueKeyVal('course'), "Course already exists", "Value Error");

collegeSchema.pre('validate', function (next) {
    // this.college = getTitleForm(this.college);
    if (!this.abbreviation) {
        this.abbreviation = getAbbreviation(this.college);
    }
    next();
})

collegeSchema.pre('save' , function(next) {
    next();
})

collegeSchema.methods.addToList = function (course) {
    this.courses.push(course);
    this.lastListModification = new Date();
}

collegeSchema.methods.courseID = function (courseName) {
    for (let course of this.courses) {
        if (course.course.match(courseName)) {
            return course._id;
        }
    }
    return -1;
}

collegeSchema.methods.getCourse = function (courseName) {
    if (courseName instanceof RegExp) {
        for (let course of this.courses) {
            if (course.course.match(courseName)) {
                return course;
            }
        }
    }
    else {
        return findNeedle(this.courses,courseName,true,'course');
    }
    return null
}

collegeSchema.methods.updateAncestorsLastModified = utility.mongoose.updateAncestorsLastModified;
collegeSchema.methods.updateLastModified = utility.mongoose.updateLastModified;
collegeSchema.methods.updateDescendantsLastModified = utility.mongoose.genUpdateDescendantsLastModified('courses');
collegeSchema.methods.updateRelevantLastModifieds = utility.mongoose.updateRelevantLastModifieds;
collegeSchema.methods.getLastModified = utility.mongoose.getLastModified;
collegeSchema.methods.getLastListModification = utility.mongoose.getLastListModification;

module.exports = collegeSchema;