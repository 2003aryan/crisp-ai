import { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";
import axios from 'axios';
import { Download, Copy, FileText, Clipboard, Save, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

function Summarizer() {
    const { token, loading } = useContext(AuthContext);

    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiStatus, setApiStatus] = useState('');

    const apiKeyRef = useRef(process.env.REACT_APP_HUGGINGFACE_API_KEY);

    const inputWordCount = useMemo(() => inputText.trim().split(/\s+/).filter(Boolean).length, [inputText]);
    const summaryWordCount = useMemo(() => summary.trim().split(/\s+/).filter(Boolean).length, [summary]);

    const MAX_WORD_LIMIT = 800;

    const handleSummarize = useCallback(async () => {
        if (!inputText.trim()) {
            toast.error('Input text is required');
            return;
        }

        if (inputWordCount > MAX_WORD_LIMIT) {
            toast.error(`Input exceeds ${MAX_WORD_LIMIT} words limit. Please shorten your text.`);
            return;
        }

        setIsLoading(true);
        setError('');
        const toastId = toast.loading('Summarizing...');
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
                { inputs: inputText },
                {
                    headers: {
                        Authorization: `Bearer ${apiKeyRef.current}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && response.data.length > 0 && response.data[0].summary_text) {
                setSummary(response.data[0].summary_text);
                toast.success('Summary generated successfully!', { id: toastId });
            } else {
                throw new Error('Unexpected response format from summarization API');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to summarize text');
            toast.error('Failed to summarize text. Please try again.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    }, [inputText, inputWordCount]);

    const handleInputChange = useCallback((e) => {
        const newText = e.target.value;
        const wordCount = newText.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount <= MAX_WORD_LIMIT) {
            setInputText(newText);
            setError('');
        } else {
            toast.error(`Input exceeds ${MAX_WORD_LIMIT} words limit. Please shorten your text.`);
        }
    }, []);

    const handleDownload = useCallback(() => {
        const element = document.createElement('a');
        const file = new Blob([summary], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'summary.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Summary downloaded successfully!');
    }, [summary]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(summary);
        toast.success('Summary copied to clipboard!');
    }, [summary]);

    const handlePasteSample = useCallback(() => {
        const sampleText = `Drones piloted by artificial intelligence (AI), rather than humans, could soon work together in teams to prevent wildfires, say researchers. Swarms of up to 30 autonomous planes would be able to spot and put out flames which can lead to wildfires by working collectively using AI, if a study in the UK is a success. The team of firefighters, engineers and scientists working on the research – which is still in the test phase and has not yet been used on a wildfire – say their project is the first to combine unpiloted drone technology with swarm engineering for firefighting. Drones piloted by people are already used in firefighting, to detect hidden blazes and assess safety risks, among other tasks. The drones that researchers want to eventually use for firefighting are large twin-engined aircraft with a wingspan of 9.5 metres and huge water-carrying capacity. They are already designed to fly without any intervention from remote pilots. Now the next stage of the project, swarm engineering, aims to make lots of robots work together in real-world applications. Professor Sabine Hauert, from the University of Bristol, one of the project partners, told the BBC: “When you look at birds and ants and bees, they can do beautiful, complex behaviours by coordinating – and so we take inspiration from that to coordinate large numbers of robots.”`;
        setInputText(sampleText);
        toast.success('Sample text pasted!');
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const response = await axios.post('/api/save-summary', {
                inputText,
                summary
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200) {
                toast.success('Summary saved successfully!');
            }
        } catch (err) {
            console.error('Error saving summary:', err);
            toast.error('Failed to save summary. Please try again.');
        }
    }, [inputText, summary, token]);

    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                const response = await axios.get('/api/status', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    setApiStatus(response.data.message);
                    // toast.success('API is ready!');
                } else {
                    setApiStatus('API is not responding');
                    toast.error('API is not responding. Please try again later.');
                }
            } catch (err) {
                setApiStatus('Failed to check API status');
                toast.error('Failed to check API status. Please try again later.');
            }
        };

        checkApiStatus();
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        // <div className="flex flex-col min-h-screen">
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
                                <LogOut className="h-5 w-5 text-black" /> {/* Assuming User is an SVG or component */}
                            <span>{token ? 'Logout' : 'Not Logged In'}</span>
                        </span>
                    </Link>
                    </div>
                </div>
            </nav>
            {/* Main content */}
            <div className="flex-grow">
                <div className="max-w-5xl mx-auto m-4 p-4 space-y-4">
                    {apiStatus && (
                        <div className="text-center text-sm text-gray-600">
                            {/* API Status: {apiStatus} */}
                        </div>
                    )}
                    <div className="max-w-5xl mx-auto m-4 p-4 space-y-4 border bg-white rounded-lg shadow-lg">
                        <h1 className="text-2xl font-bold text-center">Text Summarizer</h1>
                        <textarea
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="Enter your text here..."
                            className="w-full h-60 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-between items-center">
                            <span>{inputWordCount} Words</span>
                            <div className="space-x-2">
                                <button
                                    onClick={handlePasteSample}
                                    className="inline-flex items-center justify-center px-3 py-2 w-28 text-sm font-medium bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                >
                                    <Clipboard className="mr-1 h-4 w-4" />
                                    Sample
                                </button>
                                <button
                                    onClick={handleSummarize}
                                    disabled={isLoading || inputText.trim() === ''}
                                    className={`inline-flex items-center justify-center px-1 py-2 w-28 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${(isLoading || inputText.trim() === '') && 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <FileText className="mr-1 h-4 w-4" />
                                    {isLoading ? 'Summarizing...' : 'Summarize'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-500 text-center">{error}</div>
                    )}
                    {summary && (
                        <div className="max-w-5xl mx-auto m-4 p-4 space-y-4 border bg-white rounded-lg shadow-lg">
                            <div className="space-y-4">
                                <textarea
                                    value={summary}
                                    readOnly
                                    className="w-full h-60 p-2 border border-gray-300 rounded-md focus:outline-none"
                                />
                                <div className="flex justify-between items-center">
                                    <span>{summaryWordCount} Words</span>
                                    <div className="space-x-2">
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center justify-center px-3 py-2 w-28 text-sm font-medium bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                                        >
                                            <Save className="mr-1 h-4 w-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="inline-flex items-center justify-center px-3 py-2 w-28 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                        >
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </button>
                                        <button
                                            onClick={handleCopy}
                                            className="inline-flex items-center justify-center px-3 py-2 w-28 text-sm font-medium bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                        >
                                            <Copy className="mr-1 h-4 w-4" />
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Summarizer;