/* 
COMP 4513-002
Assignment 1 

Jon Maquio 
*/



const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://dfnpsugvwgrgbugddzdb.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbnBzdWd2d2dyZ2J1Z2RkemRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg2NDQzMjgsImV4cCI6MjAyNDIyMDMyOH0.QfpP8lWngSrEXk46LvQbkMJHkwHLnVmkJd22kGMkzf8';

const supabase = supa.createClient(supaUrl, supaAnonKey);


const port = process.env.PORT // Glitch's default port is 3000
const host = '0.0.0.0'; // listen on any available interface
console.log(`Server running on port ${port}`);
app.listen(port, host, () => {
    console.log(`Server running on port ${port}`);
});


/* 
API 1

Returns the seasons supported by the API (that is, all the
data in the seasons table)
 */
app.get('/api/seasons', async (req, res) => {
    const {data, error} = await supabase
    .from('seasons')
    .select();

    res.send(data);
}); 

/* 
API 2

Returns all the circuits
 */
app.get('/api/circuits', async (req, res) => {
    const {data, error} = await supabase
    .from('circuits')
    .select();

    res.send(data);
}); 

/*
API 3

Returns just the specified circuit (use the circuitRef field)
 */
app.get('/api/circuits/:circuitRef', async (req, res) => {
    const {data, error} = await supabase
    .from('circuits')
    .select()
    .eq('circuitRef',req.params.circuitRef);
    
    handleData(res, data, error, "Circuit not found.");
}); 

/*
API 4

Returns the circuits used in a given season (order by round
in ascending order)
 */
app.get('/api/circuits/season/:year', async (req, res) =>{
    const {data, error} = await supabase
    .from('races')
    .select('circuits (*), year')
    .eq('year', req.params.year)
    .order('round', { ascending: true });

    handleData(res, data, error, "Circuits not found.");
});

/*
API 5

Returns all the constructors
 */
app.get('/api/constructors', async (req, res) => {
    const {data, error} = await supabase
    .from('constructors')
    .select();

    res.send(data);
}); 

/*
API 6

Returns just the specified constructor (use the
constructorRef field)
 */
app.get('/api/constructors/:constructorRef', async (req, res) => {
    const { data, error } = await supabase
    .from('constructors')
    .select()
    .eq('constructorRef', req.params.constructorRef);
    
    handleData(res, data, error, "Constructor not found.");
}); 

/*
API 7

Returns all the drivers
 */
app.get('/api/drivers', async (req, res) => {
    const {data, error} = await supabase
    .from('drivers')
    .select();

    res.send(data);
}); 

/*
API 8

Returns just the specified driver (use the driverRef field)
(Added extra case insensitivity)
 */
app.get('/api/drivers/:driverRef', async (req, res) => {
    const driverRef = req.params.driverRef;

    const { data, error } = await supabase 
    .from('drivers')
    .select()
    .eq('driverRef', driverRef.toLowerCase());

    handleData(res, data, error, "Driver not found.");
});


/*
API 9

Returns the drivers whose surname (case insensitive) begins
with the provided subString
 */
app.get('/api/drivers/search/:subString', async (req, res) => {
    const subString = req.params.subString.toLowerCase();

    const { data, error } = await supabase
    .from('drivers')
    .select()
    .ilike('surname', `${subString}%`); // 'ilike' is a case insensitive 'like'

    handleData(res, data, error, "Driver(s) not found.");
});

/*
API 10

Returns the drivers within a given race
 */
app.get('/api/drivers/race/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select('drivers (*)')
    .eq('raceId', req.params.raceId);

    handleData(res, data, error, "Drivers not found.");
});

/*
API 11

Returns just the specified race. Don’t provide the foreign key
for the circuit; instead provide the circuit name, location,
and country
 */
app.get('/api/races/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select('*, circuitId:circuits(name, location, country)')
    .eq('raceId', req.params.raceId);

    handleData(res, data, error, "Race not found.");
});

/*
API 12

Returns the races within a given season ordered by round
 */
app.get('/api/races/season/:year', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select()
    .eq('year', req.params.year)
    .order('round');

    handleData(res, data, error, "Races not found.");
});

/*
API 13

Returns a specific race within a given season specified by the
round number
 */
app.get('/api/races/season/:year/:round', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select()
    .eq('year', req.params.year)
    .eq('round', req.params.round);

    handleData(res, data, error, "Race not found.");
});

/*
API 14

Returns all the races for a given circuit (use the circuitRef
field), ordered by year
 */
app.get('/api/races/circuits/:circuitRef', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select(`*, circuits!inner (circuitRef, name)`)
    .eq('circuits.circuitRef', req.params.circuitRef)
    .order('year');

    handleData(res, data, error, "Races not found.");
});

