const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable'); // Import the formidable module

// Create the server
const server = http.createServer((req, res) => {

    // Serve static files (index.html) for other routes
    if (req.method === 'GET') {
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // File not found
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end("<h1>404 - File Not Found</h1>", 'utf8');
                } else {
                    // Other server errors
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                // File found, serve it
                res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
                res.end(content, 'utf8');
            }
        });
    }

    // Handle file uploads
    else if (req.method === 'POST' && req.url === '/upload') {
        // Create a new formidable instance
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, 'uploads'); // Specify the upload directory
        form.keepExtensions = true; // Retain file extensions

        // Parse the incoming request and handle the file upload
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end("<h1>400 - Bad Request</h1>", 'utf8');
                return;
            }

            // Validate file type
            const file = files.file[0];  // Access the uploaded file
            const mimeType = mime.lookup(file.name);

            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Example allowed types
            if (!allowedTypes.includes(mimeType)) {
                fs.unlinkSync(file.filepath); // Remove the invalid file
                res.writeHead(415, { 'Content-Type': 'text/html' });
                res.end("<h1>415 - Unsupported File Type</h1>", 'utf8');
                return;
            }

            // Successfully uploaded
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end("<h1>File Uploaded Successfully!</h1>", 'utf8');
        });
    } else {
        // For other routes, show a 404 error
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<h1>404 - Not Found</h1>", 'utf8');
    }

});

// Set the port and start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
