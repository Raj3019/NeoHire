require('dotenv').config();

const { configureDnsServers } = require('../utils/dns.utils');
configureDnsServers();

const crypto = require('crypto');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const Employee = require('../model/employee.model');
const Recruiter = require('../model/recruiter.model');
const Job = require('../model/job.model');
const Application = require('../model/application.model');
const TalentAlert = require('../model/talentAlert.model');
const Notification = require('../model/notification.model');
const ActivityLog = require('../model/activityLog.model');

const VALIDATE_ONLY = process.argv.includes('--validate-only');
const SEED_NAME = 'neohire-production-demo-v1';
const DAY = 86400000;
const now = new Date();
const daysAgo = (days) => new Date(now.getTime() - days * DAY);
const daysFromNow = (days) => new Date(now.getTime() + days * DAY);
const domain = (process.env.DEMO_SEED_EMAIL_DOMAIN || 'demo.neohire.site').trim().toLowerCase();
const resumeUrl = process.env.DEMO_RESUME_URL || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const avatarUrl = process.env.DEMO_PROFILE_IMAGE_URL || '/avatar.png';
const publicDemoPasswords = {
  candidate: process.env.DEMO_CANDIDATE_PASSWORD || 'NeoHireDemo@2026',
  recruiter: process.env.DEMO_RECRUITER_PASSWORD || 'NeoHireDemo@2026',
};

const emails = {
  candidate: `candidate@${domain}`,
  newCandidate: `new-candidate@${domain}`,
  frontend: `maya.sharma@${domain}`,
  backend: `arjun.mehta@${domain}`,
  devops: `rohan.patel@${domain}`,
  recruiter: `recruiter@${domain}`,
  recruiter2: `cloudscale.hr@${domain}`,
  admin: `admin@${domain}`,
};

const authDefinitions = [
  ['candidate', 'Aarav Verma', 'Employee', 'candidate'],
  ['newCandidate', 'Isha Nair', 'Employee', 'candidate'],
  ['frontend', 'Maya Sharma', 'Employee'],
  ['backend', 'Arjun Mehta', 'Employee'],
  ['devops', 'Rohan Patel', 'Employee'],
  ['recruiter', 'Priya Kapoor', 'Recruiter', 'recruiter'],
  ['recruiter2', 'Kabir Singh', 'Recruiter'],
  ['admin', 'NeoHire Demo Admin', 'Admin', 'admin'],
];

const education = {
  tenth: { schoolName: 'Delhi Public School', board: 'CBSE', percentage: 88, passingYear: 2014, city: 'Pune', state: 'Maharashtra' },
  juniorCollege: { collegeName: 'Modern Junior College', board: 'State Board', stream: 'Science', percentage: 84, passingYear: 2016, city: 'Pune', state: 'Maharashtra' },
  graduation: { collegeName: 'Pune Institute of Technology', university: 'Savitribai Phule Pune University', degree: 'B.Tech', specialization: 'Computer Science', cgpa: 8.4, passingYear: 2020, city: 'Pune', state: 'Maharashtra' },
};

const employeeDefinitions = [
  ['candidate', 'Aarav Verma', '9000000101', 'Full Stack Developer', 'ProductWorks', 5, ['React', 'JavaScript', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'], 'Pune', true, true],
  ['newCandidate', 'Isha Nair', '9000000102', 'Junior Frontend Developer', 'Open to Work', 1, ['JavaScript', 'React', 'CSS'], 'Pune', false, true],
  ['frontend', 'Maya Sharma', '9000000103', 'Frontend Developer', 'Pixel Labs', 4, ['React', 'JavaScript', 'TypeScript', 'CSS'], 'Bangalore', false, true],
  ['backend', 'Arjun Mehta', '9000000104', 'Backend Engineer', 'API Forge', 6, ['Node.js', 'Express', 'MongoDB', 'AWS'], 'Pune', true, true],
  ['devops', 'Rohan Patel', '9000000105', 'DevOps Engineer', 'Cloud Grid', 6, ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], 'Mumbai', true, false],
];

const recruiterDefinitions = [
  ['recruiter', 'Priya Kapoor', '9000000201', 'NeoTech Labs', false],
  ['recruiter2', 'Kabir Singh', '9000000202', 'CloudScale Systems', false],
  ['admin', 'NeoHire Demo Admin', '9000000203', 'NeoHire', true],
];

const jobDefinitions = [
  ['react', 'Senior React Developer', 'recruiter', ['React', 'JavaScript', 'TypeScript'], 'Pune', 'Hybrid', 'Full-time', 4, 8, 1600000, 2400000, 'Active', 4],
  ['node', 'Node.js Backend Engineer', 'recruiter', ['Node.js', 'Express', 'MongoDB', 'AWS'], 'Remote', 'Remote', 'Full-time', 3, 7, 1400000, 2200000, 'Active', 8],
  ['fullstack', 'Full Stack Developer', 'recruiter', ['React', 'Node.js', 'MongoDB'], 'Bangalore', 'Hybrid', 'Contract', 2, 6, 1200000, 2000000, 'Active', 13],
  ['frontend', 'Junior Frontend Developer', 'recruiter2', ['JavaScript', 'React', 'CSS'], 'Remote', 'Remote', 'Full-time', 0, 2, 600000, 1000000, 'Active', 18],
  ['devops', 'DevOps Engineer', 'recruiter2', ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], 'Mumbai', 'On-site', 'Full-time', 3, 8, 1500000, 2500000, 'Active', 24],
  ['qa', 'QA Automation Engineer', 'recruiter2', ['JavaScript', 'Playwright', 'API Testing'], 'Pune', 'Hybrid', 'Full-time', 2, 5, 900000, 1500000, 'Closed', 35],
];

