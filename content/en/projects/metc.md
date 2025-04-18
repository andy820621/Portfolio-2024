---
title: Smart Fire Protection System
date: 2024/3/31
description: Smart Fire Protection System - Community Disaster Prevention IoT Solution
image: /project-images/metc.webp
alt: Smart Fire Protection System
ogImage: /project-images/metc.webp
tags: ['Web Development', 'JavaScript']
published: true

sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - url: /project-images/metc.webp
      title: Smart Fire Protection System
      caption: Smart Fire Protection System
---

## Project Background

The number of fires in Taiwan remains high, with an average of one fire every 4 hours, of which 70.4% occur in residential areas.
Our company, having long been in this field, has discovered significant gaps in current disaster prevention concepts and policies.
Therefore, we are committed to developing a new smart fire protection system, aiming to create an intelligent fire management platform through IoT technology to enhance community disaster prevention capabilities and response efficiency.

### Target

1. Integration of building Information, real-time status updates, and personnel tracking.
2. Automatic or manual delivery of equipment maintenance norification.
3. Enhancing mulfitasking capacity and effciency.
4. Minimizing human errors and operation cost.

## Introduction

### Smart Fire Protection Information Integration

We will first need to establish a permission system and building information database. By building community data, we can better respond to various situations.

![intro image](/project-images/metc/en/01.intro.webp){placeholder style="margin-left: 1rem"}

### Usage Modes

The system can be primarily divided into two main directions: <b>Daily Management</b> and <b>Emergency Response</b>.

<!-- prettier-ignore-start -->
| Daily Management | Emergency Response |
| ---------------- | ------------------ |
| - Community Personnel Information Management<br>- Regular Inspection and Maintenance Scheduling<br>- Announcement Publishing System<br>- Equipment Status Tracking | - Real-time Monitoring of Fire Equipment (Fire Control Panel, PLC)<br>- Multi-channel Instant Notifications (WebSocket, Line, Mobile Push, SMS)<br>- Intelligent Task Scheduling<br>- Emergency Guidance and Evacuation Route Recommendations |
<!-- prettier-ignore-end -->

::ProjectLightBox{folder="metc/en/dailyOrEmergency"}
::

### Disaster Response

During routine fire team training or actual emergencies, the disaster prevention center can provide more accurate and swift instructions to team members and community residents through the system's monitoring data.

::ProjectLightBox{folder="metc/en/monitor"}
::

## Technology Stack

<!-- prettier-ignore-start -->
|        | Main Technologies |
| ------ | ----------------- |
| Frontend | - Framework: Vue 3<br>- UI Library: Quasar<br>- Programming Language: TypeScript<br>- Special Feature: PWA (iOS Push Notification Support) |
| Backend | - Development Framework: .NET Core<br>- Workflow Engine: WorkflowCore<br>- Communication Protocol: WebSocket<br>- Cross-platform Notification: Multi-channel Integration |
<!-- prettier-ignore-end -->

## Conclusion

Due to business confidentiality considerations, I cannot display the complete system webpage. However, I have created a [Demo](https://metc.netlify.app/) that showcases some basic functionalities for those interested.
