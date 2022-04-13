const express = require('express');
const {getTasks, addTask, updateTask, deleteTask, taskRemind} = require("../controllers/task")



const router = express.Router({mergeParams:true});

const {protect} = require('../middleware/auth')

router.route('/').get(protect, getTasks).post(protect, addTask)

router.route('/:taskId').put(protect, updateTask).delete(protect, deleteTask)

router.route('/reminder/:taskId').post(protect, taskRemind)


module.exports = router