const applicationDefinitions = [
  ['react', 'candidate', 'Shortlist', 'manual', 94, 3],
  ['node', 'candidate', 'Applied', 'auto-apply', 88, 2],
  ['fullstack', 'candidate', 'Accept', 'manual', 91, 9],
  ['react', 'frontend', 'Applied', 'manual', 89, 6],
  ['fullstack', 'frontend', 'Reject', 'manual', 68, 12],
  ['node', 'backend', 'Shortlist', 'auto-apply', 96, 5],
  ['fullstack', 'backend', 'Pending', 'manual', 86, 16],
  ['devops', 'devops', 'Shortlist', 'auto-apply', 95, 4],
  ['qa', 'devops', 'Applied', 'manual', 58, 25],
];

function assertEnvironment() {
  if (!domain.includes('.') || domain.includes('@')) throw new Error('DEMO_SEED_EMAIL_DOMAIN must be a valid domain.');
  if (VALIDATE_ONLY) return;
  if (process.env.SEED_DEMO_DATA !== 'true') throw new Error('Set SEED_DEMO_DATA=true to confirm seeding.');
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DEMO_SEED !== 'true') throw new Error('Production detected. Set ALLOW_PRODUCTION_DEMO_SEED=true to confirm.');
  if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL is required.');
  if (!process.env.DEMO_ADMIN_PASSWORD || process.env.DEMO_ADMIN_PASSWORD.length < 12) {
    throw new Error('DEMO_ADMIN_PASSWORD must contain at least 12 characters.');
  }
}

function employeeData(definition, authId) {
  const [key, fullName, phone, title, company, experienceYears, skills, city, autoApplyEnabled, talentRadarOptIn] = definition;
  return {
    betterAuthUserId: authId, fullName, email: emails[key], phone,
    dateOfBirth: new Date('1997-06-15'), gender: 'Other', profilePicture: avatarUrl,
    about: `${title} focused on reliable, user-friendly products.`, headline: `${title} with ${experienceYears} years of experience`,
    currentCity: city, state: city === 'Bangalore' ? 'Karnataka' : 'Maharashtra', country: 'India', zipCode: city === 'Bangalore' ? '560001' : '411001',
    currentJobTitle: title, currentCompany: company, experienceYears, skills, role: 'Employee', status: 'Active', education,
    workExperience: [{ jobTitle: title, company, location: city, startDate: new Date('2021-01-01'), currentlyWorking: true, description: 'Delivered production software in a cross-functional team.' }],
    languages: [{ language: 'English', proficiency: 'Advanced' }, { language: 'Hindi', proficiency: 'Native' }],
    jobPreferences: { jobType: ['Full-time', 'Contract'], workMode: ['Remote', 'Hybrid'], preferredLocations: ['Pune', 'Bangalore', 'Remote'], willingToRelocate: true },
    expectedSalary: { min: 900000, max: 2200000, currency: 'INR' }, resumeFileURL: resumeUrl,
    portfolioUrl: 'https://neohire.site', linkedinUrl: 'https://www.linkedin.com', githubUrl: 'https://github.com',
    autoApplyEnabled, talentRadarOptIn, isFreeTier: true,
  };
}

