import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book, Download } from 'react-feather';
import { BookType } from '../types/book';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function GenerateQuestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBooks, setSelectedBooks] = useState<BookType[]>([]);
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const books = location.state?.selectedBooks;
    if (!books || books.length === 0) {
      navigate('/select-books');
    } else {
      setSelectedBooks(books);
    }
  }, [location, navigate]);

  const handleStartGeneration = () => {
    setShowTopicInput(true);
  };

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock questions - replace with API response
      const mockQuestions: Question[] = [
        {
          id: 1,
          text: `Sample question about ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: 0,
          difficulty: 'Easy'
        },
        // Add more mock questions...
      ];
      
      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // Implement PDF download logic
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Selected Books Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Books</h2>
        <div className="space-y-3">
          {selectedBooks.map((book) => (
            <div key={book.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Book className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
        
        {!showTopicInput && (
          <button
            onClick={handleStartGeneration}
            className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Generate Questions
          </button>
        )}
      </div>

      {/* Topic Input Section */}
      {showTopicInput && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleGenerateQuestions}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Topic for Questions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, World War II..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generated Questions Section */}
      {questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Generated Questions</h2>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-900">Question {index + 1}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {question.difficulty}
                  </span>
                </div>
                <p className="text-gray-800 mb-3">{question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg ${
                        optIndex === question.correctOption
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}