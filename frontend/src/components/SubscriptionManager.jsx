import React, { useState, useEffect } from 'react';

const SubscriptionManager = () => {
    // State management
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [currentSubscription, setCurrentSubscription] = useState(null);

    // Simulated user data
    const dummyUser = {
        userId: '1',
        name: 'Test User'
    };

    // Fetch subscription plans and current subscription on component mount
    useEffect(() => {
        loadPlansAndSubscription();
    }, []);

    // Function to load plans and current subscription
    const loadPlansAndSubscription = async () => {
        try {
            // Fetch plans
            const plansResponse = await fetch('/api/subscriptions/plans');
            const plansData = await plansResponse.json();
            setPlans(plansData);

            // Fetch current subscription
            const subscriptionResponse = await fetch(`/api/subscriptions/user/${dummyUser.userId}`);
            if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json();
                setCurrentSubscription(subscriptionData);
            }

            setLoading(false);
        } catch (error) {
            setError('Error loading subscription data: ' + error.message);
            setLoading(false);
        }
    };

    // Function to handle subscription
    const handleSubscribe = async (planId) => {
        try {
            setMessage(''); // Clear previous messages
            
            const response = await fetch('/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dummyUser.userId,
                    planId: planId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }

            // Update current subscription and show success message
            setCurrentSubscription(data);
            setMessage(`Successfully subscribed to ${plans.find(p => p.planId === planId).name} plan!`);
            
        } catch (error) {
            setError('Error subscribing: ' + error.message);
        }
    };

    if (loading) {
        return <div className="subscription-manager loading">Loading subscription plans...</div>;
    }

    return (
        <div className="subscription-manager">
            <h2>Subscription Plans</h2>
            
            {/* Message display */}
            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}

            {/* Current subscription display */}
            {currentSubscription && (
                <div className="current-subscription">
                    <h3>Current Plan</h3>
                    <p>
                        {plans.find(p => p.planId === currentSubscription.planId)?.name || 'Unknown Plan'}
                        <span className="status">Active</span>
                    </p>
                </div>
            )}

            {/* Plans grid */}
            <div className="plans-grid">
                {plans.map((plan) => (
                    <div key={plan.planId} className="plan-card">
                        <h3>{plan.name}</h3>
                        <div className="price">${plan.price}/month</div>
                        
                        <ul className="features">
                            {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.planId)}
                            className={currentSubscription?.planId === plan.planId ? 'current' : ''}
                            disabled={currentSubscription?.planId === plan.planId}
                        >
                            {currentSubscription?.planId === plan.planId ? 'Current Plan' : 'Subscribe'}
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .subscription-manager {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                .message {
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                }

                .message.success {
                    background-color: #d4edda;
                    color: #155724;
                }

                .message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .current-subscription {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }

                .status {
                    margin-left: 10px;
                    padding: 4px 8px;
                    background-color: #28a745;
                    color: white;
                    border-radius: 12px;
                    font-size: 0.8em;
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }

                .plan-card {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }

                .price {
                    font-size: 1.5em;
                    color: #007bff;
                    margin: 15px 0;
                }

                .features {
                    list-style: none;
                    padding: 0;
                    margin: 20px 0;
                    text-align: left;
                }

                .features li {
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }

                .features li:last-child {
                    border-bottom: none;
                }

                button {
                    width: 100%;
                    padding: 12px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                button:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                button:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                button.current {
                    background-color: #28a745;
                }
            `}</style>
        </div>
    );
};

export default SubscriptionManager; 