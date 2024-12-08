import React from 'react';
import { useRouter } from 'next/router';

const Navbar = ({ isAuthenticated }) => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch(`/accounts/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                router.push('/accounts/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <div className="flex items-center">
                <div className="text-xl font-bold mr-4">Playfair</div>
                <div className="text-lg">Cipher</div>
            </div>
            {isAuthenticated ? (
                <button
                    className="bg-red-500 text-white border-none py-2 px-4 cursor-pointer rounded"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            ) : (
                <button
                    className="bg-blue-500 text-white border-none py-2 px-4 cursor-pointer rounded"
                    onClick={() => router.push('/accounts/login')}
                >
                    Login
                </button>
            )}
        </nav>
    );
};

export default Navbar;