function recruiterData(definition, authId) {
  const [key, fullName, phone, employer, isAdmin] = definition;
  return {
    betterAuthUserId: authId, fullName, email: emails[key], phone,
    dateOfBirth: new Date('1990-03-12'), gender: 'Other', profilePicture: avatarUrl,
    headline: `${isAdmin ? 'Platform administrator' : 'Technical recruiter'} at ${employer}`,
    about: `Building high-performing technology teams for ${employer}.`, currentCity: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001',
    skills: ['Technical Recruiting', 'Talent Acquisition', 'Interviewing'], experienceYears: 8,
    languages: [{ language: 'English', proficiency: 'Advanced' }, { language: 'Hindi', proficiency: 'Native' }],
    currentRole: isAdmin ? 'Platform Administrator' : 'Senior Talent Partner', currentEmployer: employer,
    companyURL: 'https://neohire.site', resumeFileURL: resumeUrl, linkedinUrl: 'https://www.linkedin.com',
    role: 'Recruiter', status: 'Active', preferences: { industries: ['Technology', 'SaaS'], jobTypes: ['Full-time', 'Contract'] },
    totalHires: isAdmin ? 0 : 24, isFreeTier: true,
  };
}

function missingProfileFields(profile, candidate) {
  const required = ['fullName', 'phone', 'dateOfBirth', 'gender', 'currentCity', 'state', 'country', 'skills', 'zipCode', 'resumeFileURL', 'languages'];
  const missing = required.filter((field) => !profile[field] || (Array.isArray(profile[field]) && !profile[field].length));
  if (candidate) {
    if (!profile.education?.tenth?.schoolName) missing.push('education.tenth');
    if (!profile.education?.graduation?.degree) missing.push('education.graduation');
    if (!profile.jobPreferences?.jobType?.length) missing.push('jobPreferences.jobType');
    if (!profile.jobPreferences?.workMode?.length) missing.push('jobPreferences.workMode');
  }
  return missing;
}

async function validate(Model, data, label) {
  try { await new Model(data).validate(); } catch (error) { throw new Error(`${label}: ${error.message}`); }
}

