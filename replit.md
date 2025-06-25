# EduEase LMS - Project Documentation

## Overview
EduEase is a comprehensive Learning Management System (LMS) with multi-tenant architecture, built on Node.js/Express with PostgreSQL and React. The platform features role-based access control with a 4-tier system (Master Admin, Admin, Facilitator/Trainer, Student) and includes AI-powered features, content management, tracking, reporting, NASBA/CPE compliance, and subscription management.

## User Preferences
- User expects fully functional LMS with seamless content creation and student experience
- Prefers best-practice LMS design patterns found in leading educational platforms
- Requires working buttons, functional navigation, and proper content persistence
- Wants professional course delivery interface for students
- Expects comprehensive content authoring tools for instructors

## Recent Changes
**January 27, 2025:**
- Fixed dashboard role display issues for Master Admin
- Added "Manage Existing Classes" button to Creator Space
- Resolved Learning Hub tutorial categories error
- Created course player for class preview functionality
- Identified multiple broken features requiring comprehensive fixes

## Current Issues to Address
1. Non-functional "Manage Class" button in classes list
2. Preview button missing from classes tab
3. Course preview lacks proper LMS frontend design
4. Content creation not persisting to student view
5. Multiple broken buttons and links throughout app
6. Missing standard LMS features for content delivery

## Architecture
- **Backend**: Node.js/Express with PostgreSQL (Neon)
- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui
- **Authentication**: Replit Auth with session management
- **AI Integration**: OpenAI API for content assistance
- **Payment**: Stripe for subscriptions
- **Compliance**: NASBA/CPE tracking and HIPAA features