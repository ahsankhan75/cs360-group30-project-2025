import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

const UserLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Chatbot />
        </div>
    );
};

export default UserLayout; 