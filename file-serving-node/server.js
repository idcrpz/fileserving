const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable'); // Import the formidable module

// Create the server
const server = http.createServer((req, res) => {

    // Serve static files (CSS, JS, images, etc.) from the "public" folder
    if (req.method === 'GET' && req.url.startsWith('/public')) {
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("<h1>404 - File Not Found</h1>", 'utf8');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'text/plain';

            if (ext === '.css') {
                contentType = 'text/css';
            } else if (ext === '.js') {
                contentType = 'application/javascript';
            } else if (ext === '.html') {
                contentType = 'text/html';
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        });
        return;
    }

    // Serve the index page for GET requests to the root
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
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, 'uploads');
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end("<h1>400 - Bad Request</h1>", 'utf8');
                return;
            }

            const file = files.file[0];
            const mimeType = mime.lookup(file.name);

            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

            if (!allowedTypes.includes(mimeType)) {
                fs.unlinkSync(file.filepath);
                res.writeHead(415, { 'Content-Type': 'text/html' });
                res.end("<h1>415 - Unsupported File Type</h1>", 'utf8');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end("<h1>File Uploaded Successfully!</h1>", 'utf8');
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<h1>404 - Not Found</h1>", 'utf8');
    }
});

// Set the port and start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
