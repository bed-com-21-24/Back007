# Back007
Community Skills & Services Directory ("Skillz Directory") — Backend
Course	Software Engineering (COM311)
Project Title	Group Mini-Project — Community Skills & Services Directory
Group Number	FF7
Supervisor	Ken Junior Kandoje
Group Leader	Simbeye Mwiza Maxwell
Document Status	Initial Version — for 1st Presentation (Week 5)
Date	26 September 2026


1. Introduction
1.1 Purpose
This document specifies the functional and non-functional requirements for the backend of the Skillz Directory platform. It is the initial version of the Software Requirements Specification (SRS), prepared for the 1st Presentation milestone, and will be refined as the project progresses through subsequent sprints.
1.2 Project Overview
Residents of many communities lack a reliable, centralized way to find trustworthy local service providers such as plumbers, electricians, and mechanics, while providers lack a structured way to showcase their skills and build a verifiable reputation. Skillz Directory addresses this gap as a community-focused directory and discovery platform that allows service providers to register and list their services, and allows residents to search for providers, view ratings and reviews, and connect directly — beginning with a single city before expanding further.
1.3 Scope
This specification covers the backend system supporting user and provider registration, authentication and access control, search and discovery, ratings and reviews, profile management, in-platform communication, moderation, and administration. Frontend UI/UX requirements are addressed separately by the corresponding frontend team.
2. Functional Requirements
2.1 Registration & Authentication
ID	Requirement Description	Priority
FR-01	The system shall allow residents to register an account by providing name, email address, phone number, location, and password.	High
FR-02	The system shall allow service providers to register an account by providing occupation, service description, trade category, location, skills, and years of experience.	High
FR-03	The system shall implement role-based access control distinguishing Resident, Service Provider, and Administrator roles.	High
FR-04	The system shall allow registered users to securely log in and log out of their accounts.	High
FR-05	The system shall allow users to reset a forgotten password through a secure password-reset process.	Medium
2.2 Search & Discovery
ID	Requirement Description	Priority
FR-06	The system shall allow users to search for service providers by keyword or trade category.	High
FR-07	The system shall allow users to filter search results by location, trade category, years of experience, and average rating.	High
FR-08	The system shall allow users to sort search results by attributes such as rating, distance, and years of experience.	Medium
2.3 Ratings & Reviews
ID	Requirement Description	Priority
FR-09	The system shall allow residents to rate a service provider using a five-star rating scale.	High
FR-10	The system shall allow residents to submit a written review describing their experience with a service provider.	High
FR-11	The system shall display each service provider's aggregate rating on their public profile.	Medium
2.4 Profile Management
ID	Requirement Description	Priority
FR-12	The system shall allow users to update their personal profile information, including name, contact details, and location.	Medium
FR-13	The system shall allow service providers to edit their listed skills, competencies, and service details.	Medium
FR-14	The system shall allow service providers to display their working hours on their profile.	Low
2.5 Communication & Sharing
ID	Requirement Description	Priority
FR-15	The system shall allow residents to directly contact a service provider through the platform.	High
FR-16	The system shall allow users to generate and share a shareable link to a service provider's profile.	Low
2.6 Moderation & Safety
ID	Requirement Description	Priority
FR-17	The system shall allow users to report another user for misconduct.	Medium
FR-18	The system shall allow users to block another user from contacting them.	Medium
FR-19	The system shall allow administrators to suspend or ban user accounts found to have violated platform rules.	High
FR-20	The system shall allow administrators to remove listings identified as inappropriate.	High
FR-21	The system shall prevent unauthorized users from accessing or modifying protected user and provider information.	High
2.7 Administration
ID	Requirement Description	Priority
FR-22	The system shall provide administrators with a dashboard to manage users and service-provider listings.	High
FR-23	The system shall allow administrators to approve or reject new service-provider listings before publication.	Medium
FR-24	The system shall allow an administrator to grant administrator privileges to another user.	Low
FR-25	The system shall allow administrators to generate reports on platform usage, including new registrations, active listings, and submitted reviews.	Medium
3. Non-Functional Requirements
3.1 Performance
ID	Requirement Description	Priority
NFR-01	The system shall return search query results within 2 seconds under normal load conditions.	High
NFR-02	The system's API endpoints shall support at least 100 concurrent requests without significant degradation in response time.	Medium
3.2 Security
ID	Requirement Description	Priority
NFR-03	The system shall store all user passwords using a secure, salted hashing algorithm (e.g., bcrypt).	High
NFR-04	The system shall encrypt all data transmitted between client and server using HTTPS/TLS.	High
NFR-05	The system shall use token-based authentication (e.g., JWT) to secure protected API endpoints.	High
NFR-06	The system shall validate and sanitize all user input to prevent injection attacks such as SQL injection and cross-site scripting.	High
3.3 Scalability
ID	Requirement Description	Priority
NFR-07	The system's architecture shall be designed to scale from a single-city deployment to multiple cities without requiring a redesign.	Medium
NFR-08	The database schema shall support horizontal scaling as the number of users and listings grows.	Medium
3.4 Reliability & Availability
ID	Requirement Description	Priority
NFR-09	The system shall maintain an uptime of at least 99% during operational hours.	Medium
NFR-10	The system shall implement error handling and logging to capture and report failures.	High
3.5 Usability (API-level)
ID	Requirement Description	Priority
NFR-11	The system's API responses shall follow a consistent, well-documented format (e.g., JSON) to support ease of frontend integration.	Medium
NFR-12	Error messages returned by the API shall be clear and descriptive to support effective client-side handling.	Medium
3.6 Maintainability
ID	Requirement Description	Priority
NFR-13	The system's codebase shall follow a modular architecture to facilitate maintenance and future feature additions.	Medium
NFR-14	The system shall include API documentation sufficient for a new developer to integrate with it without direct assistance.	Medium
3.7 Data Integrity & Backup
ID	Requirement Description	Priority
NFR-15	The system shall perform regular automated backups of the database.	High
NFR-16	The system shall enforce data validation rules to maintain consistency and integrity of stored records.	High
3.8 Compliance & Privacy
ID	Requirement Description	Priority
NFR-17	The system shall only collect user data necessary for platform functionality and shall obtain user consent where required.	Medium
NFR-18	The system shall restrict access to personal data to authorized roles only, consistent with the access control policy defined in FR-21.	High
4. Revision History
Version	Date	Description
0.1	26 Sept 2026	Initial version — functional and non-functional requirements drafted for 1st Presentation.
