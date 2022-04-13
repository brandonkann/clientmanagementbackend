const mongoose = require('mongoose');


const TaskSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Please add a name for this task"],
        maxlength: 100,
    },
    descrption: {
        type: String,
        required: false,
        maxlength: 200
    },
    dueDate : {
        type: String,
        required: [true, "Please add a Date"] 
    },
    urgency: {
        type: String,
        required: [true, "Please add an urgency"],
        enum: ['low', 'medium', 'high'] 
    },
    createdOn : {
        type: Date,
        default: Date.now
    },
    client: {
        type: mongoose.Schema.ObjectId,
        ref: 'Client',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
     
})

module.exports = mongoose.model("Task", TaskSchema);