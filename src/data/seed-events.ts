/**
 * Local test events for development/testing.
 * Remove before production launch.
 */
export const seedEvents2027 = [
  // January 2027
  { title: "New Year Skill Sprint", description: "Kick off 2027 with a 48-hour skill sprint. Complete gigs, earn bonus SP, climb the leaderboard.", category: "Competition", event_type: "Tournament", event_date: "2027-01-10T12:00:00Z", end_date: "2027-01-12T12:00:00Z", spots: 256, spots_filled: 0, icon: "🎆", prize: "10,000 SP", is_featured: true, tags: ["sprint", "new-year", "competition"], status: "upcoming" },
  { title: "API Workshop: GraphQL Edition", description: "Build real-time GraphQL APIs with the SkillSwappr API. Hands-on coding session.", category: "Dev", event_type: "Workshop", event_date: "2027-01-18T14:00:00Z", spots: 80, spots_filled: 0, icon: "🔧", prize: null, is_featured: false, tags: ["workshop", "api", "graphql"], status: "upcoming" },
  { title: "London Tech Meetup", description: "Monthly London meetup at WeWork Moorgate. Lightning talks, networking, and swapping.", category: "Networking", event_type: "In-Person", event_date: "2027-01-25T18:30:00Z", spots: 60, spots_filled: 0, icon: "🇬🇧", prize: null, is_featured: false, tags: ["meetup", "london", "networking"], status: "upcoming" },

  // February 2027
  { title: "Valentine's Collab Jam", description: "Pair up with a stranger and create something beautiful together in 24 hours.", category: "Design", event_type: "Workshop", event_date: "2027-02-14T10:00:00Z", spots: 100, spots_filled: 0, icon: "💕", prize: "3,000 SP", is_featured: true, tags: ["collaboration", "design", "valentine"], status: "upcoming" },
  { title: "Guild Wars: Season 6", description: "The biggest Guild Wars season yet. 64 guilds compete across 8 rounds.", category: "Competition", event_type: "Tournament", event_date: "2027-02-20T18:00:00Z", end_date: "2027-03-20T18:00:00Z", spots: 64, spots_filled: 0, icon: "⚔️", prize: "25,000 SP", is_featured: true, tags: ["guilds", "tournament", "season-6"], status: "upcoming" },

  // March 2027
  { title: "Women in Tech: Skill Swap Day", description: "Celebrating women in tech with a day of free workshops, mentoring, and skill swaps.", category: "Community", event_type: "Workshop", event_date: "2027-03-08T10:00:00Z", spots: 200, spots_filled: 0, icon: "👩‍💻", prize: null, is_featured: true, tags: ["women-in-tech", "workshop", "mentoring"], status: "upcoming" },
  { title: "NYC Spring Meetup", description: "Spring edition of our NYC meetup. Rooftop venue, great people, and skill swapping.", category: "Networking", event_type: "In-Person", event_date: "2027-03-22T17:00:00Z", spots: 50, spots_filled: 0, icon: "🗽", prize: null, is_featured: false, tags: ["meetup", "nyc", "spring"], status: "upcoming" },
  { title: "ELO Blitz: March Madness", description: "72-hour ELO sprint with double SP rewards. Top 20 get exclusive badges.", category: "Competition", event_type: "Tournament", event_date: "2027-03-28T00:00:00Z", end_date: "2027-03-31T00:00:00Z", spots: 512, spots_filled: 0, icon: "🔥", prize: "12,000 SP", is_featured: true, tags: ["elo", "sprint", "march-madness"], status: "upcoming" },

  // April 2027
  { title: "Design Sprint: E-Commerce", description: "Teams of 3 redesign an e-commerce checkout flow. Judged by industry designers.", category: "Design", event_type: "Tournament", event_date: "2027-04-05T15:00:00Z", end_date: "2027-04-07T15:00:00Z", spots: 48, spots_filled: 0, icon: "🎯", prize: "8,000 SP", is_featured: true, tags: ["design", "sprint", "ecommerce"], status: "upcoming" },
  { title: "Berlin Dev Meetup", description: "Monthly Berlin developer meetup at Factory Berlin. Talks on edge computing.", category: "Dev", event_type: "In-Person", event_date: "2027-04-12T18:00:00Z", spots: 45, spots_filled: 0, icon: "🇩🇪", prize: null, is_featured: false, tags: ["meetup", "berlin", "dev"], status: "upcoming" },
  { title: "Founder AMA: Q2 2027", description: "Quarterly AMA with the founding team. Roadmap updates, feature previews, Q&A.", category: "Community", event_type: "Live Stream", event_date: "2027-04-20T17:00:00Z", spots: null, spots_filled: 0, icon: "🎤", prize: null, is_featured: false, tags: ["ama", "founders", "q2"], status: "upcoming" },

  // May 2027
  { title: "Game Jam: 72 Hours", description: "Build a complete game in 72 hours. Solo or team. Theme revealed at kickoff.", category: "Game Dev", event_type: "Tournament", event_date: "2027-05-02T00:00:00Z", end_date: "2027-05-05T00:00:00Z", spots: 200, spots_filled: 0, icon: "🎮", prize: "15,000 SP", is_featured: true, tags: ["game-jam", "competition", "72hrs"], status: "upcoming" },
  { title: "Singapore Skill Social", description: "First ever Singapore meetup at Block71. Tech talks and networking.", category: "Networking", event_type: "In-Person", event_date: "2027-05-10T18:00:00Z", spots: 40, spots_filled: 0, icon: "🇸🇬", prize: null, is_featured: false, tags: ["meetup", "singapore", "networking"], status: "upcoming" },
  { title: "University Challenge: Spring 2027", description: "16 universities compete across design, dev, and marketing. Live-streamed finals.", category: "Academic", event_type: "Tournament", event_date: "2027-05-20T14:00:00Z", end_date: "2027-05-25T20:00:00Z", spots: 64, spots_filled: 0, icon: "🎓", prize: "20,000 SP", is_featured: true, tags: ["university", "challenge", "spring"], status: "upcoming" },

  // June 2027
  { title: "SkillSwappr World Cup 2027", description: "128 teams. 10 disciplines. 1 champion. The biggest tournament of the year returns.", category: "Competition", event_type: "Tournament", event_date: "2027-06-15T18:00:00Z", end_date: "2027-07-15T18:00:00Z", spots: 512, spots_filled: 0, icon: "🏆", prize: "75,000 SP", is_featured: true, tags: ["world-cup", "global", "flagship"], status: "upcoming" },
  { title: "Creative Jam: Music Videos", description: "Create music videos for indie artists in 48 hours. Best entries get promoted.", category: "Video", event_type: "Workshop", event_date: "2027-06-28T10:00:00Z", spots: 80, spots_filled: 0, icon: "🎬", prize: "5,000 SP", is_featured: false, tags: ["creative-jam", "video", "music"], status: "upcoming" },

  // July 2027
  { title: "Hackathon: AI Tools", description: "Build AI-powered tools using the SkillSwappr API. $50K SP total prize pool.", category: "Dev", event_type: "Tournament", event_date: "2027-07-10T00:00:00Z", end_date: "2027-07-13T00:00:00Z", spots: 300, spots_filled: 0, icon: "🤖", prize: "50,000 SP", is_featured: true, tags: ["hackathon", "ai", "tools"], status: "upcoming" },
  { title: "Tokyo Summer Meetup", description: "Summer meetup in Shibuya. Demos, sake, and skill swapping.", category: "Networking", event_type: "In-Person", event_date: "2027-07-20T18:00:00Z", spots: 35, spots_filled: 0, icon: "🇯🇵", prize: null, is_featured: false, tags: ["meetup", "tokyo", "summer"], status: "upcoming" },

  // August 2027
  { title: "Art Battle Royale 2027", description: "64 artists compete in elimination rounds. Live judging, audience voting.", category: "Design", event_type: "Tournament", event_date: "2027-08-05T14:00:00Z", end_date: "2027-08-07T20:00:00Z", spots: 64, spots_filled: 0, icon: "🎨", prize: "10,000 SP", is_featured: true, tags: ["art", "battle", "design"], status: "upcoming" },
  { title: "Podcast: Community Stories", description: "Live recording of community stories podcast. Share your skill swap journey.", category: "Community", event_type: "Live Stream", event_date: "2027-08-15T17:00:00Z", spots: null, spots_filled: 0, icon: "🎙️", prize: null, is_featured: false, tags: ["podcast", "stories", "community"], status: "upcoming" },

  // September 2027
  { title: "Back to School Sprint", description: "Students compete for scholarships in SP. Design, code, and write challenges.", category: "Academic", event_type: "Tournament", event_date: "2027-09-05T12:00:00Z", end_date: "2027-09-08T12:00:00Z", spots: 256, spots_filled: 0, icon: "📚", prize: "15,000 SP", is_featured: true, tags: ["students", "back-to-school", "sprint"], status: "upcoming" },
  { title: "Toronto Fall Meetup", description: "Fall meetup at MaRS Discovery District. Panel discussion + networking.", category: "Networking", event_type: "In-Person", event_date: "2027-09-18T18:00:00Z", spots: 55, spots_filled: 0, icon: "🇨🇦", prize: null, is_featured: false, tags: ["meetup", "toronto", "fall"], status: "upcoming" },

  // October 2027
  { title: "Hacktoberfest Collab 2027", description: "Open source contributions, bounties, and collaborative projects all month.", category: "Dev", event_type: "Workshop", event_date: "2027-10-01T00:00:00Z", end_date: "2027-10-31T23:59:00Z", spots: null, spots_filled: 0, icon: "🎃", prize: "Open Source", is_featured: true, tags: ["hacktoberfest", "open-source", "collaboration"], status: "upcoming" },
  { title: "ELO Blitz: Spooky Edition", description: "Halloween-themed sprint. Complete horror-themed gigs for triple SP.", category: "Competition", event_type: "Tournament", event_date: "2027-10-29T00:00:00Z", end_date: "2027-10-31T23:59:00Z", spots: 512, spots_filled: 0, icon: "👻", prize: "8,000 SP", is_featured: false, tags: ["halloween", "elo", "sprint"], status: "upcoming" },

  // November 2027
  { title: "Guild Wars: Season 7", description: "Winter season of Guild Wars. New format: double elimination bracket.", category: "Competition", event_type: "Tournament", event_date: "2027-11-10T18:00:00Z", end_date: "2027-12-10T18:00:00Z", spots: 64, spots_filled: 0, icon: "⚔️", prize: "30,000 SP", is_featured: true, tags: ["guilds", "tournament", "season-7"], status: "upcoming" },
  { title: "Founder AMA: Q4 2027", description: "Year-end AMA. What's coming in 2028, reflections on growth.", category: "Community", event_type: "Live Stream", event_date: "2027-11-20T17:00:00Z", spots: null, spots_filled: 0, icon: "🎤", prize: null, is_featured: false, tags: ["ama", "founders", "q4"], status: "upcoming" },

  // December 2027
  { title: "Winter Invitational 2027", description: "The end-of-year flagship tournament. Top 100 ranked users compete for glory.", category: "Competition", event_type: "Tournament", event_date: "2027-12-01T18:00:00Z", end_date: "2027-12-15T18:00:00Z", spots: 100, spots_filled: 0, icon: "❄️", prize: "40,000 SP", is_featured: true, tags: ["winter", "invitational", "flagship"], status: "upcoming" },
  { title: "Year in Review: Community Wrap", description: "Celebrating 2027 achievements, stats, and the best of the community.", category: "Community", event_type: "Live Stream", event_date: "2027-12-28T17:00:00Z", spots: null, spots_filled: 0, icon: "🎉", prize: null, is_featured: false, tags: ["year-in-review", "community", "celebration"], status: "upcoming" },
];

