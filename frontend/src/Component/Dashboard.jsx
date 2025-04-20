import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // ✅ Correct import
import './styles.css';
import { Toaster, toast } from 'react-hot-toast';

export default function Dashboard() {
    const navigate = useNavigate();

    const [absentCount, setAbsentCount] = useState(0);
    const [fields, setFields] = useState([]);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [selectedClass, setSelectedClass] = useState("SY"); // State to hold selected class

    // New state to hold student data
    const [studentData, setStudentData] = useState({});

    useEffect(() => {
        const isLoggedIn = Cookies.get('user-login');
        if (!isLoggedIn) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8055/logout', {
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        Cookies.remove('user-login'); // ✅ Remove cookie
        navigate('/'); // Redirect to login page
    };

    const generateFields = () => {
        const count = parseInt(absentCount);
        if (!count || count <= 0) {
            alert("Please enter a valid number of absent students.");
            return;
        }

        const newFields = [];
        for (let i = 0; i < count; i++) {
            newFields.push({ rollNumber: '', studentName: '', parentContact: '', status: 'Absent', reason: '', timeSlot: '' });
        }
        setFields(newFields);
    };

    const handleChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;

        // Fetch student data when roll number is changed
        if (key === 'rollNumber') {
            fetchStudentData(value, index);
        }

        setFields(updatedFields);
    };

    const fetchStudentData = async (rollNumber, index) => {
        if (!rollNumber) {
            setStudentData({});
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/getStudent?roll=${rollNumber}&class=${selectedClass}`); // Use selectedClass
            const data = await response.json();
            if (data.name) {
                const updatedFields = [...fields];
                updatedFields[index].studentName = data.name;
                updatedFields[index].parentContact = data.parent_contact;
                setFields(updatedFields);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setShowHeader(currentScroll <= lastScrollTop);
            setLastScrollTop(currentScroll);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollTop]);

    const handleSubmitAttendance = async () => {
        for (const field of fields) {
            if (field.status === "Absent" || field.status === "Absent with DL") {
                const time = new Date().toLocaleString(); // Get the current time
                await fetch('http://localhost:5000/sendSms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: field.studentName,
                        parentContact: field.parentContact,
                        timeSlot: field.timeSlot,
                        status: field.status,
                        reason: field.reason,
                    }),
                });
            }
        }

        // Show success toast notification
        toast.success('SMS sent successfully and data saved!', {
            duration: 3000, // Duration for the toast
        });

        // Reset the fields after sending the messages
        setFields([]); // Clear the fields array
        setAbsentCount(0); // Reset the absent count
    };

    return (
        <div className="full-container">
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    className: '',
                    duration: 5000,
                    removeDelay: 1000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: 'green',
                            secondary: 'black',
                        },
                    },
                }}
            />
            {showHeader && (
                <div className="header-bar">
                    <h2>SSAS</h2>
                    <div className="nav-links">
                        <p>Home</p>
                        <p>About Us</p>
                        <p>Contact Us</p>
                    </div>
                    <button onClick={handleLogout}>Log Out</button>
                </div>
            )}

            <div className="main-body">
                <h2>Mark Attendance</h2>
                <div className="form-row">
                    <div className="dropdown">
                        <label htmlFor="class-select">Select Class:</label>
                        <select 
                            id="class-select" 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)} // Update selected class
                        >
                            <option value="SY">Second Year (SY)</option>
                            <option value="TY">Third Year (TY)</option>
                        </select>
                    </div>

                    <div className="generate-fields">
                        <label htmlFor="absent-count">Number of Absent Students:</label>
                        <input
                            type="number"
                            id="absent-count"
                            min="1"
                            value={absentCount}
                            onChange={(e) => setAbsentCount(e.target.value)}
                        />
                    </div>

                    <button onClick={generateFields}>Generate Fields</button>
                </div>

                <table id="attendance-table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Parent Contact</th>
                            <th>Time Slot</th>
                            <th>Status</th>
                            <th>Reason (Optional)</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-form">
                        {fields.map((field, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        value={field.rollNumber}
                                        onChange={(e) => handleChange(index, 'rollNumber', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={field.studentName}
                                        readOnly // Make this field read-only
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={field.parentContact}
                                        readOnly // Make this field read-only
                                    />
                                </td>
                                <td>
                                    <select
                                        value={field.timeSlot}
                                        onChange={(e) => handleChange(index, 'timeSlot', e.target.value)}
                                    >
                                        <option value="">Select Time</option>
                                        <option value="9:00 - 9:55 AM">9:00 - 9:55 AM</option>
                                        <option value="9:55 - 10:50 AM">9:55 - 10:50 AM</option>
                                        <option value="11:10 - 12:05 PM">11:10 - 12:05 PM</option>
                                        <option value="12:05 - 1:00 PM">12:05 - 1:00 PM</option>
                                        <option value="2:00 - 3:00 PM">2:00 - 3:00 PM</option>
                                        <option value="3:00 - 4:00 PM">3:00 - 4:00 PM</option>
                                        <option value="4:00 - 5:00 PM">4:00 - 5:00 PM</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={field.status}
                                        onChange={(e) => handleChange(index, 'status', e.target.value)}
                                    >
                                        <option value="Absent">Absent</option>
                                        <option value="Absent with DL">Absent with DL</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={field.reason}
                                        onChange={(e) => handleChange(index, 'reason', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={handleSubmitAttendance}>Submit Attendance</button>
            </div>

            <div className="bottom-bar">
                <p>&copy; 2025 Smart Attendance System. All rights reserved.</p>
            </div>
        </div>
    );
}