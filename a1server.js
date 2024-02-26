const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://dfnpsugvwgrgbugddzdb.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbnBzdWd2d2dyZ2J1Z2RkemRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg2NDQzMjgsImV4cCI6MjAyNDIyMDMyOH0.QfpP8lWngSrEXk46LvQbkMJHkwHLnVmkJd22kGMkzf8';

const supabase = supa.createClient(supaUrl, supaAnonKey);



const port = process.env.PORT //|| 1988; //Glitch's default port is 3000
const host = '0.0.0.0'; //Listen on any available interface
console.log(`Server running on port ${port}`);
app.listen(port, host, () => {
    console.log(`Server running on port ${port}`);
});

// for testing on local
// app.listen(3000, () => {
//     console.log(`Server running on port 3000`);
// });



//Route 1
app.get('/api/seasons', async (req, res) => {
    const {data, error} = await supabase
    .from('seasons')
    .select();
    res.send(data);
}); 

//Route 2
app.get('/api/circuits', async (req, res) => {
    const {data, error} = await supabase
    .from('circuits')
    .select();
    res.send(data);
}); 

//Route 3
app.get('/api/circuits/:circuitRef', async (req, res) => {
    const {data, error} = await supabase
    .from('circuits')
    .select()
    .eq('circuitRef',req.params.circuitRef);
    
    handleData(res, data, error, "Circuit not found.");
}); 

//Route 4
app.get('/api/circuits/season/:year', async (req, res) =>{
    const {data, error} = await supabase
    .from('races')
    .select('circuits (country, location, circuitRef, name), year')
    .eq('year', req.params.year)
    .order('round', { ascending: true });

    handleData(res, data, error, "Circuits not found.");
});

//Route 5
app.get('/api/constructors', async (req, res) => {
    const {data, error} = await supabase
    .from('constructors')
    .select();
    res.send(data);
}); 

//Route 6
app.get('/api/constructors/:constructorRef', async (req, res) => {
    const { data, error } = await supabase
    .from('constructors')
    .select()
    .eq('constructorRef', req.params.constructorRef);
    
    handleData(res, data, error, "Constructor not found.");
}); 

//Route 7
app.get('/api/drivers', async (req, res) => {
    const {data, error} = await supabase
    .from('drivers')
    .select();
    res.send(data);
}); 

//Route 8
app.get('/api/drivers/:driverRef', async (req, res) => {
    const { data, error } = await supabase 
    .from('drivers')
    .select()
    .eq('driverRef', req.params.driverRef);

    handleData(res, data, error, "Driver not found.");
});

//Route 9
app.get('/api/drivers/search/:subString', async (req, res) => {
    const { data, error } = await supabase
    .from('drivers')
    .select()
    .ilike('surname', `${req.params.subString}%`);

    handleData(res, data, error, "Driver not found.");
});

//Route 10
app.get('/api/drivers/race/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select('drivers (driverRef, forename, surname)')
    .eq('raceId', req.params.raceId);

    handleData(res, data, error, "Drivers not found.");
});

//Route 11
app.get('/api/races/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select('circuits (name, location, country)')
    .eq('raceId', req.params.raceId);

    handleData(res, data, error, "Race not found.");
});

//Route 12
app.get('/api/races/season/:year', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select()
    .eq('year', req.params.year)
    .order('round', { ascending: true });

    handleData(res, data, error, "Races not found.");
});

//Route 13
app.get('/api/races/season/:year/:round', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select()
    .eq('year', req.params.year)
    .eq('round', req.params.round);

    handleData(res, data, error, "Races not found.");
});

//Route 14
app.get('/api/races/circuits/:circuitRef', async (req, res) => {
    const { data, error } = await supabase
    .from('races')
    .select(`raceId, year, circuits!inner (circuitRef,name)`)
    .eq('circuits.circuitRef', req.params.circuitRef)
    .order('year');

    handleData(res, data, error, "Races not found.");
});

//Route 15
app.get('/api/races/circuits/:circuitRef/season/:startYear/:endYear', async (req, res) => {
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);
    const circuitRef = req.params.circuitRef;

    if (yearCheck(res, startYear, endYear)) {
        return; // stop further execution
    }

    const { data, error } = await supabase
    .from('races')
    .select('*, circuits!inner (circuitRef, name)')
    .eq('circuits.circuitRef', circuitRef)
    .gte('year', startYear) //greater than or equal to
    .lte('year', endYear) //less than or equal to
    .order('year');

    handleData(res, data, error, "Races not found.");
});

//Route 16
app.get('/api/results/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    .select('drivers (driverRef, code, forename, surname), races (name, round, year, date), constructors (name, constructorRef, nationality)')
    .eq('raceId', req.params.raceId)
    .order('grid', { ascending: true });

    handleData(res, data, error, "Results not found.");
});

//Route 17
app.get('/api/results/driver/:driverRef', async (req, res) => {
    const { data, error } = await supabase
    .from('results')
    //.select('drivers!inner (driverRef, code, forename, surname), *')
    .select('drivers!inner (*), *')
    .eq('drivers.driverRef', req.params.driverRef);

    handleData(res, data, error, "Results not found.");
});

//Route 18
app.get('/api/results/drivers/:driverRef/seasons/:startYear/:endYear', async (req, res) => {
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);
    const driverRef = req.params.driverRef;

    if (yearCheck(res, startYear, endYear)) {
        return; // stop further execution
    }

    const { data, error } = await supabase
    .from('results')
    .select('drivers!inner (driverRef, code, forename, surname), races!inner (year),*')
    .eq('drivers.driverRef', driverRef)
    .gte('races.year', startYear) // greater than or equal to
    .lte('races.year', endYear); // less than or equal to

    handleData(res, data, error, "Results not found.");
});

//Route 19
app.get('/api/qualifying/:raceId', async (req, res) => {
    const { data, error } = await supabase
    .from('qualifying')
    // .select('races (name, round, year, date), drivers (driverRef, code, forename, surname), constructors (name)')
    .select('races (*), drivers (*), constructors (*)')
    .eq('raceId', req.params.raceId)
    .order('position', { ascending: true });

    handleData(res, data, error, "Qualifying(s) not found.");
});

//Route 20
app.get('/api/standings/:raceId/drivers', async (req, res) => {
    const { data, error } = await supabase
    .from('driverStandings')
    .select('raceId, driverId, points, position, positionText')
    .eq('raceId', req.params.raceId)
    .order('position', { ascending: true });

    handleData(res, data, error, "Driver standings not found.");
});

//Route 21
app.get('/api/standings/:raceId/constructors', async (req, res) => {
    const { data, error } = await supabase
    .from('constructorStandings')
    .select('raceId, constructorId, points, position, positionText')
    .eq('raceId', req.params.raceId)
    .order('position', { ascending: true });

    handleData(res, data, error, "Constructor standings not found.");
});



// Data and error handling
function handleData(res, data, error, errorMessage) {
    if (error) {
        res.status(404).json({ error });
    } else if (!data || data.length === 0) {// strict equality
        res.status(404).json({ error: errorMessage });
    } else {
        res.send(data);
    }
}

function yearCheck(res, startYear, endYear) {
    if (startYear > endYear) {
        res.status(400).json({ error: 'Bad Request: End year is earlier than start year.' });
        return true; // invalid years
    }
    return false; // valid years
}