/*
API 15

Returns all the races for a given circuit between two years
(include the races in the provided years)
 */
app.get('/api/races/circuits/:circuitRef/season/:startYear/:endYear', async (req, res) => {
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);

    if (yearCheck(res, startYear, endYear)) {
        return; // stop further execution due to bad request
    }

    const { data, error } = await supabase
    .from('races')
    .select('*, circuits!inner (circuitRef, name)')
    .eq('circuits.circuitRef', req.params.circuitRef)
    .gte('year', startYear) // greater than or equal to
    .lte('year', endYear) // less than or equal to
    .order('year');

    handleData(res, data, error, "Races not found.");
});

/*
API 16

Returns the results for the specified race.
Don’t provide the foreign keys for the race, driver, and
constructor; instead provide the following fields: driver
(driverRef, code, forename, surname), race (name, round, year,
date), constructor (name, constructorRef, nationality).
Sort by the field grid in ascending order
 */
app.get('/api/results/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select(`drivers (driverRef, code, forename, surname), 
             races (name, round, year, date), 
             constructors (name, constructorRef, nationality)`)
    .eq('raceId', req.params.raceId)
    .order('grid', { ascending: true });

    handleData(res, data, error, "Results not found.");
});

/*
API 17

Returns all the results for a given driver
 */
app.get('/api/results/driver/:driverRef', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select('drivers!inner (*), *')
    .eq('drivers.driverRef', req.params.driverRef);

    handleData(res, data, error, "Results not found.");
});

/*
API 18

Returns all the results for a given driver between two years
 */
app.get('/api/results/driver/:driverRef/seasons/:startYear/:endYear', async (req, res) => {
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);

    if (yearCheck(res, startYear, endYear)) {
        return; // stop further execution stop further execution due to bad request
    }

    const { data, error } = await supabase
    .from('results')
    .select('drivers!inner (*), races!inner (year), *')
    .eq('drivers.driverRef', req.params.driverRef)
    .gte('races.year', startYear) // greater than or equal to
    .lte('races.year', endYear); // less than or equal to

    handleData(res, data, error, "Results not found.");
});

/*
API 19

Returns the qualifying results for the specified race.
Provide the same fields as with results for the foreign keys.
Sort by the field position in ascending order.
 */
app.get('/api/qualifying/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('qualifying')
    .select('raceId, driverId, constructorId, number, position')
    .eq('raceId', req.params.raceId)
    .order('position', { ascending: true });

    handleData(res, data, error, "Qualifying result(s) not found.");
});

/*
API 20

Returns the current season driver standings table for the
specified race, sorted by position in ascending order.
Provide the same fields as with results for the driver.
 */
app.get('/api/standings/:raceId/drivers', async (req, res) => {
    const { data, error } = await supabase
    .from('driverStandings')
    .select('raceId, driverId, points, position, positionText')
    .eq('raceId', req.params.raceId)
    .order('position', { ascending: true });

    handleData(res, data, error, "Driver standings not found.");
});

/*
API 21

Returns the current season constructors standings table for
the specified race, sorted by position in ascending order.
Provide the same fields as with results for the constructor.
 */
app.get('/api/standings/:raceId/constructors', async (req, res) => {
    const { data, error } = await supabase
    .from('constructorStandings')
    .select('raceId, constructorId, points, position, positionText')
    .eq('raceId', req.params.raceId)
    .order('position', { ascending: true });

    handleData(res, data, error, "Constructor standings not found.");
});



// Data and Error Handling

/*
Handles the response based on whether it's an error or data.
If there's an error, it sends a 404 status with the error message.
If data is empty, it sends a 404 status with the given custom error message.
Otherwise, it sends the data.

@param {object} res - The response object.
@param {any} data - The data to be sent in the response.
@param {boolean} error - Indicates if there's an error.
@param {string} errorMessage - The error message to be sent if data is empty.
 */
function handleData(res, data, error, errorMessage) {
    if (error) {
        res.status(404).json({ error });
    } else if (!data || data.length === 0) { // strict equality checking type and value to be same
        res.status(404).json({ error: errorMessage }); // custom error message used for not found data
    } else {
        res.send(data);
    }
}

/*
Checks if the start year is greater than the end year.
If true, sends a 400 status with an error message.

@param {object} res - The response object.
@param {number} startYear - The start year.
@param {number} endYear - The end year.
@returns {boolean} - True if the years are invalid, false otherwise.
 */
function yearCheck(res, startYear, endYear) {
    if (startYear > endYear) {
        res.status(400).json({ error: 'Bad Request: End year is earlier than start year.' });
        return true; // invalid years
    }
    return false; // valid years
}
