import { createClient } from "@supabase/supabase-js";

(function () {
  const STORAGE_KEY = "project-looper-mvp";
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase =
    SUPABASE_URL && SUPABASE_ANON_KEY
      ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      : null;
  const MVP_SCOPE_NOTES = {
    title: "MVP scope",
    summary:
      "Auth, profiles, project creation, join requests, team pages, updates, and portfolio-ready completed projects with a more polished first-run experience.",
  };
  const CATEGORY_CONFIG = {
    design: { key: "design", label: "Design / Art", shortLabel: "Design", icon: "\u{1F3A8}" },
    dev: { key: "dev", label: "Dev / Coding", shortLabel: "Dev", icon: "\u{1F47E}" },
    writing: { key: "writing", label: "Writing / Content", shortLabel: "Writing", icon: "\u270D\uFE0F" },
    general: { key: "general", label: "General", shortLabel: "General", icon: "\u{1F528}" },
  };
  const CATEGORY_ORDER = ["design", "dev", "writing", "general"];
  const COMMUNITY_CONFIG = {
    design: {
      key: "design",
      title: "Design",
      icon: "&#127912;",
      description: "A place for people who enjoy building visual work, interfaces, illustrations, and motion together.",
      activeBuilders: 24,
    },
    dev: {
      key: "dev",
      title: "Dev",
      icon: "&#128126;",
      description: "A place for people who enjoy building apps, tools, games, and playful side projects together.",
      activeBuilders: 31,
    },
    writing: {
      key: "writing",
      title: "Writing",
      icon: "&#9997;&#65039;",
      description: "A place for people who enjoy building stories, scripts, content, and editorial work together.",
      activeBuilders: 18,
    },
    general: {
      key: "general",
      title: "General",
      icon: "&#128296;",
      description: "A place for people who enjoy building practical, cross-discipline ideas together.",
      activeBuilders: 21,
    },
  };
  const COMMUNITY_ORDER = ["design", "dev", "writing", "general"];
  const COMMUNITY_POSTS = {
    design: [
      { authorName: "Jordan Rivera", content: "Shared a fresh layout direction for collaborative poster sets. Curious who else is exploring bold typography right now.", createdAt: "2026-04-09T17:20:00.000Z" },
      { authorName: "Mika Park", content: "Dropped a few reference boards for motion-heavy branding work. Happy to swap inspiration if you're building in this space.", createdAt: "2026-04-08T21:10:00.000Z" },
      { authorName: "Avery Chen", content: "Looking for favorite tools for lightweight design handoff on small creative teams.", createdAt: "2026-04-07T19:05:00.000Z" },
    ],
    dev: [
      { authorName: "Leo Santos", content: "Anyone else building tiny tools for game prototypes? I've been keeping the UI intentionally scrappy and it's working well.", createdAt: "2026-04-09T22:00:00.000Z" },
      { authorName: "Avery Chen", content: "Shared a quick pattern for organizing MVP state without making the app feel rigid. It's been helpful for fast iteration.", createdAt: "2026-04-08T18:45:00.000Z" },
      { authorName: "Jordan Rivera", content: "Would love more examples of playful developer tooling that still feels approachable to non-dev collaborators.", createdAt: "2026-04-06T16:30:00.000Z" },
    ],
    writing: [
      { authorName: "Samira Hale", content: "Interview-based projects are moving fast in here lately. If you're collecting creator stories, now's a good time to ask for help.", createdAt: "2026-04-09T20:10:00.000Z" },
      { authorName: "Jordan Rivera", content: "Shared a simple editorial checklist for collaborative writing projects. It keeps handoffs much smoother.", createdAt: "2026-04-08T15:15:00.000Z" },
      { authorName: "Avery Chen", content: "Looking for examples of short-form content projects that still feel substantial enough for a portfolio piece.", createdAt: "2026-04-07T13:40:00.000Z" },
    ],
    general: [
      { authorName: "Avery Chen", content: "Community resource projects seem to gain momentum fastest when the scope starts small. Curious what's working for everyone else.", createdAt: "2026-04-09T14:25:00.000Z" },
      { authorName: "Mika Park", content: "Shared a lightweight framework for turning a broad civic idea into a project people can actually join.", createdAt: "2026-04-08T17:50:00.000Z" },
      { authorName: "Leo Santos", content: "If you're building something cross-discipline, post the clearest possible goal first. It really helps the right people show up.", createdAt: "2026-04-06T22:05:00.000Z" },
    ],
  };

  const appState = {
    db: loadDatabase(),
    sessionUserId: null,
    route: { view: "landing", id: null },
    flash: null,
    isLoading: true,
    isRemoteDataReady: false,
    supabaseEnabled: Boolean(supabase),
    realtimeChatChannels: [],
    shouldScrollChatsToBottom: false,
    projectFilter: "open",
    categoryFilter: "all",
    browseQuery: "",
    selectedProfileId: null,
    activeChatProjectId: null,
    chatMinimized: true,
    joinRequestProjectId: null,
    profileEditorOpen: false,
    projectEditorProjectId: null,
    projectTeamModalId: null,
    authFlow: null,
    createDetailsOpen: false,
    createDurationType: "fixed",
    projectEditorDurationType: "fixed",
    createTeamSizeMode: "fixed",
    projectEditorTeamSizeMode: "fixed",
    homeCarouselIndex: 0,
    landingCarouselIndex: 0,
  };

  window.addEventListener("popstate", handleRouteChange);
  window.addEventListener("hashchange", handleRouteChange);

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    const id = actionTarget.dataset.id;

    if (action === "navigate") {
      const view = actionTarget.dataset.view;
      const routeId = actionTarget.dataset.routeId || null;
      if (view === "account" && appState.sessionUserId) {
        appState.selectedProfileId = appState.sessionUserId;
      }
      if (view === "home") {
        appState.chatMinimized = true;
      }
      setRoute(view, routeId);
      return;
    }

    if (action === "logout") {
      logout();
      return;
    }

    if (action === "open-profile-editor") {
      appState.profileEditorOpen = true;
      render();
      return;
    }

    if (action === "close-profile-editor") {
      appState.profileEditorOpen = false;
      render();
      return;
    }

    if (action === "open-project-editor") {
      appState.projectEditorProjectId = id;
      const project = findProject(id);
      appState.projectEditorDurationType = project?.durationType || "fixed";
      appState.projectEditorTeamSizeMode = project?.teamSizeMode || "fixed";
      render();
      return;
    }

    if (action === "close-project-editor") {
      appState.projectEditorProjectId = null;
      appState.projectEditorDurationType = "fixed";
      appState.projectEditorTeamSizeMode = "fixed";
      render();
      return;
    }

    if (action === "open-team-modal") {
      appState.projectTeamModalId = id;
      render();
      return;
    }

    if (action === "close-team-modal") {
      appState.projectTeamModalId = null;
      render();
      return;
    }

    if (action === "toggle-create-details") {
      appState.createDetailsOpen = !appState.createDetailsOpen;
      render();
      return;
    }

    if (action === "set-create-duration-type") {
      appState.createDurationType = actionTarget.dataset.durationType || "fixed";
      render();
      return;
    }

    if (action === "set-project-duration-type") {
      appState.projectEditorDurationType = actionTarget.dataset.durationType || "fixed";
      render();
      return;
    }

    if (action === "set-create-team-size-mode") {
      appState.createTeamSizeMode = actionTarget.dataset.teamSizeMode || "fixed";
      render();
      return;
    }

    if (action === "set-project-team-size-mode") {
      appState.projectEditorTeamSizeMode = actionTarget.dataset.teamSizeMode || "fixed";
      render();
      return;
    }

    if (action === "home-carousel-prev") {
      appState.homeCarouselIndex = Math.max(0, appState.homeCarouselIndex - 1);
      render();
      return;
    }

    if (action === "home-carousel-next") {
      const total = Number(actionTarget.dataset.total || 0);
      const visibleCount = Number(actionTarget.dataset.visible || 3);
      const maxIndex = Math.max(total - visibleCount, 0);
      appState.homeCarouselIndex = Math.min(maxIndex, appState.homeCarouselIndex + 1);
      render();
      return;
    }

    if (action === "landing-carousel-prev") {
      appState.landingCarouselIndex = Math.max(0, appState.landingCarouselIndex - 1);
      render();
      return;
    }

    if (action === "landing-carousel-next") {
      const total = Number(actionTarget.dataset.total || 0);
      const visibleCount = Number(actionTarget.dataset.visible || 3);
      const maxIndex = Math.max(total - visibleCount, 0);
      appState.landingCarouselIndex = Math.min(maxIndex, appState.landingCarouselIndex + 1);
      render();
      return;
    }

    if (action === "view-project") {
      setRoute("project", id);
      return;
    }

    if (action === "view-profile") {
      appState.selectedProfileId = id;
      render();
      return;
    }

    if (action === "toggle-filter") {
      appState.projectFilter = actionTarget.dataset.filter;
      render();
      return;
    }

    if (action === "toggle-category-filter") {
      appState.categoryFilter = actionTarget.dataset.category || "all";
      render();
      return;
    }

    if (action === "join-project") {
      openJoinRequestModal(id);
      return;
    }

    if (action === "approve-request") {
      approveJoinRequest(id);
      return;
    }

    if (action === "decline-request") {
      declineJoinRequest(id);
      return;
    }

    if (action === "complete-project") {
      completeProject(id);
      return;
    }

    if (action === "open-chat") {
      appState.activeChatProjectId = id;
      appState.chatMinimized = false;
      appState.shouldScrollChatsToBottom = true;
      render();
      return;
    }

    if (action === "close-chat") {
      appState.activeChatProjectId = null;
      render();
      return;
    }

    if (action === "join-community") {
      joinCommunity(actionTarget.dataset.community);
      return;
    }

    if (action === "community-prompt") {
      const promptType = actionTarget.dataset.promptType || "ask";
      if (promptType === "start-project") {
        setRoute("create");
        return;
      }

      const community = communityConfigFor(actionTarget.dataset.community);
      const promptMessage =
        promptType === "resource"
          ? `Use ${community.title} to share useful finds and help other builders keep going.`
          : `Use ${community.title} to ask quick questions and find your people faster.`;
      setFlash(promptMessage, "success");
      render();
      return;
    }

    if (action === "close-join-modal") {
      appState.joinRequestProjectId = null;
      render();
      return;
    }

    if (action === "toggle-chat-minimize") {
      appState.chatMinimized = !appState.chatMinimized;
      render();
      return;
    }

    if (action === "open-messages") {
      if (id) {
        appState.activeChatProjectId = id;
      }
      appState.shouldScrollChatsToBottom = true;
      setRoute("messages", appState.activeChatProjectId || id || null);
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;

    if (form.matches("#signup-form")) {
      event.preventDefault();
      handleSignup(new FormData(form));
      return;
    }

    if (form.matches("#login-form")) {
      event.preventDefault();
      handleLogin(new FormData(form));
      return;
    }

    if (form.matches("#profile-form")) {
      event.preventDefault();
      saveProfile(new FormData(form));
      return;
    }

    if (form.matches("#project-form")) {
      event.preventDefault();
      createProject(new FormData(form));
      return;
    }

    if (form.matches("#update-form")) {
      event.preventDefault();
      createProjectUpdate(new FormData(form));
      return;
    }

    if (form.matches("#project-settings-form")) {
      event.preventDefault();
      updateProjectDetails(new FormData(form));
      return;
    }

    if (form.matches("#chat-form") || form.matches("#messages-chat-form")) {
      event.preventDefault();
      sendChatMessage(new FormData(form));
      return;
    }

    if (form.matches("#join-request-form")) {
      event.preventDefault();
      createJoinRequest(new FormData(form));
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("#browse-search")) {
      appState.browseQuery = event.target.value.trim().toLowerCase();
      render();
    }
  });

  initializeApp();

  async function initializeApp() {
    try {
      restoreSession();

      if (supabase) {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        appState.sessionUserId = session?.user?.id || null;
        if (session?.user) {
          await ensureRemoteProfile(session.user);
        }

        await refreshRemoteData();
        syncRealtimeSubscriptions();

        supabase.auth.onAuthStateChange((_event, nextSession) => {
          syncSessionFromAuth(nextSession);
        });
      } else {
        ensureSeedData();
        ensureSeedProjects();
        ensureActiveExampleProjects();
        ensureShowcaseProjects();
        ensureMemberPreviewData();
        ensureProjectMetadata();
        ensureCommunityMetadata();
      }
    } catch (error) {
      console.error("Project Looper failed to initialize live data.", error);
      setFlash("We couldn't connect to live data. Showing local MVP content instead.", "error");
      appState.supabaseEnabled = false;
      ensureSeedData();
      ensureSeedProjects();
      ensureActiveExampleProjects();
      ensureShowcaseProjects();
      ensureMemberPreviewData();
      ensureProjectMetadata();
      ensureCommunityMetadata();
    } finally {
      syncDerivedState();
      appState.isLoading = false;
      render();
    }
  }

  async function syncSessionFromAuth(session) {
    try {
      appState.sessionUserId = session?.user?.id || null;
      if (session?.user) {
        await ensureRemoteProfile(session.user);
      }
      await refreshRemoteData();
      syncRealtimeSubscriptions();
    } catch (error) {
      console.error("Project Looper auth sync failed.", error);
      setFlash("We couldn't refresh your live session just yet.", "error");
    } finally {
      syncDerivedState();
      appState.isLoading = false;
      render();
    }
  }

  async function ensureRemoteProfile(authUser) {
    if (!supabase || !authUser?.id) {
      return;
    }

    const fallbackName =
      authUser.user_metadata?.name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "Builder";

    const { error } = await supabase.from("profiles").upsert(
      {
        id: authUser.id,
        email: authUser.email || "",
        name: fallbackName,
      },
      { onConflict: "id" }
    );

    if (error) {
      throw error;
    }
  }

  async function refreshRemoteData() {
    if (!supabase) {
      return;
    }

    const [profilesResult, projectsResult, membersResult, updatesResult, chatsResult, communityMembersResult, communityPostsResult] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("project_members").select("*").order("joined_at", { ascending: true }),
      supabase.from("project_updates").select("*").order("created_at", { ascending: false }),
      supabase.from("project_chat_messages").select("*").order("created_at", { ascending: true }),
      supabase.from("community_members").select("*").order("joined_at", { ascending: true }),
      supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
    ]);

    const firstError =
      profilesResult.error ||
      projectsResult.error ||
      membersResult.error ||
      updatesResult.error ||
      chatsResult.error ||
      communityMembersResult.error ||
      communityPostsResult.error;

    if (firstError) {
      throw firstError;
    }

    const nextDb = {
      ...appState.db,
      users: (profilesResult.data || []).map(mapProfileRow),
      projects: (projectsResult.data || []).map(mapProjectRow),
      projectMembers: (membersResult.data || []).map(mapProjectMemberRow),
      projectUpdates: (updatesResult.data || []).map(mapProjectUpdateRow),
      projectChats: (chatsResult.data || []).map(mapProjectChatRow),
      communityMembers: (communityMembersResult.data || []).map(mapCommunityMemberRow),
      communityPosts: (communityPostsResult.data || []).map(mapCommunityPostRow),
      joinRequests: [],
    };

    hydrateCommunityMemberships(nextDb);
    hydrateCompletedProjects(nextDb);
    appState.db = nextDb;
    appState.isRemoteDataReady = true;
    ensureProjectMetadata();
    ensureCommunityMetadata();
    persistDatabase();

    if (supabase && appState.sessionUserId) {
      syncRealtimeSubscriptions();
    }
  }

  function syncRealtimeSubscriptions() {
    if (!supabase) {
      return;
    }

    if (Array.isArray(appState.realtimeChatChannels) && appState.realtimeChatChannels.length) {
      appState.realtimeChatChannels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      appState.realtimeChatChannels = [];
    }

    if (!appState.sessionUserId) {
      return;
    }

    const joinedProjectIds = [
      ...new Set(
        appState.db.projectMembers
          .filter(
            (member) =>
              member.userId === appState.sessionUserId && member.status === "accepted"
          )
          .map((member) => member.projectId)
          .filter(Boolean)
      ),
    ];

    console.debug("[chat] sync subscriptions", {
      sessionUserId: appState.sessionUserId,
      joinedProjectIds,
      selectedProjectId: appState.activeChatProjectId || appState.route.id || null,
    });

    appState.realtimeChatChannels = joinedProjectIds.map((projectId) =>
      supabase
        .channel(`project-chat-${appState.sessionUserId}-${projectId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "project_chat_messages",
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => handleRealtimeChatInsert(payload, projectId)
        )
        .subscribe((status) => {
          console.debug("[chat] realtime subscription status", {
            projectId,
            status,
          });
        })
    );
  }

  function handleRealtimeChatInsert(payload, subscribedProjectId = null) {
    const nextChat = mapProjectChatRow(payload.new || {});
    console.debug("[chat] realtime payload received", {
      subscribedProjectId,
      payloadProjectId: nextChat.projectId,
      selectedProjectId: appState.activeChatProjectId || appState.route.id || null,
      payload,
    });

    if (!nextChat.projectId || !isProjectMember(nextChat.projectId, appState.sessionUserId)) {
      console.debug("[chat] realtime payload ignored", {
        sessionUserId: appState.sessionUserId,
        payloadProjectId: nextChat.projectId,
        isMember: nextChat.projectId
          ? isProjectMember(nextChat.projectId, appState.sessionUserId)
          : false,
      });
      return;
    }

    const exists = appState.db.projectChats.some((message) => message.id === nextChat.id);
    if (exists) {
      return;
    }

    appState.db.projectChats.push(nextChat);
    appState.shouldScrollChatsToBottom = true;
    render();
  }

  function mapProfileRow(row) {
    return {
      id: row.id,
      email: row.email || "",
      name: row.name || "",
      bio: row.bio || "",
      profilePhoto: row.profile_photo || "",
      skills: Array.isArray(row.skills) ? row.skills : [],
      interests: Array.isArray(row.interests) ? row.interests : [],
      completedProjectIds: [],
      communityMemberships: [],
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  function mapProjectRow(row) {
    const category = categoryConfigFor(row.category || "general");
    return normalizeProjectTeamSize(
      normalizeProjectTimeline(
        normalizeProjectCategory({
          id: row.id,
          ownerId: row.owner_id,
          title: row.title || "",
          description: row.description || "",
          skillsNeeded: Array.isArray(row.skills_needed) ? row.skills_needed : [],
          teamSizeMode: row.team_size_mode || "fixed",
          teamSizeValue: row.team_size_value,
          teamSize: row.team_size_value,
          durationType: row.duration_type || "fixed",
          durationValue: row.duration_value || "",
          duration: row.duration_type === "open" ? "Open-ended" : row.duration_value || "",
          repositoryUrl: row.repository_url || "",
          projectUrl: row.project_url || "",
          coverImage: row.cover_image || "",
          category: category.key,
          categoryLabel: row.category_label || category.label,
          categoryIcon: category.icon,
          status: row.status || "open",
          createdAt: row.created_at || new Date().toISOString(),
          completedAt: row.completed_at || null,
        })
      )
    );
  }

  function mapProjectMemberRow(row) {
    return {
      id: row.id,
      projectId: row.project_id,
      userId: row.user_id,
      role: row.role || "Member",
      status: row.status || "accepted",
      joinedAt: row.joined_at || new Date().toISOString(),
    };
  }

  function mapProjectUpdateRow(row) {
    return {
      id: row.id,
      projectId: row.project_id,
      authorId: row.author_id,
      title: row.title || "",
      content: row.content || "",
      imageUrl: row.image_url || "",
      linkUrl: row.link_url || "",
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  function mapProjectChatRow(row) {
    return {
      id: row.id,
      projectId: row.project_id,
      authorId: row.author_id,
      content: row.content || "",
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  function mapCommunityMemberRow(row) {
    return {
      id: row.id,
      communityKey: row.community_key,
      userId: row.user_id,
      joinedAt: row.joined_at || new Date().toISOString(),
    };
  }

  function mapCommunityPostRow(row) {
    return {
      id: row.id,
      communityKey: row.community_key,
      authorId: row.author_id,
      content: row.content || "",
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  function hydrateCompletedProjects(database) {
    const completedByUser = new Map();
    const completedProjectIds = new Set(
      database.projects
        .filter((project) => project.status === "completed")
        .map((project) => project.id)
    );

    database.projectMembers.forEach((member) => {
      if (member.status !== "accepted" || !completedProjectIds.has(member.projectId)) {
        return;
      }

      if (!completedByUser.has(member.userId)) {
        completedByUser.set(member.userId, []);
      }

      completedByUser.get(member.userId).push(member.projectId);
    });

    database.users.forEach((user) => {
      user.completedProjectIds = completedByUser.get(user.id) || [];
    });
  }

  function hydrateCommunityMemberships(database) {
    const membershipsByUser = new Map();

    (database.communityMembers || []).forEach((membership) => {
      if (!membershipsByUser.has(membership.userId)) {
        membershipsByUser.set(membership.userId, []);
      }

      membershipsByUser.get(membership.userId).push(membership.communityKey);
    });

    database.users.forEach((user) => {
      user.communityMemberships = membershipsByUser.get(user.id) || [];
    });
  }

  function handleRouteChange() {
    appState.route = normalizeRoute(routeFromLocation());
    render();
  }

  function setRoute(view, id, options = {}) {
    const nextRoute = normalizeRoute({ view, id: id || null });
    const nextPath = routeToPath(nextRoute.view, nextRoute.id);

    appState.route = nextRoute;

    if (isFileProtocol()) {
      if (window.location.hash !== nextPath) {
        const hashTarget = `#${nextPath}`;
        if (options.replace) {
          window.location.replace(`${window.location.pathname}${hashTarget}`);
          return;
        }
        window.location.hash = nextPath;
        return;
      }
    } else if (window.location.pathname !== nextPath) {
      const historyMethod = options.replace ? "replaceState" : "pushState";
      window.history[historyMethod]({}, "", nextPath);
    }

    render();
  }

  function restoreSession() {
    const sessionUserId = !supabase
      ? window.localStorage.getItem(`${STORAGE_KEY}-session`)
      : null;
    if (sessionUserId && !supabase) {
      appState.sessionUserId = sessionUserId;
    }
    appState.route = normalizeRoute(routeFromLocation());
    const canonicalPath = routeToPath(appState.route.view, appState.route.id);
    if (isFileProtocol()) {
      const expectedHash = `#${canonicalPath}`;
      if (window.location.hash !== expectedHash) {
        window.location.hash = canonicalPath;
      }
    } else if (window.location.pathname !== canonicalPath) {
      window.history.replaceState({}, "", canonicalPath);
    }
  }

  function routeFromLocation() {
    const routeSource = isFileProtocol()
      ? window.location.hash.replace(/^#/, "") || "/"
      : window.location.pathname;
    const segments = routeSource.split("/").filter(Boolean);
    const [view, id] = segments;

    if (!view) {
      return { view: "landing", id: null };
    }

    if (view === "project" || view === "messages" || view === "community") {
      return { view, id: id || null };
    }

    if (
      ["home", "auth", "create", "browse", "messages", "communities", "account", "about", "feedback", "privacy", "terms"].includes(view)
    ) {
      return { view, id: id || null };
    }

    return { view: currentUser() ? "home" : "landing", id: null };
  }

  function routeToPath(view, id) {
    if (view === "landing") return "/";
    if (view === "project" && id) return `/project/${encodeURIComponent(id)}`;
    if (view === "messages" && id) return `/messages/${encodeURIComponent(id)}`;
    if (view === "community" && id) return `/community/${encodeURIComponent(id)}`;
    return `/${view}`;
  }

  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  function isProtectedRoute(view) {
    return ["home", "create", "messages", "communities", "community", "account"].includes(view);
  }

  function normalizeRoute(route) {
    const user = currentUser() || (appState.sessionUserId ? { id: appState.sessionUserId } : null);
    let nextView = route.view || (user ? "home" : "landing");
    const nextId = route.id || null;

    if (nextView === "dashboard") {
      nextView = user ? "home" : "auth";
    }

    if (!user && isProtectedRoute(nextView)) {
      return { view: "landing", id: null };
    }

    if (user && nextView === "auth") {
      return { view: "home", id: null };
    }

    return { view: nextView, id: nextId };
  }

  function loadDatabase() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const empty = {
      users: [],
      projects: [],
      projectMembers: [],
      joinRequests: [],
      projectUpdates: [],
      projectChats: [],
      communityMembers: [],
      communityPosts: [],
    };

    if (!raw) {
      return empty;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return empty;
    }
  }

  function persistDatabase() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.db));
    if (!supabase && appState.sessionUserId) {
      window.localStorage.setItem(`${STORAGE_KEY}-session`, appState.sessionUserId);
    } else if (!supabase) {
      window.localStorage.removeItem(`${STORAGE_KEY}-session`);
    }
  }

  function ensureSeedData() {
    if (appState.db.users.length > 0) {
      return;
    }

    const users = [
      {
        id: createId("user"),
        name: "Avery Chen",
        email: "avery@example.com",
        password: "demo123",
        bio: "Product-minded developer who loves building portfolio apps and experimental side projects.",
        profilePhoto: "",
        skills: ["React", "UI Design", "Product Strategy"],
        interests: ["Creative tools", "Collaboration", "Music"],
        completedProjectIds: [],
        communityMemberships: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: createId("user"),
        name: "Jordan Rivera",
        email: "jordan@example.com",
        password: "demo123",
        bio: "Frontend engineer and illustrator looking for creative collaborations with clear goals.",
        profilePhoto: "",
        skills: ["JavaScript", "Illustration", "Branding"],
        interests: ["Portfolio projects", "Storytelling", "Design systems"],
        completedProjectIds: [],
        communityMemberships: [],
        createdAt: new Date().toISOString(),
      },
    ];

    const projectOne = {
      id: createId("project"),
      ownerId: users[0].id,
      title: "Indie Artist Press Kit Builder",
      description: "A simple web tool that helps musicians generate a polished press kit with bios, images, and links.",
      skillsNeeded: ["UI Design", "Frontend", "Copywriting"],
      teamSize: 3,
      duration: "4 weeks",
      repositoryUrl: "https://github.com/example/press-kit-builder",
      projectUrl: "https://example.com/press-kit-builder",
      coverImage: "",
      category: "writing",
      categoryLabel: CATEGORY_CONFIG.writing.label,
      categoryIcon: CATEGORY_CONFIG.writing.icon,
      status: "open",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const projectTwo = {
      id: createId("project"),
      ownerId: users[1].id,
      title: "Micro Short Film Collaboration Hub",
      description: "A shared space for assembling a tiny team to produce a one-weekend short film from concept to edit.",
      skillsNeeded: ["Video Editing", "Scriptwriting", "Production"],
      teamSize: 4,
      duration: "6 weeks",
      repositoryUrl: "",
      projectUrl: "https://example.com/short-film-hub",
      coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
      category: "general",
      categoryLabel: CATEGORY_CONFIG.general.label,
      categoryIcon: CATEGORY_CONFIG.general.icon,
      status: "active",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const projectThree = {
      id: createId("project"),
      ownerId: users[1].id,
      title: "Digital Zine Jam for Internet Artists",
      description: "A collaborative digital art zine where illustrators, motion designers, and layout artists create a themed issue around online identity and handmade internet aesthetics.",
      skillsNeeded: ["Digital Illustration", "Motion Design", "Editorial Layout"],
      teamSize: 5,
      duration: "5 weeks",
      repositoryUrl: "https://github.com/example/digital-zine-jam",
      projectUrl: "https://example.com/digital-zine-jam",
      coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
      category: "design",
      categoryLabel: CATEGORY_CONFIG.design.label,
      categoryIcon: CATEGORY_CONFIG.design.icon,
      status: "open",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const memberOwnerOne = {
      id: createId("member"),
      projectId: projectOne.id,
      userId: users[0].id,
      role: "Owner",
      status: "accepted",
      joinedAt: new Date().toISOString(),
    };

    const memberOwnerTwo = {
      id: createId("member"),
      projectId: projectTwo.id,
      userId: users[1].id,
      role: "Owner",
      status: "accepted",
      joinedAt: new Date().toISOString(),
    };

    const memberOwnerThree = {
      id: createId("member"),
      projectId: projectThree.id,
      userId: users[1].id,
      role: "Owner",
      status: "accepted",
      joinedAt: new Date().toISOString(),
    };

    const pendingRequest = {
      id: createId("request"),
      projectId: projectOne.id,
      userId: users[1].id,
      message: "I can help shape the visual direction and polish the interface.",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const initialUpdate = {
      id: createId("update"),
      projectId: projectTwo.id,
      authorId: users[1].id,
      title: "Kickoff and moodboard",
      content: "Collected moodboard references and outlined the shooting plan for next weekend.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      linkUrl: "",
      createdAt: new Date().toISOString(),
    };

    const seededChats = [
      {
        id: createId("chat"),
        projectId: projectTwo.id,
        authorId: users[1].id,
        content: "I dropped the first shot list in the project updates. Anyone want to help with titles?",
        createdAt: new Date().toISOString(),
      },
      {
        id: createId("chat"),
        projectId: projectThree.id,
        authorId: users[1].id,
        content: "Starting with contributors who love web nostalgia and textured digital collage.",
        createdAt: new Date().toISOString(),
      },
    ];

    appState.db = {
      users,
      projects: [projectThree, projectOne, projectTwo],
      projectMembers: [memberOwnerOne, memberOwnerTwo, memberOwnerThree],
      joinRequests: [pendingRequest],
      projectUpdates: [initialUpdate],
      projectChats: seededChats,
    };

    persistDatabase();
  }

  function syncDerivedState() {
    if (!appState.selectedProfileId) {
      appState.selectedProfileId = appState.sessionUserId || appState.db.users[0]?.id || null;
    }
  }

  function ensureSeedProjects() {
    const existing = appState.db.projects.find(
      (project) => project.title === "Digital Zine Jam for Internet Artists"
    );

    if (existing) {
      return;
    }

    const artOwner =
      appState.db.users.find((user) => user.email === "jordan@example.com") || appState.db.users[0];

    if (!artOwner) {
      return;
    }

    const project = {
      id: createId("project"),
      ownerId: artOwner.id,
      title: "Digital Zine Jam for Internet Artists",
      description:
        "A collaborative digital art zine where illustrators, motion designers, and layout artists create a themed issue around online identity and handmade internet aesthetics.",
      skillsNeeded: ["Digital Illustration", "Motion Design", "Editorial Layout"],
      teamSize: 5,
      duration: "5 weeks",
      repositoryUrl: "https://github.com/example/digital-zine-jam",
      projectUrl: "https://example.com/digital-zine-jam",
      coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
      category: "design",
      categoryLabel: CATEGORY_CONFIG.design.label,
      categoryIcon: CATEGORY_CONFIG.design.icon,
      status: "open",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    appState.db.projects.unshift(project);
    appState.db.projectMembers.push({
      id: createId("member"),
      projectId: project.id,
      userId: artOwner.id,
      role: "Owner",
      status: "accepted",
      joinedAt: new Date().toISOString(),
    });

    persistDatabase();
  }

  function ensureShowcaseProjects() {
    const avery =
      appState.db.users.find((user) => user.email === "avery@example.com") || appState.db.users[0];
    const jordan =
      appState.db.users.find((user) => user.email === "jordan@example.com") || appState.db.users[1];

    if (!avery || !jordan) {
      return;
    }

    const samples = [
      {
        title: "Neon Alley Poster Series",
        ownerId: avery.id,
        category: "design",
        description:
          "A finished digital poster collaboration inspired by arcade signage, rainy streets, and synth-era typography.",
        skillsNeeded: ["Digital Illustration", "Art Direction", "Typography"],
        teamSize: 3,
        duration: "3 weeks",
        repositoryUrl: "",
        projectUrl: "https://example.com/neon-alley-poster-series",
        coverImage:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Dreamscape Portfolio Microsite",
        ownerId: jordan.id,
        category: "dev",
        description:
          "A completed portfolio microsite for showcasing digital paintings, looping animations, and process notes.",
        skillsNeeded: ["Web Design", "Motion Design", "Creative Coding"],
        teamSize: 2,
        duration: "4 weeks",
        repositoryUrl: "https://github.com/example/dreamscape-microsite",
        projectUrl: "https://example.com/dreamscape-microsite",
        coverImage:
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      },
    ];

    let changed = false;

    samples.forEach((sample) => {
      let project = appState.db.projects.find((entry) => entry.title === sample.title);

      if (!project) {
        project = {
          id: createId("project"),
          ownerId: sample.ownerId,
          title: sample.title,
          description: sample.description,
          skillsNeeded: sample.skillsNeeded,
          teamSize: sample.teamSize,
          duration: sample.duration,
          repositoryUrl: sample.repositoryUrl,
          projectUrl: sample.projectUrl,
          coverImage: sample.coverImage,
          category: sample.category,
          categoryLabel: categoryConfigFor(sample.category).label,
          categoryIcon: categoryConfigFor(sample.category).icon,
          status: "completed",
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };

        appState.db.projects.unshift(project);
        appState.db.projectMembers.push({
          id: createId("member"),
          projectId: project.id,
          userId: sample.ownerId,
          role: "Owner",
          status: "accepted",
          joinedAt: new Date().toISOString(),
        });
        changed = true;
      } else {
        if (project.status !== "completed") {
          project.status = "completed";
          project.completedAt = project.completedAt || new Date().toISOString();
          changed = true;
        }
        if (!project.coverImage && sample.coverImage) {
          project.coverImage = sample.coverImage;
          changed = true;
        }
        if (project.category !== sample.category) {
          normalizeProjectCategory({ ...project, category: sample.category });
          project.category = sample.category;
          project.categoryLabel = categoryConfigFor(sample.category).label;
          project.categoryIcon = categoryConfigFor(sample.category).icon;
          changed = true;
        }
      }

      const owner = appState.db.users.find((user) => user.id === sample.ownerId);
      if (owner && !owner.completedProjectIds.includes(project.id)) {
        owner.completedProjectIds.push(project.id);
        changed = true;
      }
    });

    if (changed) {
      persistDatabase();
    }
  }

  function ensureActiveExampleProjects() {
    const avery =
      appState.db.users.find((user) => user.email === "avery@example.com") || appState.db.users[0];
    const jordan =
      appState.db.users.find((user) => user.email === "jordan@example.com") || appState.db.users[1];

    if (!avery || !jordan) {
      return;
    }

    const samples = [
      {
        title: "Open Studio Poster Set",
        ownerId: jordan.id,
        category: "design",
        description:
          "A collaborative mini poster series for a fictional gallery night, looking for illustration and layout help.",
        skillsNeeded: ["Illustration", "Art Direction", "Layout Design"],
        teamSize: 3,
        duration: "3 weeks",
        repositoryUrl: "",
        projectUrl: "",
        coverImage: "",
        status: "open",
        teamSizeMode: "fixed",
        teamSizeValue: 3,
        durationType: "fixed",
        durationValue: "3 weeks",
      },
      {
        title: "Pixel Dungeon Build Tracker",
        ownerId: avery.id,
        category: "dev",
        description:
          "A small dev tool for tracking enemy stats, rooms, and item drops for a retro-style game prototype.",
        skillsNeeded: ["JavaScript", "Frontend", "Game UI"],
        teamSize: 3,
        duration: "6 weeks",
        repositoryUrl: "",
        projectUrl: "",
        coverImage: "",
        status: "active",
        teamSizeMode: "fixed",
        teamSizeValue: 3,
        durationType: "fixed",
        durationValue: "6 weeks",
      },
      {
        title: "Creator Stories Editorial Pack",
        ownerId: jordan.id,
        category: "writing",
        description:
          "A short-form writing collaboration to publish a set of creator interviews and polished profile features.",
        skillsNeeded: ["Writing", "Editing", "Interviewing"],
        teamSize: 4,
        duration: "4 weeks",
        repositoryUrl: "",
        projectUrl: "",
        coverImage: "",
        status: "open",
        teamSizeMode: "fixed",
        teamSizeValue: 4,
        durationType: "fixed",
        durationValue: "4 weeks",
      },
      {
        title: "Neighborhood Fix-It Guide",
        ownerId: avery.id,
        category: "general",
        description:
          "A practical community resource that pulls together simple repair guides, checklists, and local tool-sharing info.",
        skillsNeeded: ["Research", "Operations", "Community Outreach"],
        teamSize: null,
        duration: "Open-ended",
        repositoryUrl: "",
        projectUrl: "",
        coverImage: "",
        status: "active",
        teamSizeMode: "unlimited",
        teamSizeValue: null,
        durationType: "open",
        durationValue: null,
      },
    ];

    let changed = false;

    samples.forEach((sample) => {
      let project = appState.db.projects.find((entry) => entry.title === sample.title);

      if (!project) {
        project = {
          id: createId("project"),
          ownerId: sample.ownerId,
          title: sample.title,
          description: sample.description,
          skillsNeeded: sample.skillsNeeded,
          teamSize: sample.teamSize,
          duration: sample.duration,
          repositoryUrl: sample.repositoryUrl,
          projectUrl: sample.projectUrl,
          coverImage: sample.coverImage,
          category: sample.category,
          categoryLabel: categoryConfigFor(sample.category).label,
          categoryIcon: categoryConfigFor(sample.category).icon,
          status: sample.status,
          teamSizeMode: sample.teamSizeMode || "fixed",
          teamSizeValue:
            Object.prototype.hasOwnProperty.call(sample, "teamSizeValue")
              ? sample.teamSizeValue
              : sample.teamSize,
          durationType: sample.durationType || "fixed",
          durationValue:
            Object.prototype.hasOwnProperty.call(sample, "durationValue")
              ? sample.durationValue
              : sample.duration,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };

        appState.db.projects.unshift(project);
        appState.db.projectMembers.push({
          id: createId("member"),
          projectId: project.id,
          userId: sample.ownerId,
          role: "Owner",
          status: "accepted",
          joinedAt: new Date().toISOString(),
        });
        changed = true;
      } else {
        if (!project.coverImage) {
          project.coverImage = "";
        }
        if (project.status === "completed") {
          project.status = sample.status;
          project.completedAt = null;
          changed = true;
        }
        if (project.category !== sample.category) {
          project.category = sample.category;
          project.categoryLabel = categoryConfigFor(sample.category).label;
          project.categoryIcon = categoryConfigFor(sample.category).icon;
          changed = true;
        }
        if ((project.teamSizeMode || "fixed") !== (sample.teamSizeMode || "fixed")) {
          project.teamSizeMode = sample.teamSizeMode || "fixed";
          changed = true;
        }
        const nextTeamSizeValue =
          Object.prototype.hasOwnProperty.call(sample, "teamSizeValue") ? sample.teamSizeValue : sample.teamSize;
        if ((project.teamSizeValue || project.teamSize || null) !== nextTeamSizeValue) {
          project.teamSizeValue = nextTeamSizeValue;
          project.teamSize = nextTeamSizeValue;
          changed = true;
        }
        if ((project.durationType || "fixed") !== (sample.durationType || "fixed")) {
          project.durationType = sample.durationType || "fixed";
          changed = true;
        }
        const nextDurationValue =
          Object.prototype.hasOwnProperty.call(sample, "durationValue") ? sample.durationValue : sample.duration;
        if ((project.durationValue || project.duration || null) !== nextDurationValue) {
          project.durationValue = nextDurationValue;
          project.duration = sample.duration;
          changed = true;
        }
      }
    });

    if (changed) {
      persistDatabase();
    }
  }

  function ensureMemberPreviewData() {
    const demoUsers = [
      {
        email: "mika@example.com",
        name: "Mika Park",
        bio: "Visual designer who likes collaborative poster sets and identity systems.",
        skills: ["Illustration", "Branding", "Layout"],
        interests: ["Design jams", "Community projects"],
      },
      {
        email: "leo@example.com",
        name: "Leo Santos",
        bio: "Frontend dev who enjoys prototypes, playful UI, and quick MVP builds.",
        skills: ["JavaScript", "Frontend", "Creative Coding"],
        interests: ["Games", "Tools", "Open builds"],
      },
      {
        email: "samira@example.com",
        name: "Samira Hale",
        bio: "Writer-editor who likes shaping stories, docs, and collaborative publishing projects.",
        skills: ["Writing", "Editing", "Interviewing"],
        interests: ["Publishing", "Creative communities"],
      },
    ];

    let changed = false;

    demoUsers.forEach((demoUser) => {
      const existingUser = appState.db.users.find((user) => user.email === demoUser.email);
      if (existingUser) {
        return;
      }

      appState.db.users.push({
        id: createId("user"),
        name: demoUser.name,
        email: demoUser.email,
        password: "demo123",
        bio: demoUser.bio,
        profilePhoto: "",
        skills: demoUser.skills,
        interests: demoUser.interests,
        completedProjectIds: [],
        communityMemberships: [],
        createdAt: new Date().toISOString(),
      });
      changed = true;
    });

    const membershipPlan = [
      { projectTitle: "Open Studio Poster Set", userEmail: "mika@example.com", role: "Illustrator" },
      { projectTitle: "Open Studio Poster Set", userEmail: "samira@example.com", role: "Copy helper" },
      { projectTitle: "Pixel Dungeon Build Tracker", userEmail: "leo@example.com", role: "Frontend" },
      { projectTitle: "Pixel Dungeon Build Tracker", userEmail: "mika@example.com", role: "UI support" },
      { projectTitle: "Creator Stories Editorial Pack", userEmail: "samira@example.com", role: "Editor" },
      { projectTitle: "Creator Stories Editorial Pack", userEmail: "leo@example.com", role: "Research support" },
      { projectTitle: "Neighborhood Fix-It Guide", userEmail: "mika@example.com", role: "Design support" },
      { projectTitle: "Neighborhood Fix-It Guide", userEmail: "leo@example.com", role: "Tooling" },
      { projectTitle: "Neighborhood Fix-It Guide", userEmail: "samira@example.com", role: "Content support" },
    ];

    membershipPlan.forEach((entry) => {
      const project = appState.db.projects.find((item) => item.title === entry.projectTitle);
      const user = appState.db.users.find((item) => item.email === entry.userEmail);

      if (!project || !user) {
        return;
      }

      const existingMember = appState.db.projectMembers.find(
        (member) => member.projectId === project.id && member.userId === user.id && member.status === "accepted"
      );

      if (existingMember) {
        return;
      }

      appState.db.projectMembers.push({
        id: createId("member"),
        projectId: project.id,
        userId: user.id,
        role: entry.role,
        status: "accepted",
        joinedAt: new Date().toISOString(),
      });
      changed = true;
    });

    if (changed) {
      persistDatabase();
    }
  }

  function ensureProjectMetadata() {
    let changed = false;

    if (!Array.isArray(appState.db.projectChats)) {
      appState.db.projectChats = [];
      changed = true;
    }

    if (!Array.isArray(appState.db.communityMembers)) {
      appState.db.communityMembers = [];
      changed = true;
    }

    if (!Array.isArray(appState.db.communityPosts)) {
      appState.db.communityPosts = [];
      changed = true;
    }

    appState.db.projects.forEach((project) => {
      if (!Object.prototype.hasOwnProperty.call(project, "repositoryUrl")) {
        project.repositoryUrl = "";
        changed = true;
      }

      if (!Object.prototype.hasOwnProperty.call(project, "projectUrl")) {
        project.projectUrl = "";
        changed = true;
      }

      if (!Object.prototype.hasOwnProperty.call(project, "coverImage")) {
        project.coverImage = "";
        changed = true;
      }

      const before = `${project.category || ""}|${project.categoryLabel || ""}|${project.categoryIcon || ""}`;
      normalizeProjectCategory(project);
      const after = `${project.category}|${project.categoryLabel}|${project.categoryIcon}`;
      if (before !== after) {
        changed = true;
      }

      const timelineBefore = `${project.durationType || ""}|${project.durationValue || ""}|${project.duration || ""}`;
      normalizeProjectTimeline(project);
      const timelineAfter = `${project.durationType}|${project.durationValue || ""}|${project.duration || ""}`;
      if (timelineBefore !== timelineAfter) {
        changed = true;
      }

      const teamSizeBefore = `${project.teamSizeMode || ""}|${project.teamSizeValue || ""}|${project.teamSize || ""}`;
      normalizeProjectTeamSize(project);
      const teamSizeAfter = `${project.teamSizeMode}|${project.teamSizeValue || ""}|${project.teamSize || ""}`;
      if (teamSizeBefore !== teamSizeAfter) {
        changed = true;
      }
    });

    appState.db.users.forEach((user) => {
      if (!Object.prototype.hasOwnProperty.call(user, "profilePhoto")) {
        user.profilePhoto = "";
        changed = true;
      }
    });

    appState.db.projectUpdates.forEach((update) => {
      if (!Object.prototype.hasOwnProperty.call(update, "title")) {
        update.title = "";
        changed = true;
      }

      if (!Object.prototype.hasOwnProperty.call(update, "imageUrl")) {
        update.imageUrl = "";
        changed = true;
      }

      if (!Object.prototype.hasOwnProperty.call(update, "linkUrl")) {
        update.linkUrl = "";
        changed = true;
      }
    });

    appState.db.communityPosts.forEach((post) => {
      if (!Object.prototype.hasOwnProperty.call(post, "authorId")) {
        post.authorId = "";
        changed = true;
      }
    });

    if (changed) {
      persistDatabase();
    }
  }

  function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
  }

  function ensureCommunityMetadata() {
    let changed = false;

    appState.db.users.forEach((user) => {
      if (!Array.isArray(user.communityMemberships)) {
        user.communityMemberships = [];
        changed = true;
      }
    });

    if (changed) {
      persistDatabase();
    }
  }

  function currentUser() {
    return appState.db.users.find((user) => user.id === appState.sessionUserId) || null;
  }

  function communityConfigFor(key) {
    return COMMUNITY_CONFIG[key] || COMMUNITY_CONFIG.general;
  }

  function isCommunityJoined(key, user = currentUser()) {
    return Boolean(user && Array.isArray(user.communityMemberships) && user.communityMemberships.includes(key));
  }

  function activeBuilderCountForCommunity(key) {
    if (supabase && appState.isRemoteDataReady) {
      return appState.db.communityMembers.filter((membership) => membership.communityKey === key).length;
    }
    const community = communityConfigFor(key);
    return community.activeBuilders + (isCommunityJoined(key) ? 1 : 0);
  }

  async function joinCommunity(key) {
    const user = currentUser();
    const community = communityConfigFor(key);
    if (!user) return;

    if (!Array.isArray(user.communityMemberships)) {
      user.communityMemberships = [];
    }

    try {
      if (!user.communityMemberships.includes(community.key)) {
        if (supabase) {
          const { error } = await supabase.from("community_members").insert({
            community_key: community.key,
            user_id: user.id,
          });

          if (error) {
            throw error;
          }

          await refreshRemoteData();
        } else {
          user.communityMemberships.push(community.key);
          appState.db.communityMembers.push({
            id: createId("community-member"),
            communityKey: community.key,
            userId: user.id,
            joinedAt: new Date().toISOString(),
          });
          persistDatabase();
        }

        setFlash(`You joined the ${community.title} community.`, "success");
      } else {
        setFlash(`You're already in the ${community.title} community.`, "success");
      }
    } catch (error) {
      setFlash(error.message || `We couldn't join the ${community.title} community right now.`, "error");
    }

    render();
  }

  async function handleSignup(formData) {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!name || !email || !password) {
      setFlash("Please fill out your name, email, and password.", "error");
      render();
      return;
    }

    try {
      if (!supabase) {
        const existingUser = appState.db.users.find((user) => user.email === email);
        if (existingUser) {
          setFlash("An account with that email already exists. Try logging in instead.", "error");
          render();
          return;
        }

        const user = {
          id: createId("user"),
          name,
          email,
          password,
          bio: "",
          skills: [],
          interests: [],
          completedProjectIds: [],
          communityMemberships: [],
          createdAt: new Date().toISOString(),
        };

        appState.db.users.unshift(user);
        appState.sessionUserId = user.id;
        appState.selectedProfileId = user.id;
        appState.authFlow = "signup";
        persistDatabase();
        setFlash("Your account is ready. Add a quick profile so other builders know what you're into.", "success");
        setRoute("home");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await ensureRemoteProfile({
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            name,
          },
        });
      }

      appState.authFlow = "signup";
      appState.sessionUserId = data.session?.user?.id || null;
      await refreshRemoteData();

      if (data.session?.user?.id) {
        appState.selectedProfileId = data.session.user.id;
        setFlash("Your account is ready. Add a quick profile so other builders know what you're into.", "success");
        setRoute("home");
      } else {
        setFlash("Account created. Check your email to confirm your sign-in if required.", "success");
        render();
      }
    } catch (error) {
      setFlash(error.message || "We couldn't create your account right now.", "error");
      render();
    }
  }

  async function handleLogin(formData) {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    try {
      if (!supabase) {
        const user = appState.db.users.find((entry) => entry.email === email && entry.password === password);

        if (!user) {
          setFlash("We couldn't match that email and password.", "error");
          render();
          return;
        }

        appState.sessionUserId = user.id;
        appState.selectedProfileId = user.id;
        appState.authFlow = "login";
        persistDatabase();
        setFlash(`Welcome back, ${user.name.split(" ")[0]}.`, "success");
        setRoute("home");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      appState.authFlow = "login";
      appState.sessionUserId = data.user.id;
      appState.selectedProfileId = data.user.id;
      await refreshRemoteData();
      const user = currentUser();
      setFlash(`Welcome back, ${(user?.name || "builder").split(" ")[0]}.`, "success");
      setRoute("home");
    } catch (error) {
      setFlash(error.message || "We couldn't match that email and password.", "error");
      render();
    }
  }

  async function logout() {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      }
      appState.sessionUserId = null;
      appState.authFlow = null;
      syncRealtimeSubscriptions();
      persistDatabase();
      setFlash("You've been logged out.", "success");
      setRoute("landing", null, { replace: true });
    } catch (error) {
      setFlash(error.message || "We couldn't log you out right now.", "error");
      render();
    }
  }

  async function saveProfile(formData) {
    const user = currentUser();
    if (!user) return;

    try {
      const nextProfilePhoto = await resolveImageInput(formData.get("profilePhotoFile"), formData.get("profilePhotoUrl"));
      const payload = {
        name: String(formData.get("name") || "").trim(),
        bio: String(formData.get("bio") || "").trim(),
        profile_photo: nextProfilePhoto || user.profilePhoto || "",
        skills: commaList(formData.get("skills")),
        interests: commaList(formData.get("interests")),
      };

      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        await refreshRemoteData();
      } else {
        user.name = payload.name;
        user.bio = payload.bio;
        user.profilePhoto = payload.profile_photo;
        user.skills = payload.skills;
        user.interests = payload.interests;
        persistDatabase();
      }

      appState.profileEditorOpen = false;
      setFlash("Profile updated.", "success");
      render();
    } catch (error) {
      setFlash(error.message || "We couldn't process that profile image.", "error");
      render();
    }
  }

  async function createProject(formData) {
    const user = currentUser();
    if (!user) return;

    try {
      const title = String(formData.get("title") || "").trim();
      const categoryKey = String(formData.get("category") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const durationType = String(formData.get("durationType") || "fixed").trim();
      const teamSizeMode = String(formData.get("teamSizeMode") || "fixed").trim();
      const teamSize = Number(formData.get("teamSize") || 0);
      const durationValue = String(formData.get("duration") || "").trim();
      const skillsNeeded = commaList(formData.get("skillsNeeded"));
      const repositoryUrl = String(formData.get("repositoryUrl") || "").trim();
      const projectUrl = String(formData.get("projectUrl") || "").trim();
      const coverImage = await resolveImageInput(formData.get("coverImageFile"), formData.get("coverImageUrl"));

      if (!title || !categoryKey || !description || (teamSizeMode !== "unlimited" && !teamSize) || (durationType !== "open" && !durationValue)) {
        setFlash("Please complete the project basics before publishing.", "error");
        render();
        return;
      }

      const category = categoryConfigFor(categoryKey);

      const project = {
        id: createId("project"),
        ownerId: user.id,
        title,
        category: category.key,
        categoryLabel: category.label,
        categoryIcon: category.icon,
        description,
        skillsNeeded,
        teamSizeMode: teamSizeMode === "unlimited" ? "unlimited" : "fixed",
        teamSizeValue: teamSizeMode === "unlimited" ? null : teamSize,
        teamSize: teamSizeMode === "unlimited" ? null : teamSize,
        durationType: durationType === "open" ? "open" : "fixed",
        durationValue: durationType === "open" ? null : durationValue,
        duration: durationType === "open" ? "Open-ended" : durationValue,
        repositoryUrl,
        projectUrl,
        coverImage,
        status: "open",
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      if (supabase) {
        const payload = {
          owner_id: user.id,
          title: project.title,
          description: project.description,
          skills_needed: project.skillsNeeded,
          team_size_mode: project.teamSizeMode,
          team_size_value: project.teamSizeValue,
          duration_type: project.durationType,
          duration_value: project.durationValue,
          repository_url: project.repositoryUrl,
          project_url: project.projectUrl,
          cover_image: project.coverImage,
          category: project.category,
          category_label: project.categoryLabel,
          category_icon: project.category,
          status: project.status,
        };

        const { data: insertedProject, error: projectError } = await supabase
          .from("projects")
          .insert(payload)
          .select("*")
          .single();

        if (projectError) {
          throw projectError;
        }

        const { error: memberError } = await supabase.from("project_members").insert({
          project_id: insertedProject.id,
          user_id: user.id,
          role: "Owner",
          status: "accepted",
        });

        if (memberError) {
          throw memberError;
        }

        await refreshRemoteData();
        project.id = insertedProject.id;
      } else {
        appState.db.projects.unshift(project);
        normalizeProjectTimeline(project);
        normalizeProjectTeamSize(project);
        appState.db.projectMembers.push({
          id: createId("member"),
          projectId: project.id,
          userId: user.id,
          role: "Owner",
          status: "accepted",
          joinedAt: new Date().toISOString(),
        });

        persistDatabase();
      }

      appState.createDurationType = "fixed";
      appState.createTeamSizeMode = "fixed";
      setFlash("Project created. You can now share the page, welcome new members, and post updates.", "success");
      setRoute("project", project.id);
    } catch (error) {
      setFlash(error.message || "We couldn't process that project image.", "error");
      render();
    }
  }

  function openJoinRequestModal(projectId) {
    if (!currentUser()) {
      setRoute("auth");
      return;
    }
    appState.joinRequestProjectId = projectId;
    render();
  }

  async function createJoinRequest(formData) {
    const user = currentUser();
    const projectId = String(formData.get("projectId") || "");
    if (!user) {
      setFlash("Create an account or log in before joining a group.", "error");
      render();
      return;
    }

    const project = findProject(projectId);
    if (!project) return;

    if (project.ownerId === user.id) {
      setFlash("You already lead this group.", "error");
      render();
      return;
    }

    if (isProjectMember(projectId, user.id)) {
      setFlash("You're already in this group.", "error");
      render();
      return;
    }

    try {
      if (supabase) {
        const { error } = await supabase.from("project_members").insert({
          project_id: projectId,
          user_id: user.id,
          role: "Member",
          status: "accepted",
        });

        if (error) {
          throw error;
        }

        if (project.status === "open") {
          const { error: projectError } = await supabase
            .from("projects")
            .update({ status: "active" })
            .eq("id", projectId)
            .eq("status", "open");

          if (projectError) {
            throw projectError;
          }
        }

        await refreshRemoteData();
      } else {
        appState.db.projectMembers.push({
          id: createId("member"),
          projectId,
          userId: user.id,
          role: "Member",
          status: "accepted",
          joinedAt: new Date().toISOString(),
        });

        if (project.status === "open") {
          project.status = "active";
        }

        persistDatabase();
      }

      appState.joinRequestProjectId = null;
      setFlash("You joined the group.", "success");
      render();
    } catch (error) {
      setFlash(error.message || "We couldn't join the group right now.", "error");
      render();
    }
  }

  function approveJoinRequest(requestId) {
    const user = currentUser();
    const request = appState.db.joinRequests.find((entry) => entry.id === requestId);
    if (!user || !request) return;

    const project = findProject(request.projectId);
    if (!project || project.ownerId !== user.id) return;
    normalizeProjectTeamSize(project);

    const acceptedCount = projectMemberCount(project.id);
    if (project.teamSizeMode !== "unlimited" && acceptedCount >= (project.teamSizeValue || project.teamSize)) {
      setFlash("This project already has a full team.", "error");
      render();
      return;
    }

    request.status = "accepted";
    appState.db.projectMembers.push({
      id: createId("member"),
      projectId: project.id,
      userId: request.userId,
      role: "Member",
      status: "accepted",
      joinedAt: new Date().toISOString(),
    });

    if (project.status === "open") {
      project.status = "active";
    }

    persistDatabase();
    setFlash("Team member approved.", "success");
    render();
  }

  function declineJoinRequest(requestId) {
    const user = currentUser();
    const request = appState.db.joinRequests.find((entry) => entry.id === requestId);
    if (!user || !request) return;

    const project = findProject(request.projectId);
    if (!project || project.ownerId !== user.id) return;

    request.status = "declined";
    persistDatabase();
    setFlash("Join request declined.", "success");
    render();
  }

  async function createProjectUpdate(formData) {
    const user = currentUser();
    const projectId = String(formData.get("projectId") || "");
    try {
      const title = String(formData.get("title") || "").trim();
      const content = String(formData.get("content") || "").trim();
      const imageUrl = await resolveImageInput(formData.get("imageFile"), formData.get("imageUrl"));
      const linkUrl = String(formData.get("linkUrl") || "").trim();

      if (!user || !content) {
        setFlash("Add a short update before posting.", "error");
        render();
        return;
      }

      if (!isProjectMember(projectId, user.id)) {
        setFlash("Only team members can post project updates.", "error");
        render();
        return;
      }

      if (supabase) {
        const { error } = await supabase.from("project_updates").insert({
          project_id: projectId,
          author_id: user.id,
          title,
          content,
          image_url: imageUrl,
          link_url: linkUrl,
        });

        if (error) {
          throw error;
        }

        await refreshRemoteData();
      } else {
        appState.db.projectUpdates.unshift({
          id: createId("update"),
          projectId,
          authorId: user.id,
          title,
          content,
          imageUrl,
          linkUrl,
          createdAt: new Date().toISOString(),
        });

        persistDatabase();
      }

      setFlash("Project update posted.", "success");
      render();
    } catch (error) {
      setFlash(error.message || "We couldn't process that update image.", "error");
      render();
    }
  }

  async function updateProjectDetails(formData) {
    const user = currentUser();
    const projectId = String(formData.get("projectId") || "");
    const project = findProject(projectId);

    if (!user || !project || project.ownerId !== user.id) {
      return;
    }

    try {
      const nextCoverImage = await resolveImageInput(formData.get("coverImageFile"), formData.get("coverImageUrl"));
      const category = categoryConfigFor(String(formData.get("category") || project.category).trim() || project.category);
      const durationType = String(formData.get("durationType") || project.durationType || "fixed").trim();
      const durationValue = String(formData.get("duration") || project.durationValue || "").trim();
      const teamSizeMode = String(formData.get("teamSizeMode") || project.teamSizeMode || "fixed").trim();
      const teamSizeValue = Number(formData.get("teamSize") || project.teamSizeValue || project.teamSize || 0);

      project.title = String(formData.get("title") || "").trim();
      project.description = String(formData.get("description") || "").trim();
      project.teamSize = Number(formData.get("teamSize") || project.teamSize);
      project.skillsNeeded = commaList(formData.get("skillsNeeded"));
      project.category = category.key;
      project.categoryLabel = category.label;
      project.categoryIcon = category.icon;
      project.teamSizeMode = teamSizeMode === "unlimited" ? "unlimited" : "fixed";
      project.teamSizeValue = project.teamSizeMode === "unlimited" ? null : teamSizeValue;
      project.teamSize = project.teamSizeMode === "unlimited" ? null : teamSizeValue;
      project.durationType = durationType === "open" ? "open" : "fixed";
      project.durationValue = project.durationType === "open" ? null : durationValue;
      project.duration = project.durationType === "open" ? "Open-ended" : durationValue;
      project.repositoryUrl = String(formData.get("repositoryUrl") || "").trim();
      project.projectUrl = String(formData.get("projectUrl") || "").trim();
      project.coverImage = nextCoverImage || project.coverImage;

      if (!project.title || !project.description || (project.durationType !== "open" && !project.durationValue) || (project.teamSizeMode !== "unlimited" && !project.teamSizeValue) || !project.category) {
        setFlash("Project settings need a title, category, description, timeline, and team size.", "error");
        render();
        return;
      }

      if (supabase) {
        const { error } = await supabase
          .from("projects")
          .update({
            title: project.title,
            description: project.description,
            skills_needed: project.skillsNeeded,
            category: project.category,
            category_label: project.categoryLabel,
            category_icon: project.category,
            team_size_mode: project.teamSizeMode,
            team_size_value: project.teamSizeValue,
            duration_type: project.durationType,
            duration_value: project.durationValue,
            repository_url: project.repositoryUrl,
            project_url: project.projectUrl,
            cover_image: project.coverImage,
          })
          .eq("id", project.id);

        if (error) {
          throw error;
        }

        await refreshRemoteData();
      } else {
        persistDatabase();
      }

      appState.projectEditorProjectId = null;
      setFlash("Project profile updated.", "success");
      render();
    } catch (error) {
      setFlash(error.message || "We couldn't process that project cover image.", "error");
      render();
    }
  }

  async function completeProject(projectId) {
    const user = currentUser();
    const project = findProject(projectId);
    if (!user || !project || project.ownerId !== user.id) return;

    const isCompleted = project.status === "completed";
    try {
      if (supabase) {
        const { error } = await supabase
          .from("projects")
          .update({
            status: isCompleted ? "open" : "completed",
            completed_at: isCompleted ? null : new Date().toISOString(),
          })
          .eq("id", projectId);

        if (error) {
          throw error;
        }

        await refreshRemoteData();
      } else {
        project.status = isCompleted ? "open" : "completed";
        project.completedAt = isCompleted ? null : new Date().toISOString();

        const members = appState.db.projectMembers.filter(
          (member) => member.projectId === projectId && member.status === "accepted"
        );

        if (!isCompleted) {
          members.forEach((member) => {
            const memberUser = appState.db.users.find((entry) => entry.id === member.userId);
            if (!memberUser) return;
            if (!memberUser.completedProjectIds.includes(projectId)) {
              memberUser.completedProjectIds.push(projectId);
            }
          });
        }

        persistDatabase();
      }

      setFlash(
        isCompleted
          ? "Project reopened."
          : "Project marked as completed and added to team portfolios.",
        "success"
      );
      render();
    } catch (error) {
      setFlash(error.message || "We couldn't update the project status right now.", "error");
      render();
    }
  }

  function setFlash(message, type) {
    appState.flash = { message, type };
  }

  function clearFlash() {
    appState.flash = null;
  }

  function commaList(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function inferCategoryKey(project) {
    const haystack = [project.title, project.description, (project.skillsNeeded || []).join(" ")]
      .join(" ")
      .toLowerCase();

    if (/(fix-it|fix it|repair|community|operations|outreach|resource|checklist|guide)/.test(haystack)) {
      return "general";
    }

    if (/(dev|code|coding|web|app|frontend|backend|react|javascript|game|pixel|terminal|software|tracker)/.test(haystack)) {
      return "dev";
    }

    if (/(design|art|illustrat|brand|motion|visual|ui|ux|zine|palette|brush)/.test(haystack)) {
      return "design";
    }

    if (/(write|writing|story|script|copy|editorial|poem|essay|novel|content|interview)/.test(haystack)) {
      return "writing";
    }

    return "general";
  }

  function categoryConfigFor(projectOrKey) {
    const key =
      typeof projectOrKey === "string"
        ? projectOrKey
        : projectOrKey?.category || inferCategoryKey(projectOrKey || {});

    return CATEGORY_CONFIG[key] || CATEGORY_CONFIG.general;
  }

  function normalizeProjectCategory(project) {
    const category = categoryConfigFor(project);
    project.category = category.key;
    project.categoryLabel = category.label;
    project.categoryIcon = category.icon;
    return project;
  }

  function normalizeProjectTimeline(project) {
    const rawType = String(project.durationType || "").trim().toLowerCase();
    const durationType = rawType === "open" ? "open" : "fixed";
    const durationValue =
      durationType === "open"
        ? null
        : String(project.durationValue || project.duration || "").trim();

    project.durationType = durationType;
    project.durationValue = durationValue || null;
    project.duration = durationType === "open" ? "Open-ended" : durationValue || "";
    return project;
  }

  function normalizeProjectTeamSize(project) {
    const rawMode = String(project.teamSizeMode || "").trim().toLowerCase();
    const teamSizeMode = rawMode === "unlimited" ? "unlimited" : "fixed";
    const parsedTeamSize = Number(project.teamSizeValue || project.teamSize || 0);

    project.teamSizeMode = teamSizeMode;
    project.teamSizeValue = teamSizeMode === "unlimited" ? null : parsedTeamSize || null;
    project.teamSize = teamSizeMode === "unlimited" ? null : parsedTeamSize || null;
    return project;
  }

  function durationChipLabel(project) {
    return project.durationType === "open" ? "\u221E Open-ended" : project.durationValue || project.duration || "";
  }

  function durationMetaLabel(project) {
    return project.durationType === "open" ? "Open-ended" : project.durationValue || project.duration || "";
  }

  function teamSizeMetaLabel(project) {
    return project.teamSizeMode === "unlimited"
      ? "Unlimited members"
      : `${project.teamSizeValue || project.teamSize || 0} collaborator${(project.teamSizeValue || project.teamSize || 0) === 1 ? "" : "s"}`;
  }

  async function resolveImageInput(fileValue, urlValue) {
    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    if (file) {
      return readFileAsDataUrl(file);
    }

    return String(urlValue || "").trim();
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read the selected image."));
      reader.readAsDataURL(file);
    });
  }

  function findProject(projectId) {
    return appState.db.projects.find((project) => project.id === projectId) || null;
  }

  function projectMemberCount(projectId) {
    return appState.db.projectMembers.filter(
      (member) => member.projectId === projectId && member.status === "accepted"
    ).length;
  }

  function memberPreviewMarkup(project) {
    const members = membersForProject(project.id);
    const visibleMembers = members.slice(0, 3);
    const overflowMembers = Math.max(members.length - visibleMembers.length, 0);

    return `
      <div class="card-member-preview">
        <div class="card-member-avatars" aria-hidden="true">
          ${visibleMembers
            .map(
              (member) => `
                <span class="card-member-avatar ${member.user?.profilePhoto ? "has-image" : ""}">
                  ${
                    member.user?.profilePhoto
                      ? `<img src="${escapeHtml(member.user.profilePhoto)}" alt="${escapeHtml(member.user.name)}" />`
                      : `<span>${escapeHtml(initialsForName(member.user?.name || "Member"))}</span>`
                  }
                </span>
              `
            )
            .join("")}
          ${overflowMembers ? `<span class="card-member-avatar overflow">+${overflowMembers}</span>` : ""}
        </div>
        <span class="card-member-copy">${members.length ? `${members.length} joined recently` : "Be the first to join"}</span>
      </div>
    `;
  }

  function isProjectMember(projectId, userId) {
    return appState.db.projectMembers.some(
      (member) => member.projectId === projectId && member.userId === userId && member.status === "accepted"
    );
  }

  function ownerForProject(project) {
    return appState.db.users.find((user) => user.id === project.ownerId) || null;
  }

  function requestsForProject(projectId) {
    return appState.db.joinRequests.filter(
      (request) => request.projectId === projectId && request.status === "pending"
    );
  }

  function updatesForProject(projectId) {
    return appState.db.projectUpdates
      .filter((update) => update.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  function galleryImagesForProject(project) {
    const images = [];

    if (project.coverImage) {
      images.push({
        src: project.coverImage,
        label: `${project.title} cover`,
        meta: "Project cover",
      });
    }

    updatesForProject(project.id).forEach((update) => {
      if (!update.imageUrl) return;
      images.push({
        src: update.imageUrl,
        label: update.title || project.title,
        meta: update.title || formatDate(update.createdAt),
      });
    });

    return images;
  }

  function membersForProject(projectId) {
    return appState.db.projectMembers
      .filter((member) => member.projectId === projectId && member.status === "accepted")
      .map((member) => ({
        ...member,
        user: appState.db.users.find((user) => user.id === member.userId),
      }));
  }

  function projectsForUser(userId) {
    return appState.db.projects.filter((project) => project.ownerId === userId);
  }

  function portfolioForUser(user) {
    return appState.db.projects.filter((project) => user.completedProjectIds.includes(project.id));
  }

  function projectsJoinedByUser(userId) {
    const memberships = appState.db.projectMembers.filter(
      (member) => member.userId === userId && member.status === "accepted"
    );
    const ids = new Set(memberships.map((member) => member.projectId));
    return appState.db.projects.filter((project) => ids.has(project.id));
  }

  function chatsForProject(projectId) {
    return appState.db.projectChats
      .filter((message) => message.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async function sendChatMessage(formData) {
    const user = currentUser();
    const projectId = String(formData.get("projectId") || "");
    const content = String(formData.get("content") || "").trim();

    console.debug("[chat] send message attempt", {
      sessionUserId: user?.id || null,
      selectedProjectId: appState.activeChatProjectId || appState.route.id || null,
      insertedMessageProjectId: projectId,
    });

    if (!user || !projectId || !content) {
      setFlash("Write a message before sending.", "error");
      render();
      return;
    }

    if (!isProjectMember(projectId, user.id)) {
      setFlash("Only project members can chat here.", "error");
      render();
      return;
    }

    try {
      if (supabase) {
        const { error } = await supabase.from("project_chat_messages").insert({
          project_id: projectId,
          author_id: user.id,
          content,
        });

        if (error) {
          throw error;
        }

        await refreshRemoteData();
      } else {
        appState.db.projectChats.push({
          id: createId("chat"),
          projectId,
          authorId: user.id,
          content,
          createdAt: new Date().toISOString(),
        });

        persistDatabase();
      }

      appState.activeChatProjectId = projectId;
      appState.shouldScrollChatsToBottom = true;
      console.debug("[chat] message persisted", {
        sessionUserId: user.id,
        insertedMessageProjectId: projectId,
      });
      render();
    } catch (error) {
      setFlash(error.message || "We couldn't send that message right now.", "error");
      render();
    }
  }

  function projectChatsForUser(userId) {
    return projectsJoinedByUser(userId)
      .map((project) => ({
        project,
        messages: chatsForProject(project.id),
      }))
      .sort((a, b) => {
        const aTime = a.messages[a.messages.length - 1]?.createdAt || a.project.createdAt;
        const bTime = b.messages[b.messages.length - 1]?.createdAt || b.project.createdAt;
        return new Date(bTime) - new Date(aTime);
      });
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function projectCard(project) {
    normalizeProjectCategory(project);
    normalizeProjectTimeline(project);
    normalizeProjectTeamSize(project);
    const owner = ownerForProject(project);
    const current = currentUser();
    const canJoin =
      current &&
      project.status !== "completed" &&
      project.ownerId !== current.id &&
      !isProjectMember(project.id, current.id);
    const category = categoryConfigFor(project);

    return `
      <article class="card project-click-card" data-action="view-project" data-id="${project.id}">
        <div class="project-top">
          <div>
            <h3><span class="category-inline-icon" aria-hidden="true">${category.icon}</span>${escapeHtml(project.title)}</h3>
            <p class="small">Project lead: ${escapeHtml(owner?.name || "Unknown creator")}</p>
          </div>
          <span class="status ${escapeHtml(project.status)}">${escapeHtml(project.status)}</span>
        </div>
        <p>${escapeHtml(project.description)}</p>
        <div class="meta-row">
          ${renderCapacityBadge(project)}
          ${renderCategoryBadge(project)}
          <span class="chip">${escapeHtml(durationChipLabel(project))}</span>
        </div>
        <div class="chips">
          ${project.skillsNeeded.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("") || `<span class="chip">Generalist friendly</span>`}
        </div>
        <div class="project-actions card-footer-actions">
          <div class="card-footer-left">
            ${memberPreviewMarkup(project)}
          </div>
          ${canJoin ? `<button class="primary-btn" data-action="join-project" data-id="${project.id}">Join group</button>` : ""}
        </div>
      </article>
    `;
  }

  function collaborationLabel(project) {
    return project.skillsNeeded.join(", ") || "General collaborators";
  }

  function latestActivityTimestamp(project) {
    const projectActivity = [
      project.createdAt,
      ...updatesForProject(project.id).map((update) => update.createdAt),
      ...chatsForProject(project.id).map((chat) => chat.createdAt),
    ]
      .filter(Boolean)
      .map((value) => new Date(value).getTime());

    return projectActivity.length ? Math.max(...projectActivity) : Date.now();
  }

  function activitySignalForProject(project) {
    if (project.status === "completed") {
      return "Completed project";
    }

    const daysSinceActivity = (Date.now() - latestActivityTimestamp(project)) / (1000 * 60 * 60 * 24);

    if (daysSinceActivity <= 7) {
      return "New this week";
    }

    if (daysSinceActivity <= 21) {
      return "Updated recently";
    }

    return "Active project";
  }

  function projectTypeFor(project) {
    return categoryConfigFor(project).key;
  }

  function renderProjectTypeVisual(project) {
    const category = categoryConfigFor(project);
    return `<span class="project-type-emoji" aria-label="${escapeHtml(category.label)} icon" role="img">${category.icon}</span>`;
  }

  function renderCategoryBadge(project) {
    const category = categoryConfigFor(project);
    return `<span class="chip category-chip" title="${escapeHtml(category.label)}"><span aria-hidden="true">${category.icon}</span><span>${escapeHtml(category.shortLabel)}</span></span>`;
  }

  function renderCapacityBadge(project) {
    const acceptedCount = projectMemberCount(project.id);
    if (project.teamSizeMode === "unlimited") {
      return `<span class="chip capacity-chip" title="Unlimited members">Unlimited</span>`;
    }
    return `<span class="chip capacity-chip" title="${acceptedCount} of ${project.teamSizeValue || project.teamSize} spots filled">${acceptedCount}/${project.teamSizeValue || project.teamSize}</span>`;
  }

  function hubProjectCard(project, options = {}) {
    normalizeProjectCategory(project);
    normalizeProjectTimeline(project);
    normalizeProjectTeamSize(project);
    const owner = ownerForProject(project);
    const current = currentUser();
    const guestCta = Boolean(options.guestCta);
    const canJoin =
      project.status !== "completed" &&
      (guestCta
        ? true
        : current &&
          project.ownerId !== current.id &&
          !isProjectMember(project.id, current.id));
    const displayStatus = project.status === "completed" ? "completed" : "open";
    const category = categoryConfigFor(project);
    const cardClass = options.extraClass ? ` ${options.extraClass}` : "";
    const ctaView = guestCta ? "auth" : null;

    return `
      <article class="card hub-project-card project-click-card${cardClass}" data-action="view-project" data-id="${project.id}">
        <div class="hub-card-header">
          <div class="hub-card-heading">
            <p class="small activity-signal">${escapeHtml(activitySignalForProject(project))}</p>
            <h3><span class="category-inline-icon" aria-hidden="true">${category.icon}</span>${escapeHtml(project.title)}</h3>
          </div>
          <span class="status ${displayStatus}">${displayStatus}</span>
        </div>
        <p class="hub-card-description">${escapeHtml(project.description)}</p>
        <div class="meta-row">
          ${renderCapacityBadge(project)}
          ${renderCategoryBadge(project)}
        </div>
        <div class="project-actions card-footer-actions">
          <div class="card-footer-left">
            ${memberPreviewMarkup(project)}
          </div>
          ${
            canJoin
              ? guestCta
                ? `<button class="primary-btn" data-action="navigate" data-view="${ctaView}">Join group</button>`
                : `<button class="primary-btn" data-action="join-project" data-id="${project.id}">Join group</button>`
              : ""
          }
        </div>
      </article>
    `;
  }

  function browseProjectCard(project) {
    normalizeProjectCategory(project);
    normalizeProjectTimeline(project);
    normalizeProjectTeamSize(project);
    const owner = ownerForProject(project);
    const current = currentUser();
    const canJoin =
      current &&
      project.status !== "completed" &&
      project.ownerId !== current.id &&
      !isProjectMember(project.id, current.id);
    const imageMarkup = project.coverImage
      ? `<img class="browse-card-image" src="${escapeHtml(project.coverImage)}" alt="${escapeHtml(project.title)}" />`
      : `<div class="browse-card-image placeholder browse-card-icon-wrap">${renderProjectTypeVisual(project)}</div>`;

    const activitySignal = activitySignalForProject(project);
    const category = categoryConfigFor(project);
    return `
      <article class="browse-card project-click-card" data-action="view-project" data-id="${project.id}">
        <div class="browse-card-media">
          ${imageMarkup}
        </div>
        <div class="browse-card-body">
          <div class="hub-card-header">
            <div class="hub-card-heading">
              <h3><span class="category-inline-icon" aria-hidden="true">${category.icon}</span>${escapeHtml(project.title)}</h3>
              <p class="small">Project lead: ${escapeHtml(owner?.name || "Unknown creator")}</p>
            </div>
            <span class="status ${escapeHtml(project.status)}">${escapeHtml(project.status)}</span>
          </div>
          <p class="small activity-signal">${escapeHtml(activitySignal)}</p>
          <p class="small looking-for-line"><strong>Looking for:</strong> ${escapeHtml(collaborationLabel(project))}</p>
          <div class="meta-row">
            ${renderCapacityBadge(project)}
            ${renderCategoryBadge(project)}
            <span class="chip">${escapeHtml(durationChipLabel(project))}</span>
          </div>
          <div class="project-actions card-footer-actions">
            <div class="card-footer-left">
              ${memberPreviewMarkup(project)}
            </div>
            ${canJoin ? `<button class="primary-btn" data-action="join-project" data-id="${project.id}">Join group</button>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderAuth() {
    return `
      <div class="auth-layout">
        <section class="auth-panel">
          <h2>Create account</h2>
          <p>Create a profile, start a passion project, or collaborate on someone else's creative idea.</p>
          <form id="signup-form">
            <div class="field">
              <label for="signup-name">Name</label>
              <input id="signup-name" name="name" required />
            </div>
            <div class="field">
              <label for="signup-email">Email</label>
              <input id="signup-email" type="email" name="email" required />
            </div>
            <div class="field">
              <label for="signup-password">Password</label>
              <input id="signup-password" type="password" name="password" required />
            </div>
            <button class="primary-btn" type="submit">Create account</button>
          </form>
        </section>

        <section class="auth-panel">
          <h2>Log in</h2>
          <p>Use the seeded demo accounts if you want to explore first: <strong>avery@example.com</strong> or <strong>jordan@example.com</strong> with password <strong>demo123</strong>.</p>
          <form id="login-form">
            <div class="field">
              <label for="login-email">Email</label>
              <input id="login-email" type="email" name="email" required />
            </div>
            <div class="field">
              <label for="login-password">Password</label>
              <input id="login-password" type="password" name="password" required />
            </div>
            <button class="primary-btn" type="submit">Log in</button>
          </form>
        </section>
      </div>
    `;
  }

  function renderSidebar() {
    const user = currentUser();
    const selectedProfile = appState.db.users.find((entry) => entry.id === appState.selectedProfileId);
    const profile = selectedProfile || user || null;
    const showingOwnProfile = !!user && profile?.id === user.id;
    const portfolio = profile ? portfolioForUser(profile) : [];
    const createdProjects = profile ? projectsForUser(profile.id) : [];
    const sidebarClass = appState.route.view === "home" ? "stack sidebar home-sidebar" : "stack sidebar";

    return `
      <aside class="${sidebarClass}">
        ${
          !user
            ? `
              <section class="panel">
                <h2>Try the demo</h2>
                <p>Use <strong>avery@example.com</strong> or <strong>jordan@example.com</strong> with password <strong>demo123</strong>, or create a fresh account to start building together.</p>
                <div class="inline-actions">
                  <button class="primary-btn" data-action="navigate" data-view="auth">Log in / Sign up</button>
                </div>
              </section>
            `
            : ""
        }

        <section class="panel">
          <div class="row-between">
            <h2>${showingOwnProfile ? "Your profile" : "Community profile"}</h2>
            <div class="inline-actions">
              ${showingOwnProfile ? `<button class="ghost-btn" data-action="open-profile-editor">Edit profile</button>` : ""}
              ${user ? `<button class="ghost-btn" data-action="logout">Log out</button>` : ""}
            </div>
          </div>
          ${
            profile
              ? `
                <div class="stack">
                  <div class="profile-photo-wrap">
                    ${
                      profile.profilePhoto
                        ? `<img class="profile-photo" src="${escapeHtml(profile.profilePhoto)}" alt="${escapeHtml(profile.name)} profile photo" />`
                        : `<div class="profile-photo profile-photo-placeholder"><span>${escapeHtml(initialsForName(profile.name))}</span></div>`
                    }
                  </div>
                  <div>
                    <h3>${escapeHtml(profile.name)}</h3>
                    <p>${escapeHtml(profile.bio || "No bio yet. Add one to make collaboration easier.")}</p>
                  </div>
                  <div>
                    <strong>Skills</strong>
                    <div class="chips">${profile.skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("") || `<span class="chip">None listed yet</span>`}</div>
                  </div>
                  <div>
                    <strong>Interests</strong>
                    <div class="chips">${profile.interests.map((interest) => `<span class="chip">${escapeHtml(interest)}</span>`).join("") || `<span class="chip">None listed yet</span>`}</div>
                  </div>
                </div>
              `
              : `<p>Select a profile to preview it here.</p>`
          }
        </section>

        ${
          appState.route.view === "home"
            ? ""
            : `
              <section class="panel">
                <h2>${profile ? `${escapeHtml(profile.name.split(" ")[0])}'s` : "User"} portfolio</h2>
                ${
                  portfolio.length
                    ? `<div class="portfolio-grid">${portfolio.map(projectCard).join("")}</div>`
                    : `<div class="empty-state"><p>Completed projects will show up here as portfolio items.</p></div>`
                }
              </section>
            `
        }

        <section class="panel">
          <h2>${profile ? `${escapeHtml(profile.name.split(" ")[0])}'s` : "User"} projects started</h2>
          ${
            createdProjects.length
              ? `<div class="list">${createdProjects.map(projectCard).join("")}</div>`
              : `<div class="empty-state"><p>No projects yet. Start one and find people to build it with.</p></div>`
          }
        </section>
      </aside>
    `;
  }

  function renderAccountPage() {
    const user = currentUser();
    if (!user) {
      return `
        <main class="stack">
          ${renderAuth()}
        </main>
      `;
    }

    appState.selectedProfileId = user.id;
    return renderSidebar().replace('<aside class="stack">', '<main class="stack">').replace("</aside>", "</main>");
  }

  function renderProfileEditorModal() {
    const user = currentUser();
    if (!appState.profileEditorOpen || !user) {
      return "";
    }

    return `
      <div class="modal-backdrop" role="presentation">
        <section class="modal-card">
          <div class="row-between">
            <div>
              <h2>Edit profile</h2>
              <p>Update your profile details and add a photo for your account page.</p>
            </div>
            <button class="ghost-btn" data-action="close-profile-editor" aria-label="Close profile editor">Close</button>
          </div>
          <form id="profile-form">
            <div class="field">
              <label for="profile-name">Name</label>
              <input id="profile-name" name="name" value="${escapeHtml(user.name)}" required />
            </div>
            <div class="field">
              <label for="profile-bio">Bio</label>
              <textarea id="profile-bio" name="bio" placeholder="What kinds of projects are you excited to build?">${escapeHtml(user.bio || "")}</textarea>
            </div>
            <div class="field-grid">
              <div class="field">
                <label for="profile-photo-url">Profile photo URL</label>
                <input id="profile-photo-url" name="profilePhotoUrl" value="${escapeHtml(user.profilePhoto || "")}" placeholder="https://..." />
              </div>
              <div class="field">
                <label for="profile-photo-file">Or upload profile photo</label>
                <input id="profile-photo-file" type="file" name="profilePhotoFile" accept="image/*" />
              </div>
            </div>
            <div class="field">
              <label for="profile-skills">Skills</label>
              <input id="profile-skills" name="skills" value="${escapeHtml(user.skills.join(", "))}" placeholder="Design, React, Audio editing" />
            </div>
            <div class="field">
              <label for="profile-interests">Interests</label>
              <input id="profile-interests" name="interests" value="${escapeHtml(user.interests.join(", "))}" placeholder="Creative coding, film, games" />
            </div>
            <button class="secondary-btn" type="submit">Save profile</button>
          </form>
        </section>
      </div>
    `;
  }

  function renderProjectEditorModal() {
    const user = currentUser();
    const project = findProject(appState.projectEditorProjectId);

    if (!user || !project || project.ownerId !== user.id) {
      return "";
    }

    return `
      <div class="modal-backdrop" role="presentation">
        <section class="modal-card project-editor-modal">
          <div class="row-between">
            <div>
              <h2>Edit project profile</h2>
              <p>Adjust your project details, collaboration needs, and links.</p>
            </div>
            <button class="ghost-btn" data-action="close-project-editor" aria-label="Close project editor">Close</button>
          </div>
          <form id="project-settings-form">
            <input type="hidden" name="projectId" value="${project.id}" />
            <input type="hidden" name="durationType" value="${appState.projectEditorDurationType}" />
            <input type="hidden" name="teamSizeMode" value="${appState.projectEditorTeamSizeMode}" />
            <div class="field">
              <label for="settings-title">Title</label>
              <input id="settings-title" name="title" value="${escapeHtml(project.title)}" required />
            </div>
            <div class="field">
              <label for="settings-category">Category</label>
              <select id="settings-category" name="category" required>
                ${CATEGORY_ORDER.map((key) => {
                  const category = categoryConfigFor(key);
                  return `<option value="${category.key}" ${project.category === category.key ? "selected" : ""}>${escapeHtml(category.label)}</option>`;
                }).join("")}
              </select>
            </div>
            <div class="field">
              <label for="settings-description">Description</label>
              <textarea id="settings-description" name="description" required>${escapeHtml(project.description)}</textarea>
            </div>
            <div class="field-grid">
              <div class="field">
                <label>Duration</label>
                <div class="duration-toggle-row">
                  <button type="button" class="timeline-pill ${appState.projectEditorDurationType === "fixed" ? "active" : ""}" data-action="set-project-duration-type" data-duration-type="fixed">Fixed timeline</button>
                  <button type="button" class="timeline-pill ${appState.projectEditorDurationType === "open" ? "active" : ""}" data-action="set-project-duration-type" data-duration-type="open">Open-ended</button>
                </div>
                <p class="field-hint">${appState.projectEditorDurationType === "open" ? "Build freely without a set timeline." : "Set an expected timeline for this project."}</p>
                ${
                  appState.projectEditorDurationType === "open"
                    ? ""
                    : `<input id="settings-duration" name="duration" value="${escapeHtml(project.durationValue || "")}" required />`
                }
              </div>
              <div class="field">
                <label>Team size</label>
                <div class="duration-toggle-row">
                  <button type="button" class="timeline-pill ${appState.projectEditorTeamSizeMode === "fixed" ? "active" : ""}" data-action="set-project-team-size-mode" data-team-size-mode="fixed">Fixed size</button>
                  <button type="button" class="timeline-pill ${appState.projectEditorTeamSizeMode === "unlimited" ? "active" : ""}" data-action="set-project-team-size-mode" data-team-size-mode="unlimited">Unlimited members</button>
                </div>
                <p class="field-hint">${appState.projectEditorTeamSizeMode === "unlimited" ? "Let anyone interested join the group." : "Set how many collaborators you want in the group."}</p>
                ${
                  appState.projectEditorTeamSizeMode === "unlimited"
                    ? ""
                    : `<input id="settings-team-size" type="number" min="1" max="20" name="teamSize" value="${project.teamSizeValue || project.teamSize || ""}" required />`
                }
              </div>
              <div class="field full">
                <label for="settings-skills">Skills needed</label>
                <input id="settings-skills" name="skillsNeeded" value="${escapeHtml(project.skillsNeeded.join(", "))}" />
              </div>
              <div class="field">
                <label for="settings-repo">Repository link</label>
                <input id="settings-repo" name="repositoryUrl" value="${escapeHtml(project.repositoryUrl || "")}" placeholder="https://github.com/your-project" />
              </div>
              <div class="field">
                <label for="settings-project-url">Project link</label>
                <input id="settings-project-url" name="projectUrl" value="${escapeHtml(project.projectUrl || "")}" placeholder="https://your-project-site.com" />
              </div>
              <div class="field">
                <label for="settings-cover-url">Cover image URL</label>
                <input id="settings-cover-url" name="coverImageUrl" value="${escapeHtml(project.coverImage || "")}" placeholder="https://..." />
              </div>
              <div class="field">
                <label for="settings-cover-file">Or upload new cover image</label>
                <input id="settings-cover-file" type="file" name="coverImageFile" accept="image/*" />
              </div>
            </div>
            <div class="project-actions">
              <button class="secondary-btn" type="button" data-action="close-project-editor">Discard</button>
              <button class="primary-btn" type="submit">Save changes</button>
            </div>
          </form>
        </section>
      </div>
    `;
  }

  function renderProjectTeamModal() {
    const project = findProject(appState.projectTeamModalId);
    if (!project) {
      return "";
    }

    const members = membersForProject(project.id);

    return `
      <div class="modal-backdrop" role="presentation">
        <section class="modal-card">
          <div class="row-between">
            <div>
              <span class="eyebrow">Team</span>
              <h2>${escapeHtml(project.title)}</h2>
              <p>Everyone currently building this project.</p>
            </div>
            <button class="ghost-btn" data-action="close-team-modal" aria-label="Close team modal">Close</button>
          </div>
          ${
            members.length
              ? `
                <div class="member-list">
                  ${members
                    .map(
                      (member) => `
                        <article class="card">
                          <div class="card-top">
                            <div>
                              <h3>${escapeHtml(member.user?.name || "Unknown member")}</h3>
                              <p class="small">${escapeHtml(member.role)}</p>
                            </div>
                            <button class="small-btn" data-action="view-profile" data-id="${member.userId}">View profile</button>
                          </div>
                          <div class="chips">${(member.user?.skills || []).map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("") || `<span class="chip">No skills listed</span>`}</div>
                        </article>
                      `
                    )
                    .join("")}
                </div>
              `
              : `<div class="empty-state"><p>No team members yet.</p></div>`
          }
        </section>
      </div>
    `;
  }

  function renderHomeHeroVisual(projects) {
    const highlights = projects.slice(0, 3);
    const highlightMarkup = highlights
      .map((project, index) => {
        const category = categoryConfigFor(project);
        const isPrimary = index === 0;
        return `
          <article class="hero-preview-card hero-preview-card-${index + 1} ${isPrimary ? "is-primary" : "is-secondary"}" ${isPrimary ? `data-action="view-project" data-id="${project.id}"` : ""}>
            <p class="hero-preview-label">${escapeHtml(activitySignalForProject(project))}</p>
            <h3><span aria-hidden="true">${category.icon}</span>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <div class="hero-preview-meta">
              ${renderCategoryBadge(project)}
              ${renderCapacityBadge(project)}
            </div>
          </article>
        `;
      })
      .join("");

    const categoryLoop = [...CATEGORY_ORDER, ...CATEGORY_ORDER]
      .map((key) => {
        const category = categoryConfigFor(key);
        return `<span class="hero-category-chip"><span aria-hidden="true">${category.icon}</span><span>${escapeHtml(category.shortLabel)}</span></span>`;
      })
      .join("");

    return `
      <div class="home-hero-visual">
        <div class="hero-visual-stack">
          ${highlightMarkup}
        </div>
        <div class="hero-category-marquee" aria-hidden="true">
          <div class="hero-category-track">${categoryLoop}</div>
        </div>
      </div>
    `;
  }

  function renderHomeHub() {
    const user = currentUser();
    if (!user) {
      return `
        <main class="stack">
          <section class="panel">
            <h2>Welcome</h2>
            <p>Log in or create an account to see the builder hub.</p>
          </section>
        </main>
      `;
    }

    const visibleProjects = [...appState.db.projects].sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const featuredProjects = visibleProjects.slice(0, Math.max(visibleProjects.length, 6));
    const viewportWidth = window.innerWidth || 1280;
    const baseVisibleCount = viewportWidth <= 700 ? 1 : viewportWidth <= 980 ? 2 : 3;
    const visibleCount = Math.min(baseVisibleCount, featuredProjects.length || baseVisibleCount);
    const maxIndex = Math.max(featuredProjects.length - visibleCount, 0);
    const carouselIndex = Math.min(appState.homeCarouselIndex, maxIndex);
    appState.homeCarouselIndex = carouselIndex;
    const canMovePrev = carouselIndex > 0;
    const canMoveNext = carouselIndex < maxIndex;
    const trackOffset = `translateX(calc(${carouselIndex} * (-1 * ((100% - ${(visibleCount - 1) * 24}px) / ${visibleCount} + 24px))))`;

    return `
      <main class="stack home-hub">
        <section class="panel home-hero-panel">
          <div class="home-hero-grid">
            <div class="home-hero-copy">
            <h2 class="hub-section-title">Find your people. Build something together.</h2>
            <p>For hobbyists, creators, and curious builders who want to make passion projects and portfolio work with other people.</p>
              <div class="inline-actions hub-cta-row home-hub-cta-row">
                <div class="hub-cta-block">
                  <button class="primary-btn hub-primary-btn" data-action="navigate" data-view="create">Start a project</button>
                  <p class="hub-cta-microcopy">Lead something new</p>
                </div>
                <div class="hub-cta-block">
                  <button class="secondary-btn hub-secondary-btn" data-action="navigate" data-view="browse">Join a group</button>
                  <p class="hub-cta-microcopy">Jump into something active</p>
                </div>
              </div>
            </div>
            ${renderHomeHeroVisual(featuredProjects)}
          </div>
        </section>

        <section class="panel home-featured-panel">
          <div class="section-heading featured-section-heading">
            <div>
              <p class="home-featured-kicker">&#9889; Trending now</p>
              <h2 class="hub-section-title">Jump into active builds</h2>
              <p>Projects you can join right now.</p>
            </div>
            <div class="carousel-controls" aria-label="Browse featured projects">
              <button
                type="button"
                class="small-btn carousel-btn"
                data-action="home-carousel-prev"
                ${canMovePrev ? "" : "disabled"}
                aria-label="Previous projects"
              >
                &larr;
              </button>
              <button
                type="button"
                class="small-btn carousel-btn"
                data-action="home-carousel-next"
                data-total="${featuredProjects.length}"
                data-visible="${visibleCount}"
                ${canMoveNext ? "" : "disabled"}
                aria-label="Next projects"
              >
                &rarr;
              </button>
            </div>
          </div>
          ${
            featuredProjects.length
              ? `
                <div class="home-carousel-shell">
                  <div class="home-carousel-track" style="transform: ${trackOffset};">
                    ${featuredProjects.map(hubProjectCard).join("")}
                  </div>
                </div>
              `
              : `<div class="empty-state"><p>Groups will show up here as more people start building together.</p></div>`
          }
        </section>
      </main>
    `;
  }
  function renderCreateProjectPage() {
    if (!currentUser()) {
      return `
        <main class="stack">
          <section class="panel">
            <h2>Start a project</h2>
            <p>Log in to create a project and invite collaborators.</p>
          </section>
        </main>
      `;
    }

    return `
      <main class="stack">
        <section class="panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Create</span>
              <p class="create-kicker">Start something people can join.</p>
              <h2>Start a project</h2>
              <p>Describe what you want to build and who you want to build it with.</p>
              <p>You can refine it later - just get it started.</p>
            </div>
            <button class="small-btn" data-action="navigate" data-view="home">Back to home</button>
          </div>
          <form id="project-form">
            <input type="hidden" name="durationType" value="${appState.createDurationType}" />
            <input type="hidden" name="teamSizeMode" value="${appState.createTeamSizeMode}" />
            <div class="field-grid">
              <div class="field">
                <label for="project-title">Project title</label>
                <input id="project-title" name="title" required />
                <p class="field-hint">Give your project a clear, simple name.</p>
              </div>
              <div class="field">
                <label for="project-category">Category</label>
                <select id="project-category" name="category" required>
                  <option value="">Select a category</option>
                  ${CATEGORY_ORDER.map((key) => {
                    const category = categoryConfigFor(key);
                    return `<option value="${category.key}">${escapeHtml(category.label)}</option>`;
                  }).join("")}
                </select>
              </div>
              <div class="field">
                <label>Duration</label>
                <div class="duration-toggle-row">
                  <button type="button" class="timeline-pill ${appState.createDurationType === "fixed" ? "active" : ""}" data-action="set-create-duration-type" data-duration-type="fixed">Fixed timeline</button>
                  <button type="button" class="timeline-pill ${appState.createDurationType === "open" ? "active" : ""}" data-action="set-create-duration-type" data-duration-type="open">Open-ended</button>
                </div>
                <p class="field-hint">${appState.createDurationType === "open" ? "Build freely without a set timeline." : "Set an expected timeline for this project."}</p>
                ${
                  appState.createDurationType === "open"
                    ? ""
                    : `<input id="project-duration" name="duration" placeholder="4 weeks" required />`
                }
              </div>
              <div class="field full">
                <label for="project-description">Description</label>
                <textarea id="project-description" name="description" required></textarea>
                <p class="field-hint">What are you building and what's the goal?</p>
              </div>
              <div class="field">
                <label for="project-skills">Skills needed</label>
                <input id="project-skills" name="skillsNeeded" placeholder="Frontend, UX writing, 3D art" />
                <p class="field-hint">Who do you need to make this happen?</p>
              </div>
              <div class="field">
                <label>Team size</label>
                <div class="duration-toggle-row">
                  <button type="button" class="timeline-pill ${appState.createTeamSizeMode === "fixed" ? "active" : ""}" data-action="set-create-team-size-mode" data-team-size-mode="fixed">Fixed size</button>
                  <button type="button" class="timeline-pill ${appState.createTeamSizeMode === "unlimited" ? "active" : ""}" data-action="set-create-team-size-mode" data-team-size-mode="unlimited">Unlimited members</button>
                </div>
                <p class="field-hint">${appState.createTeamSizeMode === "unlimited" ? "Let anyone interested join the group." : "How many collaborators are you hoping to build with?"}</p>
                ${
                  appState.createTeamSizeMode === "unlimited"
                    ? ""
                    : `<input id="project-team-size" type="number" min="1" max="12" name="teamSize" required />`
                }
              </div>
            </div>
            <section class="optional-details">
              <button class="optional-toggle" type="button" data-action="toggle-create-details" aria-expanded="${appState.createDetailsOpen ? "true" : "false"}">
                <span>Add more details (optional)</span>
                <span>${appState.createDetailsOpen ? "Hide" : "Show"}</span>
              </button>
              ${
                appState.createDetailsOpen
                  ? `
                    <div class="field-grid optional-details-grid">
                      <div class="field">
                        <label for="project-repo-url">Repository link</label>
                        <input id="project-repo-url" name="repositoryUrl" placeholder="https://github.com/your-project" />
                      </div>
                      <div class="field">
                        <label for="project-live-url">Project link</label>
                        <input id="project-live-url" name="projectUrl" placeholder="https://your-project-site.com" />
                      </div>
                      <div class="field">
                        <label for="project-cover-url">Cover image URL</label>
                        <input id="project-cover-url" name="coverImageUrl" placeholder="https://..." />
                      </div>
                      <div class="field">
                        <label for="project-cover-file">Upload cover image</label>
                        <input id="project-cover-file" type="file" name="coverImageFile" accept="image/*" />
                      </div>
                    </div>
                  `
                  : ""
              }
            </section>
            <div class="project-form-actions">
              <button class="secondary-btn" type="button" data-action="navigate" data-view="home">Cancel</button>
              <button class="primary-btn" type="submit">Create project</button>
            </div>
          </form>
        </section>
      </main>
    `;
  }

  function renderBrowsePage() {
    const visibleProjects = appState.db.projects
      .filter((project) => {
        if (appState.projectFilter === "all") return true;
        return project.status === appState.projectFilter;
      })
      .filter((project) => {
        normalizeProjectCategory(project);
        if (appState.categoryFilter === "all") return true;
        return project.category === appState.categoryFilter;
      })
      .filter((project) => {
        if (!appState.browseQuery) return true;
        const haystack = [project.title, project.description, project.skillsNeeded.join(" "), ownerForProject(project)?.name || ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(appState.browseQuery);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return `
      <main class="stack">
        <section class="panel">
          <div class="section-heading">
            <div>
              <p class="hub-live-note">Real people building real things - jump in.</p>
              <h2 class="hub-section-title">Explore projects to build together</h2>
              <p>Browse active and completed projects from people looking for collaborators.</p>
            </div>
            ${currentUser() ? `<button class="primary-btn" data-action="navigate" data-view="create">Start a project</button>` : `<button class="primary-btn" data-action="navigate" data-view="auth">Log in / Sign up</button>`}
          </div>
          <div class="browse-filter-stack">
            <div class="category-selector" role="tablist" aria-label="Browse by category">
              <button class="category-pill ${appState.categoryFilter === "all" ? "active" : ""}" data-action="toggle-category-filter" data-category="all">
                <span aria-hidden="true">&#10024;</span>
                <span>All</span>
              </button>
              ${CATEGORY_ORDER.map((key) => {
                const category = categoryConfigFor(key);
                return `
                  <button class="category-pill ${appState.categoryFilter === category.key ? "active" : ""}" data-action="toggle-category-filter" data-category="${category.key}">
                    <span aria-hidden="true">${category.icon}</span>
                    <span>${escapeHtml(category.shortLabel)}</span>
                  </button>
                `;
              }).join("")}
            </div>
            <div class="status-filter-row">
              <button class="status-pill ${appState.projectFilter === "open" ? "active" : ""}" data-action="toggle-filter" data-filter="open">Open</button>
              <button class="status-pill ${appState.projectFilter === "active" ? "active" : ""}" data-action="toggle-filter" data-filter="active">Active</button>
              <button class="status-pill ${appState.projectFilter === "completed" ? "active" : ""}" data-action="toggle-filter" data-filter="completed">Completed</button>
              <button class="status-pill ${appState.projectFilter === "all" ? "active" : ""}" data-action="toggle-filter" data-filter="all">All</button>
            </div>
          </div>
          <div class="field browse-search-field">
            <input id="browse-search" value="${escapeHtml(appState.browseQuery)}" placeholder="Search projects, skills, or collaborators..." />
          </div>
          ${
            visibleProjects.length
              ? `<div class="browse-feed">${visibleProjects.map(browseProjectCard).join("")}</div>`
              : `<div class="empty-state"><p>No passion projects match that filter yet.</p></div>`
          }
        </section>
      </main>
    `;
  }

  function communityProjects(key) {
    return appState.db.projects
      .filter((project) => {
        normalizeProjectCategory(project);
        return project.category === key;
      })
      .sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }

  function featuredCommunityProject(key) {
    return communityProjects(key)[0] || null;
  }

  function communityPostsForKey(key) {
    if (supabase && appState.isRemoteDataReady) {
      return appState.db.communityPosts
        .filter((post) => post.communityKey === key)
        .map((post) => ({
          ...post,
          authorName: appState.db.users.find((user) => user.id === post.authorId)?.name || "Unknown builder",
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return [...(COMMUNITY_POSTS[key] || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  function renderCommunityCard(key) {
    const community = communityConfigFor(key);
    const joined = isCommunityJoined(key);

    return `
      <article class="card community-card project-click-card" data-action="navigate" data-view="community" data-route-id="${community.key}">
        <div class="community-card-icon" aria-hidden="true">${community.icon}</div>
        <div class="stack">
          <div>
            <h3>${escapeHtml(community.title)}</h3>
            <p>${escapeHtml(community.description)}</p>
          </div>
          <p class="community-activity">${activeBuilderCountForCommunity(community.key)} active builders</p>
        </div>
        ${
          joined
            ? `<button class="secondary-btn" data-action="navigate" data-view="community" data-route-id="${community.key}">View community</button>`
            : `<button class="primary-btn" data-action="join-community" data-community="${community.key}">Join community</button>`
        }
      </article>
    `;
  }

  function renderCommunitiesPage() {
    return `
      <main class="stack communities-page">
        <section class="panel communities-overview-panel">
          <div class="section-heading">
            <div>
              <h2 class="hub-section-title">Communities</h2>
              <p>Find your lane, meet people with the same creative energy, and move naturally into shared builds.</p>
            </div>
          </div>
          <div class="community-grid">
            ${COMMUNITY_ORDER.map(renderCommunityCard).join("")}
          </div>
        </section>
      </main>
    `;
  }

  function renderCommunityPage(communityKey) {
    const community = communityConfigFor(communityKey);
    const joined = isCommunityJoined(community.key);
    const featuredProject = featuredCommunityProject(community.key);
    const posts = communityPostsForKey(community.key);

    return `
      <main class="stack community-page">
        <section class="panel community-header-panel">
          <div class="community-header-top">
            <div class="community-header-copy">
              <div class="community-title-row">
                <span class="community-page-icon" aria-hidden="true">${community.icon}</span>
                <div>
                  <h2 class="hub-section-title">${escapeHtml(community.title)}</h2>
                  <p>${escapeHtml(community.description)}</p>
                </div>
              </div>
              <p class="community-activity">${activeBuilderCountForCommunity(community.key)} active builders</p>
            </div>
            ${
              joined
                ? `<button class="secondary-btn community-join-btn" data-action="navigate" data-view="community" data-route-id="${community.key}">Joined community</button>`
                : `<button class="primary-btn community-join-btn" data-action="join-community" data-community="${community.key}">Join community</button>`
            }
          </div>
          <div class="inline-actions community-quick-actions">
            <button class="secondary-btn" data-action="community-prompt" data-community="${community.key}" data-prompt-type="ask">Ask a question</button>
            <button class="secondary-btn" data-action="community-prompt" data-community="${community.key}" data-prompt-type="resource">Share a resource</button>
            <button class="primary-btn" data-action="community-prompt" data-community="${community.key}" data-prompt-type="start-project">Start a project</button>
          </div>
        </section>

        <section class="panel community-spotlight-panel">
          <div class="section-heading">
            <div>
              <p class="home-featured-kicker">&#128293; Featured this month</p>
              <h2>Project spotlight</h2>
            </div>
          </div>
          ${
            featuredProject
              ? `
                <article class="community-spotlight-card">
                  <div class="community-spotlight-copy">
                    <h3>${escapeHtml(featuredProject.title)}</h3>
                    <p>${escapeHtml(featuredProject.description)}</p>
                    <div class="meta-row">
                      ${renderCategoryBadge(featuredProject)}
                      ${renderCapacityBadge(featuredProject)}
                    </div>
                  </div>
                  <button class="primary-btn" data-action="join-project" data-id="${featuredProject.id}">Join group</button>
                </article>
              `
              : `<div class="empty-state"><p>No featured project yet. Start one and give this community something to rally around.</p></div>`
          }
        </section>

        <section class="panel community-feed-panel">
          <div class="section-heading">
            <div>
              <h2>Community feed</h2>
              <p>Short posts, quick progress notes, and useful finds people are sharing right now.</p>
            </div>
          </div>
          <div class="community-feed-list">
            ${posts
              .map(
                (post) => `
                  <article class="community-post">
                    <div class="community-post-top">
                      <strong>${escapeHtml(post.authorName)}</strong>
                      <span class="small">${formatDate(post.createdAt)}</span>
                    </div>
                    <p>${escapeHtml(post.content)}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      </main>
    `;
  }

  function renderProjectPage(projectId) {
    const project = findProject(projectId);
    const user = currentUser();

    if (!project) {
      return `
        <main class="stack">
          <section class="panel">
            <h2>Project not found</h2>
            <p>This project may have been removed from the MVP dataset.</p>
            <button class="secondary-btn" data-action="navigate" data-view="${currentUser() ? "home" : "landing"}">Back</button>
          </section>
        </main>
      `;
    }

    const owner = ownerForProject(project);
    const members = membersForProject(project.id);
    const updates = updatesForProject(project.id);
    const isOwner = user && project.ownerId === user.id;
    const isMember = user && isProjectMember(project.id, user.id);
    normalizeProjectCategory(project);
    normalizeProjectTimeline(project);
    normalizeProjectTeamSize(project);
    const acceptedCount = projectMemberCount(project.id);
    const statusToggleLabel = project.status === "completed" ? "Reopen project" : "Mark completed";
    const visibleMembers = members.slice(0, 4);
    const overflowMembers = Math.max(members.length - visibleMembers.length, 0);
    const pendingForViewer = user
      ? appState.db.joinRequests.some(
          (request) => request.projectId === project.id && request.userId === user.id && request.status === "pending"
        )
      : false;

    return `
      <main class="project-page">
        <section class="project-profile-header project-unified-card">
            <div class="project-hero-media">
              <div class="project-hero-placeholder">${renderProjectTypeVisual(project)}</div>
            </div>
            <section class="project-header">
              <div class="project-top">
                <div>
                  <span class="eyebrow project-label">Project profile</span>
                  <h2>${escapeHtml(project.title)}</h2>
                  <p>Started by ${escapeHtml(owner?.name || "Unknown creator")}</p>
                  <p class="project-timeline">Started ${formatDate(project.createdAt)} &bull; ${escapeHtml(durationMetaLabel(project))}</p>
                </div>
                <div class="inline-actions">
                  <span class="status ${escapeHtml(project.status)}">${escapeHtml(project.status)}</span>
                  <span class="spots-badge" title="${project.teamSizeMode === "unlimited" ? "Unlimited members" : `${acceptedCount} of ${project.teamSizeValue || project.teamSize} spots filled`}">${project.teamSizeMode === "unlimited" ? "Unlimited" : `${acceptedCount}/${project.teamSizeValue || project.teamSize}`}</span>
                </div>
              </div>
              <p>${escapeHtml(project.description)}</p>
              <div class="project-team-inline">
                <button type="button" class="team-inline-trigger" data-action="open-team-modal" data-id="${project.id}">
                  <div class="team-avatar-row" aria-hidden="true">
                    ${visibleMembers
                      .map(
                        (member) => `
                          <span class="team-avatar-stack ${member.user?.profilePhoto ? "has-image" : ""}">
                            ${
                              member.user?.profilePhoto
                                ? `<img src="${escapeHtml(member.user.profilePhoto)}" alt="${escapeHtml(member.user.name)}" />`
                                : `<span>${escapeHtml(initialsForName(member.user?.name || "Member"))}</span>`
                            }
                          </span>
                        `
                      )
                      .join("")}
                    ${overflowMembers ? `<span class="team-avatar-stack overflow">+${overflowMembers}</span>` : ""}
                  </div>
                  <span class="team-inline-copy">Team: ${members.length} member${members.length === 1 ? "" : "s"}</span>
                </button>
              </div>
              <div class="chips">
                ${renderCategoryBadge(project)}
                ${project.skillsNeeded.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("") || `<span class="chip">General collaboration</span>`}
              </div>
              <div class="project-overview-list">
                <div class="overview-item overview-item-goal">
                  <strong>What we're trying to make</strong>
                  <span>${escapeHtml(project.description)}</span>
                </div>
                <div class="overview-item overview-item-team">
                  <strong>Team size</strong>
                  <span>${teamSizeMetaLabel(project)}</span>
                </div>
              </div>
              <div class="resource-links">
                ${project.repositoryUrl ? `<a class="resource-link" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noreferrer">Repository</a>` : ""}
                ${project.projectUrl ? `<a class="resource-link" href="${escapeHtml(project.projectUrl)}" target="_blank" rel="noreferrer">Project link</a>` : ""}
              </div>
              <div class="project-actions">
                ${user && !isOwner && !isMember && !pendingForViewer && project.status !== "completed" ? `<button class="primary-btn" data-action="join-project" data-id="${project.id}">Join group</button>` : ""}
                ${isMember ? `<button class="secondary-btn" data-action="open-chat" data-id="${project.id}">Open team chat</button>` : ""}
                ${pendingForViewer ? `<span class="status pending">Request pending</span>` : ""}
                ${isOwner ? `<button class="secondary-btn" data-action="open-project-editor" data-id="${project.id}">Edit project</button>` : ""}
                ${isOwner ? `<button class="${project.status === "completed" ? "secondary-btn" : "danger-btn"}" data-action="complete-project" data-id="${project.id}">${statusToggleLabel}</button>` : ""}
              </div>
            </section>
        </section>

        <div class="project-overview-grid">
          <section class="panel project-main-card">
            <h2>Who this project needs</h2>
            ${
              project.skillsNeeded.length
                ? `
                  <div class="stack">
                    <p class="small looking-for-line"><strong>Looking for:</strong> ${escapeHtml(project.skillsNeeded.join(", "))}</p>
                    <ul class="detail-list">
                      ${project.skillsNeeded.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}
                    </ul>
                    <div class="meta-row">${renderCapacityBadge(project)}</div>
                  </div>
                `
                : `<div class="empty-state"><p>No collaborator roles listed yet.</p></div>`
            }
          </section>

          <section class="panel project-side-card">
            <h2>Project profile links</h2>
            ${
              project.repositoryUrl || project.projectUrl
                ? `
                  <div class="resource-links vertical">
                    ${project.repositoryUrl ? `<a class="resource-link" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noreferrer">Open repository</a>` : ""}
                    ${project.projectUrl ? `<a class="resource-link" href="${escapeHtml(project.projectUrl)}" target="_blank" rel="noreferrer">View project page</a>` : ""}
                  </div>
                `
                : `<div class="empty-state"><p>No repository or external project links added yet.</p></div>`
            }
          </section>
        </div>

        <section class="panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Updates</span>
              <h2>Project updates</h2>
              <p>Share progress, updates, and visuals as you build.</p>
            </div>
          </div>

          ${
            isMember
              ? `
                <form id="update-form">
                  <input type="hidden" name="projectId" value="${project.id}" />
                  <div class="field">
                    <label for="update-title">Update title</label>
                    <input id="update-title" name="title" placeholder="Week 2 sketch dump" />
                  </div>
                    <div class="field">
                      <label for="update-content">Post an update</label>
                      <textarea id="update-content" name="content" placeholder="What changed, shipped, or needs attention?"></textarea>
                    </div>
                    <div class="field-grid">
                    <div class="field">
                        <label for="update-image-url">Image URL</label>
                        <p class="field-hint">Add visuals to your update with an image link.</p>
                        <input id="update-image-url" name="imageUrl" placeholder="https://..." />
                      </div>
                      <div class="field">
                        <label for="update-image-file">Or upload image</label>
                        <p class="field-hint">Upload a screenshot, mockup, or work-in-progress image.</p>
                        <input id="update-image-file" type="file" name="imageFile" accept="image/*" />
                      </div>
                      <div class="field">
                        <label for="update-link-url">External link</label>
                        <input id="update-link-url" name="linkUrl" placeholder="https://github.com/... or portfolio link" />
                      </div>
                    </div>
                  <button class="primary-btn" type="submit">Post update</button>
                </form>
              `
              : `<div class="muted-box"><p>Only accepted team members can post updates.</p></div>`
          }

          ${
            updates.length
              ? `
                <div class="updates">
                  ${updates
                    .map((update) => {
                      const author = appState.db.users.find((entry) => entry.id === update.authorId);
                      return `
                        <article class="update-entry">
                          <div class="update-line">
                            <div class="update-meta">
                              <strong>${escapeHtml(update.title || "Project update")}</strong>
                              <div class="small">By ${escapeHtml(author?.name || "Unknown author")} on ${formatDate(update.createdAt)}</div>
                            </div>
                          </div>
                          <p>${escapeHtml(update.content)}</p>
                          ${update.imageUrl ? `<img class="update-image" src="${escapeHtml(update.imageUrl)}" alt="${escapeHtml(update.title || project.title)} image" />` : ""}
                          ${update.linkUrl ? `<div class="resource-links"><a class="resource-link" href="${escapeHtml(update.linkUrl)}" target="_blank" rel="noreferrer">Open related link</a></div>` : ""}
                        </article>
                      `;
                    })
                    .join("")}
                </div>
              `
              : `<div class="empty-state"><p>No updates yet. Start documenting the build so the team can keep moving.</p></div>`
          }
        </section>
      </main>
    `;
  }

  function renderLandingPage() {
    const featuredProjects = [...appState.db.projects]
      .sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 6);
    const completedShowcase = appState.db.projects
      .filter((project) => project.status === "completed" && project.coverImage)
      .slice(0, 4);
    const heroPreviewProjects = featuredProjects.slice(0, 2);
    const viewportWidth = window.innerWidth || 1280;
    const baseVisibleCount = viewportWidth <= 700 ? 1 : viewportWidth <= 980 ? 2 : 3;
    const visibleCount = Math.min(baseVisibleCount, featuredProjects.length || baseVisibleCount);
    const maxIndex = Math.max(featuredProjects.length - visibleCount, 0);
    const carouselIndex = Math.min(appState.landingCarouselIndex, maxIndex);
    appState.landingCarouselIndex = carouselIndex;
    const canMovePrev = carouselIndex > 0;
    const canMoveNext = carouselIndex < maxIndex;
    const trackOffset = `translateX(calc(${carouselIndex} * (-1 * ((100% - ${(visibleCount - 1) * 24}px) / ${visibleCount} + 24px))))`;

    return `
      <main class="stack landing-product-page">
        <section class="panel home-hero-panel landing-product-hero">
          <div class="home-hero-grid landing-hero-grid">
            <div class="home-hero-copy landing-hero-copy">
              <h2 class="hub-section-title">Find your people. Start building.</h2>
              <p>Join projects, collaborate with others, and turn ideas into real work.</p>
              <div class="inline-actions hub-cta-row home-hub-cta-row landing-hero-cta-row">
                <div class="hub-cta-block">
                  <button class="primary-btn hub-primary-btn hero-primary-btn landing-signup-glow" data-action="navigate" data-view="auth">Start a project</button>
                  <p class="hub-cta-microcopy">Lead something new</p>
                </div>
                <div class="hub-cta-block">
                  <button class="secondary-btn hub-secondary-btn hero-secondary-btn" data-action="navigate" data-view="auth">Join a group</button>
                  <p class="hub-cta-microcopy">Jump into something active</p>
                </div>
              </div>
              <p class="hero-cta-note">You don’t build here. You find people and stay aligned while you build elsewhere.</p>
            </div>
            <div class="landing-hero-visual">
              <div class="landing-preview-stack">
                ${heroPreviewProjects
                  .map((project, index) =>
                    hubProjectCard(project, {
                      guestCta: true,
                      extraClass: `landing-preview-card landing-preview-card-${index + 1} ${index === 0 ? "is-primary" : "is-secondary"}`,
                    })
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </section>

        <section class="panel home-featured-panel landing-featured-panel">
          <div class="section-heading featured-section-heading">
            <div>
              <p class="home-featured-kicker">&#9889; Filling fast</p>
              <h2 class="hub-section-title">Jump into active builds</h2>
              <p>Projects you can join right now.</p>
            </div>
            <div class="carousel-controls" aria-label="Browse preview projects">
              <button
                type="button"
                class="small-btn carousel-btn"
                data-action="landing-carousel-prev"
                ${canMovePrev ? "" : "disabled"}
                aria-label="Previous projects"
              >
                &larr;
              </button>
              <button
                type="button"
                class="small-btn carousel-btn"
                data-action="landing-carousel-next"
                data-total="${featuredProjects.length}"
                data-visible="${visibleCount}"
                ${canMoveNext ? "" : "disabled"}
                aria-label="Next projects"
              >
                &rarr;
              </button>
            </div>
          </div>
          ${
            featuredProjects.length
              ? `
                <div class="home-carousel-shell landing-carousel-shell">
                  <div class="home-carousel-track" style="transform: ${trackOffset};">
                    ${featuredProjects.map((project) => hubProjectCard(project, { guestCta: true })).join("")}
                  </div>
                </div>
              `
              : `<div class="empty-state"><p>Groups will show up here as more people start building together.</p></div>`
          }
        </section>

        <section class="panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Completed Showcase</span>
              <h2>See what people have built</h2>
            </div>
          </div>
          ${
            completedShowcase.length
              ? `
                <div class="showcase-gallery">
                  ${completedShowcase
                    .map(
                      (project) => `
                        <article class="showcase-card project-click-card" data-action="view-project" data-id="${project.id}" style="background-image: linear-gradient(180deg, rgba(36, 25, 15, 0.05), rgba(36, 25, 15, 0.72)), url('${escapeHtml(project.coverImage)}')">
                          <div class="showcase-card-copy">
                            <span class="showcase-card-tag">Completed project</span>
                            <h3>${escapeHtml(project.title)}</h3>
                            <span class="showcase-card-cta">View project</span>
                          </div>
                        </article>
                      `
                    )
                    .join("")}
                </div>
              `
              : `<div class="empty-state"><p>Completed project visuals will show up here as the gallery grows.</p></div>`
          }
        </section>

      </main>
    `;
  }
  function renderChatMessages(projectId) {
    const messages = chatsForProject(projectId);

    if (!messages.length) {
      return `<div class="empty-state"><p>No messages yet. Start the conversation and get the project moving.</p></div>`;
    }

    return `
      <div class="chat-thread" data-chat-thread="true" data-project-id="${projectId}">
        ${messages
          .map((message) => {
            const author = appState.db.users.find((entry) => entry.id === message.authorId);
            const isOwn = message.authorId === appState.sessionUserId;
            return `
              <article class="chat-bubble ${isOwn ? "own" : ""}">
                <strong>${escapeHtml(author?.name || "Unknown member")}</strong>
                <p>${escapeHtml(message.content)}</p>
                <span class="small">${formatDate(message.createdAt)}</span>
              </article>
            `;
          })
          .join("")}
      </div>
      `;
  }

  function scrollChatThreadsToBottom() {
    const threads = document.querySelectorAll("[data-chat-thread='true']");
    threads.forEach((thread) => {
      thread.scrollTop = thread.scrollHeight;
    });
    appState.shouldScrollChatsToBottom = false;
  }

  function renderChatDock() {
    const user = currentUser();
    if (!user) return "";

    const conversations = projectChatsForUser(user.id);
    if (!conversations.length) return "";

    const activeProject =
      findProject(appState.activeChatProjectId) || conversations[0].project;
    const minimized = appState.chatMinimized;

    console.debug("[chat] render dock", {
      selectedProjectId: activeProject?.id || null,
      conversationProjectIds: conversations.map(({ project }) => project.id),
      minimized,
    });

    return `
      <aside class="chat-dock ${minimized ? "minimized" : ""}">
        <div class="chat-dock-header">
          <button class="chat-title-btn" data-action="open-messages" data-id="${activeProject.id}">
            Team chat
            <span>${escapeHtml(activeProject.title)}</span>
          </button>
          <div class="inline-actions">
            <button class="small-btn" data-action="toggle-chat-minimize">${minimized ? "Open" : "Minimize"}</button>
            <button class="small-btn" data-action="close-chat">Hide</button>
          </div>
        </div>
        ${
          minimized
            ? ""
            : `
              <div class="chat-dock-tabs">
                ${conversations
                  .map(
                    ({ project }) => `
                      <button class="chat-tab ${project.id === activeProject.id ? "active" : ""}" data-action="open-chat" data-id="${project.id}">
                        ${escapeHtml(project.title)}
                      </button>
                    `
                  )
                  .join("")}
              </div>
              <div class="chat-dock-body">
                ${renderChatMessages(activeProject.id)}
              </div>
              <form id="chat-form" class="chat-form">
                <input type="hidden" name="projectId" value="${activeProject.id}" />
                <textarea name="content" placeholder="Send a quick team message"></textarea>
                <button class="primary-btn" type="submit">Send</button>
              </form>
            `
        }
      </aside>
    `;
  }

  function renderMessagesPage() {
    const user = currentUser();
    if (!user) {
      return `
        <main class="stack">
          <section class="panel">
            <h2>Messages</h2>
            <p>Log in to access your project chats.</p>
          </section>
        </main>
      `;
    }

    const conversations = projectChatsForUser(user.id);
    if (!conversations.length) {
      return `
        <main class="stack">
          <section class="panel">
            <h2>Messages</h2>
            <p>You'll see a chat here once you join or start a project team.</p>
          </section>
        </main>
      `;
    }

    const activeProject =
      findProject(appState.route.id) ||
      findProject(appState.activeChatProjectId) ||
      conversations[0].project;

    appState.activeChatProjectId = activeProject.id;

    console.debug("[chat] render messages page", {
      selectedProjectId: activeProject.id,
      routeProjectId: appState.route.id || null,
      activeChatProjectId: appState.activeChatProjectId,
      conversationProjectIds: conversations.map(({ project }) => project.id),
    });

    return `
      <main class="messages-layout">
        <section class="panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Messages</span>
              <h2>Project chats</h2>
            </div>
          </div>
          <div class="messages-list">
            ${conversations
              .map(({ project, messages }) => {
                const preview = messages[messages.length - 1]?.content || "Start the conversation and get the project moving.";
                return `
                  <button type="button" class="conversation-card ${project.id === activeProject.id ? "active" : ""}" data-action="navigate" data-view="messages" data-route-id="${project.id}">
                    <strong>${escapeHtml(project.title)}</strong>
                    <span class="small">${escapeHtml(preview)}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </section>

        <section class="panel">
          <div>
            <button class="title-link-btn" data-action="view-project" data-id="${activeProject.id}">
              <h2>${escapeHtml(activeProject.title)}</h2>
            </button>
            <p>One chat per project keeps collaboration context in the right place.</p>
          </div>
          ${renderChatMessages(activeProject.id)}
          <form id="messages-chat-form" class="chat-form">
            <input type="hidden" name="projectId" value="${activeProject.id}" />
            <textarea name="content" placeholder="Write to the whole team"></textarea>
            <button class="primary-btn" type="submit">Send message</button>
          </form>
        </section>
      </main>
    `;
  }

  function renderJoinRequestModal() {
    const project = findProject(appState.joinRequestProjectId);
    const owner = project ? ownerForProject(project) : null;

    if (!project) {
      return "";
    }

    return `
      <div class="modal-backdrop">
        <section class="modal-card">
          <div class="row-between">
            <div>
              <span class="eyebrow">Join Group</span>
              <h2>${escapeHtml(project.title)}</h2>
              <p>Join ${escapeHtml(owner?.name || "the project lead")}'s group and start building together.</p>
            </div>
            <button class="small-btn" data-action="close-join-modal">Close</button>
          </div>
          <form id="join-request-form">
            <input type="hidden" name="projectId" value="${project.id}" />
            <p class="small">You'll show up as a member right away so you can follow updates and contribute.</p>
            <div class="project-actions">
              <button class="secondary-btn" type="button" data-action="close-join-modal">Cancel</button>
              <button class="primary-btn" type="submit">Join group</button>
            </div>
          </form>
        </section>
      </div>
    `;
  }

  function renderAboutPage() {
    return `
      <main class="stack">
        <section class="panel info-page">
          <h2>About Project Looper</h2>
          <div class="info-block">
            <h3>What it is</h3>
            <p>Project Looper is a project-first platform for people who want to build passion projects, portfolio work, and creative ideas together.</p>
          </div>
          <div class="info-block">
            <h3>Why it exists</h3>
            <p>Most platforms are built for jobs, gigs, or general communities.</p>
            <p>Project Looper is built specifically for people who want to find collaborators and actually build.</p>
          </div>
          <div class="info-block">
            <h3>How it works</h3>
            <ul class="detail-list">
              <li>Start a project</li>
              <li>List the skills needed</li>
              <li>Find people who want to build</li>
              <li>Collaborate and create something real</li>
            </ul>
          </div>
          <div class="info-block">
            <h3>Status</h3>
            <p>This is an early MVP. Feedback is welcome and helps shape the direction of the platform.</p>
          </div>
        </section>
      </main>
    `;
  }

  function renderFeedbackPage() {
    return `
      <main class="stack">
        <section class="panel info-page">
          <h2>Give feedback</h2>
          <p>This is an early version of Project Looper.</p>
          <p>If you have thoughts, ideas, or things that feel confusing, I'd love to hear them.</p>
          <div class="field">
            <label for="feedback-notes">Your notes</label>
            <textarea id="feedback-notes" placeholder="What feels clear, confusing, promising, or missing?"></textarea>
          </div>
          <div class="inline-actions">
            <a class="primary-btn footer-link-btn" href="mailto:hello@projectlooper.app?subject=Project%20Looper%20Feedback">Send feedback by email</a>
          </div>
        </section>
      </main>
    `;
  }

  function renderPrivacyPage() {
    return `
      <main class="stack">
        <section class="panel info-page">
          <h2>Privacy</h2>
          <p>This is an early MVP. No personal data is sold or shared.</p>
          <p>Basic usage data may be stored to improve the product.</p>
        </section>
      </main>
    `;
  }

  function renderTermsPage() {
    return `
      <main class="stack">
        <section class="panel info-page">
          <h2>Terms</h2>
          <p>Use of this platform is for collaborative, non-commercial project building.</p>
          <p>More detailed terms will be added as the platform evolves.</p>
        </section>
      </main>
    `;
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="site-footer-main">
          <div>
            <strong>Project Looper</strong>
            <p>Build projects together.</p>
          </div>
          <nav class="footer-nav" aria-label="Footer">
            <button class="footer-link" data-action="navigate" data-view="about">About</button>
            <button class="footer-link" data-action="navigate" data-view="feedback">Feedback</button>
            <button class="footer-link" data-action="navigate" data-view="privacy">Privacy</button>
            <button class="footer-link" data-action="navigate" data-view="terms">Terms</button>
          </nav>
        </div>
        <div class="site-footer-meta">&copy; 2026 Project Looper</div>
      </footer>
    `;
  }

  function render() {
    syncDerivedState();

    const root = document.getElementById("app");
    if (!root) {
      return;
    }

    if (appState.isLoading) {
      root.innerHTML = `
        <div class="shell">
          <header class="hero">
            <div class="hero-topbar">
              <div class="brand-lockup">
                <div class="brand-mark" aria-hidden="true"></div>
                <div class="brand-text">
                  <h1>Project Looper</h1>
                  <span class="brand-kicker">Get in the Loop</span>
                </div>
              </div>
            </div>
            <div class="hero-bottom">
              <div class="hero-copy">
                <p>Loading live projects, groups, and updates...</p>
              </div>
            </div>
          </header>
        </div>
      `;
      return;
    }

    const sessionUser = currentUser();
    const homeRoute = sessionUser ? "home" : "landing";
    const flash = appState.flash
      ? `<div class="notice ${escapeHtml(appState.flash.type)}">${escapeHtml(appState.flash.message)}</div>`
      : "";

    root.innerHTML = `
      <div class="shell">
        <header class="hero">
          <div class="hero-topbar">
            <div class="brand-lockup">
              <div class="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 120 120" role="img" focusable="false">
                  <defs>
                    <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#b45c31" />
                      <stop offset="100%" stop-color="#2f7d57" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="10" width="100" height="100" rx="30" fill="#fff7ec" />
                  <path d="M33 86V34h24c15 0 25 9 25 22 0 14-10 23-25 23H45v7h42v10H33Zm12-18h12c8 0 13-4 13-12 0-7-5-11-13-11H45v23Z" fill="url(#loopGradient)" />
                  <path d="M76 34c10 4 18 14 18 28 0 22-15 36-38 36-7 0-15-2-22-6l5-9c5 3 11 5 17 5 15 0 26-9 26-24 0-8-3-14-9-18Z" fill="#24190f" opacity="0.12" />
                  <path d="M72 44c10 2 17 10 17 21 0 13-10 22-24 22H45" fill="none" stroke="#24190f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.14" />
                  <path d="M45 87V44h20c10 0 17 7 17 16s-7 16-17 16H45" fill="none" stroke="#fffdf8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M45 87V44h20c10 0 17 7 17 16s-7 16-17 16H45" fill="none" stroke="url(#loopGradient)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M45 44v43h31" fill="none" stroke="#24190f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="brand-text">
                <h1>Project Looper</h1>
                <span class="brand-kicker">Get in the Loop</span>
              </div>
            </div>
            <nav class="nav">
              <button class="pill ${appState.route.view === homeRoute ? "active" : ""}" data-action="navigate" data-view="${homeRoute}">Home</button>
              ${appState.sessionUserId ? `<button class="pill ${appState.route.view === "browse" ? "active" : ""}" data-action="navigate" data-view="browse">Browse</button>` : ""}
              ${appState.sessionUserId ? `<button class="pill ${appState.route.view === "communities" || appState.route.view === "community" ? "active" : ""}" data-action="navigate" data-view="communities">Communities</button>` : ""}
              ${appState.sessionUserId ? `<button class="pill ${appState.route.view === "messages" ? "active" : ""}" data-action="navigate" data-view="messages">Messages</button>` : ""}
              ${
                appState.sessionUserId
                  ? `<button class="pill account-pill ${appState.route.view === "account" ? "active" : ""}" data-action="navigate" data-view="account">
                      <span class="nav-avatar ${sessionUser?.profilePhoto ? "has-image" : ""}">
                        ${
                          sessionUser?.profilePhoto
                            ? `<img src="${escapeHtml(sessionUser.profilePhoto)}" alt="${escapeHtml(sessionUser.name)} profile photo" />`
                            : `<span>${escapeHtml(initialsForName(sessionUser?.name || "Account"))}</span>`
                        }
                      </span>
                      <span>Account</span>
                    </button>`
                  : ""
              }
              ${!appState.sessionUserId ? `<button class="primary-btn" data-action="navigate" data-view="auth">Log in / Sign up</button>` : ""}
            </nav>
          </div>
          <div class="hero-bottom">
            <div class="hero-copy">
              <p>Build passion projects, portfolio pieces, and creative ideas with people who want to make things together.</p>
            </div>
          </div>
        </header>

        ${flash}

        ${
          appState.route.view === "account"
            ? renderAccountPage()
            : appState.route.view === "landing"
              ? renderLandingPage()
            : appState.route.view === "auth"
              ? renderAuth()
            : `
              <div class="layout ${appState.route.view === "home" ? "home-layout" : ""} ${appState.route.view === "create" ? "create-layout" : ""} ${appState.route.view === "browse" ? "browse-layout" : ""} ${appState.route.view === "communities" ? "communities-layout" : ""} ${appState.route.view === "community" ? "community-route-layout" : ""} ${appState.route.view === "project" ? "project-route-layout" : ""} ${appState.route.view === "messages" ? "messages-route-layout" : ""}">
                ${appState.route.view === "project" ? renderProjectPage(appState.route.id) : appState.route.view === "community" ? renderCommunityPage(appState.route.id) : appState.route.view === "communities" ? renderCommunitiesPage() : appState.route.view === "messages" ? renderMessagesPage() : appState.route.view === "browse" ? renderBrowsePage() : appState.route.view === "home" ? renderHomeHub() : appState.route.view === "create" ? renderCreateProjectPage() : appState.route.view === "about" ? renderAboutPage() : appState.route.view === "feedback" ? renderFeedbackPage() : appState.route.view === "privacy" ? renderPrivacyPage() : appState.route.view === "terms" ? renderTermsPage() : renderLandingPage()}
                ${appState.route.view === "home" || appState.route.view === "browse" || appState.route.view === "communities" || appState.route.view === "community" || appState.route.view === "create" || appState.route.view === "project" || appState.route.view === "messages" ? "" : renderSidebar()}
              </div>
            `
        }

        ${renderFooter()}
        ${renderChatDock()}
        ${renderJoinRequestModal()}
        ${renderProfileEditorModal()}
        ${renderProjectEditorModal()}
        ${renderProjectTeamModal()}
      </div>
    `;

    if (appState.shouldScrollChatsToBottom) {
      requestAnimationFrame(scrollChatThreadsToBottom);
    }

    clearFlash();
  }

  function initialsForName(name) {
    return String(name || "")
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "PL";
  }
})();