async function upsert(Model, filter, data) {
  return Model.findOneAndUpdate(filter, { $set: data }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
}

async function upsertAuthUser(db, definition, hashPassword) {
  const [key, name, role, passwordType] = definition;
  const email = emails[key];
  const users = db.collection('user');
  const accounts = db.collection('account');
  let user = await users.findOne({ email });
  if (user?.role && user.role !== role) throw new Error(`Role conflict for ${email}: found ${user.role}, expected ${role}.`);

  if (!user) {
    const inserted = await users.insertOne({ name, fullName: name, email, emailVerified: true, image: avatarUrl, role, createdAt: daysAgo(29), updatedAt: now });
    user = await users.findOne({ _id: inserted.insertedId });
  } else {
    await users.updateOne({ _id: user._id }, { $set: { name, fullName: name, emailVerified: true, image: avatarUrl, role, updatedAt: now } });
  }

  const password = passwordType === 'admin'
    ? process.env.DEMO_ADMIN_PASSWORD
    : passwordType
      ? publicDemoPasswords[passwordType]
      : crypto.randomBytes(48).toString('base64url');
  const passwordHash = await hashPassword(password);
  const accountId = user._id.toString();
  const account = await accounts.findOne({ providerId: 'credential', $or: [{ userId: user._id }, { accountId }] });
  const accountData = { userId: user._id, accountId, providerId: 'credential', password: passwordHash, updatedAt: now };
  if (account) await accounts.updateOne({ _id: account._id }, { $set: accountData });
  else await accounts.insertOne({ ...accountData, createdAt: now });
  return accountId;
}

async function buildProfiles(authIds) {
  const employees = {};
  for (const definition of employeeDefinitions) {
    const key = definition[0];
    const data = employeeData(definition, authIds[key]);
    const missing = missingProfileFields(data, true);
    if (missing.length) throw new Error(`${emails[key]} is missing: ${missing.join(', ')}`);
    await validate(Employee, data, emails[key]);
    employees[key] = await upsert(Employee, { email: emails[key] }, data);
  }

  const recruiters = {};
  for (const definition of recruiterDefinitions) {
    const key = definition[0];
    const data = recruiterData(definition, authIds[key]);
    const missing = missingProfileFields(data, false);
    if (missing.length) throw new Error(`${emails[key]} is missing: ${missing.join(', ')}`);
    await validate(Recruiter, data, emails[key]);
    recruiters[key] = await upsert(Recruiter, { email: emails[key] }, data);
  }
  return { employees, recruiters };
}

async function buildJobs(recruiters) {
  const jobs = {};
  for (const definition of jobDefinitions) {
    const [key, title, recruiterKey, skills, location, workType, jobType, expMin, expMax, salaryMin, salaryMax, status, age] = definition;
    const owner = recruiters[recruiterKey];
    const data = {
      title,
      description: `Join ${owner.currentEmployer} as a ${title} and build production systems used by growing teams.`,
      jobRequirements: `Hands-on experience with ${skills.join(', ')}. Strong communication and problem-solving skills.`,
      location, jobType, workType, companyName: owner.currentEmployer,
      companyWebisteURL: owner.companyURL,
      department: 'Engineering', skillsRequired: skills,
      experienceRequired: { min: expMin, max: expMax },
      salary: { min: salaryMin, max: salaryMax, currency: 'INR' },
      applicationDeadline: status === 'Active' ? daysFromNow(30) : daysAgo(3),
      openings: key === 'frontend' ? 3 : 2, status, industry: 'Technology',
      benefits: ['Health insurance', 'Learning budget', 'Flexible working hours'],
      educationRequired: "Bachelor's degree or equivalent practical experience",
      postedBy: owner._id, createdAt: daysAgo(age),
    };
    await validate(Job, data, title);
    jobs[key] = await upsert(Job, { title, postedBy: owner._id }, data);
  }

  for (const recruiterKey of ['recruiter', 'recruiter2']) {
    const recruiter = recruiters[recruiterKey];
    const owned = Object.values(jobs).filter((job) => job.postedBy.equals(recruiter._id)).map((job) => job._id);
    await Recruiter.findByIdAndUpdate(recruiter._id, { $set: { jobs: owned } });
  }
  return jobs;
}

async function buildApplications(employees, jobs) {
  const applications = [];
  const byEmployee = new Map();
  const byJob = new Map();
  for (const definition of applicationDefinitions) {
    const [jobKey, employeeKey, status, appliedVia, score, age] = definition;
    const job = jobs[jobKey];
    const employee = employees[employeeKey];
    const matchedSkills = employee.skills.filter((skill) => job.skillsRequired.includes(skill));
    const missingSkills = job.skillsRequired.filter((skill) => !employee.skills.includes(skill));
    const data = {
      job: job._id, JobSeeker: employee._id, postedBy: job.postedBy,
      resume: employee.resumeFileURL, status, appliedVia, appliedAt: daysAgo(age), createdAt: daysAgo(age),
      aiMatchScore: {
        overallScore: score, skillsMatch: Math.min(100, score + 2), experienceMatch: Math.max(40, score - 4),
        educationMatch: Math.min(100, score + 1), calculatedAt: daysAgo(age),
        insights: score >= 85 ? 'Strong alignment across required skills and relevant experience.' : 'Promising profile with a few skills to strengthen.',
        matchedSkills, missingSkills,
      },
    };
    await validate(Application, data, `${employee.email} -> ${job.title}`);
    const application = await upsert(Application, { job: job._id, JobSeeker: employee._id }, data);
    applications.push(application);
    if (!byEmployee.has(employeeKey)) byEmployee.set(employeeKey, []);
    byEmployee.get(employeeKey).push(application._id);
    if (!byJob.has(jobKey)) byJob.set(jobKey, []);
    byJob.get(jobKey).push({ applicant: employee._id, appliedAt: data.appliedAt, status });
  }
  for (const [key, employee] of Object.entries(employees)) {
    await Employee.findByIdAndUpdate(employee._id, { $set: { appliedJobs: byEmployee.get(key) || [] } });
  }
  for (const [key, job] of Object.entries(jobs)) {
    await Job.findByIdAndUpdate(job._id, { $set: { appliedBy: byJob.get(key) || [] } });
  }
  return applications;
}

async function buildTalentRadar(recruiters, employees) {
  const definitions = [
    ['Senior React talent in Pune', 'recruiter', ['React', 'JavaScript', 'TypeScript'], 3, 80, 'Pune', 'Hybrid', true, [['candidate', 94], ['frontend', 91]]],
    ['Remote Node.js and AWS engineers', 'recruiter', ['Node.js', 'AWS'], 3, 85, null, 'Remote', true, [['candidate', 89], ['backend', 97]]],
    ['Paused DevOps search', 'recruiter2', ['AWS', 'Docker', 'Kubernetes'], 3, 80, 'Mumbai', 'On-site', false, [['devops', 96]]],
  ];
  const alerts = [];
  for (const [name, recruiterKey, requiredSkills, minExperience, minFitScore, location, workMode, isActive, matches] of definitions) {
    const recruiter = recruiters[recruiterKey];
    const data = {
      recruiter: recruiter._id, name, requiredSkills, minExperience, minFitScore, location, workMode, isActive,
      matchedEmployee: matches.map(([key, fitScore]) => ({
        employee: employees[key]._id, matchedAt: daysAgo(2), fitScore,
        resumeUrl: employees[key].resumeFileURL, employeeName: employees[key].fullName,
        employeeSkills: employees[key].skills, employeeExperience: employees[key].experienceYears,
      })),
    };
    await validate(TalentAlert, data, name);
    alerts.push(await upsert(TalentAlert, { recruiter: recruiter._id, name }, data));
  }
  return alerts;
}

async function buildNotifications(employees, recruiters, jobs, applications) {
  const findApplication = (jobKey, employeeKey) => applications.find(
    (item) => item.job.equals(jobs[jobKey]._id) && item.JobSeeker.equals(employees[employeeKey]._id),
  );
  const definitions = [
    [employees.candidate, 'Employee', 'STATUS_CHANGED', 'You were shortlisted', 'NeoTech Labs shortlisted your Senior React Developer application.', jobs.react, findApplication('react', 'candidate'), false],
    [employees.candidate, 'Employee', 'AUTO_APPLY_SUCCESS', 'Auto-apply submitted', 'NeoHire automatically applied to Node.js Backend Engineer for you.', jobs.node, findApplication('node', 'candidate'), false],
    [employees.newCandidate, 'Employee', 'JOB_POSTED', 'A new job matches your profile', 'Junior Frontend Developer is open for applications.', jobs.frontend, null, true],
    [recruiters.recruiter, 'Recruiter', 'APPLICATION_RECEIVED', 'New high-fit application', 'Aarav Verma applied with a 94% match score.', jobs.react, findApplication('react', 'candidate'), false],
    [recruiters.recruiter, 'Recruiter', 'TALENT_MATCH', 'Talent Radar found a match', 'Maya Sharma matched your Senior React talent alert.', null, null, false],
    [recruiters.recruiter2, 'Recruiter', 'APPLICATION_RECEIVED', 'New DevOps candidate', 'Rohan Patel applied to DevOps Engineer with a 95% match.', jobs.devops, findApplication('devops', 'devops'), true],
  ];
  for (const [recipient, recipientModel, type, title, message, job, application, isRead] of definitions) {
    const data = { recipient: recipient._id, recipientModel, type, title, message, relatedJob: job?._id, relatedApplication: application?._id, isRead };
    await validate(Notification, data, title);
    await upsert(Notification, { recipient: recipient._id, title }, data);
  }
  return definitions.length;
}

async function buildActivityLogs(employees, recruiters, jobs) {
  const definitions = [
    ['candidate-login', 'USER_LOGIN', employees.candidate._id, 'employee', 'Demo candidate signed in', 1],
    ['react-created', 'JOB_CREATED', recruiters.recruiter._id, 'recruiter', 'Created Senior React Developer job', 4],
    ['candidate-applied', 'JOB_APPLICATION', employees.candidate._id, 'employee', 'Applied to Senior React Developer', 3],
    ['auto-apply', 'AUTO_APPLY_RUN', null, 'system', 'Auto-apply checked eligible demo candidates', 2],
    ['talent-radar', 'TALENT_RADAR_RUN', null, 'system', 'Talent Radar processed active demo alerts', 2],
    ['shortlisted', 'APPLICATION_STATUS_UPDATED', recruiters.recruiter._id, 'recruiter', 'Shortlisted a candidate', 1],
    ['admin-login', 'USER_LOGIN', recruiters.admin._id, 'admin', 'Demo admin signed in', 5],
  ];
  for (const [key, action, userId, userRole, description, age] of definitions) {
    const data = {
      action, userId, userRole, description, resourceType: action.includes('JOB') ? 'Job' : null,
      resourceId: action.includes('JOB') ? jobs.react._id : null,
      metadata: { seedName: SEED_NAME, seedKey: key }, ipAddress: '127.0.0.1',
      method: 'SEED', endpoint: '/scripts/seed', statusCode: 200, createdAt: daysAgo(age),
    };
    await validate(ActivityLog, data, key);
    await upsert(ActivityLog, { 'metadata.seedName': SEED_NAME, 'metadata.seedKey': key }, data);
  }
  return definitions.length;
}

async function validateTemplates() {
  const fakeId = new mongoose.Types.ObjectId();
  for (const definition of employeeDefinitions) {
    const data = employeeData(definition, fakeId.toString());
    const missing = missingProfileFields(data, true);
    if (missing.length) throw new Error(`${definition[0]} profile missing ${missing.join(', ')}`);
    await validate(Employee, data, definition[0]);
  }
  for (const definition of recruiterDefinitions) {
    const data = recruiterData(definition, fakeId.toString());
    const missing = missingProfileFields(data, false);
    if (missing.length) throw new Error(`${definition[0]} profile missing ${missing.join(', ')}`);
    await validate(Recruiter, data, definition[0]);
  }
  for (const definition of jobDefinitions) {
    const [, title, , skills, location, workType, jobType, expMin, expMax, salaryMin, salaryMax] = definition;
    await validate(Job, {
      title, description: 'Valid demo description', jobRequirements: 'Valid demo requirements', location, workType, jobType,
      companyName: 'Demo Company', companyWebisteURL: 'https://neohire.site', skillsRequired: skills,
      experienceRequired: { min: expMin, max: expMax }, salary: { min: salaryMin, max: salaryMax, currency: 'INR' }, postedBy: fakeId,
    }, title);
  }
  for (const [, , status, appliedVia, score, age] of applicationDefinitions) {
    await validate(Application, {
      job: fakeId, JobSeeker: fakeId, postedBy: fakeId, resume: resumeUrl, status, appliedVia,
      appliedAt: daysAgo(age), aiMatchScore: { overallScore: score, skillsMatch: score, experienceMatch: score, educationMatch: score },
    }, `application ${status}/${appliedVia}`);
  }
  await validate(TalentAlert, {
    recruiter: fakeId, name: 'Validation alert', requiredSkills: ['React'], minExperience: 2,
    minFitScore: 80, workMode: 'Remote', matchedEmployee: [{ employee: fakeId, fitScore: 90 }],
  }, 'talent alert');
  await validate(Notification, {
    recipient: fakeId, recipientModel: 'Employee', type: 'JOB_POSTED', title: 'Validation notification', message: 'Valid notification message.',
  }, 'notification');
  await validate(ActivityLog, {
    action: 'SEED_VALIDATION', userRole: 'system', description: 'Validated the demo seed templates.', metadata: { seedName: SEED_NAME },
  }, 'activity log');
  console.log(`Validated ${authDefinitions.length} auth users, ${employeeDefinitions.length} candidates, ${recruiterDefinitions.length} recruiter/admin profiles, ${jobDefinitions.length} jobs, ${applicationDefinitions.length} applications, and supporting demo data.`);
}

async function seedDatabase() {
  let mongoClient;
  try {
    assertEnvironment();
    if (VALIDATE_ONLY) {
      await validateTemplates();
      console.log('Demo seed validation passed. No database connection was made.');
      return;
    }
    const { hashPassword } = await import('better-auth/crypto');
    await mongoose.connect(process.env.MONGODB_URL);
    mongoClient = new MongoClient(process.env.MONGODB_URL);
    await mongoClient.connect();
    const db = mongoClient.db();

    const authIds = {};
    for (const definition of authDefinitions) authIds[definition[0]] = await upsertAuthUser(db, definition, hashPassword);
    const { employees, recruiters } = await buildProfiles(authIds);
    const jobs = await buildJobs(recruiters);
    const applications = await buildApplications(employees, jobs);
    const alerts = await buildTalentRadar(recruiters, employees);
    const notifications = await buildNotifications(employees, recruiters, jobs, applications);
    const logs = await buildActivityLogs(employees, recruiters, jobs);

    console.log('\nNeoHire demo seed completed safely; no collections were cleared.');
    console.log(`Created/updated: ${Object.keys(employees).length} candidates, ${Object.keys(recruiters).length} recruiters/admins, ${Object.keys(jobs).length} jobs, ${applications.length} applications, ${alerts.length} alerts, ${notifications} notifications, ${logs} logs.`);
    console.log('\nLogin accounts (passwords are read from environment):');
    console.log(`Candidate:     ${emails.candidate}`);
    console.log(`New candidate: ${emails.newCandidate}`);
    console.log(`Recruiter:     ${emails.recruiter}`);
    console.log(`Admin:         ${emails.admin}`);
  } finally {
    if (mongoClient) await mongoClient.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error(`Demo seeding failed: ${error.message}`);
  process.exitCode = 1;
});
