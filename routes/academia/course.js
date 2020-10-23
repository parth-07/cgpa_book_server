const express = require('express');
const {StatusCodes} = require('http-status-codes');

const ROOT = require(__dirname + '/../../config.js').ROOT;
const utility = require(ROOT+'/utility');
const {College} = require(ROOT+'/models');
const academiaHelpers = require('../academia-helpers.js');
let router = express.Router();

let checkList = ['college','course'];

router.post('/course', (req, res, next) => {
    let query = req.body;
    utility.requestUtil.checkQuery(query,checkList);
    College.findOne({ college: query['college'] })
        .then((college) => {
            utility.mongooseUtil.checkExistence(college, 'college');
            college.addToList(query['course']);
            let course = college.getCourse(query['course']['course']);
            course.updateRelevantLastModifieds();
            return college.save()
        })
        .then((doc) => {
            res.sendStatus(StatusCodes.OK);
        })
        .catch(next);
})

router.get('/course', (req, res, next) => {
    let query = req.query;
    utility.requestUtil.checkQuery(query, checkList);
    College.findOne({ college: query['college'] })
        .then((college) => {
            if (!college) {
                return sendEmptyDict(res);
            }
            let course = college.getCourse(query['course']);
            if(! course) {
                return sendEmptyDict();
            }
            utility.expressUtil.handleIfModifiedSince(req,res,course.getLastModified());
            res.append(httpHelpers.HEADER_LAST_MODIFIED, course.getLastModified());
            res.status(StatusCodes.OK).json(course);
        })
        .catch(next);
})

router.get('/course-list', (req, res, next) => {
    let query = req.query;
    utility.requestUtil.addMissingKeysToQuery(query, ['course','branch']);
    utility.requestUtil.checkQuery(query, checkList);
    let courseList = [];

    College.findOne({ college: query['college'] })
        .then((college) => {
            if (!college) {
                return sendEmptyList(res);
            }
            utility.expressUtil.handleIfModifiedSince(req,res,college.getLastListModification());
            for (course of college.courses) {
                if (!course.course.match(query['course']))
                    continue;
                let branch = course.getBranch(query['branch'])
                if (!branch && !(''.match(query['branch'])))
                    continue;
                let courseName = course.course;
                if (course.abbreviation)
                    courseName += " (" + course.abbreviation + ")";
                courseList.push(courseName);
            }
            res.append(httpHelpers.HEADER_LAST_MODIFIED,college.getLastListModification());
            res.status(StatusCodes.OK).json(courseList);
        })
        .catch(next)
})

module.exports = router;