import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

interface QuestionFormProps {
  initialData?: {
    id?: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    points: number;
    timeLimit: number;
  };
  onSubmit: (question: {
    id?: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    points: number;
    timeLimit: number;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [question, setQuestion] = useState({
    id: initialData?.id || undefined,
    text: initialData?.text || '',
    options: initialData?.options || ['', '', '', ''],
    correctOptionIndex: initialData?.correctOptionIndex || 0,
    points: initialData?.points || 10,
    timeLimit: initialData?.timeLimit || 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!question.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    question.options.forEach((option, index) => {
      if (!option.trim()) {
        newErrors[`option-${index}`] = 'Option cannot be empty';
      }
    });
    
    if (question.points <= 0) {
      newErrors.points = 'Points must be greater than 0';
    }
    
    if (question.timeLimit <= 0) {
      newErrors.timeLimit = 'Time limit must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(question);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
    
    if (errors[`option-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`option-${index}`];
      setErrors(newErrors);
    }
  };

  const handleCorrectOptionChange = (index: number) => {
    setQuestion({ ...question, correctOptionIndex: index });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit Question' : 'Add New Question'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Input
              label="Question Text"
              value={question.text}
              onChange={(e) => {
                setQuestion({ ...question, text: e.target.value });
                if (errors.text) {
                  const newErrors = { ...errors };
                  delete newErrors.text;
                  setErrors(newErrors);
                }
              }}
              error={errors.text}
              placeholder="Enter the question text"
              fullWidth
              required
            />
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Options</div>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    error={errors[`option-${index}`]}
                    placeholder={`Option ${index + 1}`}
                    fullWidth
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="correctOption"
                    checked={question.correctOptionIndex === index}
                    onChange={() => handleCorrectOptionChange(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`option-${index}`}
                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Correct
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Points"
              type="number"
              value={question.points.toString()}
              onChange={(e) => {
                setQuestion({ ...question, points: parseInt(e.target.value) || 0 });
                if (errors.points) {
                  const newErrors = { ...errors };
                  delete newErrors.points;
                  setErrors(newErrors);
                }
              }}
              error={errors.points}
              min={1}
              max={100}
              required
            />
            <Input
              label="Time Limit (seconds)"
              type="number"
              value={question.timeLimit.toString()}
              onChange={(e) => {
                setQuestion({ ...question, timeLimit: parseInt(e.target.value) || 0 });
                if (errors.timeLimit) {
                  const newErrors = { ...errors };
                  delete newErrors.timeLimit;
                  setErrors(newErrors);
                }
              }}
              error={errors.timeLimit}
              min={5}
              max={120}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {initialData?.id ? 'Update Question' : 'Add Question'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 