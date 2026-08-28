"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  ListChecks,
  Users,
  HelpCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

interface MockTest {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  module: string | null;
  section: string | null;
  standardSection: string | null;
  type: string;
  duration: number;
  passingScore: number;
  questionsCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  allowRetake: boolean;
  createdAt: string;
  _count: {
    attempts: number;
    questions: number;
  };
}

interface Question {
  id: string;
  testId: string;
  type: string;
  questionText: string;
  audioUrl: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  options: any;
  correctAnswer: string | null;
  points: number;
  order: number;
  explanation: string | null;
  language: string | null;
  module: string | null;
  section: string | null;
  standardSection: string | null;
  difficulty: string | null;
  preparationTime: number | null;
  speakingTime: number | null;
  cueCardContent: string | null;
  followUpQuestions: any;
  createdAt: string;
  updatedAt: string;
}

const TEST_TYPES = [
  "PRACTICE",
  "FINAL",
  "CERTIFICATION",
  "LISTENING",
  "READING",
  "SPEAKING",
  "WRITING",
];

const QUESTION_TYPES = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_BLANK",
  "MATCHING",
  "AUDIO_QUESTION",
  "SPEAKING_PART1",
  "SPEAKING_PART2",
  "SPEAKING_PART3",
  "WRITING",
  "READING_COMPREHENSION",
  "LISTENING_COMPREHENSION",
];

const initialForm = {
  title: "",
  description: "",
  language: "JAPANESE",
  module: "",
  section: "",
  standardSection: "",
  type: "PRACTICE",
  duration: "60",
  passingScore: "60",
  shuffleQuestions: true,
  shuffleOptions: true,
  showResults: true,
  allowRetake: true,
};

const initialQuestionForm = {
  type: "MULTIPLE_CHOICE",
  questionText: "",
  options: "",
  correctAnswer: "",
  points: "1",
  explanation: "",
  difficulty: "",
  language: "",
  module: "",
  section: "",
  standardSection: "",
  preparationTime: "",
  speakingTime: "",
  cueCardContent: "",
  followUpQuestions: "",
};

