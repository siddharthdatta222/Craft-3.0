import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock fetch responses
const mockScripts = [
    {
        id: '1',
        title: 'Test Script 1',
        createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
        id: '2',
        title: 'Test Script 2',
        createdAt: '2024-01-02T00:00:00.000Z'
    }
];

// Wrap component with Router for Link components
const DashboardWrapper = () => (
    <BrowserRouter>
        <Dashboard />
    </BrowserRouter>
);

describe('Dashboard Component', () => {
    beforeEach(() => {
        // Reset fetch mock before each test
        global.fetch = jest.fn();
    });

    it('renders welcome message with username', async () => {
        render(<DashboardWrapper />);
        await waitFor(() => {
            expect(screen.getByText(/Welcome, testuser!/i)).toBeInTheDocument();
        });
    });

    it('loads and displays scripts', async () => {
        // Mock successful fetch response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockScripts
        });

        render(<DashboardWrapper />);

        // Wait for scripts to load
        await waitFor(() => {
            expect(screen.getByText('Test Script 1')).toBeInTheDocument();
            expect(screen.getByText('Test Script 2')).toBeInTheDocument();
        });

        // Verify dates are formatted correctly (matching the actual format in Dashboard)
        await waitFor(() => {
            expect(screen.getByText('Created: 2/1/2024')).toBeInTheDocument();
            expect(screen.getByText('Created: 2/1/2024')).toBeInTheDocument();
        });
    });

    it('handles script loading error', async () => {
        // Mock failed fetch response
        global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<DashboardWrapper />);

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/Error loading scripts/i)).toBeInTheDocument();
        });
    });

    it('handles logout', async () => {
        render(<DashboardWrapper />);

        // Click logout button
        fireEvent.click(screen.getByText('Logout'));

        // Verify logged out state
        await waitFor(() => {
            expect(screen.getByText(/Please log in to access your dashboard/i)).toBeInTheDocument();
        });
    });

    it('renders navigation buttons', async () => {
        render(<DashboardWrapper />);

        // Check if all navigation buttons are present
        await waitFor(() => {
            expect(screen.getByText('Script Editor')).toBeInTheDocument();
            expect(screen.getByText('Node Architecture')).toBeInTheDocument();
            expect(screen.getByText('Subscriptions')).toBeInTheDocument();
        });
    });

    it('displays loading state while fetching scripts', async () => {
        // Mock a delayed fetch response
        global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(<DashboardWrapper />);

        // Check if loading message is displayed
        expect(screen.getByText('Loading scripts...')).toBeInTheDocument();
    });

    it('displays empty state message when no scripts', async () => {
        // Mock empty scripts array response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        render(<DashboardWrapper />);

        // Wait for empty state message
        await waitFor(() => {
            expect(screen.getByText('No scripts found. Start creating!')).toBeInTheDocument();
        });
    });
}); 