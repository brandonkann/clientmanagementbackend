const express = require('express');
const {getClients, getClient, createClient, updateClient, deleteClient, getClientById} = require('../controllers/clients');

const router = express.Router();

const {protect} = require('../middleware/auth')

// Include other resource routers:
const taskRouter = require('./tasks')

// Reroute into other resource routers:
router.use('/:clientId/tasks', taskRouter);

router.route('/')
    .post(protect, createClient)
    .get(protect, getClients)

router.route('/:id')
    .get(protect, getClient)
    .put(protect, updateClient)
    .delete(protect, deleteClient);

router.route('/user/:userId')
    .get(protect, getClientById);


module.exports = router
