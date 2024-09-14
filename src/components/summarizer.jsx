import { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";
import axios from 'axios';
import { Download, Copy, FileText, Clipboard, Save, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    const handleSummarize = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Input text is required');
            return;
        }

        setIsLoading(true);
        setError('');
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
            } else {
                throw new Error('Unexpected response format from summarization API');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to summarize text');
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

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
                } else {
                    setApiStatus('API is not responding');
                }
            } catch (err) {
                setApiStatus('Failed to check API status');
            }
        };

        checkApiStatus();
    }, [token]);

    const handleInputChange = useCallback((e) => {
        setInputText(e.target.value);
    }, []);

    const handleDownload = useCallback(() => {
        const element = document.createElement('a');
        const file = new Blob([summary], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'summary.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }, [summary]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(summary);
    }, [summary]);

    const handlePasteSample = useCallback(() => {
        const sampleText = `Republican U.S. presidential candidate Donald Trump said on Thursday that he will end all taxes on overtime pay as part of a wider tax cut package, if he is elected in the Nov. 5 election. 'As part of our additional tax cuts, we will end all taxes on overtime,' Trump said in remarks at a rally in Tucson, Arizona. 'Your overtime hours will be tax-free.' Trump, who faces Democratic Vice President Kamala Harris in what polls show to be a tight race, has previously said he would seek legislation to end the taxation of tips to aid service workers. Harris has made a similar pledge. 'He is desperate and scrambling and saying whatever it takes to try to trick people into voting for him,' a Harris campaign spokesperson said in response to Trump's proposal on Thursday. At a campaign event this month with union workers, Harris accused Trump of 'blocking' overtime from millions of workers during his 2017-2021 presidency. In 2019, the Trump administration issued a rule increasing the eligibility of overtime pay to 1.3 million additional U.S. workers, replacing a more generous proposal that had been introduced by President Barack Obama, Trump's Democratic predecessor. The Trump administration raised the salary level for exemption from overtime pay to $35,568 a year, up from the long-standing $23,660 threshold. Workers' rights groups criticized the move, saying it covered far fewer workers than the scheme introduced under Obama. Under Obama, the Labor Department proposed raising the threshold to more than $47,000, which would have made nearly 5 million more workers eligible for overtime. That rule was later struck down in court. Overtime pay at these income levels overwhelmingly benefits blue-collar workers, such as fast-food workers, nurses, store assistants and other low-income employees. 'The people who work overtime are among the hardest working citizens in our country and for too long no one in Washington has been looking out for them,' Trump said on Thursday. Under Labor Department rules, eligible workers must be paid at least time-and-a-half for hours worked above 40 hours in a single work-week. As of last month, American factory workers in non-supervisory roles put in an average of 3.7 hours of overtime a week, data from the Bureau of Labor Statistics shows. Not taxing overtime would result in less government revenue, at a time when Trump's plan to permanently extend the tax cuts he passed as president would expand the U.S. deficit by $3.5 trillion through 2033, according to the non-partisan Congressional Budget Office. The U.S. budget deficit in the first 11 months of this fiscal year is $1.9 trillion. It's unclear how much revenue the government receives from taxes on overtime pay. Trump's proposal would be a first for the federal government. Alabama this year became the first state to exclude overtime wages for hourly workers from state taxes as a temporary measure that won legislative support in part to help employers fill jobs in a tight labor market. The exemption is for 18 months only.`;
        setInputText(sampleText);
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
                alert('Summary saved successfully!');
            }
        } catch (err) {
            console.error('Error saving summary:', err);
            alert('Failed to save summary. Please try again.');
        }
    }, [inputText, summary, token]);

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
                        <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                        <span className="inline-flex items-center space-x-1">
                            <User className="h-5 w-5 text-black" /> {/* Assuming User is an SVG or component */}
                            <span>{token ? 'Logged In' : 'Not Logged In'}</span>
                        </span>
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