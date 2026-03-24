import {type Kysely, sql} from 'kysely'

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

const sqliteSchema = `CREATE TABLE IF NOT EXISTS "AgendaItem" (
    id TEXT NOT NULL,
    content TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "isComplete" INTEGER DEFAULT 0 NOT NULL,
    "sortOrder" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "meetingId" TEXT,
    pinned INTEGER DEFAULT 0 NOT NULL,
    "pinnedParentId" TEXT
);

CREATE TABLE IF NOT EXISTS "AtlassianAuth" (
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "jiraSearchQueries" TEXT DEFAULT '[]' NOT NULL,
    "cloudIds" TEXT DEFAULT '[]' NOT NULL,
    scope TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "AzureDevOpsDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" TEXT NOT NULL,
    "dimensionName" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "projectKey" TEXT NOT NULL,
    "workItemType" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Comment" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "isAnonymous" INTEGER DEFAULT 0 NOT NULL,
    "threadParentId" TEXT,
    reactjis TEXT DEFAULT '[]' NOT NULL,
    content TEXT NOT NULL,
    "createdBy" TEXT,
    "plaintextContent" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "threadSortOrder" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "Discussion" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "teamId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "discussionTopicId" TEXT NOT NULL,
    "discussionTopicType" TEXT NOT NULL,
    summary TEXT
);

CREATE TABLE IF NOT EXISTS "DomainJoinRequest" (
    id integer NOT NULL,
    "createdBy" TEXT NOT NULL,
    domain TEXT NOT NULL,
    "expiresAt" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "EmailVerification" (
    id integer NOT NULL,
    email TEXT COLLATE NOCASE NOT NULL,
    expiration TEXT NOT NULL,
    token TEXT NOT NULL,
    "hashedPassword" TEXT,
    "invitationToken" TEXT,
    "pseudoId" TEXT
);

CREATE TABLE IF NOT EXISTS "EmbeddingsJobQueue" (
    id integer NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    state TEXT DEFAULT 'queued' NOT NULL,
    "stateMessage" text,
    "retryAfter" TEXT,
    "retryCount" INTEGER DEFAULT 0 NOT NULL,
    "startAt" TEXT,
    priority integer DEFAULT 50 NOT NULL,
    "jobData" TEXT DEFAULT '[]' NOT NULL,
    "jobType" TEXT NOT NULL,
    model TEXT,
    "embeddingsMetadataId" integer
);

CREATE TABLE IF NOT EXISTS "EmbeddingsMetadata" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "objectType" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "refUpdatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "teamId" TEXT NOT NULL,
    "fullText" text,
    language TEXT
);

CREATE TABLE IF NOT EXISTS "FailedAuthRequest" (
    id integer NOT NULL,
    email TEXT COLLATE NOCASE NOT NULL,
    ip TEXT NOT NULL,
    "time" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    id TEXT  NOT NULL,
    "featureName" TEXT NOT NULL,
    scope TEXT NOT NULL,
    description text,
    "expiresAt" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isPublic" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "FeatureFlagOwner" (
    "featureFlagId" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    "orgId" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "FreemailDomain" (
    domain TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "GitHubAuth" (
    "accessToken" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    login TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubSearchQueries" TEXT DEFAULT '[]' NOT NULL,
    scope TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "GitHubDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" TEXT NOT NULL,
    "dimensionName" TEXT NOT NULL,
    "nameWithOwner" TEXT NOT NULL,
    "labelTemplate" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "GitLabDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" TEXT NOT NULL,
    "dimensionName" TEXT NOT NULL,
    "projectId" integer NOT NULL,
    "providerId" integer NOT NULL,
    "labelTemplate" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Insight" (
    id integer NOT NULL,
    "teamId" TEXT NOT NULL,
    "startDateTime" TEXT NOT NULL,
    "endDateTime" TEXT NOT NULL,
    wins TEXT NOT NULL,
    challenges TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "meetingsCount" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "IntegrationProvider" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    service TEXT NOT NULL,
    "authStrategy" TEXT NOT NULL,
    scope TEXT NOT NULL,
    "scopeGlobal" INTEGER GENERATED ALWAYS AS (CASE WHEN scope = 'global' THEN 1 ELSE 0 END) STORED,
    "teamId" TEXT,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "serverBaseUrl" TEXT,
    "webhookUrl" TEXT,
    "consumerKey" TEXT,
    "consumerSecret" text,
    "tenantId" TEXT,
    "orgId" TEXT,
    "sharedSecret" TEXT
);

CREATE TABLE IF NOT EXISTS "IntegrationSearchQuery" (
    id integer NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "providerId" integer,
    service TEXT NOT NULL,
    query TEXT DEFAULT '[]' NOT NULL,
    "lastUsedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "JiraDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" TEXT NOT NULL,
    "cloudId" TEXT NOT NULL,
    "projectKey" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "dimensionName" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "JiraServerDimensionFieldMap" (
    id integer NOT NULL,
    "providerId" integer NOT NULL,
    "teamId" TEXT NOT NULL,
    "dimensionName" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "MassInvitation" (
    id character(12) NOT NULL,
    expiration TEXT NOT NULL,
    "meetingId" TEXT,
    "teamMemberId" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT
);

CREATE TABLE IF NOT EXISTS "MeetingMember" (
    id TEXT NOT NULL,
    "meetingType" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "userId" TEXT NOT NULL,
    "isSpectating" INTEGER,
    "votesRemaining" INTEGER
);

CREATE TABLE IF NOT EXISTS "MeetingSeries" (
    id integer NOT NULL,
    "meetingType" TEXT NOT NULL,
    title TEXT NOT NULL,
    "recurrenceRule" TEXT NOT NULL,
    duration integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "cancelledAt" TEXT,
    "teamId" TEXT NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    "gcalSeriesId" TEXT
);

CREATE TABLE IF NOT EXISTS "MeetingSettings" (
    id TEXT NOT NULL,
    "phaseTypes" TEXT NOT NULL,
    "meetingType" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "selectedTemplateId" TEXT,
    "jiraSearchQueries" TEXT,
    "maxVotesPerGroup" INTEGER,
    "totalVotes" INTEGER,
    "disableAnonymity" INTEGER,
    "videoMeetingURL" TEXT
);

CREATE TABLE IF NOT EXISTS "MeetingTemplate" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    name TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    scope TEXT DEFAULT 'TEAM' NOT NULL,
    "orgId" TEXT NOT NULL,
    "parentTemplateId" TEXT,
    "lastUsedAt" TEXT,
    type TEXT NOT NULL,
    "isStarter" INTEGER DEFAULT 0 NOT NULL,
    "isFree" INTEGER DEFAULT 0 NOT NULL,
    "illustrationUrl" TEXT NOT NULL,
    "hideStartingAt" TEXT,
    "hideEndingAt" TEXT,
    "mainCategory" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "MeetingTemplateUserFavorite" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "NewFeature" (
    id integer NOT NULL,
    "actionButtonCopy" TEXT NOT NULL,
    "snackbarMessage" TEXT NOT NULL,
    url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "NewMeeting" (
    id TEXT NOT NULL,
    "isLegacy" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "createdBy" TEXT,
    "endedAt" TEXT,
    "facilitatorStageId" TEXT NOT NULL,
    "facilitatorUserId" TEXT,
    "meetingCount" integer NOT NULL,
    "meetingNumber" integer NOT NULL,
    name TEXT NOT NULL,
    "summarySentAt" TEXT,
    "teamId" TEXT NOT NULL,
    "meetingType" TEXT NOT NULL,
    phases TEXT NOT NULL,
    "showConversionModal" INTEGER DEFAULT 0 NOT NULL,
    "meetingSeriesId" integer,
    "scheduledEndTime" TEXT,
    summary TEXT,
    "sentimentScore" REAL,
    "usedReactjis" TEXT,
    "slackTs" REAL,
    engagement REAL,
    "totalVotes" integer,
    "maxVotesPerGroup" INTEGER,
    "disableAnonymity" INTEGER,
    "commentCount" integer,
    "taskCount" integer,
    "agendaItemCount" integer,
    "storyCount" integer,
    "templateId" TEXT,
    "topicCount" integer,
    "reflectionCount" integer,
    transcription TEXT,
    "recallBotId" TEXT,
    "videoMeetingURL" TEXT,
    "autogroupReflectionGroups" TEXT,
    "resetReflectionGroups" TEXT,
    "templateRefId" TEXT,
    "meetingPrompt" TEXT,
    "summaryPageId" INTEGER
);

CREATE TABLE IF NOT EXISTS "Notification" (
    id TEXT NOT NULL,
    status TEXT DEFAULT 'UNREAD' NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    type TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meetingId" TEXT,
    "authorId" TEXT,
    "commentId" TEXT,
    "discussionId" TEXT,
    "teamId" TEXT,
    "evictorUserId" TEXT,
    "senderName" TEXT,
    "senderPicture" TEXT,
    "senderUserId" TEXT,
    "meetingName" TEXT,
    "retroReflectionId" TEXT,
    "retroDiscussStageIdx" INTEGER,
    "orgId" TEXT,
    last4 INTEGER,
    brand TEXT,
    "activeDomain" TEXT,
    "domainJoinRequestId" integer,
    email TEXT COLLATE NOCASE,
    name TEXT,
    picture TEXT,
    "requestCreatedBy" TEXT,
    "responseId" integer,
    "changeAuthorId" TEXT,
    involvement TEXT,
    "taskId" TEXT,
    "archivorUserId" TEXT,
    "invitationId" TEXT,
    "orgName" TEXT,
    "orgPicture" TEXT,
    "scheduledLockAt" TEXT
);

CREATE TABLE IF NOT EXISTS "Organization" (
    id TEXT NOT NULL,
    "activeDomain" TEXT,
    "isActiveDomainTouched" INTEGER DEFAULT 0 NOT NULL,
    "creditCard" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    name TEXT NOT NULL,
    "payLaterClickCount" INTEGER DEFAULT 0 NOT NULL,
    "periodEnd" TEXT,
    "periodStart" TEXT,
    picture TEXT,
    "showConversionModal" INTEGER DEFAULT 0 NOT NULL,
    "stripeId" TEXT,
    "stripeSubscriptionId" TEXT,
    "upcomingInvoiceEmailSentAt" TEXT,
    tier TEXT DEFAULT 'starter' NOT NULL,
    "tierLimitExceededAt" TEXT,
    "trialStartDate" TEXT,
    "scheduledLockAt" TEXT,
    "lockedAt" TEXT,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "featureFlags" TEXT DEFAULT '[]' NOT NULL,
    "useAI" INTEGER DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "OrganizationApprovedDomain" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "removedAt" TEXT,
    domain TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "addedByUserId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "OrganizationUser" (
    id TEXT NOT NULL,
    "suggestedTier" TEXT,
    inactive INTEGER DEFAULT 0 NOT NULL,
    "joinedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "orgId" TEXT NOT NULL,
    "removedAt" TEXT,
    role TEXT,
    "userId" TEXT NOT NULL,
    tier TEXT NOT NULL,
    "trialStartDate" TEXT
);

CREATE TABLE IF NOT EXISTS "OrganizationUserAudit" (
    id integer NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "eventType" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "PasswordResetRequest" (
    id integer NOT NULL,
    ip cidr NOT NULL,
    email TEXT COLLATE NOCASE NOT NULL,
    "time" TEXT DEFAULT (datetime('now')) NOT NULL,
    token TEXT NOT NULL,
    "isValid" INTEGER DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "Poll" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "deletedAt" TEXT,
    "endedAt" TEXT,
    "createdById" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "threadSortOrder" REAL NOT NULL,
    "meetingId" TEXT,
    title TEXT
);

CREATE TABLE IF NOT EXISTS "PollOption" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "pollId" integer NOT NULL,
    "voteUserIds" TEXT DEFAULT '[]' NOT NULL,
    title TEXT
);

CREATE TABLE IF NOT EXISTS "PushInvitation" (
    id integer NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "denialCount" INTEGER DEFAULT 0 NOT NULL,
    "lastDenialAt" TEXT
);

CREATE TABLE IF NOT EXISTS "QueryMap" (
    id TEXT NOT NULL,
    query text NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "ReflectPrompt" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "removedAt" TEXT,
    description TEXT NOT NULL,
    "groupColor" TEXT NOT NULL,
    "sortOrder" TEXT NOT NULL,
    question TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "parentPromptId" TEXT
);

CREATE TABLE IF NOT EXISTS "RetroReflection" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "meetingId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "sortOrder" REAL DEFAULT 0 NOT NULL,
    "creatorId" TEXT,
    content TEXT NOT NULL,
    "plaintextContent" TEXT NOT NULL,
    entities TEXT DEFAULT '[]' NOT NULL,
    "sentimentScore" REAL,
    reactjis TEXT DEFAULT '[]' NOT NULL,
    "reflectionGroupId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "RetroReflectionGroup" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "meetingId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "sortOrder" REAL DEFAULT 0 NOT NULL,
    "voterIds" TEXT DEFAULT '[]' NOT NULL,
    "smartTitle" TEXT,
    title TEXT,
    "discussionPromptQuestion" TEXT
);

CREATE TABLE IF NOT EXISTS "SAML" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "lastUpdatedBy" TEXT DEFAULT 'aGhostUser' NOT NULL,
    metadata TEXT,
    "orgId" TEXT,
    "metadataURL" TEXT,
    "samlOrgAttribute" TEXT,
    "scimAuthenticationType" TEXT,
    "scimBearerToken" TEXT,
    "scimOAuthClientId" TEXT,
    "scimOAuthClientSecret" TEXT
);

CREATE TABLE IF NOT EXISTS "SAMLDomain" (
    domain TEXT NOT NULL,
    "samlId" TEXT
);

CREATE TABLE IF NOT EXISTS "ScheduledJob" (
    id integer NOT NULL,
    "runAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    type TEXT NOT NULL,
    "orgId" TEXT,
    "meetingId" TEXT
);

CREATE TABLE IF NOT EXISTS "SlackAuth" (
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    id TEXT NOT NULL,
    "botUserId" TEXT NOT NULL,
    "botAccessToken" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "defaultTeamChannelId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slackTeamId" TEXT NOT NULL,
    "slackTeamName" TEXT NOT NULL,
    "slackUserId" TEXT NOT NULL,
    "slackUserName" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "SlackNotification" (
    id TEXT NOT NULL,
    event TEXT NOT NULL,
    "channelId" TEXT,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "StripeQuantityMismatchLogging" (
    id integer NOT NULL,
    "userId" TEXT DEFAULT NULL,
    "eventTime" TEXT DEFAULT (datetime('now')) NOT NULL,
    "eventType" TEXT NOT NULL,
    "stripePreviousQuantity" integer NOT NULL,
    "stripeNextQuantity" integer NOT NULL,
    "orgUsers" TEXT NOT NULL,
    "orgId" TEXT
);

CREATE TABLE IF NOT EXISTS "SuggestedAction" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    "removedAt" TEXT,
    type TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Task" (
    id TEXT NOT NULL,
    content TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "doneMeetingId" TEXT,
    "dueDate" TEXT,
    integration TEXT,
    "integrationHash" TEXT,
    "meetingId" TEXT,
    "plaintextContent" TEXT NOT NULL,
    "sortOrder" REAL DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    tags TEXT DEFAULT '[]' NOT NULL,
    "teamId" TEXT NOT NULL,
    "discussionId" TEXT,
    "threadParentId" TEXT,
    "threadSortOrder" integer,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "userId" TEXT
);

CREATE TABLE IF NOT EXISTS "TaskEstimate" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "changeSource" TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meetingId" TEXT,
    "stageId" TEXT,
    "discussionId" TEXT,
    "jiraFieldId" TEXT,
    "githubLabelName" TEXT,
    "azureDevOpsFieldName" TEXT,
    "gitlabLabelId" TEXT
);

CREATE TABLE IF NOT EXISTS "Team" (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "createdBy" TEXT,
    "isArchived" INTEGER DEFAULT 0 NOT NULL,
    "isPaid" INTEGER DEFAULT 1 NOT NULL,
    "jiraDimensionFields" TEXT DEFAULT '[]' NOT NULL,
    "lastMeetingType" TEXT DEFAULT 'retrospective' NOT NULL,
    tier TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "isOnboardTeam" INTEGER DEFAULT 0 NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "lockMessageHTML" text,
    "qualAIMeetingsCount" integer DEFAULT 0 NOT NULL,
    "autoJoin" INTEGER DEFAULT 0 NOT NULL,
    "trialStartDate" TEXT,
    "kudosEmojiUnicode" TEXT DEFAULT '❤️' NOT NULL
);

CREATE TABLE IF NOT EXISTS "TeamInvitation" (
    id TEXT NOT NULL,
    "acceptedAt" TEXT,
    "acceptedBy" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "expiresAt" TEXT NOT NULL,
    email TEXT COLLATE NOCASE NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "isMassInvite" INTEGER DEFAULT 0 NOT NULL,
    "meetingId" TEXT,
    "teamId" TEXT NOT NULL,
    token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "TeamMeetingTemplate" (
    "teamId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "lastUsedAt" TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "TeamMember" (
    id TEXT NOT NULL,
    "isNotRemoved" INTEGER DEFAULT 1 NOT NULL,
    "isLead" INTEGER DEFAULT 0 NOT NULL,
    "isSpectatingPoker" INTEGER DEFAULT 0 NOT NULL,
    email TEXT COLLATE NOCASE NOT NULL,
    "openDrawer" TEXT,
    picture TEXT NOT NULL,
    "preferredName" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "sortOrder" TEXT
);

CREATE TABLE IF NOT EXISTS "TeamMemberIntegrationAuth" (
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" integer NOT NULL,
    service TEXT NOT NULL,
    "isActive" INTEGER DEFAULT 1 NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    scopes TEXT,
    "accessTokenSecret" text,
    "expiresAt" TEXT,
    channel TEXT
);

CREATE TABLE IF NOT EXISTS "TeamPromptResponse" (
    id integer NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sortOrder" integer NOT NULL,
    content TEXT NOT NULL,
    "plaintextContent" text NOT NULL,
    reactjis TEXT DEFAULT '[]' NOT NULL
);

CREATE TABLE IF NOT EXISTS "TemplateDimension" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    "teamId" TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "templateId" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "sortOrder" TEXT NOT NULL,
    "removedAt" TEXT
);

CREATE TABLE IF NOT EXISTS "TemplateRef" (
    id character(24) NOT NULL,
    template TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "TemplateScale" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    name TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "parentScaleId" TEXT,
    "isStarter" INTEGER DEFAULT 0 NOT NULL,
    "removedAt" TEXT
);

CREATE TABLE IF NOT EXISTS "TemplateScaleRef" (
    id character(24) NOT NULL,
    scale TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "TemplateScaleValue" (
    id integer NOT NULL,
    "templateScaleId" TEXT NOT NULL,
    "sortOrder" TEXT NOT NULL,
    color TEXT NOT NULL,
    label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "TimelineEvent" (
    id TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "interactionCount" INTEGER DEFAULT 0 NOT NULL,
    "seenCount" INTEGER DEFAULT 0 NOT NULL,
    type TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "orgId" TEXT,
    "meetingId" TEXT,
    "isActive" INTEGER DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
    id TEXT NOT NULL,
    email TEXT COLLATE NOCASE NOT NULL,
    "createdAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    inactive INTEGER DEFAULT 0 NOT NULL,
    "lastSeenAt" TEXT DEFAULT (datetime('now')) NOT NULL,
    "preferredName" TEXT NOT NULL,
    tier TEXT DEFAULT 'starter' NOT NULL,
    picture text NOT NULL,
    tms TEXT DEFAULT '[]' NOT NULL,
    "featureFlags" TEXT DEFAULT '[]' NOT NULL,
    identities TEXT DEFAULT '[]' NOT NULL,
    "lastSeenAtURLs" TEXT,
    "pseudoId" TEXT,
    "newFeatureId" integer,
    "overLimitCopy" TEXT,
    "isRemoved" INTEGER DEFAULT 0 NOT NULL,
    "reasonRemoved" TEXT,
    rol TEXT,
    "payLaterClickCount" INTEGER DEFAULT 0 NOT NULL,
    "isWatched" INTEGER DEFAULT 0 NOT NULL,
    domain TEXT COLLATE NOCASE GENERATED ALWAYS AS (substr(email, instr(email, '@') + 1)) STORED,
    "sendSummaryEmail" INTEGER DEFAULT 1 NOT NULL,
    "isPatient0" INTEGER DEFAULT 0 NOT NULL,
    "trialStartDate" TEXT,
    "freeCustomRetroTemplatesRemaining" INTEGER DEFAULT 2 NOT NULL,
    "freeCustomPokerTemplatesRemaining" INTEGER DEFAULT 2 NOT NULL,
    "favoriteTemplateIds" TEXT DEFAULT '[]' NOT NULL,
    "sendPageInvitationEmail" INTEGER DEFAULT 1,
    "persistentUserId" TEXT,
    "scimId" TEXT,
    "scimExternalId" TEXT,
    "scimUserName" TEXT COLLATE NOCASE,
    "scimGivenName" TEXT,
    "scimFamilyName" TEXT
);
CREATE TABLE IF NOT EXISTS "NotificationSettings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "authId" INTEGER NOT NULL,
    event TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Page" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    "yDoc" BLOB,
    title TEXT,
    "plaintextContent" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')),
    "updatedAt" TEXT DEFAULT (datetime('now')),
    "parentPageId" INTEGER,
    "isParentLinked" INTEGER DEFAULT 0,
    "teamId" TEXT,
    "isPrivate" INTEGER DEFAULT 0,
    "sortOrder" TEXT,
    "ancestorIds" TEXT DEFAULT '[]',
    "deletedAt" TEXT,
    "deletedBy" TEXT,
    "summaryMeetingId" TEXT,
    "isDatabase" INTEGER DEFAULT 0,
    "isMeetingTOC" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "TeamNotificationSettings" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "providerId" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "channelId" TEXT,
    events TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS "AIRequest" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    "tokenCost" INTEGER,
    "createdAt" TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "AIPrompt" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    title TEXT,
    content TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')),
    "lastUsedAt" TEXT
);

CREATE TABLE IF NOT EXISTS "LinearDimensionFieldMap" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "teamId" TEXT,
    "dimensionName" TEXT,
    "repoId" TEXT,
    "labelTemplate" TEXT
);

CREATE TABLE IF NOT EXISTS "PageExternalAccess" (
    "pageId" INTEGER NOT NULL,
    email TEXT COLLATE NOCASE,
    role TEXT,
    "invitedBy" TEXT
);

CREATE TABLE IF NOT EXISTS "PageUserAccess" (
    "pageId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    role TEXT
);

CREATE TABLE IF NOT EXISTS "PageTeamAccess" (
    "pageId" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    role TEXT
);

CREATE TABLE IF NOT EXISTS "PageOrganizationAccess" (
    "pageId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL,
    role TEXT
);

CREATE TABLE IF NOT EXISTS "PageAccess" (
    "pageId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    role TEXT
);

CREATE TABLE IF NOT EXISTS "PageUserSortOrder" (
    "pageId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "sortOrder" TEXT
);

CREATE TABLE IF NOT EXISTS "PageBacklink" (
    "fromPageId" INTEGER NOT NULL,
    "toPageId" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "PageAccessRequest" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    role TEXT,
    reason TEXT,
    "createdAt" TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "UserDetail" (
    id TEXT PRIMARY KEY NOT NULL,
    "bytesUploaded" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "OAuthAPIProvider" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "orgId" TEXT NOT NULL,
    name TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT,
    "redirectUris" TEXT DEFAULT '[]',
    scopes TEXT DEFAULT '[]',
    "createdAt" TEXT DEFAULT (datetime('now')),
    "updatedAt" TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "OAuthAPICode" (
    id TEXT PRIMARY KEY NOT NULL,
    "clientId" TEXT NOT NULL,
    "redirectUri" TEXT,
    "userId" TEXT NOT NULL,
    scopes TEXT DEFAULT '[]',
    "expiresAt" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "EmbeddingsFailures" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "embeddingsMetadataId" INTEGER,
    "modelId" TEXT,
    "pageId" INTEGER,
    message TEXT,
    "retryCount" INTEGER DEFAULT 0,
    "jobData" TEXT,
    "jobType" TEXT,
    "lastFailedAt" TEXT
);

CREATE TABLE IF NOT EXISTS "EmbeddingsJobQueueV2" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "updatedAt" TEXT DEFAULT (datetime('now')),
    "startAt" TEXT,
    state TEXT DEFAULT 'queued',
    "stateMessage" TEXT,
    "retryCount" INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,
    "jobData" TEXT,
    "jobType" TEXT,
    "modelId" TEXT,
    "pageId" INTEGER,
    "embeddingsMetadataId" INTEGER
);

CREATE TABLE IF NOT EXISTS "CompanyCluster" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    "maxTeamLimitAt" TEXT
);

CREATE TABLE IF NOT EXISTS "CompanyClusterDomain" (
    "companyClusterId" INTEGER NOT NULL,
    domain TEXT NOT NULL,
    "updatedAt" TEXT DEFAULT (datetime('now')),
    "isManuallyCreated" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "CompanyClusterOrganization" (
    "companyClusterId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL,
    "isPrimary" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "JiraExport" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "teamId" TEXT,
    "userId" TEXT,
    "createdAt" TEXT DEFAULT (datetime('now'))
);
`

export async function up(db: Kysely<any>): Promise<void> {
  if (!isSqlite) return
  // Check if already initialized
  const tables = await sql<{name: string}>\`SELECT name FROM sqlite_master WHERE type='table' AND name='User'\`.execute(db)
  if (tables.rows.length > 0) return

  // Execute SQLite schema
  const statements = sqliteSchema.split(';').filter((s: string) => s.trim())
  for (const stmt of statements) {
    await sql.raw(stmt).execute(db)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop all tables
  const tables = await sql<{name: string}>\`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_migration%'\`.execute(db)
  for (const row of tables.rows) {
    await sql.raw(\`DROP TABLE IF EXISTS "${row.name}"\`).execute(db)
  }
}
