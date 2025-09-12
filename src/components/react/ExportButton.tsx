import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@Services/firebase';

const ExportButton: React.FC = () => {
  const exportToCSV = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to export data.');
      return;
    }

    const tasksSnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/tasks`));
    const tasks = tasksSnapshot.docs.map(doc => doc.data());

    if (tasks.length === 0) {
      alert('No tasks to export.');
      return;
    }

    const headers = Object.keys(tasks[0]).join(',');
    const csv = tasks.map(task => {
      return Object.values(task).map(value => {
        if (typeof value === 'string') {
          return `"${value.replace( /"/g, '""')}"`;
        }
        return value;
      }).join(',');
    }).join('\n');

    const blob = new Blob([headers + '\n' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={exportToCSV} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-700 dark:hover:bg-blue-900">
      Export to CSV
    </button>
  );
};

export default ExportButton;
