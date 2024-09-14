import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard() {
    const { token, loading } = useContext(AuthContext);
    const [summaries, setSummaries] = useState([]);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const response = await axios.get('/api/summaries', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSummaries(response.data);
                setError(null);
            } catch (error) {
                setError('Error fetching summaries');
                console.error('Error fetching summaries:', error);
            }
        };

        if (token) {
            fetchSummaries();
        }
    }, [token]);

    const openModal = (summary) => {
        setSelectedSummary(summary);
    };

    const closeModal = () => {
        setSelectedSummary(null);
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto p-4">
            {/* Navbar */}
            <nav className="bg-white text-black p-4 shadow-xl rounded-2xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center rounded-4xl">
                    <Link to="/" className="text-2xl font-bold text-blue-500">crisp.ai</Link>
                    <div className="flex items-center space-x-12">
                        <Link to="/summarizer" className="hover:text-blue-200">Summarize</Link>
                        <Link to="/dashboard" className="hover:text-blue-200">History</Link>
                        <Link to="/login" className="hover:text-blue-200">
                            <span className="inline-flex items-center space-x-1">
                                <LogOut className="h-5 w-5 text-black" />
                                <span>{token ? 'Logout' : 'Not Logged In'}</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
            <h1 className="text-2xl font-bold mb-4 mt-10">Your Saved Summaries</h1>
            {error && <div className="text-red-500 text-center">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(summaries) && summaries.map((summary) => (
                    <div key={summary._id} className="flex flex-col border rounded-lg shadow-lg bg-white p-4">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-1">Summary</h2>
                            <h4 className='text-sm mb-2'>{formatDate(summary.createdAt)}</h4>
                            <p className="text-sm mb-4">{summary.summary}</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => openModal(summary)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Original Text
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedSummary && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Original Text</h2>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-700">{selectedSummary.inputText}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
