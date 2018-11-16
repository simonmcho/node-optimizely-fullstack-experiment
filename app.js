const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const createError = require('http-errors');

// We need to grab the datafile from optimizely's CDN
const optimizely = require('@optimizely/optimizely-sdk');
const axios = require('axios');
const getRandomHash = require('./services/get-random-hash');
const datafile = 'https://cdn.optimizely.com/datafiles/HMVpmt3ks7ue5uam1t4FLz.json';

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => { 
    axios.get(datafile)
        .then(response => {
            
            // Create client instance of optimizely SDK with the datafile
            const optimizelyClientInstance = optimizely.createInstance({ datafile: response.data });
            
            const experimentKey = 'simon-fullstack-example'; // Experiment key is name of your fullstack experiment in optimizely
            const optimizely_user_id = req.cookies.optimizely_user_id || getRandomHash(); // If cookie doesn't exist, generate random hash for cookie value
            const attributes = { url: req.originalUrl }; //

            res.cookie('optimizely_user_id', optimizely_user_id); // Set cookie value with generated value
            // req.optimizely_bucket_id = optimizely_bucket_id; // Set cookie value to request object ?? Need this??

            const variation = optimizelyClientInstance.activate(experimentKey, optimizely_user_id); // Activate test for user

            //console.log(`User ${optimizely_user_id} is in variation: ${variation}`);
            res.locals.variation = variation; // Initializez to locals object for res object so middleware functions can access it

            // next();
            res.render('index', { title: 'EXPRESS HI!!!', variation });
        })
        .catch(err => console.log(err));
})




// Error handler
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// PORT FOR SERVER 
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`SERVER RUNNING ON PORT${port}`));