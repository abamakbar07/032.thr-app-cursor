'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useParams, useRouter } from 'next/navigation';
import { getGameRoom, getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/actions';
import Link from 'next/link';

interface Question {
  _id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'bronze' | 'silver' | 'gold';
  isSolved: boolean;
  createdAt: string;
}

interface QuestionFormData {
  content: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'bronze' | 'silver' | 'gold';
}

export default function ManageQuestionsPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [roomName, setRoomName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Form state for adding/editing questions
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'bronze',
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (typeof roomId !== 'string') return;
        
        // Get room details
        const roomResult = await getGameRoom(roomId);
        if (!roomResult.success || !roomResult.data) {
          setError(roomResult.error || 'Failed to load room data');
          return;
        }
        
        setRoomName(roomResult.data.name);
        
        // Get questions
        const questionsResult = await getQuestions(roomId);
        if (questionsResult.success && questionsResult.data) {
          setQuestions(questionsResult.data);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roomId]);
  
  const resetForm = () => {
    setFormData({
      content: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'bronze',
    });
    setIsEditing(false);
    setEditingId(null);
  };
  
  const handleEditQuestion = (question: Question) => {
    setFormData({
      content: question.content,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
    });
    setIsEditing(true);
    setEditingId(question._id);
    
    // Scroll to form
    document.getElementById('questionForm')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    setLoading(true);
    try {
      if (typeof roomId !== 'string') return;
      
      const result = await deleteQuestion(questionId);
      
      if (result.success) {
        setSuccess('Question deleted successfully');
        
        // Remove from list
        setQuestions(questions.filter(q => q._id !== questionId));
      } else {
        setError(result.error || 'Failed to delete question');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const updateOptionAt = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };
  
  const validateForm = (): boolean => {
    if (!formData.content.trim()) {
      setError('Question content is required');
      return false;
    }
    
    // Check if all options have content
    for (let i = 0; i < formData.options.length; i++) {
      if (!formData.options[i].trim()) {
        setError(`Option ${i + 1} is required`);
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (typeof roomId !== 'string') return;
      
      if (isEditing && editingId) {
        // Update existing question
        const result = await updateQuestion(editingId, formData);
        
        if (result.success && result.data) {
          setSuccess('Question updated successfully');
          
          // Update in list
          setQuestions(questions.map(q => 
            q._id === editingId ? { ...q, ...formData } as Question : q
          ));
          
          resetForm();
        } else {
          setError(result.error || 'Failed to update question');
        }
      } else {
        // Create new question
        const result = await createQuestion(roomId, formData);
        
        if (result.success && result.data) {
          setSuccess('Question created successfully');
          
          // Add to list
          setQuestions([...questions, result.data as Question]);
          
          resetForm();
        } else {
          setError(result.error || 'Failed to create question');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  // Group questions by difficulty for display
  const bronzeQuestions = questions.filter(q => q.difficulty === 'bronze');
  const silverQuestions = questions.filter(q => q.difficulty === 'silver');
  const goldQuestions = questions.filter(q => q.difficulty === 'gold');
  
  if (loading && error === null && !saving) {
    return <div className="p-8 text-center">Loading questions...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Questions</h1>
          <p className="text-gray-500">Room: {roomName}</p>
        </div>
        <Link href={`/dashboard/rooms/${roomId}`}>
          <Button variant="outline">Back to Room</Button>
        </Link>
      </div>
      
      {error && (
        <Card className="p-4 mb-6 bg-red-50 text-red-800">
          {error}
        </Card>
      )}
      
      {success && (
        <Card className="p-4 mb-6 bg-green-50 text-green-800">
          {success}
        </Card>
      )}
      
      {/* Question Form */}
      <Card className="p-6 mb-6" id="questionForm">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edit Question' : 'Add New Question'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="block mb-2 font-medium">
                Question
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter question content"
                className="w-full p-3 border rounded-md"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">
                Options
              </label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`correctAnswer${index}`}
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="mr-3"
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOptionAt(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    required
                  />
                </div>
              ))}
              <p className="text-sm text-gray-500">
                Select the radio button next to the correct answer.
              </p>
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block mb-2 font-medium">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'bronze' | 'silver' | 'gold' })}
                className="w-full p-3 border rounded-md"
                required
              >
                <option value="bronze">Bronze (Easy)</option>
                <option value="silver">Silver (Medium)</option>
                <option value="gold">Gold (Hard)</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-4">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={saving}
              >
                {saving ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <Card className="p-4 text-center bg-yellow-50">
            No questions created yet. Add your first question using the form above.
          </Card>
        ) : (
          <>
            {/* Bronze questions */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 bg-yellow-50 border-b">
                <h3 className="font-semibold">Bronze Questions (Easy)</h3>
                <p className="text-sm text-gray-600">{bronzeQuestions.length} questions</p>
              </div>
              
              {bronzeQuestions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No bronze questions yet
                </div>
              ) : (
                <div className="divide-y">
                  {bronzeQuestions.map((question) => (
                    <div key={question._id} className="p-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-medium">{question.content}</h4>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-md ${
                              index === question.correctAnswer 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {index === question.correctAnswer && (
                              <span className="text-green-600 text-xs font-semibold mr-1">✓</span>
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {question.isSolved ? 'Solved by participants' : 'Not solved yet'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* Silver questions */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 bg-gray-100 border-b">
                <h3 className="font-semibold">Silver Questions (Medium)</h3>
                <p className="text-sm text-gray-600">{silverQuestions.length} questions</p>
              </div>
              
              {silverQuestions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No silver questions yet
                </div>
              ) : (
                <div className="divide-y">
                  {silverQuestions.map((question) => (
                    <div key={question._id} className="p-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-medium">{question.content}</h4>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-md ${
                              index === question.correctAnswer 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {index === question.correctAnswer && (
                              <span className="text-green-600 text-xs font-semibold mr-1">✓</span>
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {question.isSolved ? 'Solved by participants' : 'Not solved yet'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* Gold questions */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 bg-yellow-100 border-b">
                <h3 className="font-semibold">Gold Questions (Hard)</h3>
                <p className="text-sm text-gray-600">{goldQuestions.length} questions</p>
              </div>
              
              {goldQuestions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No gold questions yet
                </div>
              ) : (
                <div className="divide-y">
                  {goldQuestions.map((question) => (
                    <div key={question._id} className="p-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-medium">{question.content}</h4>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-md ${
                              index === question.correctAnswer 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {index === question.correctAnswer && (
                              <span className="text-green-600 text-xs font-semibold mr-1">✓</span>
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {question.isSolved ? 'Solved by participants' : 'Not solved yet'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
} 