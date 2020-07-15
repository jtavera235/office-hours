import {
  Role,
  Question,
  QuestionStatus,
  OpenQuestionStatus,
  ClosedQuestionStatus,
} from "@template/common";
import { Button, Row, Card, Col, Grid } from "antd";
import styled from "styled-components";
import QueueCard from "./QueueCard";
import GroupQuestions from "./GroupQuestions";
import StudentInfoCard from "./StudentInfoCard";

const { useBreakpoint } = Grid;

const StatusText = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #8895a6;
  font-variant: small-caps;
  width: 96px;
  float: right;
  margin-right: 0;
`;

const TAHeaderCard = styled(Card)`
  height: 64px;
  background: inherit;
`;

const HeaderText = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #8895a6;
  font-variant: small-caps;
`;

const QueueTitle = styled.div`
  font-weight: 500;
  font-size: 30px;
  color: #212934;
`;

const CenterRow = styled(Row)`
  align-items: center;
  justify-content: space-between;
`;

const Placeholder = styled.div`
  width: 14px;
`;

const AlertButton = styled(Button)`
  margin-right: 12px;
  font-weight: 500;
  font-size: 14px;
  color: #da3236;
  background: #f8f9fa;
  border: 1px solid #cfd6de;
  border-radius: 6px;
`;

const FinishButton = styled(Button)`
  font-weight: 500;
  font-size: 14px;
  background: #3684c6;
  border-radius: 6px;
`;

const CheckInOutButton = styled(Button)`
  font-weight: 500;
  font-size: 14px;
  color: #da3236;
  background: #f8f9fa;
  border: 1px solid #cfd6de;
  border-radius: 6px;
`;

const HelpNextButton = styled(Button)`
  font-weight: 500;
  font-size: 14px;
  color: #212934;
  border: 1px solid #cfd6de;
  border-radius: 6px;
  margin-right: 16px;
`;

const HeaderRow = styled(Row)`
  margin-bottom: 64px;
`;

interface QueueListProps {
  room: string;
  onOpenClick: (question: Question) => void;
  joinQueue: () => void;
  updateQuestionTA: (question: Question, status: QuestionStatus) => void;
  alertStudent: (question: Question) => void;
  questions: Question[];
  helpingQuestions: Question[];
  groupQuestions: Question[];
}

export default function TAQueueList({
  room,
  onOpenClick,
  joinQueue,
  updateQuestionTA,
  alertStudent,
  questions,
  helpingQuestions,
  groupQuestions,
}: QueueListProps) {
  const helping = helpingQuestions.length !== 0;
  const screens = useBreakpoint();

  /**
   * Sends a push notification alert to every question currently being helped.
   */
  const alertHelpingAll = () => {
    // for each question currently being helped, call alertStudent()
  };

  /**
   * Marks every question currently being helped by this TA as finished.
   */
  const finishHelpingAll = () => {
    for (const question of helpingQuestions) {
      updateQuestionTA(question, ClosedQuestionStatus.Resolved);
    }
  };

  /**
   * Adds every given question to the group that is currently being helped.
   * @param selected the given list of questions to help
   */
  const addQuestionsToHelp = (selected: Question[]) => {
    for (const question of selected) {
      updateQuestionTA(question, OpenQuestionStatus.Helping);
    }
  };

  /**
   * Renders the card headers for a TA who is not yet helping someone.
   */
  const renderTAHeader = () => {
    return (
      <TAHeaderCard bordered={false}>
        <CenterRow justify="space-between">
          <Col xs={2} lg={1}>
            <HeaderText>#</HeaderText>
          </Col>
          <Col xs={14} sm={11} lg={5}>
            <HeaderText>name</HeaderText>
          </Col>
          <Col xs={0} lg={2}>
            <HeaderText>type</HeaderText>
          </Col>
          <Col xs={0} lg={7}>
            <HeaderText>question</HeaderText>
          </Col>
          <Col xs={0} lg={2}>
            <HeaderText>wait</HeaderText>
          </Col>
          <Col span={2}>
            <StatusText>status</StatusText>
          </Col>
          <Col>
            <Placeholder />
          </Col>
        </CenterRow>
      </TAHeaderCard>
    );
  };

  /**
   * Renders the card headers for a TA who is currently helping someone.
   */
  const renderHelpingHeader = () => {
    return (
      <TAHeaderCard bordered={false}>
        <CenterRow justify="space-between">
          <Col xs={2} lg={1}>
            <HeaderText>#</HeaderText>
          </Col>
          <Col xs={14} sm={9} lg={11} xl={9} xxl={4}>
            <HeaderText>name</HeaderText>
          </Col>
          <Col xs={0} xxl={7}>
            <HeaderText>question</HeaderText>
          </Col>
          <Col xs={0} xl={3}>
            <HeaderText>wait</HeaderText>
          </Col>
          <Col span={2}>
            <StatusText>status</StatusText>
          </Col>
          <Col>
            <Placeholder />
          </Col>
        </CenterRow>
      </TAHeaderCard>
    );
  };

  /**
   * Renders the title and aggregate buttons for the helping column.
   */
  const renderHelpingTitle = () => {
    return (
      <Col xs={24} lg={10} xxl={6} order={screens.lg === false ? 1 : 2}>
        <HeaderRow justify="space-between">
          <QueueTitle>Helping</QueueTitle>
          <div>
            <AlertButton danger size="large" onClick={alertHelpingAll}>
              Alert All
            </AlertButton>
            <FinishButton
              type="primary"
              size="large"
              onClick={finishHelpingAll}
            >
              Finish All
            </FinishButton>
          </div>
        </HeaderRow>
        {helpingQuestions &&
          helpingQuestions.map((question) => (
            <StudentInfoCard
              key={question.id}
              updateQuestion={updateQuestionTA}
              alertStudent={alertStudent}
              question={question}
            />
          ))}
        {groupQuestions && groupQuestions.length !== 0 && (
          <GroupQuestions
            questions={groupQuestions}
            addQuestions={addQuestionsToHelp}
          />
        )}
      </Col>
    );
  };

  return (
    <div>
      <Row gutter={[64, 64]}>
        <Col flex="auto" order={screens.lg === false ? 2 : 1}>
          <Row justify="space-between">
            <QueueTitle>{room}</QueueTitle>
            <Row>
              <HelpNextButton size="large">Help Next</HelpNextButton>
              <CheckInOutButton danger size="large">
                Check Out
              </CheckInOutButton>
            </Row>
          </Row>
          {!helping && renderTAHeader()}
          {helping && renderHelpingHeader()}
          {questions.map((question: Question, index: number) => {
            const creator = question.creator;
            return (
              <QueueCard
                key={question.id}
                helping={helping}
                role={Role.TA}
                rank={index + 1}
                waitTime={30} //figure out later
                question={question}
                onOpen={onOpenClick}
              />
            );
          })}
        </Col>
        {helping && renderHelpingTitle()}
      </Row>
    </div>
  );
}
