create table if not exists playground_events (
    id bigserial primary key,
    event_name text not null,
    created_at timestamptz not null default now()
);

insert into playground_events (event_name)
values ('Sean''s Playground initialized')
on conflict do nothing;

create schema if not exists background;

create table if not exists background.profiles (
    id bigserial primary key,
    slug text not null unique,
    display_name text not null,
    headline text not null,
    location text not null,
    biography text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists background.documents (
    id bigserial primary key,
    profile_id bigint not null references background.profiles(id) on delete cascade,
    title text not null,
    source_file_name text not null,
    content_type text not null,
    plain_text text not null,
    created_at timestamptz not null default now(),
    unique (profile_id, title)
);

create table if not exists background.document_sections (
    id bigserial primary key,
    document_id bigint not null references background.documents(id) on delete cascade,
    heading text not null,
    body text not null,
    section_order integer not null,
    unique (document_id, heading)
);

create table if not exists background.experiences (
    id bigserial primary key,
    profile_id bigint not null references background.profiles(id) on delete cascade,
    role_title text not null,
    organization_name text not null,
    location text,
    start_on date not null,
    end_on date,
    date_label text not null,
    duration_label text,
    sort_order integer not null,
    unique (profile_id, organization_name, role_title, start_on)
);

create table if not exists background.experience_highlights (
    id bigserial primary key,
    experience_id bigint not null references background.experiences(id) on delete cascade,
    highlight_text text not null,
    sort_order integer not null,
    unique (experience_id, sort_order)
);

create table if not exists background.education_items (
    id bigserial primary key,
    profile_id bigint not null references background.profiles(id) on delete cascade,
    institution_name text not null,
    degree_name text not null,
    field_of_study text,
    note text,
    sort_order integer not null,
    unique (profile_id, degree_name, institution_name)
);

create table if not exists background.social_platforms (
    id bigserial primary key,
    name text not null unique,
    sort_order integer not null
);

create table if not exists background.social_links (
    id bigserial primary key,
    profile_id bigint not null references background.profiles(id) on delete cascade,
    platform_id bigint not null references background.social_platforms(id) on delete restrict,
    display_text text not null,
    url text not null,
    is_active boolean not null default true,
    sort_order integer not null,
    unique (profile_id, platform_id, url)
);

create table if not exists background.repositories (
    id bigserial primary key,
    profile_id bigint not null references background.profiles(id) on delete cascade,
    owner_name text not null,
    repository_name text not null,
    url text not null,
    description text not null,
    is_featured boolean not null default false,
    sort_order integer not null,
    unique (owner_name, repository_name)
);

create table if not exists background.section_entitlements (
    id bigserial primary key,
    section_key text not null,
    role_name text not null,
    unique (section_key, role_name)
);

insert into background.profiles (slug, display_name, headline, location, biography)
values (
    'sean-willison',
    'Sean Willison',
    'Senior Leader / Architect / Innovator',
    'St. Augustine, FL',
    'Sean is a senior engineering leader and architect with decades of experience guiding teams through complex software, cloud, healthcare, insurance, financial, and regulated-domain delivery. He brings a systems-minded approach to architecture, team design, modernization, migration, and operational resilience, with a bias toward collaboration, clarity, and pragmatic execution.'
)
on conflict (slug) do update set
    display_name = excluded.display_name,
    headline = excluded.headline,
    location = excluded.location,
    biography = excluded.biography,
    updated_at = now();

insert into background.social_platforms (name, sort_order)
values
    ('LinkedIn', 10),
    ('Facebook', 20)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into background.social_links (profile_id, platform_id, display_text, url, is_active, sort_order)
select p.id, sp.id, 'linkedin.com/in/swillison', 'https://www.linkedin.com/in/swillison', true, 10
from background.profiles p
join background.social_platforms sp on sp.name = 'LinkedIn'
where p.slug = 'sean-willison'
on conflict (profile_id, platform_id, url) do update set
    display_text = excluded.display_text,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

insert into background.social_links (profile_id, platform_id, display_text, url, is_active, sort_order)
select p.id, sp.id, 'facebook.com/sean.willison.1', 'https://www.facebook.com/sean.willison.1/', true, 20
from background.profiles p
join background.social_platforms sp on sp.name = 'Facebook'
where p.slug = 'sean-willison'
on conflict (profile_id, platform_id, url) do update set
    display_text = excluded.display_text,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

insert into background.repositories (profile_id, owner_name, repository_name, url, description, is_featured, sort_order)
select id, 'lordbender', 'sean-playground', 'https://github.com/lordbender/sean-playground',
       'Reference repository for Sean''s Playground and the evolving full-stack local lab.',
       true, 10
from background.profiles
where slug = 'sean-willison'
on conflict (owner_name, repository_name) do update set
    url = excluded.url,
    description = excluded.description,
    is_featured = excluded.is_featured,
    sort_order = excluded.sort_order;

insert into background.section_entitlements (section_key, role_name)
values
    ('seans-background', 'Admins'),
    ('seans-background', 'Friends'),
    ('seans-background', 'Users')
on conflict (section_key, role_name) do nothing;

insert into background.documents (profile_id, title, source_file_name, content_type, plain_text)
select id, 'Current Resume', 'Sean Willison Current.docx',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       $$Sean Willison
Senior Leader / Architect / Innovator
St. Augustine, FL
linkedin.com/in/swillison

Seasoned senior leader with a deep understanding of team-based design and development, agile paradigms, management techniques, engineering, architecture, and complex regulated domains. Experienced in startups, healthcare, insurance, finance, cloud platform engineering, modernization, and collaborative delivery through political and bureaucratic obstacles.$$ 
from background.profiles
where slug = 'sean-willison'
on conflict (profile_id, title) do update set
    source_file_name = excluded.source_file_name,
    content_type = excluded.content_type,
    plain_text = excluded.plain_text;

insert into background.document_sections (document_id, heading, body, section_order)
select d.id, 'Professional Summary',
       'Seasoned senior leader with a deep understanding of team-based design and development, multiple agile paradigms, and management techniques. Sean has led and mentored teams, managers, and stakeholders through complex projects, bringing directional clarity to complex systems through engineering and architecture experience.',
       10
from background.documents d
join background.profiles p on p.id = d.profile_id
where p.slug = 'sean-willison' and d.title = 'Current Resume'
on conflict (document_id, heading) do update set body = excluded.body, section_order = excluded.section_order;

insert into background.document_sections (document_id, heading, body, section_order)
select d.id, 'Regulated Domains',
       'Experience spans startups and deeply complex healthcare, insurance, and financial domains with heavy industry and governmental regulation.',
       20
from background.documents d
join background.profiles p on p.id = d.profile_id
where p.slug = 'sean-willison' and d.title = 'Current Resume'
on conflict (document_id, heading) do update set body = excluded.body, section_order = excluded.section_order;

insert into background.experiences (profile_id, role_title, organization_name, location, start_on, end_on, date_label, duration_label, sort_order)
select p.id, source.role_title, source.organization_name, source.location, source.start_on::date, source.end_on::date, source.date_label, source.duration_label, source.sort_order
from background.profiles p
cross join (
    values
        ('Senior Manager, Cloud Engineering', 'Availity', 'Jacksonville, FL', '2025-03-01', null, 'March 2025 - Present', 'Current', 10),
        ('Manager, Cloud Services', 'Availity', 'St. Augustine, FL', '2022-12-01', '2025-04-01', 'December 2022 - April 2025', '2 years 5 months', 20),
        ('Infrastructure Architect IV, Middleware', 'Availity', 'Jacksonville, FL', '2022-01-01', '2022-12-01', 'January 2022 - December 2022', '1 year', 30),
        ('IT Manager', 'Florida Blue', 'Jacksonville, FL Area', '2019-02-01', '2022-01-01', 'February 2019 - January 2022', '3 years', 40),
        ('Senior Application Architect', 'Florida Blue', 'Jacksonville, FL Area', '2017-12-01', '2019-02-01', 'December 2017 - February 2019', '1 year 3 months', 50),
        ('ReactJS Consultant', 'Florida Blue via Interactive Resources', 'Jacksonville, FL', '2017-04-01', '2017-12-01', 'April 2017 - December 2017', '9 months', 60),
        ('Application Architect', 'EverBank / TIAA FSB', 'Jacksonville, FL', '2017-06-01', '2017-12-01', 'June 2017 - December 2017', '7 months', 70),
        ('Lead Software Engineer', 'Beeline', 'Jacksonville, FL', '2016-02-01', '2017-04-01', 'February 2016 - April 2017', '1 year 3 months', 80),
        ('Senior Software Developer, Consultant', 'Fidelity National Title via Randstad', 'Jacksonville, FL', '2015-11-01', '2016-02-01', 'November 2015 - February 2016', '4 months', 90),
        ('Development Team Lead, Consultant', 'Allstate via Interactive Resources', 'Jacksonville, FL', '2015-08-01', '2015-11-01', 'August 2015 - November 2015', '4 months', 100),
        ('Director of Engineering', 'PaySpan, Inc.', 'Jacksonville, FL', '2015-03-01', '2015-07-01', 'March 2015 - July 2015', '5 months', 110),
        ('Program Manager, User Experience', 'PaySpan, Inc.', 'Jacksonville, FL', '2014-08-01', '2015-03-01', 'August 2014 - March 2015', '8 months', 120),
        ('Assistant Director, Product Development', 'PaySpan, Inc.', 'Jacksonville, FL', '2013-10-01', '2014-08-01', 'October 2013 - August 2014', '11 months', 130),
        ('New Product Development Team Lead', 'PaySpan, Inc.', 'Jacksonville, FL', '2013-04-01', '2013-10-01', 'April 2013 - October 2013', '7 months', 140),
        ('Senior Developer / Engineer', 'PaySpan, Inc.', 'Jacksonville, FL', '2011-08-01', '2013-04-01', 'August 2011 - April 2013', '1 year 9 months', 150),
        ('Developer / Software Engineer', 'InfoTech International, LLC', 'Jacksonville, FL', '2009-01-01', '2011-10-01', '2009 - October 2011', '2 years', 160)
) as source(role_title, organization_name, location, start_on, end_on, date_label, duration_label, sort_order)
where p.slug = 'sean-willison'
on conflict (profile_id, organization_name, role_title, start_on) do update set
    location = excluded.location,
    end_on = excluded.end_on,
    date_label = excluded.date_label,
    duration_label = excluded.duration_label,
    sort_order = excluded.sort_order;

insert into background.experience_highlights (experience_id, highlight_text, sort_order)
select e.id, source.highlight_text, source.sort_order
from background.experiences e
join background.profiles p on p.id = e.profile_id
cross join lateral (
    values
        (case when e.role_title = 'Senior Manager, Cloud Engineering' then 'Directed cloud engineering teams responsible for Availity''s AWS Cloud Platform across SOC, HITRUST, NIST, and FedRAMP compliance requirements.' end, 10),
        (case when e.role_title = 'Senior Manager, Cloud Engineering' then 'Oversaw infrastructure-as-code delivery for networking, databases, tenant isolation, middleware, transit gateway, observability, and EKS platform domains.' end, 20),
        (case when e.role_title = 'Senior Manager, Cloud Engineering' then 'Managed large-scale data center migrations to AWS, including Oracle Exadata, Amazon FSx for NetApp ONTAP, more than 200 Windows servers, MS SQL Server instances, 200TB from Exadata, and 2PB from NetApp.' end, 30),
        (case when e.role_title = 'Manager, Cloud Services' then 'Built out the Cloud Services team and transitioned its focus toward Cloud Engineering as cloud footprints matured.' end, 10),
        (case when e.role_title = 'IT Manager' then 'Managed teams delivering payment integrity, claim hold management, workflow, guided resolution, and data-entry software.' end, 10),
        (case when e.role_title = 'Senior Application Architect' then 'Led MERN and Spring Boot teams backed by Oracle, mentoring developers as a large Java shop adopted React and Express.' end, 10),
        (case when e.role_title = 'Lead Software Engineer' then 'Led large multi-team platform efforts, including a separated multi-tier microservices platform and mobile development.' end, 10),
        (case when e.role_title = 'Director of Engineering' then 'Managed development planning, releases, software teams, partner relationships, and quality practices across product lines.' end, 10),
        (case when e.role_title = 'Developer / Software Engineer' then 'Maintained back-office applications, created .NET MVC solutions, and modernized a large VB6 codebase to C#.' end, 10)
) as source(highlight_text, sort_order)
where p.slug = 'sean-willison' and source.highlight_text is not null
on conflict (experience_id, sort_order) do update set highlight_text = excluded.highlight_text;

insert into background.education_items (profile_id, institution_name, degree_name, field_of_study, note, sort_order)
select id, 'University of North Florida', 'Master of Science', 'Computer Science', null, 10
from background.profiles
where slug = 'sean-willison'
on conflict (profile_id, degree_name, institution_name) do update set
    field_of_study = excluded.field_of_study,
    note = excluded.note,
    sort_order = excluded.sort_order;

insert into background.education_items (profile_id, institution_name, degree_name, field_of_study, note, sort_order)
select id, 'University of North Florida', 'Bachelor of Science', 'Computer Science', 'Minor in Mathematics', 20
from background.profiles
where slug = 'sean-willison'
on conflict (profile_id, degree_name, institution_name) do update set
    field_of_study = excluded.field_of_study,
    note = excluded.note,
    sort_order = excluded.sort_order;
