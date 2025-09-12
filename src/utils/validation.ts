// Validation result type
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// Category validation
export const validateCategory = (name: string, color?: string): ValidationResult => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Category name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Category name must be at least 2 characters long' };
    }

    if (name.trim().length > 50) {
        return { isValid: false, error: 'Category name must be less than 50 characters' };
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        return { isValid: false, error: 'Color must be a valid hex code (e.g., #FF5733)' };
    }

    return { isValid: true };
};

// Task validation
export const validateTask = (title: string, description?: string, categoryId?: string): ValidationResult => {
    if (!title || title.trim().length === 0) {
        return { isValid: false, error: 'Task title is required' };
    }

    if (title.trim().length < 2) {
        return { isValid: false, error: 'Task title must be at least 2 characters long' };
    }

    if (title.trim().length > 100) {
        return { isValid: false, error: 'Task title must be less than 100 characters' };
    }

    if (description && description.trim().length > 500) {
        return { isValid: false, error: 'Task description must be less than 500 characters' };
    }

    if (!categoryId || categoryId.trim().length === 0) {
        return { isValid: false, error: 'Please select a category for this task' };
    }

    return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password must be less than 128 characters' };
    }

    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one letter and one number' };
    }

    return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
        return { isValid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match' };
    }

    return { isValid: true };
};

// Display name validation
export const validateDisplayName = (displayName: string): ValidationResult => {
    if (!displayName || displayName.trim().length === 0) {
        return { isValid: false, error: 'Display name is required' };
    }

    if (displayName.trim().length < 2) {
        return { isValid: false, error: 'Display name must be at least 2 characters long' };
    }

    if (displayName.trim().length > 50) {
        return { isValid: false, error: 'Display name must be less than 50 characters' };
    }

    // Only allow letters, numbers, spaces, and basic punctuation
    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(displayName.trim())) {
        return { isValid: false, error: 'Display name can only contain letters, numbers, spaces, and basic punctuation' };
    }

    return { isValid: true };
};

// Date range validation
export const validateDateRange = (startDate: Date, endDate: Date): ValidationResult => {
    if (!startDate || !endDate) {
        return { isValid: false, error: 'Both start and end dates are required' };
    }

    if (startDate > endDate) {
        return { isValid: false, error: 'Start date must be before end date' };
    }

    // Check if date range is not too far in the future
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

    if (endDate > maxFutureDate) {
        return { isValid: false, error: 'End date cannot be more than one year in the future' };
    }

    // Check if date range is reasonable (not more than 2 years)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 730) { // 2 years
        return { isValid: false, error: 'Date range cannot exceed 2 years' };
    }

    return { isValid: true };
};

// Manual time entry validation
export const validateManualTimeEntry = (
    taskId: string,
    startTime: Date,
    endTime: Date,
    description?: string
): ValidationResult => {
    if (!taskId || taskId.trim().length === 0) {
        return { isValid: false, error: 'Please select a task' };
    }

    if (!startTime || !endTime) {
        return { isValid: false, error: 'Both start and end times are required' };
    }

    if (startTime >= endTime) {
        return { isValid: false, error: 'Start time must be before end time' };
    }

    // Check if the time entry is not too long (more than 24 hours)
    const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) {
        return { isValid: false, error: 'Time entry cannot exceed 24 hours' };
    }

    // Check if times are not in the future
    const now = new Date();
    if (startTime > now || endTime > now) {
        return { isValid: false, error: 'Time entries cannot be in the future' };
    }

    if (description && description.trim().length > 200) {
        return { isValid: false, error: 'Description must be less than 200 characters' };
    }

    return { isValid: true };
};

// Generic form validation helper
export const validateForm = (validations: ValidationResult[]): ValidationResult => {
    for (const validation of validations) {
        if (!validation.isValid) {
            return validation;
        }
    }
    return { isValid: true };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
        .substring(0, 1000); // Limit length
};