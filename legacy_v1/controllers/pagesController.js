const path = require('path');

exports.getLandingPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
};

exports.getTrackerPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'tracker.html'));
};

exports.getDriverPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'driver.html'));
};
