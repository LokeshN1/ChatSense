import { useState } from "react";
import { useAiStore } from "../store/useAiStore";
import { useChatStore } from "../store/useChatStore";
import {
  Loader,
  MessageSquare,
  Tag,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Briefcase,
  Sparkles,
  HelpCircle,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AiModal = ({ closeModal }) => {
  const {
    analyzeChat,
    isSummarizing,
    summary,
    queryChat,
    isQuerying,
    queryResult,
    clearSummary,
    clearQueryResult,
  } = useAiStore();

  const { selectedUser, authUser } = useChatStore();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [expandedSections, setExpandedSections] = useState({});
  const [lastAskedQuestion, setLastAskedQuestion] = useState("");

  const handleSummarizeChat = () => {
    if (selectedUser?._id) {
      analyzeChat(selectedUser._id);
    }
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (query.trim() && selectedUser?._id) {
      setLastAskedQuestion(query);
      queryChat(selectedUser._id, query);
      setQuery("");
    }
  };

  const getUserName = (userRef) => {
    if (typeof userRef === "string" && userRef !== "Both") {
      return userRef;
    }

    if (userRef === "Both") {
      return "Both participants";
    }

    if (typeof userRef === "object" && userRef?.name) {
      return userRef.name;
    }

    const userId =
      typeof userRef === "object" ? userRef?.id || userRef?.user_id : userRef;

    if (summary?.conversation?.participants) {
      const participant = summary.conversation.participants.find(
        (p) => p.id === userId
      );
      if (participant) {
        return participant.name;
      }
    }

    if (userId === authUser?._id) return authUser?.fullName || "You";
    if (userId === selectedUser?._id)
      return selectedUser?.fullName || selectedUser?.name || "Other User";

    if (userId && typeof userId === "string") {
      const shortId = userId.slice(-4);
      return `User ${shortId}`;
    }

    return "Unknown User";
  };

  const formatParticipants = () => {
    if (summary?.conversation?.display_name) {
      return summary.conversation.display_name;
    }

    if (
      summary?.conversation?.participants &&
      summary.conversation.participants.length > 0
    ) {
      if (summary.conversation.participants.length === 2) {
        return summary.conversation.participants.map((p) => p.name).join(" & ");
      }
      return `${summary.conversation.participants.length} participants`;
    }

    return "Unknown participants";
  };

  const toggleExpanded = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderList = (
    items,
    limit = 3,
    sectionKey = null,
    itemClassName = ""
  ) => {
    if (!items || items.length === 0) {
      return <p className='text-sm text-gray-400'>Not mentioned</p>;
    }

    const isExpanded = expandedSections[sectionKey] || false;
    const displayItems = isExpanded ? items : items.slice(0, limit);
    const hasMore = items.length > limit;

    return (
      <div className='space-y-2'>
        <ul className='space-y-1'>
          {displayItems.map((item, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 text-sm ${itemClassName}`}
            >
              <div className='w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0'></div>
              <span className='break-words'>{item}</span>
            </li>
          ))}
        </ul>
        {hasMore && sectionKey && (
          <button
            onClick={() => toggleExpanded(sectionKey)}
            className='flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='w-3 h-3' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='w-3 h-3' />
                Show {items.length - limit} more
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderTopics = (topics, limit = 3) => {
    if (!topics || topics.length === 0) {
      return <p className='text-sm text-gray-400'>No topics identified</p>;
    }

    const isExpanded = expandedSections["topics"] || false;
    const displayTopics = isExpanded ? topics : topics.slice(0, limit);
    const hasMore = topics.length > limit;

    return (
      <div className='space-y-2'>
        <div className='flex flex-wrap gap-2'>
          {displayTopics.map((topic, index) => (
            <span key={index} className='badge badge-primary badge-sm'>
              {topic}
            </span>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => toggleExpanded("topics")}
            className='flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='w-3 h-3' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='w-3 h-3' />
                Show {topics.length - limit} more topics
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderMainDiscussion = (mainDiscussion, limit = 3) => {
    if (!mainDiscussion) {
      return (
        <p className='text-sm text-gray-400'>
          No key discussion points identified
        </p>
      );
    }

    const sentences = mainDiscussion
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0);

    if (sentences.length === 0) {
      return (
        <p className='text-sm text-gray-400'>
          No key discussion points identified
        </p>
      );
    }

    const isExpanded = expandedSections["mainDiscussion"] || false;
    const displaySentences = isExpanded ? sentences : sentences.slice(0, limit);
    const hasMore = sentences.length > limit;

    return (
      <div className='space-y-2'>
        <div className='space-y-2'>
          {displaySentences.map((sentence, index) => (
            <div key={index} className='flex items-start gap-2'>
              <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
              <p className='text-sm text-base-content/80 leading-relaxed'>
                {sentence.trim()}.
              </p>
            </div>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => toggleExpanded("mainDiscussion")}
            className='flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='w-3 h-3' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='w-3 h-3' />
                Show {sentences.length - limit} more points
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderDecisions = (decisions, limit = 3) => {
    if (!decisions || decisions.length === 0) {
      return <p className='text-sm text-gray-400'>No decisions identified</p>;
    }

    const isExpanded = expandedSections["decisions"] || false;
    const displayDecisions = isExpanded ? decisions : decisions.slice(0, limit);
    const hasMore = decisions.length > limit;

    return (
      <div className='space-y-2'>
        <div className='space-y-2'>
          {displayDecisions.map((decision, index) => (
            <div
              key={index}
              className='flex items-start gap-2 p-2 bg-base-100 rounded-lg'
            >
              <CheckCircle className='text-success w-4 h-4 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <span className='text-sm text-base-content/80 leading-relaxed block'>
                  {decision.decision}
                </span>
                <p className='text-xs text-gray-500 mt-1'>
                  by {getUserName(decision.madeBy)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => toggleExpanded("decisions")}
            className='flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='w-3 h-3' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='w-3 h-3' />
                Show {decisions.length - limit} more decisions
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const SummaryCard = ({ title, icon: Icon, children, className = "" }) => (
    <div
      className={`bg-base-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Icon className='text-primary w-5 h-5' />
        <h3 className='font-semibold text-base'>{title}</h3>
      </div>
      <div className='space-y-2'>{children}</div>
    </div>
  );

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-base-100 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <Sparkles className='text-primary' /> AI Chat Assistant
          </h2>
          <button
            onClick={closeModal}
            className='btn btn-sm btn-circle btn-ghost'
          >
            ✕
          </button>
        </div>

        <div className='tabs tabs-boxed mb-4'>
          <a
            className={`tab ${activeTab === "summary" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            Chat Summary
          </a>
          <a
            className={`tab ${activeTab === "query" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("query")}
          >
            Ask a Question
          </a>
        </div>

        <div className='overflow-y-auto flex-grow pr-2'>
          {activeTab === "summary" && (
            <div className='space-y-4'>
              <button
                onClick={handleSummarizeChat}
                className='btn btn-primary w-full'
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <>
                    <Loader className='animate-spin' /> Summarizing...
                  </>
                ) : (
                  "Generate Chat Summary"
                )}
              </button>

              {isSummarizing && (
                <div className='text-center p-4'>
                  <span className='loading loading-dots loading-lg'></span>
                </div>
              )}

              {summary && (
                <div className='animate-fade-in space-y-4'>
                  <div className='flex justify-between items-center'>
                    <div className='space-y-1'>
                      <h3 className='text-lg font-semibold text-base-content'>
                        Chat Analysis
                      </h3>
                      <p className='text-sm text-base-content/70'>
                        Conversation between {formatParticipants()} (
                        {summary.analysis?.message_count || 0} messages)
                      </p>
                    </div>
                    <button onClick={clearSummary} className='btn btn-xs btn-ghost'>
                      Clear
                    </button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <SummaryCard title='Main Discussion' icon={MessageSquare}>
                      {renderMainDiscussion(
                        summary.analysis?.summary?.mainDiscussion
                      )}
                    </SummaryCard>

                    <SummaryCard title='Key Topics' icon={Tag}>
                      {renderTopics(summary.analysis?.topics)}
                    </SummaryCard>

                    <SummaryCard title='Key Decisions' icon={CheckCircle}>
                      {renderDecisions(summary.analysis?.decision || [])}
                    </SummaryCard>

                    <SummaryCard title='Important Details' icon={TrendingUp}>
                      <div className='space-y-3'>
                        {summary.analysis?.entities?.dates &&
                          summary.analysis.entities.dates.length > 0 && (
                            <div>
                              <div className='flex items-center gap-1 mb-1'>
                                <Calendar className='w-3 h-3 text-primary' />
                                <span className='text-xs font-medium text-gray-600'>
                                  Dates
                                </span>
                              </div>
                              {renderList(
                                summary.analysis.entities.dates,
                                3,
                                "dates"
                              )}
                            </div>
                          )}

                        {summary.analysis?.entities?.locations &&
                          summary.analysis.entities.locations.length > 0 && (
                            <div>
                              <div className='flex items-center gap-1 mb-1'>
                                <MapPin className='w-3 h-3 text-primary' />
                                <span className='text-xs font-medium text-gray-600'>
                                  Locations
                                </span>
                              </div>
                              {renderList(
                                summary.analysis.entities.locations.filter(
                                  (loc) => loc.trim() && loc !== "'s"
                                ),
                                3,
                                "locations"
                              )}
                            </div>
                          )}

                        {summary.analysis?.entities?.people &&
                          summary.analysis.entities.people.length > 0 && (
                            <div>
                              <div className='flex items-center gap-1 mb-1'>
                                <Users className='w-3 h-3 text-primary' />
                                <span className='text-xs font-medium text-gray-600'>
                                  People
                                </span>
                              </div>
                              {renderList(
                                summary.analysis.entities.people,
                                3,
                                "people"
                              )}
                            </div>
                          )}

                        {summary.analysis?.entities?.organizations &&
                          summary.analysis.entities.organizations.length > 0 && (
                            <div>
                              <div className='flex items-center gap-1 mb-1'>
                                <Briefcase className='w-3 h-3 text-primary' />
                                <span className='text-xs font-medium text-gray-600'>
                                  Organizations
                                </span>
                              </div>
                              {renderList(
                                summary.analysis.entities.organizations,
                                3,
                                "organizations"
                              )}
                            </div>
                          )}

                        {summary.analysis?.entities?.money &&
                          summary.analysis.entities.money.length > 0 && (
                            <div>
                              <div className='flex items-center gap-1 mb-1'>
                                <DollarSign className='w-3 h-3 text-primary' />
                                <span className='text-xs font-medium text-gray-600'>
                                  Money
                                </span>
                              </div>
                              {renderList(
                                summary.analysis.entities.money,
                                3,
                                "money"
                              )}
                            </div>
                          )}

                        {!summary.analysis?.entities?.dates?.length &&
                          !summary.analysis?.entities?.locations?.length &&
                          !summary.analysis?.entities?.money?.length &&
                          !summary.analysis?.entities?.people?.length &&
                          !summary.analysis?.entities?.organizations?.length && (
                            <p className='text-sm text-gray-400'>
                              No specific details mentioned
                            </p>
                          )}
                      </div>
                    </SummaryCard>
                  </div>

                  <div className='flex items-center justify-center gap-4 p-4 bg-base-200 rounded-xl'>
                    <span className='text-sm font-medium text-base-content/70'>
                      Overall Sentiment:
                    </span>
                    <span
                      className={`badge badge-lg ${
                        (
                          summary.analysis?.summary?.overallTone ||
                          summary.analysis?.sentiment
                        )?.toLowerCase() === "positive"
                          ? "badge-success"
                          : (
                              summary.analysis?.summary?.overallTone ||
                              summary.analysis?.sentiment
                            )?.toLowerCase() === "negative"
                          ? "badge-error"
                          : "badge-ghost"
                      }`}
                    >
                      {summary.analysis?.summary?.overallTone ||
                        summary.analysis?.sentiment ||
                        "Neutral"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "query" && (
            <div className='space-y-4'>
              <form onSubmit={handleQuerySubmit}>
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text flex items-center gap-2'>
                      <HelpCircle /> Ask a question about your chat
                    </span>
                  </label>
                  <textarea
                    className='textarea textarea-bordered'
                    placeholder='e.g., What was the final decision on the project deadline?'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  ></textarea>
                </div>
                <button
                  type='submit'
                  className='btn btn-secondary w-full mt-2'
                  disabled={isQuerying}
                >
                  {isQuerying ? (
                    <>
                      <Loader className='animate-spin' /> Thinking...
                    </>
                  ) : (
                    "Ask AI"
                  )}
                </button>
              </form>
              {isQuerying && (
                <div className='text-center p-4'>
                  <span className='loading loading-dots loading-lg'></span>
                </div>
              )}
              {queryResult && (
                <div className='mt-4 p-4 bg-base-200 rounded-lg animate-fade-in'>
                  <div className='flex justify-between items-center mb-3'>
                    <span className='text-sm font-semibold'>Q&A</span>
                    <button
                      onClick={clearQueryResult}
                      className='text-error text-sm hover:underline'
                    >
                      Clear
                    </button>
                  </div>

                  <div className='mb-3 p-3 bg-primary/5 rounded border-l-2 border-primary'>
                    <div className='text-xs font-extrabold text-primary mb-1'>
                      Your Query:
                    </div>
                    <div className='text-sm text-base-content'>
                      {queryResult.question ||
                        lastAskedQuestion ||
                        "Question not available"}
                    </div>
                  </div>

                  <div className='p-3 bg-secondary/5 rounded border-l-2 border-secondary'>
                    <div className='text-xs font-extrabold text-secondary mb-1'>
                      Answer:
                    </div>
                    <div className='text-sm text-base-content'>
                      {queryResult.answer ||
                        queryResult.response ||
                        "Sorry, I couldn't find an answer to your question."}
                    </div>
                  </div>

                  {queryResult.confidence && (
                    <div className='text-xs text-gray-500 mt-2 text-right'>
                      Confidence: {Math.round(queryResult.confidence * 100)}%
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiModal;