import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../api/axios';

interface Book {
  id: number;
  title: string;
  author: string;
  category: number;
  grade: number;
  file: string;
  uploaded_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  name: string;
}

export default function BookImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<Book[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, gradesRes, booksRes] = await Promise.all([
          api.get('/api/categories/'),
          api.get('/api/grades/'),
          api.get('/api/books/'),
        ]);
        setCategories(categoriesRes.data || []);
        setGrades(gradesRes.data || []);
        setRecentUploads(booksRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary data.');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('pdf_file', file!);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('category_id', selectedCategory.toString());
    formData.append('grade_id', selectedGrade.toString());
    formData.append('file_type', 'PDF');

    setUploading(true);
    try {
      const response = await api.post('/api/books/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 201) {
        setSuccess('Book uploaded successfully!');
        resetForm();
        refreshRecentUploads();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload book. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!file) {
      setError('Please select a PDF file.');
      return false;
    }
    if (!file.type.toLowerCase().includes('pdf')) {
      setError('Only PDF files are allowed.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB.');
      return false;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return false;
    }
    if (!author.trim()) {
      setError('Author is required.');
      return false;
    }
    if (!selectedCategory) {
      setError('Category is required.');
      return false;
    }
    if (!selectedGrade) {
      setError('Grade is required.');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setAuthor('');
    setSelectedCategory('');
    setSelectedGrade('');
  };

  const refreshRecentUploads = async () => {
    try {
      const response = await api.get('/api/books/');
      setRecentUploads(response.data || []);
    } catch (err) {
      console.error('Error refreshing books:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Import Books</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-md">
          <div>
            <label className="block text-sm font-medium">File</label>
            <div
              className={`border-2 border-dashed rounded p-4 ${
                file ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="w-full cursor-pointer"
              />
              <p>{file ? file.name : 'Drop your PDF or click to browse'}</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Grade</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            {uploading ? 'Uploading...' : 'Upload Book'}
          </button>
        </form>
      </div>
    </div>
  );
}
