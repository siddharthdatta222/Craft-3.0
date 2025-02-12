import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const ScriptEditor = () => {
    // State management for form inputs and scripts list
    const [scriptTitle, setScriptTitle] = useState('');
    const [scriptContent, setScriptContent] = useState('');
    const [scripts, setScripts] = useState([]);
    const [selectedScriptId, setSelectedScriptId] = useState(null);
    const [message, setMessage] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');

    // Add socket state
    const [socket, setSocket] = useState(null);
    const [collaborators, setCollaborators] = useState([]);

    // Load all scripts when component mounts
    useEffect(() => {
        loadScripts();
    }, []);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // Cleanup on unmount
        return () => newSocket.disconnect();
    }, []);

    // Handle socket events
    useEffect(() => {
        if (!socket) return;

        // Handle script updates from other users
        socket.on('scriptUpdated', ({ content, userId }) => {
            setScriptContent(content);
            setMessage(`Collaborator ${userId} made changes`);
        });

        // Handle user join/leave events
        socket.on('userJoined', ({ userId, activeUsers }) => {
            setCollaborators(activeUsers);
            setMessage(`User ${userId} joined the session`);
        });

        socket.on('userLeft', ({ userId, activeUsers }) => {
            setCollaborators(activeUsers);
            setMessage(`User ${userId} left the session`);
        });

        // Cleanup listeners
        return () => {
            socket.off('scriptUpdated');
            socket.off('userJoined');
            socket.off('userLeft');
        };
    }, [socket]);

    // Join script room when script is selected
    useEffect(() => {
        if (!socket || !selectedScriptId) return;
        
        socket.emit('joinScript', selectedScriptId);
    }, [socket, selectedScriptId]);

    // Debounced function to emit content updates
    const emitContentUpdate = useCallback(
        (content) => {
            if (!socket || !selectedScriptId) return;
            
            socket.emit('scriptUpdate', {
                scriptId: selectedScriptId,
                content,
                cursorPosition: null // Could be implemented for cursor sync
            });
        },
        [socket, selectedScriptId]
    );

    // Update content change handler to include collaboration
    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setScriptContent(newContent);
        emitContentUpdate(newContent);
    };

    // Function to fetch all scripts from the backend
    const loadScripts = async () => {
        try {
            const response = await fetch('/api/scripts');
            const data = await response.json();
            setScripts(data);
        } catch (error) {
            setMessage('Error loading scripts: ' + error.message);
        }
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!scriptTitle.trim() || !scriptContent.trim()) {
            setMessage('Please provide both title and content.');
            return;
        }

        try {
            const url = selectedScriptId 
                ? `/api/scripts/${selectedScriptId}`
                : '/api/scripts';
            
            const method = selectedScriptId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: scriptTitle,
                    content: scriptContent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save script');
            }

            // Clear form and reload scripts
            setMessage(selectedScriptId ? 'Script updated successfully!' : 'Script created successfully!');
            clearForm();
            loadScripts();
        } catch (error) {
            setMessage('Error saving script: ' + error.message);
        }
    };

    // Function to load a script for editing
    const handleScriptSelect = (script) => {
        setSelectedScriptId(script.id);
        setScriptTitle(script.title);
        setScriptContent(script.content);
        
        // Join new script room
        if (socket) {
            socket.emit('joinScript', script.id);
        }
    };

    // Function to clear the form
    const clearForm = () => {
        setScriptTitle('');
        setScriptContent('');
        setSelectedScriptId(null);
    };

    // Function to get AI suggestion
    const getAiSuggestion = async () => {
        try {
            if (!scriptContent.trim()) {
                setMessage('Please enter some content first.');
                return;
            }

            const response = await fetch('/api/ai/assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sceneContent: scriptContent
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            setAiSuggestion(data.suggestion);
        } catch (error) {
            setMessage('Error getting AI suggestion: ' + error.message);
        }
    };

    return (
        <div className="script-editor">
            <h2>Script Editor</h2>
            
            {/* Message display */}
            {message && (
                <div className="message">
                    {message}
                </div>
            )}

            {/* Script editing form */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="scriptTitle">Title:</label>
                    <input
                        type="text"
                        id="scriptTitle"
                        value={scriptTitle}
                        onChange={(e) => setScriptTitle(e.target.value)}
                        placeholder="Enter script title"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="scriptContent">Content:</label>
                    <textarea
                        id="scriptContent"
                        value={scriptContent}
                        onChange={handleContentChange}
                        placeholder="Enter script content"
                        rows="10"
                    />
                    
                    {/* Add AI suggestion button and display */}
                    <button 
                        type="button" 
                        onClick={getAiSuggestion}
                        className="ai-button"
                    >
                        Get AI Suggestion
                    </button>
                    
                    {aiSuggestion && (
                        <div className="ai-suggestion">
                            <h4>AI Suggestion:</h4>
                            <p>{aiSuggestion}</p>
                        </div>
                    )}
                </div>

                <div className="button-group">
                    <button type="submit">
                        {selectedScriptId ? 'Update Script' : 'Save Script'}
                    </button>
                    <button type="button" onClick={clearForm}>
                        Clear Form
                    </button>
                    <button type="button" onClick={loadScripts}>
                        Refresh Scripts
                    </button>
                </div>
            </form>

            {/* Scripts list */}
            <div className="scripts-list">
                <h3>Saved Scripts</h3>
                {scripts.length === 0 ? (
                    <p>No scripts available.</p>
                ) : (
                    <ul>
                        {scripts.map((script) => (
                            <li 
                                key={script.id}
                                onClick={() => handleScriptSelect(script)}
                                className={selectedScriptId === script.id ? 'selected' : ''}
                            >
                                {script.title}
                                <span className="script-date">
                                    {new Date(script.createdAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Add collaborators display */}
            {collaborators.length > 0 && (
                <div className="collaborators">
                    <h4>Active Collaborators:</h4>
                    <ul>
                        {collaborators.map(userId => (
                            <li key={userId}>{userId}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Basic styling */}
            <style jsx>{`
                .script-editor {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                label {
                    display: block;
                    margin-bottom: 5px;
                }

                input, textarea {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .button-group {
                    margin: 20px 0;
                }

                button {
                    margin-right: 10px;
                    padding: 8px 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #0056b3;
                }

                .scripts-list ul {
                    list-style: none;
                    padding: 0;
                }

                .scripts-list li {
                    padding: 10px;
                    border: 1px solid #ddd;
                    margin-bottom: 5px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                }

                .scripts-list li:hover {
                    background-color: #f5f5f5;
                }

                .scripts-list li.selected {
                    background-color: #e3f2fd;
                }

                .message {
                    padding: 10px;
                    margin-bottom: 20px;
                    background-color: #e3f2fd;
                    border-radius: 4px;
                }

                .script-date {
                    color: #666;
                    font-size: 0.9em;
                }

                .ai-button {
                    margin-top: 10px;
                    background-color: #6200ea;
                }

                .ai-button:hover {
                    background-color: #3700b3;
                }

                .ai-suggestion {
                    margin-top: 15px;
                    padding: 15px;
                    background-color: #f0f7ff;
                    border-radius: 4px;
                    border-left: 4px solid #6200ea;
                }

                .ai-suggestion h4 {
                    margin: 0 0 10px 0;
                    color: #6200ea;
                }

                .collaborators {
                    margin-top: 15px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                }

                .collaborators h4 {
                    margin: 0 0 10px 0;
                    color: #495057;
                }

                .collaborators ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .collaborators li {
                    display: inline-block;
                    margin-right: 10px;
                    padding: 4px 8px;
                    background-color: #e9ecef;
                    border-radius: 12px;
                    font-size: 0.9em;
                }
            `}</style>
        </div>
    );
};

export default ScriptEditor;
