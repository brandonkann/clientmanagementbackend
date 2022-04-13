const Client = require('../models/Client');
// @desc    Get all Clients
// @route   GET /api/v1/clients
// @access  Private 
exports.getClients = async (req, res, next) => {
    try {
            //---- Advance Querying----///
        let query;
        // Copy req.query
        const reqQuery = {...req.query}; 
        // Create query string 
        let queryStr = JSON.stringify(reqQuery)

        // Fields to exclude
        const removeFields = ['select', 'sort', 'limit'];
        
        // Loop over removefields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]); 


        // Create operators ($gt, $gte, e.c.t)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match  => `$${match}`);

        // Finding resource 
        query = Client.find(JSON.parse(queryStr))

        // Select fields 
        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields)
        }

        //Sort 
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        }
        else {
            query = query.sort('-createdAt');
        }
        
        // Pagination
        const page = parseInt(req.query.page, 10) || 1; 
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await model.countDocuments();

        
        query = query.skip(startIndex).limit(limit); 

        if(populate) {
            query = query.populate(populate);
        }

        // Executing query
        const results = await query

        // Pagination result 
        const pagination = {};

        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1, 
                limit
            }
        }

        res.status(200).json({success: true, data: results})
        next()

    }
    catch(err) {
        res.status(400).json({success: false, msg: err})
    }
}
// @desc    Get a single cient by id
// @route   GET /api/v1/clients/:id
// @access  Private
exports.getClient = async (req,res, next) => {
    try {
        const client = await Client.findById(req.params.id);
        
        if (!client) {
            const id = req.params.id
            return res.stats(400),json({success: false})
        }
        res.status(200).json({success: true, data: client});
    } catch(err) {
        res.status(400).json({success: false, msg: err})
    }
}

// @desc    Get all clients for a specific user
// @route   GET /api/v1/clients/:userId
// @access  Private
exports.getClientById = async (req,res, next) => {
    try {
        const client = await Client.find({user : req.params.userId});
        
        if (!client) {
            const id = req.params.id
            return res.stats(400),json({success: false})
        }
        res.status(200).json({success: true, data: client});
    } catch(err) {
        res.status(400).json({success: false, msg: err})
    }
}

// @desc    Create a single Client
// @route   POST /api/v1/clients
// @access  Private 
exports.createClient = async (req, res, next) => {
    req.body.user = req.user.id
    try {
        const client = await Client.create(req.body);
        res.status(201).json({success: true, msg: client, data: `Client ${req.body.name} created` }) 
    } catch(err){    
        res.status(400).json({success: false, msg: err})
    }
}
// @desc    Update a client by id
// @route   PUT /api/v1/clients/:id
// @access  Private 
exports.updateClient = async (req, res, next) => {
    try {
        let client = await Client.findById(req.params.id);
        if (!client) {
            res.status(400).json({sucess: false})
        }

        if (client.user.toString() !== req.user.id) {
            return res.status(404).json({success: false, msg: "Not authorized to edit this client"})
        }

        client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success :true, data: client})
    } catch(err) {
        res.status(400).json({success: false, msg: err})
    }
}
// @desc    Delete a client by id 
// @route   Delete /api/v1/clients/:id
// @access  Private 
exports.deleteClient = async(req, res, next) => {
    try {
        let client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(400).json({success: false}) 
        }
        if (client.user.toString() !== req.user.id) {
            return res.status(404).json({success: false, msg: "Not authorized to delete this client"})
        }
        client = await Client.findByIdAndDelete(req.params.id);
        res.status(200).json({success: true, data: {}})
    }catch(err) {
        res.status(400).json({success: false, msg: err})
    }
}