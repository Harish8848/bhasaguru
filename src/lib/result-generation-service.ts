
// Result Generation System - Creates comprehensive test results with section breakdowns

import { prisma } from './prisma';
import { EvaluationResult } from './unified-evaluation-service';
import { QuestionType } from './types/test';
import { TestType } from '@/generated/prisma/enums';

export interface SectionBreakdown {
  sectionId: string;
  sectionName: string;
  standardSection?: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  timeLimit?: number;
  difficulty?: string;
  language?: string;
  module?: string;
  accuracy: number;
}

export interface TestResultSummary {
  attemptId: string;
  userId: string;
  testId: string;
  testTitle: string;
  examType: TestType;
  level?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  status: 'pass' | 'fail' | 'pending' | 'incomplete';
  timeSpent: number;
  startedAt: Date;
  completedAt: Date;
  submittedAt: Date;
  sectionBreakdowns: SectionBreakdown[];
  evaluationResults: EvaluationResult[];
  passingScore: number;
  resultMetadata: {
    autoGraded: number;
    manualReview: number;
    pending: number;
    skipped: number;
    averageTimePerQuestion: number;
    fastestQuestion: { questionId: string; timeSpent: number };
    slowestQuestion: { questionId: string; timeSpent: number };
  };
}

export interface PerformanceAnalytics {
  weakAreas: string[];
  strongAreas: string[];
  improvementSuggestions: string[];
  timeManagementAnalysis: {
    averageTimePerSection: Record<string, number>;
    timeEfficiency: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  };
  accuracyByDifficulty: Record<string, number>;
  accuracyByLanguage: Record<string, number>;
  trendAnalysis: 'improving' | 'declining' | 'stable';
}

export class ResultGenerationService {

