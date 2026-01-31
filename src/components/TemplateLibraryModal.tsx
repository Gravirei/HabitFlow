import { useState, useRef, useEffect } from 'react'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { TemplatePreviewModal } from './TemplatePreviewModal'
import type { TaskTemplate } from '@/types/taskTemplate'

// Default Template Library
export const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tmpl_meeting',
    name: 'Team Sync Meeting',
    description: 'Coordinate with your team on project updates and blockers',
    icon: 'groups',
    category: 'Work',
    color: 'bg-blue-500',
    isCustom: false,
    template: {
      title: 'Weekly Team Sync',
      description: 'Discuss progress, align on priorities, and resolve blockers with the team',
      priority: 'medium',
      status: 'todo',
      category: 'Work',
      tags: ['meeting', 'team'],
      subtasks: [
        { text: 'Create meeting agenda', completed: false },
        { text: 'Send calendar invite', completed: false },
        { text: 'Prepare presentation materials', completed: false },
        { text: 'Review previous meeting notes', completed: false },
      ],
      timeEstimate: 60,
    },
  },
  {
    id: 'tmpl_code_review',
    name: 'Pull Request Review',
    description: 'Ensure code quality by reviewing teammate submissions',
    icon: 'code',
    category: 'Work',
    color: 'bg-purple-500',
    isCustom: false,
    template: {
      title: 'Review Pull Request #',
      description: 'Analyze code changes for quality, security, and best practices',
      priority: 'high',
      status: 'todo',
      category: 'Work',
      tags: ['code', 'review', 'development'],
      subtasks: [
        { text: 'Check code style and conventions', completed: false },
        { text: 'Test functionality', completed: false },
        { text: 'Review test coverage', completed: false },
        { text: 'Provide constructive feedback', completed: false },
        { text: 'Approve or request changes', completed: false },
      ],
      timeEstimate: 45,
    },
  },
  {
    id: 'tmpl_blog_post',
    name: 'Content Writing',
    description: 'Create engaging articles to share knowledge or promote your brand',
    icon: 'article',
    category: 'Work',
    color: 'bg-green-500',
    isCustom: false,
    template: {
      title: 'Write Article: [Topic]',
      description: 'Research, write, and publish a comprehensive blog post on the topic',
      priority: 'medium',
      status: 'todo',
      category: 'Work',
      tags: ['writing', 'content', 'blog'],
      subtasks: [
        { text: 'Research topic', completed: false },
        { text: 'Create outline', completed: false },
        { text: 'Write first draft', completed: false },
        { text: 'Add images and media', completed: false },
        { text: 'Edit and proofread', completed: false },
        { text: 'Publish and promote', completed: false },
      ],
      timeEstimate: 180,
    },
  },
  {
    id: 'tmpl_workout',
    name: 'Fitness Training',
    description: 'Build strength and endurance with a structured exercise routine',
    icon: 'fitness_center',
    category: 'Personal',
    color: 'bg-red-500',
    isCustom: false,
    template: {
      title: 'Daily Workout',
      description: 'Complete cardio and strength training to stay fit and healthy',
      priority: 'high',
      status: 'todo',
      category: 'Personal',
      tags: ['health', 'fitness', 'exercise'],
      subtasks: [
        { text: 'Warm-up (5-10 mins)', completed: false },
        { text: 'Cardio exercises', completed: false },
        { text: 'Strength training', completed: false },
        { text: 'Cool down and stretching', completed: false },
      ],
      timeEstimate: 60,
      recurring: 'daily',
    },
  },
  {
    id: 'tmpl_grocery',
    name: 'Weekly Groceries',
    description: 'Stock up on fresh ingredients and household essentials',
    icon: 'shopping_cart',
    category: 'Personal',
    color: 'bg-orange-500',
    isCustom: false,
    template: {
      title: 'Grocery Run',
      description: 'Plan and purchase weekly food supplies and essentials',
      priority: 'medium',
      status: 'todo',
      category: 'Personal',
      tags: ['shopping', 'errands', 'food'],
      subtasks: [
        { text: 'Check pantry and fridge', completed: false },
        { text: 'Make shopping list', completed: false },
        { text: 'Buy vegetables and fruits', completed: false },
        { text: 'Buy proteins and dairy', completed: false },
        { text: 'Buy pantry staples', completed: false },
      ],
      timeEstimate: 90,
      recurring: 'weekly',
    },
  },
  {
    id: 'tmpl_study',
    name: 'Deep Learning Session',
    description: 'Master new concepts through focused, distraction-free study',
    icon: 'school',
    category: 'Personal',
    color: 'bg-indigo-500',
    isCustom: false,
    template: {
      title: 'Study: [Subject]',
      description: 'Engage in active learning with notes, exercises, and review',
      priority: 'high',
      status: 'todo',
      category: 'Personal',
      tags: ['learning', 'education', 'study'],
      subtasks: [
        { text: 'Review previous materials', completed: false },
        { text: 'Read new chapter/content', completed: false },
        { text: 'Take notes', completed: false },
        { text: 'Practice exercises', completed: false },
        { text: 'Review and summarize', completed: false },
      ],
      timeEstimate: 120,
    },
  },
  {
    id: 'tmpl_cleaning',
    name: 'Home Deep Clean',
    description: 'Maintain a tidy living space with thorough cleaning routines',
    icon: 'cleaning_services',
    category: 'Personal',
    color: 'bg-teal-500',
    isCustom: false,
    template: {
      title: 'Weekend House Cleaning',
      description: 'Deep clean all rooms and organize cluttered spaces',
      priority: 'low',
      status: 'todo',
      category: 'Personal',
      tags: ['cleaning', 'home', 'chores'],
      subtasks: [
        { text: 'Vacuum and mop floors', completed: false },
        { text: 'Clean kitchen', completed: false },
        { text: 'Clean bathrooms', completed: false },
        { text: 'Dust surfaces', completed: false },
        { text: 'Take out trash', completed: false },
      ],
      timeEstimate: 90,
      recurring: 'weekly',
    },
  },
  {
    id: 'tmpl_bug_fix',
    name: 'Critical Bug Resolution',
    description: 'Debug and patch urgent issues affecting production',
    icon: 'bug_report',
    category: 'Work',
    color: 'bg-red-600',
    isCustom: false,
    template: {
      title: 'Fix: [Bug Title]',
      description: 'Investigate root cause, implement fix, and verify the solution',
      priority: 'high',
      status: 'todo',
      category: 'Work',
      tags: ['bug', 'development', 'urgent'],
      subtasks: [
        { text: 'Reproduce the bug', completed: false },
        { text: 'Identify root cause', completed: false },
        { text: 'Write fix', completed: false },
        { text: 'Test the fix', completed: false },
        { text: 'Create pull request', completed: false },
      ],
      timeEstimate: 90,
    },
  },
  {
    id: 'tmpl_project_planning',
    name: 'Project Kickoff',
    description: 'Define scope, milestones, and resources for a new initiative',
    icon: 'account_tree',
    category: 'Work',
    color: 'bg-cyan-500',
    isCustom: false,
    template: {
      title: 'Plan: [Project Name]',
      description: 'Create comprehensive project roadmap with clear deliverables',
      priority: 'high',
      status: 'todo',
      category: 'Work',
      tags: ['planning', 'project', 'management'],
      subtasks: [
        { text: 'Define project goals', completed: false },
        { text: 'Identify stakeholders', completed: false },
        { text: 'Break down into tasks', completed: false },
        { text: 'Estimate timeline', completed: false },
        { text: 'Assign responsibilities', completed: false },
        { text: 'Create project documentation', completed: false },
      ],
      timeEstimate: 180,
    },
  },
  {
    id: 'tmpl_reading',
    name: 'Book Reading',
    description: 'Expand your knowledge with dedicated daily reading time',
    icon: 'menu_book',
    category: 'Personal',
    color: 'bg-amber-500',
    isCustom: false,
    template: {
      title: 'Read: [Book Title]',
      description: 'Immerse in a book chapter and capture key takeaways',
      priority: 'low',
      status: 'todo',
      category: 'Personal',
      tags: ['reading', 'learning', 'books'],
      subtasks: [
        { text: 'Find quiet space', completed: false },
        { text: 'Read chapter', completed: false },
        { text: 'Take notes on key insights', completed: false },
        { text: 'Reflect on learnings', completed: false },
      ],
      timeEstimate: 60,
      recurring: 'daily',
    },
  },
  {
    id: 'tmpl_email_inbox',
    name: 'Inbox Zero Sprint',
    description: 'Achieve a clean inbox by processing all pending emails',
    icon: 'mail',
    category: 'Work',
    color: 'bg-sky-500',
    isCustom: false,
    template: {
      title: 'Clear Email Inbox',
      description: 'Process, respond to, and organize all emails to reach inbox zero',
      priority: 'medium',
      status: 'todo',
      category: 'Work',
      tags: ['email', 'productivity', 'organization'],
      subtasks: [
        { text: 'Sort emails by priority', completed: false },
        { text: 'Respond to urgent emails', completed: false },
        { text: 'Archive or delete old emails', completed: false },
        { text: 'Unsubscribe from unwanted lists', completed: false },
        { text: 'Create folders and filters', completed: false },
      ],
      timeEstimate: 45,
      recurring: 'daily',
    },
  },
  {
    id: 'tmpl_social_media',
    name: 'Social Content Creation',
    description: 'Craft engaging posts to grow your online audience',
    icon: 'share',
    category: 'Work',
    color: 'bg-pink-500',
    isCustom: false,
    template: {
      title: 'Create Social Post: [Platform]',
      description: 'Design, write, and schedule captivating social media content',
      priority: 'medium',
      status: 'todo',
      category: 'Work',
      tags: ['social', 'marketing', 'content'],
      subtasks: [
        { text: 'Research trending topics', completed: false },
        { text: 'Create engaging caption', completed: false },
        { text: 'Design or select visuals', completed: false },
        { text: 'Schedule post', completed: false },
        { text: 'Engage with comments', completed: false },
      ],
      timeEstimate: 30,
    },
  },
  {
    id: 'tmpl_meal_prep',
    name: 'Sunday Meal Prep',
    description: 'Batch cook nutritious meals to save time during the week',
    icon: 'restaurant',
    category: 'Personal',
    color: 'bg-lime-500',
    isCustom: false,
    template: {
      title: 'Meal Prep Sunday',
      description: 'Plan menu, shop ingredients, and prepare meals for the week',
      priority: 'medium',
      status: 'todo',
      category: 'Personal',
      tags: ['cooking', 'health', 'food'],
      subtasks: [
        { text: 'Plan weekly menu', completed: false },
        { text: 'Make grocery list', completed: false },
        { text: 'Shop for ingredients', completed: false },
        { text: 'Prep vegetables', completed: false },
        { text: 'Cook main dishes', completed: false },
        { text: 'Portion into containers', completed: false },
      ],
      timeEstimate: 180,
      recurring: 'weekly',
    },
  },
  {
    id: 'tmpl_presentation',
    name: 'Slide Deck Creation',
    description: 'Build compelling presentations that captivate your audience',
    icon: 'slideshow',
    category: 'Work',
    color: 'bg-violet-500',
    isCustom: false,
    template: {
      title: 'Prepare: [Presentation Topic]',
      description: 'Design impactful slides with clear messaging and visuals',
      priority: 'high',
      status: 'todo',
      category: 'Work',
      tags: ['presentation', 'public speaking', 'slides'],
      subtasks: [
        { text: 'Define key message', completed: false },
        { text: 'Create outline', completed: false },
        { text: 'Design slides', completed: false },
        { text: 'Add data and visuals', completed: false },
        { text: 'Practice delivery', completed: false },
        { text: 'Prepare for Q&A', completed: false },
      ],
      timeEstimate: 240,
    },
  },
  {
    id: 'tmpl_meditation',
    name: 'Mindfulness Practice',
    description: 'Reduce stress and improve focus through guided meditation',
    icon: 'self_improvement',
    category: 'Personal',
    color: 'bg-purple-400',
    isCustom: false,
    template: {
      title: 'Morning Meditation',
      description: 'Center your mind with breathing exercises and body awareness',
      priority: 'medium',
      status: 'todo',
      category: 'Personal',
      tags: ['mindfulness', 'health', 'wellness'],
      subtasks: [
        { text: 'Find quiet space', completed: false },
        { text: 'Set timer (10-20 mins)', completed: false },
        { text: 'Focus on breathing', completed: false },
        { text: 'Practice body scan', completed: false },
        { text: 'Journal reflections', completed: false },
      ],
      timeEstimate: 20,
      recurring: 'daily',
    },
  },
  {
    id: 'tmpl_networking',
    name: 'Professional Outreach',
    description: 'Expand your network by connecting with industry professionals',
    icon: 'groups_2',
    category: 'Work',
    color: 'bg-emerald-500',
    isCustom: false,
    template: {
      title: 'Network Building Session',
      description: 'Strengthen professional relationships through meaningful connections',
      priority: 'low',
      status: 'todo',
      category: 'Work',
      tags: ['networking', 'career', 'relationships'],
      subtasks: [
        { text: 'Update LinkedIn profile', completed: false },
        { text: 'Reach out to 3 connections', completed: false },
        { text: 'Attend virtual/in-person event', completed: false },
        { text: 'Follow up with recent contacts', completed: false },
        { text: 'Share valuable content', completed: false },
      ],
      timeEstimate: 60,
      recurring: 'weekly',
    },
  },
  {
    id: 'tmpl_financial_review',
    name: 'Budget Check-In',
    description: 'Track spending and optimize your financial health monthly',
    icon: 'account_balance',
    category: 'Personal',
    color: 'bg-green-600',
    isCustom: false,
    template: {
      title: 'Monthly Finance Review',
      description: 'Analyze expenses, update budget, and plan for upcoming costs',
      priority: 'high',
      status: 'todo',
      category: 'Personal',
      tags: ['finance', 'budget', 'money'],
      subtasks: [
        { text: 'Review bank statements', completed: false },
        { text: 'Categorize expenses', completed: false },
        { text: 'Update budget spreadsheet', completed: false },
        { text: 'Pay bills', completed: false },
        { text: 'Review savings goals', completed: false },
        { text: 'Plan next month budget', completed: false },
      ],
      timeEstimate: 90,
      recurring: 'monthly',
    },
  },
  {
    id: 'tmpl_side_project',
    name: 'Passion Project',
    description: 'Dedicate time to creative work that fuels your interests',
    icon: 'lightbulb',
    category: 'Personal',
    color: 'bg-yellow-500',
    isCustom: false,
    template: {
      title: 'Work on: [Project Name]',
      description: 'Make progress on personal creative or technical projects',
      priority: 'medium',
      status: 'todo',
      category: 'Personal',
      tags: ['project', 'creativity', 'learning'],
      subtasks: [
        { text: 'Review project roadmap', completed: false },
        { text: 'Work on current milestone', completed: false },
        { text: 'Test new features', completed: false },
        { text: 'Document progress', completed: false },
        { text: 'Plan next steps', completed: false },
      ],
      timeEstimate: 120,
    },
  },
  {
    id: 'tmpl_car_maintenance',
    name: 'Vehicle Service',
    description: 'Keep your car running smoothly with regular checkups',
    icon: 'directions_car',
    category: 'Personal',
    color: 'bg-slate-500',
    isCustom: false,
    template: {
      title: 'Car Maintenance Checkup',
      description: 'Inspect fluids, tires, and overall vehicle condition',
      priority: 'medium',
      status: 'todo',
      category: 'Personal',
      tags: ['car', 'maintenance', 'errands'],
      subtasks: [
        { text: 'Check oil level', completed: false },
        { text: 'Inspect tire pressure', completed: false },
        { text: 'Clean interior and exterior', completed: false },
        { text: 'Check fluid levels', completed: false },
        { text: 'Schedule service if needed', completed: false },
      ],
      timeEstimate: 60,
      recurring: 'monthly',
    },
  },
  {
    id: 'tmpl_portfolio_update',
    name: 'Portfolio Refresh',
    description: 'Showcase your best work with an updated professional portfolio',
    icon: 'work',
    category: 'Work',
    color: 'bg-indigo-600',
    isCustom: false,
    template: {
      title: 'Update Professional Portfolio',
      description: 'Add recent projects, update skills, and refresh design',
      priority: 'low',
      status: 'todo',
      category: 'Work',
      tags: ['portfolio', 'career', 'showcase'],
      subtasks: [
        { text: 'Review current portfolio', completed: false },
        { text: 'Select recent projects', completed: false },
        { text: 'Write project descriptions', completed: false },
        { text: 'Update images/screenshots', completed: false },
        { text: 'Update skills section', completed: false },
        { text: 'Test all links', completed: false },
      ],
      timeEstimate: 150,
    },
  },
  // Health & Wellness Category
  {
    id: 'tmpl_therapy_session',
    name: 'Therapy Session Prep',
    description: 'Prepare for your mental health counseling appointment',
    icon: 'psychology',
    category: 'Health',
    color: 'bg-rose-500',
    isCustom: false,
    template: {
      title: 'Mental Health Check-In',
      description: 'Reflect on emotions and prepare discussion topics for therapy',
      priority: 'high',
      status: 'todo',
      category: 'Health',
      tags: ['mental health', 'therapy', 'wellness'],
      subtasks: [
        { text: 'Journal recent feelings and events', completed: false },
        { text: 'List topics to discuss', completed: false },
        { text: 'Review previous session notes', completed: false },
        { text: 'Set goals for this session', completed: false },
        { text: 'Prepare questions for therapist', completed: false },
      ],
      timeEstimate: 30,
      recurring: 'weekly',
    },
  },
  {
    id: 'tmpl_nutrition_plan',
    name: 'Weekly Nutrition Planning',
    description: 'Design a balanced meal plan to meet your dietary goals',
    icon: 'nutrition',
    category: 'Health',
    color: 'bg-green-500',
    isCustom: false,
    template: {
      title: 'Plan Healthy Meals',
      description: 'Create nutritious meal plan with macro tracking',
      priority: 'medium',
      status: 'todo',
      category: 'Health',
      tags: ['nutrition', 'meal planning', 'health'],
      subtasks: [
        { text: 'Calculate daily calorie needs', completed: false },
        { text: 'Plan breakfast options', completed: false },
        { text: 'Plan lunch and dinner meals', completed: false },
        { text: 'Prepare healthy snack list', completed: false },
        { text: 'Create grocery shopping list', completed: false },
        { text: 'Track macros and nutrients', completed: false },
      ],
      timeEstimate: 60,
      recurring: 'weekly',
    },
  },
  {
    id: 'tmpl_sleep_hygiene',
    name: 'Sleep Optimization Routine',
    description: 'Establish healthy sleep habits for better rest and recovery',
    icon: 'bedtime',
    category: 'Health',
    color: 'bg-indigo-400',
    isCustom: false,
    template: {
      title: 'Evening Wind-Down Routine',
      description: 'Follow steps to improve sleep quality and duration',
      priority: 'high',
      status: 'todo',
      category: 'Health',
      tags: ['sleep', 'wellness', 'routine'],
      subtasks: [
        { text: 'Dim lights 1 hour before bed', completed: false },
        { text: 'Turn off screens 30 mins before', completed: false },
        { text: 'Practice relaxation techniques', completed: false },
        { text: 'Prepare bedroom environment', completed: false },
        { text: 'Log sleep time and quality', completed: false },
      ],
      timeEstimate: 45,
      recurring: 'daily',
    },
  },
  {
    id: 'tmpl_doctor_visit',
    name: 'Medical Appointment Prep',
    description: 'Prepare thoroughly for your upcoming doctor visit',
    icon: 'local_hospital',
    category: 'Health',
    color: 'bg-red-400',
    isCustom: false,
    template: {
      title: 'Doctor Visit Preparation',
      description: 'Organize symptoms, questions, and medical information',
      priority: 'high',
      status: 'todo',
      category: 'Health',
      tags: ['medical', 'health', 'appointment'],
      subtasks: [
        { text: 'List current symptoms and concerns', completed: false },
        { text: 'Update medication list', completed: false },
        { text: 'Prepare questions for doctor', completed: false },
        { text: 'Bring medical records if needed', completed: false },
        { text: 'Check insurance coverage', completed: false },
        { text: 'Note any allergies or reactions', completed: false },
      ],
      timeEstimate: 30,
    },
  },
  {
    id: 'tmpl_yoga_practice',
    name: 'Yoga & Stretching Session',
    description: 'Improve flexibility and reduce stress through yoga',
    icon: 'spa',
    category: 'Health',
    color: 'bg-teal-400',
    isCustom: false,
    template: {
      title: 'Daily Yoga Practice',
      description: 'Complete yoga sequence for mind-body wellness',
      priority: 'medium',
      status: 'todo',
      category: 'Health',
      tags: ['yoga', 'flexibility', 'wellness'],
      subtasks: [
        { text: 'Set up yoga space', completed: false },
        { text: 'Warm-up stretches (5 mins)', completed: false },
        { text: 'Sun salutations sequence', completed: false },
        { text: 'Core strengthening poses', completed: false },
        { text: 'Cool down and savasana', completed: false },
        { text: 'Breathing exercises', completed: false },
      ],
      timeEstimate: 45,
      recurring: 'daily',
    },
  },
  // Creative Category
  {
    id: 'tmpl_digital_art',
    name: 'Digital Artwork Creation',
    description: 'Design original digital illustrations and artwork',
    icon: 'palette',
    category: 'Creative',
    color: 'bg-fuchsia-500',
    isCustom: false,
    template: {
      title: 'Create Digital Art Piece',
      description: 'Conceptualize and execute original digital artwork',
      priority: 'medium',
      status: 'todo',
      category: 'Creative',
      tags: ['art', 'design', 'illustration'],
      subtasks: [
        { text: 'Brainstorm concept and theme', completed: false },
        { text: 'Create rough sketches', completed: false },
        { text: 'Set up canvas and layers', completed: false },
        { text: 'Apply colors and shading', completed: false },
        { text: 'Add details and effects', completed: false },
        { text: 'Export and share artwork', completed: false },
      ],
      timeEstimate: 180,
    },
  },
  {
    id: 'tmpl_music_composition',
    name: 'Music Production Session',
    description: 'Compose and produce original music tracks',
    icon: 'music_note',
    category: 'Creative',
    color: 'bg-purple-500',
    isCustom: false,
    template: {
      title: 'Create New Music Track',
      description: 'Write, record, and produce original music composition',
      priority: 'medium',
      status: 'todo',
      category: 'Creative',
      tags: ['music', 'composition', 'production'],
      subtasks: [
        { text: 'Create chord progression', completed: false },
        { text: 'Write melody and harmony', completed: false },
        { text: 'Record instruments/vocals', completed: false },
        { text: 'Mix and balance levels', completed: false },
        { text: 'Master final track', completed: false },
        { text: 'Export and share', completed: false },
      ],
      timeEstimate: 240,
    },
  },
  {
    id: 'tmpl_photography',
    name: 'Photo Shoot Planning',
    description: 'Plan and execute a professional photography session',
    icon: 'photo_camera',
    category: 'Creative',
    color: 'bg-cyan-500',
    isCustom: false,
    template: {
      title: 'Photography Session',
      description: 'Organize location, equipment, and creative direction',
      priority: 'high',
      status: 'todo',
      category: 'Creative',
      tags: ['photography', 'creative', 'visual'],
      subtasks: [
        { text: 'Scout and plan location', completed: false },
        { text: 'Prepare equipment checklist', completed: false },
        { text: 'Plan shot list and compositions', completed: false },
        { text: 'Conduct photo shoot', completed: false },
        { text: 'Cull and select best shots', completed: false },
        { text: 'Edit and retouch photos', completed: false },
      ],
      timeEstimate: 180,
    },
  },
  {
    id: 'tmpl_creative_writing',
    name: 'Creative Writing Session',
    description: 'Write fiction, poetry, or creative non-fiction pieces',
    icon: 'edit_note',
    category: 'Creative',
    color: 'bg-amber-600',
    isCustom: false,
    template: {
      title: 'Writing: [Story/Poem Title]',
      description: 'Develop characters, plot, and narrative for creative work',
      priority: 'medium',
      status: 'todo',
      category: 'Creative',
      tags: ['writing', 'creative', 'storytelling'],
      subtasks: [
        { text: 'Brainstorm ideas and themes', completed: false },
        { text: 'Develop characters or structure', completed: false },
        { text: 'Write first draft', completed: false },
        { text: 'Revise and refine', completed: false },
        { text: 'Proofread and edit', completed: false },
        { text: 'Share or publish', completed: false },
      ],
      timeEstimate: 120,
    },
  },
  {
    id: 'tmpl_video_editing',
    name: 'Video Editing Project',
    description: 'Edit and produce engaging video content',
    icon: 'videocam',
    category: 'Creative',
    color: 'bg-pink-600',
    isCustom: false,
    template: {
      title: 'Edit Video: [Project Name]',
      description: 'Cut, arrange, and enhance video footage',
      priority: 'high',
      status: 'todo',
      category: 'Creative',
      tags: ['video', 'editing', 'production'],
      subtasks: [
        { text: 'Import and organize footage', completed: false },
        { text: 'Create rough cut sequence', completed: false },
        { text: 'Add transitions and effects', completed: false },
        { text: 'Color grade footage', completed: false },
        { text: 'Add music and sound effects', completed: false },
        { text: 'Export final video', completed: false },
      ],
      timeEstimate: 180,
    },
  },
  // Learning & Development Category
  {
    id: 'tmpl_online_course',
    name: 'Online Course Module',
    description: 'Complete lessons and assignments from online courses',
    icon: 'laptop_chromebook',
    category: 'Learning',
    color: 'bg-blue-600',
    isCustom: false,
    template: {
      title: 'Course: [Course Name] - Module X',
      description: 'Watch lectures, take notes, and complete assignments',
      priority: 'high',
      status: 'todo',
      category: 'Learning',
      tags: ['learning', 'course', 'education'],
      subtasks: [
        { text: 'Watch video lectures', completed: false },
        { text: 'Take detailed notes', completed: false },
        { text: 'Complete practice exercises', completed: false },
        { text: 'Work on assignments', completed: false },
        { text: 'Participate in discussions', completed: false },
        { text: 'Review and summarize', completed: false },
      ],
      timeEstimate: 150,
    },
  },
  {
    id: 'tmpl_language_learning',
    name: 'Language Practice Session',
    description: 'Practice speaking, reading, and writing in a new language',
    icon: 'translate',
    category: 'Learning',
    color: 'bg-emerald-600',
    isCustom: false,
    template: {
      title: 'Learn [Language] - Daily Practice',
      description: 'Build fluency through structured language exercises',
      priority: 'high',
      status: 'todo',
      category: 'Learning',
      tags: ['language', 'learning', 'practice'],
      subtasks: [
        { text: 'Review vocabulary flashcards', completed: false },
        { text: 'Complete grammar exercises', completed: false },
        { text: 'Practice speaking with app/partner', completed: false },
        { text: 'Read article in target language', completed: false },
        { text: 'Write short paragraph', completed: false },
        { text: 'Listen to native content', completed: false },
      ],
      timeEstimate: 60,
      recurring: 'daily',
    },
  },
  {
    id: 'tmpl_skill_practice',
    name: 'Skill Development Practice',
    description: 'Dedicate time to deliberate practice of a specific skill',
    icon: 'workspace_premium',
    category: 'Learning',
    color: 'bg-yellow-600',
    isCustom: false,
    template: {
      title: 'Practice: [Skill Name]',
      description: 'Focus on improving specific skill through targeted practice',
      priority: 'medium',
      status: 'todo',
      category: 'Learning',
      tags: ['practice', 'skill', 'improvement'],
      subtasks: [
        { text: 'Review technique fundamentals', completed: false },
        { text: 'Warm-up exercises', completed: false },
        { text: 'Practice challenging elements', completed: false },
        { text: 'Record progress', completed: false },
        { text: 'Seek feedback', completed: false },
        { text: 'Plan next practice session', completed: false },
      ],
      timeEstimate: 90,
    },
  },
  {
    id: 'tmpl_certification_prep',
    name: 'Certification Exam Prep',
    description: 'Study and prepare for professional certification exams',
    icon: 'verified',
    category: 'Learning',
    color: 'bg-violet-600',
    isCustom: false,
    template: {
      title: 'Study for [Certification Name]',
      description: 'Systematic preparation for certification examination',
      priority: 'high',
      status: 'todo',
      category: 'Learning',
      tags: ['certification', 'exam', 'professional'],
      subtasks: [
        { text: 'Review exam objectives', completed: false },
        { text: 'Study chapter materials', completed: false },
        { text: 'Complete practice questions', completed: false },
        { text: 'Watch training videos', completed: false },
        { text: 'Take practice exam', completed: false },
        { text: 'Review weak areas', completed: false },
      ],
      timeEstimate: 180,
    },
  },
  {
    id: 'tmpl_research_paper',
    name: 'Academic Research Session',
    description: 'Conduct research and write scholarly papers',
    icon: 'science',
    category: 'Learning',
    color: 'bg-slate-600',
    isCustom: false,
    template: {
      title: 'Research: [Topic]',
      description: 'Gather sources, analyze data, and write academic paper',
      priority: 'high',
      status: 'todo',
      category: 'Learning',
      tags: ['research', 'academic', 'writing'],
      subtasks: [
        { text: 'Define research question', completed: false },
        { text: 'Review literature sources', completed: false },
        { text: 'Collect and analyze data', completed: false },
        { text: 'Create outline', completed: false },
        { text: 'Write draft sections', completed: false },
        { text: 'Cite sources properly', completed: false },
        { text: 'Review and revise', completed: false },
      ],
      timeEstimate: 240,
    },
  },
]

