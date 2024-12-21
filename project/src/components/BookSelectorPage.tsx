import React, { useState, useEffect } from 'react';
import { Book, Search, CheckCircle2, ArrowUpDown, Eye } from 'lucide-react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import PDFViewerDialog from './PDFViewerDialog';

interface BookType {
  id: number;
  title: string;
  author: string;
  category: number;
  categoryName?: string;
  grade: number;
  gradeName?: string;
  file_type: string;
  file_size_display: string;
  uploaded_at: string;
  selected?: boolean;
}

export default function BookSelectorPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [categories, setCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const [topic, setTopic] = useState('');
  const [showIngestionDialog, setShowIngestionDialog] = useState(false);
  const [viewPdfUrl, setViewPdfUrl] = useState('');
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory, selectedGrade]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, gradesRes, booksRes] = await Promise.all([
        api.get('/api/categories/'),
        api.get('/api/grades/'),
        api.get('/api/books/', {
          params: {
            search: searchTerm || undefined,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            grade: selectedGrade !== 'All' ? selectedGrade : undefined,
          }
        })
      ]);

      console.log('API Responses:', {
        categories: categoriesRes.data,
        grades: gradesRes.data,
        books: booksRes.data
      });

      // Create maps for categories and grades
      const categoryMap = new Map(
        categoriesRes.data.results.map(cat => [Number(cat.id), cat.name])
      );
      const gradeMap = new Map(
        gradesRes.data.results.map(grade => [Number(grade.id), grade.name])
      );

      console.log('Maps:', {
        categoryMap: Object.fromEntries(categoryMap),
        gradeMap: Object.fromEntries(gradeMap)
      });

      // Enhance books with category and grade names
      const enhancedBooks = booksRes.data.results.map(book => ({
        ...book,
        category: Number(book.category),
        grade: Number(book.grade),
        categoryName: categoryMap.get(Number(book.category)) || 'Unknown Category',
        gradeName: gradeMap.get(Number(book.grade)) || 'Unknown Grade',
        selected: false
      }));

      setCategories(categoriesRes.data.results);
      setGrades(gradesRes.data.results);
      setBooks(enhancedBooks);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelection = (bookId: number) => {
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, selected: !book.selected } : book
    ));
  };

  const handleGenerateQuestions = async () => {
    const selectedBookIds = books
      .filter(book => book.selected)
      .map(book => book.id);

    if (selectedBookIds.length === 0) {
      alert('Please select at least one book');
      return;
    }

    try {
      setShowIngestionDialog(true);
      const response = await api.post('/api/questions/generate/', {
        book_ids: selectedBookIds,
        topic: topic || undefined
      });
      navigate('/generate-questions', { state: { questions: response.data } });
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Error generating questions');
    } finally {
      setShowIngestionDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Select Books for Question Generation</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            className="border rounded-lg px-4 py-2"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="All">All Grades</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter topic for question generation (optional)"
            className="w-full border rounded-lg px-4 py-2"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Books Grid */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className={`p-4 border rounded-lg ${
                  book.selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  <button
                    onClick={() => handleBookSelection(book.id)}
                    className={`p-1 rounded-full ${
                      book.selected ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Category: {book.categoryName}</p>
                  <p>Grade: {book.gradeName}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBookTitle(book.title);
                    setViewPdfUrl(`/api/books/${book.id}/view/`);
                    setIsViewerOpen(true);
                  }}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Generate Questions Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerateQuestions}
            disabled={!books.some(book => book.selected)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
          >
            Generate Questions
          </button>
        </div>
      </div>

      {/* PDF Viewer Dialog */}
      <PDFViewerDialog
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        bookTitle={selectedBookTitle}
        pdfUrl={viewPdfUrl}
      />

      {/* Ingestion Dialog */}
      {showIngestionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Generating questions... Please wait.</p>
          </div>
        </div>
      )}
    </div>
  );
}