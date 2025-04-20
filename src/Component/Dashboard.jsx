import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // for navigation
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();

    const [absentCount, setAbsentCount] = useState(0);
    const [fields, setFields] = useState([]);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);

    const generateFields = () => {
        const count = parseInt(absentCount);
        if (!count || count <= 0) {
            alert("Please enter a valid number of absent students.");
            return;
        }

        const newFields = [];
        for (let i = 0; i < count; i++) {
            newFields.push({ rollNumber: '', studentName: '', parentContact: '', status: 'Absent', reason: '' });
        }
        setFields(newFields);
    };

    const handleChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;
        setFields(updatedFields);
    };

    const handleLogout = async () => {
        await fetch('http://localhost:8055/logout', {
            credentials: 'include'
        });
        navigate('/');
    };

    // Scroll behavior to hide/show header
    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScrollTop) {
                setShowHeader(false);
            } else {
                setShowHeader(true);
            }
            setLastScrollTop(currentScroll);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollTop]);

    // Check authentication on mount
    useEffect(() => {
        fetch('http://localhost:8055/check-auth', {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (!data.status) {
                navigate('/');
            }
        });
    }, []);

    return (
        <div className="full-container">
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
                        <select id="class-select">
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
                                        onChange={(e) => handleChange(index, 'studentName', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={field.parentContact}
                                        onChange={(e) => handleChange(index, 'parentContact', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={field.status}
                                        onChange={(e) => handleChange(index, 'status', e.target.value)}
                                    >
                                        <option value="Absent">Absent</option>
                                        <option value="Present">Absent (DL)</option>
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

                <button>Submit Attendance</button>
            </div>

            <div className="bottom-bar">
                <p>&copy; 2025 Smart Attendance System. All rights reserved.</p>
            </div>
        </div>
    );
}
