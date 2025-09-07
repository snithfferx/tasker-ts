import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createTask } from '@Services/firestore';
import { getCurrentUserId } from '@Services/auth';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function TaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setSuccess('');
    
    try {
      const uid = getCurrentUserId();
      await createTask(uid, {
        title: data.title,
        description: data.description,
        project: data.project,
        priority: data.priority ?? 'medium',
        dueDate: data.dueDate,
        completed: false,
        timeSpent: 0,
      });
      console.log('Saving task:', data);
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Task created successfully!');
      reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Task Title *
        </label>
        <input
          type="text"
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          {...register('description')}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            id="project"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue=""
            {...register('project')}
          >
            <option value="">Select a project</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="learning">Learning</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue="medium"
            {...register('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          min={new Date().toISOString().split('T')[0]}
          {...register('dueDate')}
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => reset()}
          className="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