function LibraryTemplateCard({ 
  template, 
  onClick 
}: { 
  template: TaskTemplate
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col text-left h-full min-h-[180px] p-6 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:border-white/40 dark:hover:border-white/10 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Background Gradient Mesh */}
      <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${template.color.replace('bg-', 'bg-')}`}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${template.color} flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <span className="material-symbols-outlined text-2xl">{template.icon}</span>
          </div>
        </div>

        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {template.name || '(No name)'}
        </h4>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {template.description || '(No description)'}
        </p>

        <div className="mt-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
            <span className="material-symbols-outlined text-[14px] text-gray-400">
              {template.category === 'Work' ? 'business_center' : template.category === 'Personal' ? 'person' : template.category === 'Health' ? 'favorite' : template.category === 'Creative' ? 'palette' : 'school'}
            </span>
            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
              {template.category}
            </span>
          </div>

          {template.template.priority && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200/50 dark:border-white/5 ${
              template.template.priority === 'high' ? 'bg-red-50 dark:bg-red-500/10' :
              template.template.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-500/10' :
              'bg-green-50 dark:bg-green-500/10'
            }`}>
              <span className={`material-symbols-outlined text-[14px] ${
                template.template.priority === 'high' ? 'text-red-500' :
                template.template.priority === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`}>flag</span>
              <span className={`text-[11px] font-medium capitalize ${
                template.template.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                template.template.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {template.template.priority}
              </span>
            </div>
          )}
          
          {template.template.timeEstimate && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
              <span className="material-symbols-outlined text-[14px] text-gray-400">schedule</span>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                {template.template.timeEstimate}m
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

interface TemplateLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveToMyTemplates?: (template: TaskTemplate) => void
}

export function TemplateLibraryModal({
  isOpen,
  onClose,
  onSaveToMyTemplates,
}: TemplateLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'work' | 'personal' | 'health' | 'creative' | 'learning'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Update sliding indicator position when category changes or modal opens
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = categoryRefs.current[selectedCategory]
      if (activeButton) {
        const container = activeButton.parentElement
        if (container) {
          const containerRect = container.getBoundingClientRect()
          const buttonRect = activeButton.getBoundingClientRect()
          setIndicatorStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
          })
        }
      }
    }

    // Update immediately
    updateIndicator()

    // Also update after a short delay to ensure layout is ready
    const timer = setTimeout(updateIndicator, 100)

    return () => clearTimeout(timer)
  }, [selectedCategory, isOpen])

  const filteredTemplates = DEFAULT_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = (template: TaskTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  return (
    <>
      <AccessibleModal
        isOpen={isOpen}
        onClose={onClose}
        title="Template Store"
        className="!bg-transparent !shadow-none !border-0 p-0 overflow-visible"
        maxWidth="max-w-[90rem]"
      >
        <div className="flex flex-col h-[90vh] md:h-[50rem] w-full bg-white/95 dark:bg-gray-950/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden ring-1 ring-black/5 relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Header */}
          <div className="p-8 pb-6 border-b border-gray-200/50 dark:border-white/5 relative z-10 backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-black/5">
                  <span className="material-symbols-outlined text-white text-2xl">store</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">Template Store</h2>
                  <p className="text-sm text-gray-500 font-medium">Browse and save professional templates</p>
                </div>
              </div>

              {/* Right side: Search, Filters, Close */}
              <div className="flex items-center gap-2">
                {/* Search with expandable pill input */}
                <div ref={searchRef} className="relative flex items-center">
                  {!isSearchOpen && (
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500 relative z-10"
                      aria-label="Search"
                    >
                      <span className="material-symbols-outlined text-xl font-bold">search</span>
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`h-10 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:rounded-full transition-all duration-300 ease-out absolute right-0 ${
                      isSearchOpen ? 'w-64 opacity-100' : 'w-10 opacity-0 pointer-events-none'
                    }`}
                    autoFocus={isSearchOpen}
                  />
                  {isSearchOpen && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className="flex size-8 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150 text-gray-400 dark:text-gray-500 absolute right-1 z-10"
                      aria-label="Close search"
                    >
                      <span className="material-symbols-outlined text-lg font-bold">close</span>
                    </button>
                  )}
                </div>

                {/* Category Filters with Sliding Background */}
                <div className="relative flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/30 p-1 rounded-2xl">
                  {/* Sliding background indicator */}
                  <div
                    className="absolute bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300 ease-out"
                    style={{
                      left: `${indicatorStyle.left}px`,
                      width: `${indicatorStyle.width}px`,
                      height: 'calc(100% - 8px)',
                      top: '4px',
                    }}
                  />
                  
                  {[
                    { id: 'all', label: 'All', icon: 'grid_view' },
                    { id: 'work', label: 'Work', icon: 'business_center' },
                    { id: 'personal', label: 'Personal', icon: 'person' },
                    { id: 'health', label: 'Health', icon: 'favorite' },
                    { id: 'creative', label: 'Creative', icon: 'palette' },
                    { id: 'learning', label: 'Learning', icon: 'school' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      ref={(el) => (categoryRefs.current[cat.id] = el)}
                      onClick={() => setSelectedCategory(cat.id as 'all' | 'work' | 'personal' | 'health' | 'creative' | 'learning')}
                      className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={onClose}
                  className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-150 text-gray-400 dark:text-gray-500"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-xl font-bold">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
                <p className="text-gray-500">Try adjusting your search for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
                {filteredTemplates.map((template) => (
                  <LibraryTemplateCard 
                    key={template.id} 
                    template={template} 
                    onClick={() => handleTemplateClick(template)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </AccessibleModal>

      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={previewTemplate}
        onUseAsTemplate={() => {
          setIsPreviewOpen(false)
          onClose()
        }}
        onSaveAsTask={() => {
          setIsPreviewOpen(false)
          onClose()
        }}
        onSaveToMyTemplates={onSaveToMyTemplates}
      />
    </>
  )
}
