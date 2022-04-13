const Task = require('../models/Task');
const Client = require('../models/Client');
const sendEmail = require('../utils/sendEmail');
// @desc    Get all task by id 
// @routes  GET /api/v1/clients/:clientId/tasks
// @access  Private 
exports.getTasks = async(req, res, next) => {
    console.log(req.params['clientId'])
    if (req.params.clientId) {
        try {
            const tasks = await Task.find({ client : req.params.clientId});
            return res.status(200).json({
                success: true, 
                data: tasks
            })
        } catch(err) {
            return res.status(400).json({
                success: false, 
                msg: err
            })
        }
    }
    else {
        return res.status(400).json({success: false, msg: "Please provide a client id"})
    }
}
// @desc    Add a single Task
// @route   POST /api/clients/:clientId/task
// @access  Private 
exports.addTask = async(req,res,next) => {
    req.body.user = req.user.id
    req.body.client = req.params.clientId
    try {
        const client = await Client.findById(req.params.clientId);

        if (!client) {
            return res.status(400).json({
                success: false,
                msg: `No client with id of ${req.params.clientId} found`
            })
        }
        const task = await Task.create(req.body);
        return res.status(200).json({ success : true, data: task})
    } catch(err) {
        return res.status(401).json({success: true, msg: err})
    }
}
// @desc    Update a task by id
// @route   PUT /api/tasks/:taskId 
// @access  Private
exports.updateTask = async(req, res, next) => {
    console.log(req.params.taskId)
    try {
        let task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(400).json({
                success: false,
                msg: `No task with id ${req.params.taskId} `
            })
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({success: false, msg: "Not authorized to update this task"})
        }

        task = await Task.findByIdAndUpdate(req.params.taskId, req.body, {
            runValidators: true,
            new: true
        });
        res.status(200).json({
            success: true, 
            data: task
        })
    } catch(err) {
        return res.status(400).json({success: false, msg : err})
    }
}
// @desc    Delete a task by id 
// @route   Delete /api/v1/tasks/:taskId
// @access  Private
exports.deleteTask = async(req, res, next) => {
    try {
        let task = await Task.findById(req.params.taskId);
        if(!task) {
            return res.status(400).json({
                success: false,
                data: {}
            })
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({success: false, msg: "Not authorized to update this task"})
        }    

        task = await Task.findByIdAndDelete(req.params.taskId);
        res.status(200).json({success: true, data: {}})
    }catch(err) {
        return res.status(400).json({
            success: false,
            msg: err
        })
    }
}

// @desc    Send a task reminder email
// @route   POST /api/v1/task/reminder/:taskId
// @access  Private
exports.taskRemind = async(req,res, next) => {
    try {
        let task = await Task.findById(req.params.taskId);
        user = req.user.name
        message = `Hi ${req.user.name}, this is a friendly reminder that task: ${task.name} requires attention and will be due on ${task.dueDate}`
        
        try {
            await sendEmail({
                email: req.user.email,
                subject: `Task ${task.name} Reminder`,
                message: message
            })

            res.status(200).json({success: true, data: ' Task reminder Email Sent'});
        }catch(err) {
            return res.status(400).json({
                success: false,
                msg: "Failed to send"
            })
        }
        
    } catch(err) {
        return res.status(400).json({
            success: false,
            err: err
        })
    }
}





