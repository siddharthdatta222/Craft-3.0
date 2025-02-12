import React, { useState, useEffect } from 'react';

function CharactersSection() {
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    traits: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }

      const data = await response.json();
      setCharacters(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Error loading characters');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCharacter)
      });

      if (response.ok) {
        // Reset form and refresh characters
        setNewCharacter({ name: '', description: '', traits: '' });
        fetchCharacters();
      }
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  if (loading) return <div>Loading characters...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="characters-section">
      <h2>Characters</h2>
      
      <form onSubmit={handleSubmit} className="character-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newCharacter.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={newCharacter.description}
            onChange={handleInputChange}
            className="form-control"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="traits">Traits:</label>
          <textarea
            id="traits"
            name="traits"
            value={newCharacter.traits}
            onChange={handleInputChange}
            className="form-control"
            rows="4"
            placeholder="Enter traits separated by commas"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">Add Character</button>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
            Cancel
          </button>
        </div>
      </form>

      <div className="characters-list">
        {characters.length === 0 ? (
          <p>No characters found. Create your first character!</p>
        ) : (
          <ul>
            {characters.map(character => (
              <li key={character._id} className="character-item">
                <h3>{character.name}</h3>
                <p>{character.description}</p>
                {character.traits && (
                  <p><strong>Traits:</strong> {character.traits.join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CharactersSection; 