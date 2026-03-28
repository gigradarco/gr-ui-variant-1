# Product Requirements Document (PRD)

## Product
GigRadar

## Document Owner
TBD

## Last Updated
2026-03-28

## Problem Statement

### Refined Problem Statement (Monetization-Aware)
Nightlife users have high intent but low confidence.

When they’re ready to go out, they cannot quickly determine which events are both relevant to their taste and likely to deliver a good experience. Information is fragmented, stale, and hard to verify.

This creates two failures:

- **User failure**: too much effort, bad choices, low trust.
- **Market failure**: high-intent demand is not efficiently matched to quality supply (events, venues, ticketing).

GigRadar solves this by becoming the trusted decision layer between intent and action.

## 1) Context and Problem
Nightlife discovery is fragmented and mostly utility-based: users can search events, but they rarely discover through people they trust.

Historically, Facebook Events solved this through social proof (seeing who is going), but that behavior no longer has a clear product owner. Current event apps optimize listings, not social coordination and taste identity.

GigRadar’s opportunity is to rebuild this social layer for nightlife, powered by AI and real-time event verification.

## 2) Product Vision
GigRadar is not only an event discovery app. It is the social graph for nightlife:
- Real-time social signals for what people are asking, considering, and attending.
- Public taste identity that compounds over time.
- Shared plans that turn intent into attendance.

Positioning statement:
> GigRadar is what Facebook Events was at its peak, rebuilt for the AI era with real-time verification.

## 3) Goals and Non-Goals
### Goals
- Increase event attendance through social proof and friend activity.
- Make taste identity a first-class user value (follow, discover, curate).
- Drive network effects where each user action improves discovery for others.
- Validate that social signals outperform search-only discovery.

### Non-Goals (MVP)
- Full creator marketplace.
- Ticketing integration across all platforms.
- End-to-end transportation/booking orchestration.
- Complex monetization features.

## 4) Target Users
- Urban nightlife explorers (18–35) in music-active cities.
- Friend groups that coordinate nights out.
- Taste leaders/curators whose activity influences others.

## 5) Core User Jobs
- “Show me what’s good tonight without me doing heavy search.”
- “Show me where my friends or people with similar taste are going.”
- “Help me decide quickly and commit to a plan.”
- “Let my nightlife history represent my taste identity.”

## 6) Core Product Pillars
1. **Social Feed (Discovery through people)**
   - Users see social activity like prompts, intent, and attendance from network.
   - Example: “Marcus asked: any jazz tonight in Tiong Bahru?”

2. **Public Taste Profiles (Identity through history)**
   - Profiles show genre preferences, explored cities, and attendance history.
   - Profiles become followable and curation-oriented.

3. **Shared Plans (Attendance through social proof)**
   - Users see signals like “3 people from your network are going.”
   - Supports lightweight commitment states (Interested / Going).

4. **AI + Verification Layer (Trust through confidence)**
   - Recommendations include confidence/credibility context.
   - Event status validated in near real time.

## 7) MVP Scope
### In Scope
- Activity feed sourced from user prompts and intent signals.
- User taste profile with:
  - Top genres
  - Cities explored
  - Recent attended events
- Plan states for events:
  - Interested
  - Going
- Social proof module on event cards/pages:
  - Friend/network attendance count
- Basic notifications for social actions:
  - Friend marked Going
  - Multiple network users interested in same event

### Out of Scope (MVP)
- Advanced privacy matrix per field/action.
- Group chat and threaded event discussions.
- Ticket purchase flow.
- Paid boosts/ads.

## 8) User Experience Flow (MVP)
1. User opens GigRadar on a high-intent day (e.g., Friday afternoon).
2. Feed shows trusted social signals (prompts, interest, going activity).
3. User opens an event and views confidence + social proof.
4. User taps Interested or Going.
5. Network sees this action, creating additional discovery loops.
6. After event, attendance is logged and profile updates.

## 9) Functional Requirements
### Feed
- Must render latest relevant social activities from user network.
- Must support activity types:
  - Prompt asked
  - Interested
  - Going
  - Attended (post-event)
- Must allow drill-down from feed activity to event detail.

### Profiles
- Must display user taste summary (genres + cities).
- Must display attendance history.
- Must expose follow/unfollow state.

### Event Detail
- Must show social proof summary (network count and identities where allowed).
- Must show recommendation credibility/confidence signal.
- Must support Interested and Going state updates.

### Notifications
- Must notify users when close network actions are relevant to same event/night.
- Must avoid notification spam through simple rate limits.

## 10) Success Metrics
### North Star
- **Socially influenced attendance rate**: % of event attendance actions preceded by social feed exposure.

### Supporting Metrics
- Weekly active users who view feed before searching.
- % users with at least 1 Going action per week.
- Avg number of social interactions per active user per week.
- Profile completion rate (genres/cities/history visible).
- Invite/follow conversion rate from profile/feed exposure.

## 11) Risks and Mitigations
- **Cold start (low social graph density)**
  - Mitigation: seed with city-level public activity and suggested follows.

- **Privacy concerns around prompts and attendance**
  - Mitigation: clear defaults, visibility controls, and explicit consent on share surfaces.

- **Signal quality issues (false/low-confidence event info)**
  - Mitigation: confidence labeling, freshness timestamps, and verification priority for trending events.

- **Novelty without habit formation**
  - Mitigation: weekly recap loops, profile progression, and social streak-style hooks.

## 12) Rollout Plan
### Phase 1: Social Signal MVP (single city)
- Launch feed + Interested/Going + profile basics.
- Validate social proof impact on attendance intent.

### Phase 2: Identity and Network Effects
- Improve profiles, follow graph, and recommendation relevance.
- Add post-event logging and profile progression.

### Phase 3: Multi-city Expansion
- Expand to additional nightlife-heavy cities.
- Optimize ranking for cross-city users and travelers.

## 13) Open Questions
- What should default visibility be for prompt activity?
- Should “Going” be auto-confirmed by geofence/post-event check-in, or manual?
- How should we rank feed activities: recency, closeness, or taste similarity?
- What minimum confidence threshold should suppress event recommendations?

## 14) Appendix: Pitch Reframe
The strongest product narrative:
- Not an event listing utility.
- A social coordination and identity system for nightlife.
- Attendance becomes content, and content drives attendance.
