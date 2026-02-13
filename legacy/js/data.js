/**
 * AI Comply — Shared Data Layer
 * Client-side data store using localStorage
 * @module AIComplyData
 */
var AIComplyData = (function () {
  'use strict';

  var KEYS = {
    systems: 'aicomply_systems',
    activity: 'aicomply_activity',
    checklist: 'aicomply_checklist',
    assessments: 'aicomply_assessments',
    wizardStep: 'aicomply_wizard_step',
    wizardForm: 'aicomply_assessment_form',
    notifications: 'aicomply_notifications',
    team: 'aicomply_team',
    exports: 'aicomply_exports'
  };

  /* ========== Default Seed Data ========== */

  var DEFAULT_SYSTEMS = [
    {
      id: 'sys-1', name: 'HR Screening Tool', version: 'v2.1', domain: 'hr',
      riskLevel: 'high', purpose: 'Automated CV screening & candidate ranking',
      status: 'in-progress', compliance: 55, lastReviewed: '2026-01-12',
      provider: 'Internal', deploymentDate: '2025-06-15',
      description: 'Machine learning system that screens job applications, ranks candidates based on qualifications, experience and skills matching. Used across all recruitment processes.',
      scores: { riskManagement: 90, dataGovernance: 78, transparency: 45, humanOversight: 20, technicalDocs: 42 }
    },
    {
      id: 'sys-2', name: 'Loan Approval Model', version: 'v1.4', domain: 'credit',
      riskLevel: 'high', purpose: 'Credit risk assessment for loan applications',
      status: 'non-compliant', compliance: 35, lastReviewed: '2025-12-28',
      provider: 'FinTech Solutions Ltd', deploymentDate: '2025-03-20',
      description: 'Predictive model that assesses credit risk for consumer loan applications. Evaluates income, employment history, credit score and transaction patterns.',
      scores: { riskManagement: 60, dataGovernance: 40, transparency: 25, humanOversight: 15, technicalDocs: 35 }
    },
    {
      id: 'sys-3', name: 'Customer Chatbot', version: 'v3.0', domain: 'customer',
      riskLevel: 'limited', purpose: 'Customer service conversational agent',
      status: 'compliant', compliance: 92, lastReviewed: '2026-02-05',
      provider: 'ChatCorp AI', deploymentDate: '2024-11-01',
      description: 'Natural language processing chatbot handling first-line customer support inquiries. Escalates complex issues to human agents.',
      scores: { riskManagement: 95, dataGovernance: 90, transparency: 92, humanOversight: 88, technicalDocs: 95 }
    },
    {
      id: 'sys-4', name: 'Inventory Forecaster', version: 'v2.0', domain: 'operations',
      riskLevel: 'minimal', purpose: 'Demand prediction for stock management',
      status: 'compliant', compliance: 100, lastReviewed: '2026-02-01',
      provider: 'Internal', deploymentDate: '2025-01-10',
      description: 'Time-series forecasting model predicting product demand for inventory optimization. Uses historical sales data, seasonality and external factors.',
      scores: { riskManagement: 100, dataGovernance: 100, transparency: 100, humanOversight: 100, technicalDocs: 100 }
    },
    {
      id: 'sys-5', name: 'Email Spam Filter', version: 'v5.2', domain: 'operations',
      riskLevel: 'minimal', purpose: 'Automated email classification',
      status: 'compliant', compliance: 100, lastReviewed: '2026-01-20',
      provider: 'MailGuard Inc', deploymentDate: '2023-08-15',
      description: 'Email classification system that identifies spam, phishing attempts and malicious attachments. Operates on all inbound email traffic.',
      scores: { riskManagement: 100, dataGovernance: 100, transparency: 100, humanOversight: 100, technicalDocs: 100 }
    },
    {
      id: 'sys-6', name: 'Fraud Detection Engine', version: 'v1.8', domain: 'operations',
      riskLevel: 'limited', purpose: 'Transaction anomaly detection',
      status: 'in-progress', compliance: 70, lastReviewed: '2026-02-08',
      provider: 'SecureAI', deploymentDate: '2025-04-01',
      description: 'Real-time transaction monitoring system that flags suspicious patterns and potential fraud. Analyses transaction amounts, frequencies and geographical patterns.',
      scores: { riskManagement: 85, dataGovernance: 75, transparency: 65, humanOversight: 55, technicalDocs: 70 }
    }
  ];

  var DEFAULT_ACTIVITY = [
    { id: 'act-1', type: 'success', title: 'Risk assessment completed', detail: 'for Customer Chatbot AI', time: '2 hours ago', timestamp: Date.now() - 7200000 },
    { id: 'act-2', type: 'info', title: 'Documentation updated', detail: '\u2014 Technical docs for HR Screening Tool v2.1', time: 'Yesterday, 16:30', timestamp: Date.now() - 86400000 },
    { id: 'act-3', type: 'warning', title: 'New finding', detail: '\u2014 Bias monitoring missing for Loan Approval Model', time: '2 days ago', timestamp: Date.now() - 172800000 },
    { id: 'act-4', type: 'success', title: 'System registered', detail: '\u2014 Inventory Forecaster added to EU database', time: '3 days ago', timestamp: Date.now() - 259200000 },
    { id: 'act-5', type: 'danger', title: 'Compliance gap', detail: '\u2014 Human oversight controls insufficient for HR Screening Tool', time: '5 days ago', timestamp: Date.now() - 432000000 }
  ];

  var DEFAULT_NOTIFICATIONS = [
    { id: 'notif-1', title: 'High-Risk Deadline Approaching', message: 'Full compliance for high-risk AI systems required by 2 Aug 2026. 2 systems need attention.', read: false, time: '1 hour ago', type: 'warning' },
    { id: 'notif-2', title: 'Assessment Updated', message: 'HR Screening Tool assessment moved to Step 3: Obligations.', read: false, time: '3 hours ago', type: 'info' },
    { id: 'notif-3', title: 'New Test Report Available', message: 'AI Test 1 report generated for HR Screening Tool v2.1.', read: true, time: 'Yesterday', type: 'success' },
    { id: 'notif-4', title: 'Compliance Gap Detected', message: 'Loan Approval Model dropped below 40% compliance threshold.', read: false, time: '2 days ago', type: 'danger' }
  ];

  var DEFAULT_TEAM = [
    { id: 'team-1', name: 'Jane Doe', email: 'jane.doe@company.com', role: 'Compliance Officer', avatar: 'JD', permissions: 'admin', assignedSystems: 'All Systems', lastActive: '2026-02-12' },
    { id: 'team-2', name: 'Marcus Chen', email: 'marcus.chen@company.com', role: 'AI Engineer', avatar: 'MC', permissions: 'editor', assignedSystems: 'HR Screening Tool, Loan Approval Model', lastActive: '2026-02-11' },
    { id: 'team-3', name: 'Sarah Williams', email: 'sarah.w@company.com', role: 'Data Protection Officer', avatar: 'SW', permissions: 'editor', assignedSystems: 'All Systems', lastActive: '2026-02-10' },
    { id: 'team-4', name: 'Tom Baker', email: 'tom.baker@company.com', role: 'Legal Counsel', avatar: 'TB', permissions: 'viewer', assignedSystems: 'Loan Approval Model', lastActive: '2026-02-09' },
    { id: 'team-5', name: 'Priya Patel', email: 'priya.p@company.com', role: 'ML Operations Lead', avatar: 'PP', permissions: 'editor', assignedSystems: 'Customer Chatbot, Inventory Forecaster', lastActive: '2026-02-12' }
  ];

  var DEFAULT_CHECKLIST = [true, true, true, true, true, true, true, true, false, false, false, false];

  /* ========== Helpers ========== */

  function getOrInit(key, defaultVal) {
    var stored = localStorage.getItem(key);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* corrupt */ }
    }
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return JSON.parse(JSON.stringify(defaultVal));
  }

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function generateId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }

  function relativeTime(timestamp) {
    var diff = Date.now() - timestamp;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    return formatDate(new Date(timestamp).toISOString().slice(0, 10));
  }

  function formatDate(dateStr) {
    if (!dateStr) return '\u2014';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ========== Public API ========== */

  return {

    /* --- Systems --- */
    getSystems: function () {
      return getOrInit(KEYS.systems, DEFAULT_SYSTEMS);
    },
    getSystem: function (id) {
      var systems = this.getSystems();
      for (var i = 0; i < systems.length; i++) {
        if (systems[i].id === id) return systems[i];
      }
      return null;
    },
    addSystem: function (system) {
      var systems = this.getSystems();
      system.id = generateId('sys');
      system.lastReviewed = new Date().toISOString().slice(0, 10);
      if (!system.scores) {
        system.scores = { riskManagement: 0, dataGovernance: 0, transparency: 0, humanOversight: 0, technicalDocs: 0 };
      }
      systems.push(system);
      save(KEYS.systems, systems);
      this.addActivity({ type: 'success', title: 'System registered', detail: '\u2014 ' + system.name + ' added to registry' });
      this.addNotification({ title: 'New System Registered', message: system.name + ' has been added to the AI Systems Registry.', type: 'success' });
      return system;
    },
    updateSystem: function (id, updates) {
      var systems = this.getSystems();
      for (var i = 0; i < systems.length; i++) {
        if (systems[i].id === id) {
          for (var key in updates) {
            if (updates.hasOwnProperty(key)) systems[i][key] = updates[key];
          }
          systems[i].lastReviewed = new Date().toISOString().slice(0, 10);
          save(KEYS.systems, systems);
          this.addActivity({ type: 'info', title: 'System updated', detail: '\u2014 ' + systems[i].name });
          return systems[i];
        }
      }
      return null;
    },
    deleteSystem: function (id) {
      var systems = this.getSystems();
      var name = '';
      var filtered = systems.filter(function (s) {
        if (s.id === id) name = s.name;
        return s.id !== id;
      });
      save(KEYS.systems, filtered);
      if (name) this.addActivity({ type: 'danger', title: 'System removed', detail: '\u2014 ' + name + ' deleted from registry' });
    },

    /* --- Activity --- */
    getActivity: function () {
      return getOrInit(KEYS.activity, DEFAULT_ACTIVITY);
    },
    addActivity: function (entry) {
      var activity = this.getActivity();
      entry.id = generateId('act');
      entry.timestamp = Date.now();
      entry.time = 'Just now';
      activity.unshift(entry);
      if (activity.length > 100) activity = activity.slice(0, 100);
      save(KEYS.activity, activity);
      return entry;
    },

    /* --- Checklist --- */
    getChecklist: function () {
      return getOrInit(KEYS.checklist, DEFAULT_CHECKLIST);
    },
    saveChecklist: function (states) {
      save(KEYS.checklist, states);
    },

    /* --- Notifications --- */
    getNotifications: function () {
      return getOrInit(KEYS.notifications, DEFAULT_NOTIFICATIONS);
    },
    addNotification: function (notif) {
      var notifs = this.getNotifications();
      notif.id = generateId('notif');
      notif.read = false;
      notif.time = 'Just now';
      notifs.unshift(notif);
      if (notifs.length > 50) notifs = notifs.slice(0, 50);
      save(KEYS.notifications, notifs);
    },
    markNotificationRead: function (id) {
      var notifs = this.getNotifications();
      for (var i = 0; i < notifs.length; i++) {
        if (notifs[i].id === id) notifs[i].read = true;
      }
      save(KEYS.notifications, notifs);
    },
    markAllNotificationsRead: function () {
      var notifs = this.getNotifications();
      notifs.forEach(function (n) { n.read = true; });
      save(KEYS.notifications, notifs);
    },
    getUnreadCount: function () {
      return this.getNotifications().filter(function (n) { return !n.read; }).length;
    },

    /* --- Team --- */
    getTeam: function () {
      return getOrInit(KEYS.team, DEFAULT_TEAM);
    },
    addTeamMember: function (member) {
      var team = this.getTeam();
      member.id = generateId('team');
      member.lastActive = new Date().toISOString().slice(0, 10);
      member.avatar = member.name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
      team.push(member);
      save(KEYS.team, team);
      this.addActivity({ type: 'info', title: 'Team member added', detail: '\u2014 ' + member.name + ' (' + member.role + ')' });
      return member;
    },
    updateTeamMember: function (id, updates) {
      var team = this.getTeam();
      for (var i = 0; i < team.length; i++) {
        if (team[i].id === id) {
          for (var key in updates) {
            if (updates.hasOwnProperty(key)) team[i][key] = updates[key];
          }
          save(KEYS.team, team);
          return team[i];
        }
      }
      return null;
    },
    removeTeamMember: function (id) {
      var team = this.getTeam();
      var filtered = team.filter(function (m) { return m.id !== id; });
      save(KEYS.team, filtered);
    },

    /* --- Assessments --- */
    getAssessments: function () {
      return getOrInit(KEYS.assessments, []);
    },
    addAssessment: function (assessment) {
      var assessments = this.getAssessments();
      assessment.id = generateId('asmt');
      assessment.date = new Date().toISOString();
      assessments.unshift(assessment);
      save(KEYS.assessments, assessments);
      this.addActivity({ type: 'success', title: 'Assessment completed', detail: '\u2014 ' + (assessment.systemName || 'New system') + ' classified as ' + (assessment.riskLevel || 'unknown') });
      return assessment;
    },

    /* --- Wizard state --- */
    getWizardStep: function () {
      var s = localStorage.getItem(KEYS.wizardStep);
      return s ? parseInt(s, 10) : 1;
    },
    setWizardStep: function (step) {
      localStorage.setItem(KEYS.wizardStep, String(step));
    },
    getWizardForm: function () {
      var s = localStorage.getItem(KEYS.wizardForm);
      try { return s ? JSON.parse(s) : {}; } catch (e) { return {}; }
    },
    setWizardForm: function (data) {
      save(KEYS.wizardForm, data);
    },

    /* --- Exports log --- */
    getExports: function () {
      return getOrInit(KEYS.exports, []);
    },
    addExport: function (entry) {
      var exports = this.getExports();
      entry.id = generateId('exp');
      entry.date = new Date().toISOString();
      exports.unshift(entry);
      save(KEYS.exports, exports);
      return entry;
    },

    /* --- Computed Stats --- */
    getStats: function () {
      var systems = this.getSystems();
      var total = systems.length;
      var highRisk = systems.filter(function (s) { return s.riskLevel === 'high'; }).length;
      var openFindings = 0;
      systems.forEach(function (s) {
        if (s.compliance < 100) openFindings += Math.max(1, Math.ceil((100 - s.compliance) / 15));
      });
      var avgCompliance = total > 0 ? Math.round(systems.reduce(function (sum, s) { return sum + s.compliance; }, 0) / total) : 0;
      return {
        totalSystems: total,
        highRiskSystems: highRisk,
        avgCompliance: avgCompliance,
        openFindings: openFindings
      };
    },

    getComplianceScores: function () {
      var systems = this.getSystems();
      var scored = systems.filter(function (s) { return s.scores; });
      if (scored.length === 0) return { riskManagement: 0, dataGovernance: 0, transparency: 0, humanOversight: 0, technicalDocs: 0, overall: 0 };
      var totals = { riskManagement: 0, dataGovernance: 0, transparency: 0, humanOversight: 0, technicalDocs: 0 };
      scored.forEach(function (s) {
        totals.riskManagement += s.scores.riskManagement;
        totals.dataGovernance += s.scores.dataGovernance;
        totals.transparency += s.scores.transparency;
        totals.humanOversight += s.scores.humanOversight;
        totals.technicalDocs += s.scores.technicalDocs;
      });
      var n = scored.length;
      var result = {
        riskManagement: Math.round(totals.riskManagement / n),
        dataGovernance: Math.round(totals.dataGovernance / n),
        transparency: Math.round(totals.transparency / n),
        humanOversight: Math.round(totals.humanOversight / n),
        technicalDocs: Math.round(totals.technicalDocs / n)
      };
      result.overall = Math.round((result.riskManagement + result.dataGovernance + result.transparency + result.humanOversight + result.technicalDocs) / 5);
      return result;
    },

    /* --- Utility formatters --- */
    formatDate: formatDate,
    relativeTime: relativeTime,

    riskLevelLabel: function (level) {
      return { high: 'High Risk', limited: 'Limited Risk', minimal: 'Minimal Risk', unacceptable: 'Unacceptable' }[level] || level;
    },
    riskBadgeClass: function (level) {
      return 'badge-risk-' + level;
    },
    statusLabel: function (status) {
      return { 'compliant': 'Compliant', 'in-progress': 'In Progress', 'non-compliant': 'Non-Compliant' }[status] || status;
    },
    statusBadgeClass: function (status) {
      return { 'compliant': 'badge-success', 'in-progress': 'badge-warning', 'non-compliant': 'badge-danger' }[status] || 'badge-neutral';
    },
    complianceColor: function (pct) {
      if (pct >= 90) return 'green';
      if (pct >= 70) return 'blue';
      if (pct >= 50) return 'orange';
      return 'red';
    },
    domainLabel: function (domain) {
      return {
        hr: 'Human Resources', credit: 'Financial Services', education: 'Education',
        law: 'Law Enforcement', migration: 'Migration & Border', critical: 'Critical Infrastructure',
        healthcare: 'Healthcare', biometric: 'Biometrics', customer: 'Customer Service',
        marketing: 'Marketing', operations: 'Operations', other: 'Other'
      }[domain] || domain;
    },

    /* --- Reset --- */
    resetAll: function () {
      Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); });
    }
  };
})();