  /**
   * Generate comprehensive test result with section breakdowns
   */
  async generateComprehensiveResult(
    attemptId: string,
    evaluationResults: EvaluationResult[]
  ): Promise<TestResultSummary> {
    try {
      // Get attempt with related data
      const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
          test: true,
          answers: {
            include: {
              question: true
            }
          },
          speakingScore: true
        }
      });

      if (!attempt) {
        throw new Error('Test attempt not found');
      }

      const test = attempt.test;
      if (!test) {
        throw new Error('Test not found');
      }

      // Generate section breakdowns
      const sectionBreakdowns = await this.generateSectionBreakdowns(
        attempt.answers,
        evaluationResults
      );

      // Calculate overall statistics
      const totalQuestions = attempt.totalQuestions;
      const correctAnswers = attempt.correctAnswers;
      const percentage = (attempt.score / (totalQuestions || 1)) * 100;

      // Generate result metadata
      const resultMetadata = this.generateResultMetadata(
        evaluationResults,
        attempt.answers
      );

      const testResult: TestResultSummary = {
        attemptId,
        userId: attempt.userId,
        testId: test.id,
        testTitle: test.title,
        examType: test.type,
        level: undefined, // Could be extracted from test metadata
        totalScore: attempt.score,
        maxScore: totalQuestions, // Assuming 1 point per question
        percentage,
        correctAnswers,
        totalQuestions,
        status: this.determineTestStatus(percentage, test.passingScore, evaluationResults),
        timeSpent: attempt.timeSpent,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt || attempt.startedAt,
        submittedAt: attempt.completedAt || attempt.startedAt,
        sectionBreakdowns,
        evaluationResults,
        passingScore: test.passingScore,
        resultMetadata
      };

      // Store the result in database
      await this.storeTestResult(testResult);

      return testResult;

    } catch (error) {
      console.error('Error generating comprehensive result:', error);
      throw new Error('Failed to generate test result');
    }
  }

  /**
   * Generate section-wise breakdowns
   */
  private async generateSectionBreakdowns(
    answers: any[],
    evaluationResults: EvaluationResult[]
  ): Promise<SectionBreakdown[]> {
    const sectionMap = new Map<string, {
      questions: any[];
      results: EvaluationResult[];
    }>();

    // Group answers and results by section
    answers.forEach(answer => {
      const question = answer.question;
      const sectionKey = question.standardSection || question.section || 'General';
      
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, { questions: [], results: [] });
      }
      
      sectionMap.get(sectionKey)!.questions.push(answer);
    });

    evaluationResults.forEach(result => {
      const answer = answers.find(a => a.questionId === result.questionId);
      if (answer) {
        const question = answer.question;
        const sectionKey = question.standardSection || question.section || 'General';
        
        if (sectionMap.has(sectionKey)) {
          sectionMap.get(sectionKey)!.results.push(result);
        }
      }
    });

    // Generate breakdowns for each section
    const breakdowns: SectionBreakdown[] = [];
    
    for (const [sectionKey, sectionData] of sectionMap) {
      const { questions, results } = sectionData;
      
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      let score = 0;
      let maxScore = 0;
      let timeSpent = 0;

      questions.forEach(answer => {
        const question = answer.question;
        const result = results.find(r => r.questionId === question.id);
        
        maxScore += question.points || 1;
        timeSpent += answer.timeSpent || 0;

        if (!result) {
          skipped++;
          return;
        }

        if (result.isCorrect) {
          correct++;
          score += result.score;
        } else {
          wrong++;
        }
      });

      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      const accuracy = (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0;

      breakdowns.push({
        sectionId: sectionKey,
        sectionName: sectionKey,
        standardSection: questions[0]?.question?.standardSection,
        totalQuestions: questions.length,
        correctAnswers: correct,
        wrongAnswers: wrong,
        skippedAnswers: skipped,
        score,
        maxScore,
        percentage,
        timeSpent,
        timeLimit: undefined, // Could be calculated from test duration
        difficulty: questions[0]?.question?.difficulty,
        language: questions[0]?.question?.language,
        module: questions[0]?.question?.module,
        accuracy
      });
    }

    return breakdowns.sort((a, b) => a.sectionName.localeCompare(b.sectionName));
  }

  /**
   * Generate result metadata
   */
  private generateResultMetadata(
    evaluationResults: EvaluationResult[],
    answers: any[]
  ): TestResultSummary['resultMetadata'] {
    let autoGraded = 0;
    let manualReview = 0;
    let pending = 0;
    let skipped = 0;
    let totalTime = 0;
    let fastestQuestion = { questionId: '', timeSpent: Infinity };
    let slowestQuestion = { questionId: '', timeSpent: 0 };

    evaluationResults.forEach(result => {
      switch (result.status) {
        case 'completed':
          autoGraded++;
          break;
        case 'manual-review':
          manualReview++;
          break;
        case 'pending':
          pending++;
          break;
        case 'skipped':
          skipped++;
          break;
      }

      totalTime += result.timeSpent;
      
      if (result.timeSpent < fastestQuestion.timeSpent) {
        fastestQuestion = { questionId: result.questionId, timeSpent: result.timeSpent };
      }
      
      if (result.timeSpent > slowestQuestion.timeSpent) {
        slowestQuestion = { questionId: result.questionId, timeSpent: result.timeSpent };
      }
    });

    const averageTimePerQuestion = evaluationResults.length > 0 
      ? totalTime / evaluationResults.length 
      : 0;

    return {
      autoGraded,
      manualReview,
      pending,
      skipped,
      averageTimePerQuestion,
      fastestQuestion: fastestQuestion.timeSpent === Infinity 
        ? { questionId: '', timeSpent: 0 }
        : fastestQuestion,
      slowestQuestion
    };
  }

  /**
   * Determine test status
   */
  private determineTestStatus(
    percentage: number,
    passingScore: number,
    evaluationResults: EvaluationResult[]
  ): 'pass' | 'fail' | 'pending' | 'incomplete' {
    // Check if there are pending evaluations
    const hasPending = evaluationResults.some(r => r.status === 'pending');
    if (hasPending) return 'pending';

    // Check if test is incomplete (too many skipped questions)
    const skippedCount = evaluationResults.filter(r => r.status === 'skipped').length;
    const totalQuestions = evaluationResults.length;
    if (skippedCount / totalQuestions > 0.5) return 'incomplete';

    // Determine pass/fail based on percentage
    return percentage >= passingScore ? 'pass' : 'fail';
  }

  /**
   * Store test result in database
   */
  private async storeTestResult(result: TestResultSummary): Promise<void> {
    try {
      // This would typically involve creating a TestResult table
      // For now, we'll update the TestAttempt record
      await prisma.testAttempt.update({
        where: { id: result.attemptId },
        data: {
          score: result.totalScore,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          passed: result.status === 'pass',
          completedAt: result.completedAt
        }
      });

      // Store speaking scores if available
      const speakingResults = result.evaluationResults.filter(
        r => r.questionType.startsWith('SPEAKING_')
      );
      
      if (speakingResults.length > 0 && result.resultMetadata.manualReview === 0) {
        // Calculate speaking bands from evaluation results
        const averageBands = this.calculateAverageSpeakingBands(speakingResults);
        
        await prisma.speakingScore.upsert({
          where: { attemptId: result.attemptId },
          update: {
            fluencyCoherence: averageBands.fluencyCoherence,
            lexicalResource: averageBands.lexicalResource,
            grammaticalRange: averageBands.grammaticalRange,
            pronunciation: averageBands.pronunciation,
            overallBand: averageBands.overallBand
          },
          create: {
            attemptId: result.attemptId,
            fluencyCoherence: averageBands.fluencyCoherence,
            lexicalResource: averageBands.lexicalResource,
            grammaticalRange: averageBands.grammaticalRange,
            pronunciation: averageBands.pronunciation,
            overallBand: averageBands.overallBand
          }
        });
      }

    } catch (error) {
      console.error('Error storing test result:', error);
      // Don't throw error as this is a background operation
    }
  }

  /**
   * Calculate average speaking bands from evaluation results
   */
  private calculateAverageSpeakingBands(speakingResults: EvaluationResult[]) {
    let totalFluency = 0;
    let totalLexical = 0;
    let totalGrammar = 0;
    let totalPronunciation = 0;

    speakingResults.forEach(result => {
      if ('ieltsBands' in result) {
        totalFluency += result.ieltsBands.fluencyCoherence;
        totalLexical += result.ieltsBands.lexicalResource;
        totalGrammar += result.ieltsBands.grammaticalRange;
        totalPronunciation += result.ieltsBands.pronunciation;
      }
    });

    const count = speakingResults.length;
    const overall = (totalFluency + totalLexical + totalGrammar + totalPronunciation) / (4 * count);

    return {
      fluencyCoherence: totalFluency / count,
      lexicalResource: totalLexical / count,
      grammaticalRange: totalGrammar / count,
      pronunciation: totalPronunciation / count,
      overallBand: overall
    };
  }

  /**
   * Generate performance analytics
   */
  async generatePerformanceAnalytics(
    result: TestResultSummary
  ): Promise<PerformanceAnalytics> {
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];
    const improvementSuggestions: string[] = [];

    // Analyze section performance
    result.sectionBreakdowns.forEach(section => {
      if (section.percentage < 60) {
        weakAreas.push(section.sectionName);
        improvementSuggestions.push(`Focus on improving ${section.sectionName} - scored ${Math.round(section.percentage)}%`);
      } else if (section.percentage >= 85) {
        strongAreas.push(section.sectionName);
      }
    });

    // Analyze time management
    const timeEfficiency = this.analyzeTimeEfficiency(result);
    
    // Generate trend analysis
    const trendAnalysis = await this.analyzeUserTrend(result.userId, result.testId);

    return {
      weakAreas,
      strongAreas,
      improvementSuggestions,
      timeManagementAnalysis: {
        averageTimePerSection: Object.fromEntries(
          result.sectionBreakdowns.map(s => [s.sectionName, s.timeSpent / s.totalQuestions])
        ),
        timeEfficiency
      },
      accuracyByDifficulty: this.calculateAccuracyByDifficulty(result),
      accuracyByLanguage: this.calculateAccuracyByLanguage(result),
      trendAnalysis
    };
  }

  /**
   * Analyze time efficiency
   */
  private analyzeTimeEfficiency(result: TestResultSummary): PerformanceAnalytics['timeManagementAnalysis']['timeEfficiency'] {
    const avgTimePerQuestion = result.resultMetadata.averageTimePerQuestion;
    
    // This would be based on expected time limits for each question type
    if (avgTimePerQuestion < 30) return 'excellent';
    if (avgTimePerQuestion < 60) return 'good';
    if (avgTimePerQuestion < 120) return 'needs_improvement';
    return 'poor';
  }

  /**
   * Calculate accuracy by difficulty
   */
  private calculateAccuracyByDifficulty(result: TestResultSummary): Record<string, number> {
    const accuracyByDifficulty: Record<string, number> = {};
    
    result.sectionBreakdowns.forEach(section => {
      if (section.difficulty) {
        accuracyByDifficulty[section.difficulty] = section.accuracy;
      }
    });

    return accuracyByDifficulty;
  }

  /**
   * Calculate accuracy by language
   */
  private calculateAccuracyByLanguage(result: TestResultSummary): Record<string, number> {
    const accuracyByLanguage: Record<string, number> = {};
    
    result.sectionBreakdowns.forEach(section => {
      if (section.language) {
        accuracyByLanguage[section.language] = section.accuracy;
      }
    });

    return accuracyByLanguage;
  }

  /**
   * Analyze user trend
   */
  private async analyzeUserTrend(userId: string, currentTestId: string): Promise<PerformanceAnalytics['trendAnalysis']> {
    try {
      const recentAttempts = await prisma.testAttempt.findMany({
        where: {
          userId,
          completedAt: { not: null }
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: { test: true }
      });

      if (recentAttempts.length < 3) return 'stable';

      // Compare current test with previous attempts of similar type
      const currentTest = recentAttempts[0];
      const similarTests = recentAttempts.slice(1).filter(a => a.testId === currentTestId);
      
      if (similarTests.length === 0) return 'stable';

      const currentScore = currentTest.score;
      const previousAverage = similarTests.reduce((sum, a) => sum + a.score, 0) / similarTests.length;
      
      const improvement = currentScore - previousAverage;
      
      if (improvement > 10) return 'improving';
      if (improvement < -10) return 'declining';
      return 'stable';

    } catch (error) {
      console.error('Error analyzing user trend:', error);
      return 'stable';
    }
  }

  /**
   * Lock test attempt to prevent multiple submissions
   */
  async lockTestAttempt(attemptId: string): Promise<boolean> {
    try {
      // This would typically involve updating a status field in the TestAttempt
      // For now, we'll use a simple timestamp-based approach
      const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId }
      });

      if (!attempt) return false;
      
      // Check if attempt is already completed
      if (attempt.completedAt) return false;

      // Lock the attempt by setting a processing flag
      await prisma.testAttempt.update({
        where: { id: attemptId },
        data: { 
          // Add a processing flag or update completedAt to prevent resubmission
          completedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error locking test attempt:', error);
      return false;
    }
  }
}

// Export singleton instance
export const resultGenerationService = new ResultGenerationService();
