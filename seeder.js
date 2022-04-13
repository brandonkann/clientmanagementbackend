const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//load env vars 
dotenv.config({path: './config/config.env'});

//load models
const Client = require('./models/Client')
const Task = require('./models/Task')
//Connect to DB:
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
});

// Read JSON file:
const clients = JSON.parse(fs.readFileSync(`${__dirname}/_data/clients.json`, 'utf-8'));
const tasks = JSON.parse(fs.readFileSync(`${__dirname}/_data/tasks.json`, 'utf-8'));
const importData = async () => {
    try {
        await Client.create(clients);
        await Task.create(tasks);
        console.log('Data imported'.green.inverse)
        process.exit(); 
    } catch(err) {
        console.error(err)
    }
}

// Delete data: 
const deleteData = async () => {
    try {
        await Client.deleteMany();
        await Task.deleteMany();
        console.log('Data destroyed'.red.inverse)
        process.exit(); 
    } catch(err) {
        console.error(err)
    }
}

if(process.argv[2] === '-i') {
    importData();
}

else if(process.argv[2] === '-d') {
    deleteData()
}



