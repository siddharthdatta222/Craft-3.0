import React, { useState, useEffect } from 'react';

const NodeArchitecture = () => {
    // State management for different node types
    const [worldNodes, setWorldNodes] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [error, setError] = useState('');
    
    // State for form visibility
    const [showWorldForm, setShowWorldForm] = useState(false);
    const [showCharacterForm, setShowCharacterForm] = useState(false);
    const [showRelationshipForm, setShowRelationshipForm] = useState(false);

    // Form data states
    const [worldForm, setWorldForm] = useState({ title: '', description: '', rules: '' });
    const [characterForm, setCharacterForm] = useState({ 
        name: '', likes: '', dislikes: '', background: '', reactions: '' 
    });
    const [relationshipForm, setRelationshipForm] = useState({ 
        character1Id: '', character2Id: '', type: '', description: '' 
    });

    // Load all data when component mounts
    useEffect(() => {
        loadAllData();
    }, []);

    // Function to load all data from backend
    const loadAllData = async () => {
        try {
            const [worldRes, charRes, relRes] = await Promise.all([
                fetch('/api/world'),
                fetch('/api/characters'),
                fetch('/api/relationships')
            ]);

            const [worldData, charData, relData] = await Promise.all([
                worldRes.json(),
                charRes.json(),
                relRes.json()
            ]);

            setWorldNodes(worldData);
            setCharacters(charData);
            setRelationships(relData);
        } catch (error) {
            setError('Error loading data: ' + error.message);
        }
    };

    // Generic form submission handler
    const handleSubmit = async (endpoint, data, setFormVisible, resetForm) => {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to create node');

            // Reload data and reset form
            await loadAllData();
            setFormVisible(false);
            resetForm();
        } catch (error) {
            setError('Error creating node: ' + error.message);
        }
    };

    // World Context Section
    const WorldContextSection = () => (
        <div className="section">
            <h2>World Context</h2>
            <button onClick={() => setShowWorldForm(!showWorldForm)}>
                {showWorldForm ? 'Cancel' : 'Add New'}
            </button>

            {showWorldForm && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('world', worldForm, setShowWorldForm, 
                        () => setWorldForm({ title: '', description: '', rules: '' }));
                }}>
                    <input
                        placeholder="Title"
                        value={worldForm.title}
                        onChange={e => setWorldForm({...worldForm, title: e.target.value})}
                    />
                    <textarea
                        placeholder="Description"
                        value={worldForm.description}
                        onChange={e => setWorldForm({...worldForm, description: e.target.value})}
                    />
                    <textarea
                        placeholder="Rules"
                        value={worldForm.rules}
                        onChange={e => setWorldForm({...worldForm, rules: e.target.value})}
                    />
                    <button type="submit">Save</button>
                </form>
            )}

            <div className="nodes-list">
                {worldNodes.map(node => (
                    <div key={node.id} className="node">
                        <h3>{node.title}</h3>
                        <p>{node.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    // Characters Section
    const CharactersSection = () => (
        <div className="section">
            <h2>Characters</h2>
            <button onClick={() => setShowCharacterForm(!showCharacterForm)}>
                {showCharacterForm ? 'Cancel' : 'Add New'}
            </button>

            {showCharacterForm && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('characters', characterForm, setShowCharacterForm,
                        () => setCharacterForm({ name: '', likes: '', dislikes: '', background: '', reactions: '' }));
                }}>
                    <input
                        placeholder="Name"
                        value={characterForm.name}
                        onChange={e => setCharacterForm({...characterForm, name: e.target.value})}
                    />
                    <input
                        placeholder="Likes (comma-separated)"
                        value={characterForm.likes}
                        onChange={e => setCharacterForm({...characterForm, likes: e.target.value})}
                    />
                    <input
                        placeholder="Dislikes (comma-separated)"
                        value={characterForm.dislikes}
                        onChange={e => setCharacterForm({...characterForm, dislikes: e.target.value})}
                    />
                    <textarea
                        placeholder="Background"
                        value={characterForm.background}
                        onChange={e => setCharacterForm({...characterForm, background: e.target.value})}
                    />
                    <textarea
                        placeholder="Reactions (JSON format)"
                        value={characterForm.reactions}
                        onChange={e => setCharacterForm({...characterForm, reactions: e.target.value})}
                    />
                    <button type="submit">Save</button>
                </form>
            )}

            <div className="nodes-list">
                {characters.map(char => (
                    <div key={char.id} className="node">
                        <h3>{char.name}</h3>
                        <p>{char.background}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    // Relationships Section
    const RelationshipsSection = () => (
        <div className="section">
            <h2>Relationships</h2>
            <button onClick={() => setShowRelationshipForm(!showRelationshipForm)}>
                {showRelationshipForm ? 'Cancel' : 'Add New'}
            </button>

            {showRelationshipForm && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('relationships', relationshipForm, setShowRelationshipForm,
                        () => setRelationshipForm({ character1Id: '', character2Id: '', type: '', description: '' }));
                }}>
                    <select
                        value={relationshipForm.character1Id}
                        onChange={e => setRelationshipForm({...relationshipForm, character1Id: e.target.value})}
                    >
                        <option value="">Select Character 1</option>
                        {characters.map(char => (
                            <option key={char.id} value={char.id}>{char.name}</option>
                        ))}
                    </select>
                    <select
                        value={relationshipForm.character2Id}
                        onChange={e => setRelationshipForm({...relationshipForm, character2Id: e.target.value})}
                    >
                        <option value="">Select Character 2</option>
                        {characters.map(char => (
                            <option key={char.id} value={char.id}>{char.name}</option>
                        ))}
                    </select>
                    <input
                        placeholder="Relationship Type"
                        value={relationshipForm.type}
                        onChange={e => setRelationshipForm({...relationshipForm, type: e.target.value})}
                    />
                    <textarea
                        placeholder="Description"
                        value={relationshipForm.description}
                        onChange={e => setRelationshipForm({...relationshipForm, description: e.target.value})}
                    />
                    <button type="submit">Save</button>
                </form>
            )}

            <div className="nodes-list">
                {relationships.map(rel => (
                    <div key={rel.id} className="node">
                        <h3>{rel.type}</h3>
                        <p>Between: {characters.find(c => c.id === rel.character1Id)?.name} and {characters.find(c => c.id === rel.character2Id)?.name}</p>
                        <p>{rel.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="node-architecture">
            {error && <div className="error">{error}</div>}
            <WorldContextSection />
            <CharactersSection />
            <RelationshipsSection />

            <style jsx>{`
                .node-architecture {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .section {
                    margin-bottom: 30px;
                    padding: 20px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                }

                .nodes-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .node {
                    background: white;
                    padding: 15px;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 20px 0;
                }

                input, textarea, select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                button {
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

                .error {
                    padding: 10px;
                    margin-bottom: 20px;
                    background-color: #ffebee;
                    color: #c62828;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default NodeArchitecture; 