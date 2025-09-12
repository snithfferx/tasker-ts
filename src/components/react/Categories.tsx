import { useEffect, useState } from 'react';
import { createCategory, deleteCategory, onCategoriesSnapshot } from '@Services/firestore';
import type { Category } from '@Types/category';
import { getCurrentUserId } from '@Services/auth';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getCurrentUserId();
    const unsub = onCategoriesSnapshot(uid, (items) => {
      setCategories(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const uid = getCurrentUserId();
    await createCategory(uid, trimmed);
    setName('');
  };

  const remove = async (id?: string) => {
    if (!id) return;
    const uid = getCurrentUserId();
    await deleteCategory(uid, id);
  };

  if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map((c) => (
            <li key={c.id} className="py-2 flex items-center justify-between dark:text-gray-200">
              <span>{c.name}</span>
              <button
                onClick={() => remove(c.id)}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
