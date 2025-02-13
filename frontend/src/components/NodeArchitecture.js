import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NodeArchitecture.css';

function NodeArchitecture() {
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const handleAddNode = () => {
        const newNode = {
            id: Date.now(),
            title: 'New Node',
            content: '',
            position: { x: 100, y: 100 }
        };
        setNodes([...nodes, newNode]);
    };

    return (
        <div className="node-architecture">
            <div className="toolbar">
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                <button onClick={handleAddNode}>Add Node</button>
            </div>
            
            <div className="workspace">
                {nodes.map(node => (
                    <div
                        key={node.id}
                        className={`node ${selectedNode?.id === node.id ? 'selected' : ''}`}
                        style={{
                            left: node.position.x,
                            top: node.position.y
                        }}
                        onClick={() => setSelectedNode(node)}
                    >
                        <div className="node-title">{node.title}</div>
                        <div className="node-content">{node.content}</div>
                    </div>
                ))}
            </div>
            
            {selectedNode && (
                <div className="node-editor">
                    <h3>Edit Node</h3>
                    <input
                        type="text"
                        value={selectedNode.title}
                        onChange={(e) => {
                            const updatedNodes = nodes.map(n =>
                                n.id === selectedNode.id
                                    ? { ...n, title: e.target.value }
                                    : n
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({ ...selectedNode, title: e.target.value });
                        }}
                    />
                    <textarea
                        value={selectedNode.content}
                        onChange={(e) => {
                            const updatedNodes = nodes.map(n =>
                                n.id === selectedNode.id
                                    ? { ...n, content: e.target.value }
                                    : n
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({ ...selectedNode, content: e.target.value });
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default NodeArchitecture; 