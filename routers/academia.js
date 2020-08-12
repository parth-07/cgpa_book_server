const express = require('express');
const { College } = require('../models/index.js');
const courseSchema = require('../models/college/course.js');

var router = express.Router();

router.post('/college', (req, res, next) => {
    college = new College(req.body);
    college.save()
        .then((doc) => {
            res.sendStatus(200);
        })
        .catch(next);
})

router.get('/college', (req, res, next) => {
    College.findOne(req.body)
        .then((college) => {
            res.status(200).json(college);
        })
        .catch(next);
})

router.post('/branch', (req, res, next) => {
    let collegeName = req.body['college'];
    let courseName = req.body['course'];
    let branch = req.body['branch'];
    College.findOne({ college: collegeName })
        .then((college) => {
            let course = college.getCourse(courseName);
            branches = course.branches;
            branches.push(branch);
            return college.save()
        })
        .then((doc) => {
            res.sendStatus(200);
        })
        .catch(next);
})

module.exports = router;
