const mongoose = require('mongoose');
const slugify = require('slugify');

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a client name"],
        trim: true, 
        maxlength: [50, "Name can not be more than 50 characters"]
    },
    slug: String,
    clientDescription : {
        type: String, 
        required: [true, "Please add a client descrption"],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match:  [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'Please add a valid email']
    },
    occupation: {
        type: String,
        required: [true, "Please add an occupation for this client"]
    },
    clientPriority: {
        type: String,
        required: true,
        enum: ["low", "medium", "high"]
    },
    address: {
        type: String,
        required: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})

// Create client slug from name
ClientSchema.pre('save', function(next) {
    console.log('Suglify ran', this.name)
    this.slug = slugify(this.name, {lower: true});
    next();    
})

module.exports = mongoose.model("Client", ClientSchema);


