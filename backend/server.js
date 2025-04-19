// server.js
const express = require("express");
const mysql = require("mysql2"); // Using mysql2 for better promise support
const cors = require("cors");
const path = require("path");
const twilio = require("twilio"); // Import Twilio
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../app"))); // Adjust path as needed

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'mysql-33253911-zishanrn2003-3cf2.j.aivencloud.com', // Aiven MySQL host
    user: 'avnadmin', // Aiven MySQL username
    password: 'AVNS_EqkttYnqN4TOcpx3A-u', // Aiven MySQL password
    database: 'system_att', // Replace with your actual database name
    port: 22688, // Aiven MySQL port
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed:", err.message);
    } else {
        console.log("✅ Connected to Aiven MySQL Database");
    }
});

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = new twilio(accountSid, authToken);

// Serve Login Page as Default Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../app/index.html")); // Adjust path as needed
});

// 📌 Login API
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        } 
        if (results.length > 0) {
            // User found, credentials are correct
            res.json({ success: true, message: "Login successful" });
        } else {
            // User not found, credentials are incorrect
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    });
});

// 📌 Fetch Student Data API
app.get("/getStudent", (req, res) => {
    const roll = req.query.roll;
    const classSelected = req.query.class;
    const tableName = classSelected === "SY" ? "sy" : "ty"; // Ensure table names are lowercase

    const sql = `SELECT name, parent_contact FROM ${tableName} WHERE roll_no = ?`;
    db.query(sql, [roll], (err, result) => {
        if (err) {
            res.status(500).send({ error: err.message });
        } else if (result.length > 0) {
            res.send(result[0]);
        } else {
            res.send({});
        }
    });
});

// Function to format phone number
function formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    // Check if the number is already in the correct format
    if (cleaned.startsWith('91')) {
        return `+${cleaned}`;
    } else {
        return `+91${cleaned}`;
    }
}

// Function to send SMS notification
function sendSmsNotification(studentName, parentContact, time) {
    client.messages
        .create({
            body: `Dear Parent, your child ${studentName} was absent at ${time}. Please contact us for more details.`,
            from: fromPhoneNumber,
            to: parentContact,
        })
        .then(message => {
            console.log(`SMS sent to ${parentContact}: ${message.sid}`);
        })
        .catch(error => {
            console.error(`Error sending SMS to ${parentContact}:`, error);
        });
}

// 📌 Send SMS API
app.post('/sendSms', (req, res) => {
    const { name, parentContact, timeSlot, status, reason } = req.body; // Destructure the new fields
    const formattedContact = formatPhoneNumber(parentContact); // Format the phone number

    // Construct the message body
    let messageBody = `Dear Parent, your child ${name} is marked as ${status} for the time slot ${timeSlot}.`;
    
    // Include the reason if provided
    if (reason) {
        messageBody += ` Reason: ${reason}.`;
    }

    client.messages
        .create({
            body: messageBody,
            from: fromPhoneNumber,
            to: formattedContact,
        })
        .then(async (message) => {
            console.log(`SMS sent to ${formattedContact}: ${message.sid}`);
            
            // Log the SMS status in the database
            const sql = "INSERT INTO sms_logs (parent_number, msg_status) VALUES (?, ?)";
            const msgStatus = "Sent"; // You can also log "Failed" if needed
            db.query(sql, [formattedContact, msgStatus], (err) => {
                if (err) {
                    console.error(`Error logging SMS status:`, err);
                } else {
                    console.log(`Logged SMS status for ${formattedContact}`);
                }
            });

            res.json({ success: true });
        })
        .catch(error => {
            console.error(`Error sending SMS to ${formattedContact}:`, error);
            // Log the SMS status as failed
            const sql = "INSERT INTO sms_logs (parent_number, msg_status) VALUES (?, ?)";
            const msgStatus = "Failed";
            db.query(sql, [formattedContact, msgStatus], (err) => {
                if (err) {
                    console.error(`Error logging SMS status:`, err);
                } else {
                    console.log(`Logged SMS failure for ${formattedContact}`);
                }
            });
            res.json({ success: false, error });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running at: http://localhost:${port}`);
});