export const tournamentPool = [
  { name: "ELO Blitz", description: "48-hour ELO sprint. Complete as many gigs as possible.", format: "Sprint", max_teams: 256, team_size: 1, entry_fee: 0, prize_pool: "8,000 SP", min_elo: 0, icon: "🔥", is_quarterly: false },
  { name: "Design Sprint", description: "Teams of 3 redesign a product in 48 hours.", format: "Elimination", max_teams: 16, team_size: 3, entry_fee: 50, prize_pool: "5,000 SP", min_elo: 800, icon: "🎯", is_quarterly: false },
  { name: "Code Duel", description: "1v1 coding challenges. Solve problems faster than your opponent.", format: "Bracket", max_teams: 64, team_size: 1, entry_fee: 25, prize_pool: "3,000 SP", min_elo: 1000, icon: "⚡", is_quarterly: false },
  { name: "Guild Wars", description: "Guild vs Guild competition across multiple disciplines.", format: "Round Robin", max_teams: 32, team_size: 5, entry_fee: 100, prize_pool: "15,000 SP", min_elo: 1200, icon: "⚔️", is_quarterly: true },
  { name: "Creative Jam", description: "Solo creative challenge with a surprise theme revealed at start.", format: "Open", max_teams: 128, team_size: 1, entry_fee: 0, prize_pool: "4,000 SP", min_elo: 0, icon: "🎨", is_quarterly: false },
  { name: "University Challenge", description: "Inter-university competition across 4 skill categories.", format: "Multi-round", max_teams: 32, team_size: 4, entry_fee: 0, prize_pool: "20,000 SP", min_elo: 0, icon: "🎓", is_quarterly: true },
  { name: "Video Sprint", description: "Create a 60-second video on a given topic in 24 hours.", format: "Open", max_teams: 100, team_size: 1, entry_fee: 0, prize_pool: "3,500 SP", min_elo: 0, icon: "🎬", is_quarterly: false },
  { name: "Content Battle", description: "Write the best article, blog post, or copy on a given brief.", format: "Open", max_teams: 200, team_size: 1, entry_fee: 0, prize_pool: "2,500 SP", min_elo: 0, icon: "✍️", is_quarterly: false },
];
