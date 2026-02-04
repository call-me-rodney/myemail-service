# ENTERPRISE GRADE EMAIL SERVICE
## OBECTIVES
- Learn nestjs
- Improve react + vite skills
- Practice docker and kubernetes
- Learn writing shell scripts
- Prove dev skills

## PROJECT OVERVIEW
### Description
An enterprise grade emailing service

### Core System Functions
- Single & bulk email sending
- Mailing list management
- Enterprise Email template builder with HTML editor for advanced users (drag and drop for regulars).
- unsubscribe/bounce handling  
- Real-time analytics and metrics, with ability to export reports to a specific format
- Campaign builder
- GDPR compliance tracking

### Proposed Tech Stack
- Backend: Nestjs
- Frontend: Vite + React
- Database: Postgresql (Neon)
- Containerization: Docker
- Deployement: Azure
- Cache Database: Redis
- Event Queue: Kafka
- External Email Provider: Emailjs

### Requirements
- scalable (docker,azure,redis,kafka)
- Reliable (docker,kafka,azure)
- Security (nestjs)
- Compliance (heavy research required)
- Email provider switching incase of faiure of main
- ERP & CRM integrations (for automatic emailing, content management, ad campaigns etc)
- AI powered
- Spam detection
- Audit logs
- workflow automation
- warmup automation (research)
- dedicated IP pools (research)

## FUNCTIONAL BREAKDOWN
### Sending and receiving emails (single/bulk)
#### WORKFLOW
An authenticated user is greeted by the email sending tab. Here, the user on behalf of their company can send email campaigns to a single or multiple recipients. There will also be an option for bulk sending where an email list can be appended/imported as needed. The user must have the option of sending the emails immediately or scheduling them for a given time.

#### REQUIREMENTS
##### FRONTEND
- Sending emails tab (switch between single and bulk)
- mail list tab
- Organisational settings to manage users for an organisation
- Form option for scheduled email sends

##### BACKEND
- API route for sending single or bulk emails
- API route for CRUD operations on contacts
- Modified User model and API to include organisations.
- API routes for managing Organisations
- Modified user roles to delegate organisational roles
- cron job for sending scheduled emails