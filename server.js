const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger')
const morgan = require('morgan')
const colors = require('colors')
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
// Route files:
const clients = require('./routes/clients');
const tasks = require('./routes/tasks')
const auth = require('./routes/auth')


// load env vars:
dotenv.config({path: './config/config.env'});

// Connect to database
connectDB();


const app = express();

app.use(cookieParser());

// Body parser used to retreive json from body 
app.use(express.json());


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


//Mount Routers
app.use('/api/v1/clients', clients)
app.use('/api/v1/tasks', tasks)
app.use('/api/v1/auth', auth)




const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} on port ${PORT}`.green.underline));


// Handle unhandled promise rejections 
process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & Exit process 
    server.close(() => process.exit(1))
})