const path = require('path');


exports.home = async (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
}