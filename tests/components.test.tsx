import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Timer from '@Components/react/Timer';
import TaskForm from '@Components/react/TaskForm';

// Mock firestore functions
jest.mock('@Services/firestore', () => ({
  createTimeEntry: jest.fn(() => Promise.resolve({ id: 'test-id' })),
  updateTask: jest.fn(() => Promise.resolve()),
  createTask: jest.fn(() => Promise.resolve({ id: 'test-task-id' })),
  onTasksSnapshot: jest.fn(() => jest.fn()),
  deleteTask: jest.fn(() => Promise.resolve())
}));

describe('React Components', () => {
  test('Timer component renders correctly', () => {
    render(<Timer />);
    
    // Check if timer display is present
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    
    // Check if control buttons are present
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    
    // Check if task name input is present
    expect(screen.getByPlaceholderText('What are you working on?')).toBeInTheDocument();
  });

  test('Timer start/pause functionality works', () => {
    render(<Timer />);
    
    const startButton = screen.getByText('Start');
    
    // Click start button
    fireEvent.click(startButton);
    
    // Button should change to "Pause"
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  test('TaskForm renders correctly', () => {
    render(<TaskForm />);
    
    // Check if form fields are present
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    
    // Check if submit button is present
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });
});
