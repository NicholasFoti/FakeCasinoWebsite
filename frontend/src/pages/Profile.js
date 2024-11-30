import React, { useState, useEffect } from 'react';
import './Profile.css'; 

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (user?.date_created) {
            const date = new Date(user.date_created);
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            setFormattedDate(formatted);
        }
    }, [user]);

    return (
        <div className="profile-container">
            <h2>Profile Information</h2>
            <div className="profile-info">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Balance:</strong> ${user.balance.toLocaleString()}</p>
                <p><strong>Member Since:</strong> {formattedDate}</p>
                <p><strong>Bets Won:</strong> {user.bets_won || 0}</p>
                <p><strong>Bets Lost:</strong> {user.bets_lost || 0}</p>
            </div>
        </div>
    );
};

export default Profile; 
