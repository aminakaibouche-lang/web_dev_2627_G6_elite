Team <team-name> -- Task Plan (Lab 2)

Project: PharmaFind, a web application to find open pharmacies, night-duty pharmacies and available medicines.

Team members
Member	GitHub username	Role
Member 1	@username-1	Template, home page, login (shared layout lead)
Member 2	@username-2	Medicines page, pharmacies list
Member 3	@username-3	Pharmacy details, night duty
Member 4	@username-4	Registration, pharmacy dashboard, admin dashboard
Site map

Site map

Three profiles: visitor / user (search and browse), pharmacy owner (manages medicines and duty schedule), administrator (approves pharmacies).

Conventions
Folders: frontend/ (index.html, pages/, css/, js/, images/), backend/, database/, docs/
File names: lowercase, hyphens, English (pharmacy-details.html, pharmacy-details.css, pharmacy-details.js)
Shared template: every page starts from frontend/pages/template.html (skeleton, header with navigation, main, footer)
Shared CSS: base.css (reset, buttons, chips) and variables.css (colors, fonts) are written by Member 1; page styles go in css/<page-name>.css
Branches: page/<page-name> (e.g. page/medicines), one branch per page
Commits: imperative, short (Add medicine search form, Fix filter layout)
Workflow: push branch, open a Pull Request, the reviewer checks it, then merge into main. Nobody pushes pages directly to main.
Pages
Page	File	Profile	Owner	Reviewer	Status
Template	frontend/pages/template.html	all	@username-1	@username-2	To do
Home	frontend/index.html	all	@username-1	@username-3	To do
Login (form)	frontend/pages/login.html	all	@username-1	@username-4	To do
Medicine search (form)	frontend/pages/medicines.html	visitor	@username-2	@username-1	To do
Pharmacies list (filter form)	frontend/pages/pharmacies.html	visitor	@username-2	@username-4	To do
Pharmacy details (table)	frontend/pages/pharmacy-details.html	visitor	@username-3	@username-2	To do
Night duty (table)	frontend/pages/night-duty.html	visitor	@username-3	@username-1	To do
Registration (form)	frontend/pages/register.html	all	@username-4	@username-1	To do
Pharmacy dashboard (form + table)	frontend/pages/dashboard.html	pharmacy	@username-4	@username-3	To do
Admin dashboard (table)	frontend/pages/admin-dashboard.html	admin	@username-4	@username-3	To do

Split check:

Pages per member: Member 1 has 2 pages (plus the template), Member 2 has 2, Member 3 has 2, Member 4 has 3. The difference is one page.
Forms: login, medicines, pharmacies, register, dashboard (5).
Tables: pharmacy details, night duty, dashboard, admin dashboard (4).
Every member owns at least one form or table.
Every page has one owner and a different reviewer.
Deadlines
Template and home page pushed (Member 1): <date>
All pages merged into main: <date>
Every member confirms their assignment by commenting on the "Add task plan" commit: <date>