require('@testing-library/jest-dom');

// Mock fetch globally
global.fetch = jest.fn();

// Mock socket.io-client
jest.mock('socket.io-client', () => {
    const emit = jest.fn();
    const on = jest.fn();
    const off = jest.fn();
    const disconnect = jest.fn();

    return jest.fn(() => ({
        emit,
        on,
        off,
        disconnect
    }));
}); 