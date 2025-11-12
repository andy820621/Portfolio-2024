---
title: Personal Finance Tracking System
date: 2025/5/10
description: EconoMe - A Simple and Effective Personal Finance Management Solution
image: /project-images/finance-tracker.webp
alt: Personal Finance Tracking System
ogImage: /project-images/finance-tracker.webp
tags: ['Finance Management', 'Nuxt 3', 'Vue 3', 'Supabase', 'TypeScript', 'Tailwind CSS']
categories: ['Web Development', 'SaaS', 'Personal Finance']
published: true
imageClass: object-left-top

sitemap:
  lastmod: 2025-05-10
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /project-images/finance-tracker.webp
      title: Personal Finance Tracking System
      caption: EconoMe - A Simple and Effective Personal Finance Management Solution
---

## Project Background

In today's life, proper management of personal finances is crucial for achieving long-term financial goals. However, many people face challenges such as inconsistent record-keeping, difficulty tracking spending patterns, or lack of effective tools to analyze their financial situation.

I decided to develop an intuitive and easy-to-use financial tracking system to help users clearly understand their income and expenses, and provide useful financial insights through visualization, assisting users in making more informed financial decisions.

## Introduction

### Complete Financial Management Solution

EconoMe provides comprehensive financial management features, from daily transaction records to long-term trend analysis, allowing users to easily monitor their financial status.

![System Overview](/project-images/finance-tracker/overview.webp){placeholder style="margin-left: 1rem"}

### Core Features

EconoMe's features focus on simplicity and practicality, meeting daily financial management needs.

<!-- prettier-ignore-start -->
| Transaction Management | Analysis & Reporting |
| ------- | ------- |
| - Multiple transaction types (income, expense, savings, investment)<br>- Flexible categorization system<br>- Quick addition and editing<br>- Expense category tags | - Income/expense trend visualization<br>- Period comparison analysis<br>- Custom time ranges<br>- Percentage change calculation |
<!-- prettier-ignore-end -->

### Login System

#### Magic Link

Implemented using Supabase's Magic Links feature, the login system allows users to sign in without remembering passwords. Users simply enter their email address, receive a login link, and click it to access the system.

::ProjectLightBox{folder="finance-tracker/magic-link"}
::

### User Settings

Users can easily manage their profiles and preferences, including:

- Personal profile editing
- Transaction viewing options (by date)

::ProjectLightBox{folder="finance-tracker/settings"}
::

## Technology Stack

<!-- prettier-ignore-start -->
|      | Main Technologies  |
| ---- | ------- |
| Frontend | - Framework: Nuxt 3 (based on Vue 3)<br>- UI Framework: @nuxt/ui<br>- Styling: Tailwind CSS<br>- Programming Language: TypeScript |
| Backend | - Service Platform: Supabase<br>- Authentication: Supabase Auth<br>- Database: PostgreSQL<br>- API: RESTful API |
| Tools | - Date handling: date-fns<br>- Data visualization: Chart.js<br>- Data validation: zod<br>- Test data: @faker-js/faker |
<!-- prettier-ignore-end -->

## Future Plans

Ongoing system improvements include:

- Budget management system
- Enhanced data visualization (category pie charts, long-term trend analysis)
- Recurring transactions
- Financial goal tracking
- Multi-currency support
- CSV import/export

## Conclusion

The EconoMe project is dedicated to providing a simple yet powerful financial management tool that helps users understand their financial situation and make smarter decisions. If you're interested in trying it out, check out the [Demo](https://econo-me-tracker.vercel.app/){target="\_blank" rel="noopener"}.
