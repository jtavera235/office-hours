import {
  Controller,
  Param,
  Get,
  Post,
  Body,
  Patch,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateQuestionResponse,
  GetQuestionResponse,
  QuestionStatusKeys,
  CreateQuestionParams,
  UpdateQuestionResponse,
  UpdateQuestionParams,
  Role,
  OpenQuestionStatus,
  ClosedQuestionStatus,
} from '@template/common';
import { QueueModel } from '../queue/queue.entity';
import { Connection, In } from 'typeorm';
import { QuestionModel } from './question.entity';
import { UserModel } from '../profile/user.entity';
import { JwtAuthGuard } from '../profile/jwt-auth.guard';
import { UserId } from '../profile/user.decorator';
import { UserCourseModel } from '../profile/user-course.entity';

@Controller('questions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class QuestionController {
  constructor(private connection: Connection) {}

  @Get(':questionId')
  async getQuestion(
    @Param('questionId') questionId: number,
  ): Promise<GetQuestionResponse> {
    const question = await QuestionModel.findOne(questionId, {
      relations: ['creator', 'taHelped'],
    });

    if (question === undefined) {
      throw new NotFoundException();
    }
    return question;
  }

  @Post()
  async createQuestion(
    @Body() body: CreateQuestionParams,
  ): Promise<CreateQuestionResponse> {
    const { text, questionType, queueId } = body;
    // TODO: Remove this once we implemntent user authentication
    const DEFAULT_USER = await UserModel.create({
      id: 42,
      username: 'test_user',
      email: 'test_user@husky.neu.edu',
      name: 'Test User',
      photoURL: 'www.photoURL.com',
    }).save();
    const queueSize = await QueueModel.count({
      where: { id: queueId },
    });
    // Check that the queue exists
    if (queueSize === 0) {
      throw new NotFoundException();
    }
    // TODO: Check that the user posting the question is a member of the course

    const question = await QuestionModel.create({
      queueId: queueId,
      creator: DEFAULT_USER,
      text,
      questionType,
      status: QuestionStatusKeys.Drafting,
    }).save();

    question.creator = DEFAULT_USER;
    return question;
  }

  @Patch(':questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Body() body: UpdateQuestionParams,
    @UserId() userId: number,
  ): Promise<UpdateQuestionResponse> {
    // TODO: Check that the question_id belongs to the user or a TA that is currently helping with the given queue_id
    // TODO: Use user type to dertermine wether or not we should include the text in the response
    let question = await QuestionModel.findOne({
      where: { id: questionId },
      relations: ['creator', 'queue'],
    });
    if (question === undefined) {
      throw new NotFoundException();
    }

    const isCreator = userId === question.creatorId;

    if (isCreator) {
      // Creator can always edit
      if (body.status === OpenQuestionStatus.Helping) {
        throw new UnauthorizedException(
          'Students cannot mark question helping',
        );
      }
      question = Object.assign(question, body);
      await question.save();
      return question;
    }

    // If not creator, check if user is TA/PROF of course of question
    const isTaOrProf =
      (await UserCourseModel.count({
        where: {
          userId,
          courseId: question.queue.courseId,
          role: In([Role.TA, Role.PROFESSOR]),
        },
      })) > 0;

    if (isTaOrProf) {
      if (Object.keys(body).length !== 1 || Object.keys(body)[0] !== 'status') {
        throw new UnauthorizedException(
          'TA/Professors can only edit question status',
        );
      }
      question = Object.assign(question, body);
      // Set TA as taHelped if resolving their question
      if (body.status === ClosedQuestionStatus.Resolved) {
        question.taHelped = await UserModel.findOne(userId);
      }
      await question.save();
      return question;
    } else {
      throw new UnauthorizedException(
        'Logged-in user does not have edit access',
      );
    }
  }
}