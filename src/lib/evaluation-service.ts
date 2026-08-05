// Evaluation Service - Handles scoring and evaluation logic for tests and assessments

import { prisma } from './prisma';
import { 
  TestSubmission, 
  SpeakingTestSubmission, 
  EvaluationResultData,
  DetailedResult
} from './types/evaluation';
import { TestType, QuestionType } from './types/test';

export class EvaluationService {
  
  /**
   * Evaluate a multiple choice test submission
   */
  async evaluateMultipleChoice(submission: TestSubmission): Promise<EvaluationResultData> {
    try {
      const { testId, userId, answers } = submission;
      
      // Get test with questions
      const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        include: {
          questions: true
        }
      });

      if (!test) {
        throw new Error('Test not found');
      }

      let correctAnswers = 0;
      let totalQuestions = test.questions.length;
      const detailedResults: DetailedResult[] = [];

      // Evaluate each answer
      for (const answer of answers) {
        const question = test.questions.find(q => q.id === answer.questionId);
        if (!question) {
          continue;
        }

        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) {
          correctAnswers++;
        }

        detailedResults.push({
          questionId: question.id,
          isCorrect,
          correctAnswer: question.correctAnswer,
          selectedAnswer: answer.selectedAnswer,
          points: isCorrect ? question.points || 1 : 0
        });
      }

      const score = (correctAnswers / totalQuestions) * 100;
      const passed = score >= test.passingScore;

      return {
        testId,
        userId,
        score,
        correctAnswers,
        totalQuestions,
        passed,
        detailedResults,
        feedback: this.generateFeedback(score, passed),
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Error evaluating multiple choice test:', error);
      throw new Error('Failed to evaluate test submission');
    }
  }

  /**
   * Evaluate a speaking test submission
   */
  async evaluateSpeakingTest(submission: SpeakingTestSubmission): Promise<EvaluationResultData> {
    try {
      const { testId, userId, responses } = submission;
      
      // Get speaking test with questions
      const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        include: {
          questions: true
        }
      });

      if (!test) {
        throw new Error('Test not found');
      }

      let totalScore = 0;
      const maxScore = 9; // IELTS band scale
      const detailedResults: DetailedResult[] = [];

      // Evaluate each speaking response
      for (const response of responses) {
        const question = test.questions.find(q => q.id === response.questionId);
        if (!question) {
          continue;
        }

        // Simple scoring based on audio length and quality
        // In a real implementation, this would use AI/speech recognition
        const audioScore = this.evaluateAudioResponse(response.audioUrl, response.transcript);
        
        detailedResults.push({
          questionId: question.id,
          isCorrect: audioScore >= 6, // IELTS Band 6+
          correctAnswer: question.correctAnswer,
          selectedAnswer: response.transcript,
          points: audioScore
        });

        totalScore += audioScore;
      }

      const averageScore = responses.length > 0 ? totalScore / responses.length : 0;
      const score = (averageScore / maxScore) * 100;
      const passed = averageScore >= 6; // IELTS Band 6 threshold

      return {
        testId,
        userId,
        score,
        correctAnswers: responses.filter(r => 
          this.evaluateAudioResponse(r.audioUrl, r.transcript) >= 6
        ).length,
        totalQuestions: responses.length,
        passed,
        detailedResults,
        feedback: this.generateSpeakingFeedback(averageScore),
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Error evaluating speaking test:', error);
      throw new Error('Failed to evaluate speaking test submission');
    }
  }

  /**
   * Evaluate audio response quality
   */
  private evaluateAudioResponse(audioUrl: string, transcript: string): number {
    // Basic evaluation based on transcript length and coherence
    // This would be replaced with actual AI/speech analysis
    
    const wordCount = transcript.split(' ').length;
    const coherenceScore = this.calculateCoherenceScore(transcript);
    
    // Score based on length (more words generally better) and coherence
    let score = 4; // Base score
    
    if (wordCount > 50) score += 1;
    if (wordCount > 100) score += 1;
    if (coherenceScore > 0.7) score += 1;
    if (coherenceScore > 0.85) score += 1;
    
    return Math.min(score, 9); // Cap at 9 (max IELTS band)
  }

  /**
   * Calculate coherence score based on transcript
   */
  private calculateCoherenceScore(transcript: string): number {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? transcript.split(' ').length / sentences.length : 0;
    
    // Basic coherence metrics
    const hasTransitions = /however|therefore|moreover|furthermore|additionally|consequently|in conclusion/i.test(transcript);
    const hasComplexSentences = sentences.filter(s => s.split(' ').length > 10).length;
    
    let coherenceScore = 0.5; // Base score
    
    if (avgSentenceLength > 8 && avgSentenceLength < 25) coherenceScore += 0.2;
    if (hasTransitions) coherenceScore += 0.2;
    if (hasComplexSentences > 2) coherenceScore += 0.1;
    
    return Math.min(coherenceScore, 1);
  }

  /**
   * Generate feedback for multiple choice tests
   */
  private generateFeedback(score: number, passed: boolean): string {
    if (score >= 90) {
      return 'Excellent work! You have a strong understanding of the material.';
    } else if (score >= 80) {
      return 'Good job! You have a solid grasp of most concepts.';
    } else if (score >= 70) {
      return 'Not bad, but consider reviewing the areas where you made mistakes.';
    } else if (passed) {
      return 'You passed, but there\'s room for improvement. Review the incorrect answers.';
    } else {
      return 'You didn\'t pass this time. Please review the material and try again.';
    }
  }

  /**
   * Generate feedback for speaking tests
   */
  private generateSpeakingFeedback(averageScore: number): string {
    const bandScore = Math.round(averageScore * 10) / 10;
    
    if (bandScore >= 8) {
      return `Excellent! IELTS Band ${bandScore}. You demonstrate fluent, coherent speaking with sophisticated vocabulary.`;
    } else if (bandScore >= 7) {
      return `Good performance! IELTS Band ${bandScore}. You speak fluently with occasional minor errors.`;
    } else if (bandScore >= 6) {
      return `Satisfactory. IELTS Band ${bandScore}. You can communicate effectively but may need more practice.`;
    } else if (bandScore >= 5) {
      return `Basic level. IELTS Band ${bandScore}. You can communicate simple ideas but need more practice.`;
    } else {
      return `Needs improvement. IELTS Band ${bandScore}. Focus on basic communication skills.`;
    }
  }

  /**
   * Get evaluation statistics for a test
   */
  async getTestStatistics(testId: string) {
    try {
      const attempts = await prisma.testAttempt.findMany({
        where: { testId },
        select: {
          score: true,
          passed: true
        }
      });

      if (attempts.length === 0) {
        return {
          totalSubmissions: 0,
          averageScore: 0,
          passRate: 0,
          scoreDistribution: []
        };
      }

      const scores = attempts.map(a => a.score);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const passRate = (attempts.filter(a => a.passed).length / attempts.length) * 100;

      // Create score distribution
      const scoreRanges = [
        { range: '0-20', count: 0 },
        { range: '21-40', count: 0 },
        { range: '41-60', count: 0 },
        { range: '61-80', count: 0 },
        { range: '81-100', count: 0 }
      ];

      scores.forEach(score => {
        if (score <= 20) scoreRanges[0].count++;
        else if (score <= 40) scoreRanges[1].count++;
        else if (score <= 60) scoreRanges[2].count++;
        else if (score <= 80) scoreRanges[3].count++;
        else scoreRanges[4].count++;
      });

      return {
        totalSubmissions: attempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        scoreDistribution: scoreRanges
      };

    } catch (error) {
      console.error('Error getting test statistics:', error);
      throw new Error('Failed to retrieve test statistics');
    }
  }

  /**
   * Get user performance analytics
   */
  async getUserPerformance(userId: string, timeRange?: { start: Date; end: Date }) {
    try {
      const whereClause: any = { userId };
      
      if (timeRange) {
        whereClause.createdAt = {
          gte: timeRange.start,
          lte: timeRange.end
        };
      }

      const attempts = await prisma.testAttempt.findMany({
        where: whereClause,
        include: {
          test: true
        },
        orderBy: {
          startedAt: 'desc'
        }
      });

      const scores = attempts.map(a => a.score);
      const averageScore = scores.length > 0 ? 
        scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

      const recentTests = attempts.slice(0, 10).map(attempt => ({
        testId: attempt.testId,
        testTitle: attempt.test?.title || 'Unknown Test',
        score: attempt.score,
        passed: attempt.passed,
        date: attempt.completedAt || attempt.startedAt
      }));

      return {
        totalTests: attempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        recentTests,
        improvementTrend: this.calculateImprovementTrend(attempts)
      };

    } catch (error) {
      console.error('Error getting user performance:', error);
      throw new Error('Failed to retrieve user performance data');
    }
  }

  /**
   * Calculate improvement trend for user
   */
  private calculateImprovementTrend(attempts: any[]) {
    if (attempts.length < 3) return 'insufficient_data';

    // Sort by date ascending for trend calculation
    const sortedAttempts = [...attempts].sort((a, b) => 
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

    const recentAttempts = sortedAttempts.slice(-Math.floor(sortedAttempts.length / 2));
    const olderAttempts = sortedAttempts.slice(0, Math.floor(sortedAttempts.length / 2));

    const recentAvg = recentAttempts.reduce((sum: number, a: any) => sum + a.score, 0) / recentAttempts.length;
    const olderAvg = olderAttempts.reduce((sum: number, a: any) => sum + a.score, 0) / olderAttempts.length;

    const improvement = recentAvg - olderAvg;

    if (improvement > 5) return 'improving';
    if (improvement < -5) return 'declining';
    return 'stable';
  }
}

// Export singleton instance
export const evaluationService = new EvaluationService();
