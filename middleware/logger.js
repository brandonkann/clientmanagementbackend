// Logs request to console
const logger = (req, res, next) => {
    req.hello = 'Hello world'
    console.log('Middleware ran');
    next()
}

module.exports = logger