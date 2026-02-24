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
- Email provider switching incase of failure of main
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

- **Steps**
1. User creates an account by entering their required info.
2. Admin receives request by employee to gain access to company mailing portal
3. Admin approves or denies access, with an SMS or smth being sent to the user
4. If rejected, send an appropriate text
5. If accepted, SMS will contain a link to the login page where they will be prompted to login to their account by creating a password. Then perhaps enabling two factor auth.
6. User is greeted with email ending page
7. to send a single email, user has to enter the to address, message, reply to email, template id, and subject
8. For the case of bulk, instead of a to email, a user will select a mailing list for all accounts to be sent to

#### REQUIREMENTS
##### FRONTEND
- Sending emails tab (switch between single and bulk)
- mail list tab
- Organisational settings to manage users for an organisation
- Form option for scheduled email sends

##### Description
Now, I want to refactor this UI, before we were trying to make an email client but i want to change it to a marketing tool, an application that allows users to send email campaigns to a single or a bunch of users with the help of resend on behalf of their company. The left menu should now include tabs for email sending (emails), mailing list management (Mailig Lists), and settings where they can basically for now just do things like change their name or change the theme to dark mode. In the emails tab, the top of the window should have a rectangular navbar with rounded edges to allow the user to switch between single or bulk sends. In single the user will be greeted by a form where they will enter the destination address, subject, text content, the to name and email address will be added to the email object automatically as those are saved in local browser storage. The status of these mails should be pending so they are added to the db then sent via emailjs. There will also be an option for adding attachments but we will explore that in the future. On the bulk side, the fundamental difference is that instead of entering a destination address, you select a premade mailing list created by you or others in your company, or create one incase the ones available don't suite one's marketing needs. Refactor the UI to fit this new purpose, 

##### BACKEND
- API route for sending single or bulk emails
- API route for CRUD operations on contacts
- Modified User model and API to include organisations.
- API routes for managing Organisations
- Modified user roles to delegate organisational roles
- cron job for sending scheduled emails