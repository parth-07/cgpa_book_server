const express = require('express');
const {StatusCodes} = require('http-status-codes');

const ROOT = require(__dirname + '/../../config').ROOT;
const utility = require(ROOT + '/utility');
const {College} = require(ROOT + '/models').academia;
const academiaServices = require(ROOT + '/services/academia');
const CustomError = require(ROOT + '/CustomError');
const router = express.Router();
const academiaFields = require(ROOT + '/fields/academia');

const checkList = ['college', 'course', 'branch', 'semester'];

router.post('/semester', (req, res, next) => {
  const query = req.body;
  utility.requestUtil.ensureCertainFields(query, checkList);
  academiaServices
      .fillMissingData(query)
      .then((queryRes) => {
        return College.updateOne(
            {
              college: query['college'],
              courses: {
                $elemMatch: {
                  course: query['course'],
                  branches: {
                    $elemMatch: {
                      'branch': query['branch'],
                      'semesters.semester': {$ne: query['semester']['semester']},
                    },
                  },
                },
              },
            },
            {
              $push: {'courses.$[i].branches.$[j].semesters': query['semester']},
              $currentDate: {
                ...academiaServices.getDateUpdateDict('i', 'j'),
                ...{
                  ['courses.$[i].branches.$[j].' +
              academiaFields.TS_LAST_LIST_MODIFICATION]: true,
                },
              },
            },
            {
              arrayFilters: [
                {'i.course': query['course']},
                {'j.branch': query['branch']},
              ],
            },
        ).exec();
      })
      .then(academiaServices.checkDataFill)
      .then(() => {
      // res.sendStatus(StatusCodes.OK);
        res.sendStatus(StatusCodes.OK);
      })
      .catch(next);
});

router.get('/semester', (req, res, next) => {
  const query = req.query;
  utility.requestUtil.ensureCertainFields(query, checkList);
  College.findOne({college: query['college']})
      .exec()
      .then((college) => {
        if (!college) {
          return utility.responseUtil.sendEmptyDict(res);
        }
        const course = college.getCourse(query['course']);
        if (!course) {
          return utility.responseUtil.sendEmptyDict(res);
        }
        const branch = course.getBranch(query['branch']);
        if (!branch) {
          return utility.responseUtil.sendEmptyDict(res);
        }
        const semester = branch.getSemester(query['semester']);
        if (!semester) {
          return utility.responseUtil.sendEmptyDict(res);
        }
        utility.expressUtil.handleIfModifiedSince(
            req,
            res,
            semester.getLastModified(),
        );
        res.set(
            utility.httpUtil.headers.LAST_MODIFIED,
            semester.getLastModified(),
        );
        res.status(StatusCodes.OK).json(semester);
      })
      .catch(next);
});

router.get('/semester-list', (req, res, next) => {
  const query = req.query;
  utility.requestUtil.addMissingKeysToQuery(query, ['semester']);
  utility.requestUtil.ensureCertainFields(query, checkList);
  College.findOne({college: query['college']})
      .exec()
      .then((college) => {
        if (!college) {
          return utility.responseUtil.sendEmptyList(res);
        }
        const course = college.getCourse(query['course']);
        if (!course) {
          return utility.responseUtil.sendEmptyList(res);
        }
        const branch = course.getBranch(query['branch']);
        if (!branch) {
          return utility.responseUtil.sendEmptyList(res);
        }
        utility.expressUtil.handleIfModifiedSince(
            req,
            res,
            branch.getLastListModification(),
        );
        const semesterList = [];
        for (semester of branch.semesters) {
          semesterList.push(semester.semester);
        }
        semesterList.sort((a, b) => {
          return a - b;
        });
        res.set(
            utility.httpUtil.headers.LAST_MODIFIED,
            branch.getLastListModification(),
        );
        res.status(StatusCodes.OK).json(semesterList);
      })
      .catch(next);
});

module.exports = router;
