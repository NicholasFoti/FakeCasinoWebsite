import React, { useState, useEffect } from 'react';
import './Profile.css'; 

function Profile () {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const apiUrl = process.env.NODE_ENV === 'production' 
                    ? 'https://fakecasinowebsite.onrender.com/api/auth/user'
                    : 'http://localhost:3001/api/auth/user';

                const response = await fetch(`${apiUrl}/${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

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
        <div className="profile-page">
            <div className="profile-container">
                <h2>Profile Information</h2>
                <div className="profile-info">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Balance:</strong> ${Number(user.balance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</p>
                    <p><strong>Member Since:</strong> {formattedDate}</p>
                    <p><strong>Bets Won:</strong> {user.bets_won || 0}</p>
                    <p><strong>Bets Lost:</strong> {user.bets_lost || 0}</p>
                    <p><strong>Total Winnings:</strong> ${user.total_winnings - user.total_losses || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile; 
