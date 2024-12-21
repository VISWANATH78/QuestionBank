import React, { useState, useEffect, useRef } from 'react';
import { Book, Search, Download, Eye } from 'lucide-react';
import { api } from '../api/axios';
import PDFViewerDialog from './PDFViewerDialog';
import { BookType, Category, Grade } from '../types/book';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDebounce } from '../hooks/useDebounce';

interface ApiResponse<T> {
  results: T[];
  count: number;
}

// Add loading skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default function BookViewPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [categories, setCategories] = useState<Category[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [viewPdfUrl, setViewPdfUrl] = useState('');
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories and grades
      const [categoriesRes, gradesRes] = await Promise.all([
        api.get('/api/categories/'),
        api.get('/api/grades/')
      ]);

      const categoriesData = categoriesRes.data || [];
      const gradesData = gradesRes.data || [];
      setCategories(categoriesData);
      setGrades(gradesData);

      // Create lookup objects
      const categoryLookup = {};
      const gradeLookup = {};
      
      categoriesData.forEach(cat => {
        categoryLookup[cat.id] = cat.name;
      });
      
      gradesData.forEach(grade => {
        gradeLookup[grade.id] = grade.name;
      });

      console.log('Lookups:', { categoryLookup, gradeLookup });

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedGrade !== 'All') params.append('grade', selectedGrade);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', page.toString());
      params.append('page_size', itemsPerPage.toString());

      // Fetch books
      const booksRes = await api.get(`/api/books/?${params.toString()}`);
      console.log('Books Response:', booksRes.data);

      // Handle both paginated and non-paginated responses
      let booksData;
      if (Array.isArray(booksRes.data)) {
        // Non-paginated response
        booksData = booksRes.data;
        setTotalItems(booksRes.data.length);
        setTotalPages(Math.ceil(booksRes.data.length / itemsPerPage));
      } else {
        // Paginated response
        booksData = booksRes.data.results || [];
        setTotalItems(booksRes.data.count || booksData.length);
        setTotalPages(Math.ceil((booksRes.data.count || booksData.length) / itemsPerPage));
      }

      // Process books with lookups
      const enhancedBooks = booksData.map(book => ({
        ...book,
        categoryName: categoryLookup[book.category] || `Category ${book.category}`,
        gradeName: gradeLookup[book.grade] || `Grade ${book.grade}`
      }));

      setBooks(enhancedBooks);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load books and filters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
    fetchData();
  }, [debouncedSearchTerm, selectedCategory, selectedGrade]);

  useEffect(() => {
    fetchData();
  }, [page]); // Fetch when page changes

  const handleDownload = async (bookId: number) => {
    try {
      const response = await api.get(`/api/books/${bookId}/download/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `book-${bookId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Error downloading book');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: any) => {
    setLoading(true);
    setSelectedCategory(e.target.value);
  };

  const handleGradeChange = (e: any) => {
    setLoading(true);
    setSelectedGrade(e.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 transition-all duration-300 ease-in-out will-change-transform">
      <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 transform-gpu">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 transition-colors duration-200">Book Library</h1>
        </div>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative transform-gpu transition-all duration-200">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 
              ${loading ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search books..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg 
                       transition-all duration-200 ease-in-out transform-gpu
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       hover:border-gray-400"
              value={searchTerm}
              onChange={handleSearch}
              disabled={loading}
            />
          </div>
          
          {/* Category Filter */}
          <FormControl fullWidth>
            <InputLabel className="transition-all duration-200">Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
              className="transform-gpu transition-all duration-200"
              disabled={loading}
            >
              <MenuItem value="All">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem 
                  key={category.id} 
                  value={category.id}
                  className="transition-all duration-200"
                >
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Grade Filter */}
          <FormControl fullWidth>
            <InputLabel className="transition-all duration-200">Grade</InputLabel>
            <Select
              value={selectedGrade}
              onChange={handleGradeChange}
              label="Grade"
              className="transform-gpu transition-all duration-200"
              disabled={loading}
            >
              <MenuItem value="All">All Grades</MenuItem>
              {grades.map((grade) => (
                <MenuItem 
                  key={grade.id} 
                  value={grade.id}
                  className="transition-all duration-200"
                >
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Books Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow transition-all duration-300 transform-gpu">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Author', 'Category', 'Grade', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {[...Array(5)].map((_, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                Array.isArray(books) && books.map((book) => (
                  <tr 
                    key={book.id} 
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.categoryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.gradeName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => {
                          setSelectedBookTitle(book.title);
                          setViewPdfUrl(`/api/books/${book.id}/view/`);
                          setIsViewerOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View"
                      >
                        <Eye className="h-5 w-5 inline transform transition-transform duration-200 hover:scale-110" />
                      </button>
                      <button
                        onClick={() => handleDownload(book.id)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        title="Download"
                      >
                        <Download className="h-5 w-5 inline transform transition-transform duration-200 hover:scale-110" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{((page - 1) * itemsPerPage) + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(page * itemsPerPage, totalItems)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalItems}</span>
                {' '}results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(null, page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md transition-all duration-200 
                    ${page === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(null, index + 1)}
                      className={`px-3 py-1 rounded-md transition-all duration-200 
                        ${page === index + 1
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(null, page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md transition-all duration-200 
                    ${page === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PDFViewerDialog
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        bookTitle={selectedBookTitle}
        pdfUrl={viewPdfUrl}
      />
    </div>
  );
}