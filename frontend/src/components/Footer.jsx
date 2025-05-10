import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full bg-[#27a3ad] py-8 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 text-left">
                    <div className="text-white font-extrabold text-2xl tracking-wide">EMCON</div>
                    <div className="text-white text-base mt-1 font-normal">Smart healthcare navigation for everyone!</div>
                </div>
                <nav className="flex flex-wrap gap-8 text-white text-base font-medium">
                    <Link to="/hospitals" className="hover:underline">Find Hospitals</Link>
                    <Link to="/insurance" className="hover:underline">Insurance</Link>
                    <Link to="/blood-requests" className="hover:underline">Donations</Link>
                    <Link to="/medical-card" className="hover:underline">Medical Card</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer; 