export default function AdminMockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Question management state
  const [questionsTest, setQuestionsTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState(initialQuestionForm);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/mock-tests", {
        cache: "no-store",
      });
      const result = await response.json();

      if (result.success) {
        setTests(result.data?.data || []);
      } else {
        setError(result.message || "Failed to fetch tests");
      }
    } catch (err) {
      setError("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          language: formData.language || null,
          module: formData.module || null,
          section: formData.section || null,
          standardSection: formData.standardSection || null,
          type: formData.type,
          duration: formData.duration,
          passingScore: formData.passingScore,
          shuffleQuestions: formData.shuffleQuestions,
          shuffleOptions: formData.shuffleOptions,
          showResults: formData.showResults,
          allowRetake: formData.allowRetake,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowCreateDialog(false);
        setFormData(initialForm);
        fetchTests();
      } else {
        alert(result.message || "Failed to create test");
      }
    } catch (err) {
      alert("Failed to create test");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/mock-tests/${editingTest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          language: formData.language || null,
          module: formData.module || null,
          section: formData.section || null,
          standardSection: formData.standardSection || null,
          type: formData.type,
          duration: formData.duration,
          passingScore: formData.passingScore,
          shuffleQuestions: formData.shuffleQuestions,
          shuffleOptions: formData.shuffleOptions,
          showResults: formData.showResults,
          allowRetake: formData.allowRetake,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingTest(null);
        setFormData(initialForm);
        fetchTests();
      } else {
        alert(result.message || "Failed to update test");
      }
    } catch (err) {
      alert("Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const response = await fetch(`/api/admin/mock-tests/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setTests(tests.filter((t) => t.id !== id));
      } else {
        alert(result.message || "Failed to delete test");
      }
    } catch (err) {
      alert("Failed to delete test");
    }
  };

  const openEdit = (test: MockTest) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description || "",
      language: test.language || "JAPANESE",
      module: test.module || "",
      section: test.section || "",
      standardSection: test.standardSection || "",
      type: test.type,
      duration: String(test.duration),
      passingScore: String(test.passingScore),
      shuffleQuestions: test.shuffleQuestions,
      shuffleOptions: test.shuffleOptions,
      showResults: test.showResults,
      allowRetake: test.allowRetake,
    });
  };

  // Question management functions
  const openQuestions = async (test: MockTest) => {
    setQuestionsTest(test);
    setQuestionsLoading(true);
    setQuestions([]);
    try {
      const response = await fetch(`/api/admin/mock-tests/${test.id}/questions`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (result.success) {
        setQuestions(result.data || []);
      } else {
        alert(result.message || "Failed to fetch questions");
      }
    } catch (err) {
      alert("Failed to fetch questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm(initialQuestionForm);
    setShowQuestionDialog(true);
  };

  const openEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionDialog(true);
    setQuestionForm({
      type: question.type,
      questionText: question.questionText,
      options: question.options ? JSON.stringify(question.options) : "",
      correctAnswer: question.correctAnswer || "",
      points: String(question.points || 1),
      explanation: question.explanation || "",
      difficulty: question.difficulty || "",
      language: question.language || "",
      module: question.module || "",
      section: question.section || "",
      standardSection: question.standardSection || "",
      preparationTime: question.preparationTime ? String(question.preparationTime) : "",
      speakingTime: question.speakingTime ? String(question.speakingTime) : "",
      cueCardContent: question.cueCardContent || "",
      followUpQuestions: question.followUpQuestions ? JSON.stringify(question.followUpQuestions) : "",
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionsTest) return;
    setSavingQuestion(true);
    try {
      let options: any = undefined;
      if (questionForm.options.trim()) {
        try {
          options = JSON.parse(questionForm.options);
        } catch {
          // If not valid JSON, treat as comma-separated options
          options = questionForm.options.split(",").map((o) => o.trim()).filter(Boolean);
        }
      }

      let followUpQuestions: any = undefined;
      if (questionForm.followUpQuestions.trim()) {
        try {
          followUpQuestions = JSON.parse(questionForm.followUpQuestions);
        } catch {
          followUpQuestions = questionForm.followUpQuestions.split(",").map((q) => q.trim()).filter(Boolean);
        }
      }

      const payload = {
        type: questionForm.type,
        questionText: questionForm.questionText,
        options,
        correctAnswer: questionForm.correctAnswer || null,
        points: questionForm.points,
        explanation: questionForm.explanation || null,
        difficulty: questionForm.difficulty || null,
        language: questionForm.language || null,
        module: questionForm.module || null,
        section: questionForm.section || null,
        standardSection: questionForm.standardSection || null,
        preparationTime: questionForm.preparationTime || null,
        speakingTime: questionForm.speakingTime || null,
        cueCardContent: questionForm.cueCardContent || null,
        followUpQuestions,
      };

      let response;
      if (editingQuestion) {
        response = await fetch(
          `/api/admin/mock-tests/${questionsTest.id}/questions/${editingQuestion.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(`/api/admin/mock-tests/${questionsTest.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (result.success) {
        setShowQuestionDialog(false);
        setQuestionForm(initialQuestionForm);
        setEditingQuestion(null);
        await openQuestions(questionsTest);
        fetchTests();
      } else {
        alert(result.message || "Failed to save question");
      }
    } catch (err) {
      alert("Failed to save question");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!questionsTest) return;
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const response = await fetch(
        `/api/admin/mock-tests/${questionsTest.id}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (result.success) {
        setQuestions(questions.filter((q) => q.id !== questionId));
        fetchTests();
      } else {
        alert(result.message || "Failed to delete question");
      }
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  const filteredTests = tests.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Test title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Test description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEST_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={formData.language}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, language: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JAPANESE">Japanese</SelectItem>
              <SelectItem value="ENGLISH">English</SelectItem>
              <SelectItem value="KOREAN">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, duration: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passingScore">Passing Score (%)</Label>
          <Input
            id="passingScore"
            type="number"
            value={formData.passingScore}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, passingScore: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="module">Module</Label>
          <Input
            id="module"
            value={formData.module}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, module: e.target.value }))
            }
            placeholder="e.g. JLPT"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            value={formData.section}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, section: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="standardSection">Standard Section</Label>
          <Input
            id="standardSection"
            value={formData.standardSection}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                standardSection: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Shuffle Questions</Label>
          <Switch
            checked={formData.shuffleQuestions}
            onCheckedChange={(v) =>
              setFormData((prev) => ({ ...prev, shuffleQuestions: v }))
            }
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Shuffle Options</Label>
          <Switch
            checked={formData.shuffleOptions}
            onCheckedChange={(v) =>
              setFormData((prev) => ({ ...prev, shuffleOptions: v }))
            }
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Show Results</Label>
          <Switch
            checked={formData.showResults}
            onCheckedChange={(v) =>
              setFormData((prev) => ({ ...prev, showResults: v }))
            }
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Allow Retake</Label>
          <Switch
            checked={formData.allowRetake}
            onCheckedChange={(v) =>
              setFormData((prev) => ({ ...prev, allowRetake: v }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowCreateDialog(false);
            setEditingTest(null);
            setFormData(initialForm);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingTest ? "Update Test" : "Create Test"}
        </Button>
      </div>
    </form>
  );

  const renderQuestionForm = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Question Type *</Label>
        <Select
          value={questionForm.type}
          onValueChange={(v) =>
            setQuestionForm((prev) => ({ ...prev, type: v }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questionText">Question Text *</Label>
        <Textarea
          id="questionText"
          value={questionForm.questionText}
          onChange={(e) =>
            setQuestionForm((prev) => ({ ...prev, questionText: e.target.value }))
          }
          placeholder="Enter the question text"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="options">Options (JSON array or comma-separated)</Label>
        <Textarea
          id="options"
          value={questionForm.options}
          onChange={(e) =>
            setQuestionForm((prev) => ({ ...prev, options: e.target.value }))
          }
          placeholder='["Option A", "Option B", "Option C", "Option D"]'
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">Correct Answer</Label>
          <Input
            id="correctAnswer"
            value={questionForm.correctAnswer}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, correctAnswer: e.target.value }))
            }
            placeholder="Correct answer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={questionForm.points}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, points: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={questionForm.explanation}
          onChange={(e) =>
            setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))
          }
          placeholder="Explanation for the correct answer"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Input
            id="difficulty"
            value={questionForm.difficulty}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            placeholder="e.g. EASY, MEDIUM, HARD"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={questionForm.language}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, language: e.target.value }))
            }
            placeholder="e.g. JAPANESE"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="module">Module</Label>
          <Input
            id="module"
            value={questionForm.module}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, module: e.target.value }))
            }
            placeholder="e.g. JLPT"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            value={questionForm.section}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, section: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="standardSection">Standard Section</Label>
          <Input
            id="standardSection"
            value={questionForm.standardSection}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, standardSection: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preparationTime">Preparation Time (sec)</Label>
          <Input
            id="preparationTime"
            type="number"
            value={questionForm.preparationTime}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, preparationTime: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="speakingTime">Speaking Time (sec)</Label>
          <Input
            id="speakingTime"
            type="number"
            value={questionForm.speakingTime}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, speakingTime: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cueCardContent">Cue Card Content</Label>
          <Input
            id="cueCardContent"
            value={questionForm.cueCardContent}
            onChange={(e) =>
              setQuestionForm((prev) => ({ ...prev, cueCardContent: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="followUpQuestions">Follow-up Questions (JSON array or comma-separated)</Label>
        <Textarea
          id="followUpQuestions"
          value={questionForm.followUpQuestions}
          onChange={(e) =>
            setQuestionForm((prev) => ({ ...prev, followUpQuestions: e.target.value }))
          }
          placeholder='["Follow-up question 1", "Follow-up question 2"]'
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowQuestionDialog(false);
            setEditingQuestion(null);
            setQuestionForm(initialQuestionForm);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={savingQuestion}>
          {savingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingQuestion ? "Update Question" : "Add Question"}
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mock Tests Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage mock tests
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Test
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Search */}
      <div className="max-w-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <Card
            key={test.id}
            className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-foreground text-base line-clamp-2">
                    {test.title}
                  </CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {test.type}
                    </span>
                    {test.language && <span>{test.language}</span>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ListChecks size={14} />
                  {test.questionsCount} questions
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {test._count?.attempts || 0} attempts
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                    onClick={() => openEdit(test)}
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-primary hover:bg-primary/10 bg-transparent"
                  onClick={() => openQuestions(test)}
                >
                  <HelpCircle size={14} className="mr-1" />
                  Add Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No tests found. Create your first mock test!
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setFormData(initialForm);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Mock Test</DialogTitle>
          </DialogHeader>
          {renderForm(handleCreate)}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTest}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTest(null);
            setFormData(initialForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mock Test</DialogTitle>
          </DialogHeader>
          {editingTest && renderForm(handleUpdate)}
        </DialogContent>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog
        open={!!questionsTest}
        onOpenChange={(open) => {
          if (!open) {
            setQuestionsTest(null);
            setQuestions([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {questionsTest ? `Questions - ${questionsTest.title}` : "Questions"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={openAddQuestion}
            >
              <Plus size={14} className="mr-1" />
              Add Question
            </Button>
          </div>

          {questionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No questions yet. Click "Add Question" to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Q{index + 1}.
                        </span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                          {question.type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {question.points} pts
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {question.questionText}
                      </p>
                      {question.options && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Array.isArray(question.options) &&
                            question.options.map((opt: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs"
                              >
                                {opt}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditQuestion(question)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Question Dialog */}
      <Dialog
        open={showQuestionDialog}
        onOpenChange={(open) => {
          setShowQuestionDialog(open);
          if (!open) {
            setEditingQuestion(null);
            setQuestionForm(initialQuestionForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </DialogTitle>
          </DialogHeader>
          {renderQuestionForm(handleSaveQuestion)}
        </DialogContent>
      </Dialog>
    </div>
  );
}